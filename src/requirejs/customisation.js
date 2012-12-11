/*jshint jquery:true */


define( ['jquery'],
        function($) {
            'use strict';
            
            var customisation   = {};

            
            customisation.init = function() {
                $(window)
                    .off(   'widget:customisation:dialog:deck_selection')
                    .on(    'widget:customisation:dialog:deck_selection',   customisation.dialogs.deckSelection);
            };
            
            
            customisation.dialogs   = {};
            
            
            customisation.dialogs.deckSelection = function() {
                
                // Background & dialog
                var bgElem =            $('<div></div>',  {
                                            'class':       'dialog_background'
                                        });
                bgElem.css('display', 'none');
                bgElem.appendTo($('body'));

                var dialogCont =        $('<div></div>', {
                                            'class':       'dialog_container'
                                        });
                dialogCont.appendTo(bgElem);
                
                var dialog =            $('<div></div>', {
                                            'class':    'dialog',
                                            'id':       'customisation_deck_selection'
                                        });
                dialog.appendTo(dialogCont);
                
                
                // Title & Dismiss button
                var title           =   $('<div></div>', {
                    'class':    'dialog_title'
                });
                title.text('Customisation');
                title.appendTo(dialog);

                var dismissButton =     $('<div></div>', {
                                            'class':    'dialog_dismiss dismiss_button_32x32'
                                        });
                dismissButton.appendTo(dialog);
                
                dismissButton
                    .off('click')
                    .on('click', function() {
                        bgElem.fadeOut( 250,
                            function() {
                                bgElem.remove();
                            });
                    });
                

                // Customisation options
                var options =           $('<ul></ul>', {
                                            'id':       'customisation_options'
                                        });
                options.appendTo(dialog);
                
                var newDeck =           $('<li></li>', {
                                            'id':   'new_deck'
                                        });
                newDeck.text('Create New Deck');
                newDeck.appendTo(options);
                
                var editDeck =          $('<li></li>', {
                                            'id':   'edit_deck'
                                        });
                editDeck.text('Edit Existing Deck');
                editDeck.appendTo(options);
                
                var duplicateDeck   =   $('<li></li>', {
                                            'id':    'duplicate_deck'
                                        });
                duplicateDeck.text('Duplicate & Edit Preset Deck');
                duplicateDeck.appendTo(options);
                
                

                bgElem.fadeIn(  250,
                    function() {
                    });
            };
            
            customisation.init();
            
            return customisation;
        }
);
