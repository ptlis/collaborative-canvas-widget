/*jshint jquery:true */


define( ['jquery', 'storage/canvasStorage', 'storage/kvpStorage'],
        function($, canvasStorage, kvpStorage) {
            'use strict';

            var waveStorage = {};
            waveStorage.list  = {};




    /*  Storage functionality specific to wave. */
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

                    wave.submitDelta(delta);
                }
            };


            var getData = function(key) {
                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                data    = wave.getState().get(key);
                if(typeof(data) === 'undefined' || data.length < 1) {
                    data    = null;
                }
            };



        /*  Initialisation */
            waveStorage.init = function() {
                var canvas  = require('canvas');

                // State callback
                wave.setStateCallback(function() {

                    // First call
                    if(!canvasStorage.ready) {
                        canvasStorage.ready             = true;
                        canvasStorage.runningVersion    = getData('data_version');
                        canvasStorage.cachedZIndex      = getData('z_index');

                        // Called when cache has been initialised
                        var initComplete    = function() {
                            waveStorage.uiUpdate();
                            canvasStorage.firstRun();
                            canvas.hideLoadingDialog();
                        };

                        // Initialisation of cache
                        waveStorage.initialiseAllCaches(initComplete);
                    }

                    // Subsequent calls
                    else {
                        waveStorage.uiUpdate();
                    }
                });

                // Stub function for participant callback
                wave.setParticipantCallback(function() {
                });
            };


        /*  Initialise all storage caches. */
            waveStorage.uiUpdate = function() {
                canvasStorage.standardPropagate();
            };


        /* Set the next z index. */
            waveStorage.setNextZIndex = function(nextZIndex) {
                kvpStorage.setNextZIndex(nextZIndex, storeDelta);
            };


        /*  Retrieve & store the API version */
            waveStorage.setRunningVersion = function() {
                kvpStorage.setRunningVersion(storeDelta);
            };


        /*  Initialise all storage caches. */
            waveStorage.initialiseAllCaches = function(completeCallback) {
                kvp.initialiseAllCaches(getData, storeDelta, completeCallback);
            };


        /* Import data */
            waveStorage.importData = function(importedData) {
                kvpStorage.importData(importedData, storeDelta);
            };




    /*  List manipulation

        Wrap standard doubly linked-list functionality. */

        /*  Add the item in the specified position in prefix relative to the
            given item. */
            waveStorage.list.addPositioned = function(prefix, newItemData, position, relativeToId) {
                kvpStorage.list.addPositioned(prefix, newItemData, position, relativeToId, storeDelta);
            };


        /*  Add the item to the end of the prefix list. */
            waveStorage.list.add = function(prefix, newItemData) {
                kvpStorage.list.add(prefix, newItemData, storeDelta);
            };


        /*  Bulk insert of several items into prefix. */
            waveStorage.list.addMulti = function(prefix, newItemDataArr) {
                kvpStorage.list.addMulti(prefix, newItemDataArr, storeDelta);
            };


        /* Remove the item from the prefix list. */
            waveStorage.list.remove = function(prefix, remItemData) {
                kvpStorage.list.remove(prefix, remItemData, storeDelta);
            };


        /*  Remove all items from the prefix list. */
            waveStorage.list.removeAll = function(prefix, remItemData) {
                kvpStorage.list.removeAll(prefix, remItemData, storeDelta);
            };


        /*  Update item data in storage. */
            waveStorage.list.update = function(prefix, itemData) {
                kvpStorage.list.update(prefix, itemData, storeDelta);
            };


            return waveStorage;
        }
);
