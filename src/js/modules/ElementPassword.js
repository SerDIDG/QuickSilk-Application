cm.define('Mod.ElementPassword', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.InputPassword',
    },
},
function(){
    App.AbstractModuleElement.apply(this, arguments);
});