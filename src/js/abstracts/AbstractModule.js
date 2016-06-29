cm.define('App.AbstractModule', {
    'extend' : 'Com.AbstractController'
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});