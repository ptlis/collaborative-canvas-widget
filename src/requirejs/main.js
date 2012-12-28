/*jshint jquery:true */


requirejs.config({
    shim: {
        'jquery.base64': {
            'deps':	    ['jquery']
        },

        'jquery.ui': {
            'deps':     ['jquery']
        },

        'jquery.contextMenu': {
            'deps':     ['jquery'],
            'exports':  'jquery.fn.contextMenu'
        },

        'jquery.colorpicker': {
            'deps':     ['jquery'],
            'exports':  'jquery.fn.ColorPicker'
        },

        'jquery.imgurUpload': {
            'deps':     ['jquery'],
            'exports':  'jquery.fn.imgurUpload'
        }
    }
});

require(
    [   'jquery',
        'storage/canvasStorage',
        'canvas',
        'decks',
        'cards',
        'containers',
        'customDecks',
        'customCards',
        'fields',
        'connections',
        'customisation',

        'storage/lsStorage',
        'storage/roleStorage',
        'storage/waveStorage',

        'card_specific/assessment',
        'card_specific/hlm',
        'card_specific/information_skills',
        'card_specific/ld',
        'card_specific/multimedia',
        'card_specific/sticky',

        // jQuery library shims
        'lib/jquery.contextMenu',
        'lib/jquery.ui',
        'lib/jquery.colorpicker',
        'lib/jquery.imgurUpload'],

    function($, canvasStorage, canvas, decks, cards, containers) {

        var storageMethod;

        // ROLE & iwc/openapp
        if (typeof(ROLE) !== 'undefined' && ROLE === true) {
            storageMethod   = 'role';
            windowLoadFunc();

        // Wookie & wave
        } else if (typeof(WOOKIE) !== 'undefined' && WOOKIE === true) {
            storageMethod   = 'wave';
            windowLoadFunc();

        // LocalStorage
        } else {
            storageMethod   = 'localStorage';
            windowLoadFunc();
        }


        function windowLoadFunc() {

            // TODO: This should probably be elsewhere
            var options = {
                zIndex:     999999999,
                className:  'menu_large',
                autoHide:   true,
                events:     {
                    show:   function(options) {
                        if($('#context-menu-layer').length > 0) {
                            return false;
                        }
                    }
                },
                animation:  {
                    duration:   250,
                    show:       'fadeIn',
                    hide:       'fadeOut'
                },
                callback:   function(key, options) {
                    switch(key) {
                        case 'change_decks':
                            cards.handlers.changeActiveDecks();
                            break;

                        case 'customise_decks':
                            $(window).trigger('widget:customisation:dialog:deck_selection');
                            break;

                        case 'import':
                            $(window).trigger('widget:canvas:view:import_dialog');
                            break;

                        case 'change_header':
                            $(window).trigger('widget:field:view:create_dialog', [false]);
                            break;

                        case 'export':
                            $(window).trigger('widget:canvas:view:export_dialog');
                            break;
                    }

                    if($(options.selector).length > 0) {
                        $(options.selector).contextMenu('hide');
                    }
                },
                items: {
                    'change_decks':     {
                        'name':     'Change Decks',
                        'icon':     'change_decks'
                    },
                    'customise_decks':     {
                        'name':     'Customise Decks',
                        'icon':     'customise_decks'
                    },
                    'seperator_1':     '---------',
                    'change_header':     {
                        'name':     'Change Header',
                        'icon':     'edit_field'
                    },
                    'seperator_2':     '---------',
                    'import':      {
                        'name':     'Import Data',
                        'icon':     'import'
                    },
                    'export':     {
                        'name':     'Export Data',
                        'icon':     'export'
                    }
                }
            };

            options.selector    = '#options_icon';
            options.trigger     = 'left';
            options.appendTo    = '#options_icon';
            options.position    = function(options, xClickOffset, yClickOffset) {

                var iconElem    = $('#options_icon');
                var menuElem    = $('#options_icon .context-menu-list');

                var xOffset     = iconElem.offset().left;
                var yOffset     = yClickOffset - iconElem.offset().top;

                menuElem.css({top: yOffset, left: xOffset});
            };
            $.contextMenu(options);


            canvasStorage.init(storageMethod, firstRun);
            canvasStorage.setLocalStorageUIUpdateFunc(localStoragePropagate);
            canvasStorage.setWaveUIUpdateFunc(wavePropagate);
            canvasStorage.setWaveParticipantUpdateFunc(waveParticipantUpdate);
//            canvasStorage.setROLEUIUpdateFunc(ROLEUpdate);

            $(window)
                .off('resize')
                .on('resize', function() {
                    canvas.dimensionsCheck();
                    cards.propagateDataAll();

                    // calculate position
                    var labelDialog = $('.connections_dialog');
                    if(labelDialog.length) {
                        var leftOffset  = parseInt(($('#contain_drag').width() / 2) - (labelDialog.outerWidth() / 2), 10);
                        labelDialog.css('left', leftOffset);
                    }
                });
        }

        function firstRun() {

            // Detect data storage version
            var lsDataVersion   = canvasStorage.getRunningVersion();

            // First run
            if(lsDataVersion === null) {
                $(window).trigger('widget:field:view:create_dialog', [true]);
            }

            // Older version found, offer to clear
            else if(lsDataVersion !== canvasStorage.version) {
                if(confirm('Data from an incompatible version of this app exists. Do you wish to clear it?')) {
                    clearData();

                    $(window).trigger('widget:field:view:create_dialog', [true]);
                }

            }

            canvas.dimensionsCheck();
        }





        function localStoragePropagate(event) {

            // Only fire when changed_element is updated (performance optimisation)
            if(typeof(event) === 'undefined' || event.originalEvent.key === 'changed_element') {

                canvasStorage.standardPropagate();
            }
        }


        function waveParticipantUpdate() {

            // Dummy, not currently used.
        }


        function wavePropagate() {

            canvasStorage.standardPropagate();
        }
    }
);
