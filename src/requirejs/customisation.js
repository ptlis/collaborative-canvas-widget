/*jshint jquery:true */


define( ['jquery', 'util'],
        function($, util) {
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
                var bgElem          =   $('<div></div>',  {
                                            'class':       'dialog_background'
                                        });
                bgElem.css('display', 'none');
                bgElem.appendTo($('body'));

                var dialogCont      =   $('<div></div>', {
                                            'class':       'dialog_container'
                                        });
                dialogCont.appendTo(bgElem);
                
                var dialog          =   $('<div></div>', {
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
                newDeck.on('click', function() {
                    customisation.dialogs.deckCustomisation(true);
                });
                
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
            

            customisation.dialogs.deckCustomisation = function(newDeck, deckName) {

                var dialog          =   $('<div></div>', {
                                            'class':    'dialog',
                                            'id':       'customisation_deck_details'
                                        });
                dialog.css('display', 'none');
                
                // Title & Dismiss button
                var title           =   $('<div></div>', {
                                            'class':    'dialog_title'
                                        });
                if(newDeck) {
                    title.text('Enter New Deck Details');
                }
                else {
                    title.text('Customise Deck Details');
                }
                title.appendTo(dialog);

                var dismissButton   =   $('<div></div>', {
                                            'class':    'dialog_dismiss dismiss_button_32x32'
                                        });
                dismissButton.appendTo(dialog);
                
                var bgElem          = $('.dialog_background');
                dismissButton
                    .off('click')
                    .on('click', function() {
                        bgElem.fadeOut( 250,
                            function() {
                                bgElem.remove();
                            });
                    });
                
                
                var content     =   $('<ul></ul>', {
                                        'id':       'deck_customisations'
                                    });
                content.appendTo(dialog);
                
                
                // Deck Title & Description
                var titleCont   =   $('<li></li>', {
                                        'class':    'title_container'
                                    });
                titleCont.appendTo(content);
                
                var titleLabel  =   $('<label></label>', {
                                        'for':      'title'
                                    });
                titleLabel.text('Name:');
                titleLabel.appendTo(titleCont);
                
                var titleEntry  =   $('<input>', {
                                        'type':     'text',
                                        'id':       'title'
                                    });
                titleEntry.appendTo(titleCont);


                var descCont    =   $('<li></li>', {
                                        'class':    'desc_container'
                                    });
                descCont.appendTo(content);
                
                var descLabel   =   $('<label></label>', {
                                        'for':      'desc'
                                    });
                descLabel.text('Description:');
                descLabel.appendTo(descCont);
                
                var descEntry  =   $('<input>', {
                                        'type':     'text',
                                        'id':       'desc'
                                    });
                descEntry.appendTo(descCont);
                
                
                // Transition between dialogs
                var oldDialog  = $('.dialog');
                
                oldDialog.fadeOut(  250,
                    function() {
                        oldDialog.remove();
                        dialog.appendTo('.dialog_container');
                        dialog.fadeIn( 250);
                    });
                
            };
            
            
            
            customisation.init();
            
            return customisation;
        }
);
