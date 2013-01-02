/*jshint jquery:true */


require(
    [   'jquery',
        'storage/canvasStorage',
        'storage/lsStorage',
        'storage/roleStorage',
        'storage/waveStorage',
        'canvas',
        'cards',
        'decks',
        'containers',

        'customDecks',
        'customCards',
        'fields',
        'connections',
        'customisation',

        'storage/kvpStorage',

        'card_specific/assessment',
        'card_specific/hlm',
        'card_specific/information_skills',
        'card_specific/ld',
        'card_specific/multimedia',
        'card_specific/sticky',

        // jQuery plugins
        'lib/jquery.contextMenu',
        'lib/jquery.ui',
        'lib/jquery.colorpicker',
        'lib/jquery.imgurUpload',
        'lib/jquery.base64'],

    function($, canvasStorage, lsStorage, roleStorage, waveStorage, canvas, cards) {
        'use strict';

        var storageModule;

        // ROLE & iwc/openapp
        if (typeof(ROLE) !== 'undefined' && ROLE === true) {
            storageModule   = roleStorage;
            windowLoadFunc();

        // Wookie & wave
        } else if (typeof(WOOKIE) !== 'undefined' && WOOKIE === true) {
            storageModule   = waveStorage;
            windowLoadFunc();

        // LocalStorage
        } else {
            storageModule   = lsStorage;
            windowLoadFunc();
        }

        function windowLoadFunc() {

            // TODO: This should probably be in the canvas module
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
                            $(window).trigger('widget:fields:view:create_dialog', [false]);
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

            // Initialise storage
            canvasStorage.init(storageModule);

            // Handle window resizing (update positions & spawn dialog if window
            // is made too small
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
    }
);
