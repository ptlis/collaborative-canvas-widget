/*jshint jquery:true */


define( ['jquery', 'cards', 'canvasStorage', 'canvas'],
        function($, cards, canvasStorage, canvas) {
			'use strict';
    
            /*  Functionality related to containers */
            var containers = {
        
                init : function() {
                    'use strict';
        
                    // Handle events
                    $(window)
                        .off(   'widget:container:model:new')               .on('widget:container:model:new',               containers.model.add)
                        .off(   'widget:container:model:new_multi')         .on('widget:container:model:new_multi',         containers.model.addMulti)
                        .off(   'widget:container:model:new_positioned')    .on('widget:container:model:new_positioned',    containers.model.addPositioned)
                        .off(   'widget:container:model:delete')            .on('widget:container:model:delete',            containers.model.remove)
                        .off(   'widget:container:model:remove_all')        .on('widget:container:model:remove_all',        containers.model.removeAll)
                        .off(   'widget:container:model:change_title')      .on('widget:container:model:change_title',      containers.model.changeTitle)
        
                        .off(   'widget:container:view:add')                .on('widget:container:view:add',                containers.view.add)
                        .off(   'widget:container:view:remove')             .on('widget:container:view:remove',             containers.view.remove)
                        .off(   'widget:container:view:remove_request')     .on('widget:container:view:remove_request',     containers.removeRequest)
                        .off(   'widget:container:view:resize')             .on('widget:container:view:resize',             containers.view.resizeAll)
                        .off(   'widget:container:view:remove_all')         .on('widget:container:view:remove_all',         containers.view.removeAll)
                        .off(   'widget:container:view:update')             .on('widget:container:view:update',             containers.view.update);
                },
                
                
                dropHandler : function(event, ui) {
                    var dropPosY;
                    var dropPosX;
                    var cell    = $(this);
                    
                    if(ui.draggable.data('prefix') == 'card') {
                        var cardElem    = ui.draggable;
                        var cellId      = cell.parents('.cell_container').data('instanceid');
                        var oldCellId   = cardElem.parents('.cell_container').data('instanceid');

                        
                        // If the cell changes some hairy math must be done to position the card correctly
                        if(cellId !== oldCellId) {

                            var newCellPos  = cell.offset();
                            var oldCellPos  = cardElem.parents('.cell_inner').offset();

                            // Moving card down
                            if(oldCellPos.top < newCellPos.top) {
                                dropPosY        = parseInt(cardElem.css('top').replace('px', ''), 10) - (newCellPos.top - oldCellPos.top) + (cardElem.outerHeight() / 2);
                            }

                            // Moving card up
                            else {
                                dropPosY        = parseInt(cardElem.css('top').replace('px', ''), 10) + (oldCellPos.top - newCellPos.top) + (cardElem.outerHeight() / 2);
                            }
                        }
                        else {
                            dropPosY    = parseInt(cardElem.css('top').replace('px', ''), 10) + (cardElem.outerHeight() / 2);
                        }

                        dropPosX    = parseInt(cardElem.css('left').replace('px', ''), 10) + (cardElem.outerWidth() / 2);

                        var leftOffsetPercent   = (dropPosX / cell.width()) * 100;

                        $(window).trigger('widget:card:model:move', [cardElem.data('instanceid'), cellId, leftOffsetPercent, dropPosY / cards.zoomFactor, cardElem.css('z-index')]);
                        $(window).trigger('widget:card:view:move', [cardElem.data('instanceid'), cellId, leftOffsetPercent, dropPosY, cardElem.css('z-index')]);
                        
                    }
                    
                    else if(ui.draggable.data('prefix') == 'deck') {
                        
                        var deck                = ui.draggable.data('carddeck');
                        
                        var bgElem              =   $('<div></div>', {
                                                        'class':        'dialog_background'
                                                    });
                        bgElem.css('display', 'none');
                        bgElem.appendTo($('body'));


                        var dialogContElem      =   $('<div></div>', {
                                                        'class':        'dialog_container'
                                                    });
                        dialogContElem.appendTo(bgElem);

                        var wheelContainer      =   $('<div></div>', {
                                                        'class':        'dialog card_selector_box'
                                                    });
                        wheelContainer.appendTo(dialogContElem);

                        var dismiss             =   $('<div></div>', {
                                                        'class':    'dialog_dismiss dismiss_button_32x32'
                                                    });
                        dismiss.appendTo(wheelContainer);


                        dismiss
                            .off('click')
                            .on('click', function() {
                                $(bgElem).fadeOut(250,  function() {
                                    bgElem.remove();
                                });
                            });

                        
                        dropPosY            = ui.position.top - cell.offset().top;
                        dropPosX            = ui.position.left - cell.offset().left;

                        $(bgElem).fadeIn(250, function() {
                            cards.handlers.deck.selectorWheel(deck, dropPosX, dropPosY, cell);
                        });
                    }
                },
        
        
                createDialog : function(firstRun) {
                    'use strict';
        
                    var bgElem;
                    var dialogCont;
                    if($('.dialog_background').length) {
                        bgElem      = $('.dialog_background');
                        dialogCont  = $('.dialog_container');
                    }
        
                    else {
                        bgElem  =           $('<div></div>',  {
                            'class':       'dialog_background'
                        });
                        bgElem.css('display', 'none');
                        bgElem.appendTo($('body'));
        
                        dialogCont  =       $('<div></div>', {
                            'class':       'dialog_container'
                        });
                        dialogCont.appendTo(bgElem);
                    }
        
                    var dialog  =           $('<div></div>', {
                        'class':    'dialog select_time_periods'
                    });
                    dialog.appendTo(dialogCont);
        
        
                    var title           =   $('<div></div>', {
                        'class':    'dialog_title'
                    });
                    title.text('Step 2: Create Time Periods');
                    title.appendTo(dialog);
        
                    // Challenge
                    var instructions    =   $('<div></div>', {
                        'class':    'instructions'
                    });
                    instructions.text('Select the time periods you wish to use in this planning activity.');
                    instructions.appendTo(dialog);
        
        
        
        
        
        
        
                    var selectionCont   =   $('<div></div>', {
                        'class':    'selection_container'
                    });
                    selectionCont.appendTo(dialog);
        
                    var timePeriodList  =   $('<ul></ul>', {
                        'id':       'container_selector'
                    });
                    timePeriodList.appendTo(selectionCont);
        
                    var updateFunction  = function(event) {
                        var instanceId      = $(event.target).parents('[data-instanceid]').data('instanceid');
        
                        var titleElem       = $('#contain_drag [data-instanceid="' + instanceId + '"] .cell_label');
                        var titleVal        = $(event.target).val();
        
                        titleElem.val(titleVal);
                        
                        $(window).trigger('widget:container:model:change_title', [instanceId, titleVal])
                    };
        
                    var remFunction     = function(event) {
                        var currentContainerId  = $(event.target).parents('li').attr('data-instanceid');
        
                        $(window).trigger('widget:container:model:delete',  [currentContainerId]);
        
                        $(event.target).parents('li').remove();
                    };
        
                    var addFunction     = function(event) {
                        var containerId     = canvas.uidGenerator();
                        var defaultTitle    = '';
        
                        $(window).trigger('widget:container:model:new', [containerId, defaultTitle]);
        
                        // Add to this dialog
                        li              =   $('<li></li>', {
                                                'data-instanceid':      containerId,
                                                'data-prefix':          'container'
                                            });
        
                        var inputCont   =   $('<div></div>', {
                                                'class':                'input_container'
                                            });
                        inputCont.appendTo(li);
        
                        input           =   $('<input>', {
                                                'type':                 'text',
                                                'data-inputname':       'time_period_title',
                                                'placeholder':          'Time Period'
                                            });
        
                        input.val(defaultTitle);
                        input.appendTo(inputCont);
        
                        remButton       =   $('<div></div>', {
                                                'class':            'remove remove_button_32x32'
                                            });
                        remButton.appendTo(li);
        
                        remButton
                            .off('click')
                            .on('click', remFunction);
        
                        $('#add_button').parents('li').before(li);
        
                        canvasStorage.addChangeEvents(timePeriodList, updateFunction);
        
                        input.focus();
                        input[0].select();
                    };
        
                    var i;
                    var containerArr    = containers.model.getAll();
        
                    containers.updateAll(containerArr);
        
                    var li;
                    var input;
                    var remButton;
                    for(i = 0; i < containerArr.length; i++) {
        
                        li              =   $('<li></li>', {
                            'data-instanceid':      containerArr[i].id,
                            'data-prefix':          'container'
                        });
                        li.appendTo(timePeriodList);
        
                        var inputCont   =   $('<div></div>', {
                            'class'     : 'input_container'
                        });
                        inputCont.appendTo(li);
        
                        input           =   $('<input>', {
                            'type':                 'text',
                            'data-inputname':       'time_period_title',
                            'placeholder':          'Time Period'
                        });
        
                        input.val(containerArr[i].time_period_title);
                        input.appendTo(inputCont);
        
                        remButton       =   $('<div></div>', {
                            'class':            'remove remove_button_32x32'
                        });
                        remButton.appendTo(li);
        
                        remButton
                            .off('click')
                            .on('click', remFunction);
                    }
        
                    canvasStorage.addChangeEvents(timePeriodList, updateFunction);
        
                    li              =   $('<li></li>');
                    li.appendTo(timePeriodList);
        
                    var addButton   =   $('<div></div>', {
                        'id':       'add_button'
                    });
                    addButton.text('Add');
                    addButton.appendTo(li);
        
                    addButton
                        .off('click')
                        .on('click', addFunction);
        
        
        
        
        
        
        
                    var actions     =   $('<div></div>', {
                                            'id':       'actions'
                                        });
                    actions.appendTo(dialog);
        
                    var backButton  =   $('<div></div>', {
                        'id':       'back_button'
                    });
                    backButton.text('Back');
                    backButton.appendTo(actions);
        
                    var nextButton  =   $('<div></div>', {
                        'id':       'next_button'
                    });
                    nextButton.text('Next');
                    nextButton.appendTo(actions);
        
                    bgElem.fadeIn(  250,
                        function() {
                        });
        
                    backButton
                        .off('click')
                        .on('click', function() {
        
                            dialog.fadeOut(250, function() {
                                dialog.remove();
        
                                $(window).trigger('widget:field:view:create_dialog', [true]);
                            });
                        });
        
                    nextButton
                        .off('click')
                        .on('click', function() {
                            var containerArr    = containers.model.getAll();
        
                            if(containerArr.length < 1) {
                                alert('At least one time period must be created to continue.');
                            }
                            else {
                                dialog.fadeOut(250, function() {
                                    dialog.remove();

                                    $(window).trigger('widget:deck:view:create_dialog', [true]);
                                });
                            }
                        });
                },
        
        
                updateAll : function(containersData) {
                    'use strict';
        
                    var i;
                    var addedContainers         = [];
                    var removedContainers       = [];
        
                    // Find added fields
                    if(typeof(containersData) === 'undefined') {
                        containersData          = containers.model.getAll();
                    }
        
                    // Find added containers
                    for(i = 0; i < containersData.length; i++) {
                        // Element exists in storage but not on page
                        if($('[data-instanceid="' + containersData[i].id + '"]').length < 1)  {
                            addedContainers.push(containersData[i]);
                        }
                    }
        
        
                    // Find removed containers
                    var displayedContainers     = $('.cell_container');
                    var currentContainerId;
                    var containerData;
                    for(i = 0; i < displayedContainers.length; i++) {
                        currentContainerId      = $(displayedContainers[i]).data('instanceid');
        
                        containerData           = containers.model.get(currentContainerId);
        
                        // Element exists on page but not in storage
                        if(containerData === null) {
                            removedContainers.push(containerData);
                        }
                    }
        
        
                    // Remove containers
                    for(i = 0; i < removedContainers.length; i++) {
                        $(window).trigger('widget:container:view:remove', [removedContainers[i]]);
                    }
        
        
                    // Add containers
                    for(i = 0; i < addedContainers.length; i++) {
                        $(window).trigger('widget:container:view:add', [addedContainers[i]]);
                    }
        
                    // Trigger resize
                    $(window).trigger('widget:container:view:resize');
                },
        
        
                addEvents : function(containerElem) {
                    'use strict';
        
                    containers.removeEvents(containerElem);
        
                    var containerId     = containerElem.data('instanceid');
                    var dropElem        = containerElem.find('.cell_inner');
        
                    // Context menu options
                    var options = {
                        zIndex:     999999999,
                        className:  'menu_large',
                        autoHide:   true,
                        animation:  {
                            duration:   250,
                            show:       'fadeIn',
                            hide:       'fadeOut'
                        },
                        callback: function(key, options) {
                            switch(key) {
        
                                case 'paste_card':
                                    if(options.trigger === 'left') {
                                        cards.handlers.paste(containerId, containerElem.width(), '0');
                                    }
                                    else if(options.trigger === 'right') {
                                        var menuElem    = $('[data-instanceid="' + containerId + '"] .cell_inner .context-menu-list');
                                        var xOffset     = parseInt(menuElem.css('left').replace('px', ''), 10) + (menuElem.outerWidth() / 2);
                                        var yOffset     = menuElem.css('top').replace('px', '');
        
                                        cards.handlers.paste(containerId, xOffset, yOffset);
                                    }
                                    break;
        
                                case 'add_above':
                                    $(window).trigger('widget:container:model:new_positioned',  ['above', containerId]);
                                    break;
        
                                case 'add_below':
                                    $(window).trigger('widget:container:model:new_positioned',  ['below', containerId]);
                                    break;
        
                                case 'delete':
                                    $(window).trigger('widget:container:view:remove_request',   [containerId]);
                                    break;
                            }
        
                            // Fixes bug where menu does not hide when adding containers.
                            if($(options.selector).length > 0) {
                                $.contextMenu( 'destroy', options.selector);
                                $.contextMenu(options);
                            }
                        },
                        items: {
                            'paste_card':   {
                                'name':     'Paste Card',
                                'icon':     'paste',
                                'disabled': function(key, opt) {
                                    var disabled    = true;
                                    if(cards.clipboardData.method.length > 0) {
                                        disabled    = false;
                                    }
                                    return disabled;
                                }
                            },
                            'seperator_1':     '---------',
                            'add_above':   {
                                'name':     'Add Period Above',
                                'icon':     'add_container_above'
                            },
                            'add_below':   {
                                'name':     'Add Period Below',
                                'icon':     'add_container_below'
                            },
                            'seperator_2':     '---------',
                            'delete':       {
                                'name':     'Delete',
                                'icon':     'delete'
                            }
                        }
                    };
        
        
                    // Menu button
                    options.selector    = '[data-instanceid="' + containerId + '"] .label_container .menu_icon';
                    options.trigger     = 'left';
                    options.appendTo    = '[data-instanceid="' + containerId + '"] .label_container .menu_icon';
                    options.position    = function(menu, xClickOffset, yClickOffset) {
        
                        var buttonElem      = $('[data-instanceid="' + containerId + '"] .label_container .menu_icon');
                        var menuElem        = $('[data-instanceid="' + containerId + '"] .label_container .context-menu-list');
                        var buttonOffset    = buttonElem.offset();
        
                        var xOffset         = buttonElem.outerWidth() - menuElem.outerWidth();
                        var yOffset         = yClickOffset - buttonOffset.top;
        
                        menuElem.css({top: yOffset, left: xOffset});
                    };
                    $.contextMenu(options);
        
        
                    // Right-click context
                    options.selector    = '[data-instanceid="' + containerId + '"] .cell_inner';
                    options.trigger     = 'right';
                    options.appendTo    = '[data-instanceid="' + containerId + '"] .cell_inner';
                    options.position    = function(options, xClickOffset, yClickOffset) {
                        var menuElem    = $('[data-instanceid="' + containerId + '"] .cell_inner .context-menu-list');
        
                        var contOffset  = $('[data-instanceid="' + containerId + '"] .cell_inner').offset();
                        var xOffset     = xClickOffset - contOffset.left;
                        var yOffset     = yClickOffset - contOffset.top;
        
                        // Center cursor on middle of menu
                        xOffset         = xOffset - (menuElem.outerWidth() / 2);
        
                        // Handle menu overlapping right edge of screen
                        if(xOffset + menuElem.outerWidth() > $('[data-instanceid="' + containerId + '"] .cell_inner').width()) {
                            xOffset = $('[data-instanceid="' + containerId + '"] .cell_inner').width() - menuElem.outerWidth();
                        }
        
                        menuElem.css({top: yOffset, left: xOffset});
                    };
                    $.contextMenu(options);
        
                    // Card drop
                    dropElem.droppable({
                        drop : containers.dropHandler
                    });
        
                    // Title change
                    canvasStorage.addChangeEvents(containerElem);
                },
        
        
                removeEvents : function(containerElem) {
                    'use strict';
        
                    var containerId     = containerElem.data('instanceid');
                    var dropElem        = containerElem.find('.cell_inner');
        
        
                    // Menu button
                    $.contextMenu('destroy', '[data-instanceid="' + containerId + '"] .label_container .menu_icon');
        
        
                    // Right-click context
                    $.contextMenu('destroy', '[data-instanceid="' + containerId + '"] .cell_inner');
        
                    // TODO: Remove card / deck drop
        
                    // Title change
                    canvasStorage.removeChangeEvents(containerElem);
                },
        
        
                removeRequest : function(event, containerId) {
                    'use strict';
        
                    var containerElems  = $('.cell_container');
        
                    if(containerElems.length === 1) {
                        alert('You cannot remove the final time period on a canvas.');
                    }
        
                    else if(confirm('Are you sure you want to remove this container?')) {
                        $(window).trigger('widget:container:model:delete',  [containerId]);
                    }
                },
        
        
        
                model : {
                    getFields : function() {
                        'use strict';
        
                        return {
                            'time_period_title':    ''
                        };
                    },
        
        
                    add : function(event, containerId, containerTitle) {
                        'use strict';
        
                        var extraFields                 = containers.model.getFields();
                        extraFields.id                  = containerId;
                        extraFields.time_period_title   = containerTitle;
        
                        canvasStorage.list.add('container', extraFields);
                    },
        
        
                    addMulti : function(event, containerDataArr) {
                        'use strict';
        
                        canvasStorage.list.addMulti('container', containerDataArr);
                    },
        
        
                    addPositioned : function(event, position, relativeToId) {
                        'use strict';
        
                        var extraFields     = containers.model.getFields();
                        extraFields.id      = canvas.uidGenerator();
        
                        canvasStorage.list.addPositioned('container', extraFields, position, relativeToId);
                    },
        
        
                    remove : function(event, containerId) {
                        'use strict';
        
                        var extraFields     = containers.model.getFields();
                        extraFields.id      = containerId;
        
                        canvasStorage.list.remove('container', extraFields);
        
        
                        var cardElems   = $('[data-instanceid="' + containerId + '"]').find('[data-prefix="card"][data-instanceid]');
        
                        if(cardElems !== undefined && cardElems.length) {
                            // Remove cards from storage
                            for(var i = 0; i < cardElems.length; i++) {
                                $(window).trigger('widget:card:model:delete', [$(cardElems[i]).data('instanceid')]);
                            }
                        }
                    },
        
        
                    removeAll : function() {
                        'use strict';
        
                        canvasStorage.list.removeAll('container', containers.model.getFields());
        
                        $(window).trigger('widget:card:model:remove_all');
                    },
        
        
                    get : function(containerId) {
                        'use strict';
        
                        return canvasStorage.list.get('container', containerId);
                    },
        
        
                    getAll : function() {
                        'use strict';
        
                        return canvasStorage.list.getAll('container');
                    },
        
        
                    changeTitle : function(event, containerId, containerTitle) {
                        'use strict';
        
                        var extraFields                 = containers.model.getFields();
                        extraFields.id                  = containerId;
                        extraFields.time_period_title   = containerTitle;
        
                        canvasStorage.list.update('container', extraFields);
                    }
                },
        
                view : {
        
                    /* Create a new container */
                    add : function(event, containerData) {
                        'use strict';
        
                        var containerElem   =   $('<div></div>', {
                            'class':            'cell_container',
                            'data-instanceid':  containerData.id,
                            'data-prefix':      'container'
                        });
        
                        var labelContainerElem  =   $('<div></div>', {
                            'class':            'label_container'
                        });
                        labelContainerElem.appendTo(containerElem);
        
                        $('<input>', {
                            'type':             'text',
                            'class':            'cell_label',
                            'placeholder':      'Time Period',
                            'data-inputname':   'time_period_title',
                            'value':            containerData.time_period_title
                        }).appendTo(labelContainerElem);
        
        
                        var menuButton      =   $('<div></div>', {
                                                    'class':            'menu_icon menu_button_32x32 container_menu'}
                                                );
                        menuButton.appendTo(labelContainerElem);
        
        
                        var cellOuterElem       =   $('<div></div>', {
                            'class':            'cell_outer'
                        });
                        cellOuterElem.appendTo(containerElem);
        
                        var dropElem            =   $('<div></div>', {
                            'class':            'cell_inner'
                        });
                        dropElem.appendTo(cellOuterElem);
        
        
                        if(containerData.prev !== null && containerData.prev.length > 0 && $('[data-instanceid="' + containerData.prev + '"]').length > 0) {
                            $('.cell_container[data-instanceid="' + containerData.prev + '"]').after(containerElem);
                        }
        
                        else if(containerData.next !== null && containerData.next.length > 0 && $('[data-instanceid="' + containerData.next + '"]').length > 0) {
                            $('.cell_container[data-instanceid="' + containerData.next + '"]').before(containerElem);
                        }
                        else {
                            $('#contain_drag svg').after(containerElem);
                        }
        
                        $(window).trigger('widget:container:view:resize');
        
                        containers.addEvents(containerElem);
                    },
        
        
                    remove : function(event, containerData) {
                        'use strict';
        
                        $('[data-instanceid="' + containerData.id + '"]').remove();
        
                        $(window).trigger('widget:connection:view:update_all_paths');
                    },
        
        
                    removeAll : function() {
                        'use strict';
        
                        $('.cell_container').remove();
                    },
        
        
                    resize : function(cellOuterElem) {
                        'use strict';
        
                        var cellInnerElem               = cellOuterElem.find('.cell_inner');
        
                        var maxHeight   = 500 * cards.zoomFactor;
                        var cardElems   = cellInnerElem.find('[data-prefix="card"]');
                        var cardElem;
                        for(var i = 0; i < cardElems.length; i++) {
                            cardElem                    = $(cardElems[i]);
        
                            var cardPos                 = cardElem.offset();
                            var cellPos                 = cellInnerElem.offset();
        
                            var yPos                    = cardPos.top - cellPos.top;
        
                            var yMargin                 = parseInt(cardElem.css('margin-top').replace('px', ''), 10) +
                                parseInt($(cardElem).css('margin-bottom').replace('px', ''), 10);
        
                            var yCardPosition           = (parseInt(yPos, 10) + parseInt(cardElem.height(), 10) + yMargin);
        
                            if(maxHeight < yCardPosition) {
                                maxHeight   = yCardPosition;
                            }
                        }
        
                        cellOuterElem.css('height', (maxHeight + 20) + 'px');
                        cellInnerElem.css('height', (maxHeight + 20) + 'px');
        
                        $(window).trigger('widget:connection:view:update_all_paths');
                    },
        
        
                    resizeAll : function() {
                        'use strict';
        
                        // Iterate over cards in cells & see if any cell can be shrunk to still fit them
                        var outerCells  = $('.cell_outer');
                        for(var i = 0; i < outerCells.length; i++) {
                            containers.view.resize($(outerCells[i]));
                        }
        
                        $(window).trigger('widget:connection:view:update_all_paths');
                    },
        
        
                    update : function(event, containerData) {
                        'use strict';
        
                        $('[data-instanceid="' + containerData.id + '"] .cell_label').val(containerData.time_period_title);
                    }
                }        
            };
            
            
            // Initialise container handlers
            $(window).on('load', function() {
                containers.init();
            });
            
    
            return containers;
        }
);

