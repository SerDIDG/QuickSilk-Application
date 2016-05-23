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
    that.myComponents = {};
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
        cm.find('App.PanelRequest', null, null, function(classObject){
            that.myComponents['panel'] = classObject;
        });
        that.myNodes = cm.merge(that.myNodes, that.getDataNodesObject(that.params['node']));
        cm.addEvent(that.myNodes['button'], 'click', that.openHandler);
        return that;
    };

    classProto.open = function(){
        var that = this;
        _inherit.prototype.open.apply(that, arguments);
        if(!that.isOpen){
            that.myComponents['panel'] && that.myComponents['panel'].hide();
            that.setContent(that.myNodes['content']);
        }
        return that;
    };

    classProto.close = function(){
        var that = this;
        _inherit.prototype.close.apply(that, arguments);
        if(that.isOpen){
            that.myComponents['panel'] && that.myComponents['panel'].show();
        }
        return that;
    };

    classProto.transitionClose = function(){
        var that = this;
        cm.appendChild(that.myNodes['content'], that.myNodes['holder']);
        _inherit.prototype.transitionClose.apply(that, arguments);
        return that;
    };
});