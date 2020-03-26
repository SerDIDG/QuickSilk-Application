cm.define('App.AbstractModule', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable',
        'onEnableEditing',
        'onDisableEditing'
    ],
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true,
        'customEvents' : true,
        'isEditing' : null
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.AbstractModule', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.isEditing = null;
        // Bind
        that.enableEditingHandler = that.enableEditing.bind(that);
        that.disableEditingHandler = that.disableEditing.bind(that);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.onSetCustomEvents = function(){
        var that = this;
        cm.customEvent.add(that.params['node'], 'enableEditable', that.enableEditingHandler);
        cm.customEvent.add(that.params['node'], 'disableEditable', that.disableEditingHandler);
    };

    classProto.onUnsetCustomEvents = function(){
        var that = this;
        cm.customEvent.remove(that.params['node'], 'enableEditable', that.enableEditingHandler);
        cm.customEvent.remove(that.params['node'], 'disableEditable', that.disableEditingHandler);
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Force editing mode on initialisation
        if(cm.isBoolean(that.params['isEditing'])){
            if(that.params['isEditing']){
                that.enableEditing();
            }else{
                that.disableEditing();
            }
        }
        that.triggerEvent('onRenderViewModel');
        return that;
    };

    /*** PUBLIC ***/

    classProto.enableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.replaceClass(that.params['node'], 'is-not-editing', 'is-editing is-editable');
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
            that.triggerEvent('onEnableEditing');
        }
        return that;
    };

    classProto.disableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.replaceClass(that.params['node'], 'is-editing is-editable', 'is-not-editing');
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
            that.triggerEvent('onDisableEditing');
        }
        return that;
    };
});