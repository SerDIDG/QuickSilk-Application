cm.define('App.FileUploader', {
    'extend' : 'Com.FileUploader',
    'params' : {
        'inputConstructor' : 'App.MultipleFileInput',
        'fileManagerConstructor' : 'App.elFinderFileManager'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.FileUploader.apply(that, arguments);
});