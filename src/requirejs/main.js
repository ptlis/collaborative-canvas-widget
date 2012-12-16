/*jshint jquery:true */


requirejs.config({
    shim: {
        'jquery.base64': {
            'deps':	    ['jquery'],
            'exports':  'jquery.fn.base64'
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
        'canvasStorage',
        'canvas',
        'decks',
        'cards',
        'containers',
        'fields',
        'connections',
        'customisation',

        'card_specific/assessment',
        'card_specific/hlm',
        'card_specific/information_skills',
        'card_specific/ld',
        'card_specific/multimedia',
        'card_specific/sticky',

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
                            cards.handlers.importDialog();
                            break;

                        case 'change_header':
                            $(window).trigger('widget:field:view:create_dialog', [false]);
                            break;

                        case 'export':
                            cards.handlers.exportDialog();
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
            canvasStorage.setROLEUIUpdateFunc(ROLEUpdate);

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
        function ROLEUpdate(intent) {

            canvasStorage.space.refresh();

            // Only update if the notification was published by a different user
            if(intent.extras.user !== openapp.param.user()) {
                var prefix;

                for(var i = 0; i < intent.extras.data.length; i++) {

                    switch(intent.extras.data[i].ns) {
                        case 'ptlis.net:base':
                            if(intent.extras.data[i].data.action === 'UPDATE_Z_INDEX') {
                                canvasStorage.cachedZIndex  = intent.extras.data[i].data.z_index;
                            }
                            break;

                        case 'ptlis.net:card_list':
                        case 'ptlis.net:connection_list':
                        case 'ptlis.net:container_list':
                        case 'ptlis.net:deck_list':
                        case 'ptlis.net:field_list':
                            prefix      = intent.extras.data[i].ns.replace('ptlis.net:', '').replace('_list', '');

                            if(intent.extras.data[i].action === 'CHANGE_FIRST_ID') {
                                canvasStorage.list.cache.setFirstItemId(prefix, intent.extras.data[i].data.firstItemId);
                            }
                            break;

                        case 'ptlis.net:card':
                        case 'ptlis.net:connection':
                        case 'ptlis.net:container':
                        case 'ptlis.net:deck':
                        case 'ptlis.net:field':
                            prefix      = intent.extras.data[i].ns.replace('ptlis.net:', '');

                            switch(intent.extras.data[i].action) {
                                case 'ADD':
                                    canvasStorage.list.cache.cacheItem(prefix, intent.extras.data[i].data.data, intent.extras.data[i].data.uri);
                                    $(window).trigger('widget:' + prefix + ':view:add', [intent.extras.data[i].data.data]);
                                    break;

                                case 'UPDATE':
                                    canvasStorage.list.cache.cacheItem(prefix, intent.extras.data[i].data.data, intent.extras.data[i].data.uri);
                                    $(window).trigger('widget:' + prefix + ':view:update', [intent.extras.data[i].data.data]);
                                    break;

                                case 'REMOVE':
                                    canvasStorage.list.cache.deleteCachedItem(prefix, intent.extras.data[i].data.data.id);
                                    $(window).trigger('widget:' + prefix + ':view:remove', [intent.extras.data[i].data.data]);
                                    break;
                            }
                            break;
                    }

                }
            }
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
