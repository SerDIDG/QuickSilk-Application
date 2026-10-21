cm.define('App.ImageInput', {
    'extend' : 'Com.ImageInput',
    'params' : {
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer',
        'fileUploader' : true,
        'fileUploaderConstructor' : 'App.FileUploaderContainer'
    }
},
function(){
    Com.ImageInput.apply(this, arguments);
});