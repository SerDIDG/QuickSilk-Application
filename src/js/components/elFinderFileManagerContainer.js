cm.define('App.elFinderFileManagerContainer', {
    'extend' : 'Com.elFinderFileManagerContainer',
    'params' : {
        'constructor' : 'App.elFinderFileManager'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.elFinderFileManagerContainer.apply(that, arguments);
});