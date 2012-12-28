/*jshint jquery:true */


define(
    ['jquery', 'storage/canvasStorage', 'util'],
    function($, canvasStorage, util) {
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

            canvasStorage.list.add('custom_deck', extraFields);
        };


        /* Remove a custom deck. */
        customDecks.model.remove = function(event, deckId) {
//            $(window).trigger('widget:connection:model:delete_for_card', [cardId]);

            var extraFields     = customDecks.model.getFields();
            extraFields.id      = deckId;

            canvasStorage.list.remove('custom_deck', extraFields);
        };


        customDecks.model.removeAll = function() {
//            $(window).trigger('widget:connection:model:remove_all');

            canvasStorage.list.removeAll('custom_deck', customDecks.model.getFields());
        };


        /* Get the deck with the specified deck id. */
        customDecks.model.get = function(deckId) {
            return canvasStorage.list.get('custom_deck', deckId);
        };


        customDecks.model.getAll = function() {
            return canvasStorage.list.getAll('custom_deck');
        };


        // Initialise custom deck handlers
        customDecks.init();


        return customDecks;
    }
);
