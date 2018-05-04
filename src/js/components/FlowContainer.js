cm.define('App.FlowContainer', {
    'extend' : 'Com.AbstractContainer',
    'params' : {
        'constructor' : 'App.Flow',
        'placeholder' : true,
        'placeholderConstructor' : 'Com.DialogContainer',
        'placeholderParams' : {
            'params' : {
                'width' : 500,
                'className' : 'app__flow__dialog',
                'documentScroll' : true
            }
        }
    },
    'strings' : {
        'title' : 'QuickSilk Flow'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});


cm.getConstructor('App.FlowContainer', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;
});