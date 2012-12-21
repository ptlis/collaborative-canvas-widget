
(function($){
    'use strict';

    var maxFileSize     = '10000000';   // Imgur max upload size is 10Mb

    $.fn.imgurUpload = function(options) {

        var dropElem    = this;

        if(typeof options === 'string' && options === 'destroy') {
            this
                .off('dragenter.imgurUpload')
                .off('dragover.imgurUpload')
                .off('dragleave.imgurUpload')
                .off('drop.imgurUpload');
            return;
        }


        if(options.apiKey === undefined) {
            $.error('Missing required option "apiKey"');
        }


        // Default handlers (useful when testing)
        var settings    = $.extend({
            'beforeSend':       function() {},
            'uploadSuccess':    function(response) {
                if(typeof window.console !== 'undefiend') {
                    console.log('request successful');
                }
                else {
                    alert('request successful');
                }
            },
            'dndSuccess':       function(filesData) {
                if(typeof window.console !== 'undefiend') {
                    console.log('drop successful');
                }
                else {
                    alert('drop successful');
                }
            },
            'error':            function(errMsg) {
                if(typeof window.console !== 'undefiend') {
                    console.log('error: "' + errMsg + '"');
                }
                else {
                    alert('error: "' + errMsg + '"');
                }
            }
        }, options);


        var fileReadComplete    = function(event) {
            $('<img>')
                .on('load', function(event) {
                    var image   = $(event.target);
                    var width   = image.width();
                    var height  = image.height();

                    // Validate width & height
                    if(typeof settings.maxWidth !== 'undefined' && width > settings.maxWidth) {
                        settings.error(dropElem, 'Image width is ' + width + 'px, which exceeds the maximum width of ' + settings.maxWidth + 'px');
                    }

                    else if(typeof settings.maxHeight !== 'undefined' && height > settings.maxHeight) {
                        settings.error(dropElem, 'Image height is ' + height + 'px, which exceeds the maximum height of ' + settings.maxHeight + 'px');
                    }

                    else if(typeof settings.exactWidth !== 'undefined' && width !== settings.exactWidth) {
                        settings.error(dropElem, 'Image width is ' + width + 'px, the image width must be ' + settings.exactWidth + 'px');
                    }

                    else if(typeof settings.exactHeight !== 'undefined' && height !== settings.exactHeight) {
                        settings.error(dropElem, 'Image height is ' + height + 'px, the image height must be ' + settings.exactHeight + 'px');
                    }

                    else {
                        var httpParams      = {};
                        httpParams.image    = image.attr('src').split(',')[1];
                        httpParams.key      = settings.apiKey;
                        httpParams.type     = 'base64';

                        $.ajax({
                            url:        'https://api.imgur.com/2/upload.json',
                            type:       'POST',
                            data:       httpParams,
                            dataType:   'json',

                            beforeSend : function() {
                                settings.beforeSend(dropElem);
                            },

                            success : function(data, textStatus, jqXHR) {
                                settings.uploadSuccess(dropElem, data);
                            },

                            error : function(jqXHR, textStatus, errorThrown) {
                                settings.error(dropElem, 'Upload Errror: "' + errorThrown + '"');
                            }
                        });
                    }

                    image.remove();
                })
                .attr('src', event.target.result)
                .css('display', 'none')
                .appendTo('body');
        };

        var dropHandler = function(event) {
            event.preventDefault();
            event.stopPropagation();

            if(event.originalEvent.dataTransfer.files.length > 0) {
                for(var i = 0; i < event.originalEvent.dataTransfer.files.length; i++) {
                    if(event.originalEvent.dataTransfer.files[i].size > maxFileSize) {
                        settings.error('Max filesize of 10Mb exceeded.');
                    }

                    else {
                        var reader              = new FileReader();
                        reader.index            = i;
                        reader.file             = event.originalEvent.dataTransfer.files[i];

                        switch(reader.file.type) {
                            case 'image/jpeg':
                            case 'image/jpg':
                            case 'image/png':
                            case 'image/gif':
                                $(reader)
                                    .off('loadend')
                                    .on('loadend', fileReadComplete);
                                reader.readAsDataURL(event.originalEvent.dataTransfer.files[i]);
                                break;

                            default:
                                settings.error('Unsupported file type: supported types are JPEG, GIF or PNG.');
                                break;
                        }
                    }
                }
            }
        };

        this
            .off('dragenter.imgurUpload')
            .on('dragenter.imgurUpload', function(event) {
                event.preventDefault();
                event.stopPropagation();
                if(typeof settings.dragEnter !== 'undefined') {
                    settings.dragEnter(dropElem);
                }
            })
            .off('dragover.imgurUpload')
            .on('dragover.imgurUpload', function(event) {
                event.preventDefault();
                event.stopPropagation();
                if(typeof settings.dragOver !== 'undefined') {
                    settings.dragOver(dropElem);
                }
            })
            .off('dragleave.imgurUpload')
            .on('dragleave.imgurUpload', function(event) {
                event.preventDefault();
                event.stopPropagation();
                if(typeof settings.dragLeave !== 'undefined') {
                    settings.dragLeave(dropElem);
                }
            })
            .off('drop.imgurUpload')
            .on('drop.imgurUpload', dropHandler);

        return this;
    };
})(jQuery);
