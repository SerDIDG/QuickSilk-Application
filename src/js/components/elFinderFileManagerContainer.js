cm.define('App.elFinderFileManagerContainer', {
    'extend' : 'Com.AbstractFileManagerContainer',
    'params' : {
        'constructor' : 'App.elFinderFileManager'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractFileManagerContainer.apply(that, arguments);
});