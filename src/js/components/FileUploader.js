cm.define('App.FileUploader', {
    'extend' : 'Com.FileUploader',
    'params' : {
        'completeOnSelect' : true,
        'local' : true,
        'localConstructor' : 'App.FileUploaderLocal',
        'localParams' : {
            'fileList' : false
        },
        'fileManagerLazy' : true,
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManager'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.FileUploader.apply(that, arguments);
});