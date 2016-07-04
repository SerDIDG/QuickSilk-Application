cm.define('App.PanelContainer', {
    'extend' : 'Com.AbstractContainer',
    'events' : [
        'onOpenStart',
        'onOpenEnd',
        'onCloseStart',
        'onCloseEnd'
    ],
    'params' : {
        'constructor' : 'App.Panel',
        'container' : 'document.body',
        'destructOnClose' : true,
        'restoreHolderContent' : true,
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
        that.destructProcessHander = that.destructProcess.bind(that);
        that.showHandler = that.show.bind(that);
        that.hideHandler = that.hide.bind(that);
        // Add events
        that.addEvent('onDestructProcess', that.destructProcessHander);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.destructProcess = function(){
        var that = this;
        that.components['finder'] && that.components['finder'].remove();
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
        that.components['controller'].addEvent('onOpenStart', function(){
            that.triggerEvent('onOpenStart', that.components['controller']);
            that.setHolderContent();
            that.afterOpenController();
        });
        that.components['controller'].addEvent('onOpenEnd', function(){
            that.processNestedPanels();
            that.triggerEvent('onOpenEnd', that.components['controller']);
        });
        that.components['controller'].addEvent('onCloseStart', function(){
            that.triggerEvent('onCloseStart', that.components['controller']);
        });
        that.components['controller'].addEvent('onCloseEnd', function(){
            that.restoreHolderContent();
            that.afterCloseController();
            that.triggerEvent('onCloseEnd', that.components['controller']);
        });
        return that;
    };

    classProto.processNestedPanels = function(){
        var that = this,
            node = that.components['controller'].getStackNode(),
            config = {
                'childs' : true,
                'multiple' : true
            };
        // Find Nested Containers
        that.components['finder'] = new cm.Finder('App.PanelContainer', null, node, function(classObject){
            classObject.setParams({
                'params' : {
                    'type' : 'story',
                    'showButtons' : false,
                    'showBackButton' : true,
                    'showCloseButton' : false
                }
            });
            classObject.addEvent('onOpenStart', that.hideHandler);
            classObject.addEvent('onCloseStart', that.showHandler);
        }, config);
        return that;
    };

    classProto.setHolderContent = function(){
        var that = this;
        if(!cm.isEmpty(that.nodes['content']) && cm.isParent(that.nodes['holder'], that.nodes['content'])){
            that.components['controller'].setContent(that.nodes['content']);
        }
        return that;
    };

    classProto.restoreHolderContent = function(){
        var that = this;
        cm.appendChild(that.nodes['content'], that.nodes['holder']);
        return that;
    };
});