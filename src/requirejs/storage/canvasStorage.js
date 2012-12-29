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

        /*  The storage method used. */
            canvasStorage.method            = undefined;

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
            canvasStorage.init = function(storageMethod, storageModule) {
                canvasStorage.method        = storageMethod;
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
                if(importedData.data_version !== canvasStorage.version) {
                    throw 'Data version mismatch between import and application';
                }

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {

                    canvasStorage.clear();


                    // Process a single list item from imported data.
                    var processList = function(prefix, itemDataArr, processedData) {
                        var itemId;

                        for(var i = 0; i < itemDataArr.length; i++) {
                            itemId  = itemDataArr[i].id;

                            if(i === 0) {
                                processedData[prefix + '_first']    = itemId;
                            }

                            for(var index in itemDataArr[i]) {
                                if(itemDataArr[i].hasOwnProperty(index) && itemDataArr[i][index] !== null) {
                                    processedData[prefix + '_' + itemId + '_' + index] = itemDataArr[i][index];
                                }
                            }
                        }

                        return processedData;
                    };


                    // Process standard data
                    var processedData   = {
                        'data_version'  : importedData.data_version,
                        'z_index'       : importedData.z_index,
                        'change_id'     : importedData.change_id
                    };


                    // Iterate over lists
                    var prefix;
                    for(var index in canvasStorage.storedLists) {
                        prefix          = canvasStorage.storedLists[index];
                        processedData   = processList(prefix, importedData[prefix], processedData);
                    }

                    canvasStorage.util.storeDelta(processedData);


                    // Initialisation of cache
                    canvasStorage.storageModule.initialiseAllCaches(function() {
                        canvasStorage.standardPropagate();
                    });
                }

                else if(canvasStorage.method === 'role') {
                    // TODO: Implement
                    throw "'importData' not implemented for ROLE";
                }
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

        /* Retrieves data identified by key from store */
            canvasStorage.util.getData = function(key) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var data    = null;

                if(canvasStorage.method === 'localStorage') {
                    data    = localStorage.getItem(key);
                    if(typeof(data) === 'string' && data.length < 1) {
                        data        = null;
                    }
                }

                else if(canvasStorage.method === 'wave') {
                    data    = wave.getState().get(key);
                    if(typeof(data) === 'undefined' || data.length < 1) {
                        data    = null;
                    }
                }

                return data;
            };


        /*  Accepts a JSON structure of key-value pairs to store, processes
            deferred delta too. */
            canvasStorage.util.storeDelta = function(delta) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                // Handle deferred data
                var key;
                for(key in canvasStorage.deferredDelta) {
                    if(canvasStorage.deferredDelta.hasOwnProperty(key)) {
                        if(!(key in delta)) {
                            delta[key]      = canvasStorage.deferredDelta[key];
                        }

                    }
                }
                canvasStorage.deferredDelta = {};


                if(canvasStorage.method === 'localStorage') {
                    for(key in delta) {
                        if(delta.hasOwnProperty(key)) {
                            if(typeof(delta[key]) !== 'undefined' && delta[key] !== null && delta[key].length) {
                                localStorage.setItem(key, delta[key]);
                            }
                            else {
                                localStorage.removeItem(key);
                            }
                        }
                    }
                }

                else if(canvasStorage.method === 'wave') {
                    wave.submitDelta(delta);
                }
            };


        /*  Add a delta to be stored on next call to canvasStorage.util.storeDelta,
            this is useful for preventing several small changes to state
            each requiring a storage update. */
            canvasStorage.util.storeDeferredDelta = function(delta) {
                for(var key in delta) {
                    if(delta.hasOwnProperty(key)) {
                        // Store delta
                        canvasStorage.deferredDelta[key]    = delta[key];
                    }
                }
            };


        /*  Used for localStorage, increments on every call & returns a number
            for the change (localStorage events only fire if value changed). */
            canvasStorage.util.getNextChangeId = function() {
                var nextChangeId;

                var changeId        = canvasStorage.util.getData('change_id');
                var delta           = {};

                // No z-index stored
                if(changeId === null) {
                    nextChangeId    = 0;
                }

                else {
                    nextChangeId    = parseInt(changeId, 10) + 1;
                }

                delta.change_id     = nextChangeId.toString();

                canvasStorage.util.storeDeferredDelta(delta);

                return nextChangeId;
            };


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

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    var delta       = {};

                    delta.z_index     = nextZIndex;

                    canvasStorage.util.storeDeferredDelta(delta);

                    canvasStorage.cachedZIndex      = nextZIndex;
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.setNextZIndex(nextZIndex);
                }

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
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var firstId             = canvasStorage.list.cache.getFirstItemId(prefix);
                var relativeToItemData  = canvasStorage.list.cache.getCachedItemId(prefix, relativeToId);

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    var delta               = {};

                    newItemData.prev    = null;
                    newItemData.next    = null;

                    switch(position) {
                        case 'above':

                            // First element
                            if(relativeToId === firstId) {
                                delta[prefix + '_first']    = newItemData.id;
                                canvasStorage.list.cache.setFirstItemId(prefix, newItemData.id);
                            }

                            // Any other
                            else {
                                // Update prev item
                                var prevData                                        = canvasStorage.list.cache.getCachedItemId(prefix, relativeToItemData.data.prev);
                                prevData.data.next                                  = newItemData.id;
                                canvasStorage.list.cache.cacheItem(prefix, prevData.data);
                                delta[prefix + '_' + prevData.data.id + '_next']    = newItemData.id;

                                newItemData.prev                                    = prevData.data.id;
                            }

                            // Update relative to item
                            relativeToItemData.data.prev                                = newItemData.id;
                            canvasStorage.list.cache.cacheItem(prefix, relativeToItemData.data);
                            delta[prefix + '_' + relativeToItemData.data.id + '_prev']  = newItemData.id;

                            newItemData.next                                        = relativeToId;

                            break;

                        case 'below':

                            // Relative to any element other than the final one
                            if(relativeToItemData.data.next !== null) {
                                // Update next item
                                var nextData                                        = canvasStorage.list.cache.getCachedItemId(prefix, relativeToItemData.data.next);
                                nextData.data.prev                                  = newItemData.id;
                                canvasStorage.list.cache.cacheItem(prefix, nextData.data);
                                delta[prefix + '_' + nextData.data.id + '_prev']    = newItemData.id;

                                newItemData.next                                    = nextData.data.id;
                            }

                            // Relative to the final element
                            else {
                                canvasStorage.list.cache.setLastItemId(prefix, newItemData.id);
                            }

                            // Update relative to item
                            relativeToItemData.data.next                                = newItemData.id;
                            canvasStorage.list.cache.cacheItem(prefix, relativeToItemData.data);
                            delta[prefix + '_' + relativeToItemData.data.id + '_next']  = newItemData.id;

                            newItemData.prev                                        = relativeToId;

                            break;
                    }

                    // Add data for extra fields
                    for(var index in newItemData) {
                        if(newItemData.hasOwnProperty(index) && index !== 'id') {
                            delta[prefix + '_' + newItemData.id + '_' + index]  = newItemData[index];
                        }
                    }

                    canvasStorage.list.cache.cacheItem(prefix, newItemData);

                    // Element changed Data
                    delta.changed_element                           = prefix + '_' + newItemData.id + '_' + canvasStorage.util.getNextChangeId();

                    canvasStorage.util.storeDelta(delta);
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.list.addPositioned(prefix, newItemData, position, relativeToId);
                }

                // TODO: Handle with param (also not role ready)
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
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var lastItemData    = null;
                var lastItemId      = canvasStorage.list.cache.getLastItemId(prefix);

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    var delta           = {};

                    // Item alrready exists in cache, find the last item
                    if(lastItemId) {
                        lastItemData    = canvasStorage.list.cache.getCachedItemId(prefix, lastItemId);
                    }

                    // Items already exist, update last item's next value
                    if(lastItemData) {
                        lastItemData.data.next                                  = newItemData.id;
                        delta[prefix + '_' + lastItemData.data.id + '_next']    = newItemData.id;

                        canvasStorage.list.cache.cacheItem(prefix, lastItemData.data);
                    }

                    // No items exist, add first id
                    else {
                        delta[prefix + '_first']                                = newItemData.id;
                        canvasStorage.list.cache.setFirstItemId(prefix, newItemData.id);
                    }

                    canvasStorage.list.cache.setLastItemId(prefix, newItemData.id);

                    newItemData.prev    = null;
                    newItemData.next    = null;

                    if(lastItemData) {
                        newItemData.prev    = lastItemData.data.id;
                    }

                    // Add data for extra fields
                    for(var index in newItemData) {
                        if(newItemData.hasOwnProperty(index) && index !== 'id') {
                            delta[prefix + '_' + newItemData.id + '_' + index]    = newItemData[index];
                        }
                    }

                    canvasStorage.list.cache.cacheItem(prefix, newItemData);

                    // Element changed Data
                    delta.changed_element                           = prefix + '_' + newItemData.id + '_' + canvasStorage.util.getNextChangeId();

                    canvasStorage.util.storeDelta(delta);
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.list.add(prefix, newItemData);
                }


                // TODO: Handle with param (also not role ready)
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
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var lastItemData    = null;
                var lastItemId      = canvasStorage.list.cache.getLastItemId(prefix);
                var i;

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    var delta           = {};

                    // Items already exist in cache, find the last item
                    if(lastItemId) {
                        lastItemData        = canvasStorage.list.cache.getCachedItemId(prefix, lastItemId);
                    }

                    // Items already exist, update last item's next value
                    if(lastItemData) {
                        lastItemData.data.next                                  = newItemDataArr[0].id;
                        delta[prefix + '_' + lastItemData.data.id + '_next']    = newItemDataArr[0].id;

                        canvasStorage.list.cache.cacheItem(prefix, lastItemData.data);
                    }

                    // No items exist, add first id
                    else {
                        delta[prefix + '_first']    = newItemDataArr[0].id;
                        canvasStorage.list.cache.setFirstItemId(prefix, newItemDataArr[0].id);
                    }

                    // Append new items after current id
                    for(i = 0; i < newItemDataArr.length; i++) {

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

                        // Add data for extra fields
                        for(var index in newItemDataArr[i]) {
                            if(newItemDataArr[i].hasOwnProperty(index) && index !== 'id') {
                                delta[prefix + '_' + newItemDataArr[i].id + '_' + index]    = newItemDataArr[i][index];
                            }
                        }

                        canvasStorage.list.cache.cacheItem(prefix, newItemDataArr[i]);
                    }

                    // Element changed Data
                    delta.changed_element                           = prefix + '_' + newItemDataArr[0].id + '_' + canvasStorage.util.getNextChangeId();

                    canvasStorage.util.storeDelta(delta);
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.list.addMulti(prefix, newItemDataArr);
                }

                // TODO: These events should be emitted by canvasStorage.list.cache.cacheItem
                for(i = 0; i < newItemDataArr.length; i++) {

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
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }
                var itemData        = canvasStorage.list.cache.getCachedItemId(prefix, remItemData.id);
                var prevData;
                var nextData;

                var decks       = require('decks');

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    var delta       = {};
                    var index;

                    // Item is in the middle of two items
                    if(itemData.data.prev !== null && itemData.data.next !== null) {
                        prevData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.prev);
                        nextData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.next);

                        prevData.data.next      = nextData.data.id;
                        canvasStorage.list.cache.cacheItem(prefix, prevData.data);
                        delta[prefix + '_' + prevData.data.id + '_next']   = prevData.data.next;

                        nextData.data.prev      = prevData.data.id;
                        canvasStorage.list.cache.cacheItem(prefix, nextData.data);
                        delta[prefix + '_' + nextData.data.id + '_prev']   = nextData.data.prev;
                    }

                    // Item is the only one left
                    else if(itemData.data.prev === null && itemData.data.next === null) {
                        canvasStorage.list.cache.setFirstItemId(prefix, null);
                        canvasStorage.list.cache.setLastItemId(prefix, null);
                        delta[prefix + '_first']    = '';
                    }

                    // Item is the first in the list
                    else if(itemData.data.prev === null) {
                        nextData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.next);

                        nextData.data.prev      = null;
                        canvasStorage.list.cache.cacheItem(prefix, nextData.data);
                        delta[prefix + '_' + nextData.data.id + '_prev']    = '';

                        canvasStorage.list.cache.setFirstItemId(prefix, nextData.data.id);
                        delta[prefix + '_first']                        = itemData.data.next;
                    }

                    // Item is the last in the list
                    else {
                        prevData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.prev);
                        prevData.data.next      = null;
                        canvasStorage.list.cache.cacheItem(prefix, prevData.data);
                        delta[prefix + '_' + prevData.data.id + '_next']   = '';

                        canvasStorage.list.cache.setLastItemId(prefix, prevData.data.id);
                    }

                    remItemData.next            = '';
                    remItemData.prev            = '';


                    // Remove data for extra fields
                    for(index in remItemData) {
                        if(remItemData.hasOwnProperty(index) && index !== 'id') {
                            delta[prefix + '_' + remItemData.id + '_' + index]      = '';
                        }
                    }

                    // Card-specific 'special' extra fields
                    if(prefix === 'cards') {
                        var deck        = canvasStorage.util.getData(prefix + '_' + itemData.data.id + '_deck');
                        var cardType    = canvasStorage.util.getData(prefix + '_' + itemData.data.id + '_cardtype');
                        var cardExtraFields = decks.getHandler(deck).getExtraFields(cardType);

                        for(index in cardExtraFields) {
                            if(cardExtraFields.hasOwnProperty(index)) {
                                delta[prefix + '_' + remItemData.id + '_' + index]      = '';
                            }
                        }
                    }

                    delta.changed_element                           = prefix + '_' + remItemData.id + '_' + canvasStorage.util.getNextChangeId();

                    canvasStorage.util.storeDelta(delta);

                    canvasStorage.list.cache.deleteCachedItem(prefix, itemData.data.id);
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.list.remove(prefix, remItemData);
                }

                $(window).trigger('widget:' + prefix + ':view:remove', [itemData.data]);
            };


        /*  Remove all items from the prefix list. */
            canvasStorage.list.removeAll = function(prefix, remItemData) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var decks       = require('decks');

                var i;

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    var itemDataArr = canvasStorage.list.cache.getAllCachedItems(prefix);
                    var index;
                    var delta       = {};
                    delta[prefix + '_first']    = '';

                    for(i = 0; i < itemDataArr.length; i++) {
                        delta[prefix + '_' + itemDataArr[i].data.id + '_next']  = '';
                        delta[prefix + '_' + itemDataArr[i].data.id + '_prev']  = '';


                        // Remove data for extra fields
                        for(index in remItemData) {
                            if(remItemData.hasOwnProperty(index)) {
                                delta[prefix + '_' + itemDataArr[i].data.id + '_' + index]      = '';
                            }
                        }


                        // Card-specific 'special' extra fields
                        if(prefix === 'cards') {
                            var deck        = canvasStorage.util.getData(prefix + '_' + itemDataArr[i].data.id + '_deck');
                            var cardType    = canvasStorage.util.getData(prefix + '_' + itemDataArr[i].data.id + '_cardtype');
                            var cardExtraFields = decks.getHandler(deck).getExtraFields(cardType);

                            for(index in cardExtraFields) {
                                if(cardExtraFields.hasOwnProperty(index)) {
                                    delta[prefix + '_' + itemDataArr[i].data.id + '_' + index]      = '';
                                }
                            }
                        }
                    }

                    canvasStorage.util.storeDelta(delta);
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.list.removeAll(prefix, remItemData);
                }

                canvasStorage.list.cache.deleteAllCachedItems(prefix);

                $(window).trigger('widget:' + prefix + ':view:remove_all');
            };


        /*  Update item data in storage. */
            canvasStorage.list.update = function(prefix, itemData) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var combinedData    = canvasStorage.list.cache.getCachedItemId(prefix, itemData.id);
                var index;

                for(index in itemData) {
                    if(itemData.hasOwnProperty(index) && index !== 'id') {
                        combinedData.data[index]         = itemData[index];
                    }
                }

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {

                    var delta       = {};

                    // Update data for extra fields
                    for(index in itemData) {
                        if(itemData.hasOwnProperty(index) && index !== 'id') {
                            delta[prefix + '_' + itemData.id + '_' + index]  = itemData[index].toString();
                        }
                    }

                    // Element changed Data
                    delta.changed_element                           = prefix + '_' + itemData.id + '_' + canvasStorage.util.getNextChangeId();

                    canvasStorage.util.storeDelta(delta);
                    canvasStorage.list.cache.cacheItem(prefix, combinedData.data);
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.storageModule.list.update(prefix, itemData);
                }
            };


        /*  Get the item data from the prefix list by item id. */
            canvasStorage.list.get = function(prefix, itemId) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var itemData        = null;
                var cachedItemData  = canvasStorage.list.cache.getCachedItemId(prefix, itemId);

                if(cachedItemData !== null) {
                    itemData    = cachedItemData.data;
                }

                return itemData;
            };


        /*  Get all item data for prefix list. */
            canvasStorage.list.getAll = function(prefix) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

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
