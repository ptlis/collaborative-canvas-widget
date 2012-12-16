
(function($){
    'use strict';
    
    var maxFileSize     = '10000000';   // Imgur max upload size is 10Mb
    
    $.fn.imgurUpload = function(options) {
        if(typeof options === 'string' && options === 'destroy') {
            this[0].removeEventListener('drop', dropHandler);
            return;
        }
        
        if(options.apiKey === undefined) {
            $.error('Missing required option "apiKey"');
        }
        
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
            'uploadError':      function(errMsg) {
                if(typeof window.console !== 'undefiend') {
                    console.log('request failed "' + errMsg + '"');
                }
                else {
                    alert('request failed "' + errMsg + '"');
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
            'dndError':         function(errMsg) {
                if(typeof window.console !== 'undefiend') {
                    console.log('drop failed "' + errMsg + '"');
                }
                else {
                    alert('drop failed "' + errMsg + '"');
                }
            }
        }, options);
        
        var fileReadComplete    = function(event) {
            var httpParams      = {};
            httpParams.image    = event.target.result.split(',')[1];
            httpParams.key      = settings.apiKey;
            httpParams.type     = 'base64';

            $.ajax({
                url:        'https://api.imgur.com/2/upload.json',
                type:       'POST',
                data:       httpParams,
                dataType:   'json',

                beforeSend : function() {                
                    settings.beforeSend();
                },

                success : function(data, textStatus, jqXHR) {
                    settings.uploadSuccess(data);
                },

                error : function(jqXHR, textStatus, errorThrown) {
                    settings.uploadError(errorThrown);
                }
            });
        };
        
        var dropHandler = function(event) {

            if(event.dataTransfer.files.length > 0) {
                for(var i = 0; i < event.dataTransfer.files.length; i++) {
                    if(event.dataTransfer.files[i].size > maxFileSize) {
                        settings.dndError('Max filesize of 10Mb exceeded.');
                    }
                    
                    else {
                        var reader              = new FileReader();
                        reader.index            = i;
                        reader.file             = event.dataTransfer.files[i];

                        switch(reader.file.type) {
                            case 'image/jpeg':
                            case 'image/jpg':
                            case 'image/png':
                            case 'image/gif':
                                $(reader)
                                    .off('loadend')
                                    .on('loadend', fileReadComplete);
                                reader.readAsDataURL(event.dataTransfer.files[i]);
                                break;

                            default:
                                settings.dndError('Unsupported file type: supported types are JPEG, GIF or PNG.');
                                break;
                        }
                    }
                }
            }

            event.preventDefault();
        };

        this[0].addEventListener('drop', dropHandler);
        
        return this;
    };
})(jQuery);