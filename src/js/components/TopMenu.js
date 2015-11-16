cm.define('App.TopMenu', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onCollapse',
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-topmenu',
        'target' : 'document.html'
    }
},
function(params){
    var that = this,
        eventInterval;

    that.nodes = {
        'container': cm.Node('div'),
        'inner': cm.Node('div'),
        'button': cm.Node('div'),
        'target': cm.Node('div'),
        'items' : {}
    };
    that.isExpanded = false;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        render();
        that.triggerEvent('onRender');
    };

    var render = function(){
        preventMenuBlinking();
        cm.addEvent(that.nodes['button'], 'click', that.toggle);
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        cm.addEvent(window, 'resize', preventMenuBlinking);
    };

    var preventMenuBlinking = function(){
        cm.addClass(that.nodes['container'], 'cm__transition-disable');
        eventInterval && clearTimeout(eventInterval);
        eventInterval = setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'cm__transition-disable');
        }, 5);
    };

    /* ******* MAIN ******* */

    that.expand = function(){
        if(!that.isExpanded){
            that.isExpanded = true;
            cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded');
            cm.replaceClass(that.params['target'], 'is-topmenu--collapsed', 'is-topmenu--expanded', true);
            that.triggerEvent('onExpand');
        }
        return that;
    };

    that.collapse = function(){
        if(that.isExpanded){
            that.isExpanded = false;
            cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed');
            cm.replaceClass(that.params['target'], 'is-topmenu--expanded', 'is-topmenu--collapsed', true);
            that.triggerEvent('onCollapse');
        }
        return that;
    };

    that.toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
        return that;
    };

    that.setActiveItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            cm.addClass(item['container'], 'active')
        }
        return that;
    };

    that.unsetActiveItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            cm.removeClass(item['container'], 'active')
        }
        return that;
    };

    that.getItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            return item;
        }
        return null;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});