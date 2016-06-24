cm.define('App.MultipleFileInput', {
    'extend' : 'Com.MultipleFileInput',
    'params' : {
        'inputConstructor' : 'App.FileInput',
        'local' : true,
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer',
        'fileUploader' : true,
        'fileUploaderConstructor' : 'App.FileUploaderContainer'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.MultipleFileInput.apply(that, arguments);
});