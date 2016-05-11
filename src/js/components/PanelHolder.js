cm.define('App.PanelHolder', {
    'extend' : 'App.Panel',
    'modules' : [
        'DataNodes'
    ],
    'params' : {
        'type' : 'story',
        'autoOpen' : false,
        'showButtons' : false,
        'showBackButton' : true,
        'showCloseButton' : false
    }
},
function(params){
    var that = this;
    that.myNodes = {
        'container' : cm.node('div'),
        'button' : cm.node('div'),
        'holder' : cm.node('div'),
        'content' : cm.node('div')
    };
    App.Panel.apply(that, arguments);
});

cm.getConstructor('App.PanelHolder', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(params){
        var that = this;
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.render = function(){
        var that = this;
        _inherit.prototype.render.apply(that, arguments);
        // Process holder nodes
        that.myNodes = cm.merge(that.myNodes, that.getDataNodesObject(that.params['node']));
        cm.addEvent(that.myNodes['button'], 'click', that.openHandler);
        return that;
    };

    classProto.open = function(){
        var that = this;
        if(!that.isOpen){
            that.setContent(that.myNodes['content']);
        }
        _inherit.prototype.open.apply(that, arguments);
        return that;
    };

    classProto.transitionClose = function(){
        var that = this;
        cm.appendChild(that.myNodes['content'], that.myNodes['holder']);
        _inherit.prototype.transitionClose.apply(that, arguments);
        return that;
    };
});