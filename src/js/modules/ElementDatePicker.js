cm.define('Mod.ElementDatePicker', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.Datepicker',
        'pattern' : /^(0000-00-00)$/
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});