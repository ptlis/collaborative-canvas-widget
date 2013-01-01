/*jshint jquery:true */


define( ['jquery', 'require'],
        function($, require) {
            'use strict';

        /*  Abstraction of underlying storage mechanism */
            var canvasStorage               = {};

        /*  The data API version. */
            canvasStorage.version           = '1';

        /*  The detected version from the storage mechanism. */
            canvasStorage.runningVersion    = null;

        /*  Cached z-index. */
            canvasStorage.cachedZIndex      = 10;

        /*  Is canvasStorage ready for use */
            canvasStorage.ready             = false;

        /*  Time (in seconds) to delay propagation of card data changes */
            canvasStorage.changeDelay       = 0.25;

        /*  Store of delay Ids for changing text elements */
            canvasStorage.delayIds          = [];

        /*  Deferred data to append to delta on next submit. */
            canvasStorage.deferredDelta     = {};

        /*  The list of data stored. */
            canvasStorage.storedLists       = [
                'containers',
                'cards',
                'connections',
                'decks',
                'fields',
                'customDecks',
                'customCards'
            ];

        /*  Underlying storage module (handles differences between storage
            mechanisms. */
            canvasStorage.storageModule     = undefined;


        /*  'namespaces' for canvasStorage features */
            canvasStorage.changeHandlers        = {};
            canvasStorage.util                  = {};
            canvasStorage.list                  = {};
            canvasStorage.list.notifications    = {};
            canvasStorage.list.cache            = {};




        /*  Initialisation function. */
            canvasStorage.init = function(storageModule) {
                canvasStorage.storageModule = storageModule;

                storageModule.init();
            };


        /*  Remove all data */
            canvasStorage.clear = function() {
                var prefix;
                var module;
                for(var index in canvasStorage.storedLists) {
                    prefix              = canvasStorage.storedLists[index];
                    module              = require(prefix);
                    module.model.removeAll();
                }
            };


        /*  The startup function */
            canvasStorage.firstRun          = function() {
                var canvas      = require('canvas');

                // Detect data storage version
                var lsDataVersion   = canvasStorage.getRunningVersion();

                // First run
                if(lsDataVersion === null) {
                    $(window).trigger('widget:fields:view:create_dialog', [true]);
                }

                // Older version found, offer to clear
                else if(lsDataVersion !== canvasStorage.version) {
                    if(confirm('Data from an incompatible version of this app exists. Do you wish to clear it?')) {
                        canvasStorage.clear();

                        $(window).trigger('widget:fields:view:create_dialog', [true]);
                    }

                }

                canvas.dimensionsCheck();
            };


        /*  Generic method to monitor user-editable elements for changes and
            automatically store the updated data.

            Attaches event handlers to all child elements with the "data-inputname"
            custom attribute. */
            canvasStorage.addChangeEvents = function(element, additionalCallback) {
                canvasStorage.removeChangeEvents(element);

                var defaultElems    = $(element).find('[data-defaultvalue]');
                defaultElems
                    .on('focus',  canvasStorage.util.defaultFocus)
                    .on('blur',   canvasStorage.util.defaultBlur)
                    .focus()
                    .blur();

                // Handle stored text
                var storageElems    = $(element).find('[data-inputname]');
                storageElems
                    .on('keyup', canvasStorage.changeHandlers.textInput, additionalCallback)
                    .on('input', canvasStorage.changeHandlers.textInput, additionalCallback)
                    .on('paste', canvasStorage.changeHandlers.textInput, additionalCallback);
            };


        /*  Removes event handlers from all child elements with the "data-inputname""
            custom attribute */
            canvasStorage.removeChangeEvents = function(element) {
                var defaultElems    = $(element).find('[data-defaultvalue]');
                defaultElems
                    .off('focus')
                    .off('blur');

                // Handle stored text
                var storageElems    = $(element).find('[data-inputname]');
                storageElems
                    .off('keyup')
                    .off('input')
                    .off('paste');
            };


        /*  Get the API version */
            canvasStorage.getRunningVersion = function() {
                return canvasStorage.runningVersion;
            };


        /*  Retrieve & store the API version */
            canvasStorage.setRunningVersion = function() {
                canvasStorage.storageModule.setRunningVersion();
            };


        /*  Generate JSON data structure containing all data */
            canvasStorage.exportData = function() {
                var allData             = {};
                allData.data_version    = canvasStorage.getRunningVersion();
                allData.z_index         = canvasStorage.cachedZIndex;

                var prefix;
                var module;
                for(var index in canvasStorage.storedLists) {
                    prefix              = canvasStorage.storedLists[index];
                    module              = require(prefix);
                    allData[prefix]     = module.model.getAll();
                }

                return allData;
            };


        /*  Import JSON data structure & overwrite current data. */
            canvasStorage.importData = function(importedData) {
                canvasStorage.clear();

                canvasStorage.storageModule.importData(importedData);
            };


        /*  Trigger events to propagate updated data. */
            canvasStorage.standardPropagate = function() {
                var prefix;
                for(var index in canvasStorage.storedLists) {
                    prefix          = canvasStorage.storedLists[index];
                    $(window).trigger('widget:' + prefix + ':view:update_all');
                }

                // Handle container resizing
                $(window).trigger('widget:containers:view:resize');
            };






    /*  Change handlers */

        /*  Change handler for text input (<input type="text"> & <textarea>) */
            canvasStorage.changeHandlers.textInput = function(event, additionalCallback) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var target          = $(event.target);
                var instanceId      = target.parents('[data-instanceid]').data('instanceid');
                var prefix          = target.parents('[data-prefix]').data('prefix');
                var inputName       = target.data('inputname');
                var storageId       = prefix + '_' + instanceId + '_' + inputName;
                var elemVal         = target.val();

                var curData         = canvasStorage.list.get(prefix, instanceId);

                // Ensure the text value has changed before readying event
                if(curData[inputName] !== elemVal) {

                    // Clear existing timer, ready to be reset
                    if(typeof(canvasStorage.delayIds) !== 'undefined' && typeof(canvasStorage.delayIds[storageId]) !== 'undefined') {
                        window.clearTimeout(canvasStorage.delayIds[storageId]);
                        delete canvasStorage.delayIds[storageId];
                    }

                    // Set new timer, store timer id for later clearing
                    canvasStorage.delayIds[storageId] = window.setTimeout(function() {

                        var newData     = {};
                        newData.id          = instanceId;
                        newData[inputName]  = elemVal;

                        canvasStorage.list.update(prefix, newData);

                        // Update all other instances
                        var storageElems                                = $('[data-instanceid="' + instanceId + '"] [data-inputname="' + inputName + '"]');
                        var storageElem;
                        for(var i = 0; i < storageElems.length; i++) {
                            storageElem     = $(storageElems[i]);

                            if(!storageElem.is($(event.target))) {
                                if(elemVal.length) {
                                    storageElem.text(elemVal);
                                    storageElem.removeClass('default_text');
                                }
                                else {
                                    if(storageElem.data('defaultvalue')) {
                                        storageElem.text($(storageElem).data('defaultvalue'));
                                    }
                                    else {
                                        storageElem.text('');
                                    }
                                    storageElem.addClass('default_text');
                                }
                            }
                        }

                    }, canvasStorage.changeDelay * 1000);
                }

                if(typeof(additionalCallback) !== 'undefined') {
                    additionalCallback(event);
                }
            };


        /*  Change handler for changing availability of non-required items. */
            canvasStorage.changeHandlers.addEntry = function(event) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var target          = $(event.target);
                var inputName       = target.data('inputname');
                var instanceId      = target.parents('[data-instanceid]').data('instanceid');
                var prefix          = target.parents('[data-prefix]').data('prefix');

                var newData         = {};
                newData.id          = instanceId;
                newData[inputName]  = 'true';

                canvasStorage.list.update(prefix, newData);
            };


        /*  Change handler for changing availability of non-required items. */
            canvasStorage.changeHandlers.removeEntry = function(event) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var target          = $(event.target);
                var inputName       = target.data('inputname');
                var instanceId      = target.parents('[data-instanceid]').data('instanceid');
                var prefix          = target.parents('[data-prefix]').data('prefix');

                var newData         = {};
                newData.id          = instanceId;
                newData[inputName]  = '';

                canvasStorage.list.update(prefix, newData);
            };




    /* Util */

        /* Used so that we can always bring an element to the front of all
           others. */
            canvasStorage.util.getNextZIndex = function() {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var nextZIndex;
                // No z-index stored
                if(canvasStorage.cachedZIndex === null) {
                    nextZIndex      = 10;
                }

                else {
                    nextZIndex      = parseInt(canvasStorage.cachedZIndex, 10) + 1;
                }

                nextZIndex  = nextZIndex.toString();

                canvasStorage.storageModule.setNextZIndex(nextZIndex);

                return nextZIndex;
            };


        /*  Function used to toggle display of default text on elements that do
            not support the placeholder attribute. */
            canvasStorage.util.defaultFocus = function(event) {
                var target          = $(event.target);
                var instanceId      = target.parents('[data-instanceid]').data('instanceid');
                var prefix          = target.parents('[data-prefix]').data('prefix');
                var inputName       = target.data('inputname');

                var data            = canvasStorage.list.get(prefix, instanceId);

                var defaultVal      = target.data('defaultvalue');
                var elemVal         = data[inputName];

                if(elemVal === defaultVal) {
                    target.empty();
                    target.removeClass('default_text');
                }
            };


        /*  Function used to toggle display of default text on elements that do
            not support the placeholder attribute. */
            canvasStorage.util.defaultBlur = function(event) {
                var target          = $(event.target);
                var instanceId      = target.parents('[data-instanceid]').data('instanceid');
                var prefix          = target.parents('[data-prefix]').data('prefix');
                var inputName       = target.data('inputname');

                var data            = canvasStorage.list.get(prefix, instanceId);

                var defaultVal      = target.data('defaultvalue');
                var elemVal         = data[inputName];

                if(elemVal === null || typeof(elemVal) === 'undefined' || elemVal.length < 1) {
                    target.empty();
                    target.text(defaultVal);
                    target.addClass('default_text');
                }
                else {
                    target.removeClass('default_text');
                }
            };







    /* List cache. */

        /*  Cached data, optimisation.

            Stored in form:

            canvasStorage.list.cache.data.[prefix][itemId] =
                {
                    'data':     itemData,
                    'uri':      uri         (ROLE only)
                }
        */

            canvasStorage.list.cache.data = {
                'cards'         : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'connections'   : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'containers'    : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'decks'         : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'fields'        : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'customDecks'   : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'customCards'   : {
                    firstItemId     : null,
                    lastItemId      : null
                }
            };


        /* Cache a list item. */
            canvasStorage.list.cache.cacheItem = function(prefix, itemData, uri) {
                var data    = {
                    'data':     itemData
                };

                if(typeof(uri) !== 'undefined') {
                    data.uri    = uri;
                }

                canvasStorage.list.cache.data[prefix][itemData.id]  = data;
            };


        /*  Delete an item from the cache. */
            canvasStorage.list.cache.deleteCachedItem = function(prefix, itemData) {
                delete canvasStorage.list.cache.data[prefix][itemData.id];
            };


        /*  Delete all items for prefix from cache. */
            canvasStorage.list.cache.deleteAllCachedItems = function(prefix) {
                delete(canvasStorage.list.cache.data[prefix]);

                canvasStorage.list.cache.data[prefix]    = {
                    'firstItemId':      null
                };

                canvasStorage.list.cache.setFirstItemId(prefix, null);
                canvasStorage.list.cache.setLastItemId(prefix, null);
            };


        /*  Retrieve item by item id & prefix from cache. */
            canvasStorage.list.cache.getCachedItemId = function(prefix, itemId) {
                var itemData    = null;
                if(itemId in canvasStorage.list.cache.data[prefix] && canvasStorage.list.cache.data[prefix].hasOwnProperty(itemId)) {
                    itemData    = canvasStorage.list.cache.data[prefix][itemId];
                }
                return itemData;
            };


        /*  Retrieve all items for prefix from cache. */
            canvasStorage.list.cache.getAllCachedItems = function(prefix) {
                return canvasStorage.list.cache.data[prefix];
            };


        /*  Set the cached first item id for the prefix */
            canvasStorage.list.cache.setFirstItemId = function(prefix, itemId) {
                canvasStorage.list.cache.data[prefix].firstItemId    = itemId;
            };


        /*  Retrieve the first item id for prefix from the cache. */
            canvasStorage.list.cache.getFirstItemId = function(prefix) {
                return canvasStorage.list.cache.data[prefix].firstItemId;
            };


        /*  Set the cached last item id for the prefix. */
            canvasStorage.list.cache.setLastItemId = function(prefix, itemId) {
                canvasStorage.list.cache.data[prefix].lastItemId    = itemId;
            };


        /*  Retrieve the last item id for prefix from the cache. */
            canvasStorage.list.cache.getLastItemId = function(prefix) {
                return canvasStorage.list.cache.data[prefix].lastItemId;
            };




    /*  List functions

        Wrap standard doubly linked-list functionality. */

        /*  Add the item in the specified position in prefix relative to the
            given item. */
            canvasStorage.list.addPositioned = function(prefix, newItemData, position, relativeToId) {
                canvasStorage.storageModule.list.addPositioned(prefix, newItemData, position, relativeToId);

                // TODO: Handle with param?
                if(prefix === 'cards') {
                    newItemData.size            = 'medium';
                }
                if(prefix === 'connections') {
                    newItemData.newConnection   = true;
                }
                $(window).trigger('widget:' + prefix + ':view:add', [newItemData]);
            };


        /*  Add the item to the end of the prefix list. */
            canvasStorage.list.add = function(prefix, newItemData) {
                canvasStorage.storageModule.list.add(prefix, newItemData);

                // TODO: Handle with param?
                if(prefix === 'cards') {
                    newItemData.size            = 'medium';
                }
                if(prefix === 'connections') {
                    newItemData.newConnection   = true;
                }

                $(window).trigger('widget:' + prefix + ':view:add', [newItemData]);
            };


        /*  Bulk insert of several items into prefix. */
            canvasStorage.list.addMulti = function(prefix, newItemDataArr) {
                canvasStorage.storageModule.list.addMulti(prefix, newItemDataArr);

                // TODO: These events should be emitted by canvasStorage.list.cache.cacheItem
                for(var i = 0; i < newItemDataArr.length; i++) {

                    // TODO: Handle with param (also not role ready)
                    if(prefix === 'cards') {
                        newItemDataArr[i].size          = 'medium';
                    }
                    if(prefix === 'connections') {
                        newItemDataArr[i].newConnection = true;
                    }

                    $(window).trigger('widget:' + prefix + ':view:add', [newItemDataArr[i]]);
                }
            };


        /* Remove the item from the prefix list. */
            canvasStorage.list.remove = function(prefix, remItemData) {
                canvasStorage.storageModule.list.remove(prefix, remItemData);

                $(window).trigger('widget:' + prefix + ':view:remove', [remItemData]);
            };


        /*  Remove all items from the prefix list. */
            canvasStorage.list.removeAll = function(prefix, remItemData) {
                canvasStorage.storageModule.list.removeAll(prefix, remItemData);

                canvasStorage.list.cache.deleteAllCachedItems(prefix);

                $(window).trigger('widget:' + prefix + ':view:remove_all');
            };


        /*  Update item data in storage. */
            canvasStorage.list.update = function(prefix, itemData) {
                canvasStorage.storageModule.list.update(prefix, itemData);
            };


        /*  Get the item data from the prefix list by item id. */
            canvasStorage.list.get = function(prefix, itemId) {
                var itemData        = null;
                var cachedItemData  = canvasStorage.list.cache.getCachedItemId(prefix, itemId);

                if(cachedItemData !== null) {
                    itemData    = cachedItemData.data;
                }

                return itemData;
            };


        /*  Get all item data for prefix list. */
            canvasStorage.list.getAll = function(prefix) {
                var itemDataArr = [];

                var currentId   = canvasStorage.list.cache.getFirstItemId(prefix);
                var nextId;
                var itemData;

                if(currentId) {
                    itemData                            = canvasStorage.list.get(prefix, currentId);
                    nextId                              = itemData.next;
                    itemDataArr.push(itemData);

                    while(nextId !== null && nextId.length > 0) {
                        currentId                       = nextId;

                        itemData                            = canvasStorage.list.get(prefix, currentId);
                        nextId                              = itemData.next;
                        itemDataArr.push(itemData);
                    }
                }

                return itemDataArr;
            };

            return canvasStorage;
        }
);
