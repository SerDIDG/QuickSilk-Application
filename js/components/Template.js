cm.define('App.Template', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onRedraw'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-template',
        'stickyFooter' : false,
        'scroll' : 'document.body',
        'scrollDuration' : 1000
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'header' : cm.Node('div'),
        'content' : cm.Node('div'),
        'footer' : cm.Node('div'),
        'buttonUp' : cm.Node('div')
    };

    that.anim = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        render();
        that.triggerEvent('onRender');
        redraw(true);
    };

    var render = function(){
        // Scroll Controllers
        that.anim['scroll'] = new cm.Animation(that.params['scroll']);
        cm.addEvent(that.nodes['buttonUp'], 'click', that.scrollToTop);
        // Resize events
        cm.addEvent(window, 'resize', function(){
            redraw(true);
        });
    };

    var redraw = function(triggerEvents){
        // Sticky Footer
        if(that.params['stickyFooter']){
            stickyFooter();
        }
        // Redraw Events
        if(triggerEvents){
            that.triggerEvent('onRedraw');
        }
    };

    var stickyFooter = function(){
        var windowHeight = cm.getPageSize('winHeight'),
            contentTop = cm.getY(that.nodes['content']),
            footerHeight = that.nodes['footer'].offsetHeight;
        that.nodes['content'].style.minHeight = Math.max((windowHeight - contentTop - footerHeight), 0) + 'px';
    };

    /* ******* MAIN ******* */

    that.redraw = function(triggerEvents){
        triggerEvents = typeof triggerEvents == 'undefined'? true : triggerEvents;
        redraw(triggerEvents);
        return that;
    };

    that.scrollToTop = function(){
        that.anim['scroll'].go({'style' : {'docScrollTop' : '0'}, 'duration' : that.params['scrollDuration'], 'anim' : 'smooth'});
        return that;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});