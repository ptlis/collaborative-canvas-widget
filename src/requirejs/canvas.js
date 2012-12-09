/*jshint jquery:true */

/*  Functionality that is required for the whole canvas. */
define( ['jquery'],
        function($) {
            'use strict';

            var canvas    = {};
            
            
            /* Generate a unique identifier. */
            canvas.uidGenerator = function() {
                var S4 = function() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                };
                return 'id' + (S4()+S4());
            };
            
            
            // Run test to see if the window is large enough to display dialogs
            // correctly.
            canvas.dimensionsCheck = function() {
                var minWidth    = 800;
                var minHeight   = 650;
    
                var messageElem = $('#fullscreen_background');
    
                if($(document).width() < minWidth || $(document).height() < minHeight) {
                    if(messageElem.length < 1) {
    
                        var dialogBg            =   $('<div></div>', {
                                                        'class':        'dialog_background',
                                                        'id':           'fullscreen_background'
                                                    });
                        dialogBg.appendTo($('body'));
    
                        var container           =   $('<div></div>', {
                                                        'class':        'dialog_container'
                                                    });
                        container.appendTo(dialogBg);
    
                        var dialog              =   $('<div></div>', {
                                                        'class':        'dialog'
                                                    });
                        dialog.appendTo(container);
    
                        if(typeof(ROLE) !== 'undefined' && ROLE === true) {
                            dialog.text('This widget is best used maximised.');
                        }
                        else {
                            dialog.text('This widget is best used with a large browser window.');
                        }
    
                    }
    
                    else {
    
                        // TODO: look for existing bg
                    }
                }
    
                else {
                    if(messageElem.length > 0) {
                        messageElem.fadeOut(
                            250,
                            function() {
                                messageElem.remove();
                        });
                    }
                }
            };
            
            return canvas;
        }
);