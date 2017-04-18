cm.define('Mod.ElementTimePicker', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.TimeSelect',
        'pattern' : /^(00-00-00)$/
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});