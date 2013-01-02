/*jshint jquery:true */


/* Standard functionality for storage using key-value pairs. */
define( ['jquery', 'util', 'require', 'storage/canvasStorage'],
        function($, util, require, canvasStorage) {
            'use strict';


            var kvpStorage  = {};
            kvpStorage.list = {};

        /*  Used for localStorage, increments on every call & returns a number
            for the change (localStorage events only fire if value changed). */
            var getNextChangeId = function(storeDelta) {
                var nextChangeId;

                var changeId        = getData('change_id');
                var delta           = {};

                // No z-index stored
                if(changeId === null) {
                    nextChangeId    = 0;
                }

                else {
                    nextChangeId    = parseInt(changeId, 10) + 1;
                }

                delta.change_id     = nextChangeId.toString();

                storeDelta(delta, true);

                return nextChangeId;
            };


            /*  Cache initialisation. */
            kvpStorage.initialiseCache = function(prefix, getData, storeDelta, completeCallback) {

                var cards               = require('cards');
                var connections         = require('connections');
                var containers          = require('containers');
                var decks               = require('decks');
                var fields              = require('fields');
                var customCards         = require('customCards');
                var customDecks         = require('customDecks');

                var getFunc = function(prefix, instanceId) {

                    var itemData    = {};
                    itemData.id     = instanceId;
                    itemData.prev   = getData(prefix + '_' + itemData.id + '_prev');
                    itemData.next   = getData(prefix + '_' + itemData.id + '_next');

                    if(itemData.prev !== null || itemData.next !== null || itemData.id === canvasStorage.list.cache.getFirstItemId(prefix)) {

                        // Get extra fields ontop of standard id, prev & next
                        var extraFields = {};
                        switch(prefix) {
                            case 'cards':
                                extraFields = cards.model.getFields();
                                break;
                            case 'connections':
                                extraFields = connections.model.getFields();
                                break;
                            case 'containers':
                                extraFields = containers.model.getFields();
                                break;
                            case 'decks':
                                extraFields = decks.model.getFields();
                                break;
                            case 'fields':
                                extraFields = fields.model.getFields();
                                break;
                            case 'customCards':
                                extraFields = customCards.model.getFields();
                                break;
                            case 'customDecks':
                                extraFields = customDecks.model.getFields();
                                break;
                        }


                        // Add data for extra fields
                        for(var index in extraFields) {
                            if(extraFields.hasOwnProperty(index)) {
                                itemData[index]                         = getData(prefix + '_' + itemData.id + '_' + index);
                            }
                        }

                        // Card-specific 'special' extra fields
                        if(prefix === 'cards') {

                            var cardExtraFields = decks.getHandler(itemData.deck).getExtraFields(itemData.cardtype);

                            for(index in cardExtraFields) {
                                if(cardExtraFields.hasOwnProperty(index)) {
                                    itemData[index]                         = getData(prefix + '_' + itemData.id + '_' + index);

                                    if(itemData[index] === null) {
                                        delete itemData[index];
                                    }
                                }
                            }
                        }
                    }
                    else {
                        itemData    = null;
                    }

                    return itemData;
                };



                canvasStorage.list.cache.setFirstItemId(prefix, getData(prefix + '_first'));
                var currentId   = canvasStorage.list.cache.getFirstItemId(prefix);
                var nextId;
                var itemData;

                if(currentId) {
                    itemData        = getFunc(prefix, currentId);
                    nextId          = itemData.next;
                    canvasStorage.list.cache.cacheItem(prefix, itemData);

                    while(nextId !== null && nextId.length > 0) {
                        currentId       = nextId;
                        itemData        = getFunc(prefix, currentId);
                        nextId          = itemData.next;

                        canvasStorage.list.cache.cacheItem(prefix, itemData);
                    }

                    canvasStorage.list.cache.setLastItemId(prefix, itemData.id);
                }


                // If provided execute callback
                if(typeof(completeCallback) !== 'undefined') {
                    completeCallback();
                }
            };


        /*  Retrieve & store the API version */
            kvpStorage.setRunningVersion = function(storeDelta) {
                storeDelta({
                    'data_version': canvasStorage.version
                });
            };


        /* Set the next z index. */
            kvpStorage.setNextZIndex = function(nextZIndex, storeDelta) {
                storeDelta({
                    'z_index':  nextZIndex.version
                }, true);

                canvasStorage.cachedZIndex      = nextZIndex;
            };


        /*  Initialise all storage caches. */
            kvpStorage.initialiseAllCaches = function(getData, storeDelta, completeCallback) {
                var collector   = util.collector(canvasStorage.storedLists.length, completeCallback);
                for(var index in canvasStorage.storedLists) {
                    if(canvasStorage.storedLists.hasOwnProperty(index)) {
                        kvpStorage.initialiseCache(canvasStorage.storedLists[index], getData, storeDelta, collector);
                    }
                }
            };


        /* Import data */
            kvpStorage.importData = function(importedData, storeDelta) {

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
                    if(canvasStorage.storedLists.hasOwnProperty(index)) {
                        prefix          = canvasStorage.storedLists[index];
                        processedData   = processList(prefix, importedData[prefix], processedData);
                    }
                }

                storeDelta(processedData);


                // Initialisation of cache
                canvasStorage.storageModule.initialiseAllCaches(function() {
                    canvasStorage.standardPropagate();
                });
            };




    /*  List manipulation

        Wrap standard doubly linked-list functionality. */

        /*  Add the item in the specified position in prefix relative to the
            given item. */
            kvpStorage.list.addPositioned = function(prefix, newItemData, position, relativeToId, storeDelta) {
                var firstId             = canvasStorage.list.cache.getFirstItemId(prefix);
                var relativeToItemData  = canvasStorage.list.cache.getCachedItemId(prefix, relativeToId);

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
                delta.changed_element                           = prefix + '_' + newItemData.id + '_' + getNextChangeId(storeDelta);

                storeDelta(delta);
            };


        /*  Add the item to the end of the prefix list. */
            kvpStorage.list.add = function(prefix, newItemData, storeDelta) {
                var lastItemData    = null;
                var lastItemId      = canvasStorage.list.cache.getLastItemId(prefix);

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
                delta.changed_element                           = prefix + '_' + newItemData.id + '_' + getNextChangeId(storeDelta);

                storeDelta(delta);
            };


        /*  Bulk insert of several items into prefix. */
            kvpStorage.list.addMulti = function(prefix, newItemDataArr, storeDelta) {
                var lastItemData    = null;
                var lastItemId      = canvasStorage.list.cache.getLastItemId(prefix);
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

                    // Add data for extra fields
                    for(var index in newItemDataArr[i]) {
                        if(newItemDataArr[i].hasOwnProperty(index) && index !== 'id') {
                            delta[prefix + '_' + newItemDataArr[i].id + '_' + index]    = newItemDataArr[i][index];
                        }
                    }

                    canvasStorage.list.cache.cacheItem(prefix, newItemDataArr[i]);
                }

                // Element changed Data
                delta.changed_element                           = prefix + '_' + newItemDataArr[0].id + '_' + getNextChangeId(storeDelta);

                storeDelta(delta);
            };


        /* Remove the item from the prefix list. */
            kvpStorage.list.remove = function(prefix, remItemData, storeDelta) {
                var itemData    = canvasStorage.list.cache.getCachedItemId(prefix, remItemData.id);
                var prevData;
                var nextData;

                var decks       = require('decks');
                var delta       = {};
                var index       = null;

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
                    var deck        = itemData.data.deck;
                    var cardType    = itemData.data.cardtype;
                    var cardExtraFields = decks.getHandler(deck).getExtraFields(cardType);

                    for(index in cardExtraFields) {
                        if(cardExtraFields.hasOwnProperty(index)) {
                            delta[prefix + '_' + remItemData.id + '_' + index]      = '';
                        }
                    }
                }

                delta.changed_element                           = prefix + '_' + remItemData.id + '_' + getNextChangeId(storeDelta);

                storeDelta(delta);

                canvasStorage.list.cache.deleteCachedItem(prefix, itemData.data.id);
            };


        /*  Remove all items from the prefix list. */
            kvpStorage.list.removeAll = function(prefix, remItemData, storeDelta) {
                var decks       = require('decks');

                var itemDataArr = canvasStorage.list.cache.getAllCachedItems(prefix);
                var index       = null;
                var delta       = {};
                delta[prefix + '_first']    = '';

                for(var i = 0; i < itemDataArr.length; i++) {
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
                        var deck        = itemDataArr[i].data.deck;
                        var cardType    = itemDataArr[i].data.cardtyp;
                        var cardExtraFields = decks.getHandler(deck).getExtraFields(cardType);

                        for(index in cardExtraFields) {
                            if(cardExtraFields.hasOwnProperty(index)) {
                                delta[prefix + '_' + itemDataArr[i].data.id + '_' + index]      = '';
                            }
                        }
                    }
                }

                storeDelta(delta);
            };


        /*  Update item data in storage. */
            kvpStorage.list.update = function(prefix, itemData, storeDelta) {
                var combinedData    = canvasStorage.list.cache.getCachedItemId(prefix, itemData.id);

                var delta       = {};

                // Update data for extra fields
                for(var index in itemData) {
                    if(itemData.hasOwnProperty(index) && index !== 'id') {
                        delta[prefix + '_' + itemData.id + '_' + index]  = itemData[index].toString();
                    }
                }

                // Element changed Data
                delta.changed_element                           = prefix + '_' + itemData.id + '_' + getNextChangeId(storeDelta);

                storeDelta(delta);
                canvasStorage.list.cache.cacheItem(prefix, combinedData.data);
            };


            return kvpStorage;
        }
);
