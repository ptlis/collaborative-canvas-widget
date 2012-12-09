/*jshint jquery:true */


define( ['jquery', 'decks'],
        function($, decks) {
            'use strict';

            var sticky  = {

                createCard      : function(cardType, instanceId, size, cell) {
                    var card            =   $('<div></div>', {
                                                'data-prefix':      'card',
                                                'data-carddeck':    'sticky',
                                                'data-cardtype':    cardType,
                                                'data-cardsize':    size,
                                                'data-instanceid':  instanceId
                                            });


                    // Widgets for sticky title
                    var inputElem;
                    if(size === 'medium') {
                        inputElem       =   $('<div></div>', {
                                                'class':                'title default_text',
                                                'data-defaultvalue':    'enter title...',
                                                'data-inputname':       'title'
                                            });
                        inputElem.appendTo(card);
                    }

                    else if(size === 'large') {
                        var outerElem   =   $('<div></div>', {
                                                'class':        'input_container'
                                            });
                        outerElem.appendTo(card);

                        inputElem       =   $('<input>', {
                                                'type':                 'text',
                                                'class':                'title text_input',
                                                'placeholder':          'enter title...',
                                                'data-inputname':       'title'
                                                    
                                            });
                        inputElem.appendTo(outerElem);
                    }


                    var contents;
                    if(size === 'large') {
                        var closeButton     =   $('<div></div>', {
                                                    'class':            'dialog_dismiss dismiss_button_32x32'
                                                });
                        closeButton.appendTo(card);

                        var edit_color_image    =   $('<div></div>', {
                                                        'class':                'colour_picker_button picker_button_32x32'
                                                    });
                        edit_color_image.appendTo(card);

                        var outerContents       =   $('<div></div>', {
                                                        'class':    'textarea_container'
                                                    });
                        outerContents.appendTo(card);

                        contents                =   $('<textarea></textarea>', {
                                                        'class':                'text_input content',
                                                        'placeholder':          'enter note...',
                                                        'data-inputname':       'content'
                                                    });
                        contents.appendTo(outerContents);
                    }

                    else if(size === 'medium') {
                        var menuButton      =   $('<div></div>', {
                                                    'class':            'menu_icon menu_button_32x32'
                                                });
                        menuButton.appendTo(card);

                        contents                =   $('<div></div>', {
                                                        'class':                'text_input content default_text',
                                                        'data-defaultvalue':    'enter note...',
                                                        'data-inputname':       'content'
                                                    });
                        contents.appendTo(card);
                    }

                    card.appendTo(cell);

                    return card;
                },


                getExtraFields : function(cardType) {
                    var extraFields         = {};
                    extraFields.title       = '';
                    extraFields.content     = '';

                    return extraFields;
                },


                addEvents : function(cardElem) {
                    var size    = $(cardElem).data('cardsize');

                    if(size === 'large') {
                        this.addColourChangeEvents(cardElem);
                    }

                    canvasStorage.addChangeEvents(cardElem);
                },


                removeEvents : function(cardElem) {
                    var size    = $(cardElem).data('cardsize');

                    if(size === 'large') {
                        cardElem.find('.colour_picker_button')
                            .off('click');
                    }

                    canvasStorage.removeChangeEvents(cardElem);
                },


                postPropagate : function(card) {
                    // Empty]
                },




                /** Creates the HTML elements for the small card icons. */
                createCardIcons : function() {
                    var elements    = [];

                    for(var cardType in this.card_types) {
                        if(this.card_types.hasOwnProperty(cardType)) {
                            var span    =   $('<span></span>', {
                                                'data-carddeck':    'sticky',
                                                'data-cardtype':    this.card_types[cardType],
                                                'data-cardsize':    'preview'
                                            });

                            elements.push(span);
                        }
                    }

                    return elements;
                },



                createDeckIcon : function() {
                    return  $('<span></span>', {
                                'data-prefix':      'deck',
                                'data-carddeck':    'sticky',
                                'data-cardsize':    'small'
                            });
                },




                createHintCard : function(cardType) {
                    var card        =   $('<div></div>', {
                                            'class':            'hint',
                                            'data-carddeck':    'sticky',
                                            'data-cardtype':    cardType,
                                            'data-cardsize':    'medium'
                                        });


                    var title       =   $('<div></div>', {
                                            'class':            'title dark_bg'
                                        });
                    title.text(this.deck.title);
                    title.appendTo(card);

                    var description =   $('<div></div>', {
                                            'class':            'description light_bg'
                                        });
                    description.text(this.deck.description);
                    description.appendTo(card);

                    return card;
                },



                createHintDeck : function() {
                    var card        =   $('<div></div>', {
                                            'class':            'deck_hint',
                                            'data-carddeck':    'sticky',
                                            'data-cardsize':    'medium'
                                        });

                    var title       =   $('<div></div>', {
                                            'class':            'title dark_bg'
                                        });
                    title.text(this.deck.title);
                    title.appendTo(card);

                    var description =   $('<div></div>', {
                                            'class':            'description light_bg'
                                        });
                    description.text(this.deck.description);
                    description.appendTo(card);

                    return card;
                },




                addColourChangeEvents : function(cardElem) {

                    $(cardElem).find('.colour_picker_button')
                        .off('click')
                        .on('click', function(event) {
                            var selectorContainer   =   $('.dialog_container');
                            selectorContainer.attr('id', 'colour_picker_container');

                            var selectorDialog  =   $('<div></div>', {
                                                            'class': 'dialog'
                                                        });
                            selectorDialog.appendTo(selectorContainer);

                            selectorDialog.css('display', 'none');
                            cardElem
                                .fadeOut(    125, function(){
                                    selectorDialog.fadeIn(    125);
                                });

                            var titleElem           =   $('<div></div>', {
                                                            'class':    'dialog_title'
                                                        });
                            titleElem.appendTo(selectorDialog);
                            titleElem.text('Select Colour');

                            var closeButton         =   $('<div></div>', {
                                                            'class':    'dialog_dismiss dismiss_button_32x32'
                                                        });
                            closeButton.appendTo(selectorDialog);

                            var listElem            =   $('<ul></ul>');
                            listElem.appendTo(selectorDialog);

                            var itemElem;
                            var instanceId          = cardElem.data('instanceid');

                            var colourPickFunc  = function(event) {
                                // Change Color
                                var newColour       = $(event.target).data('cardtype');

                                // Update storage
                                $(window).trigger('widget:card:model:change_type', [instanceId, newColour]);
                                $(window).trigger('widget:card:view:change_type', [instanceId, newColour]);

                                // Close colour selector
                                selectorDialog.fadeOut(  250,
                                    function() {
                                        selectorDialog
                                            .fadeOut(    125, function() {
                                                selectorContainer.attr('id', '');
                                                selectorDialog.remove();

                                                cardElem.fadeIn(    125);
                                            });
                                    });
                            };

                            var coloursIcons    = sticky.createCardIcons();
                            for(var index = 0; index < coloursIcons.length; index++) {
                                itemElem        =   $('<li></li>');
                                itemElem.appendTo(listElem);

                                coloursIcons[index].appendTo(itemElem);

                                // Add events
                                coloursIcons[index]
                                    .off('click')
                                    .on('click', colourPickFunc);
                            }

                            closeButton
                                .off('click')
                                .on('click', function(event) {
                                    selectorDialog.fadeOut(  250,
                                        function() {
                                            selectorDialog
                                                .fadeOut(    125, function() {
                                                    selectorContainer.attr('id', '');
                                                    selectorDialog.remove();

                                                    cardElem.fadeIn(    125);
                                                });
                                        });
                                });
                        });
                },




                // Deck info
                deck            : {
                    'title':        'Sticky Note Deck',
                    'description':  'Used for general notes.'
                },


                card_types : {
                    '0':        'blue',
                    '1':        'green',
                    '2':        'yellow',
                    '3':        'orange',
                    '4':        'red',
                    '5':        'pink',
                    '6':        'lilac',
                    '7':        'purple'
                }
            };

            decks.addHandler('sticky', sticky);
        }
);