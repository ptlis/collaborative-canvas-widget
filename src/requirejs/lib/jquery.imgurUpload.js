
(function($){
    
    $.extend({
        imgurUpload:    function(options) {
            
            if(options.image === undefined) {
                $.error('Missing required option "image"');
            }
            
            if(options.apiKey === undefined) {
                $.error('Missing required option "apiKey"');
            }
            
            var settings    = $.extend({
                'beforeSend':   function() {},
                'success':      function(response) {
                    if(typeof window.console !== 'undefiend') {
                        console.log('request successful');
                    }
                    else {
                        alert('request successful');
                    }
                },
                'error':        function(errMsg) {
                    if(typeof window.console !== 'undefiend') {
                        console.log('request failed "' + errMsg + '"');
                    }
                    else {
                        alert('request failed "' + errMsg + '"');
                    }
                }
            }, options);
            
            
            var httpParams      = {};
            httpParams.image    = options.image;
            httpParams.key      = options.apiKey;
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
                    settings.success(data);
                },

                error : function(jqXHR, textStatus, errorThrown) {
                    settings.error(errorThrown);
                }
            });
            
            return this;
        }
    });
})(jQuery);