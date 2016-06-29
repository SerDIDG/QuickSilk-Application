cm.define('App.PanelHolder', {
    'extend' : 'App.Panel',
    'params' : {
        'type' : 'story',
        'autoOpen' : false,
        'showButtons' : false,
        'showBackButton' : true,
        'showCloseButton' : false,
        'embedStructureOnRender' : false,
        'destructOnClose' : false
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
    // Call parent class construct
    App.Panel.apply(that, arguments);
});

cm.getConstructor('App.PanelHolder', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.constructEnd = function(){
        var that = this;
        that.addToStack(that.params['node']);
        // Call parent method
        _inherit.prototype.constructEnd.apply(that, arguments);
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Process holder nodes
        cm.find('App.PanelContainer', null, null, function(classObject){
            that.myComponents['panel'] = classObject;
        }, {'childs' : true});
        that.myNodes = cm.merge(that.myNodes, that.getDataNodesObject(that.params['node']));
        cm.addEvent(that.myNodes['button'], 'click', that.openHandler);
        return that;
    };

    classProto.open = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.open.apply(that, arguments);
        if(!that.isOpen){
            that.myComponents['panel'] && that.myComponents['panel'].hide();
            that.setContent(that.myNodes['content']);
        }
        return that;
    };

    classProto.close = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.close.apply(that, arguments);
        if(that.isOpen){
            that.myComponents['panel'] && that.myComponents['panel'].show();
        }
        return that;
    };

    classProto.transitionClose = function(){
        var that = this;
        cm.appendChild(that.myNodes['content'], that.myNodes['holder']);
        // Call parent method
        _inherit.prototype.transitionClose.apply(that, arguments);
        return that;
    };
});