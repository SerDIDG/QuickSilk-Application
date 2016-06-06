cm.define('App.MultipleFileInput', {
    'extend' : 'Com.MultipleFileInput',
    'params' : {
        'inputConstructor' : 'App.FileInput',
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.MultipleFileInput.apply(that, arguments);
});