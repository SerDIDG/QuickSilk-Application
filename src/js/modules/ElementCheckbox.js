cm.define('Mod.ElementCheckbox', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'inputEvent' : 'change'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementCheckbox', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.validateValue = function(){
        var that = this;
        return that.get();
    };

    classProto.get = function(){
        var that = this;
        return that.nodes['input'].checked;
    };

    classProto.set = function(value){
        var that = this;
        that.nodes['input'].checked = value;
        return that;
    };
});