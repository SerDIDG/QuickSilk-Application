cm.define('App.TopMenu', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender',
        'onCollapse',
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'target' : 'document.html'
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container': cm.Node('div'),
        'button': cm.Node('div'),
        'target': cm.Node('div')
    };

    that.isExpanded = false;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        cm.addEvent(that.nodes['button'], 'click', toggle);
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        // Add to global arrays
        App.Elements[that.className] = that;
        App.Nodes[that.className] = that.nodes;
        // Trigger render event
        that.triggerEvent('onRender');
    };

    var toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
    };

    /* ******* MAIN ******* */

    that.expand = function(){
        that.isExpanded = true;
        cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded');
        cm.replaceClass(that.params['target'], 'is-app-topmenu--collapsed', 'is-app-topmenu--expanded', true);
        that.triggerEvent('onExpand');
        return that;
    };

    that.collapse = function(){
        that.isExpanded = false;
        cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed');
        cm.replaceClass(that.params['target'], 'is-app-topmenu--expanded', 'is-app-topmenu--collapsed', true);
        that.triggerEvent('onCollapse');
        return that;
    };

    init();
});