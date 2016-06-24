cm.define('App.FileUploaderLocal', {
    'extend' : 'Com.FileUploaderLocal',
    'params' : {
        'fileListConstructor' : 'App.MultipleFileInput'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.FileUploaderLocal.apply(that, arguments);
});