cm.define('App.FileUploaderContainer', {
    'extend' : 'Com.FileUploaderContainer',
    'params' : {
        'constructor' : 'App.FileUploader'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.FileUploaderContainer.apply(that, arguments);
});