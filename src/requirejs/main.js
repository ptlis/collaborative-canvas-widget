/*jshint jquery:true */


requirejs.config({
    shim: {
        'jquery.base64': {
            'deps':	    ['jquery'],
            'exports':  'jquery.fn.base64'
        },

        'jquery.ui': {
            'deps':     ['jquery']
        },

        'jquery.contextMenu': {
            'deps':     ['jquery'],
            'exports':  'jquery.fn.contextMenu'
        },
        
        'jquery.ui.position': {
            'deps':     ['jquery']
        }
    }
});

require([
            'lib/jquery.base64',
            'lib/jquery.contextMenu',
            'lib/jquery.ui',

            'card_specific/templates/selectable_prompts',
            'card_specific/multimedia',
            'card_specific/sticky',
            'card_specific/ld',
            'card_specific/hlm',
            'card_specific/information_skills',
            'card_specific/assessment',


            'canvasStorage',
            'cards',
            'connections',
            'containers',
            'decks',
            'fields',
            'util',
            'canvas'
        ],
        function($) {




});
