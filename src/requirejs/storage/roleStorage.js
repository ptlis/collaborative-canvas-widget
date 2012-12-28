/*jshint jquery:true */


define( ['jquery', 'require', 'util'],
        function($, require, util) {
            'use strict';

            var roleStorage     = {};
            roleStorage.list    = {};

        /*  ROLE shared space. */
            roleStorage.space   = null;

        /*  ROLE user space. */
            roleStorage.user    = null;

        /*  Resource handles for ROLE. */
            roleStorage.resources = {
                base            : null,
                cardList        : null,
                connectionList  : null,
                containerList   : null,
                deckList        : null,
                fieldList       : null,
                customDeckList  : null,
                customCardList  : null
            };

        /*  The list of data stored. */
            roleStorage.storedLists       = [
                'card',
                'connection',
                'container',
                'deck',
                'field',
                'custom_deck',
                'custom_card'
            ];


        /*  Initialisation */
            roleStorage.init = function() {
                var canvas          = require('canvas');
                var canvasStorage   = require('canvasStorage');

                roleStorage.space   = new openapp.oo.Resource(openapp.param.space());
                roleStorage.user    = new openapp.oo.Resource(openapp.param.user());

                // Get Base resource
                roleStorage.resources.base  = null;

                // Called when cache has been initialised
                var initComplete    = function() {
                    canvasStorage.standardPropagate();
                    canvas.hideLoadingDialog();

                    roleStorage.iwcClient   = new iwc.Client(['*']);
                    roleStorage.iwcClient.connect(roleStorage.uiUpdate);
                };


                canvasStorage.space.getSubResources({
                    'relation': openapp.ns.role + 'data',
                    'type':     'ptlis.net:base',
                    'onAll':    function(baseArr) {

                        // Resource already exists, store
                        if(baseArr.length) {
                            // There should only ever be 1 base resource
                            canvasStorage.roleResources.base      = baseArr[0];

                            canvasStorage.roleResources.base.getRepresentation(
                                'rdfjson',
                                function(representation) {
                                    canvasStorage.ready     = true;

                                    if('data_version' in representation && representation.hasOwnProperty('data_version')) {
                                        canvasStorage.runningVersion    = representation.data_version;
                                    }

                                    if('z_index' in representation && representation.hasOwnProperty('z_index')) {
                                        canvasStorage.cachedZIndex      = representation.z_index;
                                    }

                                    var collector   = util.collector(roleStorage.storedLists.length, initComplete);
                                    for(var index in roleStorage.storedLists) {
                                        getListResource(index, collector);
                                    }
                                });
                        }

                        // First run, create empty resource & sub-resources
                        else {
                            canvasStorage.space.create({
                                relation:       openapp.ns.role + 'data',
                                type:           'ptlis.net:base',
                                representation: JSON.stringify({}),
                                callback: function(subResource) {
                                    canvasStorage.ready     = true;

                                    canvasStorage.roleResources.base      = new openapp.oo.Resource(subResource.getURI());

                                    var collector   = util.collector(roleStorage.storedLists.length, initComplete);

                                    for(var index in roleStorage.storedLists) {
                                        createListResource(prefix, collector);
                                    }
                                }
                            });
                        }
                    }
                });

            };


        /*  Process intent & trigger events to update UI. */
            roleStorage.uiUpdate = function(intent) {
                roleStorage.space.refresh();

                // Only update if the notification was published by a different user
                if(intent.extras.user !== openapp.param.user()) {
                    var prefix;
                    var canvasStorage   = require('canvasStorage');

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
                            case 'ptlis.net:custom_deck_list':
                            case 'ptlis.net:custom_card_list':
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
                            case 'ptlis.net:custom_deck':
                            case 'ptlis.net:custom_card':
                                prefix      = intent.extras.data[i].ns.replace('ptlis.net:', '');

                                switch(intent.extras.data[i].action) {
                                    case 'ADD':
                                        var cardData    = intent.extras.data[i].data.data;
                                        canvasStorage.list.cache.cacheItem(prefix, cardData, intent.extras.data[i].data.uri);
                                        cardData.size   = 'medium';
                                        $(window).trigger('widget:' + prefix + ':view:add', [cardData]);
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
            };



    /*  List manipulation

        Wrap standard doubly linked-list functionality. */

        /*  Add the item in the specified position in prefix relative to the
            given item. */
            roleStorage.list.addPositioned = function(prefix, newItemData, position, relativeToId) {
                var canvasStorage   = require('canvasStorage');

                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var firstId             = canvasStorage.list.cache.getFirstItemId(prefix);
                var relativeToItemData  = canvasStorage.list.cache.getCachedItemId(prefix, relativeToId);

            };





    /*  Notifications, belongs to closure to prevent calling from outside module. */

        /*  Array of queued notifications awaiting publishing. */
            var queuedNotifications = [];


        /* Add a notification to the queued list */
            var addNotification = function(action, itemData, namespace) {
                var intentData = {
                    'ns'        : namespace,
                    'action'    : action,
                    'data'      : itemData
                };

                queuedNotifications.push(intentData);
            };


        /* Publish queued notifications. */
            var publishNotifications = function() {
                var intent  = {
                    'component':    '',
                    'data':         'http://ptlis.net/dummy',
                    'dataType':     'text/json',
                    'action':       'UPDATE',
                    'flags':        ['PUBLISH_GLOBAL'],
                    'extras':       {
                        'user':     openapp.param.user(),
                        'data':     queuedNotifications
                    }
                };

                if(iwc.util.validateIntent(intent)) {
                    roleStorage.iwcClient.publish(intent);

                    queuedNotifications = [];
                }
                else {
                    throw 'Invalid / malformed intent';
                }
            };





    /* Resource functions. */

        /*  Cache initialisation. */
            var initialiseCache = function(prefix, completeCallback) {
                var canvasStorage   = require('canvasStorage');
                var type            = 'ptlis.net:' + prefix;

                roleStorage.resources[prefix + 'List'].getRepresentation('rdfjson', function(listRepresentation) {

                    if('firstItemId' in listRepresentation && listRepresentation.hasOwnProperty('firstItemId')) {
                        canvasStorage.list.cache.setFirstItemId(prefix, listRepresentation.firstItemId);
                    }

                    roleStorage.resources[prefix + 'List'].getSubResources({
                        'relation': openapp.ns.role + 'data',
                        'type':     type,
                        'onAll':    function(listResArr) {

                            if(listResArr.length > 0) {
                                var collector   = util.collector(listResArr.length, completeCallback);
                                for(var i = 0; i < listResArr.length; i++) {
                                    resourceArr[index].getRepresentation('rdfjson', function(representation) {
                                        canvasStorage.list.cache.cacheItem(prefix, representation, resourceArr[index].getURI());

                                        // Cache initialised
                                        if(i + 1 === resourceArr.length) {
                                            canvasStorage.list.cache.setLastItemId(prefix, representation.id);
                                        }

                                        collector();
                                    });
                                }
                            }

                            else {
                                completeCallback();
                            }
                        }
                    });
                });
            };


        /*  Create list Resource. */
            var createListResource = function(prefix, collector) {
                var type            = 'ptlis.net:' + prefix  + '_list';

                roleStorage.resources.base.refresh();
                roleStorage.resources.base.create({
                    relation:       openapp.ns.role + 'data',
                    type:           type,
                    representation: JSON.stringify({}),
                    callback: function(subResource) {
                        roleStorage.resources[prefix + 'List']  = new openapp.oo.Resource(subResource.getURI());
                        initialiseCache(prefix, collector);
                    }
                });
            };



        /*  Recursively retrieve list resources, creating any that are missing.
         */
            var getListResource = function(prefix, collector) {
                var type            = 'ptlis.net:' + prefix  + '_list';

                roleStorage.resources.base.refresh();
                roleStorage.resources.base.getSubResources({
                    'relation': openapp.ns.role + 'data',
                    'type':     type,
                    'onAll':    function(listResArr) {
                        // Resource exists
                        if(listResArr.length) {
                            roleStorage.resources[prefix + 'List']  = new openapp.oo.Resource(listResArr[0].getURI());
                            initialiseCache(prefix, collector);
                        }

                        // Resource doesn't exist
                        else {
                            createListResource(prefix, collector);
                        }
                    }
                });
            };

            return roleStorage;
        }
);
