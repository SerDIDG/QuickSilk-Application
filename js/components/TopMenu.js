cm.define('App.TopMenu', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes'
    ],
    'events' : [
        'onRender',
        'onCollapseStart',
        'onCollapse',
        'onExpandStart',
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'nodesMarker' : false
    }
},
function(params){
    var that = this,
        timeOut;

    that.nodes = {
        'AppNodes' : {
            'container' : cm.Node('div')
        },
        'AppTopMenu' : {
            'button': cm.Node('div'),
            'target': cm.Node('div')
        }
    };

    that.isExpand = false;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes();
        render();
    };

    var render = function(){
        that.isExpand = cm.isClass(that.nodes['AppNodes']['container'], 'is-expand');
        cm.addEvent(that.nodes['AppTopMenu']['button'], 'click', toggle);
        cm.addEvent(window, 'resize', resizeHandler);
        that.triggerEvent('onRender');
    };

    var toggle = function(){
        if(that.isExpand){
            that.collapse();
        }else{
            that.expand();
        }
    };

    var resizeHandler = function(){
        that.collapse(true);
    };

    /* *** MAIN *** */

    that.expand = function(isImmediately){
        that.isExpand = true;
        that.nodes['AppTopMenu']['target'].style.display = 'block';
        that.triggerEvent('onExpandStart');
        isImmediately && cm.addClass(that.nodes['AppNodes']['container'], 'is-immediately');
        cm.addClass(that.nodes['AppNodes']['container'], 'is-expand', true);
        isImmediately && cm.removeClass(that.nodes['AppNodes']['container'], 'is-immediately');
        timeOut && clearTimeout(timeOut);
        timeOut = setTimeout(function(){
            that.triggerEvent('onExpand');
        }, isImmediately? 0 : 300);
        return that;
    };

    that.collapse = function(isImmediately){
        that.isExpand = false;
        that.triggerEvent('onCollapseStart');
        isImmediately && cm.addClass(that.nodes['AppNodes']['container'], 'is-immediately');
        cm.removeClass(that.nodes['AppNodes']['container'], 'is-expand', true);
        isImmediately && cm.removeClass(that.nodes['AppNodes']['container'], 'is-immediately');
        timeOut && clearTimeout(timeOut);
        timeOut = setTimeout(function(){
            if(cm._deviceType == 'desktop' || (cm._deviceType == 'tablet' && cm._deviceOrientation == 'landscape')){
                that.nodes['AppTopMenu']['target'].style.display = 'block';
            }else{
                that.nodes['AppTopMenu']['target'].style.display = 'none';
            }
            that.triggerEvent('onCollapse');
        }, isImmediately? 0 : 300);
        return that;
    };

    init();
});