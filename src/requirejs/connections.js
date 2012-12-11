/*jshint jquery:true */



define( ['jquery', 'require', 'canvasStorage', 'util', 'lib/raphael'],
        function($, require, canvasStorage, util, raphael) {
            'use strict';
            var connections = {
    
                /*  Card connections in form "cardConnections[fromid][toid] = connection" */
                cachedConnections:  {},
    
                /*  raphael SVG wrapper class */
                raphaelCanvas:      null,
    
                /*  Path used when creating new connections */
                newConnectionPath:  null,
    
                init : function() {
    
                    $(window)
                    .off(   'widget:connection:model:new')              .on('widget:connection:model:new',              connections.model.add)
                    .off(   'widget:connection:model:delete')           .on('widget:connection:model:delete',           connections.model.remove)
                    .off(   'widget:connection:model:remove_all')       .on('widget:connection:model:remove_all',       connections.model.removeAll)
                    .off(   'widget:connection:model:delete_for_card')  .on('widget:connection:model:delete_for_card',  connections.model.removeForCard)
                    .off(   'widget:connection:model:to_front')         .on('widget:connection:model:to_front',         connections.model.toFront)
    
                    .off(   'widget:connection:view:add')               .on('widget:connection:view:add',               connections.view.add)
                    .off(   'widget:connection:view:move')              .on('widget:connection:view:move',              connections.view.move)
                    .off(   'widget:connection:view:edit_label')        .on('widget:connection:view:edit_label',        connections.view.editLabel)
                    .off(   'widget:connection:view:move_for_card')     .on('widget:connection:view:move_for_card',     connections.view.moveForCard)
                    .off(   'widget:connection:view:remove')            .on('widget:connection:view:remove',            connections.view.remove)
                    .off(   'widget:connection:view:remove_all')        .on('widget:connection:view:remove_all',        connections.view.removeAll)
                    .off(   'widget:connection:view:update_all_paths')  .on('widget:connection:view:update_all_paths',  connections.view.updateAllPaths)
                    .off(   'widget:connection:view:update')            .on('widget:connection:view:update',            connections.view.update)
                    .off(   'widget:connection:view:to_front')          .on('widget:connection:view:to_front',          connections.view.toFront);

                    connections.raphaelCanvas   = Raphael('contain_drag', 0, 0);
/*
                    $('#contain_drag svg')[0].removeAttribute('width');
                    $('#contain_drag svg')[0].removeAttribute('height');*/
                },
    
    
                addEvents : function(connectionLabelElem) {
    
                    connections.removeEvents(connectionLabelElem);
    
                    var connectionId    = connectionLabelElem.data('instanceid');
    
                    connectionLabelElem.on('click', function() {
                        $(window).trigger('widget:connection:model:to_front', [connectionId]);
                    });
    
                    connectionLabelElem.find('.edit_button')
                    .on('click', function() {
                        $(window).trigger('widget:connection:view:edit_label', [connectionId]);
                    });
    
                    connectionLabelElem.find('.remove_button')
                    .on('click', function() {
                        $(window).trigger('widget:connection:model:delete', [connectionId]);
                    });
                },
    
    
                removeEvents : function(connectionLabelElem) {
    
                    connectionLabelElem.off('click');
    
                    connectionLabelElem.find('.edit_button')
                    .off('click');
    
                    connectionLabelElem.find('.remove_button')
                    .off('click');
                },
    
    
                updateAll : function() {
    
                    var storedConnections       = {};
                    var fromCardId;
                    var toCardId;
    
    
                    // Create storedConnections structure in same format as cardConnections
                    var tmpConnections          = connections.model.getAll();
                    for(var i = 0; i < tmpConnections.length; i++) {
                        if(!(tmpConnections[i].from in storedConnections)) {
                            storedConnections[tmpConnections[i].from]   =   {};
                        }
    
                        storedConnections[tmpConnections[i].from][tmpConnections[i].to] = tmpConnections[i];
                    }
    
                    // Find connections in storage but not on page
                    for(fromCardId in storedConnections) {
                        if(storedConnections.hasOwnProperty(fromCardId)) {
    
                            for(toCardId in storedConnections[fromCardId]) {
                                if(storedConnections[fromCardId].hasOwnProperty(toCardId)) {
    
                                    if(!(fromCardId in connections.cachedConnections && toCardId in connections.cachedConnections[fromCardId])) {
                                        storedConnections[fromCardId][toCardId].newConnection    = false;
    
                                        $(window).trigger('widget:connection:view:add',
                                                [
                                                 storedConnections[fromCardId][toCardId]
                                                 ]);
                                    }
                                }
                            }
                        }
                    }
    
    
    
    
                    // Find connections on page but not in storage
                    for(fromCardId in connections.cachedConnections) {
                        if(connections.cachedConnections.hasOwnProperty(fromCardId)) {
    
                            for(toCardId in connections.cachedConnections[fromCardId]) {
                                if(connections.cachedConnections[fromCardId].hasOwnProperty(toCardId)) {
    
                                    if(!(fromCardId in storedConnections && toCardId in storedConnections[fromCardId])) {
    
                                        $(window).trigger('widget:connection:view:remove', [storedConnections[fromCardId][toCardId]]);
                                    }
                                }
                            }
                        }
                    }
    
                    $(window).trigger('widget:connection:view:update_all_paths');
                },
    
    
                calculatePath : function(pos1, pos2) {
    
                    // Account for border on cell containers
                    var borderX = parseInt($('.cell_outer').css('border-left-width').replace('px', ''), 10);
                    var borderY = parseInt($('.cell_outer').css('border-top-width').replace('px', ''), 10);
    
                    var pos1Center  = {
                            'x':    pos1.x + borderX + (pos1.width / 2),
                            'y':    pos1.y + borderY + (pos1.height / 2)
                    };
    
                    var pos2Center  = {
                            'x':    pos2.x + borderX + (pos2.width / 2),
                            'y':    pos2.y + borderY + (pos2.height / 2)
                    };
    
                    var dxCenter    = Math.abs(pos1Center.x - pos2Center.x);
                    var dyCenter    = Math.abs(pos1Center.y - pos2Center.y);
                    var dx;
                    var dy;
    
                    var midPoint = {};
    
                    // End & Control Points
                    var EP1;
                    var EP2;
                    var CP1;
                    var CP2;
    
                    // Use top and bottom edges
                    if(dyCenter > dxCenter) {
                        if(pos1.y + borderY < pos2.y + borderY) {
                            EP1 = { 'x':    pos1Center.x,
                                    'y':    pos1.y + borderY + pos1.height};
    
                            EP2 = { 'x':    pos2Center.x,
                                    'y':    pos2.y + borderY};
                        }
                        else {
                            EP1 = { 'x':    pos2Center.x,
                                    'y':    pos2.y + borderY + pos2.height};
    
                            EP2 = { 'x':    pos1Center.x,
                                    'y':    pos1.y + borderY};
                        }
    
                        dy      = Math.abs(EP1.y - EP2.y);
    
                        CP1 = { 'x':    EP1.x,
                                'y':    EP1.y + parseInt(dy / 2, 10)};
    
                        CP2 = { 'x':    EP2.x,
                                'y':    EP1.y + parseInt(dy / 2, 10)};
    
    
                        midPoint.top = EP1.y + parseInt(dy / 2, 10);
    
                        if(pos1.x + borderX < pos2.x + borderX) {
                            midPoint.left    = pos1Center.x + parseInt(dxCenter / 2, 10);
                        }
                        else {
                            midPoint.left    = pos2Center.x + parseInt(dxCenter / 2, 10);
                        }
                    }
    
                    // Use left & right edges
                    else {
                        if(pos1.x + borderX < pos2.x + borderX) {
                            EP1 = { 'x':    pos1.x + borderX + pos1.width,
                                    'y':    pos1Center.y};
    
                            EP2 = { 'x':    pos2.x + borderX,
                                    'y':    pos2Center.y};
                        }
                        else {
                            EP1 = { 'x':    pos2.x + borderX + pos2.width,
                                    'y':    pos2Center.y};
    
                            EP2 = { 'x':    pos1.x + borderX,
                                    'y':    pos1Center.y};
                        }
    
                        dx      = Math.abs(EP1.x - EP2.x);
    
                        CP1 = { 'x':    EP1.x + parseInt(dx / 2, 10),
                                'y':    EP1.y};
    
                        CP2 = { 'x':    EP1.x + parseInt(dx / 2, 10),
                                'y':    EP2.y};
    
                        midPoint.left    = EP1.x + parseInt(dx / 2, 10);
    
                        if(pos1.y + borderY < pos2.y + borderY) {
                            midPoint.top     = pos1Center.y + parseInt(dyCenter / 2, 10);
                        }
                        else {
                            midPoint.top     = pos2Center.y + parseInt(dyCenter / 2, 10);
                        }
                    }
    
    
                    /*
                        // Use De Casteljau's Algorithm to calculate the midpoint of the curve
                        // http://www.cs.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/de-casteljau.html
                        var position   = 0.5;               // The position we want the coordinates of (0-1)
                        var p   = [newEP1, newCP1, newCP2, newEP2];     // The curve's points
                        var q   = [];
                        
                        var i;
                        for(i = 0; i < p.length; i++) {
                            q[i]    = { 'x':    p[i].x,
                                        'y':    p[i].y};
                        }
                        
                        for(i = 1; i < p.length; i++) {
                            for(var j = 0; j < p.length - i; j++) {
                                q[j].x    = ((1 - position) * q[j].x) + (position * q[j + 1].x);
                                q[j].y    = ((1 - position) * q[j].y) + (position * q[j + 1].y);
                            }
                        }
                        
                        var midPoint    = {
                            'top':      q[0].y,
                            'left':     q[0].x
                        };
    
     console.log('old x' + midPoint.left + ' y ' + midPoint.top);
     console.log('new x' + newMidPoint.left + ' y ' + newMidPoint.top);*/
    
    
                    return {
                        'path':     [
                                     'M',
                                     EP1.x,
                                     EP1.y,
                                     'C',
                                     CP1.x,
                                     CP1.y,
                                     CP2.x,
                                     CP2.y,
                                     EP2.x,
                                     EP2.y
                                     ].join(','),
                                     'midpoint': midPoint
                    };
                },
    
    
                model : {
                    getFields : function() {
    
                        return {
                            from:       '',
                            to:         '',
                            label:      '',
                            z_index:    ''
                        };
                    },
    
    
                    add : function(event, connectionId, fromCardId, toCardId, labelString) {
    
                        var extraFields     = {};
                        extraFields.id      = connectionId;
                        extraFields.from    = fromCardId;
                        extraFields.to      = toCardId;
                        extraFields.label   = labelString;
                        extraFields.z_index = canvasStorage.util.getNextZIndex().toString();
    
                        canvasStorage.list.add('connection', extraFields);
                    },
    
    
                    remove : function(event, connectionId) {
    
                        var extraFields     = connections.model.getFields();
                        extraFields.id      = connectionId;
    
                        canvasStorage.list.remove('connection', extraFields);
                    },
    
    
                    removeAll : function() {
    
                        canvasStorage.list.removeAll('connection', connections.model.getFields());
                    },
    
    
                    removeForCard: function(event, cardId) {
    
                        var cardConnections = connections.model.getForCard(cardId);
    
                        for(var i = 0; i < cardConnections.length; i++) {
                            $(window).trigger('widget:connection:model:delete', [cardConnections[i].id]);
                        }
                    },
    
    
                    toFront : function(event, connectionId) {
    
                        var nextZIndex  = canvasStorage.util.getNextZIndex();
    
                        var extraFields = {
                                'id':       connectionId,
                                'z_index':  nextZIndex
                        };
    
                        canvasStorage.list.update('connection', extraFields);
    
                        $(window).trigger('widget:connection:view:to_front', [connectionId, nextZIndex]);
                    },
    
    
                    get : function(connectionId) {
    
                        return canvasStorage.list.get('connection', connectionId);
                    },
    
    
                    getForCard : function(cardId) {
    
                        var connectionDataArr   = connections.model.getAll();
                        var cardConnectionData  = [];
    
                        for(var i = 0; i < connectionDataArr.length; i++) {
    
                            if(connectionDataArr[i].from === cardId || connectionDataArr[i].to === cardId) {
                                cardConnectionData.push(connectionDataArr[i]);
                            }
                        }
    
                        return cardConnectionData;
                    },
    
    
                    getAll : function() {
    
                        return canvasStorage.list.getAll('connection');
                    },
    
    
                    exists : function(card1Id, card2Id) {
    
                        var exists              = false;
    
                        if(card1Id in connections.cachedConnections && connections.cachedConnections.hasOwnProperty(card1Id)
                                && card2Id in connections.cachedConnections[card1Id] && connections.cachedConnections[card1Id].hasOwnProperty(card2Id)) {
                            exists  = true;
                        }
    
                        else if(card2Id in connections.cachedConnections && connections.cachedConnections.hasOwnProperty(card2Id)
                                && card1Id in connections.cachedConnections[card2Id] && connections.cachedConnections[card2Id].hasOwnProperty(card1Id)) {
                            exists  = true;
                        }
    
                        return exists;
                    }
                },
    
    
                view : {
                    add : function(event, connectionData) {
    
                        var cards               = require('cards');
    
                        var connection          = { 'id':       connectionData.id,
                                'from':     connectionData.from,
                                'to':       connectionData.to};
    
                        var pathData            = connections.calculatePath(    cards.getCardDimensions(connectionData.from),
                                cards.getCardDimensions(connectionData.to));
    
                        var colour      = '#000';
    
                        var width;
                        switch(cards.zoomFactor) {
                        case '0.25':
                            width   = 2;
                            break;
    
                        case '0.375':
                        case '0.5':
                            width   = 3;
                            break;
    
                        case '0.625':
                        case '0.75':
                            width   = 4;
                            break;
    
                        case '0.875':
                        default:
                            width   = 5;
                        break;
                        }
    
                        connection.line         = connections.raphaelCanvas.path(pathData.path).attr(
                                {   'stroke':           colour,
                                    'fill':             'none',
                                    'stroke-width':     width
                                });
    
                        var labelCont           =   $('<div></div>', {
                            'class':            'connection_container',
                            'data-instanceid':  connectionData.id,
                            'data-prefix':      'connection'
                        });
    
                        var labelElem           =   $('<div></div>', {
                            'class':            'connection_label',
                            'data-inputname':   'label'
                        });
                        var labelText   = connectionData.label;
                        if(labelText === null) {
                            labelText   = '';
                        }
                        labelElem.text(labelText);
                        labelElem.appendTo(labelCont);
    
                        connection.label        = labelCont;
    
                        var editButton          =   $('<div></div>', {
                            'class':            'edit_button icon-edit'
                        });
                        editButton.appendTo(labelCont);
    
                        var removeButton        =   $('<div></div>', {
                            'class':            'remove_button icon-remove_connection'
                        });
                        removeButton.appendTo(labelCont);
    
    
                        if(connectionData.newConnection) {
                            editButton.addClass('disabled');
                            removeButton.addClass('disabled');
                        }
                        else {
                            connections.addEvents(labelCont);
                        }
    
                        $('#contain_drag svg').before(labelCont);
    
                        var leftOffset  = parseInt(pathData.midpoint.left, 10) - parseInt(labelCont.outerWidth() / 2, 10);
                        var topOffset   = parseInt(pathData.midpoint.top, 10) - parseInt(labelCont.outerHeight() / 2, 10);
    
                        labelCont.css({
                            'z-index':  connectionData.z_index,
                            'left':     leftOffset,
                            'top':      topOffset
                        });
    
                        if(!(connectionData.from in connections.cachedConnections)) {
                            connections.cachedConnections[connectionData.from] = {};
                        }
    
                        connections.cachedConnections[connectionData.from][connectionData.to]   = connection;
                    },
    
    
                    editLabel : function(event, connectionId) {
    
                        connections.handlers.connectionEditStart(connectionId);
                    },
    
    
                    remove : function(event, connectionData) {
    
                        connections.cachedConnections[connectionData.from][connectionData.to].line.remove();
                        connections.cachedConnections[connectionData.from][connectionData.to].label.remove();
                        delete connections.cachedConnections[connectionData.from][connectionData.to];
    
                        if($.isEmptyObject(connections.cachedConnections[connectionData.from])) {
                            delete connections.cachedConnections[connectionData.from];
                        }
                    },
    
    
                    removeAll : function() {
    
                        for(var fromCardId in connections.cachedConnections) {
                            if(connections.cachedConnections.hasOwnProperty(fromCardId)) {
    
                                for(var toCardId in connections.cachedConnections[fromCardId]) {
                                    if(connections.cachedConnections[fromCardId].hasOwnProperty(toCardId)) {
                                        connections.cachedConnections[fromCardId][toCardId].line.remove();
                                        connections.cachedConnections[fromCardId][toCardId].label.remove();
                                    }
                                }
                            }
                        }
    
                        connections.cachedConnections   = {};
                    },
    
    
                    move : function(event, fromCardId, toCardId, fromCardDimensions, toCardDimensions) {
    
                        var cards            = require('cards');
    
                        var width;
                        switch(cards.zoomFactor) {
                        case '0.25':
                            width   = 2;
                            break;
    
                        case '0.375':
                        case '0.5':
                            width   = 3;
                            break;
    
                        case '0.625':
                        case '0.75':
                            width   = 4;
                            break;
    
                        case '0.875':
                        default:
                            width   = 5;
                        break;
                        }
    
    
                        var pathData            = connections.calculatePath(    fromCardDimensions,
                                toCardDimensions);
    
                        connections.cachedConnections[fromCardId][toCardId].line.attr({ 'path':               pathData.path,
                            'stroke-width':       width});
    
                        var labelElem           = connections.cachedConnections[fromCardId][toCardId].label;
    
                        var leftOffset          = parseInt(pathData.midpoint.left, 10) - parseInt(labelElem.outerWidth() / 2, 10);
                        var topOffset           = parseInt(pathData.midpoint.top, 10) - parseInt(labelElem.outerHeight() / 2, 10);
    
                        labelElem.css({
                            'left':     leftOffset,
                            'top':      topOffset
                        });
                    },
    
    
                    moveForCard : function(event, cardId) {
    
                        var cards            = require('cards');
    
                        var fromCardDimensions;
                        var toCardDimensions;
    
                        for(var fromCardId in connections.cachedConnections) {
                            if(connections.cachedConnections.hasOwnProperty(fromCardId)) {
                                fromCardDimensions  = cards.getCardDimensions(fromCardId);
    
                                for(var toCardId in connections.cachedConnections[fromCardId]) {
                                    if(connections.cachedConnections[fromCardId].hasOwnProperty(toCardId)) {
                                        if(fromCardId === cardId || toCardId === cardId) {
                                            toCardDimensions    = cards.getCardDimensions(toCardId);
                                            $(window).trigger('widget:connection:view:move',
                                                    [
                                                     fromCardId,
                                                     toCardId,
                                                     fromCardDimensions,
                                                     toCardDimensions
                                                     ]);
                                        }
                                    }
                                }
                            }
                        }
                    },
    
    
                    updateAllPaths : function(event) {
    
                        var cards            = require('cards');
    
                        var fromCardDimensions;
                        var toCardDimensions;
    
                        for(var fromCardId in connections.cachedConnections) {
                            if(connections.cachedConnections.hasOwnProperty(fromCardId)) {
                                fromCardDimensions  = cards.getCardDimensions(fromCardId);
    
                                for(var toCardId in connections.cachedConnections[fromCardId]) {
                                    if(connections.cachedConnections[fromCardId].hasOwnProperty(toCardId)) {
                                        toCardDimensions    = cards.getCardDimensions(toCardId);
    
                                        $(window).trigger('widget:connection:view:move',
                                                [
                                                 fromCardId,
                                                 toCardId,
                                                 fromCardDimensions,
                                                 toCardDimensions
                                                 ]);
                                    }
                                }
                            }
                        }
                    },
    
    
                    update : function(event, connectionData) {
    
                        var cards            = require('cards');
    
                        $(window).trigger('widget:connection:view:move',
                                [
                                 connectionData.from,
                                 connectionData.to,
                                 cards.getCardDimensions(connectionData.from),
                                 cards.getCardDimensions(connectionData.to)
                                 ]);
                        var labelCont   = $('[data-instanceid="' + connectionData.id + '"]');
                        labelCont.css('z-index', connectionData.z_index);
    
                        var labelElem   = labelCont.find('.connection_label');
                        labelElem.text(connectionData.label);
    
                        var connectionsDialog   = $('.connections_dialog');
                        if(connectionsDialog.length) {
                            connectionsDialog.find('#connection_label').val(connectionData.label);
                        }
                    },
    
    
                    toFront : function(event, connectionId, zIndex) {
    
                        var labelCont   = $('[data-instanceid="' + connectionId + '"]');
    
                        labelCont.css('z-index', zIndex);
                    }
                },
    
    
                handlers : {
    
                    scrollRunningId     : null,
                    lastY               : 0,
                    lastX               : 0,
                    proximity           : 50,
    
                    startCursorScroll : function(currentX, currentY) {
    
                        if(connections.handlers.scrollRunningId === null) {
                            var canvasElem      = $('#canvas');
    
                            // If the cursor has moved then cancel the events
                            if(currentX !== connections.handlers.lastX && currentY !== connections.handlers.lastY) {
                                if(connections.handlers.scrollRunningId !== null) {
                                    window.clearTimeout(connections.handlers.scrollRunningId);
    
                                    connections.handlers.scrollRunningId    = null;
                                }
                            }
    
                            // If the user is at the top or bottom edge of the screen attempt to scroll
                            if(currentY <= connections.handlers.proximity || currentY >= canvasElem.outerHeight() - connections.handlers.proximity) {
                                connections.handlers.updateCursorScroll();
                            }
                        }
                    },
    
    
                    stopCursorScroll : function() {
    
                        if(connections.handlers.scrollRunningId !== null) {
                            window.clearTimeout(connections.handlers.scrollRunningId);
    
                            connections.handlers.scrollRunningId    = null;
                        }
    
                        $(document).off('mousemove');
                    },
    
    
                    updateCursorScroll : function() {
    
                        var canvasElem      = $('#canvas');
    
                        var maxScroll       = (canvasElem.prop('scrollHeight') - canvasElem.outerHeight());
                        var step            = parseInt(connections.handlers.proximity / 3, 10);
                        var scrollAdjust    = 0;
    
                        // Three gradations of scrolling depending on proximity to top
                        if(connections.handlers.lastY >= 0 && connections.handlers.lastY < step) {
                            scrollAdjust    = -9;
                        }
                        else if(connections.handlers.lastY >= step && connections.handlers.lastY < step * 2) {
                            scrollAdjust    = -6;
                        }
    
                        else if(connections.handlers.lastY >= step * 2 && connections.handlers.lastY <= connections.handlers.proximity) {
                            scrollAdjust    = -3;
                        }
    
                        // Three gradations of scrolling depending on proximity to bottom
                        if(connections.handlers.lastY <= canvasElem.outerHeight() && connections.handlers.lastY > canvasElem.outerHeight() - step) {
                            scrollAdjust    = 9;
                        }
                        else if(connections.handlers.lastY <= canvasElem.outerHeight() - step && connections.handlers.lastY > canvasElem.outerHeight() - (step * 2)) {
                            scrollAdjust    = 6;
                        }
                        else if(connections.handlers.lastY <= canvasElem.outerHeight() - (step * 2) && connections.handlers.lastY > canvasElem.outerHeight() - connections.handlers.proximity) {
                            scrollAdjust    = 3;
                        }
    
                        // Call again if user remains in drop area
                        if(scrollAdjust !== 0) {
                            connections.handlers.scrollRunningId    = window.setTimeout(connections.handlers.updateCursorScroll, 50);
                        }
                        else {
                            connections.handlers.scrollRunningId    = null;
                        }
    
                        // If the new position is valid then update the scroll position
                        if(canvasElem.scrollTop() + scrollAdjust > 0 && canvasElem.scrollTop() + scrollAdjust < maxScroll) {
                            canvasElem.scrollTop(canvasElem.scrollTop() + scrollAdjust);
                        }
                    },
    
                    updateDynamicPath : function(event) {
    
                        var cards            = require('cards');
    
                        // Store most recent cursor position
                        connections.handlers.lastX  = event.pageX;
                        connections.handlers.lastY  = event.pageY;
    
                        connections.handlers.startCursorScroll(event.pageX, event.pageY);
    
                        var cardElem    = $('.connecting');
    
                        var cursorPos   =   {
                                'width':    10,
                                'height':   10
                        };
    
                        cursorPos.x             = event.pageX - $('#contain_drag').offset().left;
                        if(cursorPos.x < 0) {
                            cursorPos.x         = 0;
                        }
    
                        cursorPos.y             = event.pageY - $('#contain_drag').offset().top;
                        if(cursorPos.y < 0) {
                            cursorPos.y         = 0;
                        }
    
                        var width;
                        switch(cards.zoomFactor) {
                        case '0.25':
                            width   = 2;
                            break;
    
                        case '0.375':
                        case '0.5':
                            width   = 3;
                            break;
    
                        case '0.625':
                        case '0.75':
                            width   = 4;
                            break;
    
                        case '0.875':
                        default:
                            width   = 5;
                        break;
                        }
    
                        var pathData    = connections.calculatePath(    cards.getCardDimensions(cardElem.data('instanceid')),
                                cursorPos);
    
                        var colour;
                        if(cardElem.hasClass('create')) {
                            colour  = '#669900';
                        }
    
                        if(connections.newConnectionPath === null) {
                            connections.newConnectionPath   =
                                connections.raphaelCanvas.path(pathData.path).attr({
                                    'stroke':           colour,
                                    'fill':             'none',
                                    'stroke-width':     width
                                }
                                );
                        }
    
                        connections.newConnectionPath.attr({'path':             pathData.path,
                            'stroke-width':     width});
                    },
    
    
                    connectionStart : function(action, cardElem, connectionId) {
    
                        var cards            = require('cards');
    
                        if(action !== 'create' && action !== 'edit') {
                            throw 'Invalid action passed to connectionStart';
                        }
    
                        var i;
    
                        var connectionBg    =   $(  '<div></div>', {
                            'id':       'card_connections_bg',
                            'class':    'dialog_background'
                        });
    
                        // Fixes bug in ROLE where background is not shown
                        $('<div></div>').appendTo(connectionBg);
    
    
                        var connectionCreateFunc    = function(event) {
    
                            var cardElem;
                            if($(event.target).data('prefix') === 'card') {
                                cardElem    = $(event.target);
                            }
    
                            else {
                                cardElem    = $(event.target).parents('[data-prefix="card"]');
                            }
    
                            var toCardId    = cardElem.data('instanceid');
                            var fromCardId  = $('.connecting').data('instanceid');
    
                            var lineExists  = connections.model.exists(fromCardId, toCardId);
    
                            if(!lineExists) {
                                connectionId    = util.uidGenerator();
                                $(window).trigger('widget:connection:model:new',
                                        [
                                         connectionId,
                                         fromCardId,
                                         toCardId,
                                         ''
                                         ]);
    
                                labelDialogFunc(connectionId);
                            }
                            else {
                                connections.handlers.connectionFinish();
                            }
    
                            connections.handlers.stopCursorScroll();
    
                            if(connections.newConnectionPath !== null) {
                                connections.newConnectionPath.remove();
                                connections.newConnectionPath   = null;
                            }
                        };
    
    
                        // Disable card dragging & enable click for making connections
                        var cardElemArr   = $('[data-prefix="card"]');
                        var innerCardElem;
                        for(i = 0; i < cardElemArr.length; i++) {
                            innerCardElem   = $(cardElemArr[i]);
    
                            cards.removeEvents(innerCardElem);
    
                            innerCardElem.find('.menu_icon').css('visibility', 'hidden');
    
                            if(action === 'create' && innerCardElem.data('instanceid') !== cardElem.data('instanceid')) {
    
                                innerCardElem
                                .off('click.connections')
                                .on('click.connections', connectionCreateFunc);
                            }
    
                            // Push cards that are already connected to the current card into the background
                            if(typeof(cardElem) !== 'undefined' && connections.model.exists(cardElem.data('instanceid'), innerCardElem.data('instanceid'))) {
                                innerCardElem.data('orig_z_index', innerCardElem.css('z-index'));
                                innerCardElem.css('z-index', 'auto');
                            }
                        }
    
                        // Disable time period right-click menu
                        var containerArr  = $('.cell_container');
                        for(i = 0; i < containerArr.length; i++) {
                            $.contextMenu('destroy', '[data-instanceid="' + $(containerArr[i]).data('instanceid') + '"] .cell_inner');
                        }
    
                        connectionBg.css('display', 'none');
                        connectionBg.appendTo($('body'));
                        connectionBg.fadeIn(    100,
                                function() {
                        });
    
                        if(action !== 'edit') {
                            cardElem.addClass('connecting');
                            cardElem.addClass(action);
                        }
    
                        if(action === 'create') {
                            $(document)
                            .on('mousemove', connections.handlers.updateDynamicPath);
                        }
    
                        $('#contain_drag svg').css('z-index', 'auto');
                        $('#deck_bar').css('z-index', 'auto');
    
    
                        // Push labels not part of connection behind background image
                        var labelElemArr    = $('.connection_container');
                        var labelContElem;
                        for(i = 0; i < labelElemArr.length; i++) {
                            labelContElem   = $(labelElemArr[i]);
    
                            connections.removeEvents(labelContElem);
    
                            labelContElem.find('.edit_button').addClass('disabled');
    
                            labelContElem.find('.remove_button').addClass('disabled');
    
                            labelContElem.css('z-index', '1');
                        }
    
                        var labelDialogFunc = function(innerConnectionId) {
    
                            var labelDialog =   $('<div></div>', {
                                'class':            'connections_dialog',
                                'data-instanceid':  innerConnectionId,
                                'data-prefix':      'connection'
                            });
                            $('#contain_drag svg').after(labelDialog);
    
                            var div         =   $('<div></div>');
                            div.appendTo(labelDialog);
    
                            var label       =   $('<label></label>', {
                                'for':      'connection_label'
                            });
                            label.text('Connection label:');
                            label.appendTo(div);
    
                            var input       =   $('<input>', {
                                'type':             'text',
                                'id':               'connection_label',
                                'data-inputname':   'label'
                            });
                            input.appendTo(div);
                            input.focus();  // Grab input focus so use can type instantly
    
                            var connectionData  = connections.model.get(innerConnectionId);
    
                            $('[data-instanceid="' + innerConnectionId + '"]').css('z-index', connectionData.z_index);
    
                            canvasStorage.addChangeEvents(labelDialog);
    
                            input.on('keyup', function(event) {
                                if(event.which === 13) {
                                    connections.handlers.connectionFinish();
                                }
                            });
    
    
                            input.val(connectionData.label);
    
                            var nextButton  =   $('<div></div>', {
                                'id':       'next_button'
                            });
                            nextButton.text('Done');
                            nextButton.appendTo(div);
    
                            // calculate position
                            var leftOffset  = parseInt(($('#contain_drag').width() / 2) - (labelDialog.outerWidth() / 2), 10);
                            labelDialog.css('left', leftOffset);
    
                            nextButton
                            .off('click')
                            .on('click', connections.handlers.connectionFinish);
    
                            // Push cards not part of connection behind background image
                            var cardElemArr   = $('[data-prefix="card"]');
                            var innerCardElem;
                            for(var i = 0; i < cardElemArr.length; i++) {
                                innerCardElem   = $(cardElemArr[i]);
    
    
                                if(innerCardElem.data('instanceid') !== connectionData.from && innerCardElem.data('instanceid') !== connectionData.to) {
                                    innerCardElem.data('orig_z_index', innerCardElem.css('z-index'));
                                    innerCardElem.css('z-index', 'auto');
                                }
    
                                else {
                                    innerCardElem.data('orig_z_index', innerCardElem.css('z-index'));
                                    innerCardElem.css('z-index', '2');
                                }
    
                            }
                        };
    
    
                        if(action === 'edit') {
                            labelDialogFunc(connectionId);
                        }
    
                        var closeButton =   $('<div></div>', {
                            'class':    'dialog_dismiss dismiss_button_32x32 dismiss_connection'
                        });
                        $('#contain_drag svg').before(closeButton);
                        closeButton
                        .off('click')
                        .on('click', connections.handlers.connectionFinish);
                    },
    
    
                    connectionCreateStart : function(cardElem) {
    
                        connections.handlers.connectionStart('create', cardElem);
                    },
    
    
                    connectionEditStart : function(connectionId) {
    
                        connections.handlers.connectionStart('edit', undefined, connectionId);
                    },
    
    
                    connectionCreate : function(event) {
    
                        var toCardId;
                        if($(event.target).data('prefix') === 'card') {
                            toCardId    = $(event.target).data('instanceid');
                        }
                        else {
                            toCardId    = $(event.target).parents('[data-prefix="card"]').data('instanceid');
                        }
    
                        var fromCardId  = $('.connecting').data('instanceid');
    
                        var lineExists  = connections.model.exists(fromCardId, toCardId);
    
                        if(!lineExists) {
                            var labelString     = null;
    
                            $(window).trigger('widget:connection:model:new',
                                    [
                                     util.uidGenerator(),
                                     fromCardId,
                                     toCardId,
                                     labelString
                                     ]);
                        }
    
                        // Dismiss connections canvas
                        connections.handlers.connectionFinish();
                    },
    
    
                    connectionFinish : function() {
    
                        var cards            = require('cards');
                        var containers       = require('containers');
    
                        connections.handlers.stopCursorScroll();
    
                        if(connections.newConnectionPath !== null) {
                            connections.newConnectionPath.remove();
                            connections.newConnectionPath   = null;
                        }
    
                        $('#contain_drag svg').css('z-index', 'auto');
    
                        var bgElem  = $('#card_connections_bg');
    
                        // Disable scrolling callbacks
                        if(connections.handlers.scrollRunningId !== null) {
                            window.clearTimeout(connections.handlers.scrollRunningId);
    
                            connections.handlers.scrollRunningId    = null;
                        }
    
                        bgElem.fadeOut( 250,
                                function() {
                            $('#deck_bar').css('z-index', '99999');
    
                            var i;
    
                            // Re-add container Events
                            var containerElems  = $('.cell_container');
                            for(i = 0; i < containerElems.length; i++) {
                                containers.addEvents($(containerElems[i]));
                            }
    
                            var connectingElems = $('.connecting');
                            for(i = 0; i < connectingElems.length; i++) {
                                $(connectingElems[i]).removeClass('connecting');
                            }
    
                            // Reset cards (z-index, events etc)
                            var cardElems   = $('[data-prefix="card"]');
                            var cardElem;
                            for(i = 0; i < cardElems.length; i++) {
                                cardElem        = $(cardElems[i]);
                                var origZIndex  = cardElem.data('orig_z_index');
    
                                cards.addEvents(cardElem);
    
                                $(window).trigger('widget:card:view:post_propagate', [cardElem]);
    
                                cardElem.off('click.connections');
                                cardElem.find('.menu_icon').css('visibility', 'visible');
    
                                if(typeof(origZIndex) !== 'undefined') {
                                    cardElem.css('z-index', origZIndex);
                                }
                            }
    
                            var labelElemArr    = $('.connection_container');
                            var labelElem;
                            var labelData;
                            for(i = 0; i < labelElemArr.length; i++) {
                                labelElem       = $(labelElemArr[i]);
                                labelData       = connections.model.get(labelElem.data('instanceid'));
    
                                labelElem.css('z-index', labelData.z_index);
    
                                connections.addEvents(labelElem);
    
                                labelElem.find('.edit_button')
                                .removeClass('disabled');
    
                                labelElem.find('.remove_button')
                                .removeClass('disabled');
                            }
    
                            bgElem.remove();
                            $('.dismiss_connection').remove();
                        });
    
                        $('.dismiss_connection').fadeOut(   250,
                                function() {
                            $('.dismiss_connection').remove();
                        });
    
                        $('.connections_dialog').fadeOut(   250,
                                function() {
                            $('.connections_dialog').remove();
                        });
                    }
                }
    
        };
    
        // Initialise deck handlers
        connections.init();
    
        return connections;
    }
);

