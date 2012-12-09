/*jshint jquery:true */

define( ['jquery', 'cards', 'canvasStorage', 'containers', 'decks', 'fields', 'connections', 'canvas'],
        function($, cards, canvasStorage, containers, decks, fields, connections, canvas) {
			'use strict';
    
        /** Code to enable dropping of cards onto the canvas
         *
         */
    
            var storageMethod;
    
            // ROLE & iwc/openapp
            if (typeof(ROLE) !== 'undefined' && ROLE === true) {
                storageMethod   = 'role';
                gadgets.util.registerOnLoadHandler(windowLoadFunc);
    
            // Wookie & wave
            } else if (typeof(WOOKIE) !== 'undefined' && WOOKIE === true) {
                storageMethod   = 'wave';
                $(window).on('load', windowLoadFunc);
    
            // LocalStorage
            } else {
                storageMethod   = 'localStorage';
                $(window).on('load', windowLoadFunc);
            }
    

            function windowLoadFunc() {
                'use strict';
    
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
                                alert('customise')
                                break;
    
                            case 'import':
                                cards.handlers.importDialog();
                                break;
    
                            case 'change_header':
                                fields.handlers.modifyFields();
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
                'use strict';
    
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
            
    
            function clearData() {
                'use strict';
    
                $(window).trigger('widget:deck:model:remove_all');
                $(window).trigger('widget:container:model:remove_all');
                $(window).trigger('widget:field:model:remove_all');
                $(window).trigger('widget:card:model:remove_all');
                $(window).trigger('widget:connection:model:remove_all');
            }
    
    

    
    

    
    
            function ROLEUpdate(intent) {
                'use strict';
    
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
                'use strict';
    
                // Only fire when changed_element is updated (performance optimisation)
                if(typeof(event) === 'undefined' || event.originalEvent.key === 'changed_element') {
    
                    canvasStorage.standardPropagate();
                }
            }
    
    
            function waveParticipantUpdate() {
                'use strict';
    
                // Dummy, not currently used.
            }
    
    
            function wavePropagate() {
                'use strict';
    
                canvasStorage.standardPropagate();
            }
    
    
    
    
    


    
        }
);