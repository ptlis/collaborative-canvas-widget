/*jshint jquery:true */



define( ['jquery', 'storage/canvasStorage'],
        function ($, canvasStorage) {

        /* Class used to create card decks from a template. **/
            function SelectablePromptTemplate(name, data) {
                'use strict';

                this.deckName       = name;
                this.deckData       = data;
            }


            SelectablePromptTemplate.prototype.createCard = function(cardType, instanceId, size, cell) {
                'use strict';

                // Invalid size provided
                if(typeof(size) === 'undefined' || (size !== 'medium' && size !== 'large')) {
                    throw 'Invalid card size provided';
                }

                // Invalid card type provided, should not be possible
                if(typeof(this.deckData.cardTypes[cardType]) === 'undefined') {
                    throw 'Invalid card type provided (' + this.deckName + ':' + cardType + ')';
                }


                var card                =   $('<div></div>', {
                                                'data-prefix':      'cards',
                                                'data-template':    'selectable_prompts',
                                                'data-carddeck':    this.deckName,
                                                'data-cardtype':    cardType,
                                                'data-cardsize':    size,
                                                'data-instanceid':  instanceId
                                            });

                // Header
                var header              =   $('<div></div>', {
                                                'class':            'card_header dark_bg'
                                            });
                header.appendTo(card);

                var titleElem;
                if(size === 'medium') {
                    titleElem               =   $('<h3></h3>', {
                                                    'class':                'header',
                                                    'data-inputname':       'activity',
                                                    'data-defaultvalue':    this.deckData.cardTypes[cardType].title
                                                });
                    titleElem.text(this.deckData.cardTypes[cardType].title);
                    titleElem.appendTo(header);
                }
                else if(size === 'large') {
                    titleElem               =   $('<h3></h3>', {
                                                    'class':        'header'
                                                });
                    titleElem.text(this.deckData.cardTypes[cardType].title + ': ');
                    titleElem.appendTo(header);

                    var subTitleElem        =   $('<p></p>');
                    $(this.deckData.cardTypes[cardType].subtitle).appendTo(subTitleElem);
                    subTitleElem.appendTo(header);
                }

                var iconImg                 = this.getIcon(cardType, size);
                iconImg.appendTo(header);

                if(size === 'medium') {
                    var menuButton      =   $('<div></div>', {
                                                'class':            'menu_icon menu_button_32x32'
                                            });
                    menuButton.appendTo(header);
                }
                else if(size === 'large') {
                    var closeButton     =   $('<div></div>', {
                                                'class':            'dialog_dismiss dismiss_button_32x32'
                                            });
                    closeButton.appendTo(header);
                }


                // Activity
                if(size === 'large') {
                    var header_cell     =   $('<div></div>', {
                                                'class':        'card_activity dark_bg'
                                            });
                    header_cell.appendTo(card);

                    var activity_label;
                    activity_label      =   $('<label></label>', {
                                                'class':            'user_activity_label',
                                                'for':              'cards_' + instanceId + '_activity'
                                            });
                    // TODO: This should be variable on a per-card basis
                    activity_label.text('Activity:');
                    activity_label.appendTo(header_cell);

                    var activity_input;
                    activity_input      =   $('<input>', {
                                                'type':             'text',
                                                'class':            'activity_entry text_input',
                                                'id':               'cards_' + instanceId + '_activity',
                                                'data-inputname':   'activity'
                                            });

                    if(typeof(this.deckData.cardTypes[cardType].goals) !== 'undefined' && this.deckData.cardTypes[cardType].goals.length) {
                        activity_input.attr('placeholder', this.deckData.cardTypes[cardType].goals);
                    }

                    activity_input.appendTo(header_cell);
                }



                // Body
                var cardBody            =   $('<div></div>', {
                                                'class':    'card_content light_bg'
                                            });
                cardBody.appendTo(card);

                var listElem            =   $('<ul></ul>');
                listElem.appendTo(cardBody);


                // Elements ready for checkboxes being ticked
                var sectionHeader;
                var section;
                var sectionList;

                var itemHeader;
                var itemElem;
                var inputElem;
                var headingIndex;
                var itemIndex;
                var editButton;
                var removeButton;
                for(headingIndex in this.deckData.cardTypes[cardType].details.headings) {
                    if(this.deckData.cardTypes[cardType].details.headings.hasOwnProperty(headingIndex)) {
                        section         =   $('<li></li>');
                        section.appendTo(listElem);

                        /** Edit button */
                        if(size === 'large') {
                            editButton  =   $('<span></span>', {
                                                'class':            'edit_selections',
                                                'data-headingid':   headingIndex
                                            });
                            editButton.text('add items');
                            editButton.appendTo(section);
                        }

                        sectionHeader   =   $('<h4></h4>');
                        sectionHeader.text(this.deckData.cardTypes[cardType].details.headings[headingIndex] + ':');
                        sectionHeader.appendTo(section);

                        sectionList     =   $('<ul></ul>', {
                                                'class':        'group'
                                            });
                        sectionList.appendTo(section);

                        for(itemIndex in this.deckData.cardTypes[cardType].details.items[headingIndex]) {
                            if(this.deckData.cardTypes[cardType].details.items[headingIndex].hasOwnProperty(itemIndex)) {
                                itemElem                =   $('<li></li>', {
                                                            'data-paired_slave':    'cards_' + instanceId + '_paired_' + headingIndex + ':' + itemIndex + '_paired'
                                                        });
                                itemElem.appendTo(sectionList);

                                itemHeader              =   $('<h5></h5>');
                                itemHeader.text(this.deckData.cardTypes[cardType].details.items[headingIndex][itemIndex].title + ':');
                                itemHeader.appendTo(itemElem);

                                var desc    = this.deckData.cardTypes[cardType].details.items[headingIndex][itemIndex].description;
                                if(desc.length) {
                                    var infoElem    =   $('<div></div>', {
                                        'class':            'icon-info'
                                    });
                                    infoElem.appendTo(itemElem);

                                    var tooltipElem =   $('<div></div>', {
                                        'class':            'card_tooltip'
                                    });
                                    tooltipElem.text(desc);
                                    tooltipElem.appendTo(infoElem);
                                }

                                if(size === 'medium') {
                                    inputElem               =   $('<div></div>', {
                                                                    'class':                'text_input',
                                                                    'data-inputname':       'paired_' + headingIndex + ':' + itemIndex + '_comment'
                                                                });
                                    inputElem.appendTo(itemElem);
                                }

                                else if(size === 'large') {
                                    var inputCont   =   $('<div></div>', {
                                        'class'     : 'input_container'
                                    });
                                    inputCont.appendTo(itemElem);

                                    inputElem               =   $('<input>', {
                                                                    'type':                 'text',
                                                                    'class':                'text_input',
                                                                    'data-inputname':       'paired_' + headingIndex + ':' + itemIndex + '_comment'
                                                                });
                                    inputElem.appendTo(inputCont);
                                }

                                if(size === 'large') {
                                    removeButton        =   $('<div></div>', {
                                        'class':                'remove remove_button_32x32',
                                        'data-paired_master':   'cards_' + instanceId + '_paired_' + headingIndex + ':' + itemIndex + '_paired',
                                        'data-inputname':       'paired_' + headingIndex + ':' + itemIndex
                                    });
                                    removeButton.appendTo(itemElem);
                                }

                                itemElem.css('display', 'none');
                            }
                        }

                        // Nothing checked
                        itemElem        =   $('<li></li>', {
                                                'class':    'no_items'
                                            });
                        itemElem.text('No items selected.');
                        itemElem.appendTo(sectionList);

                        var hrElem          =   $('<hr>');
                        hrElem.appendTo(section);
                    }
                }


                card.appendTo(cell);

                return card;
            };


            SelectablePromptTemplate.prototype.getExtraFields = function(cardType) {
                'use strict';

                var extraFields         = {
                    'activity':     ''
                };

                for(var headingIndex in this.deckData.cardTypes[cardType].details.headings) {
                    if(this.deckData.cardTypes[cardType].details.headings.hasOwnProperty(headingIndex)) {

                        for(var itemIndex in this.deckData.cardTypes[cardType].details.items[headingIndex]) {
                            if(this.deckData.cardTypes[cardType].details.items[headingIndex].hasOwnProperty(itemIndex)) {
                                extraFields['paired_' + headingIndex + ':' + itemIndex]                 = '';
                                extraFields['paired_' + headingIndex + ':' + itemIndex + '_comment']    = '';
                            }
                        }
                    }
                }

                return extraFields;
            };


            SelectablePromptTemplate.prototype.addEvents = function(cardElem) {
                'use strict';

                canvasStorage.addChangeEvents(cardElem);
            };


            SelectablePromptTemplate.prototype.removeEvents = function(cardElem) {
                'use strict';

                canvasStorage.removeChangeEvents(cardElem);
            };


            SelectablePromptTemplate.prototype.postPropagate = function(cardElem) {
                'use strict';

                // Empty
            };


            SelectablePromptTemplate.prototype.createCardIcons = function() {
                'use strict';

                var elements    = [];

                var mouseEnter  = function(event) {
                    $(event.target).removeClass('light_bg');
                    $(event.target).addClass('dark_bg');
                };

                var mouseLeave  = function(event) {
                    $(event.target).removeClass('dark_bg');
                    $(event.target).addClass('light_bg');
                };

                for(var cardType in this.deckData.cardTypes) {
                    if(this.deckData.cardTypes.hasOwnProperty(cardType)) {
                        var span    =   $('<span></span>', {
                                            'class':            'light_bg',
                                            'data-carddeck':    this.deckName,
                                            'data-cardtype':    cardType,
                                            'data-cardsize':    'preview',
                                            'data-template':    'selectable_prompts'
                                        });

                        span.text(this.deckData.cardTypes[cardType].title);

                        span
                            .off('mouseenter')
                            .on('mouseenter', mouseEnter)
                            .off('mouseleave')
                            .on('mouseleave', mouseLeave);

                        elements.push(span);
                    }
                }

                return elements;
            };



            SelectablePromptTemplate.prototype.createDeckIcon = function() {
                'use strict';

                return  $('<span></span>', {
                    'data-prefix':      'decks',
                    'data-carddeck':    this.deckName,
                    'data-cardsize':    'small',
                    'data-template':    'selectable_prompts'
                });
            };




            SelectablePromptTemplate.prototype.createHintCard = function(cardType) {
                'use strict';

                var card        =   $('<div></div>', {
                    'data-carddeck':    this.deckName,
                    'data-cardtype':    cardType,
                    'data-cardsize':    'medium',
                    'data-template':    'selectable_prompts',
                    'class':            'hint'
                });

                var title       =   $('<div></div>', {
                    'class':            'title dark_bg'
                });
                title.text(this.deckData.cardTypes[cardType].title);
                title.appendTo(card);

                var description =   $('<div></div>', {
                    'class':            'description light_bg'
                });
                description.text(this.deckData.cardTypes[cardType].description);
                description.appendTo(card);

                return card;
            };


            SelectablePromptTemplate.prototype.createHintDeck = function() {
                'use strict';

                var card        =   $('<div></div>', {
                    'class':            'deck_hint',
                    'data-carddeck':    this.deckName,
                    'data-cardsize':    'medium',
                    'data-template':    'selectable_prompts'
                });


                var title       =   $('<div></div>', {
                    'class':            'title dark_bg'
                });
                title.text(this.deckData.deck.title);
                title.appendTo(card);

                var description =   $('<div></div>', {
                    'class':            'description light_bg'
                });
                description.text(this.deckData.deck.description);
                description.appendTo(card);

                return card;
            };



            SelectablePromptTemplate.prototype.getIcon = function(cardType, size) {
                'use strict';

                var element =   $('<div></div>', {
                    'class':        'card_icon'
                });

                if(size === 'medium') {
                    element.addClass('icon_32x32');
                }
                else if(size === 'large') {
                    element.addClass('icon_48x48');
                }

                return element;
            };

            return SelectablePromptTemplate;
    }
);