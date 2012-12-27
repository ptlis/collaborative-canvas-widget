/*jshint jquery:true */


define(
    ['jquery', 'require', 'connections', 'canvasStorage', 'util'],
    function($, require, connections, canvasStorage, util) {
        'use strict';

        var cards       = {};
        cards.model     = {};
        cards.view      = {};
        cards.cache     = {};
        cards.handlers  = {};
        cards.handlers.deck = {};


    /*  How far the cards have been zoomed in */
        cards.zoomFactor          = '1';

    /*  Data in the clipboard */
        cards.clipboardData = {
            'method':       '',
            'instanceId':   ''
        };


    /*  Whether the download attribute is supported by the browser. */
        cards.downloadAttribute = false;


    /*  Whether the files API is supported by the browser. */
        cards.filesApi          = false;


    /*
     *  Initialisation routine.
     */
        cards.init = function() {
            var testAnchor  = document.createElement('a');
            if(typeof testAnchor.download !== 'undefined') {
                cards.downloadAttribute = true;
            }

            if(window.File && window.FileReader && window.FileList && window.Blob) {
                cards.filesApi          = true;
            }

            // Handle events
            $(window)
                .off(   'widget:card:model:new')            .on('widget:card:model:new',                cards.model.add)
                .off(   'widget:card:model:delete')         .on('widget:card:model:delete',             cards.model.remove)
                .off(   'widget:card:model:remove_all')     .on('widget:card:model:remove_all',         cards.model.removeAll)
                .off(   'widget:card:model:move')           .on('widget:card:model:move',               cards.model.move)
                .off(   'widget:card:model:change_type')    .on('widget:card:model:change_type',        cards.model.changeType)
                .off(   'widget:card:model:to_front')       .on('widget:card:model:to_front',           cards.model.toFront)

                .off(   'widget:card:view:add')             .on('widget:card:view:add',                 cards.view.add)
                .off(   'widget:card:view:remove_request')  .on('widget:card:view:remove_request',      cards.removeRequest)
                .off(   'widget:card:view:remove')          .on('widget:card:view:remove',              cards.view.remove)
                .off(   'widget:card:view:remove_all')      .on('widget:card:view:remove_all',          cards.view.removeAll)
                .off(   'widget:card:view:move')            .on('widget:card:view:move',                cards.view.move)
                .off(   'widget:card:view:change_type')     .on('widget:card:view:change_type',         cards.view.changeType)
                .off(   'widget:card:view:to_front')        .on('widget:card:view:to_front',            cards.view.toFront)
                .off(   'widget:card:view:post_propagate')  .on('widget:card:view:post_propagate',      cards.view.postPropagate)
                .off(   'widget:card:view:update')          .on('widget:card:view:update',              cards.view.update)
                .off(   'widget:card:view:edit')            .on('widget:card:view:edit',                cards.view.edit);


            // Zooming in
            $('.zoom_in')
                .off(   'click').on(        'click',            cards.handlers.zoomIn);

            // Zooming out
            $('.zoom_out')
                .off(   'click').on(        'click',            cards.handlers.zoomOut);
        };


    /*  Convenience function, returns current card width, height, x offset & y offset */
        cards.getCardDimensions= function(cardId) {
            var dimensions      = {};
            var zoomFactorIndex = cards.zoomFactor.replace('.', '_');
            var cardData        = cards.cache.getCachedCardData(cardId);
            var allContPos      = $('#contain_drag').offset();
            var cardContPos     = cardData.elem.parents('.cell_outer').offset();

            if(zoomFactorIndex in cardData && cardData.hasOwnProperty(zoomFactorIndex)) {
                dimensions  = cardData[zoomFactorIndex];
            }

            else {
                dimensions  = cards.cache.addZoomedDimensions(cardId, cardData.elem);
            }

            dimensions.x    = parseInt(cardData.elem.css('left').replace('px', ''), 10);
            dimensions.y    = parseInt(cardContPos.top - allContPos.top + parseInt(cardData.elem.css('top').replace('px', ''), 10), 10);

            return dimensions;
        };


        cards.getCardElem = function(cardId) {
            var cachedCardData  = cards.cache.getCachedCardData(cardId);

            return cachedCardData.elem;
        };


        cards.getCardElems = function() {
            var cardElems   = [];
            for(var cardId in cards.cache.cachedCards) {
                if(cards.cache.cachedCards.hasOwnProperty(cardId)) {
                    cardElems.push(cards.cache.cachedCards[cardId].elem);
                }
            }

            return cardElems;
        };


        cards.removeRequest = function(event, cardId) {
            if(confirm('Are you sure you want to remove this card?')) {
                $(window).trigger('widget:card:model:delete',  [cardId]);
            }
        };


        cards.addEvents = function(cardElem) {
            cards.removeEvents(cardElem);

            var decks       = require('decks'); // Pull in decks

            // Card-specific events
            var deckHandler = decks.getHandler(cardElem.data('carddeck'));
            deckHandler.addEvents(cardElem);

            var size        = cardElem.data('cardsize');
            if(size === 'medium') {

                // Context menu options
                var options = {
                    zIndex:     999999999,
                    className:  'menu_large',
                    autoHide:   true,
                    events:     {
                        show:   function(options) {
                            if($('#context-menu-layer').length > 0) {
                                return false;
                            }
                        }
                    },
                    animation:  {
                        duration:   250,
                        show:       'fadeIn',
                        hide:       'fadeOut'
                    },
                    callback:   function(key, options) {
                        switch(key) {
                            case 'edit':
                                $(window).trigger('widget:card:view:edit', [cardElem.data('instanceid')]);
                                break;
                            case 'copy':
                                cards.handlers.copy(cardElem);
                                break;
                            case 'cut':
                                cards.handlers.cut(cardElem);
                                break;
                            case 'create_connection':
                                connections.handlers.connectionCreateStart(cardElem);
                                break;
                            case 'delete':
                                $(window).trigger('widget:card:view:remove_request',   [cardElem.data('instanceid')]);
                                break;
                        }

                        if($(options.selector).length > 0) {
                            $(options.selector).contextMenu('hide');
                        }
                    },
                    items: {
                        'edit':     {
                            'name':     'Edit Card',
                            'icon':     'edit'
                        },
                        'copy':     {
                            'name':     'Copy Card',
                            'icon':     'copy'
                        },
                        'cut':      {
                            'name':     'Cut Card',
                            'icon':     'cut'
                        },
                        'seperator_1':     '---------',
                        'create_connection':    {
                            'name':     'Create Connection',
                            'icon':     'create_connection',
                            'disabled': function(key, opt) {
                                var cardElems       = $('#canvas [data-prefix="card"][data-cardsize="medium"]');
                                var connectionsArr  = connections.model.getForCard(cardElem.data('instanceid'));
                                var disabled        = true;

                                if(cardElems.length > 1 && ((cardElems.length - 1) > connectionsArr.length)) {
                                    disabled        = false;
                                }

                                return disabled;
                            }
                        },
                        'seperator_2':     '---------',
                        'delete':   {
                            'name':     'Delete Card',
                            'icon':     'delete'
                        }
                    }
                };

                // Menu button
                options.selector    = '[data-instanceid="' + cardElem.data('instanceid') + '"][data-cardsize="medium"] .menu_icon';
                options.trigger     = 'left';
                options.appendTo    = '[data-instanceid="' + cardElem.data('instanceid') + '"][data-cardsize="medium"] .menu_icon';
                options.position    = function(options, xClickOffset, yClickOffset) {
                    var iconElem    = cardElem.find('.menu_icon');
                    var menuElem    = cardElem.find('.menu_icon .context-menu-list');

                    var xOffset     = iconElem.outerWidth() - menuElem.outerWidth();
                    var yOffset     = yClickOffset - iconElem.offset().top;

                    menuElem.css({top: yOffset, left: xOffset});
                };
                $.contextMenu(options);

                // Right-click context
                options.selector    = '[data-instanceid="' + cardElem.data('instanceid') + '"][data-cardsize="medium"]';
                options.trigger     = 'right';
                options.className   = 'right_click';
                options.appendTo    = '[data-instanceid="' + cardElem.data('instanceid') + '"][data-cardsize="medium"]';
                options.position    = function(options, xClickOffset, yClickOffset) {
                    var menuElem    = cardElem.find('.right_click');

                    var xOffset     = xClickOffset - cardElem.offset().left - (menuElem.outerWidth() / 2);
                    var yOffset     = yClickOffset - cardElem.offset().top;

                    // Handle menu overlapping right edge of screen
                    if(xClickOffset + (menuElem.outerWidth() / 2) > cardElem.parents('.cell_inner').width() + cardElem.parents('.cell_inner').offset().left) {
                        xOffset = cardElem.outerWidth() - menuElem.outerWidth();
                    }

                    menuElem.css({top: yOffset, left: xOffset});
                };
                $.contextMenu(options);

                // Bring card to front
                cardElem
                    .on('click', function() {
                        $(window).trigger('widget:card:model:to_front', [cardElem.data('instanceid')]);
                    });

                // Allow cards to be draggable
                cardElem.draggable({
                    'revert':   'invalid',
                    'cancel':   '.menu_icon, .context-menu-list *, .context-menu-layer *',
                    'drag':     function(event, ui) {
                        $(window).trigger('widget:connection:view:move_for_card', [ui.helper.data('instanceid')]);
                    },
                    'stop':     function(event, ui) {
                        $(window).trigger('widget:connection:view:move_for_card', [ui.helper.data('instanceid')]);
                        $(window).trigger('widget:container:view:resize');
                    }
                });
            }

            if(size === 'large') {

                // Remove Paired Elements
                cardElem.find('[data-paired_master]')
                    .on('click',        cards.handlers.pairedElementRemove);

                // Add Paired Elements Dialog
                cardElem.find('.edit_selections')
                    .on('click',       cards.handlers.pairedElementDialog);

                // Dismiss dialog
                cardElem.find('.dialog_dismiss')
                    .on('click',        cards.handlers.editDismiss);

                cardElem.find('.icon-info')
                    .on('mouseover',    function(event) {
                        $(event.target).find('.card_tooltip')
                            .css('display', 'block');
                    })
                    .on('mouseout',     function(event) {
                        $(event.target).find('.card_tooltip')
                            .css('display', 'none');
                    });
            }
        };


        cards.removeEvents = function(cardElem) {
            var decks       = require('decks'); // Pull in decks

            // Card-specific events
            var deckHandler = decks.getHandler(cardElem.data('carddeck'));
            deckHandler.removeEvents(cardElem);

            var size        = cardElem.data('cardsize');
            if(size === 'medium') {

                // Menu button
                $.contextMenu('destroy', '[data-instanceid="' + cardElem.data('instanceid') + '"][data-cardsize="medium"] .menu_icon');

                // Right-click context
                $.contextMenu('destroy', '[data-instanceid="' + cardElem.data('instanceid') + '"][data-cardsize="medium"]');

                // Drag & bring to front events
                cardElem
                    .off('click');

                // TODO: Remove card drag events
            }

            if(size === 'large') {
                // Remove Paired Elements
                cardElem.find('[data-paired_master]')
                    .off('click');

                // Add Paired Elements Dialog
                cardElem.find('.edit_selections')
                    .off('click');

                // Dismiss dialog
                cardElem.find('.dialog_dismiss')
                    .off('click');
            }
        };


        cards.updateAll = function() {
            var addedCards              = [];
            var removedCards            = [];
            var storedCards             = cards.model.getAll();
            var displayedCards          = cards.getCardElems();
            var i;

            // Find cards in storage but not in HTML document
            var cachedCardData;
            for(i = 0; i < storedCards.length; i++) {
                // Element exists in storage but not on page
                cachedCardData  = cards.cache.getCachedCardData(storedCards[i].id);

                if(cachedCardData === null)  {
                    addedCards.push(storedCards[i]);
                }
            }


            // Find cards in HTML document but not in storage
            var cardId;
            for(i = 0; i < displayedCards.length; i++) {
                cardId              = $(displayedCards[i]).data('instanceid');

                var cardData        = cards.model.get(cardId);

                if(cardData === null || cardData.length < 1) {
                    removedCards.push({'id': cardId});
                }
            }


            // Add cards
            for(i = 0; i < addedCards.length; i++) {
                addedCards[i].size  = 'medium';
                $(window).trigger('widget:card:view:add', [addedCards[i]]);
            }


            // Remove cards
            for(i = 0; i < removedCards.length; i++) {
                $(window).trigger('widget:card:view:remove', [removedCards[i]]);
            }

            $(window).trigger('widget:container:view:resize');
        };


        cards.propagateDataAll = function() {
            var placedCards             = $('[data-prefix="card"]');

            for(var i = 0; i < placedCards.length; i++) {
                cards.propagateData($(placedCards[i]));
            }
        };


        cards.propagateData = function(cardElem) {
            var decks       = require('decks');

            var i;
            var j;
            var storageElem;
            var instanceId  = cardElem.data('instanceid');
            var cardData    = cards.model.get(instanceId);
            var extraData   = decks.getHandler(cardElem.data('carddeck')).getExtraFields(cardElem.data('cardtype'));

            // Hide paired elems
            cardElem.find('.group li').css('display', 'none');

            for(var index in extraData) {

                if(extraData.hasOwnProperty(index) && index in cardData) {

                    // Handle toggling of display of paired entries
                    if(index.substring(0, 7) === 'paired_' && !(index.indexOf('_comment', index.length - '_comment'.length) !== -1)) {

                        storageElem = cardElem.find('[data-paired_slave="card_' + instanceId + '_' + index + '_paired"]');

                        if(cardData[index] === 'true') {
                            storageElem.css('display', 'block');
                        }
                        else {
                            storageElem.css('display', 'hidden');
                        }
                    }

                    // Push standard stored data into elems
                    else {
                        storageElem = cardElem.find('[data-inputname="' + index + '"]');

                        if(storageElem.prop('tagName').toLowerCase() === 'textarea' || (storageElem.prop('tagName').toLowerCase() === 'input' && (storageElem.attr('type') === 'text' || storageElem.attr('type') === 'hidden'))) {
                            storageElem.val(cardData[index]);
                        }

                        else if(storageElem.prop('tagName').toLowerCase() === 'img') {

                            var imgURL  = '';
                            if(cardElem.data('cardsize') === 'medium') {
                                imgURL  = 'http://i.imgur.com/' + cardData[index] + 'm.png';
                            }
                            else if(cardElem.data('cardsize') === 'large') {
                                imgURL  = 'http://i.imgur.com/' + cardData[index] + '.png';
                            }

                            if(cardData[index] !== null && cardData[index].length > 0 && storageElem.attr('src') !== imgURL && imgURL.length) {
                                storageElem.attr('src', imgURL);
                            }
                        }

                        else {
                            storageElem.text(cardData[index]);
                        }
                    }
                }
            }

            // Show no items message when required
            var groupElems  = cardElem.find('.group');
            var groupEntryElems;
            var displayedCount;

            for(i = 0; i < groupElems.length; i++) {
                groupEntryElems = $(groupElems[i]).find('[data-paired_slave]');
                displayedCount  = 0;

                for(j = 0; j < groupEntryElems.length; j++) {
                    if($(groupEntryElems[j]).css('display') === 'block') {
                        displayedCount++;
                    }
                }

                if(displayedCount === 0) {
                    $(groupElems[i]).find('.no_items').css('display', 'block');
                }
            }


            // update positioning if the card has already been stored (& cardsize is medium)
            if(cardData && cardElem.data('cardsize') === 'medium' && !cardElem.hasClass('dragging')) {

                // Set new scaling factor
                cardElem.attr('data-scalefactor', cards.zoomFactor);


                // Handle user inputs etc
                $(window).trigger('widget:card:view:post_propagate', [cardElem]);

                // Trigger updates
                $(window).trigger('widget:card:view:move', [cardData.id, cardData.cell_id, cardData.pos_x, cardData.pos_y * cards.zoomFactor, cardData.z_index]);
                $(window).trigger('widget:card:view:change_type', [cardData.id, cardData.cardtype]);
            }
        };


        cards.model.getFields = function() {
            return {
                cell_id:    '',
                pos_x:      '',
                pos_y:      '',
                deck:       '',
                cardtype:   '',
                z_index:    ''
            };
        };


        cards.model.add = function(event, instanceId, cellId, xPos, yPos, deck, cardType, zIndex, presetData) {
            var extraFields         = cards.model.getFields();
            extraFields.id          = instanceId;
            extraFields.cell_id     = cellId;
            extraFields.pos_x       = xPos;
            extraFields.pos_y       = yPos;
            extraFields.deck        = deck;
            extraFields.cardtype    = cardType;
            extraFields.z_index     = zIndex;

            if(typeof(presetData) !== 'undefined') {
                for(var index in presetData) {
                    if(presetData.hasOwnProperty(index)) {
                        extraFields[index]      = presetData[index];
                    }
                }

            }

            canvasStorage.list.add('card', extraFields);
        };


        cards.model.remove = function(event, cardId) {
            $(window).trigger('widget:connection:model:delete_for_card', [cardId]);

            var extraFields     = cards.model.getFields();
            extraFields.id      = cardId;

            canvasStorage.list.remove('card', extraFields);
        };


        cards.model.removeAll = function() {
            $(window).trigger('widget:connection:model:remove_all');

            canvasStorage.list.removeAll('card', cards.model.getFields());
        };


        cards.model.changeType = function(event, cardId, cardType) {
            var extraFields = {
                'id':       cardId,
                'cardtype': cardType
            };

            canvasStorage.list.update('card', extraFields);
        };


        cards.model.move = function(event, cardId, cellId, xPosPercent, yPos, zIndex) {
            // Clear existing timer, ready to be reset
            if(typeof(canvasStorage.delayIds) !== 'undefined' && typeof(canvasStorage.delayIds['move_' + cardId]) !== 'undefined') {
                window.clearTimeout(canvasStorage.delayIds['move_' + cardId]);
                delete canvasStorage.delayIds['move_' + cardId];
            }

            // Set new timer, store timer id for later clearing
            canvasStorage.delayIds['move_' + cardId] = window.setTimeout(function() {

                var extraFields = {};
                extraFields.id      = cardId;
                extraFields.cell_id = cellId;
                extraFields.pos_x   = xPosPercent.toString();
                extraFields.pos_y   = yPos.toString();
                extraFields.z_index = zIndex;

                canvasStorage.list.update('card', extraFields);

            }, canvasStorage.changeDelay * 1000);
        };


        cards.model.toFront = function(event, cardId) {
            var nextZIndex  = canvasStorage.util.getNextZIndex();

            var extraFields = {
                'id':       cardId,
                'z_index':  nextZIndex
            };

            canvasStorage.list.update('card', extraFields);

            $(window).trigger('widget:card:view:to_front', [cardId, nextZIndex]);
        };


        cards.model.get = function(cardId) {
            return canvasStorage.list.get('card', cardId);
        };


        cards.model.getAll = function() {
            return canvasStorage.list.getAll('card');
        };


        /*  Cached card data, optimisation to prevent expensive [data-*="*"] lookups.
         *
         *   Format:
         *   {
         *       cardId: {
         *           elem        : jQueryObj,
         *           zoomFactor  : {width, height},
         *           zoomFactor  : {width, height},
         *       }
         *   }
         */
        cards.cache.cachedCards     = {};


        cards.cache.addZoomedDimensions = function(cardId, cardElem) {
            var zoomFactorIndex = cards.zoomFactor.replace('.', '_');

            var dimensions  = {};
            if(cardId in cards.cache.cachedCards && 1 in cards.cache.cachedCards[cardId]) {
                dimensions.width    = parseInt(cards.cache.cachedCards[cardId][1].width * cards.zoomFactor, 10);
                dimensions.height   = parseInt(cards.cache.cachedCards[cardId][1].height * cards.zoomFactor, 10);
            }

            else {
                dimensions.width    = parseInt(cardElem.outerWidth(), 10);
                dimensions.height   = parseInt(cardElem.outerHeight(), 10);
            }

            cards.cache.cachedCards[cardId][zoomFactorIndex]    = dimensions;

            return dimensions;
        };


        cards.cache.addCachedCardData = function(cardId, cardElem) {
            if(!(cardId in cards.cache.cachedCards && cards.cache.cachedCards.hasOwnProperty(cardId))) {
                cards.cache.cachedCards[cardId] = {};
            }

            cards.cache.cachedCards[cardId].elem             = cardElem;

            cards.cache.addZoomedDimensions(cardId, cardElem);
        };


        cards.cache.getCachedCardData = function(cardId) {
            var cardData    = null;
            if(cardId in cards.cache.cachedCards && cards.cache.cachedCards.hasOwnProperty(cardId)) {
                cardData    = cards.cache.cachedCards[cardId];
            }

            return cardData;
        };


        cards.cache.deleteCachedCardData = function(cardId) {
            delete cards.cache.cachedCards[cardId];
        };


        cards.view.add = function(event, cardData) {
            var decks       = require('decks'); // Pull in decks

            if(!canvasStorage.ready) {
                throw 'canvasStorage not initialised';
            }

            var parentElem;
            if(cardData.size === 'medium') {
                parentElem  = $('[data-instanceid="' + cardData.cell_id + '"] .cell_inner');
            }
            else {
                parentElem  = $('#card_viewer .dialog_container');
            }
            var deckHandler     = decks.getHandler(cardData.deck);
            var cardElem        = deckHandler.createCard(cardData.cardtype, cardData.id, cardData.size, parentElem);

            if(cardData.size === 'medium') {
                cards.cache.addCachedCardData(cardData.id, cardElem);
            }

            cards.propagateData(cardElem);

            cards.addEvents(cardElem);

            $(window).trigger('widget:card:view:post_propagate', [cardElem]);
        };


        cards.view.remove = function(event, cardData) {
            var cardElems   = $('[data-instanceid="' + cardData.id + '"]');
            var cardElem;

            var remCallback = function() {
                $('#card_viewer').remove();
            };

            for(var i = 0; i < cardElems.length; i++) {
                cardElem    = $(cardElems[i]);

                if(cardElem.data('cardsize') === 'medium') {
                    cardElem.remove();
                }

                else if(cardElem.data('cardsize') === 'large') {
                    $('#card_viewer').fadeOut(250, remCallback);
                }
            }

            cards.cache.deleteCachedCardData(cardData.id);
        };


        cards.view.removeAll = function() {
            var cardElems   = $('[data-prefix="card"]');
            var cardElem;

            var remCallback = function() {
                $('#card_viewer').remove();
            };

            for(var i = 0; i < cardElems.length; i++) {
                cardElem    = $(cardElems[i]);

                if(cardElem.data('cardsize') === 'medium') {
                    cardElem.remove();
                }

                else if(cardElem.data('cardsize') === 'large') {
                    $('#card_viewer').fadeOut(250, remCallback);
                }

                cards.cache.deleteCachedCardData(cardElem.data('instanceid'));
            }
        };


        cards.view.changeType = function(event, cardId, cardType) {
            var cardElems       = $('[data-instanceid="' + cardId + '"]');
            cardElems.attr('data-cardtype', cardType);
        };


        cards.view.move = function(event, cardId, cellId, xPosPercent, yPos, zIndex) {
            var cellElem        = $('[data-instanceid="' + cellId + '"] .cell_inner');
            var cardElem        = cards.getCardElem(cardId);

            // Move to new cell
            if(cellId !== $('[data-instanceid="' + cardId + '"]').parents('.cell_container').data('instanceId')) {
                cardElem.remove();
                cardElem.appendTo($('[data-instanceid="' + cellId + '"] .cell_inner'));
                cards.addEvents(cardElem);
            }

            // Calculate card position
            var leftOffset      = parseInt(((cellElem.width() / 100) * xPosPercent) - (cardElem.outerWidth() / 2), 10);
            var topOffset       = parseInt(yPos - (cardElem.outerHeight() / 2), 10);

            // Snap card to left edge into grid
            if(leftOffset < 0) {
                leftOffset      = 0;
            }

            // Snap cards placed over right edge into grid
            else if(leftOffset + cardElem.outerWidth() > cellElem.width()) {
                leftOffset      = $(cellElem).width() - cardElem.outerWidth();
            }

            // Ensure top of card isn't above top of cell
            if(topOffset < 0) {
                topOffset       = 0;
            }

            cardElem.css('left',    leftOffset + 'px');
            cardElem.css('top',     topOffset + 'px');
            cardElem.css('z-index', zIndex);
        };


        cards.view.toFront = function(event, cardId, zIndex) {
            var cardElem        = cards.getCardElem(cardId);
            cardElem.css('z-index', zIndex);
        };


        cards.view.postPropagate = function(event, cardElem) {


            var decks       = require('decks'); // Pull in decks

            var deckHandler = decks.getHandler(cardElem.data('carddeck'));

            deckHandler.postPropagate(cardElem);
        };


        cards.view.update = function(event, cardData) {
            var decks       = require('decks'); // Pull in decks

            var i;
            var j;
            var k;
            var storageElem;
            var cardElems       = $('[data-instanceid="' + cardData.id + '"]');
            var cardElem;
            var extraData       = decks.getHandler(cardData.deck).getExtraFields(cardData.cardtype);

            // Hide paired elems
            cardElems.find('.group li').css('display', 'none');

            $(window).trigger('widget:card:view:move',
                [
                    cardData.id,
                    cardData.cell_id,
                    cardData.pos_x,
                    cardData.pos_y,
                    cardData.z_index
                ]);

            $(window).trigger('widget:container:view:resize');

            for(i = 0; i < cardElems.length; i++) {
                cardElem    = $(cardElems[i]);

                for(var index in extraData) {
                    if(extraData.hasOwnProperty(index) && index in cardData) {

                        // Handle toggling of display of paired entries
                        if(index.substring(0, 7) === 'paired_' && !(index.indexOf('_comment', index.length - '_comment'.length) !== -1)) {

                            storageElem = cardElem.find('[data-paired_slave="card_' + cardData.id + '_' + index + '_paired"]');

                            if(cardData[index] === 'true') {
                                storageElem.css('display', 'block');
                            }
                            else {
                                storageElem.css('display', 'hidden');
                            }
                        }

                        // Push standard stored data into elems
                        else {
                            storageElem = cardElem.find('[data-inputname="' + index + '"]');

                            if(storageElem.prop('tagName').toLowerCase() === 'textarea') {
                                storageElem.val(cardData[index]);
                            }

                            else if(storageElem.prop('tagName').toLowerCase() === 'img') {

                                var imgURL  = '';
                                if(cardElem.data('cardsize') === 'medium') {
                                    imgURL  = 'http://i.imgur.com/' + cardData[index] + 'm.png';
                                }
                                else if(cardElem.data('cardsize') === 'large') {
                                    imgURL  = 'http://i.imgur.com/' + cardData[index] + '.png';
                                }

                                if(cardData[index] !== null && cardData[index].length > 0 && storageElem.attr('src') !== imgURL && imgURL.length) {
                                    storageElem.attr('src', imgURL);
                                }
                            }

                            else if(storageElem.prop('tagName').toLowerCase() === 'input' && (storageElem.attr('type') === 'text' || storageElem.attr('type') === 'hidden')) {
                                storageElem.val(cardData[index]);
                            }

                            else {
                                storageElem.text(cardData[index]);
                            }
                        }
                    }
                }

                // Show no items message when required
                var groupElems  = cardElem.find('.group');
                var groupEntryElems;
                var displayedCount;

                for(j = 0; j < groupElems.length; j++) {
                    groupEntryElems = $(groupElems[j]).find('[data-paired_slave]');
                    displayedCount  = 0;

                    for(k = 0; k < groupEntryElems.length; k++) {
                        if($(groupEntryElems[k]).css('display') === 'block') {
                            displayedCount++;
                        }
                    }

                    if(displayedCount === 0) {
                        $(groupElems[j]).find('.no_items').css('display', 'block');
                    }
                }
            }
        };


        cards.view.edit = function(event, cardId) {
            // Create background & card
            var newBg   = false;
            var bgElem;
            var dialogCont;
            if($('.dialog_background').length) {
                bgElem      = $('.dialog_background');
                dialogCont  = $('.dialog_container');
            }

            else {
                newBg   = true;
                bgElem  =           $('<div></div>',  {
                    'class':       'dialog_background'
                });
                bgElem.css('display', 'none');
                bgElem.appendTo($('body'));

                dialogCont  =       $('<div></div>', {
                    'class':       'dialog_container'
                });
                dialogCont.appendTo(bgElem);
            }
            bgElem.attr('id', 'card_viewer');

            var cardData        = canvasStorage.list.get('card', cardId);
            cardData.size       = 'large';

            $(window).trigger('widget:card:view:add', [cardData]);

            if(newBg) {
                bgElem.fadeIn(250,  function() {
                });
            }

        };


        // TODO: This shouldn't be here
        cards.handlers.exportDialog = function(event) {
            var bgElem                  =   $('<div></div>', {
                'class':    'dialog_background'
            });
            bgElem.css('display', 'none');
            bgElem.appendTo($('body'));

            var dialogCont              =   $('<div></div>', {
                'class':    'dialog_container'
            });
            dialogCont.appendTo(bgElem);

            var dialog                  =   $('<div></div>', {
                'id':       'export_container',
                'class':    'dialog'
            });
            dialog.appendTo(dialogCont);

            var closeButton             =   $('<div></div>', {
                'class':    'dialog_dismiss dismiss_button_32x32'
            });
            closeButton.appendTo(dialog);

            var title                   =   $('<div></div>', {
                'class':        'dialog_title'
            });
            title.text('Export Data');
            title.appendTo(dialog);

            // Download file
            var downloadFile            =   $('<div></div>', {
                'class':    'download_file'
            });
            downloadFile.appendTo(dialog);

            var data                    = canvasStorage.exportData();

            // Check for browsers that support the download attribute
            if(cards.downloadAttribute) {
                $('<p></p>').text('Download as a file').appendTo(downloadFile);

                // 'download' attribute only works in webkit, see here for gecko progress https://bugzilla.mozilla.org/show_bug.cgi?id=676619
                var downloadButton          =   $('<a></a>', {
                    'id':       'download_button',
                    'href':     'data:application/octet-stream;base64,' + $.base64Encode(JSON.stringify(data)),
                    'download': '8lem_data.json'
                });
                downloadButton.text('Download');
                downloadButton.appendTo(downloadFile);
            }
            else {
                var msgElem                 =   $('<div></div>', {
                    'class':    'feature_unsupported'
                });
                msgElem.text('The direct download feature is not supported by your browser.');
                msgElem.appendTo(downloadFile);
            }

            // Copy data
            var copyData            =   $('<div></div>', {
                'class':    'copy_data'
            });
            copyData.appendTo(dialog);

            $('<p></p>').text('Right-click and copy the data below').appendTo(copyData);

            var textContainer       =   $('<textarea></textarea>', {

            });

            textContainer
                .val(JSON.stringify(data))
                .appendTo(copyData)
                .off(   'focus')
                .on(    'focus', function() {
                    textContainer[0].select();
                });


            bgElem.fadeIn(  250,
                function() {
                });

            closeButton
                .off('click')
                .on('click', function(event) {

                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });
        };


            // TODO: This shouldn't be here
        cards.handlers.importDialog = function(event) {


            var bgElem                  =   $('<div></div>', {
                'class':    'dialog_background'
            });
            bgElem.css('display', 'none');
            bgElem.appendTo($('body'));

            var dialogCont              =   $('<div></div>', {
                'class':    'dialog_container'
            });
            dialogCont.appendTo(bgElem);

            var dialog                  =   $('<div></div>', {
                'id':       'import_container',
                'class':    'dialog'
            });
            dialog.appendTo(dialogCont);

            var closeButton             =   $('<div></div>', {
                'class':    'dialog_dismiss dismiss_button_32x32'
            });
            closeButton.appendTo(dialog);

            var title                   =   $('<div></div>', {
                'class':    'dialog_title'
            });
            title.text('Import Data');
            title.appendTo(dialog);

            var uploadFile              =   $('<div></div>', {
                'class':    'upload_file'
            });
            uploadFile.appendTo(dialog);


            // Check for browsers that support the download attribute
            if(cards.filesApi) {
                var uploadForm          =   $('<form></form>', {

                });
                uploadForm.appendTo(uploadFile);

                var label               =   $('<label></label>', {
                    'for':          'file_upload'
                });
                label.text('Upload');
                label.appendTo(uploadForm);

                var uploadElem          =   $('<input>', {
                    'type':         'file',
                    'id':           'file_upload',
                    'enctype':      'multipart/form-data'
                });
                uploadElem.appendTo(uploadForm);

                uploadElem
                    .off(   'change')
                    .on(    'change', function(event) {
                        var files   = event.target.files;

                        if(files.length > 0) {
                            var reader  = new FileReader();

                            $(reader)
                                .off(   'load')
                                .on(    'load', function(event) {
                                    var rawData         = event.target.result;
                                    var processedData;
                                    var split           = rawData.split(',');

                                    if(split.length > 1) {

                                        try {
                                            processedData   = $.parseJSON($.base64Decode(split[split.length - 1]));

                                            if(confirm('Are you sure you with to import data? Doing so clears existing data.')) {

                                                try {
                                                    clearData();

                                                    canvasStorage.importData(processedData);
                                                    canvasStorage.standardPropagate();

                                                    bgElem.fadeOut( 250,
                                                        function() {
                                                            bgElem.remove();
                                                        });
                                                }
                                                catch(error) {
                                                    alert(error);
                                                }
                                            }
                                        }
                                        catch(error) {
                                            alert('Invalid filetype provided (2) ' + error);
                                        }
                                    }
                                    else {
                                        alert('Invalid filetype provided (1)');
                                    }
                                });

                            reader.readAsDataURL(files[0]);
                        }
                    });
            }

            else {
                var msgElem                 =   $('<div></div>', {
                    'class':    'feature_unsupported'
                });
                msgElem.text('The direct upload feature is not supported by your browser.');
                msgElem.appendTo(uploadFile);
            }

            // Paste data
            var pasteData           =   $('<div></div>', {
                'class':    'paste_data'
            });
            pasteData.text('Paste Data');
            pasteData.appendTo(dialog);


            bgElem.fadeIn(  250,
                function() {
                });

            closeButton
                .off(   'click')
                .on(    'click', function(event) {
                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });
        };


        cards.handlers.editDismiss = function(event) {
            var medCard         = cards.getCardElem($(event.target).parents('[data-prefix="card"]').data('instanceid'));

            $('#card_viewer').fadeOut(
                250,
                function() {
                    $('#card_viewer').remove();
                    cards.propagateData(medCard);

                    $(window).trigger('widget:card:view:post_propagate', [medCard]);
                });
        };


        cards.handlers.copy = function(cardElem) {
            cards.clipboardData.method      = 'copy';
            cards.clipboardData.instanceId  = cardElem.data('instanceid');
        };


        cards.handlers.cut = function(cardElem) {
            // remove opacity from previously cut card
            $('.to_cut').removeClass('to_cut');

            cards.clipboardData.method      = 'cut';
            cards.clipboardData.instanceId  = cardElem.data('instanceid');

            cardElem.addClass('to_cut');
        };


        cards.handlers.paste = function(cellId, dropPosX, dropPosY) {
            var decks       = require('decks'); // Pull in decks

            var destCell            = $('[data-instanceid="' + cellId + '"]').find('.cell_inner');
            var nextZIndex          = canvasStorage.util.getNextZIndex();
            var leftOffsetPercent   = (dropPosX / destCell.width()) * 100;

            if(cards.clipboardData.method === 'copy') {
                var instanceId          = util.uidGenerator();
                var cardData            = cards.model.get(cards.clipboardData.instanceId);
                var cardExtraData       = decks.getHandler(cardData.deck).getExtraFields(cardData.cardtype);
                var storeData           = {};
                for(var index in cardExtraData) {
                    if(cardData.hasOwnProperty(index)) {
                        storeData[index]    = cardData[index];
                    }
                }

                $(window).trigger('widget:card:model:new', [
                    instanceId,
                    cellId,
                    leftOffsetPercent,
                    dropPosY,
                    cardData.deck,
                    cardData.cardtype,
                    nextZIndex,
                    storeData
                ]);
            }


            // If type was cut then clear clipboard
            else if(cards.clipboardData.method === 'cut') {

                $(window).trigger('widget:card:model:move', [
                    cards.clipboardData.instanceId,
                    cellId,
                    leftOffsetPercent,
                    dropPosY / cards.zoomFactor,
                    nextZIndex
                ]);

                $(window).trigger('widget:card:view:move', [
                    cards.clipboardData.instanceId,
                    cellId,
                    leftOffsetPercent,
                    dropPosY,
                    nextZIndex]);

                $(window).trigger('widget:container:view:resize');

                cards.getCardElem(cards.clipboardData.instanceId).removeClass('to_cut');

                cards.clipboardData.method      = '';
                cards.clipboardData.instanceId  = '';
            }

            $(window).trigger('widget:container:view:resize');
        };


        cards.handlers.changeActiveDecks = function() {
            $(window).trigger('widget:deck:view:create_dialog', [false]);
        },


        cards.handlers.zoomIn = function() {
            // Floating point math has interesting consequences >_>
            switch(cards.zoomFactor) {
                case '0.25':
                    cards.zoomFactor    = '0.375';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.375':
                    cards.zoomFactor    = '0.5';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.5':
                    cards.zoomFactor    = '0.625';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.625':
                    cards.zoomFactor    = '0.75';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.75':
                    cards.zoomFactor    = '0.875';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.875':
                    cards.zoomFactor    = '1';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;
            }

            $(window).trigger('widget:container:view:resize');
        };


        cards.handlers.zoomOut = function() {
            // Floating point math has interesting consequences >_>
            switch(cards.zoomFactor) {
                case '1':
                    cards.zoomFactor    = '0.875';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.875':
                    cards.zoomFactor    = '0.75';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.75':
                    cards.zoomFactor    = '0.625';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.625':
                    cards.zoomFactor    = '0.5';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.5':
                    cards.zoomFactor    = '0.375';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;

                case '0.375':
                    cards.zoomFactor    = '0.25';
                    cards.propagateDataAll();
                    $(window).trigger('widget:connection:view:update_all_paths');
                    break;
            }

            $(window).trigger('widget:container:view:resize');
        };


        cards.handlers.pairedElementDialog = function(event) {
            var decks       = require('decks'); // Pull in decks

            var cardElem    = $(event.target).parents('[data-prefix="card"]');

            var deck        = cardElem.data('carddeck');
            var cardType    = cardElem.data('cardtype');
            var instanceId  = cardElem.data('instanceid');
            var deckData    = decks.getHandler(deck).deckData;

            var headingIndex        =   $(event.target).data('headingid');

            var innerBgElem         =   $('<div></div>', {
                'id':       'selections_card_container',
                'class':    'dialog_background'
            });
            innerBgElem.css('display', 'none');
            innerBgElem.appendTo($('#card_viewer'));

            var innerCont           =   $('<div></div>', {
                'class':            'dialog_container'
            });
            innerCont.appendTo(innerBgElem);

            var dialog              =   $('<div></div>', {
                'class':            'dialog',
                'data-instanceid':  instanceId,
                'data-prefix':      'card'
            });
            dialog.appendTo(innerCont);

            var closeButton         =   $('<div></div>', {
                'class':    'dialog_dismiss dismiss_button_32x32'
            });
            closeButton.appendTo(dialog);

            var title               =   $('<div></div>', {
                    'class':   'dialog_title'}
            );
            title.text(deckData.cardTypes[cardType].details.headings[headingIndex]);
            title.appendTo(dialog);

            var listElem            =   $('<ul></ul>');
            listElem.appendTo(dialog);

            var input;
            var label;
            var itemElem;
            var titleElem;
            var descElem;
            var cardData        = cards.model.get(instanceId);


            for(var itemIndex in deckData.cardTypes[cardType].details.items[headingIndex]) {
                if(deckData.cardTypes[cardType].details.items[headingIndex].hasOwnProperty(itemIndex)) {
                    var selected        = cardData['paired_' + headingIndex + ':' + itemIndex];

                    // Don't display already selected items.
                    if(selected !== 'true') {

                        itemElem            =   $('<li></li>');
                        itemElem.appendTo(listElem);

                        titleElem           =   $('<em></em>');
                        titleElem.text(deckData.cardTypes[cardType].details.items[headingIndex][itemIndex].title);

                        descElem            =   $('<p></p>');
                        descElem.text(deckData.cardTypes[cardType].details.items[headingIndex][itemIndex].description);

                        input               =   $('<input>', {
                            'id':                   'card_' + instanceId + '_paired_' + headingIndex + ':' + itemIndex,
                            'type':                 'button',
                            'class':                'add add_button_32x32',
                            'data-paired_master':   'card_' + instanceId + '_paired_' + headingIndex + ':' + itemIndex + '_paired',
                            'data-inputname':       'paired_' + headingIndex + ':' + itemIndex
                        });
                        input.appendTo(itemElem);

                        label               =   $('<label>', {
                            'for':                  'card_' + instanceId + '_paired_' + headingIndex + ':' + itemIndex
                        });
                        titleElem.appendTo(label);
                        descElem.appendTo(label);

                        label.appendTo(itemElem);

                        $('<hr>').appendTo(itemElem);

                        input
                            .off(   'click')
                            .on(    'click', cards.handlers.pairedElementAdd);
                    }
                }
            }

            innerBgElem.fadeIn( 250,
                function() {
                });

            closeButton
                .off(   'click')
                .on(    'click', function(event) {
                    innerBgElem.fadeOut(    250,
                        function() {
                            innerBgElem.remove();
                        });
                });
        };


        cards.handlers.pairedElementAdd = function(event) {
            canvasStorage.changeHandlers.addEntry(event);

            var dialogContainer = $('#selections_card_container');
            var slaveElems      = $('[data-paired_slave="' + $(event.target).data('paired_master') + '"]');

            for(var i = 0; i < slaveElems.length; i++) {
                $(slaveElems[i]).css('display', 'block');
                $(slaveElems[i]).parents('.group').find('.no_items').css('display', 'none');
            }

            dialogContainer.fadeOut(    250,
                function() {
                    dialogContainer.remove();
                });
        };


        cards.handlers.pairedElementRemove = function(event) {
            canvasStorage.changeHandlers.removeEntry(event);

            var slaveElems      = $('[data-paired_slave="' + $(event.target).data('paired_master') + '"]');
            for(var i = 0; i < slaveElems.length; i++) {
                $(slaveElems[i]).css('display', 'none');

                var parentUL    = $(slaveElems[i]).parents('ul');

                // Ensure we remove message that is displayed when nothing is selected
                var displayedCount  = 0;
                var countableItems  = 0;

                var innerSlaveElems = parentUL.find('[data-paired_slave]');
                for(var j = 0; j < innerSlaveElems.length; j++) {
                    if($(innerSlaveElems[j]).css('display') === 'block') {
                        displayedCount++;
                    }
                    countableItems++;
                }

                if(countableItems) {
                    if(displayedCount > 0) {
                        parentUL.find('.no_items').css('display', 'none');
                    }

                    else {
                        parentUL.find('.no_items').css('display', 'block');
                    }
                }
            }
        };


        cards.handlers.deck.cardMouseOver = function(event) {
            var decks       = require('decks'); // Pull in decks

            var wheelContainer  = $('.card_selector_box');
            var deckHint        = wheelContainer.find('.deck_hint');
            var cardType        = $(event.target).data('cardtype');
            var deck            = $(event.target).data('carddeck');
            var cardHint        = decks.getHandler(deck).createHintCard(cardType);

            deckHint.css('display', 'none');
            cardHint.appendTo(wheelContainer);
        };


        cards.handlers.deck.cardMouseOut = function(event) {
            var wheelContainer  = $('.card_selector_box');
            var deckHint        = wheelContainer.find('.deck_hint');

            deckHint.css('display', 'block');
            wheelContainer.find('.hint').remove();
        };


        cards.handlers.deck.cardClicked = function(event, dropPosX, dropPosY, cell) {
            var cardType            = $(event.target).data('cardtype');
            var deck                = $(event.target).data('carddeck');

            var cellId              = cell.parents('.cell_container').data('instanceid');

            var instanceId          = util.uidGenerator();
            var nextZIndex          = canvasStorage.util.getNextZIndex();
            var leftOffsetPercent   = (dropPosX / cell.width()) * 100;

            $(window).trigger('widget:card:model:new', [instanceId, cellId, leftOffsetPercent.toString(), (dropPosY / cards.zoomFactor).toString(), deck, cardType, nextZIndex]);


            var dialog  = $('.dialog');
            dialog.fadeOut( 250,
                function() {
                    dialog.remove();
                    $(window).trigger('widget:card:view:edit', [instanceId]);
                });


            $(window).trigger('widget:container:view:resize');
        };


        cards.handlers.deck.selectorWheel = function(deck, dropPosX, dropPosY, cell) {
            var decks       = require('decks'); // Pull in decks

            var wheelContainer  = $('.card_selector_box');

            var cardSelector    =   $('<ul></ul>', {
                'id':   'card_selector'
            });
            cardSelector.appendTo(wheelContainer);

            var deckHint            = decks.getHandler(deck).createHintDeck();

            var cardIcons           = decks.getHandler(deck).createCardIcons();
            var radius              = cardSelector.css('width').replace('px', '') / 2;

            var x;
            var y;

            var clickedFunc         = function (event) {
                cards.handlers.deck.cardClicked(event, dropPosX, dropPosY, cell);
            };

            // Set initial positions on circle
            var li;
            for(var i = 0; i < cardIcons.length; i++) {
                li  =   $('<li></li>');
                cardIcons[i].appendTo(li);
                li.appendTo(cardSelector);

                x   = radius - (cardIcons[i].css('width').replace('px', '') / 2) - parseInt(cardIcons[i].css('border-left-width').replace('px', ''), 10);
                y   = radius - (cardIcons[i].css('height').replace('px', '') / 2) - parseInt(cardIcons[i].css('border-top-width').replace('px', ''), 10);

                li.css('top',       y + 'px');
                li.css('left',      x + 'px');


                // Display central 'hint' card
                cardIcons[i]
                    .off(   'mouseover')    .on('mouseover',    cards.handlers.deck.cardMouseOver)
                    .off(   'mouseout')     .on('mouseout',     cards.handlers.deck.cardMouseOut)
                    .off(   'click')        .on('click',        clickedFunc);
            }


            cardSelector.css('transform', 'scale(0)');


            // Spin cards outwards from center
            var startTime;
            var animDuration = 0.25;    // how long should the animation last?
            var updateCircle = function() {

            var timeDiff        = ((Date.now() - startTime) / 1000);
            var scaledRadius    = (timeDiff / animDuration) * radius;

            var angle;
            for(var i = 0; i < cardIcons.length; i++) {
                angle   = 2 * Math.PI * i / cardIcons.length;
                angle   = angle-(2*Math.PI / 4);            // Rotate to the left by 1/4 rotation

                if((radius - scaledRadius) > 0) {
                    angle -= (radius - scaledRadius) / 90;
                }
                else {
                    scaledRadius    = radius;
                }

                // Calculate the basic position of cards on circle.
                x       = Math.round(scaledRadius * Math.cos(angle)) + radius;
                y       = Math.round(scaledRadius * Math.sin(angle)) + radius;

                // Offset by card dimensions
                x       -= Math.round((cardIcons[i].css('width').replace('px', '') / 2) + parseInt(cardIcons[i].css('border-left-width').replace('px', ''), 10));
                y       -= Math.round((cardIcons[i].css('height').replace('px', '') / 2) + parseInt(cardIcons[i].css('border-top-width').replace('px', ''), 10));

                cardIcons[i].parents('li').css('top',       y + 'px');
                cardIcons[i].parents('li').css('left',  x + 'px');
            }


            // Continue updating until time runs out
            if(timeDiff < animDuration) {
                cardSelector.css('transform', 'scale(' + (timeDiff * (1 / animDuration)) +  ')');
                window.setTimeout(updateCircle, 33);
            }
            else {
                cardSelector.css('transform', 'scale(1)');
                    deckHint.appendTo(wheelContainer);
                }
            };

            startTime    = Date.now();
            window.setTimeout(updateCircle, 33);
        };


        // Initialise card handlers
        cards.init();


        return cards;
    }
);
