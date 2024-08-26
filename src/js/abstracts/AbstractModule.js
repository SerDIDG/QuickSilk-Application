cm.define('App.AbstractModule', {
    'extend': 'Com.AbstractController',
    'events': [
        'onEnableEditing',
        'onEnableEditable',
        'onDisableEditing',
        'onDisableEditable',
        'onToggleVisibility',
    ],
    'params': {
        'renderStructure': false,
        'embedStructureOnRender': false,
        'controllerEvents': true,
        'customEvents': true,
        'isEditing': null,
    }
},
function () {
    Com.AbstractController.apply(this, arguments);
});

cm.getConstructor('App.AbstractModule', function (classConstructor, className, classProto, classInherit) {
    classProto.construct = function () {
        var that = this;

        // Variables
        that.isEditing = null;
        that.isVisible = null;

        // Bind
        that.enableEditingHandler = that.enableEditing.bind(that);
        that.disableEditingHandler = that.disableEditing.bind(that);
        that.toggleVisibilityEventHandler = that.toggleVisibilityEvent.bind(that);

        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.onSetCustomEvents = function () {
        var that = this;
        cm.customEvent.add(that.params.node, 'enableEditable', that.enableEditingHandler);
        cm.customEvent.add(that.params.node, 'disableEditable', that.disableEditingHandler);
        cm.customEvent.add(that.params.node, 'toggleVisibility', that.toggleVisibilityEventHandler);
    };

    classProto.onUnsetCustomEvents = function () {
        var that = this;
        cm.customEvent.remove(that.params.node, 'enableEditable', that.enableEditingHandler);
        cm.customEvent.remove(that.params.node, 'disableEditable', that.disableEditingHandler);
        cm.customEvent.remove(that.params.node, 'toggleVisibility', that.toggleVisibilityEventHandler);
    };

    classProto.renderViewModel = function () {
        var that = this;
        // Force editing mode on initialisation
        if (cm.isBoolean(that.params.isEditing)) {
            if (that.params.isEditing) {
                that.enableEditing();
            } else {
                that.disableEditing();
            }
        }
        that.triggerEvent('onRenderViewModel');
        return that;
    };

    classProto.toggleVisibilityEvent = function (event) {
        var that = this;
        that.toggleVisibility(event.state);
    };

    /*** PUBLIC ***/

    classProto.enableEditing = function () {
        var that = this;
        if (!cm.isBoolean(that.isEditing) || !that.isEditing) {
            that.isEditing = true;
            cm.replaceClass(that.params.node, 'is-not-editing', ['is-editing', 'is-editable']);
            that.triggerEvent('onEnableEditing');
            that.triggerEvent('onEnableEditable');
        }
        return that;
    };

    classProto.disableEditing = function () {
        var that = this;
        if (!cm.isBoolean(that.isEditing) || that.isEditing) {
            that.isEditing = false;
            cm.replaceClass(that.params.node, ['is-editing', 'is-editable'], 'is-not-editing');
            that.triggerEvent('onDisableEditing');
            that.triggerEvent('onDisableEditable');
        }
        return that;
    };

    classProto.toggleVisibility = function (state) {
        var that = this;
        if (!cm.isBoolean(that.isVisible) || that.isVisible !== state)  {
            that.isVisible = state;
            cm.toggleClass(that.node, 'is-visible', state);
            cm.toggleClass(that.node, 'is-hidden', !state);
            that.triggerEvent('onToggleVisibility', state);
        }
        return that;
    };
});