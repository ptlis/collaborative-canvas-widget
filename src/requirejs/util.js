/*jshint jquery:true */


define(
    ['jquery'],
    function($) {
		'use strict';

        var util    = {};

        /* Imgur API key used for image cards as well as deck and card customisation. */
        util.imgurApiKey    = '2c4844024aa5812e18679fbae4350877';


        /* Generate a unique identifier. */
        util.uidGenerator = function() {
            var S4 = function() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            };
            return 'id' + (S4()+S4());
        };


        /*  Closure that creates a collector that executes the provided callback
            when the required number of calls have been made. */
        util.collector    = function(expectedCount, completeCallback, progressCallback) {
            var receivedCount   = 0;
            return function() {
                receivedCount   += 1;
                if(progressCallback) {
                    progressCallback(receivedCount, expectedCount);
                }
                if(receivedCount === expectedCount) {
                    completeCallback();
                }
            };
        };


        /* Standard method to transition between two dialogs. */
        util.dialogTransition = function(newDialog) {
            // Transition between dialogs
            var oldDialog  = $('.dialog');
            var bgElem;

            if(oldDialog.length) {
                bgElem      = $('.dialog_background');
                oldDialog.fadeOut(  250,
                    function() {
                        oldDialog.remove();
                        newDialog.appendTo('.dialog_container');
                        newDialog.fadeIn( 250);
                    });
            }

            else {
                // Background & dialog
                bgElem                  =   $('<div></div>',  {
                                            'class':       'dialog_background'
                                        });
                bgElem.css('display', 'none');
                bgElem.appendTo($('body'));

                var dialogCont      =   $('<div></div>', {
                                            'class':       'dialog_container'
                                        });
                dialogCont.appendTo(bgElem);
                newDialog.appendTo(dialogCont);

                bgElem.fadeIn(  250,
                    function() {
                    });
            }
        };


        util.dialogDismiss = function() {
            var bgElem  = $('.dialog_background');
            bgElem.fadeOut( 250,
                function() {
                    bgElem.remove();
                });
        };



        return util;
    }
);