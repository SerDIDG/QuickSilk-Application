cm.define('App.Sidebar', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Storage',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onCollapse',
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-sidebar',
        'active' : 'modules',
        'target' : 'document.html',
        'remember' : true,
        'Com.TabsetHelper' : {
            'node' : cm.Node('div'),
            'name' : ''
        }
    }
},
function(params){
    var that = this,
        scrollBarSize = 0,
        menuWidth = 0,
        contentWidth;

    that.nodes = {
        'container' : cm.Node('div'),
        'inner' : cm.Node('div'),
        'collapseButtons' : [],
        'labels' : [],
        'tabs' : [],
        'areas' : [],
        'widgets' : []
    };
    that.components = {};
    that.isExpanded = false;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        validateParams();
        render();
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
    };

    var render = function(){
        var helperMenuRule, helperContentRule;
        // Init tabset
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper']);
            that.components['tabset'].addEvent('onLabelClick', function(tabset, data){
                if(!that.isExpanded || tabset.get() == data['id']){
                    that.toggle();
                }
            });
            that.components['tabset'].addTabs(that.nodes['tabs'], that.nodes['labels']);
            that.components['tabset'].set(that.params['active']);
        });
        // Get sidebar dimensions from CSS
        scrollBarSize = cm._scrollSize;
        if(helperMenuRule = cm.getCSSRule('.app-lt__sidebar-helper__menu-width')[0]){
            menuWidth = cm.styleToNumber(helperMenuRule.style.width);
        }
        if(helperContentRule = cm.getCSSRule('.app-lt__sidebar-helper__content-width')[0]){
            contentWidth = cm.styleToNumber(helperContentRule.style.width);
        }
        // Add events on collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addEvent(item['container'], 'click', that.toggle);
        });
        // Resize sidebar relative to scroll bar size
        resize();
        // Check toggle class
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        // Check storage
        if(that.params['remember']){
            that.isExpanded = that.storageRead('isExpanded');
        }
        // Check sidebars visibility
        if(!cm.inDOM(that.nodes['container']) || cm.getStyle(that.nodes['container'], 'display') == 'none'){
            that.isExpanded = false;
        }
        // Trigger events
        if(that.isExpanded){
            that.expand(true);
        }else{
            that.collapse(true);
        }
        cm.addEvent(window, 'resize', onResize);
    };

    var resize = function(){
        var rule;
        cm.addClass(that.nodes['container'], 'is-immediately');
        if(rule = cm.getCSSRule('.app-lt__sidebar .sidebar__content')[0]){
            rule.style.width = [contentWidth + scrollBarSize, 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app-lt__sidebar .sidebar__remove-zone')[0]){
            rule.style.width = [contentWidth + scrollBarSize, 'px'].join('');
        }
        if((rule = cm.getCSSRule('.app-lt__sidebar.is-expanded')[0]) || (rule = cm.getCSSRule('.is-expanded.app-lt__sidebar')[0])){
            rule.style.width = [menuWidth + contentWidth + scrollBarSize, 'px'].join('');
        }
        if(rule = cm.getCSSRule('html.is-sidebar--expanded .tpl__container')[0]){
            rule.style.marginLeft = [menuWidth + contentWidth + scrollBarSize, 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app-lt__sidebar-helper__width-expanded')[0]){
            rule.style.width = [menuWidth + contentWidth + scrollBarSize, 'px'].join('');
        }
        setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'is-immediately');
        }, 5);
    };

    var onResize = function(){
        if(cm._scrollSize != scrollBarSize){
            scrollBarSize = cm._scrollSize;
            resize();
        }
    };

    /* ******* MAIN ******* */

    that.collapse = function(isImmediately){
        var tab;
        that.isExpanded = false;
        // Set immediately animation hack
        if(isImmediately){
            cm.addClass(that.nodes['container'], 'is-immediately');
            cm.addClass(that.params['target'], 'is-immediately');
        }
        cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed', true);
        cm.replaceClass(that.params['target'], 'is-sidebar--expanded', 'is-sidebar--collapsed', true);
        // Unset active class to collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.removeClass(item['container'], 'active');
        });
        // Remove immediately animation hack
        if(isImmediately){
            setTimeout(function(){
                cm.removeClass(that.nodes['container'], 'is-immediately');
                cm.removeClass(that.params['target'], 'is-immediately');
            }, 5);
        }
        // Write storage
        if(that.params['remember']){
            that.storageWrite('isExpanded', false);
        }
        that.triggerEvent('onCollapse');
        return that;
    };

    that.expand = function(isImmediately){
        that.isExpanded = true;
        // Set immediately animation hack
        if(isImmediately){
            cm.addClass(that.nodes['container'], 'is-immediately');
            cm.addClass(that.params['target'], 'is-immediately');
        }
        cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded', true);
        cm.replaceClass(that.params['target'], 'is-sidebar--collapsed', 'is-sidebar--expanded', true);
        // Set active class to collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addClass(item['container'], 'active');
        });
        // Remove immediately animation hack
        if(isImmediately){
            setTimeout(function(){
                cm.removeClass(that.nodes['container'], 'is-immediately');
                cm.removeClass(that.params['target'], 'is-immediately');
            }, 5);
        }
        // Write storage
        if(that.params['remember']){
            that.storageWrite('isExpanded', true);
        }
        that.triggerEvent('onExpand');
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

    that.setTab = function(id){
        if(that.components['tabset']){
            that.components['tabset'].set(id);
        }
        return that;
    };

    that.unsetTab = function(){
        if(that.components['tabset']){
            that.components['tabset'].unset();
        }
        return that;
    };

    that.getTab = function(){
        if(that.components['tabset']){
            return that.components['tabset'].get();
        }
        return null;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});