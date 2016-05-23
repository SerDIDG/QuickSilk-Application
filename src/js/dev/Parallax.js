cm.define('Dev.Parallax', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'Structure',
        'DataConfig',
        'DataNodes',
        'Storage',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : '',
        'speed' : 1
    }
},
function(params){
    var that = this;
    that.nodes = {};
    that.components = {};
    that.construct(params);
});

cm.getConstructor('Dev.Parallax', function(classConstructor, className, classProto){
    classProto.construct = function(params){
        var that = this;
        that.setHandler = that.set.bind(that);
        that.refreshHandler = that.refresh.bind(that);
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        that.render();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Refresh Layout
        that.refresh();
        // Set Events
        cm.addEvent(window, 'scroll', that.setHandler);
        cm.addEvent(window, 'resize', that.refreshHandler);
        return that;
    };

    classProto.refresh = function(){
        var that = this;
        that.posY = cm.getY(that.nodes['container']);
        that.selfHeight = that.nodes['container'].offsetHeight;
        that.posY2 = that.posY + that.selfHeight;
        that.winHeight = cm.getPageSize('winHeight');
        that.halfY = (that.winHeight - that.selfHeight) / 2;
        that.set();
        return that;
    };

    classProto.set = function(){
        var that = this;
        var scrollTop = cm.getBodyScrollTop();
        if(cm.inRange(scrollTop, scrollTop + that.winHeight, that.posY, that.posY2)){
            var posY = scrollTop + that.halfY - that.posY;
            var transY = posY - (posY * that.params['speed']);
            cm.setCSSTranslate(that.nodes['backgroundInner'], '0px', (transY + 'px'))
        }
    };
});