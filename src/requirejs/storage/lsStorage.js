/*jshint jquery:true */


define( ['jquery', 'require', 'util', 'storage/canvasStorage'],
        function($, require, util, canvasStorage) {
            'use strict';

            var lsStorage   = {};


        /*  Initialisation */
            lsStorage.init = function() {
                canvasStorage.ready             = true;
                canvasStorage.runningVersion    = canvasStorage.util.getData('data_version');
                canvasStorage.cachedZIndex      = canvasStorage.util.getData('z_index');


                var canvas          = require('canvas');

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
                var collector   = util.collector(canvasStorage.storedLists.length, initComplete);
                for(var i = 0; i < canvasStorage.storedLists.length; i++) {
                    initialiseCache(canvasStorage.storedLists[i], collector());
                }
            };



        /*  Process events to update UI. */
            lsStorage.uiUpdate = function(event) {
                // Only fire when changed_element is updated (performance optimisation)
                if(typeof(event) === 'undefined' || event.originalEvent.key === 'changed_element') {
                    canvasStorage.standardPropagate();
                }
            };



            /*  Cache initialisation. */
            var initialiseCache = function(prefix, completeCallback) {

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
                    itemData.prev   = canvasStorage.util.getData(prefix + '_' + itemData.id + '_prev');
                    itemData.next   = canvasStorage.util.getData(prefix + '_' + itemData.id + '_next');

                    if(itemData.prev !== null || itemData.next !== null || itemData.id === canvasStorage.list.cache.getFirstItemId(prefix)) {

                        // Get extra fields ontop of standard id, prev & next
                        var extraFields;
                        switch(prefix) {
                            case 'card':
                                extraFields = cards.model.getFields();
                                break;
                            case 'connection':
                                extraFields = connections.model.getFields();
                                break;
                            case 'container':
                                extraFields = containers.model.getFields();
                                break;
                            case 'deck':
                                extraFields = decks.model.getFields();
                                break;
                            case 'field':
                                extraFields = fields.model.getFields();
                                break;
                            case 'custom_card':
                                extraFields = customCards.model.getFields();
                                break;
                            case 'custom_deck':
                                extraFields = customDecks.model.getFields();
                                break;
                        }


                        // Add data for extra fields
                        for(var index in extraFields) {
                            if(extraFields.hasOwnProperty(index)) {
                                itemData[index]                         = canvasStorage.util.getData(prefix + '_' + itemData.id + '_' + index);
                            }
                        }

                        // Card-specific 'special' extra fields
                        if(prefix === 'card') {

                            var cardExtraFields = decks.getHandler(itemData.deck).getExtraFields(itemData.cardtype);

                            for(index in cardExtraFields) {
                                if(cardExtraFields.hasOwnProperty(index)) {
                                    itemData[index]                         = canvasStorage.util.getData(prefix + '_' + itemData.id + '_' + index);

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



                canvasStorage.list.cache.setFirstItemId(prefix, canvasStorage.util.getData(prefix + '_first'));
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


            return lsStorage;
        }
);
