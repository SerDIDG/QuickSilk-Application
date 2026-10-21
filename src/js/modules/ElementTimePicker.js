cm.define('Mod.ElementTimePicker', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.TimeSelect',
        'pattern' : /^(00-00-00)$/,
    },
},
function(){
    App.AbstractModuleElement.apply(this, arguments);
});