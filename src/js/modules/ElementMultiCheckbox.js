cm.define('Mod.ElementMultiCheckbox', {
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

cm.getConstructor('Mod.ElementMultiCheckbox', function(classConstructor, className, classProto, classInherit){
    classProto.getMultiple = function(){
        var that = this,
            values = [];
        cm.forEach(that.nodes['inputs'], function(nodes){
            if(nodes['input'].checked){
                values.push(nodes['input'].value);
            }
        });
        return values;
    };

    classProto.setMultiple = function(values){
        var that = this;
        if(cm.isArray(values)){
            cm.forEach(that.nodes['inputs'], function(nodes){
                nodes['input'].checked = cm.inArray(values, nodes['input'].value);
            });
        }
    };
});