/*jshint jquery:true */


define(
    ['jquery', 'util'],
    function($, util) {
        'use strict';

        var customisation       = {};
        customisation.dialogs   = {};


        customisation.init = function() {
            $(window)
                .off(   'widget:customisation:dialog:deck_selection')
                .on(    'widget:customisation:dialog:deck_selection',   customisation.dialogs.deckSelection);
        };


    /* Dialogs */

        /* Select deck customisation action. */
        customisation.dialogs.deckSelection = function() {

            var dialog          =   $('<div></div>', {
                                        'class':    'dialog',
                                        'id':       'customisation_deck_selection'
                                    });

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

            dismissButton
                .off('click')
                .on('click', util.dialogDismiss);

            util.dialogTransition(dialog);
        };


        /* Customisation options for the deck itself (name, colour, icon etc) */
        customisation.dialogs.deckCustomisation = function(newDeck, deckId) {
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


            var content         =   $('<ul></ul>', {
                                        'id':       'deck_customisations'
                                    });
            content.appendTo(dialog);


        // Deck Title
            var nameCont        =   $('<li></li>', {
                                        'class':    'name_container'
                                    });
            nameCont.appendTo(content);

            var nameLabel       =   $('<label></label>', {
                                        'for':      'name'
                                    });
            nameLabel.text('Name:');
            nameLabel.appendTo(nameCont);

            var nameInputCont   =   $('<div></div>', {
                                        'class':    'input_container'
                                    });
            nameInputCont.appendTo(nameCont);
            var nameEntry       =   $('<input>', {
                                        'type':     'text',
                                        'id':       'name'
                                    });
            nameEntry.appendTo(nameInputCont);


        // Deck description
            var descCont        =   $('<li></li>', {
                                        'class':    'desc_container'
                                    });
            descCont.appendTo(content);


            var descLabel       =   $('<label></label>', {
                                        'for':      'desc'
                                    });
            descLabel.text('Description:');
            descLabel.appendTo(descCont);

            var descInputCont   =   $('<div></div>', {
                                        'class':    'input_container'
                                    });
            descInputCont.appendTo(descCont);
            var descEntry       =   $('<input>', {
                                        'type':     'text',
                                        'id':       'desc'
                                    });
            descEntry.appendTo(descInputCont);


        // Deck Colour
            var colourCont      =   $('<li></li>', {
                                        'class':    'colour_container'
                                    });
            colourCont.appendTo(content);

            var colourLabel     =   $('<label></label>', {
                                        'for':      'colour'
                                    });
            colourLabel.text('Colour:');
            colourLabel.appendTo(colourCont);

            var colourSample    =   $('<div></div>', {
                                        'id':       'colour_sample'
                                    });
            colourSample.appendTo(colourCont);

            var colourInputCont =   $('<div></div>', {
                                        'class':    'input_container'
                                    });
            colourInputCont.appendTo(colourCont);
            var colourEntry     =   $('<input>', {
                                        'type':     'text',
                                        'id':       'colour'
                                    });
            colourEntry.appendTo(colourInputCont);

        // Deck Icon (32x32)
            var iconSmlCont     =   $('<li></li>', {
                                        'class':    'icon_small_container'
                                    });
            iconSmlCont.appendTo(content);

            var iconSmlLabel    =   $('<label></label>');
            iconSmlLabel.text('Icon (32x32):');
            iconSmlLabel.appendTo(iconSmlCont);

            var iconSmlShow     =   $('<div></div>', {
                                        'id':       'icon_small',
                                        'class':    'icon_display'
                                    });
            iconSmlShow.appendTo(iconSmlCont);

            var iconSmlDrop     =   $('<div></div>', {
                                        'id':       'icon_small_drop'
                                    });
            iconSmlDrop.text('Drop icon here');
            iconSmlDrop.appendTo(iconSmlCont);

        // Deck Icon (48x48)
            var iconLrgCont     =   $('<li></li>', {
                                        'class':    'icon_large_container'
                                    });
            iconLrgCont.appendTo(content);

            var iconLrgLabel    =   $('<label></label>');
            iconLrgLabel.text('Icon (48x48):');
            iconLrgLabel.appendTo(iconLrgCont);

            var iconLrgShow     =   $('<div></div>', {
                                        'id':       'icon_large',
                                        'class':    'icon_display'
                                    });
            iconLrgShow.appendTo(iconLrgCont);

            var iconLrgDrop     =   $('<div></div>', {
                                        'id':       'icon_large_drop'
                                    });
            iconLrgDrop.text('Drop icon here');
            iconLrgDrop.appendTo(iconLrgCont);

        // Preview of card appearance
            var previewCont     =   $('<li></li>', {
                                        'class':    'preview_container'
                                    });
            previewCont.appendTo(content);

            var previewLabel    =   $('<label></label>');
            previewLabel.text('Preview:');
            previewLabel.appendTo(previewCont);

            var previewArea     =   $('<div></div>', {
                                        'class':    'preview'
                                    });
            previewArea.appendTo(previewCont);

            var previewDeck     =   $('<span></span>', {
                                        'data-prefix':      'deck',
                                        'data-cardsize':    'small',
                                        'data-template':    'selectable_prompts'
                                    });
            previewDeck.appendTo(previewArea);

        // Next & Back Buttons
            var buttonCont      =   $('<div></div>', {
                                        'class':    'button_container'
                                    });
            buttonCont.appendTo(dialog);

            var backButton      =   $('<div></div>', {
                                        'id':       'back_button'
                                    });
            backButton.text('Back');
            backButton.appendTo(buttonCont);

            var nextButton      =   $('<div></div>', {
                                        'id':       'next_button'
                                    });
            nextButton.text('Next');
            nextButton.appendTo(buttonCont);



        // Events
            var success = function(dropElem, data) {
                dropElem.text('Done');

                var imgURL      = 'http://i.imgur.com/' + data.upload.image.hash + '.png';

                var iconElem    = dropElem.parent().find('.icon_display');
                iconElem.css('background-image', 'url("' + imgURL + '")');
                iconElem.attr('data-imgsrc', imgURL);

                if(dropElem.attr('id') ===  'icon_small_drop') {
                    previewDeck.css('background-image', 'url("http://i.imgur.com/' + data.upload.image.hash + '.png")');
                }
            };

            var error   = function(dropElem, errMsg) {
                dropElem.text('Drop Icon Here');
                alert(errMsg);
            };

            var beforeSend  = function(dropElem) {
                dropElem.text('Uploading...');
            };

            // Upload small image
            iconSmlDrop.imgurUpload({
                'apiKey':           util.imgurApiKey,
                'beforeSend':       beforeSend,
                'uploadSuccess':    success,
                'error':            error,
                'exactWidth':       32,
                'exactHeight':      32
            });

            // Upload large image
            iconLrgDrop.imgurUpload({
                'apiKey':           util.imgurApiKey,
                'beforeSend':       beforeSend,
                'uploadSuccess':    success,
                'error':            error,
                'exactWidth':       48,
                'exactHeight':      48
            });

            // When user clicks on colour sample open the colour picker
            colourSample.on('click', function(event) {
                colourEntry.trigger('click');
            });

            // Colour picker
            colourEntry.ColorPicker({
                onSubmit: function(hsb, hex, rgb, el, parent) {
                    $(el).val(hex);
                    $(el).ColorPickerHide();
                },
                onBeforeShow: function () {
                    $(this).ColorPickerSetColor(this.value);
                },
                onChange: function (hsb, hex, rgb) {
                    colourSample.css('backgroundColor', '#' + hex);
                    colourEntry.val('#' + hex);
                    previewDeck.css('backgroundColor', '#' + hex);
                },
                onShow: function (picker) {
                    $(picker).fadeIn(125);
                    return false;
                },
                onHide: function (picker) {
                    $(picker).fadeOut(125);
                    return false;
                }
            });

            // Back Button
            backButton.on('click', function() {
                customisation.dialogs.deckSelection();
            });

            // Next Button
            nextButton.on('click', function() {
                var instanceId      = util.uidGenerator();
                var name            = nameEntry.val();
                var desc            = descEntry.val();
                var colour          = colourEntry.val();
                var icon32x32URL    = iconSmlShow.data('imgsrc');
                var icon48x48URL    = iconLrgShow.data('imgsrc');

                $(window).trigger('widget:custom_deck:model:new', [instanceId, name, desc, colour, icon32x32URL, icon48x48URL]);

                customisation.dialogs.deckCardsManagement();
            });

            // Dismiss button
            dismissButton
                .off('click')
                .on('click', util.dialogDismiss);

            util.dialogTransition(dialog);
        };


        customisation.dialogs.deckCardsManagement = function(deckId) {
            var dialog          =   $('<div></div>', {
                                        'class':    'dialog',
                                        'id':       'customisation_deck_cards_management'
                                    });
            dialog.css('display', 'none');

            // Title & Dismiss button
            var title           =   $('<div></div>', {
                                        'class':    'dialog_title'
                                    });
            title.text('Manage cards in deck');
            title.appendTo(dialog);

            var dismissButton   =   $('<div></div>', {
                                        'class':    'dialog_dismiss dismiss_button_32x32'
                                    });
            dismissButton.appendTo(dialog);



        // Back Button
            var buttonCont      =   $('<div></div>', {
                                        'class':    'button_container'
                                    });
            buttonCont.appendTo(dialog);

            var backButton      =   $('<div></div>', {
                                        'id':       'back_button'
                                    });
            backButton.text('Back');
            backButton.appendTo(buttonCont);


        // Events
            backButton
                .off('click')
                .on('click', function() {
                    customisation.dialogs.deckCustomisation(false, deckId);
                });

            // Dismiss button
            dismissButton
                .off('click')
                .on('click', util.dialogDismiss);

            util.dialogTransition(dialog);
        };


        customisation.init();

        return customisation;
    }
);
