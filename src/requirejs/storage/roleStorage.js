/*jshint jquery:true */


define( ['jquery', 'require', 'util', 'storage/canvasStorage'],
        function($, require, util, canvasStorage) {
            'use strict';

        /*  ROLE shared space. */
            var space           = null;

        /*  ROLE user space. */
            var user            = null;

        /*  ROLE IWC client. */
            var iwcClient       = null;

        /*  Base resource for application. */
            var baseResource    = null;

        /*  Resource handles for ROLE. */
            var listResources = {
                'cards'         : null,
                'connections'   : null,
                'containers'    : null,
                'decks'         : null,
                'fields'        : null,
                'customDecks'   : null,
                'customCards'   : null
            };


            var roleStorage     = {};
            roleStorage.list    = {};


        /*  Initialisation */
            roleStorage.init = function() {
                var canvas  = require('canvas');

                space       = new openapp.oo.Resource(openapp.param.space());
                user        = new openapp.oo.Resource(openapp.param.user());

                // Delete base resource
/*                space.getSubResources({
                    'relation': openapp.ns.role + 'data',
                    'type':     'ptlis.net:base',
                    'onAll':    function(baseArr) {
                        baseArr[0].del(function() {
                            alert('deleted');
                        });
                    }
                });
                return;*/

                // Called when cache has been initialised
                var initComplete    = function() {
                    canvasStorage.ready             = true;
                    canvasStorage.standardPropagate();
                    canvas.hideLoadingDialog();

                    iwcClient   = new iwc.Client(['*']);
                    iwcClient.connect(roleStorage.uiUpdate);
                };

                // Setup base resource
                space.getSubResources({
                    'relation': openapp.ns.role + 'data',
                    'type':     'ptlis.net:base',
                    'onAll':    function(baseArr) {
                        // Resource already exists, store
                        if(baseArr.length) {
                            // There should only ever be 1 base resource
                            baseResource    = baseArr[0];

                            baseResource.getRepresentation(
                                'rdfjson',
                                function(representation) {
                                    if('data_version' in representation && representation.hasOwnProperty('data_version')) {
                                        canvasStorage.runningVersion    = representation.data_version;
                                    }

                                    if('z_index' in representation && representation.hasOwnProperty('z_index')) {
                                        canvasStorage.cachedZIndex      = representation.z_index;
                                    }

                                    roleStorage.initialiseAllCaches(initComplete);
                                });
                        }

                        // First run, create empty resource & sub-resources
                        else {
                            space.create({
                                relation:       openapp.ns.role + 'data',
                                type:           'ptlis.net:base',
                                representation: JSON.stringify({}),
                                callback: function(subResource) {
                                    baseResource    = new openapp.oo.Resource(subResource.getURI());

                                    roleStorage.initialiseAllCaches(initComplete);
                                }
                            });
                        }
                    }
                });

            };


        /*  Process intent & trigger events to update UI. */
            roleStorage.uiUpdate = function(intent) {
                space.refresh();

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


        /*  Retrieve & store the API version */
            roleStorage.setRunningVersion = function() {
                baseResource.getRepresentation(
                    'rdfjson',
                    function(representation) {
                        var data    = {
                            'data_version': canvasStorage.version,
                            'z_index':      canvasStorage.cachedZIndex
                        };

                        if('z_index' in representation && representation.hasOwnProperty('z_index')) {
                            data.z_index                = representation.z_index;
                            canvasStorage.cachedZIndex  = representation.z_index;
                        }

                        baseResource.setRepresentation(
                            data,
                            'application/json'
                        );
                    }
                );

                canvasStorage.runningVersion    = canvasStorage.version;
            };


        /* Set the next z index. */
            roleStorage.setNextZIndex = function(nextZIndex) {
                canvasStorage.cachedZIndex      = nextZIndex;

                var data    = {
                    'data_version': canvasStorage.version,
                    'z_index':      nextZIndex
                };

                baseResource.setRepresentation(
                    data,
                    'application/json'
                );

                addNotification('UPDATE_Z_INDEX', data, 'ptlis.net:base');
                publishNotifications();
            };


        /*  Initialise all storage caches. */
            roleStorage.initialiseAllCaches = function(completeCallback) {
                var collector   = util.collector(canvasStorage.storedLists.length, completeCallback);
                for(var index in canvasStorage.storedLists) {
                    getListResource(canvasStorage.storedLists[index], collector);
                }
            };




    /*  List manipulation

        Wrap standard doubly linked-list functionality. */

        /*  Add the item in the specified position in prefix relative to the
            given item. */
            roleStorage.list.addPositioned = function(prefix, newItemData, position, relativeToId) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var firstId             = canvasStorage.list.cache.getFirstItemId(prefix);
                var relativeToItemData  = canvasStorage.list.cache.getCachedItemId(prefix, relativeToId);
                var type                = 'ptlis.net:' + prefix;
                var listResource        = listResources[prefix];
                var relativeToItemResource;
                var prevItemData;
                var nextItemData;
                newItemData.prev    = null;
                newItemData.next    = null;

                switch(position) {
                    case 'above':

                        // First element (set this id to new first id)
                        if(relativeToId === firstId) {

                            var representation  = {
                                'firstItemId':  newItemData.id
                            };

                            listResource.setRepresentation(
                                representation,
                                'application/json'
                            );
                            canvasStorage.list.cache.setFirstItemId(prefix, newItemData.id);
                            addNotification('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
                        }

                        // Any other (Update previous element)
                        else {
                            prevItemData            = canvasStorage.list.cache.getCachedItemId(prefix, relativeToItemData.data.prev);
                            prevItemData.data.next  = newItemData.id;

                            var prevItemResource    = new openapp.oo.Resource(prevItemData.uri);
                            prevItemResource.setRepresentation(
                                prevItemData.data,
                                'application/json'
                            );
                            canvasStorage.list.cache.cacheItem(prefix, prevItemData.data, prevItemData.uri);
                            addNotification('UPDATE', prevItemData, 'ptlis.net:' + prefix);

                            newItemData.prev                                   = relativeToItemData.data.prev;
                        }

                        // Update the 'relative to' element
                        relativeToItemData.data.prev    = newItemData.id;
                        relativeToItemResource          = new openapp.oo.Resource(relativeToItemData.uri);
                        relativeToItemResource.setRepresentation(
                            relativeToItemData.data,
                            'application/json'
                        );
                        canvasStorage.list.cache.cacheItem(prefix, relativeToItemData.data, relativeToItemData.uri);
                        addNotification('UPDATE', relativeToItemData, 'ptlis.net:' + prefix);

                        // Add the element itself
                        newItemData.next                                       = relativeToId;

                        canvasStorage.list.cache.cacheItem(prefix, newItemData);   // Cache without URI first
                        listResource.create({
                            'relation':         openapp.ns.role + 'data',
                            'type':             type,
                            'representation':   newItemData,
                            'callback':         function(subResource) {
                                canvasStorage.list.cache.cacheItem(prefix, newItemData, subResource.getURI()); // Update cache with uri
                                addNotification('ADD', canvasStorage.list.cache.getCachedItemId(prefix, newItemData.id), 'ptlis.net:' + prefix);
                                publishNotifications();
                            }
                        });

                        break;

                    case 'below':
                        // Relative to any element other than the final one
                        if(relativeToItemData.data.next !== null) {

                            nextItemData            = canvasStorage.list.cache.getCachedItemId(prefix, relativeToItemData.data.next);
                            nextItemData.data.prev  = newItemData.id;

                            var nextItemResource    = new openapp.oo.Resource(nextItemData.uri);
                            nextItemResource.setRepresentation(
                                nextItemData.data,
                                'application/json'
                            );
                            canvasStorage.list.cache.cacheItem(prefix, nextItemData.data, nextItemData.uri);
                            addNotification('UPDATE', nextItemData, 'ptlis.net:' + prefix);

                            newItemData.next                                = nextItemData.data.id;
                        }

                        // Relative to the final element
                        else {
                            canvasStorage.list.cache.setLastItemId(prefix, newItemData.id);
                        }

                        relativeToItemData.data.next                        = newItemData.id;
                        relativeToItemResource                              = new openapp.oo.Resource(relativeToItemData.uri);
                        relativeToItemResource.setRepresentation(
                            relativeToItemData.data,
                            'application/json'
                        );
                        canvasStorage.list.cache.cacheItem(prefix, relativeToItemData.data, relativeToItemData.uri);
                        addNotification('UPDATE', relativeToItemData, 'ptlis.net:' + prefix);

                        // Add the element itself
                        newItemData.prev                        = relativeToId;

                        canvasStorage.list.cache.cacheItem(prefix, newItemData);   // Cache without URI first
                        listResource.create({
                            'relation':         openapp.ns.role + 'data',
                            'type':             type,
                            'representation':   newItemData,
                            'callback':         function(subResource) {
                                canvasStorage.list.cache.cacheItem(prefix, newItemData, subResource.getURI()); // Update cache with uri
                                addNotification('ADD', canvasStorage.list.cache.getCachedItemId(prefix, newItemData.id), 'ptlis.net:' + prefix);
                                publishNotifications();
                            }
                        });

                        break;

                }
            };


        /*  Add the item to the end of the prefix list. */
            roleStorage.list.add = function(prefix, newItemData) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }


                var listResource    = listResources[prefix];

                newItemData.next    = null;
                newItemData.prev    = null;

                // Items already exist in cache, find the last item
                if(lastItemId) {
                    lastItemData    = canvasStorage.list.cache.getCachedItemId(prefix, lastItemId);
                }

                // Items already exist, update last item's next value
                if(lastItemData) {
                    lastItemData.data.next      = newItemData.id;
                    newItemData.prev            = lastItemData.data.id;

                    var lastItemResource    = new openapp.oo.Resource(lastItemData.uri);
                    lastItemResource.setRepresentation(
                        lastItemData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, lastItemData.data, lastItemData.uri);
                    addNotification('UPDATE', lastItemData, 'ptlis.net:' + prefix);
                }

                // No items exist, add first id
                else {
                    var representation  = {
                        'firstItemId':  newItemData.id
                    };

                    listResource.setRepresentation(
                        representation,
                        'application/json'
                    );

                    canvasStorage.list.cache.setFirstItemId(prefix, newItemData.id);
                    addNotification('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
                }

                canvasStorage.list.cache.setLastItemId(prefix, newItemData.id);

                var type    = 'ptlis.net:' + prefix;

                canvasStorage.list.cache.cacheItem(prefix, newItemData);   // Cache without URI first
                listResource.create({
                    'relation':         openapp.ns.role + 'data',
                    'type':             type,
                    'representation':   newItemData,
                    'callback':         function(subResource) {
                        canvasStorage.list.cache.cacheItem(prefix, newItemData, subResource.getURI()); // Update cache
                        addNotification('ADD', canvasStorage.list.cache.getCachedItemId(prefix, newItemData.id), 'ptlis.net:' + prefix);
                        publishNotifications();
                    }
                });
            };


        /*  Bulk insert of several items into prefix. */
            roleStorage.list.addMulti = function(prefix, newItemDataArr) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var lastItemData    = null;
                var lastItemId      = canvasStorage.list.cache.getLastItemId(prefix);
                var listResource    = listResources[prefix];

                // Items already exist, update last item's next value
                if(lastItemId) {
                    lastItemData    = canvasStorage.list.cache.getCachedItemId(prefix, lastItemId);
                    lastItemData.data.next      = newItemDataArr[0].id;
                    var lastItemResource    = new openapp.oo.Resource(lastItemData.uri);

                    lastItemResource.setRepresentation(
                        lastItemData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, lastItemData.data, lastItemData.uri);
                    addNotification('UPDATE', lastItemData, 'ptlis.net:' + prefix);
                }

                // No items exist, add first id
                else {
                    var representation  = {
                        'firstItemId':  newItemDataArr[0].id
                    };

                    listResource.setRepresentation(
                        representation,
                        'application/json'
                    );
                    canvasStorage.list.cache.setFirstItemId(prefix, newItemDataArr[0].id);
                    addNotification('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
                }

                var createItem = function(prefix, itemData) {
                    var type    = 'ptlis.net:' + prefix;

                    canvasStorage.list.cache.cacheItem(prefix, itemData);   // Cache without URI first
                    listResource.create({
                        'relation':         openapp.ns.role + 'data',
                        'type':             type,
                        'representation':   itemData,
                        'callback':         function(subResource) {
                            canvasStorage.list.cache.cacheItem(prefix, itemData, subResource.getURI()); // Update cache with URI
                            addNotification('ADD', canvasStorage.list.cache.getCachedItemId(prefix, itemData.id), 'ptlis.net:' + prefix);
                            publishNotifications();
                        }
                    });

                };

                for(var i = 0; i < newItemDataArr.length; i++) {
                    newItemDataArr[i].prev      = null;
                    newItemDataArr[i].next      = null;

                    // First added entry is special case
                    if(i === 0 && lastItemData) {
                        newItemDataArr[i].prev  = lastItemData.data.id;
                    }

                    else if(i > 0) {
                        newItemDataArr[i].prev  = newItemDataArr[i - 1].id;
                    }

                    if(i + 1 < newItemDataArr.length) {
                        newItemDataArr[i].next  = newItemDataArr[i + 1].id;
                    }

                    else {
                        canvasStorage.list.cache.setLastItemId(prefix, newItemDataArr[i].id);
                    }

                    createItem(prefix, newItemDataArr[i]);
                }
            };


        /* Remove the item from the prefix list. */
            roleStorage.list.remove = function(prefix, remItemData) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var itemData        = canvasStorage.list.cache.getCachedItemId(prefix, remItemData.id);
                var prevData;
                var nextData;

                var listResource    = listResources[prefix];
                var nextItemResource;
                var prevItemResource;
                var representation;

                // Elements in middle of list
                if(itemData.data.prev !== null && itemData.data.next !== null) {
                    prevData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.prev);
                    nextData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.next);

                    prevData.data.next      = nextData.data.id;
                    nextData.data.prev      = prevData.data.id;

                    prevItemResource    = new openapp.oo.Resource(prevData.uri);
                    prevItemResource.setRepresentation(
                        prevData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, prevData.data, prevData.uri);
                    addNotification('UPDATE', prevData, 'ptlis.net:' + prefix);

                    nextItemResource    = new openapp.oo.Resource(nextData.uri);
                    nextItemResource.setRepresentation(
                        nextData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, nextData.data, nextData.uri);
                    addNotification('UPDATE', nextData, 'ptlis.net:' + prefix);

                }

                // Only element in list
                else if(itemData.data.prev === null && itemData.data.next === null){

                    representation  = {
                        'firstItemId':  null
                    };

                    listResource.setRepresentation(
                        representation,
                        'application/json'
                    );
                    canvasStorage.list.cache.setFirstItemId(prefix, null);
                    canvasStorage.list.cache.setLastItemId(prefix, null);
                    addNotification('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
                }

                // First element
                else if(itemData.data.prev === null) {

                    representation  = {
                        'firstItemId':  itemData.data.next
                    };

                    listResource.setRepresentation(
                        representation,
                        'application/json'
                    );
                    canvasStorage.list.cache.setFirstItemId(prefix, itemData.data.next);
                    addNotification('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');


                    nextData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.next);
                    nextData.data.prev      = null;

                    nextItemResource    = new openapp.oo.Resource(nextData.uri);
                    nextItemResource.setRepresentation(
                        nextData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, nextData.data, nextData.uri);
                    addNotification('UPDATE', nextData, 'ptlis.net:' + prefix);
                }

                // Last element
                else {
                    prevData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.prev);
                    prevData.data.next      = null;

                    prevItemResource    = new openapp.oo.Resource(prevData.uri);
                    prevItemResource.setRepresentation(
                        prevData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, prevData.data, prevData.uri);
                    addNotification('UPDATE', prevData, 'ptlis.net:' + prefix);

                    canvasStorage.list.cache.setLastItemId(prefix, prevData.data.id);
                }

                var itemResource        = new openapp.oo.Resource(itemData.uri);
                itemResource.del(function() {
                });

                canvasStorage.list.cache.deleteCachedItem(prefix, itemData.data.id);
                addNotification('REMOVE', itemData, 'ptlis.net:' + prefix);
                publishNotifications();
            };


        /*  Remove all items from the prefix list. */
            roleStorage.list.removeAll = function(prefix, remItemData) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var listResource    = listResources[prefix];

                var type    = 'ptlis.net:' + prefix;

                listResource.getSubResources({
                    'relation': openapp.ns.role + 'data',
                    'type':     type,
                    'onAll':    function(listResArr) {
                        var delCallback = function() {
                        };

                        for(var i = 0; i < listResArr.length; i++) {
                            listResArr[i].del(delCallback);
                        }

                        canvasStorage.list.cache.data[prefix]   = {
                            firstItemId:    null
                        };
                    }
                });

                var itemArr = canvasStorage.list.cache.getAllCachedItems(prefix);

                for(var i = 0; i < itemArr.length; i++) {
                    addNotification('REMOVE', itemArr[i], 'ptlis.net:' + prefix);
                }
                publishNotifications();
            };


        /*  Update item data in storage. */
            roleStorage.list.update = function(prefix, itemData) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var combinedData    = canvasStorage.list.cache.getCachedItemId(prefix, itemData.id);

                for(var index in itemData) {
                    if(itemData.hasOwnProperty(index) && index !== 'id') {
                        combinedData.data[index]         = itemData[index];
                    }
                }

                var itemResource    = new openapp.oo.Resource(combinedData.uri);
                itemResource.setRepresentation(
                    combinedData.data,
                    'application/json'
                );
                canvasStorage.list.cache.cacheItem(prefix, combinedData.data, combinedData.uri);
                addNotification('UPDATE', combinedData, 'ptlis.net:' + prefix);
                publishNotifications();
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
                    iwcClient.publish(intent);

                    queuedNotifications = [];
                }
                else {
                    throw 'Invalid / malformed intent';
                }
            };





    /* Resource functions. */

        /*  Cache initialisation. */
            var initialiseCachePrefix = function(prefix, completeCallback) {
                var type            = 'ptlis.net:' + prefix;

                listResources[prefix].getRepresentation('rdfjson', function(listRepresentation) {

                    if('firstItemId' in listRepresentation && listRepresentation.hasOwnProperty('firstItemId')) {
                        canvasStorage.list.cache.setFirstItemId(prefix, listRepresentation.firstItemId);
                    }

                    listResources[prefix].getSubResources({
                        'relation': openapp.ns.role + 'data',
                        'type':     type,
                        'onAll':    function(listResArr) {

                            if(listResArr.length > 0) {
                                var collector   = util.collector(listResArr.length, completeCallback);
                                for(var i = 0; i < listResArr.length; i++) {
                                    getListItem(prefix, listResArr[i], collector);
                                }
                            }

                            else {
                                completeCallback();
                            }
                        }
                    });
                });
            };


        /*  Get the representation of a single item and add it to the cache. */
            var getListItem = function(prefix, resource, collector) {
                resource.getRepresentation('rdfjson', function(representation) {
                    canvasStorage.list.cache.cacheItem(prefix, representation, resource.getURI());

                    if(representation.next === null) {
                        canvasStorage.list.cache.setLastItemId(prefix, representation.id);
                    }

                    collector();
                });
            };


        /*  Create list Resource. */
            var createListResource = function(prefix, collector) {
                var type            = 'ptlis.net:' + prefix  + '_list';

                baseResource.create({
                    relation:       openapp.ns.role + 'data',
                    type:           type,
                    representation: JSON.stringify({}),
                    callback: function(subResource) {
                        listResources[prefix]  = new openapp.oo.Resource(subResource.getURI());

                        initialiseCachePrefix(prefix, collector);
                    }
                });
            };



        /*  Retrieve list resource, create new resource if list does not exist.
         */
            var getListResource = function(prefix, collector) {
                var type            = 'ptlis.net:' + prefix  + '_list';

                baseResource.getSubResources({
                    'relation': openapp.ns.role + 'data',
                    'type':     type,
                    'onAll':    function(listResArr) {

                        // Resource exists
                        if(listResArr.length) {
                            listResources[prefix]  = new openapp.oo.Resource(listResArr[0].getURI());
                            initialiseCachePrefix(prefix, collector);
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
