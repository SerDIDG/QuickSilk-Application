cm.define('App.Template', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRedraw',
        'onResize'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-template',
        'fixedHeader' : false,
        'stickyFooter' : false,
        'scrollNode' : 'document.body',
        'scrollDuration' : 1000,
        'topMenuName' : 'app-topmenu'
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

    that.compoennts = {};
    that.anim = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
        redraw(true);
    };

    var render = function(){
        new cm.Finder('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.compoennts['topMenu'] = classObject;
        });
        // Scroll Controllers
        that.anim['scroll'] = new cm.Animation(that.params['scrollNode']);
        cm.addEvent(that.nodes['buttonUp'], 'click', that.scrollToTop);
        // Events
        cm.addEvent(window, 'resize', function(){
            animFrame(function(){
                that.triggerEvent('onResize');
                redraw(true);
            });
        });
    };

    var redraw = function(triggerEvents){
        // Fixed Header
        if(that.params['fixedHeader']){
            //fixedHeader();
        }
        // Sticky Footer
        if(that.params['stickyFooter']){
            stickyFooter();
        }
        // Redraw Events
        if(triggerEvents){
            that.triggerEvent('onRedraw');
        }
    };

    var fixedHeader = function(){
        var headerHeight = that.nodes['header'].offsetHeight;
        that.nodes['content'].style.marginTop = headerHeight + 'px';
    };

    var stickyFooter = function(){
        var windowHeight = cm.getPageSize('winHeight'),
            headerHeight = that.nodes['header'].offsetHeight,
            footerHeight = that.nodes['footer'].offsetHeight,
            topMenu = that.compoennts['topMenu']? that.compoennts['topMenu'].getDimensions('height') : 0;
        that.nodes['content'].style.minHeight = Math.max((windowHeight - topMenu - headerHeight - footerHeight), 0) + 'px';
    };

    /* ******* MAIN ******* */

    that.redraw = function(triggerEvents){
        triggerEvents = typeof triggerEvents == 'undefined'? true : triggerEvents;
        redraw(triggerEvents);
        return that;
    };

    that.scrollTo = function(num, duration){
        that.anim['scroll'].go({'style' : {'docScrollTop' : num}, 'duration' : duration, 'anim' : 'smooth'});
        return that;
    };

    that.scrollToTop = function(){
        that.scrollTo(0, that.params['scrollDuration']);
        return that;
    };

    that.scrollStop = function(){
        that.anim['scroll'].stop();
        return that;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});