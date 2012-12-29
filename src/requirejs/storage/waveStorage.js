/*jshint jquery:true */


define( ['jquery'],
        function($) {
            'use strict';

            var waveStorage = {};

            waveStorage.init = function() {
                var canvas  = require('canvas');

                // State callback
                wave.setStateCallback(function() {

                    // First call
                    if(!canvasStorage.ready) {
                        canvasStorage.ready             = true;
                        canvasStorage.runningVersion    = canvasStorage.util.getData('data_version');
                        canvasStorage.cachedZIndex      = canvasStorage.util.getData('z_index');

                        // Called when cache has been initialised
                        var initComplete    = function() {
                            waveStorage.uiUpdate();
                            canvasStorage.firstRun();
                            canvas.hideLoadingDialog();
                        };

                        // Initialisation of cache
                        canvasStorage.storageModule.initialiseAllCaches(initComplete);
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

            waveStorage.uiUpdate = function() {
                canvasStorage.standardPropagate();
            };

            return waveStorage;
        }
);
