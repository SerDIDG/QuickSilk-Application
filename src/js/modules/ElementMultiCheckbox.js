cm.define('Mod.ElementMultiCheckbox', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementMultiCheckbox', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.getMultiple = function(){
        var that = this,
            value = [];
        cm.forEach(that.nodes['inputs'], function(nodes){
            if(nodes['input'].checked){
                value.push(nodes['input'].value);
            }
        });
        return value;
    };
});