/*jshint jquery:true */

/*  Functionality that is required for the whole canvas. */
define(
    ['jquery', 'canvasStorage', 'decks'],
    function($, canvasStorage, decks) {
        'use strict';

        var canvas    = {};
        
        
        canvas.init = function() {
            $('.zoom_in')
                .off(   'mouseenter').on(   'mouseenter',       decks.handlers.bar.tooltipShow)
                .off(   'mouseleave').on(   'mouseleave',       decks.handlers.bar.tooltipHide);
    
            // Zooming out
            $('.zoom_out')
                .off(   'mouseenter').on(   'mouseenter',       decks.handlers.bar.tooltipShow)
                .off(   'mouseleave').on(   'mouseleave',       decks.handlers.bar.tooltipHide);
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
        
        

        
        // Hide the loading animation
        canvas.hideLoadingDialog = function() {                
            if(canvasStorage.runningVersion === null) {

                $('#loading_dialog').fadeOut(
                    250,
                    function() {
                        canvasStorage.firstRunFunc();
                        $('#loading_dialog').remove();
                    }
                );
            }

            else {
                $('#loading_background').fadeOut(
                    250,
                    function() {
                        $('#loading_background').remove();

                        canvas.dimensionsCheck();
                    }
                );
            }
        };
        
        canvas.init();
        
        return canvas;
    }
);