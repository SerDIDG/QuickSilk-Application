cm.define('App.PanelRequest', {
    'extend' : 'App.Panel',
    'modules' : [
        'DataNodes'
    ],
    'params' : {
        'autoOpen' : false
    }
},
function(params){
    var that = this;
    App.Panel.apply(that, arguments);
});

cm.getConstructor('App.PanelRequest', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(params){
        var that = this;
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.render = function(){
        var that = this;
        _inherit.prototype.render.apply(that, arguments);
        cm.addEvent(that.params['node'], 'click', that.openHandler);
        return that;
    };
});