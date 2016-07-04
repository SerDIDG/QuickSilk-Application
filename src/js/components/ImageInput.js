cm.define('App.ImageInput', {
    'extend' : 'Com.ImageInput',
    'params' : {
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer',
        'fileUploader' : true,
        'fileUploaderConstructor' : 'App.FileUploaderContainer'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.ImageInput.apply(that, arguments);
});