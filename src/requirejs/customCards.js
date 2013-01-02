/*jshint jquery:true */


define(
    ['jquery', 'storage/canvasStorage'],
    function($, canvasStorage) {
        'use strict';

        var customCards     = {};
        customCards.model   = {};




    /* Model*/

        /* Required fields for custom deck. */
        customCards.model.getFields = function() {
            return {
            };
        };


        /* Add a new custom deck. */
        customCards.model.add = function(event, instanceId) {
            var extraFields         = customCards.model.getFields();
            extraFields.id          = instanceId;

            canvasStorage.list.add('customCards', extraFields);
        };


        /* Remove a custom deck. */
        customCards.model.remove = function(event, deckId) {
//                $(window).trigger('widget:connections:model:delete_for_card', [cardId]);

            var extraFields     = customCards.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.remove('customCards', extraFields);
        };


        customCards.model.removeAll = function() {
//                $(window).trigger('widget:connections:model:remove_all');

            canvasStorage.list.removeAll('customCards', customCards.model.getFields());
        };


        /* Get the deck with the specified deck id. */
        customCards.model.get = function(deckId) {
            return canvasStorage.list.get('customCards', deckId);
        };


        customCards.model.getAll = function() {
            return canvasStorage.list.getAll('customCards');
        };


        return customCards;
    }
);
