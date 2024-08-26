cm.define('App.AbstractModuleElement', {
    'extend': 'App.AbstractModule',
    'events': [
        'onChange',
        'onValidate'
    ],
    'params': {
        'renderStructure': false,
        'embedStructureOnRender': false,
        'validate': false,
        'validateHidden': false,
        'required': false,
        'pattern': '^\\s*$',
        'match': false,
        'targetController': false,
        'memorable': true,             // prevent saving for elements like files or captcha
        'remember': false,             // save sel value lo local storage
        'inputEvent': 'input'
    }
},
function () {
    App.AbstractModule.apply(this, arguments);
});

cm.getConstructor('App.AbstractModuleElement', function (classConstructor, className, classProto, classInherit) {
    classProto.construct = function () {
        var that = this;
        
        // Variables
        that.nodes = {
            'errors': {}
        };
        
        // Bind
        that.changeEventHandler = that.changeEvent.bind(that);
        
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.onConstructEnd = function () {
        var that = this;
        
        // Restore value from local storage
        that.restoreLocalValue();
    };

    classProto.renderViewModel = function () {
        var that = this;
        
        // Call parent method
        classInherit.prototype.renderViewModel.apply(that, arguments);
        
        // Get controller
        if (that.params['targetController']) {
            that.renderController();
        } else if (!cm.isEmpty(that.nodes.inputs)) {
            that.renderInputs();
        } else if (that.nodes.input) {
            that.renderInput(that.nodes.input);
        }
        
        // Prepare errors
        cm.forEach(that.nodes.errors.items, function (item) {
            item.type = cm.getData(item.message, 'type');
            cm.addClass(item.message, 'hidden margin-none');
        });
    };

    classProto.renderController = function () {
        var that = this;
        cm.find(that.params['targetController'], that.params['name'], that.nodes.field, function (classObject) {
            that.components.controller = classObject;
            that.components.controller.addEvent('onChange', that.changeEventHandler);
        });
    };

    classProto.renderInputs = function () {
        var that = this;
        cm.forEach(that.nodes.inputs, function (nodes) {
            that.renderInput(nodes.input);
        });
    };

    classProto.renderInput = function (node) {
        var that = this;
        cm.addEvent(node, that.params['inputEvent'], that.changeEventHandler);
    };

    /*** EVENTS ***/

    classProto.changeEvent = function () {
        var that = this;
        var value = that.get();
        that.saveLocalValue();
        that.triggerEvent('onChange', value);
    };

    /*** DATA ***/

    classProto.saveLocalValue = function () {
        var that = this;
        if (that.params.memorable && that.params['remember']) {
            var value = that.get();
            that.storageWrite('value', value);
        }
    };

    classProto.restoreLocalValue = function () {
        var that = this;
        if (that.params.memorable && that.params['remember']) {
            var value = that.storageRead('value');
            if (!cm.isEmpty(value)) {
                that.set(value);
            }
        }
    };

    classProto.setMultiple = function (values) {
        var that = this;
        if (cm.isArray(value)) {
            cm.forEach(that.nodes.inputs, function (nodes, i) {
                if (values[i]) {
                    nodes.input.value = values[i];
                }
            });
        }
    };

    classProto.getMultiple = function () {
        var that = this,
            values = [];
        cm.forEach(that.nodes.inputs, function (nodes) {
            values.push(nodes.input.value);
        });
        return values;
    };

    classProto.validateValue = function () {
        var that = this,
            data = {
                'value': that.get(),
                'type': null,
                'valid': true
            };
        if (that.params.required && cm.isEmpty(data.value)) {
            data.type = 'required';
            data.valid = false;
            return data;
        }
        if (that.params.validate && !cm.isEmpty(data.value) && !cm.isEmpty(that.params.pattern)) {
            data.type = that.params.pattern;
            data.regexp = new RegExp(that.params.pattern);
            data.valid = data.regexp.test(data.value);
            data.valid = that.params.match ? data.valid : !data.valid;
            return data;
        }
        return data;
    };

    /*** ERRORS ***/

    classProto.showError = function (type) {
        var that = this;
        cm.addClass(that.nodes.field, 'error');
        cm.removeClass(that.nodes.errors.container, 'hidden');
        cm.forEach(that.nodes.errors.items, function (item) {
            if (type === item.type) {
                cm.removeClass(item.message, 'hidden');
            } else {
                cm.addClass(item.message, 'hidden');
            }
        });
        return that;
    };

    classProto.hideError = function () {
        var that = this;
        cm.removeClass(that.nodes.field, 'error');
        cm.addClass(that.nodes.errors.container, 'hidden');
        cm.forEach(that.nodes.errors.items, function (item) {
            cm.addClass(item.message, 'hidden');
        });
        return that;
    };

    /******* PUBLIC *******/

    classProto.set = function (value) {
        var that = this;
        if (that.components.controller) {
            that.components.controller.set(value);
        } else if (!cm.isEmpty(that.nodes.inputs)) {
            that.setMultiple(value);
        } else {
            that.nodes.input.value = value;
        }
        return that;
    };

    classProto.get = function () {
        var that = this;
        if (that.components.controller) {
            return that.components.controller.get();
        }
        if (!cm.isEmpty(that.nodes.inputs)) {
            return that.getMultiple();
        }
        return that.nodes.input.value;
    };

    classProto.validate = function () {
        var that = this;

        // Skip validation if the field is not required and not set to validate,
        // or if it's not visible and validation is not required when hidden.
        if (
            (!that.params.required && !that.params.validate) ||
            (!that.isVisible && !that.params.validateHidden)
        ) {
            return true;
        }
        
        var data = that.validateValue();
        if (data.valid) {
            that.hideError();
        } else {
            that.showError(data.type);
        }
        that.triggerEvent('onValidate', data);
        return data.valid;
    };

    classProto.clear = function () {
        var that = this;
        that.hideError();
        return that;
    };
});