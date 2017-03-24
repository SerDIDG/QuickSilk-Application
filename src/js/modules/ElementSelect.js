cm.define('Mod.ElementSelect', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.Select'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});