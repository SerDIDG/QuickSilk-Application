cm.define('App.Template', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'stickyFooter' : false
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'header' : cm.Node('div'),
        'content' : cm.Node('div'),
        'footer' : cm.Node('div')
    };

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var render = function(){
        redraw();
        // Resize events
        cm.addEvent(window, 'resize', redraw)
    };

    var stickyFooter = function(){
        var windowHeight = cm.getPageSize('winHeight'),
            contentTop = cm.getY(that.nodes['content']),
            footerHeight = that.nodes['footer'].offsetHeight;
        that.nodes['content'].style.minHeight = Math.max((windowHeight - contentTop - footerHeight), 0) + 'px';
    };

    var redraw = function(){
        // Sticky Footer
        if(that.params['stickyFooter']){
            stickyFooter();
        }
    };

    /* ******* MAIN ******* */

    that.redraw = function(){
        redraw();
        return that;
    };

    init();
});