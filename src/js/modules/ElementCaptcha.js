cm.define('Mod.ElementCaptcha', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'memorable' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});