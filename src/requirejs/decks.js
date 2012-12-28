/*jshint jquery:true */


define(
    ['jquery', 'containers', 'storage/canvasStorage'],
    function($, containers, canvasStorage) {
        'use strict';


        /*  The dialog to select the active decks. */
        var decks   = {};
        decks.view  = {};
        decks.model = {};


        /*  Array of decks that are available for use */
        decks.availableDecks    = {};


        decks.init = function() {
            $(window)
                .off(   'widget:deck:model:new')            .on('widget:deck:model:new',            decks.model.add)
                .off(   'widget:deck:model:delete')         .on('widget:deck:model:delete',         decks.model.remove)
                .off(   'widget:deck:model:remove_all')     .on('widget:deck:model:remove_all',     decks.model.removeAll)

                .off(   'widget:deck:view:add')             .on('widget:deck:view:add',             decks.view.add)
                .off(   'widget:deck:view:remove')          .on('widget:deck:view:remove',          decks.view.remove)
                .off(   'widget:deck:view:remove_all')      .on('widget:deck:view:remove_all',      decks.view.removeAll)
                .off(   'widget:deck:view:update')          .on('widget:deck:view:update',          decks.view.update)
                .off(   'widget:deck:view:update_all')      .on('widget:deck:view:update_all',      decks.view.updateAll)
                .off(   'widget:deck:view:tooltip_show')    .on('widget:deck:view:tooltip_show',    decks.view.tooltipShow)
                .off(   'widget:deck:view:tooltip_hide')    .on('widget:deck:view:tooltip_hide',    decks.view.tooltipHide)
                .off(   'widget:deck:view:hint_show')       .on('widget:deck:view:hint_show',       decks.view.hintShow)
                .off(   'widget:deck:view:hint_hide')       .on('widget:deck:view:hint_hide',       decks.view.hintHide)
                .off(   'widget:deck:view:create_dialog')   .on('widget:deck:view:create_dialog',   decks.view.createDialog);
        },


        decks.getHandler = function(deck) {
            var handler;

            // Valid deck
            if(deck in decks.availableDecks && decks.availableDecks.hasOwnProperty(deck)) {
                handler = decks.availableDecks[deck];
            }

            else {
                throw 'invalid deck provided';
            }

            return handler;
        };


        decks.addHandler = function(deckName, deckObj) {
            decks.availableDecks[deckName]  = deckObj;
        };


        decks.removeHandler = function(deckName) {
            if(deckName in decks.availableDecks && decks.availableDecks.hasOwnProperty(deckName)) {
                delete  decks.availableDecks[deckName];
            }
        };


        decks.getDeckIcons = function(filtered) {
            var icons       = [];

            // Return icons for active decks only
            if(filtered) {
                var activeDecks = decks.model.getAll();

                for(var index in activeDecks) {
                    if(activeDecks.hasOwnProperty(index) && activeDecks[index].id in decks.availableDecks && decks.availableDecks.hasOwnProperty(activeDecks[index].id)) {
                        icons.push(decks.availableDecks[activeDecks[index].id].createDeckIcon());
                    }
                }
            }

            // Return icons for all decks
            else {
                for(var deckName in decks.availableDecks) {
                    if(decks.availableDecks.hasOwnProperty(deckName)) {
                        icons.push(decks.availableDecks[deckName].createDeckIcon());
                    }
                }
            }

            return icons;
        };


        decks.addEvents = function(deckElem) {
            decks.removeEvents(deckElem);

            // Tooltips
            deckElem
                .on('mouseenter',   function() {
                    $(window).trigger('widget:deck:view:tooltip_show', [deckElem]);
                })
                .on('mouseleave',   function() {
                    $(window).trigger('widget:deck:view:tooltip_hide', [deckElem]);
                });

            // Dragging
            deckElem.draggable({
                'revert':   'invalid',
                'helper':   'clone'
            });
        };


        decks.removeEvents = function(deckElem) {
            // Tooltips
            deckElem
                .off('mouseenter')
                .off('mouseleave');

            // TODO: Figure out reliable way to remove draggable.
        };


        decks.view.add = function(event, deckData) {
            // Create tooltip
            var hint    = decks.availableDecks[deckData.id].createHintDeck();
            hint.removeClass('deck_hint').addClass('deck_tooltip');

            // create deck icon
            var icon    = decks.availableDecks[deckData.id].createDeckIcon();

            var li      = $('<li></li>');

            icon.appendTo(li);
            hint.appendTo(li);

            decks.addEvents(icon);

            li.appendTo($('#deck_selector'));
        };


        decks.view.remove = function(event, deckData) {
            var deckElem    = $('#deck_selector [data-carddeck="' + deckData.id + '"]');

            deckElem.parents('li').remove();
        };


        decks.view.removeAll = function() {
            var deckElems   = $('#deck_selector [data-prefix="deck"]');

            for(var i = 0; i < deckElems.length; i++) {
                $(deckElems[i]).remove();
            }
        };


        decks.view.update = function(event, deckData) {

        };


        decks.view.updateAll = function() {
            var addedDeckIds    = [];
            var removedDecks  = [];
            var storedDecks     = decks.model.getAll();
            var displayedDecks  = $('#deck_selector [data-prefix="deck"]');
            var deckData;
            var deckId;
            var i;

            // Find decks in storage but not in HTML document
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
        };


        decks.view.tooltipShow = function(event, targetElem) {
            var iconPosition    = targetElem.offset();

            targetElem.next('.deck_tooltip').css('top', iconPosition.top - $(window).scrollTop());
            targetElem.next('.deck_tooltip').fadeIn(100);
        };


        decks.view.tooltipHide = function(event, targetElem) {
            targetElem.parents('li').find('.deck_tooltip').fadeOut(100);
        };


        decks.view.hintShow = function(event, targetElem) {
            var dialog          = $('.dialog');
            var deck            = targetElem.data('carddeck');

            var deckHint        = decks.getHandler(deck).createHintDeck();
            deckHint.appendTo(dialog);

            deckHint.css({
                'position':     'absolute',
                'left':         (dialog.width() / 2) - (deckHint.outerWidth() / 2),
                'top':          154 + (476 / 2) - (deckHint.outerHeight() / 2)
            });
        };


        decks.view.hintHide = function() {
            $('.dialog').find('.deck_hint').remove();
        };


        decks.view.createDialog = function(event, firstRun) {
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
                'id':       'inactive_cards',
                'class':    'connected'
            });
            inactiveCol.appendTo(dialog);



            var activeCol   =   $('<ul></ul>', {
                'id':       'active_cards',
                'class':    'connected'
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

            inactiveCol.sortable({
                connectWith:    '.connected',
                containment:    dialog
            });

            // Events to add and remove items.
            activeCol.sortable({
                connectWith:    '.connected',
                containment:    dialog,
                receive : function(event, ui) {
                    $(window).trigger('widget:deck:model:new', [ui.item.find('span').data('carddeck')]);
                },
                remove : function(event, ui) {
                    $(window).trigger('widget:deck:model:delete', [ui.item.find('span').data('carddeck')]);
                }
            });


            var selectedDecks           = $('#deck_bar [data-prefix="deck"]');
            var activeDecks             = {};
            var i;
            for(i = 0; i < selectedDecks.length; i++) {
                activeDecks[$(selectedDecks[i]).data('carddeck')]    = true;
            }


            var triggerShow = function(event) {
                $(window).trigger('widget:deck:view:hint_show', [$(event.target)]);
            };

            var triggerHide = function(event) {
                $(window).trigger('widget:deck:view:hint_hide', [$(event.target)]);
            };


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
                    .off('mouseover')   .on('mouseover',    triggerShow)
                    .off('mouseout')    .on('mouseout',     triggerHide);
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
        };


        decks.model.getFields = function() {
            return {
            };
        };


        decks.model.add = function(event, deckId) {
            var extraFields     = decks.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.add('deck', extraFields);
        };


        decks.model.remove = function(event, deckId) {
            var extraFields     = decks.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.remove('deck', extraFields);
        };


        decks.model.removeAll = function() {
            canvasStorage.list.removeAll('deck', decks.model.getFields());
        };


        decks.model.get = function(deckId) {
            return canvasStorage.list.get('deck', deckId);
        };


        decks.model.getAll = function() {
            return canvasStorage.list.getAll('deck');
        };


        // Initialise deck handlers
        decks.init();


        return decks;
    }
);
