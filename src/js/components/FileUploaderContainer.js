cm.define('App.FileUploaderContainer', {
    'extend' : 'Com.FileUploaderContainer',
    'params' : {
        'action' : '',
        'constructor' : 'App.FileUploader'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.FileUploaderContainer.apply(that, arguments);
});


cm.getConstructor('App.FileUploaderContainer', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Variables
        that.isRequest = false;
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.validateParams.apply(that, arguments);
        // Validate Request
        that.isRequest = !cm.isEmpty(that.params['action']) && window.Request && window.Request.send;
    };

    classProto.renderControllerEvents = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderControllerEvents.apply(that, arguments);
        // Add Request Event
        if(that.isRequest){
            that.components['controller'].addEvent('onComplete', function(my, data){
                Request.send(that.params['action'], data, 'post', {
                    'node' : that.params['node'],
                    'controller' : that
                });
            });
        }
        return that;
    };
});