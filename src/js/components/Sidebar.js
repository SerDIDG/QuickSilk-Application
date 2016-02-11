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
        'onRenderStart',
        'onRender',
        'onCollapseStart',
        'onCollapse',
        'onCollapseEnd',
        'onExpandStart',
        'onExpand',
        'onExpandEnd',
        'onTabShow',
        'onTabHide',
        'onResize'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-sidebar',
        'duration' : 300,
        'active' : 'template-manager',
        'target' : 'document.html',
        'remember' : true,
        'ajax' : {
            'type' : 'json',
            'method' : 'get',
            'url' : '',                                             // Request URL. Variables: %tab%, %callback% for JSONP.
            'params' : ''                                           // Params object. %tab%, %callback% for JSONP.
        },
        'Com.TabsetHelper' : {
            'node' : cm.Node('div'),
            'name' : '',
            'responseHTML' : true
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
        'tabs' : []
    };
    that.components = {};
    that.isExpanded = null;
    that.openInterval = null;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var getCSSHelpers = function(){
        that.params['duration'] = cm.getTransitionDurationFromRule('.app__sidebar-helper__duration');
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['ajax'] = that.params['ajax'];
    };

    var render = function(){
        var isExpanded, helperMenuRule, helperContentRule;
        // Init tabset
        processTabset();
        // Get sidebar dimensions from CSS
        scrollBarSize = cm._scrollSize;
        if(helperMenuRule = cm.getCSSRule('.app__sidebar-helper__menu-width')[0]){
            menuWidth = cm.styleToNumber(helperMenuRule.style.width);
        }
        if(helperContentRule = cm.getCSSRule('.app__sidebar-helper__content-width')[0]){
            contentWidth = cm.styleToNumber(helperContentRule.style.width);
        }
        // Add events on collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addEvent(item['container'], 'click', that.toggle);
        });
        // Resize sidebar relative to scroll bar size
        resize();
        // Check toggle class
        isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        // Check storage
        if(that.params['remember']){
            isExpanded = that.storageRead('isExpanded');
        }
        // Trigger events
        if(isExpanded){
            that.expand(true, true);
        }else{
            that.collapse(true, true);
        }
        cm.addEvent(window, 'resize', resizeAction);
        cm.customEvent.add(that.nodes['container'], 'scrollSizeChange', resizeAction);
    };

    var processTabset = function(){
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper'])
                .addEvent('onLabelTarget', function(tabset, data){
                    if(!that.isExpanded || tabset.get() == data['item']['id']){
                        that.toggle();
                    }
                })
                .addEvent('onTabHide', function(tabset, data){
                    that.triggerEvent('onTabHide', data);
                })
                .addEvent('onTabShow', function(tabset, data){
                    that.triggerEvent('onTabShow', data);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels'])
                .set(that.params['active']);
        });
        // Tabs events
        cm.forEach(that.nodes['tabs'], function(item){
            cm.addIsolateScrolling(item['descr']);
        });
    };

    var resize = function(){
        var rule,
            params = {
                'innerWidth' : contentWidth + scrollBarSize,
                'width' : menuWidth + contentWidth + scrollBarSize,
                'contentWidth' : contentWidth,
                'menuWidth' : menuWidth,
                'scrollBarSize' : scrollBarSize
            };
        cm.addClass(that.nodes['container'], 'is-immediately');
        if(rule = cm.getCSSRule('.app__sidebar .sidebar__content')[0]){
            rule.style.width = [params['innerWidth'], 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app__sidebar .sidebar__remove-zone')[0]){
            rule.style.width = [params['innerWidth'], 'px'].join('');
        }
        if((rule = cm.getCSSRule('.app__sidebar.is-expanded')[0]) || (rule = cm.getCSSRule('.is-expanded.app__sidebar')[0])){
            rule.style.width = [params['width'], 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app__sidebar-helper__width-expanded')[0]){
            rule.style.width = [params['width'], 'px'].join('');
        }
        that.triggerEvent('onResize', params);
        setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'is-immediately');
        }, 5);
    };

    var resizeAction = function(){
        animFrame(function(){
            if(cm._scrollSize != scrollBarSize){
                scrollBarSize = cm._scrollSize;
                resize();
            }
            if(cm._pageSize['winWidth'] <= cm._config['adaptiveFrom']){
                if(that.isExpanded){
                    that.collapse(true);
                }
            }
        });
    };

    /* ******* MAIN ******* */

    that.collapse = function(isImmediately, force){
        if(force || typeof that.isExpanded !== 'boolean' || that.isExpanded){
            that.isExpanded = false;
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isExpanded', false);
            }
            that.triggerEvent('onCollapseStart');
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
            that.openInterval && clearTimeout(that.openInterval);
            if(isImmediately){
                that.triggerEvent('onCollapse');
                that.triggerEvent('onCollapseEnd');
                that.openInterval = setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                    cm.removeClass(that.params['target'], 'is-immediately');
                }, 5);
            }else{
                that.openInterval = setTimeout(function(){
                    that.triggerEvent('onCollapse');
                    that.triggerEvent('onCollapseEnd');
                }, that.params['duration'] + 5);
            }
        }
        return that;
    };

    that.expand = function(isImmediately, force){
        if(force || typeof that.isExpanded !== 'boolean' || !that.isExpanded){
            that.isExpanded = true;
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isExpanded', true);
            }
            that.triggerEvent('onExpandStart');
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
            that.openInterval && clearTimeout(that.openInterval);
            if(isImmediately){
                that.triggerEvent('onExpand');
                that.triggerEvent('onExpandEnd');
                that.openInterval = setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                    cm.removeClass(that.params['target'], 'is-immediately');
                }, 5);
            }else{
                that.openInterval = setTimeout(function(){
                    that.triggerEvent('onExpand');
                    that.triggerEvent('onExpandEnd');
                }, that.params['duration'] + 5);
            }
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

    that.resize = function(){
        resize();
        return that;
    };

    that.getDimensions = function(key){
        var rect = cm.getRect(that.nodes['container']);
        return rect[key] || rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});