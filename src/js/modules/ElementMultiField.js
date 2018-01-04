cm.define('Mod.ElementMultiField', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.MultiField',
        'memorable' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementMultiField', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onEnableEditing = function(){
        var that = this;
        if(that.components['controller']){
            that.components['controller']
                .clear();
        }
    };

    classProto.onDisableEditing = function(){
        var that = this;
        cm.log(that.components['controller']);
        if(that.components['controller']){
            that.components['controller']
                .clear()
                .setTemplate(that.nodes['content']['templateInner']);
        }
    };
});