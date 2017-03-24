cm.define('Mod.ElementCheckbox', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementCheckbox', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.get = function(){
        var that = this;
        return that.nodes['input'].checked;
    };

    classProto.validateValue = function(){
        var that = this;
        return that.get();
    };
});