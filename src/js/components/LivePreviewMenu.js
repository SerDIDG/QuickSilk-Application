cm.define('App.LivePreviewMenu', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'name' : 'app-livepreview',
        'topMenuName' : 'app-topmenu',
        'contentName' : 'app-livepreview',
        'renderStructure' : false,
        'embedStructureOnRender' : false
    }
},
function(params){
    var that = this;
    that.template = null;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.LivePreviewMenu', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Find Select
        cm.find('Com.Select', 'templates', that.nodes['container'], function(classInstance){
            that.components['select'] = classInstance;
            that.components['select'].addEvent('onChange', function(my, data){
                that.setTemplate(data);
            });
            that.setTemplate(that.components['select'].get());
        });
        // Find TopMenu
        new cm.Finder('App.TopMenu', that.params['topMenuName'], null, function(classInstance){
            that.components['topMenu'] = classInstance;
        });
        // Find Content
        new cm.Finder('App.LivePreviewContent', that.params['contentName'], null, function(classInstance){
            that.components['content'] = classInstance;
        });
        // Set events
        cm.addEvent(that.nodes['desktop'], 'click', function(){
            that.reset();
            that.setView('desktop');
        });
        cm.addEvent(that.nodes['tablet'], 'click', function(){
            that.reset();
            that.setView('tablet');
        });
        cm.addEvent(that.nodes['mobile'], 'click', function(){
            that.reset();
            that.setView('mobile');
        });
        cm.addEvent(that.nodes['select'], 'click', function(){
            that.storageWrite('template', that.template);
            try{
                window.close();
            }catch(e){}
        });
        return that;
    };

    classProto.reset = function(){
        var that = this;
        cm.removeClass(that.nodes['desktop'], 'active');
        cm.removeClass(that.nodes['tablet'], 'active');
        cm.removeClass(that.nodes['mobile'], 'active');
        return that;
    };

    classProto.setView = function(type){
        var that = this;
        cm.addClass(that.nodes[type], 'active');
        that.components['content'] && that.components['content'].setView(type);
        // Collapse menu (mobile)
        that.components['topMenu'] && that.components['topMenu'].collapse();
        return that;
    };

    classProto.setTemplate = function(src){
        var that = this;
        that.template = src;
        that.components['content'] && that.components['content'].setTemplate(src);
        // Collapse menu (mobile)
        that.components['topMenu'] && that.components['topMenu'].collapse();
        return that;
    };
});