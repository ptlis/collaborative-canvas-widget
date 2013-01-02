/*jshint jquery:true */


define(
    ['jquery', 'storage/canvasStorage'],
    function($, canvasStorage) {
        'use strict';

        var customDecks      = {};
        customDecks.model    = {};


        customDecks.init = function() {
            $(window)
                .off(   'widget:custom_deck:model:new')     .on('widget:custom_deck:model:new',                customDecks.model.add);
        };




    /* Model*/

        /* Required fields for custom deck. */
        customDecks.model.getFields = function() {
            return {
                name:           '',
                description:    '',
                colour:         '',
                icon_32x32:     '',
                icon_48x48:     ''
            };
        };


        /* Add a new custom deck. */
        customDecks.model.add = function(event, instanceId, name, description, colour, icon32x32URL, icon48x48URL) {
            var extraFields         = customDecks.model.getFields();
            extraFields.id          = instanceId;
            extraFields.name        = name;
            extraFields.description = description;
            extraFields.colour      = colour;
            extraFields.icon_32x32  = icon32x32URL;
            extraFields.icon_48x48  = icon48x48URL;

            canvasStorage.list.add('customDecks', extraFields);
        };


        /* Remove a custom deck. */
        customDecks.model.remove = function(event, deckId) {
//            $(window).trigger('widget:connections:model:delete_for_card', [cardId]);

            var extraFields     = customDecks.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.remove('customDecks', extraFields);
        };


        customDecks.model.removeAll = function() {
//            $(window).trigger('widget:connections:model:remove_all');

            canvasStorage.list.removeAll('customDecks', customDecks.model.getFields());
        };


        /* Get the deck with the specified deck id. */
        customDecks.model.get = function(deckId) {
            return canvasStorage.list.get('customDecks', deckId);
        };


        customDecks.model.getAll = function() {
            return canvasStorage.list.getAll('customDecks');
        };


        // Initialise custom deck handlers
        customDecks.init();


        return customDecks;
    }
);
