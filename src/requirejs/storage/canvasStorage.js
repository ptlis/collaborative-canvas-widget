/*jshint jquery:true */


define( ['jquery', 'require', 'storage/lsStorage', 'storage/roleStorage', 'storage/waveStorage'],
        function($, require, lsStorage, roleStorage, waveStorage) {
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

        /*  The startup function */
            canvasStorage.firstRunFunc      = undefined;


        /*  'namespaces' for canvasStorage features */
            canvasStorage.changeHandlers        = {};
            canvasStorage.util                  = {};
            canvasStorage.list                  = {};
            canvasStorage.list.notifications    = {};
            canvasStorage.list.cache            = {};




        /*  Initialisation function. */
            canvasStorage.init = function(storageMethod, firstRunFunc) {
                canvasStorage.method        = storageMethod;
                canvasStorage.firstRunFunc  = firstRunFunc;

                switch(canvasStorage.method) {
                    case 'wave':
                    case 'role':
                    case 'localStorage':
                        break;

                    default:
                        throw 'storage mechanism not available';
                }
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
                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {
                    canvasStorage.util.storeDelta({'data_version': canvasStorage.version});
                }

                else if(canvasStorage.method === 'role') {
                    canvasStorage.roleResources.base.getRepresentation(
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

                            canvasStorage.roleResources.base.setRepresentation(
                                data,
                                'application/json'
                            );

                        }
                    );
                }

                canvasStorage.runningVersion    = canvasStorage.version;
            };


        /*  Generate JSON datastructe containing all data */
            canvasStorage.exportData = function() {
                var cards               = require('cards');
                var connections         = require('connections');
                var containers          = require('containers');
                var decks               = require('decks');
                var fields              = require('fields');

                var allData             = {};

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {

                    allData.data_version    = canvasStorage.getRunningVersion();
                    allData.z_index         = canvasStorage.cachedZIndex;
                    allData.change_id       = canvasStorage.util.getData('change_id');
                    allData.cards           = cards.model.getAll();
                    allData.connections     = connections.model.getAll();
                    allData.containers      = containers.model.getAll();
                    allData.decks           = decks.model.getAll();
                    allData.fields          = fields.model.getAll();
                }

                else if(canvasStorage.method === 'role') {

                    allData.data_version    = canvasStorage.getRunningVersion();
                    allData.z_index         = canvasStorage.cachedZIndex;
                    allData.cards           = cards.model.getAll();
                    allData.connections     = connections.model.getAll();
                    allData.containers      = containers.model.getAll();
                    allData.decks           = decks.model.getAll();
                    allData.fields          = fields.model.getAll();
                }

                return allData;
            };


            /*  Import JSON datastructure & overwrite current data. */
            canvasStorage.importData = function(importedData) {
                if(importedData.data_version !== canvasStorage.version) {
                    throw 'Data version mismatch between import and application';
                }

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {

                    // localStorage clear
                    if(canvasStorage.method === 'localStorage') {
                        localStorage.clear();
                    }

                    // wave clear
                    else {
                        throw "'importData' not implemented for wave";
                        // TODO: CLEAR
                    }


                    var i;
                    var index;

                    // Process standard data
                    var processedData   = {
                        'data_version'  : importedData.data_version,
                        'z_index'       : importedData.z_index,
                        'change_id'     : importedData.change_id
                    };



                    // Process containers
                    var containerId;
                    for(i = 0; i < importedData.containers.length; i++) {
                        containerId = importedData.containers[i].id;
                        delete(importedData.containers[i].id);

                        if(i === 0) {
                            processedData.container_first   = containerId;
                        }

                        for(index in importedData.containers[i]) {
                            if(importedData.containers[i].hasOwnProperty(index) && importedData.containers[i][index] !== null) {
                                processedData['container_' + containerId + '_' + index] = importedData.containers[i][index];
                            }
                        }
                    }


                    // Process cards data.
                    var cardId;
                    for(i = 0; i < importedData.cards.length; i++) {
                        cardId      = importedData.cards[i].id;
                        delete(importedData.cards[i].id);

                        if(i === 0) {
                            processedData.card_first    = cardId;
                        }

                        for(index in importedData.cards[i]) {
                            if(importedData.cards[i].hasOwnProperty(index) && importedData.cards[i][index] !== null) {
                                if(typeof(importedData.cards[i][index]) === 'string') {
                                    processedData['card_' + cardId + '_' + index]   = importedData.cards[i][index];
                                }

                                else if(typeof(importedData.cards[i][index]) === 'object') {
                                    for(var innerIndex in importedData.cards[i][index]) {
                                        if(importedData.cards[i][index].hasOwnProperty(innerIndex)) {
                                            processedData['card_' + cardId + '_' + innerIndex]   = importedData.cards[i][index][innerIndex];
                                        }
                                    }
                                }
                            }
                        }
                    }


                    // Process connections
                    var connectionId;
                    for(i = 0; i < importedData.connections.length; i++) {
                        connectionId    = importedData.connections[i].id;
                        delete(importedData.connections[i].id);

                        if(i === 0) {
                            processedData.connection_first  = connectionId;
                        }

                        for(index in importedData.connections[i]) {
                            if(importedData.connections[i].hasOwnProperty(index) && importedData.connections[i][index] !== null) {
                                processedData['connection_' + connectionId + '_' + index] = importedData.connections[i][index];
                            }
                        }
                    }


                    // Process decks
                    var deckId;
                    for(i = 0; i < importedData.decks.length; i++) {
                        deckId    = importedData.decks[i].id;
                        delete(importedData.decks[i].id);

                        if(i === 0) {
                            processedData.deck_first    = deckId;
                        }

                        for(index in importedData.decks[i]) {
                            if(importedData.decks[i].hasOwnProperty(index) && importedData.decks[i][index] !== null) {
                                processedData['deck_' + deckId + '_' + index] = importedData.decks[i][index];
                            }
                        }
                    }


                    // Process fields
                    var fieldId;
                    for(i = 0; i < importedData.fields.length; i++) {
                        fieldId    = importedData.fields[i].id;
                        delete(importedData.fields[i].id);

                        if(i === 0) {
                            processedData.field_first   = fieldId;
                        }

                        for(index in importedData.fields[i]) {
                            if(importedData.fields[i].hasOwnProperty(index) && importedData.fields[i][index] !== null) {
                                processedData['field_' + fieldId + '_' + index] = importedData.fields[i][index];
                            }
                        }
                    }

                    canvasStorage.util.storeDelta(processedData);

                    canvasStorage.list.cache.initialise('container');
                    canvasStorage.list.cache.initialise('card');
                    canvasStorage.list.cache.initialise('connection');
                    canvasStorage.list.cache.initialise('deck');
                    canvasStorage.list.cache.initialise('field');
                }

                else if(canvasStorage.method === 'role') {
                    throw "'importData' not implemented for ROLE";
                }
            };


        /*  Trigger events to propagate updated data. */
            canvasStorage.standardPropagate = function() {
                $(window).trigger('widget:container:view:update_all');
                $(window).trigger('widget:field:view:update_all');
                $(window).trigger('widget:card:view:update_all');
                $(window).trigger('widget:connection:view:update_all');
                $(window).trigger('widget:deck:view:update_all');

                // Handle container resizing
                $(window).trigger('widget:container:view:resize');
            };


        /*  Sets the localStorage update function */
            canvasStorage.setLocalStorageUIUpdateFunc = function(uiUpdateFunction) {
                var canvas  = require('canvas');

                if(canvasStorage.method === 'localStorage') {

                    // Update this browser context if changes are made on other
                    $(window)
                        .off('storage')
                        .on('storage', uiUpdateFunction);

                    canvasStorage.ready             = true;

                    canvasStorage.runningVersion    = canvasStorage.util.getData('data_version');
                    canvasStorage.cachedZIndex      = canvasStorage.util.getData('z_index');

                    window.setTimeout(function() {

                        // Initialisation of cache
                        for(var i = 0; i < canvasStorage.storedLists.length; i++) {
                            canvasStorage.list.cache.initialise(canvasStorage.storedLists[i]);
                        }

                        canvasStorage.standardPropagate();    // TODO: Better way of calling (this is passed as a param in another func)

                        canvas.hideLoadingDialog();
                    }, 1000);
                }
            };


        /*  Sets the wave storage update function */
            canvasStorage.setWaveUIUpdateFunc = function(uiUpdateFunction) {
                var canvas  = require('canvas');

                // Update this widget if changes are detected
                if(canvasStorage.method === 'wave') {

                    wave.setStateCallback(function() {
                        if(!canvasStorage.ready) {
                            canvasStorage.ready             = true;
                            canvasStorage.runningVersion    = canvasStorage.util.getData('data_version');

                            // Initialisation of cache
                            for(var i = 0; i < canvasStorage.storedLists.length; i++) {
                                canvasStorage.list.cache.initialise(canvasStorage.storedLists[i]);
                            }

                            canvasStorage.firstRunFunc();
                            canvas.hideLoadingDialog();
                        }
                    });
                }
            };


        /*  Sets the wave participant update function */
            canvasStorage.setWaveParticipantUpdateFunc = function(participantUpdateFunction) {
                if(canvasStorage.method === 'wave') {
                    wave.setParticipantCallback(function() {
                        participantUpdateFunction();
                    });
                }
            };


        /*  Sets the ROLE storage update function */
            canvasStorage.setROLEUIUpdateFunc = function(uiUpdateFunc) {
                var canvas  = require('canvas');

                if(!canvasStorage.ready) {
                }
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

                var data;

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
                    canvasStorage.cachedZIndex      = parseInt(canvasStorage.cachedZIndex, 10) + 1;

                    var data    = {
                        'data_version': canvasStorage.version,
                        'z_index':      nextZIndex
                    };

                    canvasStorage.roleResources.base.setRepresentation(
                        data,
                        'application/json',
                        function() {

                        }
                    );

                    canvasStorage.list.notifications.add('UPDATE_Z_INDEX', data, 'ptlis.net:base');
                    canvasStorage.list.notifications.publish();
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




    /*  List notification functions */

        /*  Array of queued notifications awaiting publishing*/
            canvasStorage.list.notifications.queued = [];


        /* Add a notification to the queued list */
            canvasStorage.list.notifications.add = function(action, itemData, namespace) {
                var intentData = {
                    'ns'        : namespace,
                    'action'    : action,
                    'data'      : itemData
                };

                canvasStorage.list.notifications.queued.push(intentData);
            };


        /* Publish queued notifications. */
            canvasStorage.list.notifications.publish = function() {
                var intent  = {
                    'component':    '',
                    'data':         'http://ptlis.net/dummy',
                    'dataType':     'text/json',
                    'action':       'UPDATE',
                    'flags':        ['PUBLISH_GLOBAL'],
                    'extras':       {
                        'user':     openapp.param.user(),
                        'data':     canvasStorage.list.notifications.queued
                    }
                };

                if(iwc.util.validateIntent(intent)) {
                    canvasStorage.iwcClient.publish(intent);

                    canvasStorage.list.notifications.queued = [];
                }
                else {
                    throw 'Invalid / malformed intent';
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
                'card'          : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'connection'    : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'container'     : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'deck'          : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'field'         : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'custom_deck'   : {
                    firstItemId     : null,
                    lastItemId      : null
                },
                'custom_card'   : {
                    firstItemId     : null,
                    lastItemId      : null
                }
            };


        /*  Initialise cache from storage medium */
            canvasStorage.list.cache.initialise = function(prefix, completeCallback) {
                var cards               = require('cards');
                var connections         = require('connections');
                var containers          = require('containers');
                var decks               = require('decks');
                var fields              = require('fields');

                if(!canvasStorage.ready) {
                    throw 'canvasStorage not initialised';
                }

                if(canvasStorage.method === 'wave' || canvasStorage.method === 'localStorage') {

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
                            }

                            var index;

                            // Add data for extra fields
                            for(index in extraFields) {
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


                    canvasStorage.cacheInitialised[prefix]  = true;

                    // If provided execute callback
                    if(typeof(completeCallback) !== 'undefined') {
                        completeCallback();
                    }
                }

                else if(canvasStorage.method === 'role') {

                    var type    = 'ptlis.net:' + prefix  + '';

                    canvasStorage.roleResources[prefix + 'List'].getRepresentation('rdfjson', function(listRepresentation) {

                        if('firstItemId' in listRepresentation && listRepresentation.hasOwnProperty('firstItemId')) {
                            canvasStorage.list.cache.setFirstItemId(prefix, listRepresentation.firstItemId);
                        }

                        var cacheFunc   = function(prefix, resourceArr, index) {

                            resourceArr[index].getRepresentation('rdfjson', function(representation) {
                                canvasStorage.list.cache.cacheItem(prefix, representation, resourceArr[index].getURI());

                                // Cache initialised
                                if(index + 1 === resourceArr.length) {
                                    canvasStorage.cacheInitialised[prefix]  = true;

                                    canvasStorage.list.cache.setLastItemId(prefix, representation.id);
                                }
                            });
                        };

                        canvasStorage.roleResources[prefix + 'List'].getSubResources({
                            'relation': openapp.ns.role + 'data',
                            'type':     type,
                            'onAll':    function(listResArr) {

                                if(listResArr.length > 0) {
                                    for(var i = 0; i < listResArr.length; i++) {
                                        cacheFunc(prefix, listResArr, i);
                                    }
                                }

                                else {
                                    canvasStorage.cacheInitialised[prefix]  = true;
                                }
                            }
                        });
                    });
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
                    var type                    = 'ptlis.net:' + prefix;
                    var listResource            = canvasStorage.roleResources[prefix + 'List'];
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
                                canvasStorage.list.notifications.add('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
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
                                canvasStorage.list.notifications.add('UPDATE', prevItemData, 'ptlis.net:' + prefix);

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
                            canvasStorage.list.notifications.add('UPDATE', relativeToItemData, 'ptlis.net:' + prefix);

                            // Add the element itself
                            newItemData.next                                       = relativeToId;

                            canvasStorage.list.cache.cacheItem(prefix, newItemData);   // Cache without URI first
                            listResource.create({
                                'relation':         openapp.ns.role + 'data',
                                'type':             type,
                                'representation':   newItemData,
                                'callback':         function(subResource) {
                                    canvasStorage.list.cache.cacheItem(prefix, newItemData, subResource.getURI()); // Update cache with uri
                                    canvasStorage.list.notifications.add('ADD', canvasStorage.list.cache.getCachedItemId(prefix, newItemData.id), 'ptlis.net:' + prefix);
                                    canvasStorage.list.notifications.publish();
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
                                canvasStorage.list.notifications.add('UPDATE', nextItemData, 'ptlis.net:' + prefix);

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
                            canvasStorage.list.notifications.add('UPDATE', relativeToItemData, 'ptlis.net:' + prefix);

                            // Add the element itself
                            newItemData.prev                        = relativeToId;

                            canvasStorage.list.cache.cacheItem(prefix, newItemData);   // Cache without URI first
                            listResource.create({
                                'relation':         openapp.ns.role + 'data',
                                'type':             type,
                                'representation':   newItemData,
                                'callback':         function(subResource) {
                                    canvasStorage.list.cache.cacheItem(prefix, newItemData, subResource.getURI()); // Update cache with uri
                                    canvasStorage.list.notifications.add('ADD', canvasStorage.list.cache.getCachedItemId(prefix, newItemData.id), 'ptlis.net:' + prefix);
                                    canvasStorage.list.notifications.publish();
                                }
                            });

                            break;

                    }


                }

                // TODO: Handle with param (also not role ready)
                if(prefix === 'card') {
                    newItemData.size            = 'medium';
                }
                if(prefix === 'connection') {
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

                    var listResource    = canvasStorage.roleResources[prefix + 'List'];

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
                        canvasStorage.list.notifications.add('UPDATE', lastItemData, 'ptlis.net:' + prefix);
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
                        canvasStorage.list.notifications.add('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
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
                            canvasStorage.list.notifications.add('ADD', canvasStorage.list.cache.getCachedItemId(prefix, newItemData.id), 'ptlis.net:' + prefix);
                            canvasStorage.list.notifications.publish();
                        }
                    });
                }


                // TODO: Handle with param (also not role ready)
                if(prefix === 'card') {
                    newItemData.size            = 'medium';
                }
                if(prefix === 'connection') {
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

                    var listResource    = canvasStorage.roleResources[prefix + 'List'];

                    // Items already exist in cache, find the last item
                    if(lastItemId) {
                        lastItemData    = canvasStorage.list.cache.getCachedItemId(prefix, lastItemId);
                    }

                    // Items already exist, update last item's next value
                    if(lastItemData) {
                        lastItemData.data.next      = newItemDataArr[0].id;
                        var lastItemResource    = new openapp.oo.Resource(lastItemData.uri);

                        lastItemResource.setRepresentation(
                            lastItemData.data,
                            'application/json'
                        );
                        canvasStorage.list.cache.cacheItem(prefix, lastItemData.data, lastItemData.uri);
                        canvasStorage.list.notifications.add('UPDATE', lastItemData, 'ptlis.net:' + prefix);
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
                        canvasStorage.list.notifications.add('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
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
                                canvasStorage.list.notifications.add('ADD', canvasStorage.list.cache.getCachedItemId(prefix, itemData.id), 'ptlis.net:' + prefix);
                                canvasStorage.list.notifications.publish();
                            }
                        });

                    };

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


                        createItem(prefix, newItemDataArr[i]);
                    }
                }

                // TODO: These events should be emitted by canvasStorage.list.cache.cacheItem
                for(i = 0; i < newItemDataArr.length; i++) {

                    // TODO: Handle with param (also not role ready)
                    if(prefix === 'card') {
                        newItemDataArr[i].size          = 'medium';
                    }
                    if(prefix === 'connection') {
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
                    if(prefix === 'card') {
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

                    var listResource    = canvasStorage.roleResources[prefix + 'List'];
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
                        canvasStorage.list.notifications.add('UPDATE', prevData, 'ptlis.net:' + prefix);

                        nextItemResource    = new openapp.oo.Resource(nextData.uri);
                        nextItemResource.setRepresentation(
                            nextData.data,
                            'application/json'
                        );
                        canvasStorage.list.cache.cacheItem(prefix, nextData.data, nextData.uri);
                        canvasStorage.list.notifications.add('UPDATE', nextData, 'ptlis.net:' + prefix);

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
                        canvasStorage.list.notifications.add('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');
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
                        canvasStorage.list.notifications.add('CHANGE_FIRST_ID', representation, 'ptlis.net:' + prefix + '_list');


                        nextData                = canvasStorage.list.cache.getCachedItemId(prefix, itemData.data.next);
                        nextData.data.prev      = null;

                        nextItemResource    = new openapp.oo.Resource(nextData.uri);
                        nextItemResource.setRepresentation(
                            nextData.data,
                            'application/json'
                        );
                        canvasStorage.list.cache.cacheItem(prefix, nextData.data, nextData.uri);
                        canvasStorage.list.notifications.add('UPDATE', nextData, 'ptlis.net:' + prefix);
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
                        canvasStorage.list.notifications.add('UPDATE', prevData, 'ptlis.net:' + prefix);

                        canvasStorage.list.cache.setLastItemId(prefix, prevData.data.id);
                    }

                    var itemResource        = new openapp.oo.Resource(itemData.uri);
                    itemResource.del(function() {
                    });

                    canvasStorage.list.cache.deleteCachedItem(prefix, itemData.data.id);
                    canvasStorage.list.notifications.add('REMOVE', itemData, 'ptlis.net:' + prefix);
                    canvasStorage.list.notifications.publish();
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
                        if(prefix === 'card') {
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
                }

                else if(canvasStorage.method === 'role') {

                    var listResource    = canvasStorage.roleResources[prefix + 'List'];

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

                    for(i = 0; i < itemArr.length; i++) {
                        canvasStorage.list.notifications.add('REMOVE', itemArr[i], 'ptlis.net:' + prefix);
                    }
                    canvasStorage.list.notifications.publish();
                }

                canvasStorage.list.cache.deleteAllCachedItems(prefix);

                $(window).trigger('widget:' + prefix + ':view:remove_all');
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


                    var itemResource    = new openapp.oo.Resource(combinedData.uri);
                    itemResource.setRepresentation(
                        combinedData.data,
                        'application/json'
                    );
                    canvasStorage.list.cache.cacheItem(prefix, combinedData.data, combinedData.uri);
                    canvasStorage.list.notifications.add('UPDATE', combinedData, 'ptlis.net:' + prefix);
                    canvasStorage.list.notifications.publish();
                }
            };


            return canvasStorage;
        }
);