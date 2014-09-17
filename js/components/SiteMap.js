cm.define('App.SiteMap', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'scroll' : true,
        'scrollNode' : 'document.html',
        'animatePadding' : true,
        'duration' : 500
    }
},
function(params){
    var that = this,
        animations = {};

    that.nodes = {
        'Template' : {
            'container' : cm.Node('div'),
            'content' : cm.Node('div'),
            'footer' : cm.Node('div')
        },
        'AppSitemap' : {
            'button' : cm.Node('div'),
            'target' : cm.Node('div')
        }
    };

    that.isExpanded = false;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(document.body, that.params['nodesDataMarker'], null);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        if(cm.inDOM(that.nodes['AppSitemap']['button'])){
            setPadding();

            animations['container'] = new cm.Animation(that.nodes['AppSitemap']['target']);
            animations['content'] = new cm.Animation(that.nodes['Template']['content']);
            animations['scroll'] = new cm.Animation(that.params['scrollNode']);

            cm.addEvent(window, 'resize', setPadding);
            cm.addEvent(that.nodes['AppSitemap']['button'], 'click', toggle);
        }
        that.triggerEvent('onRender');
    };

    var toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
    };

    var setPadding = function(){
        if(that.params['animatePadding']){
            that.nodes['Template']['content'].style.paddingBottom = [that.nodes['Template']['footer'].offsetHeight, 'px'].join('');
        }
    };

    var getScrollStyle = function(height){
        var styles = {};
        if(that.params['scrollNode'] == document.body || that.params['scrollNode'] == document.documentElement){
            styles['docScrollTop'] = [cm.getBodyScrollHeight() + height, 'px'].join('');
        }else{
            styles['scrollTop'] = [that.params['scrollNode'].scrollHeight + height, 'px'].join('');
        }
        return styles;
    };

    /* ******* MAIN ******* */

    that.expand = function(){
        var containerHeight, footerHeight;
        that.isExpanded = true;
        // Add css class to button
        cm.replaceClass(that.nodes['AppSitemap']['button'], 'is-collapsed', 'is-expanded');
        // Get sitemap height
        containerHeight = cm.getRealHeight(that.nodes['AppSitemap']['target']);
        // Animate map height
        animations['container'].go({'style': {'height' : [containerHeight,'px'].join('')}, 'anim' : 'smooth', 'duration' : that.params['duration'], 'onStop' : function(){
            that.nodes['AppSitemap']['target'].style.height = 'auto';
            that.nodes['AppSitemap']['target'].style.overflow = 'visible';
        }});
        // Animate content padding-bottom
        if(that.params['animatePadding']){
            footerHeight = that.nodes['Template']['footer'].offsetHeight;
            animations['content'].go({'style': {'paddingBottom' : [containerHeight + footerHeight,'px'].join('')}, 'anim' : 'smooth', 'duration' : that.params['duration']});
        }
        // Scroll to document bottom
        if(that.params.scroll){
            animations['scroll'].go({'style' : getScrollStyle(footerHeight), 'anim' : 'smooth', 'duration' : that.params['duration']});
        }
    };

    that.collapse = function(){
        var footerHeight;
        that.isExpanded = false;
        cm.replaceClass(that.nodes['AppSitemap']['button'], 'is-expanded', 'is-collapsed');
        // Animate map height
        that.nodes['AppSitemap']['target'].style.overflow = 'hidden';
        animations['container'].go({'style' : {'height': '0px'}, 'anim' : 'acceleration', 'duration' : that.params['duration']});
        // Animate content padding-bottom
        if(that.params['animatePadding']){
            that.nodes['AppSitemap']['target'].style.height = 0;
            footerHeight = that.nodes['Template']['footer'].offsetHeight;
            that.nodes['AppSitemap']['target'].style.height = 'auto';
            animations['content'].go({'style': {'paddingBottom' : [footerHeight,'px'].join('')}, 'anim' : 'acceleration', 'duration' : that.params['duration']});
        }
    };

    init();
});