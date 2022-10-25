cm.define('Module.Sample', {
    'extend': 'App.AbstractModule',
    'params': {
        'renderStructure': false,
        'embedStructureOnRender': false
    }
},
function(){
    App.AbstractModule.apply(this, arguments);
});

cm.getConstructor('Module.Sample', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        // Bind context to methods
        that.onDestructProcessHandler = that.onDestructProcess.bind(that);
        that.onRedrawHandler = that.onRedraw.bind(that);
        // Add events
        that.addEvent('onDestructProcess', that.onDestructProcessHandler);
        that.addEvent('onRedraw', that.onRedrawHandler);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.onDestructProcess = function(){
        var that = this;
        // Some cleanup code
        return that;
    };

    classProto.onRedraw = function(){
        var that = this;
        // Some redraw code
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);
        return that;
    };
});
