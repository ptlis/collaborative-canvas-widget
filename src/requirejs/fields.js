/*jshint jquery:true */

 
define( ['jquery', 'containers', 'canvasStorage', 'util'],
        function($, containers, canvasStorage, util) {
            'use strict';
    
            /*  Functionality related to header fields */
            var fields = {
        
                defaultFields   :   [   'Faculty',
                                        'Course',
                                        'Module(s)'
                                    ],
        
                init : function() {
                    
                    // Handle events
                    $(window)
                        .off(   'widget:field:model:new')           .on('widget:field:model:new',              fields.model.add)
                        .off(   'widget:field:model:new_multi')     .on('widget:field:model:new_multi',        fields.model.addMulti)
                        .off(   'widget:field:model:delete')        .on('widget:field:model:delete',           fields.model.remove)
                        .off(   'widget:field:model:remove_all')    .on('widget:field:model:remove_all',       fields.model.removeAll)
                        .off(   'widget:field:model:change_title')  .on('widget:field:model:change_title',     fields.model.changeTitle)
        
                        .off(   'widget:field:view:add')            .on('widget:field:view:add',               fields.view.add)
                        .off(   'widget:field:view:remove')         .on('widget:field:view:remove',            fields.view.remove)
                        .off(   'widget:field:view:remove_all')     .on('widget:field:view:remove_all',        fields.view.removeAll)
                        .off(   'widget:field:view:update')         .on('widget:field:view:update',            fields.view.update)
                        .off(   'widget:field:view:create_dialog')  .on('widget:field:view:create_dialog',     fields.view.createDialog);
                },
        
        
                updateAll : function(fieldsData) {
                    
        
                    // Handle fields
                    var i;
                    var addedFields         = [];
                    var removedFields       = [];
        
        
                    // Find added fields
                    if(typeof(fieldsData) === 'undefined') {
                        fieldsData          = fields.model.getAll();
                    }
        
                    for(i = 0; i < fieldsData.length; i++) {
                        // Element exists in storage but not on page
                        if($('[data-instanceid="' + fieldsData[i].id + '"]').length < 1)  {
                            addedFields.push(fieldsData[i]);
                        }
                    }
        
                    // Find removed fields
                    var displayedFields         = $('#field_container').children();
                    var currentFieldId;
                    var fieldData;
                    var fieldElem;
        
                    for(i = 0; i < displayedFields.length; i++) {
                        fieldElem       = $(displayedFields[i]);
        
                        currentFieldId      = fieldElem.data('instanceid');
        
                        fieldData           = fields.model.get(currentFieldId);
        
                        // Element exists on page but not in storage
                        if(fieldData === null) {
                            removedFields.push({'id': currentFieldId});
                        }
                    }
        
        
                    // Remove fields
                    for(i = 0; i < removedFields.length; i++) {
                        $(window).trigger('widget:field:view:remove', [removedFields[i]]);
                    }
        
        
                    // Update titles
                    for(i = 0; i < fieldsData.length; i++) {
                        $(window).trigger('widget:field:view:update',     [fieldsData[i]]);
                    }
        
        
                    // Add fields
                    for(i = 0; i < addedFields.length; i++) {
                        $(window).trigger('widget:field:view:add', [addedFields[i]]);
                    }
        
                },
        
        
                addEvents : function(fieldElem) {
                    
        
                    canvasStorage.addChangeEvents(fieldElem);
                },
        
        
                removeEvents : function(fieldElem) {
                    
        
                    canvasStorage.removeChangeEvents(fieldElem);
                },
        
        
                view : {
                    add : function(event, fieldData) {
                        
        
                        var li      =       $('<li></li>', {
                                                'data-instanceid':      fieldData.id,
                                                'data-prefix':          'field'
                                            });
        
                        var labelCont   =   $('<div></div>', {
                                                'class':    'label_container'
                                            });
                        labelCont.appendTo(li);
        
                        var label   =       $('<label></label>');
                        label.text(fieldData.title + ':');
                        label.appendTo(labelCont);
        
                        var inputCont   =   $('<div></div>', {
                                                'class':    'input_container'
                                            });
                        inputCont.appendTo(li);
        
                        var input   =       $('<input>', {
                                                'type':                 'text',
                                                'data-inputname':       'data'
                                            });
                        if('data' in fieldData && fieldData.hasOwnProperty('data') && fieldData.data !== null) {
                            input.val(fieldData.data);
                        }
                        input.appendTo(inputCont);
        
        
                        // Handle the first container
                        if(typeof(fieldData.prev) === 'undefined'
                                || fieldData.prev === null
                                || fieldData.prev.length < 1
                                || $('[data-instanceid="' + fieldData.prev + '"]').length < 1) {
                            li.appendTo('#field_container');
                        }
        
                        // Handle other containers
                        else {
                            $('#field_container [data-instanceid="' + fieldData.prev + '"]').after(li);
                        }
        
                        fields.addEvents(li);
                    },
        
        
                    remove : function(event, fieldData) {
                        
        
                        $('[data-instanceid="' + fieldData.id  + '"]').remove();
                    },
        
        
                    removeAll : function() {
                        
        
                        $('#field_container [data-instanceid]').remove();
                    },
        
        
                    update : function(event, fieldData) {
                        
        
                        $('[data-instanceid="' + fieldData.id + '"] label').text(fieldData.title + ':');
                        $('[data-instanceid="' + fieldData.id + '"] input').val(fieldData.data);
                    },
                    
                    createDialog : function(event, firstRun) {
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
                                                    'class':        'dialog create_header_fields'
                                                });
                        dialog.appendTo(dialogCont);
            
                        var title           =   $('<div></div>', {
                                                    'class':    'dialog_title'
                                                });
                        title.text('Step 1: Select Header Fields');
                        title.appendTo(dialog);
            
                        var instructions    =   $('<div></div>', {
                            'class':    'instructions'
                        });
                        instructions.text('Select the fields you wish to appear at the top of the canvas.');
                        instructions.appendTo(dialog);
            
                        var selectionCont   =   $('<div></div>', {
                            'class':    'selection_container'
                        });
                        selectionCont.appendTo(dialog);
            
                        var fieldList       =   $('<ul></ul>', {
                            'id':       'field_selector'
                        });
                        fieldList.appendTo(selectionCont);
            
                        var updateFunction  = function(event) {
                            var instanceId      = $(event.target).parents('[data-instanceid]').data('instanceid');
            
                            var labelElem       = $('#field_container [data-instanceid="' + instanceId + '"] label');
                            var labelVal        = $(event.target).val();
            
                            labelElem.text(labelVal + ':');
                            
                            $(window).trigger('widget:field:model:change_title', [instanceId, labelVal]);
                        };
            
                        var remFunction     = function(event) {
                            var currentFieldId  = $(event.target).parents('li').attr('data-instanceid');
            
                            $(window).trigger('widget:field:model:delete',  [currentFieldId]);
            
                            $(event.target).parents('li').remove();
                        };
            
                        var addFunction     = function(event) {
                            var fieldId         = util.uidGenerator();
                            var defaultTitle    = 'new field';
            
                            $(window).trigger('widget:field:model:new', [fieldId, defaultTitle]);
            
                            // Add to this dialog
                            li              =   $('<li></li>', {
                                'data-instanceid':      fieldId,
                                'data-prefix':          'field'
                            });
                            li.appendTo(fieldList);
            
                            var inputCont   =   $('<div></div>', {
                                'class'     : 'input_container'
                            });
                            inputCont.appendTo(li);
            
                            input           =   $('<input>', {
                                'type':                 'text',
                                'data-inputname':       'title'
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
            
                            canvasStorage.addChangeEvents(fieldList, updateFunction);
            
                            input.focus();
                            input[0].select();
                        };
            
                        var i;
                        var fieldId;
                        var fieldArr    = fields.model.getAll();
                        if(firstRun && fieldArr.length < 1) {
            
                            var newFields   = [];
            
                            // First setup array
                            for(i = 0; i < fields.defaultFields.length; i++) {
                                fieldId             = util.uidGenerator();
            
                                fieldArr.push({ 'id':       fieldId,
                                                'title':    fields.defaultFields[i]});
                            }
            
                            $(window).trigger('widget:field:model:new_multi', [fieldArr]);
                        }
            
                        else {
                            fields.updateAll(fieldArr);
                        }
            
                        var li;
                        var input;
                        var remButton;
                        for(i = 0; i < fieldArr.length; i++) {
            
                            li              =   $('<li></li>', {
                                                    'data-instanceid':      fieldArr[i].id,
                                                    'data-prefix':          'field'
                                                });
                            li.appendTo(fieldList);
            
                            var inputCont   =   $('<div></div>', {
                                                    'class'     : 'input_container'
                                                });
                            inputCont.appendTo(li);
            
                            input           =   $('<input>', {
                                                    'type':                 'text',
                                                    'data-inputname':       'title'
                                                });
            
                            input.val(fieldArr[i].title);
                            input.appendTo(inputCont);
            
                            remButton       =   $('<div></div>', {
                                                    'class':            'remove remove_button_32x32'
                                                });
                            remButton.appendTo(li);
            
                            remButton
                                .off('click')
                                .on('click', remFunction);
                        }
            
                        canvasStorage.addChangeEvents(fieldList, updateFunction);
            
                        li              =   $('<li></li>');
                        li.appendTo(fieldList);
            
                        var addButton   =   $('<div></div>', {
                            'id':       'add_button'
                        });
                        addButton.text('add field');
                        addButton.appendTo(li);
            
                        addButton
                            .off('click')
                            .on('click', addFunction);
            
            
            
            
                        var actions     =   $('<div></div>', {
                            'id':       'actions'
                        });
                        actions.appendTo(dialog);
            
                        var nextButton  =   $('<div></div>', {
                            'id':       'next_button'
                        });
                        nextButton.appendTo(actions);
            
                        if(firstRun) {
                            nextButton.text('Next');
                        }
                        else {
                            nextButton.text('Done');
                        }
            
                        bgElem.fadeIn(  250,
                            function() {
                            });
            
            
            
                        if(firstRun) {
                            nextButton
                                .off('click')
                                .on('click', function() {
                                    var fieldTitleElems     = $('#field_selector input');
                                    var fieldWithoutTitle   = false;
            
                                    for(i = 0; i < fieldTitleElems.length; i++) {
                                        var title   = $(fieldTitleElems[i]).val();
            
                                        if(title.length < 1) {
                                            fieldWithoutTitle   = true;
                                        }
                                    }
            
            
                                    if(fieldWithoutTitle) {
                                        alert('A field has been created without a title. Please add a title or remove the field.');
                                    }
            
                                    else {
                                        dialog.fadeOut(250, function() {
                                            dialog.remove();
                                            fields.updateAll();
            
                                            containers.createDialog(firstRun);
                                        });
                                    }
                                });
                        }
                        else {
                            nextButton
                                .off('click')
                                .on('click', function() {
                                    var fieldTitleElems     = $('#field_selector input');
                                    var fieldWithoutTitle   = false;
            
                                    for(i = 0; i < fieldTitleElems.length; i++) {
                                        var title   = $(fieldTitleElems[i]).val();
            
                                        if(title.length < 1) {
                                            fieldWithoutTitle   = true;
                                        }
                                    }
            
            
                                    if(fieldWithoutTitle) {
                                        alert('A field has been created without a title. Please add a title or remove the field.');
                                    }
            
                                    else {
                                        dialog.fadeOut(250, function() {
                                            bgElem.remove();
                                            fields.updateAll();
                                        });
                                    }
                                });
                        }
                    }
                },
        
        
                model : {
                    getFields : function() {
                        
        
                        return {
                            'title':    '',
                            'data':     ''
                        };
                    },
        
        
                    add : function(event, fieldId, fieldTitle) {
                        
        
                        var extraFields     = fields.model.getFields();
                        extraFields.id      = fieldId;
                        extraFields.title   = fieldTitle;
        
                        canvasStorage.list.add('field', extraFields);
                    },
        
        
                    addMulti : function(event, fieldDataArr) {
                        
        
                        canvasStorage.list.addMulti('field', fieldDataArr);
                    },
        
        
                    remove : function(event, fieldId) {
                        
        
                        var extraFields     = fields.model.getFields();
                        extraFields.id      = fieldId;
        
                        canvasStorage.list.remove('field', extraFields);
                    },
        
        
                    removeAll : function() {
                        
        
                        canvasStorage.list.removeAll('field', fields.model.getFields());
                    },
        
        
                    changeTitle : function(event, fieldId, fieldTitle) {
                        
        
                        var extraFields     = fields.model.getFields();
                        extraFields.id      = fieldId;
                        extraFields.title   = fieldTitle;
        
                        canvasStorage.list.update('field', extraFields);
                    },
        
        
                    get : function(fieldId) {
                        
        
                        return canvasStorage.list.get('field', fieldId);
                    },
        
        
                    getAll : function() {
                        
        
                        return canvasStorage.list.getAll('field');
                    }
                },
        
        
                handlers : {
        
        
                    modifyFields : function(event) {
                        

                        $(window).trigger('widget:field:view:create_dialog', [false]);
                    }
                }
            };
            
            
            // Initialise field handlers
            fields.init();
            

            return fields;
        }
);

