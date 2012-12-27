/*jshint jquery:true */


define(
    [],
    function() {
		'use strict';

        function clearData() {
            $(window).trigger('widget:deck:model:remove_all');
            $(window).trigger('widget:container:model:remove_all');
            $(window).trigger('widget:field:model:remove_all');
            $(window).trigger('widget:card:model:remove_all');
            $(window).trigger('widget:connection:model:remove_all');
        }


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