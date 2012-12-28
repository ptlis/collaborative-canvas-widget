/*jshint jquery:true */


define( ['jquery', 'decks', 'canvasStorage', 'util'],
        function($, decks, canvasStorage, util) {
            'use strict';

            var multimedia = {

                /* Does the browser support the files api? */
                filesSupport    : false,

                createCard      : function(cardType, instanceId, size, cell) {
                    multimedia.filesSupport = (function(undefined) {
                        return $('<input type="file">')
                            .get(0)
                            .files !== undefined;
                    })();

                    // Invalid size provided
                    if(typeof(size) === 'undefined' || (size !== 'medium' && size !== 'large')) {
                        throw 'Invalid card size provided';
                    }


                    var card                =   $('<div></div>', {
                                                    'data-carddeck':    'multimedia',
                                                    'data-prefix':      'card',
                                                    'data-cardtype':    cardType,
                                                    'data-cardsize':    size,
                                                    'data-instanceid':  instanceId
                                                });


                    /* Image container */
                    if(cardType === 'image') {

                        if(size === 'medium') {
                            var menuButton      =   $('<div></div>', {
                                'class':            'menu_icon menu_button_32x32'
                            });
                            menuButton.appendTo(card);
                        }
                        else if(size === 'large') {
                            var closeButton     =   $('<div></div>', {
                                'class':            'dialog_dismiss dismiss_button_32x32'
                            });
                            closeButton.appendTo(card);
                        }

                        var imgCont         =   $('<div></div>', {
                                                    'class':            'image_block'
                                                });
                        imgCont.appendTo(card);

                        var imgElem         =   $('<img>', {
                                                    'data-inputname':   'image',
                                                    'class':            'user_image'
                                                });
                        imgElem.css('display',      'block');
                        imgElem.css('visibility',   'hidden');

                        imgElem.appendTo(imgCont);

                        var msgCont         =   $('<div></div>', {
                                                    'class':    'message_container'
                                                });
                        msgCont.appendTo(imgCont);

                        if(size === 'large') {

                            var pElem       =   $('<p></p>', {
                                'class':    'drop_message'
                            });
                            pElem.appendTo(msgCont);


                            if(multimedia.filesSupport) {
                                pElem.text('drag and drop image here');
                            }

                            // No fallback for IE because of lack of support for cross-domain ajax & iframe failings
                            else {
                                pElem.text('Your browser does not support this feature.');
                            }
                        }

                        /*  User-defined caption for the image */
                        var imageCaption;
                        if(size === 'large') {
                            imageCaption    =   $('<input>', {
                                                    'type':             'text',
                                                    'data-inputname':   'caption',
                                                    'class':            'image_caption text_input',
                                                    'placeholder':      'image caption...'
                                                });
                        }
                        else if(size === 'medium') {
                            imageCaption    =   $('<div></div>', {
                                                    'data-inputname':   'caption',
                                                    'class':            'image_caption'});
                        }
                        imageCaption.appendTo(card);
                    }

                    else if(cardType === 'widget') {
                        var title           =   $('<div></div>', {
                            'class':            'card_header'
                        });
                        title.appendTo(card);

                        var iconImg                 = this.getIcon(cardType, size);
                        iconImg.appendTo(title);


                        if(size === 'large') {
                            var closeButton     =   $('<div></div>', {
                                'class':            'dialog_dismiss dismiss_button_32x32'
                            });
                            closeButton.appendTo(title);

                            var titleLabel      =   $('<label></label>', {
                                                        'for':              + 'title_entry'
                                                    });
                            titleLabel.text('Caption:');
                            titleLabel.appendTo(title);

                            var titleEntry      =   $('<input>', {
                                                        'type':             'text',
                                                        'id':               'title_entry',
                                                        'class':            'text_input',
                                                        'data-inputname':   'widget_title'
                                                    });
                            titleEntry.appendTo(title);
                        }

                        else if(size === 'medium') {
                            var menuButton      =   $('<div></div>', {
                                'class':            'menu_icon menu_button_32x32'
                            });
                            menuButton.appendTo(title);

                            var titleElem       =   $('<h3></h3>', {
                                                        'class':            'header',
                                                        'data-inputname':   'widget_title'
                                                });
                            titleElem.appendTo(title);
                        }

                        var rawURLEntry;
                        if(size === 'large') {
                            var EmbedContainer  =   $('<div>', {
                                                        'id':               'embed_container'
                                                    });
                            EmbedContainer.appendTo(card);

                            var rawURLLabel     =   $('<label></label>', {
                                                        'for':              'raw_entry'
                                                    });
                            rawURLLabel.text('iTEC Embed Code:');
                            rawURLLabel.appendTo(EmbedContainer);

                            var getWidgetButton =   $('<input>', {
                                                        'type':             'button',
                                                        'class':            'add_button_32x32',
                                                        'id':               'get_widget'
                                                    });
                            getWidgetButton.appendTo(EmbedContainer);

                            rawURLEntry         =   $('<input>', {
                                                        'type':             'text',
                                                        'id':               'raw_entry',
                                                        'class':            'text_input',
                                                        'data-inputname':   'embed_code'
                                                    });
                            rawURLEntry.appendTo(EmbedContainer);

                            var iframe              =   $('<iframe></iframe>', {
                                'frameborder':      '0'
                            });
                            iframe.appendTo(card);
                            iframe.attr('width',    '620');
                            iframe.attr('height',   '340');
                        }

                        else if(size === 'medium') {
                            rawURLEntry         =   $('<input>', {
                                                        'type':             'hidden',
                                                        'id':               'raw_entry',
                                                        'data-inputname':   'embed_code'
                                                    });
                            rawURLEntry.appendTo(card);

                            var content         =   $('<div></div>', {
                                                        'class':            'card_content'
                                                    });

                            content.appendTo(card);

                            var playButton      =   $('<div></div>', {
                                                        'class':            'play_button'
                                                    });

                            playButton.appendTo(content);
                        }

                    }

                    else if(cardType === 'youtube' || cardType === 'vimeo') {
                        var title           =   $('<div></div>', {
                                                    'class':            'card_header'
                                                });
                        title.appendTo(card);

                        var iconImg                 = this.getIcon(cardType, size);
                        iconImg.appendTo(title);


                        if(size === 'large') {
                            var closeButton     =   $('<div></div>', {
                                'class':            'dialog_dismiss dismiss_button_32x32'
                            });
                            closeButton.appendTo(title);

                            var titleLabel      =   $('<label></label>', {
                                                        'for':              + 'title_entry'
                                                    });
                            titleLabel.text('Caption:');
                            titleLabel.appendTo(title);

                            var titleEntry      =   $('<input>', {
                                                        'type':             'text',
                                                        'id':               'title_entry',
                                                        'class':            'text_input',
                                                        'data-inputname':   'video_title'
                                                    });
                            titleEntry.appendTo(title);
                        }

                        else if(size === 'medium') {
                            var menuButton      =   $('<div></div>', {
                                'class':            'menu_icon menu_button_32x32'
                            });
                            menuButton.appendTo(title);

                            var titleElem       =   $('<h3></h3>', {
                                                        'class':            'header',
                                                        'data-inputname':   'video_title'
                                                });
                            titleElem.appendTo(title);
                        }

                        var rawURLEntry;
                        if(size === 'large') {
                            var URLContainer    =   $('<div>', {
                                                        'id':               'url_container'
                                                    });
                            URLContainer.appendTo(card);

                            var rawURLLabel     =   $('<label></label>', {
                                                        'for':              'raw_entry'
                                                    });
                            if(cardType === 'youtube') {
                                rawURLLabel.text('Youtube URL:');
                            }
                            else if(cardType === 'vimeo') {
                                rawURLLabel.text('Vimeo URL:');
                            }
                            rawURLLabel.appendTo(URLContainer);

                            var getVideoButton  =   $('<input>', {
                                                        'type':             'button',
                                                        'class':            'add_button_32x32',
                                                        'id':               'get_video'
                                                    });
                            getVideoButton.appendTo(URLContainer);

                            rawURLEntry         =   $('<input>', {
                                                        'type':             'text',
                                                        'id':               'raw_entry',
                                                        'class':            'text_input',
                                                        'data-inputname':   'video_url'
                                                    });
                            rawURLEntry.appendTo(URLContainer);

                            var iframe              =   $('<iframe></iframe>', {
                                'frameborder':      '0'
                            });
                            iframe.appendTo(card);
                            iframe.attr('width',    '620');
                            iframe.attr('height',   '340');
                        }

                        else if(size === 'medium') {
                            rawURLEntry         =   $('<input>', {
                                                        'type':             'hidden',
                                                        'id':               'raw_entry',
                                                        'data-inputname':   'video_url'
                                                    });
                            rawURLEntry.appendTo(card);

                            var content         =   $('<div></div>', {
                                                        'class':            'card_content'
                                                    });

                            content.appendTo(card);

                            var playButton      =   $('<div></div>', {
                                                        'class':            'play_button'
                                                    });

                            playButton.appendTo(content);
                        }
                    }

                    card.appendTo(cell);

                    return card;
                },


                getExtraFields : function(cardType) {
                    var extraFields         = {};

                    if(cardType === 'youtube' || cardType === 'vimeo') {
                        extraFields.video_title = '';
                        extraFields.video_url   = '';
                    }

                    else if(cardType === 'image') {
                        extraFields.image       = '';
                        extraFields.caption     = '';
                    }

                    else if(cardType === 'widget') {
                        extraFields.widget_title    = '';
                        extraFields.embed_code      = '';
                    }

                    return extraFields;
                },


                addEvents : function(cardElem) {
                    multimedia.removeEvents(cardElem);

                    var size        = $(cardElem).data('cardsize');
                    var cardType    = $(cardElem).data('cardtype');

                    if(cardType === 'image' && size === 'large' && multimedia.filesSupport) {
                        this.addImageDropEvents(cardElem);
                    }

                    else if(cardType === 'youtube') {
                        this.addYoutubeEvents(cardElem, size);
                    }

                    else if(cardType === 'vimeo') {
                        this.addVimeoEvents(cardElem, size);
                    }

                    else if(cardType === 'widget') {
                        this.addWidgetEvents(cardElem, size);
                    }

                    canvasStorage.addChangeEvents(cardElem);
                },


                removeEvents : function(cardElem) {
                    var size        = $(cardElem).data('cardsize');
                    var cardType    = $(cardElem).data('cardtype');

                    if(cardType === 'image' && size === 'large' && multimedia.filesSupport) {
                        cardElem.find('.image_block').imgurUpload('destroy');
                    }

                    else if(cardType === 'youtube' || cardType === 'vimeo') {
                        cardElem.find('#get_video').off('click');
                        cardElem.find('.play_button').off('click').addClass('no_video');
                    }

                    else if(cardType === 'widget') {
                        cardElem.find('#get_widget').off('click');
                        cardElem.find('.play_button').off('click').addClass('no_widget');
                    }

                    canvasStorage.removeChangeEvents(cardElem);
                },


                postPropagate : function(cardElem) {
                    var cardType    = cardElem.data('cardtype');
                    var size        = cardElem.data('cardsize');
                    var playButton  = cardElem.find('.play_button');
                    var URL         = null;
                    var videoId     = null;

                    if(cardType === 'youtube') {

                        if(size === 'large') {
                            $('#get_video').click();
                        }

                        else if(size === 'medium') {

                            URL             = cardElem.find('#raw_entry').val();

                            // Try regular URL
                            videoId         = multimedia.getParameterByName(URL, 'v');

                            // Try embed URL
                            if(videoId === null || videoId.length < 1) {
                                var result  = URL.match(/http:\/\/(www\.)?youtu.be\/([a-z0-9A-Z]+)($|\/)/);
                                if(result !== null && result.length > 1) {
                                    videoId = result[2];
                                }
                            }

                            if(videoId) {
                                playButton.removeClass('no_video');
                            }
                            else {
                                playButton.addClass('no_video');
                            }
                        }
                    }

                    else if(cardType === 'vimeo') {
                        if(size === 'large') {
                            $('#get_video').click();
                        }

                        else if(size === 'medium') {
                            URL         = cardElem.find('#raw_entry').val();

                            var result  = URL.match(/http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);

                            if(result !== null && result.length > 1) {
                                videoId = result[2];
                            }

                            if(videoId) {
                                playButton.removeClass('no_video');
                            }
                            else {
                                playButton.addClass('no_video');
                            }
                        }
                    }

                    else if(cardType === 'image') {

                        var imgElem = $(cardElem).find('.user_image');

                        if(size === 'large' && imgElem.attr('src')) {
                            cardElem.find('.drop_message').remove();
                        }

                        // Resize / position image appropriate when possible
                        if(imgElem.attr('src')) {

                            // Standard function to scale uploaded image
                            var scaleFunc   = function() {
                                var imageScaled     = multimedia.scaledDimensions(imgElem.data('orig_width'), imgElem.data('orig_height'), cardElem.find('.image_block').width(), cardElem.find('.image_block').height());

                                imgElem.attr('width',   imageScaled.width);
                                imgElem.attr('height',  imageScaled.height);

                                imgElem.css('left',     imageScaled.left + 'px');
                                imgElem.css('top',      imageScaled.top + 'px');
                                imgElem.css('visibility',   'visible');
                            };

                            // Function for first image load
                            var loadScaleFunc   = function(event) {
                                imgElem.data('orig_width', imgElem.width());
                                imgElem.data('orig_height', imgElem.height());

                                scaleFunc();
                            };

                            if(imgElem.width() > 0 && imgElem.height() > 0) {
                                scaleFunc();
                            }

                            imgElem
                                .off('load')
                                .on('load', loadScaleFunc);
                        }
                    }

                    else if(cardType === 'widget') {

                        if(size === 'large') {
                            $('#get_widget').click();
                        }

                        else if(size === 'medium') {
                            var htmlFrag    = cardElem.find('#raw_entry').val();

                            var width       = 0;
                            var height      = 0;

                            if(htmlFrag.length) {
                                URL         = $(htmlFrag).attr('src');
                                width       = $(htmlFrag).attr('width');
                                height      = $(htmlFrag).attr('height');
                            }

                            if(URL) {
                                playButton.removeClass('no_widget');
                            }
                            else {
                                playButton.addClass('no_widget');
                            }
                        }
                    }
                },



                getIcon : function(cardType, size) {

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
                },


                addWidgetEvents : function(cardElem, size) {
                    var htmlFrag    = cardElem.find('#raw_entry').val();

                    var URL         = null;
                    var width       = 0;
                    var height      = 0;

                    if(size === 'large') {
                        var embedButton = cardElem.find('#get_widget');

                        embedButton.on('click', function() {
                            var iframe  = cardElem.find('iframe');

                            if(htmlFrag.length) {
                                URL         = $(htmlFrag).attr('src');
                                width       = $(htmlFrag).attr('width');
                                height      = $(htmlFrag).attr('height');
                            }

                            if(URL) {
                                // TODO: Handle height & width?
                                iframe.attr('src', URL);
                            }
                        });
                    }

                    else if(size === 'medium') {
                        var playButton  = cardElem.find('.play_button');

                        playButton.on('click', function() {

                            if(htmlFrag.length) {
                                URL         = $(htmlFrag).attr('src');
                                width       = $(htmlFrag).attr('width');
                                height      = $(htmlFrag).attr('height');
                            }

                            if(URL) {
                                var dialogBg            =   $('<div></div>', {
                                                            'id':       'widget_bg',
                                                            'class':    'dialog_background'
                                                        });
                                dialogBg.appendTo($('body'));

                                var selectorContainer   =   $('<div></div>', {
                                                            'class':    'dialog_container'
                                                        });
                                selectorContainer.appendTo(dialogBg);

                                var dialog              =   $('<div></div>', {
                                                                'class':        'dialog'
                                                            });
                                dialog.appendTo(selectorContainer);

                                var videoContainer      =   $('<div></div>', {
                                                                'id':           'widget_container'
                                                            });
                                videoContainer.appendTo(dialog);

                                // Title & Close box
                                var titleElem           =   $('<div></div>', {
                                                                'class':        'dialog_title'
                                                            });
                                titleElem.appendTo(videoContainer);

                                var title   = cardElem.find('.header').text();
                                titleElem.text(title);

                                var dismiss             =   $('<div></div>', {
                                                                'class':    'dialog_dismiss dismiss_button_32x32'
                                                            });
                                dismiss.appendTo(videoContainer);


                                // Widget itself
                                var iframe              =   $('<iframe></iframe>', {
                                                                'frameborder':      '0'
                                                            });
                                iframe.appendTo(videoContainer);
                                iframe.attr('width',    width);
                                iframe.attr('height',   height);
                                iframe.attr('src',      URL);

                                if(height > 340) {
                                    var dialogHeight = dialog.height() + (height - 340);
                                    dialog.css('height', dialogHeight);
                                }

                                if(width > 620) {
                                    var dialogWidth = dialog.width() + (width - 620);
                                    dialog.css('width', dialogWidth);
                                }

                                selectorContainer.css('display', 'none');
                                selectorContainer.fadeIn(   250,
                                                            function() {
                                                        });

                                dismiss
                                    .off('click')
                                    .on('click', function(event) {
                                        dialogBg.fadeOut(  250,
                                            function() {
                                                dialogBg.remove();
                                            });
                                    });
                            }

                        });
                    }
                },


                addYoutubeEvents : function(card, size) {

                    if(size === 'large') {
                        var youtubeButton   = card.find('#get_video');

                        youtubeButton
                            .on('click', function(event) {
                                var URL     = card.find('#raw_entry').val();

                                var iframe  = card.find('iframe');

                                // Try regular youtube URL
                                var videoId = multimedia.getParameterByName(URL, 'v');
                                if(videoId) {
                                    iframe.attr('src', 'http://www.youtube.com/embed/' + videoId + '?autoplay=0');
                                }
                                else {

                                    // Try embed URL
                                    var result  = URL.match(/http:\/\/(www\.)?youtu.be\/([a-z0-9A-Z]+)($|\/)/);
                                    if(result !== null && result.length > 1) {
                                        iframe.attr('src', 'http://www.youtube.com/embed/' + result[2] + '?autoplay=0');
                                    }

                                    else {
                                        iframe.attr('src', '');
                                    }
                                }
                            });
                    }

                    else if(size === 'medium') {
                        var playButton  = card.find('.play_button');

                        playButton
                            .on('click', function(event) {
                                var URL     = card.find('#raw_entry').val();

                                // Try regular URL
                                var videoId = multimedia.getParameterByName(URL, 'v');

                                // Try embed URL
                                if(videoId === null || videoId.length < 1) {
                                    var result  = URL.match(/http:\/\/(www\.)?youtu.be\/([a-z0-9A-Z]+)($|\/)/);
                                    if(result !== null && result.length > 1) {
                                        videoId = result[2];
                                    }
                                }

                                if(videoId) {
                                    var dialogBg    =   $('<div></div>', {
                                        'id':       'video_bg',
                                        'class':    'dialog_background'
                                    });
                                    dialogBg.appendTo($('body'));

                                    var selectorContainer   =   $('<div></div>', {
                                        'class':    'dialog_container'
                                    });
                                    selectorContainer.appendTo(dialogBg);

                                    var innerCont           =   $('<div></div>', {
                                                                    'class':        'dialog'
                                                                });
                                    innerCont.appendTo(selectorContainer);

                                    var videoContainer      =   $('<div></div>', {
                                                                    'id':           'video_container'
                                                                });
                                    videoContainer.appendTo(innerCont);

                                    // Title & Close box

                                    var titleElem           =   $('<div></div>', {
                                                                'class':        'dialog_title'
                                                            });
                                    titleElem.appendTo(videoContainer);

                                    var title   = $(card).find('.header').text();
                                    titleElem.text(title);

                                    var dismiss             =   $('<div></div>', {
                                                                'class':    'dialog_dismiss dismiss_button_32x32'
                                                            });
                                    dismiss.appendTo(videoContainer);


                                    // Video itself
                                    var iframe              =   $('<iframe></iframe>', {
                                                                    'frameborder':      '0'
                                                                });
                                    iframe.appendTo(videoContainer);
                                    iframe.attr('width',    '620');
                                    iframe.attr('height',   '340');
                                    iframe.attr('src', 'http://www.youtube.com/embed/' + videoId + '?autoplay=0');

                                    selectorContainer.css('display', 'none');
                                    selectorContainer.fadeIn(   250,
                                                                function() {
                                                            });

                                    dismiss
                                        .off('click')
                                        .on('click', function(event) {
                                            dialogBg.fadeOut(  250,
                                                function() {
                                                    dialogBg.remove();
                                                });
                                        });
                                }
                            });
                    }
                },


                addVimeoEvents : function(cardElem, size) {

                    if(size === 'large') {
                        var button  = cardElem.find('#get_video');

                        button
                            .off('click')
                            .on('click', function(event) {
                                var URL     = cardElem.find('#raw_entry').val();

                                var result  = URL.match(/http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
                                var videoId;
                                if(result !== null && result.length > 1) {
                                    videoId = result[2];
                                }


                                var iframe  = cardElem.find('iframe');

                                if(videoId) {
                                    iframe.attr('src', 'http://player.vimeo.com/video/' + videoId);
                                }
                                else {
                                    iframe.attr('src', '');
                                }
                            });
                    }

                    else if(size === 'medium') {
                        var playButton  = cardElem.find('.play_button');

                        playButton
                            .off('click')
                            .on('click', function(event) {
                                var URL     = cardElem.find('#raw_entry').val();

                                var result  = URL.match(/http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/);
                                var videoId;
                                if(result !== null && result.length > 1) {
                                    videoId = result[2];
                                }

                                if(videoId) {

                                    var dialogBg          =   $('<div></div>', {
                                        'class':    'dialog_background'
                                    });
                                    dialogBg.appendTo($('body'));

                                    var selectorContainer   =   $('<div></div>', {
                                                                    'id':       'video_bg',
                                                                    'class':    'dialog_container'
                                                                });
                                    selectorContainer.appendTo(dialogBg);

                                    var innerCont           =   $('<div></div>', {
                                                                    'class':        'dialog'
                                                                });
                                    innerCont.appendTo(selectorContainer);

                                    var videoContainer      =   $('<div></div>', {
                                                                    'id':           'video_container'
                                                                });
                                    videoContainer.appendTo(innerCont);

                                    // Title & Close box

                                    var titleElem           =   $('<div></div>', {
                                                                    'class':        'dialog_title'
                                                                });
                                    titleElem.appendTo(videoContainer);

                                    var title   = $(cardElem).find('.header').text();
                                    titleElem.text(title);

                                    var dismiss             =   $('<div></div>', {
                                                                    'class':    'dialog_dismiss dismiss_button_32x32'
                                                                });
                                    dismiss.appendTo(videoContainer);


                                    // Video itself
                                    var iframe              =   $('<iframe></iframe>', {
                                                                    'frameborder':      '0'
                                                                });
                                    iframe.appendTo(videoContainer);
                                    iframe.attr('width',    '620');
                                    iframe.attr('height',   '340');
                                    iframe.attr('src', 'http://player.vimeo.com/video/' + videoId);

                                    selectorContainer.css('display', 'none');
                                    selectorContainer.fadeIn(   250,
                                                                function() {
                                                                });

                                    dismiss
                                        .off('click')
                                        .on('click', function(event) {
                                            dialogBg.fadeOut(  250,
                                                                        function() {
                                                                            dialogBg.remove();
                                                                        });
                                        });

                                }
                            });
                    }
                },


                scaledDimensions : function(oldWidth, oldHeight, maxWidth, maxHeight) {

                    if(oldWidth < 1 || oldHeight < 1 || maxWidth < 1 || maxHeight < 1) {
                        throw 'Invalid image or maximum dimensions provided';
                    }

                    var result  = {};

                    if(oldWidth > maxWidth || oldHeight > maxHeight) {
                        // Height is proportionally larger than $maxDimesnion so calculate scaling factor from this
                        if((oldHeight / maxHeight) > (oldWidth / maxWidth)) {
                            result.width    = Math.floor(oldWidth / (oldHeight / maxHeight));
                            result.height   = maxHeight;
                        }

                        // Width is proportionally larger than $maxDimesnion so calculate scaling factor from this
                        else {
                            result.width    = maxWidth;
                            result.height   = Math.floor(oldHeight / (oldWidth / maxWidth));
                        }
                    }
                    else {
                        result.width    = oldWidth;
                        result.height   = oldHeight;
                    }

                    result.top      = Math.floor((maxHeight - result.height) / 2);
                    result.left     = Math.floor((maxWidth - result.width) / 2);

                    return result;
                },




                addImageDropEvents : function(cardElem) {
                    var imgContainer    = cardElem.find('.image_block');
                    var instanceId      = cardElem.data('instanceid');

                    var beforeSend  = function(dropElem) {
                        var imgElem     =   $('<div></div>', {
                            'class':    'loading_anim'
                        });

                        $('.drop_message').before(imgElem);

                        $('.drop_message').text('Uploading...');
                    };

                    var success     = function(dropElem, data) {
                        var imgElems    = $('[data-instanceid="' + instanceId + '"] [data-inputname="image"]');

                        // Resize / position image appropriate when possible
                        imgElems
                            .off('load')
                            .on('load', function(event) {
                                var contCard        = $(event.target).parents('[data-prefix="card"]');

                                var imageScaled     = multimedia.scaledDimensions($(event.target).width(), $(event.target).height(), contCard.find('.image_block').width(), contCard.find('.image_block').height());

                                $(event.target).attr('width',       imageScaled.width);
                                $(event.target).attr('height',      imageScaled.height);


                                $(event.target).css('left',         imageScaled.left + 'px');
                                $(event.target).css('top',          imageScaled.top + 'px');
                                $(event.target).css('visibility',   'visible');

                                $('.message_container').remove();
                            });

                        imgElems.attr('src', 'http://i.imgur.com/' + data.upload.image.hash + '.png');


                        var extraFields = {
                            'id':           instanceId,
                            'image':        data.upload.image.hash
                        };

                        canvasStorage.list.update('card', extraFields);
                    };

                    var error       = function(dropElem, errorMsg) {
                        $('.loading_anim').remove();
                        $('.drop_message').text('Image upload failed "' + errorMsg);

                        var errorImg                = $('<img>', {
                            'src':      'images/layout/error_face.png',
                            'width':    '32',
                            'height':   '32'
                        });
                        $('.drop_message').before(errorImg);
                    };

                    imgContainer.imgurUpload({
                        'apiKey':           util.imgurApiKey,
                        'beforeSend':       beforeSend,
                        'uploadSuccess':    success,
                        'error':            error
                    });

                },




            /** Creates the HTML elements for the small card icons. */
                createCardIcons : function() {

                    var elements    = [];

                    // Image
                    var span    =   $('<span></span>', {
                                        'data-carddeck':    'multimedia',
                                        'data-cardtype':    'image',
                                        'data-cardsize':    'preview'
                                    });
                    elements.push(span);


                    // Youtube
                    span        =   $('<span></span>', {
                                        'data-carddeck':    'multimedia',
                                        'data-cardtype':    'youtube',
                                        'data-cardsize':    'preview'
                                    });
                    elements.push(span);


                    // Vimeo
                    span        =   $('<span></span>', {
                                        'data-carddeck':    'multimedia',
                                        'data-cardtype':    'vimeo',
                                        'data-cardsize':    'preview'
                                    });
                    elements.push(span);


                    // ITEC Widgets
                    span        =   $('<span></span>', {
                                        'data-carddeck':    'multimedia',
                                        'data-cardtype':    'widget',
                                        'data-cardsize':    'preview'
                                    });
                    elements.push(span);

                    return elements;
                },



                createDeckIcon : function() {
                    return  $('<span></span>', {
                                'data-prefix':      'deck',
                                'data-carddeck':    'multimedia',
                                'data-cardsize':    'small'
                            });
                },




                createHintCard : function(cardType) {
                    var card    =   $('<div></div>', {
                                        'class':            'hint',
                                        'data-carddeck':    'multimedia',
                                        'data-cardtype':    cardType,
                                        'data-cardsize':    'medium'
                                    });

                    var description =   $('<div></div>', {
                        'class':            'description'
                    });
                    description.text(this.card_types[cardType].description);
                    description.appendTo(card);

                    return card;
                },



                createHintDeck : function() {
                    var card    =   $('<div></div>', {
                                        'class':            'deck_hint',
                                        'data-carddeck':    'multimedia',
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



        // Based on http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
                getParameterByName : function(URL, name) {

                    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
                    var regexS = '[\\?&]' + name + '=([^&#]*)';
                    var regex = new RegExp(regexS);
                    var results = regex.exec(URL);
                    if(results === null) {
                        return '';
                    }
                    else {
                        return decodeURIComponent(results[1].replace(/\+/g, ' '));
                    }
                },


                // Deck info
                'deck'          : {
                    'title':        'Multimedia Deck',
                    'description':  'A deck that allows multimedia to be embedded within the canvas.'
                },

                'card_types'    : {
                    'vimeo'     : {
                        'description'       : 'Card that allows for embedding playable vimeo videos.'
                    },

                    'youtube'       : {
                        'description'       : 'Card that allows for embedding playable youtube videos.'
                    },

                    'image'     : {
                        'description'       : 'Card that allows for uploading images to display on the canvas.'
                    },

                    'widget'    : {
                        'description'       : 'Card that allows for embedding of iTEC widgets.'
                    }
                },

                // From http://imgur.com/faq#size
                maxFileSize: 1024 * 1024 * 10
            };

            decks.addHandler('multimedia', multimedia);
        }
);
