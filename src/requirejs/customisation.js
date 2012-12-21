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
                .on('click', function() {
                    var bgElem  = $('.dialog_background');
                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });

            util.dialogTransition(dialog);
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


            var content         =   $('<ul></ul>', {
                                        'id':       'deck_customisations'
                                    });
            content.appendTo(dialog);


        // Deck Title
            var titleCont       =   $('<li></li>', {
                                        'class':    'title_container'
                                    });
            titleCont.appendTo(content);

            var titleLabel      =   $('<label></label>', {
                                        'for':      'title'
                                    });
            titleLabel.text('Name:');
            titleLabel.appendTo(titleCont);

            var titleInputCont  =   $('<div></div>', {
                                        'class':    'input_container'
                                    });
            titleInputCont.appendTo(titleCont);
            var titleEntry      =   $('<input>', {
                                        'type':     'text',
                                        'id':       'title'
                                    });
            titleEntry.appendTo(titleInputCont);


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

                dropElem.parent().find('.icon_display').css('background-image', 'url("http://i.imgur.com/' + data.upload.image.hash + '.png")');

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

            // Add colour picker
            colourSample.on('click', function(event) {
                colourEntry.trigger('click');
            });

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
            })
            .on('change', function(){
                $(this).ColorPickerSetColor(this.value);
            });

            // Back Button
            backButton.on('click', function() {
                customisation.dialogs.deckSelection();
            });

            dismissButton
                .off('click')
                .on('click', function() {
                    var bgElem  = $('.dialog_background');
                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });

            util.dialogTransition(dialog);
        };


        customisation.dialogs.cardManagement = function() {

        };


        /* Dialog to provide the ability to customise the cards in a deck. */
        customisation.dialogs.deckCardsCustomisation = function(deckName) {

        };


        customisation.init();

        return customisation;
    }
);
