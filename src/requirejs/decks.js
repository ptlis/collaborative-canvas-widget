/*jshint jquery:true */


/*  The dialog to select the active decks. */
var decks   = {

    init : function() {
        'use strict';

        $(window)
            .off(   'widget:deck:model:new')            .on('widget:deck:model:new',            decks.model.add)
            .off(   'widget:deck:model:delete')         .on('widget:deck:model:delete',         decks.model.remove)
            .off(   'widget:deck:model:remove_all')     .on('widget:deck:model:remove_all',     decks.model.removeAll)

            .off(   'widget:deck:view:add')             .on('widget:deck:view:add',             decks.view.add)
            .off(   'widget:deck:view:remove')          .on('widget:deck:view:remove',          decks.view.remove)
            .off(   'widget:deck:view:remove_all')      .on('widget:deck:view:remove_all',      decks.view.removeAll)
            .off(   'widget:deck:view:update')          .on('widget:deck:view:update',          decks.view.update);

    },


    createSelectionDialog : function(firstRun) {
        'use strict';

        var existingBg  = false;
        var bgElem;
        var dialogCont;
        if($('.dialog_background').length) {
            existingBg  = true;

            bgElem      = $('.dialog_background');
            dialogCont  = $('.dialog_container');
        }

        else {
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

        var dialog  =           $('<div></div>', {
                                    'class':    'dialog select_active_cards'
                                });
        dialog.appendTo(dialogCont);

        if(firstRun) {
            dialog.addClass('first_run');
        }


        var actions     =   $('<div></div>', {
            'id':       'actions'
        });
        actions.appendTo(dialog);

        var nextButton  =   $('<div></div>', {
            'id':       'next_button'
        });
        nextButton.appendTo(actions);

        // If initial conf show 'next' button
        var dismissButton;
        if(firstRun) {
            nextButton.text('Finish');
        }

        // otherwise 'done' button & show close button?
        else {
            nextButton.text('Done');

            dismissButton   =  $('<div></div>', {
                                    'class':    'dialog_dismiss dismiss_button_32x32'
                                });
            dismissButton.appendTo(dialog);
        }

        var title           =   $('<div></div>', {
            'class':    'dialog_title'
        });
        title.text('Step #: Select Active Decks');
        title.appendTo(dialog);

        var instructions    =   $('<div></div>', {
            'class':    'instructions'
        });
        instructions.text('Select the cards you wish to use. To do this drag the cards from the inactive left column into the active right column.');
        instructions.appendTo(dialog);

        if(!existingBg) {
            bgElem.fadeIn(  250,
                function() {
                });
        }

        else {
            dialog.fadeIn(  250,
                function() {
                });
        }


        // Drag & drop area for selecting cards
        var inactiveCol =   $('<ul></ul>', {
            'id':       'inactive_cards'
        });
        inactiveCol.appendTo(dialog);



        var activeCol   =   $('<ul></ul>', {
            'id':       'active_cards'
        });
        activeCol.appendTo(dialog);

        var addArrow    =   $('<div></div>', {
            'id':       'add_arrow'
        });
        addArrow.text('Use Deck');
        addArrow.appendTo(dialog);

        var remArrow    =   $('<div></div>', {
            'id':       'rem_arrow'
        });
        remArrow.text('Stop Using Deck');
        remArrow.appendTo(dialog);

        inactiveCol
            .off('dropstart')   .on('dropstart', decks.handlers.dropStart)
            .off('drop')        .on('drop',      decks.handlers.drop)
            .off('dropend')     .on('dropend',   decks.handlers.dropEnd);

        activeCol
            .off('dropstart')   .on('dropstart',   decks.handlers.dropStart)
            .off('drop')        .on('drop',        decks.handlers.drop)
            .off('dropend')     .on('dropend',     decks.handlers.dropEnd);


        var selectedDecks           = $('#deck_bar [data-prefix="deck"]');
        var activeDecks             = {};
        var i;
        for(i = 0; i < selectedDecks.length; i++) {
            activeDecks[$(selectedDecks[i]).data('carddeck')]    = true;
        }


        var deckIcons   = decks.getDeckIcons(false);
        var li;
        for(i = 0; i < deckIcons.length; i++) {
            li          = $('<li></li>');

            if(deckIcons[i].data('carddeck') in activeDecks) {
                li.appendTo(activeCol);
            }
            else {
                li.appendTo(inactiveCol);
            }


            deckIcons[i].appendTo(li);

            deckIcons[i]
                .off('mouseover')   .on('mouseover',    decks.handlers.mouseOverFunc)
                .off('mouseout')    .on('mouseout',     decks.handlers.mouseOutFunc)

                .off('dragstart')   .on('dragstart',    decks.handlers.dragStart)
                .off('drag')        .on('drag',         decks.handlers.drag)
                .off('dragend')     .on('dragend',      decks.handlers.dragEnd);
        }

        if(firstRun) {


            var backButton  =   $('<div></div>', {
                'id':       'back_button'
            });
            backButton.text('Back');
            nextButton.before(backButton);

            backButton
                .off('click')
                .on('click', function() {

                    dialog.fadeOut(250, function() {
                        dialog.remove();

                        containers.createDialog(firstRun);
                    });
                });

            nextButton
                .off('click')
                .on('click', function() {
                    var deckElems   = $('#active_cards [data-prefix="deck"]');

                    if(deckElems.length) {

                        bgElem.fadeOut( 250,
                            function() {
                                bgElem.remove();
                            });

                        canvasStorage.setRunningVersion();
                    }

                    else {
                        alert('Select some decks to use before proceeding.');
                    }
                });
        }

        else {
            nextButton
                .off('click')
                .on('click', function() {
                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });

            dismissButton
                .off('click')
                .on('click', function() {
                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });
        }
    },


    getDeckIcons : function(filtered) {
        'use strict';

        var icons       = [];

        // Return icons for active decks only
        if(filtered) {
            var activeDecks = decks.model.getAll();

            for(var index in activeDecks) {
                if(activeDecks.hasOwnProperty(index) && activeDecks[index].id in cards.availableDecks && cards.availableDecks.hasOwnProperty(activeDecks[index].id)) {
                    icons.push(cards.availableDecks[activeDecks[index].id].createDeckIcon());
                }
            }
        }

        // Return icons for all decks
        else {
            for(var deckName in cards.availableDecks) {
                if(cards.availableDecks.hasOwnProperty(deckName)) {
                    icons.push(cards.availableDecks[deckName].createDeckIcon());
                }
            }
        }

        return icons;
    },


    addEvents : function(deckElem) {
        'use strict';

        decks.removeEvents(deckElem);

        deckElem
            // Dragging
            .on('dragstart',    cards.handlers.deckDragStart)
            .on('drag',         cards.handlers.deckDrag)
            .on('dragend',      cards.handlers.deckDragEnd)

        // Tooltips
            .on('mouseenter',   cards.handlers.deckMouseEnter)
            .on('mouseleave',   cards.handlers.deckMouseLeave);
    },


    removeEvents : function(deckElem) {
        'use strict';

        deckElem
            // Dragging
            .off('dragstart')
            .off('drag')
            .off('dragend')

            // Tooltips
            .off('mouseenter')
            .off('mouseleave');
    },


    updateAll : function() {
        'use strict';

        var addedDeckIds    = [];
        var removedDecks  = [];
        var storedDecks     = decks.model.getAll();
        var displayedDecks  = $('#deck_selector [data-prefix="deck"]');
        var deckData;
        var deckId;
        var i;

        // Find deckss in storage but not in HTML document
        for(i = 0; i < storedDecks.length; i++) {

            // Element exists in storage but not on page
            if($('.deck[data-carddeck="' + storedDecks[i].id + '"]').length < 1)  {
                addedDeckIds.push(storedDecks[i]);
            }
        }


        // Find decks in HTML document but not in storage
        for(i = 0; i < displayedDecks.length; i++) {
            deckId          = $(displayedDecks[i]).data('carddeck');

            deckData        = decks.model.get(deckId);

            if(deckData === null || deckData.length < 1) {
                removedDecks.push(deckData);
            }
        }


        // Add deck
        for(i = 0; i < addedDeckIds.length; i++) {
            $(window).trigger('widget:deck:view:add',       [addedDeckIds[i]]);
        }


        // Remove decks
        for(i = 0; i < removedDecks.length; i++) {
            $(window).trigger('widget:deck:view:remove',    [removedDecks[i]]);
        }
    },


    view : {
        add : function(event, deckData) {
            'use strict';

            // Create tooltip
            var hint    = cards.availableDecks[deckData.id].createHintDeck();
            hint.removeClass('deck_hint').addClass('deck_tooltip');


            // create deck icon
            var icon    = cards.availableDecks[deckData.id].createDeckIcon();

            var li      = $('<li></li>');

            icon.appendTo(li);
            hint.appendTo(li);

            decks.addEvents(icon);

            li.appendTo($('#deck_selector'));
        },


        remove : function(event, deckData) {
            'use strict';

            var deckElem    = $('[data-carddeck="' + deckData.id + '"]');

            deckElem.parents('li').remove();
        },


        removeAll : function() {
            'use strict';


            var deckElems   = $('#deck_selector [data-prefix="deck"]');

            for(var i = 0; i < deckElems.length; i++) {
                $(deckElems[i]).remove();
            }
        },


        update : function(event, deckData) {
            'use strict';
        }
    },

    model : {
        getFields : function() {
            'use strict';

            return {
            };
        },


        add : function(event, deckId) {
            'use strict';

            var extraFields     = decks.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.add('deck', extraFields);
        },


        remove : function(event, deckId) {
            'use strict';

            var extraFields     = decks.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.remove('deck', extraFields);
        },


        removeAll : function() {
            'use strict';

            canvasStorage.list.removeAll('deck', decks.model.getFields());
        },


        get : function(deckId) {
            'use strict';

            return canvasStorage.list.get('deck', deckId);
        },


        getAll : function() {
            'use strict';

            return canvasStorage.list.getAll('deck');
        }
    },


    handlers : {


        mouseOverFunc : function(event) {
            'use strict';

            var dialog          = $('.dialog');
            var deck            = $(event.target).data('carddeck');

            var deckHint        = cards.getDeckHandler(deck).createHintDeck();
            deckHint.appendTo(dialog);

            deckHint.css({
                'position':     'absolute',
                'left':         (dialog.width() / 2) - (deckHint.outerWidth() / 2),
                'top':          154 + (476 / 2) - (deckHint.outerHeight() / 2)
            });
        },


        mouseOutFunc : function() {
            'use strict';

            $('.dialog').find('.deck_hint').remove();
        },


        dragStart : function(event, dd) {
            'use strict';

            var dialog      = $('.dialog');

            dialog.find('.deck_hint').remove();
            $(this).css({   'position':    'absolute',
                            'z-index':      '9999'});

            // Disable regular drops
            $('.cell_inner').off('dropstart');
            $('.cell_inner').off('drop');
            $('.cell_inner').off('dropend');

            // Disable deck tooltips
            $('[data-prefix="deck"]').off('mouseout');
            $('[data-prefix="deck"]').off('mouseover');


            dd.limit        = dialog.offset();
            dd.limit.bottom = dd.limit.top + dialog.height() - $(this).outerHeight();
            dd.limit.right  = dd.limit.left + dialog.width() - $(this).outerWidth();
        },


        drag : function(event, dd) {
            'use strict';

            var dialog      = $('.dialog');
            $(this).css({
                'top':  Math.min( dd.limit.bottom, Math.max( dd.limit.top, dd.offsetY ) ) - dialog.offset().top,
                'left': Math.min( dd.limit.right, Math.max( dd.limit.left, dd.offsetX ) ) - dialog.offset().left
            });
        },


        dragEnd : function(event, dd) {
            'use strict';

            var dialog      = $('.dialog');

            // Re-enable regular drops
            $('.cell_inner')
                .off('dropstart')   .on('dropstart',    containers.handlers.cardDropStart)
                .off('drop')        .on('drop',         containers.handlers.cardDrop)
                .off('dropend')     .on('dropend',      containers.handlers.cardDropEnd);

            $(this).animate({
                    'top':  dd.originalY - dialog.offset().top,
                    'left': dd.originalX - dialog.offset().left
                },
                250,
                function() {
                    $(this).css('position', 'static');
                });
        },


        dropStart : function(event, dd) {
            'use strict';

        },


        drop : function(event, dd) {
            'use strict';

            var deckElem    = $(event.target);
            var dropElem    = $(this);
            if(deckElem.data('prefix') === 'deck' && (dropElem.attr('id') === 'active_cards' || dropElem.attr('id') === 'inactive_cards')) {

                // Deck from inactive into active column
                if(dropElem.attr('id') === 'active_cards' && deckElem.parents('#inactive_cards').length > 0) {
                    $(window).trigger('widget:deck:model:new', [deckElem.data('carddeck')]);
                }

                // Deck from active into inactive column
                else if(dropElem.attr('id') === 'inactive_cards' && deckElem.parents('#active_cards').length > 0) {
                    $(window).trigger('widget:deck:model:delete', [deckElem.data('carddeck')]);
                }

                var li          = deckElem.parent();
                li.remove();
                li.appendTo(dropElem);

                deckElem.css('position', 'static');

                $('[data-prefix="deck"]')
                    .off('mouseover')   .on('mouseover',  decks.handlers.mouseOverFunc)
                    .off('mouseout')    .on('mouseout',   decks.handlers.mouseOutFunc);

                deckElem
                    .off('dragstart')   .on('dragstart',    decks.handlers.dragStart)
                    .off('drag')        .on('drag',         decks.handlers.drag)
                    .off('dragend')     .on('dragend',      decks.handlers.dragEnd);
            }
        },


        dropEnd : function(event, dd) {
            'use strict';
            
        }
    }
};
