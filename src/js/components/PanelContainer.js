cm.define('App.PanelContainer', {
    'extend' : 'Com.AbstractContainer',
    'params' : {
        'constructor' : 'App.Panel',
        'container' : 'document.body',
        'destructOnClose' : true,
        'params' : {
            'destructOnClose' : false,
            'autoOpen' : false
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});

cm.getConstructor('App.PanelContainer', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.showHandler = that.show.bind(that);
        that.hideHandler = that.hide.bind(that);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.show = function(e){
        var that = this;
        e && cm.preventDefault(e);
        that.components['controller'] && that.components['controller'].show();
        return that;
    };

    classProto.hide = function(e){
        var that = this;
        e && cm.preventDefault(e);
        that.components['controller'] && that.components['controller'].hide();
        return that;
    };

    classProto.renderControllerEvents = function(){
        var that = this;
        that.components['controller'].addEvent('onOpenStart', that.afterOpenControllerHandler);
        that.components['controller'].addEvent('onCloseEnd', that.afterCloseControllerHandler);
        return that;
    };
});