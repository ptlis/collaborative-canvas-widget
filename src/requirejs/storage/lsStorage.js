/*jshint jquery:true */


define( ['jquery', 'storage/canvasStorage', 'storage/kvpStorage'],
        function($,canvasStorage, kvpStorage) {
            'use strict';

            var lsStorage   = {};
            lsStorage.list  = {};



    /*  Storage functionality specific to localStorage. */
            var deferredDelta   = {};

            var storeDelta = function(delta, deferred) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var key = null;

                // Defer the storage action
                if(deferred) {
                    for(key in delta) {
                        if(delta.hasOwnProperty(key)) {
                            // Store delta
                           deferredDelta[key]    = delta[key];
                        }
                    }
                }

                // Store delta combined with deferred delta
                else {
                    // Handle deferred data
                    for(key in deferredDelta) {
                        if(deferredDelta.hasOwnProperty(key)) {
                            if(!(key in delta)) {
                                delta[key]      = deferredDelta[key];
                            }

                        }
                    }
                    deferredDelta = {};

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
            };


            var getData = function(key) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                var data    = localStorage.getItem(key);
                if(typeof(data) === 'string' && data.length < 1) {
                    data        = null;
                }
                return data;
            };





        /*  Initialisation */
            lsStorage.init = function() {
                var canvas          = require('canvas');

                canvasStorage.ready             = true;
                canvasStorage.runningVersion    = getData('data_version');
                canvasStorage.cachedZIndex      = getData('z_index');

                // Called when cache has been initialised
                var initComplete    = function() {
                    canvasStorage.standardPropagate();
                    canvas.hideLoadingDialog();

                    // Update this browser context if changes are made on other
                    $(window)
                        .off('storage')
                        .on('storage', lsStorage.uiUpdate);
                };

                // Initialisation of cache
                lsStorage.initialiseAllCaches(initComplete);
            };



        /*  Process events to update UI. */
            lsStorage.uiUpdate = function(event) {
                // Only fire when changed_element is updated (performance optimisation)
                if(typeof(event) === 'undefined' || event.originalEvent.key === 'changed_element') {
                    canvasStorage.standardPropagate();
                }
            };


        /* Set the next z index. */
            lsStorage.setNextZIndex = function(nextZIndex) {
                kvpStorage.setNextZIndex(nextZIndex, storeDelta);
            };


        /*  Retrieve & store the API version */
            lsStorage.setRunningVersion = function() {
                kvpStorage.setRunningVersion(storeDelta);
            };


        /*  Initialise all storage caches. */
            lsStorage.initialiseAllCaches = function(completeCallback) {
                kvpStorage.initialiseAllCaches(getData, storeDelta, completeCallback);
            };


        /* Import data */
            lsStorage.importData = function(importedData) {
                kvpStorage.importData(importedData, storeDelta);
            };




    /*  List manipulation

        Wrap standard doubly linked-list functionality. */

        /*  Add the item in the specified position in prefix relative to the
            given item. */
            lsStorage.list.addPositioned = function(prefix, newItemData, position, relativeToId) {
                kvpStorage.list.addPositioned(prefix, newItemData, position, relativeToId, storeDelta);
            };


        /*  Add the item to the end of the prefix list. */
            lsStorage.list.add = function(prefix, newItemData) {
                kvpStorage.list.add(prefix, newItemData, storeDelta);
            };


        /*  Bulk insert of several items into prefix. */
            lsStorage.list.addMulti = function(prefix, newItemDataArr) {
                kvpStorage.list.addMulti(prefix, newItemDataArr, storeDelta);
            };


        /* Remove the item from the prefix list. */
            lsStorage.list.remove = function(prefix, remItemData) {
                kvpStorage.list.remove(prefix, remItemData, storeDelta);
            };


        /*  Remove all items from the prefix list. */
            lsStorage.list.removeAll = function(prefix, remItemData) {
                kvpStorage.list.removeAll(prefix, remItemData, storeDelta);
            };


        /*  Update item data in storage. */
            lsStorage.list.update = function(prefix, itemData) {
                kvpStorage.list.update(prefix, itemData, storeDelta);
            };


            return lsStorage;
        }
);
