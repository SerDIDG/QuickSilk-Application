cm.define('Mod.ElementFileUploader', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'App.FileInput'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});