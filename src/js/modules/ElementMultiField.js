cm.define('Mod.ElementMultiField', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.MultiField',
        'memorable' : false,
        'demo' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementMultiField', function(classConstructor, className, classProto, classInherit){
    classProto.onEnableEditing = function(){
        var that = this;
        cm.appendChild(that.nodes['content']['templateInner'], that.nodes['content']['templateContainer']);
        if(that.params['demo']){
            if(that.components['controller']){
                that.components['controller']
                    .clear();
            }
        }
    };

    classProto.onDisableEditing = function(){
        var that = this;
        cm.remove(that.nodes['content']['templateInner']);
        if(that.params['demo']){
            if(that.components['controller']){
                that.components['controller']
                    .clear()
                    .setTemplate(that.nodes['content']['templateInner']);
            }
        }
    };
});