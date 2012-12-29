/*jshint jquery:true */


define(
    ['jquery', 'containers', 'storage/canvasStorage', 'util'],
    function($, containers, canvasStorage, util) {
        'use strict';

        /*  Functionality related to header fields */
        var fields      = {};
        fields.view     = {};
        fields.model    = {};


        fields.defaultFields    =   [   'Faculty',
                                        'Course',
                                        'Module(s)'];


        /*  Fields initialisation. */
        fields.init = function() {
            $(window)
                .off(   'widget:fields:model:new')          .on('widget:fields:model:new',             fields.model.add)
                .off(   'widget:fields:model:new_multi')    .on('widget:fields:model:new_multi',       fields.model.addMulti)
                .off(   'widget:fields:model:delete')       .on('widget:fields:model:delete',          fields.model.remove)
                .off(   'widget:fields:model:remove_all')   .on('widget:fields:model:remove_all',      fields.model.removeAll)
                .off(   'widget:fields:model:change_title') .on('widget:fields:model:change_title',    fields.model.changeTitle)

                .off(   'widget:fields:view:add')           .on('widget:fields:view:add',              fields.view.add)
                .off(   'widget:fields:view:remove')        .on('widget:fields:view:remove',           fields.view.remove)
                .off(   'widget:fields:view:remove_all')    .on('widget:fields:view:remove_all',       fields.view.removeAll)
                .off(   'widget:fields:view:update')        .on('widget:fields:view:update',           fields.view.update)
                .off(   'widget:fields:view:update_all')    .on('widget:fields:view:update_all',       fields.view.updateAll)
                .off(   'widget:fields:view:create_dialog') .on('widget:fields:view:create_dialog',    fields.view.createDialog);
        };


        fields.addEvents = function(fieldElem) {
            canvasStorage.addChangeEvents(fieldElem);
        };


        fields.removeEvents = function(fieldElem) {
            canvasStorage.removeChangeEvents(fieldElem);
        };


/*  View */
        fields.view.add = function(event, fieldData) {
            var li      =       $('<li></li>', {
                                    'data-instanceid':      fieldData.id,
                                    'data-prefix':          'fields'
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
            if(fieldData.prev === null || fieldData.prev.length < 1 || $('[data-instanceid="' + fieldData.prev + '"]').length < 1) {
                li.appendTo('#field_container');
            }

            // Handle other containers
            else {
                $('#field_container [data-instanceid="' + fieldData.prev + '"]').after(li);
            }

            fields.addEvents(li);
        };


        fields.view.remove = function(event, fieldData) {
            $('[data-instanceid="' + fieldData.id  + '"]').remove();
        };


        fields.view.removeAll = function() {
            $('#field_container [data-instanceid]').remove();
        };


        fields.view.update = function(event, fieldData) {
            $('[data-instanceid="' + fieldData.id + '"] label').text(fieldData.title + ':');
            $('[data-instanceid="' + fieldData.id + '"] input').val(fieldData.data);
        };


        fields.view.updateAll = function(event, fieldsData) {
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
                $(window).trigger('widget:fields:view:remove', [removedFields[i]]);
            }


            // Update titles
            for(i = 0; i < fieldsData.length; i++) {
                $(window).trigger('widget:fields:view:update',     [fieldsData[i]]);
            }


            // Add fields
            for(i = 0; i < addedFields.length; i++) {
                $(window).trigger('widget:fields:view:add', [addedFields[i]]);
            }
        };


        fields.view.createDialog = function(event, firstRun) {
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

                $(window).trigger('widget:fields:model:change_title', [instanceId, labelVal]);
            };

            var remFunction     = function(event) {
                var currentFieldId  = $(event.target).parents('li').attr('data-instanceid');

                $(window).trigger('widget:fields:model:delete',  [currentFieldId]);

                $(event.target).parents('li').remove();
            };

            var addFunction     = function(event) {
                var fieldId         = util.uidGenerator();
                var defaultTitle    = 'new field';

                $(window).trigger('widget:fields:model:new', [fieldId, defaultTitle]);

                // Add to this dialog
                li              =   $('<li></li>', {
                    'data-instanceid':      fieldId,
                    'data-prefix':          'fields'
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

                // First setup array
                for(i = 0; i < fields.defaultFields.length; i++) {
                    fieldId             = util.uidGenerator();

                    fieldArr.push({ 'id':       fieldId,
                                    'title':    fields.defaultFields[i]});
                }

                $(window).trigger('widget:fields:model:new_multi', [fieldArr]);
            }

            else {
                $(window).trigger('widget:fields:view:update_all', [fieldArr]);
            }

            var li;
            var input;
            var remButton;
            for(i = 0; i < fieldArr.length; i++) {

                li              =   $('<li></li>', {
                                        'data-instanceid':      fieldArr[i].id,
                                        'data-prefix':          'fields'
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
                                $(window).trigger('widget:fields:view:update_all');

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
                                $(window).trigger('widget:fields:view:update_all');
                            });
                        }
                    });
            }
        };



/*  Model */
        fields.model.getFields = function() {
            return {
                'title':    '',
                'data':     ''
            };
        };


        fields.model.add = function(event, fieldId, fieldTitle) {
            var extraFields     = fields.model.getFields();
            extraFields.id      = fieldId;
            extraFields.title   = fieldTitle;

            canvasStorage.list.add('fields', extraFields);
        };


        fields.model.addMulti = function(event, fieldDataArr) {
            canvasStorage.list.addMulti('fields', fieldDataArr);
        };


        fields.model.remove = function(event, fieldId) {
            var extraFields     = fields.model.getFields();
            extraFields.id      = fieldId;

            canvasStorage.list.remove('fields', extraFields);
        };


        fields.model.removeAll = function() {
            canvasStorage.list.removeAll('fields', fields.model.getFields());
        };


        fields.model.changeTitle = function(event, fieldId, fieldTitle) {
            var extraFields     = fields.model.getFields();
            extraFields.id      = fieldId;
            extraFields.title   = fieldTitle;

            canvasStorage.list.update('fields', extraFields);
        };


        fields.model.get = function(fieldId) {
            return canvasStorage.list.get('fields', fieldId);
        };


        fields.model.getAll = function() {
            return canvasStorage.list.getAll('fields');
        };



        // Initialise field handlers
        fields.init();

        return fields;
    }
);
