/*jshint jquery:true */


/*  Functionality that is required for the whole canvas. */
define(
    ['jquery', 'storage/canvasStorage'],
    function($, canvasStorage) {
        'use strict';

        var canvas      = {};
        canvas.view     = {};


    /*  Whether the files API is supported by the browser. */
        canvas.filesApi             = false;


    /*  Whether the download attribute is supported by the browser. */
        canvas.downloadAttribute    = false;


        canvas.init = function() {
            var testAnchor  = document.createElement('a');
            if(typeof testAnchor.download !== 'undefined') {
                canvas.downloadAttribute    = true;
            }

            if(window.File && window.FileReader && window.FileList && window.Blob) {
                canvas.filesApi             = true;
            }

            var zoomInElem  = $('.zoom_in');
            var zoomOutElem = $('.zoom_out');

            // Zoom out
            zoomInElem
                .off(   'mouseenter').on(   'mouseenter',   function(event) {
                    $(window).trigger('widget:decks:view:tooltip_show', [zoomInElem]);
                })
                .off(   'mouseleave').on(   'mouseleave',   function(event) {
                    $(window).trigger('widget:decks:view:tooltip_hide', [zoomInElem]);
                });

            // Zooming out
            zoomOutElem
            .off(   'mouseenter').on(   'mouseenter',   function(event) {
                $(window).trigger('widget:decks:view:tooltip_show', [zoomOutElem]);
            })
            .off(   'mouseleave').on(   'mouseleave',   function(event) {
                $(window).trigger('widget:decks:view:tooltip_hide', [zoomOutElem]);
            });

            // Event handlers
            $(window)
                .off(   'widget:canvas:view:export_dialog')     .on('widget:canvas:view:export_dialog',     canvas.view.exportDialog)
                .off(   'widget:canvas:view:import_dialog')     .on('widget:canvas:view:import_dialog',     canvas.view.importDialog);
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
            if(canvasStorage.getRunningVersion() === null) {

                $('#loading_dialog').fadeOut(
                    250,
                    function() {
                        canvasStorage.firstRun();
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


    /* View */

        canvas.view.exportDialog = function() {
            var bgElem                  =   $('<div></div>', {
                'class':    'dialog_background'
            });
            bgElem.css('display', 'none');
            bgElem.appendTo($('body'));

            var dialogCont              =   $('<div></div>', {
                'class':    'dialog_container'
            });
            dialogCont.appendTo(bgElem);

            var dialog                  =   $('<div></div>', {
                'id':       'export_container',
                'class':    'dialog'
            });
            dialog.appendTo(dialogCont);

            var closeButton             =   $('<div></div>', {
                'class':    'dialog_dismiss dismiss_button_32x32'
            });
            closeButton.appendTo(dialog);

            var title                   =   $('<div></div>', {
                'class':        'dialog_title'
            });
            title.text('Export Data');
            title.appendTo(dialog);

            // Download file
            var downloadFile            =   $('<div></div>', {
                'class':    'download_file'
            });
            downloadFile.appendTo(dialog);

            var data                    = canvasStorage.exportData();

            // Check for browsers that support the download attribute
            if(canvas.downloadAttribute) {
                $('<p></p>').text('Download as a file').appendTo(downloadFile);

                // 'download' attribute only works in webkit, see here for gecko progress https://bugzilla.mozilla.org/show_bug.cgi?id=676619
                var downloadButton          =   $('<a></a>', {
                    'id':       'download_button',
                    'href':     'data:application/octet-stream;base64,' + $.base64Encode(JSON.stringify(data)),
                    'download': '8lem_data.json'
                });
                downloadButton.text('Download');
                downloadButton.appendTo(downloadFile);
            }
            else {
                var msgElem                 =   $('<div></div>', {
                    'class':    'feature_unsupported'
                });
                msgElem.text('The direct download feature is not supported by your browser.');
                msgElem.appendTo(downloadFile);
            }

            // Copy data
            var copyData            =   $('<div></div>', {
                'class':    'copy_data'
            });
            copyData.appendTo(dialog);

            $('<p></p>').text('Right-click and copy the data below').appendTo(copyData);

            var textContainer       =   $('<textarea></textarea>', {

            });

            textContainer
                .val(JSON.stringify(data))
                .appendTo(copyData)
                .off(   'focus')
                .on(    'focus', function() {
                    textContainer[0].select();
                });


            bgElem.fadeIn(  250,
                function() {
                });

            closeButton
                .off('click')
                .on('click', function(event) {

                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });
        };


        canvas.view.importDialog = function(event) {

            var bgElem                  =   $('<div></div>', {
                'class':    'dialog_background'
            });
            bgElem.css('display', 'none');
            bgElem.appendTo($('body'));

            var dialogCont              =   $('<div></div>', {
                'class':    'dialog_container'
            });
            dialogCont.appendTo(bgElem);

            var dialog                  =   $('<div></div>', {
                'id':       'import_container',
                'class':    'dialog'
            });
            dialog.appendTo(dialogCont);

            var closeButton             =   $('<div></div>', {
                'class':    'dialog_dismiss dismiss_button_32x32'
            });
            closeButton.appendTo(dialog);

            var title                   =   $('<div></div>', {
                'class':    'dialog_title'
            });
            title.text('Import Data');
            title.appendTo(dialog);

            var uploadFile              =   $('<div></div>', {
                'class':    'upload_file'
            });
            uploadFile.appendTo(dialog);


            // Check for browsers that support the download attribute
            if(canvas.filesApi) {
                var uploadForm          =   $('<form></form>', {

                });
                uploadForm.appendTo(uploadFile);

                var label               =   $('<label></label>', {
                    'for':          'file_upload'
                });
                label.text('Upload');
                label.appendTo(uploadForm);

                var uploadElem          =   $('<input>', {
                    'type':         'file',
                    'id':           'file_upload',
                    'enctype':      'multipart/form-data'
                });
                uploadElem.appendTo(uploadForm);

                uploadElem
                    .off(   'change')
                    .on(    'change', function(event) {
                        var files   = event.target.files;

                        if(files.length > 0) {
                            var reader  = new FileReader();

                            $(reader)
                                .off(   'load')
                                .on(    'load', function(event) {
                                    var rawData         = event.target.result;
                                    var processedData;
                                    var split           = rawData.split(',');

                                    if(split.length > 1) {

                                        try {
                                            processedData   = $.parseJSON($.base64Decode(split[split.length - 1]));

                                            if(confirm('Are you sure you with to import data? Doing so clears existing data.')) {

                                                try {
                                                    canvasStorage.clear();

                                                    canvasStorage.importData(processedData);

                                                    bgElem.fadeOut( 250,
                                                        function() {
                                                            bgElem.remove();
                                                        });
                                                }
                                                catch(error) {
                                                    alert(error);
                                                }
                                            }
                                        }
                                        catch(error) {
                                            alert('Invalid filetype provided (2) ' + error);
                                        }
                                    }
                                    else {
                                        alert('Invalid filetype provided (1)');
                                    }
                                });

                            reader.readAsDataURL(files[0]);
                        }
                    });
            }

            else {
                var msgElem                 =   $('<div></div>', {
                    'class':    'feature_unsupported'
                });
                msgElem.text('The direct upload feature is not supported by your browser.');
                msgElem.appendTo(uploadFile);
            }

            // Paste data
            var pasteData           =   $('<div></div>', {
                'class':    'paste_data'
            });
            pasteData.text('Paste Data');
            pasteData.appendTo(dialog);


            bgElem.fadeIn(  250,
                function() {
                });

            closeButton
                .off(   'click')
                .on(    'click', function(event) {
                    bgElem.fadeOut( 250,
                        function() {
                            bgElem.remove();
                        });
                });
        };

        canvas.init();

        return canvas;
    }
);
