cm.define('App.AbstractModule', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});