cm.define('App.ModuleHiddenTabs', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onTabShow',
        'onTabHide',
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'event' : 'hover',              // hover | click
        'useMouseOut' : true,
        'showEmptyTab' : false,
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay',
        'isEditing' : false,
        'customEvents' : true,
        'Com.TabsetHelper' : {

        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div'),
        'inner' : cm.node('div'),
        'menu-label' : cm.node('div'),
        'labels' : [],
        'options' : [],
        'tabs' : []
    };
    that.components = {};
    that.tabs = [];
    that.options = [];

    that.isEditing = null;
    that.isProcessing = false;
    that.hideInterval = null;
    that.changeInterval = null;

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
        that.params['duration'] = cm.getTransitionDurationFromRule('.app-mod__hidden-tabs-helper__duration') || that.params['duration'];
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['targetEvent'] = that.params['event'];
    };

    var render = function(){
        // Process Tabset
        cm.getConstructor('Com.TabsetHelper', function(classConstructor, className){
            that.components['tabset'] = new classConstructor(that.params[className])
                .addEvent('onTabHide', function(tabset, data){
                    that.triggerEvent('onTabHide', data);
                })
                .addEvent('onTabShowStart', function(tabset, data){
                    if(!that.isProcessing){
                        that.nodes['content-list'].style.overflow = 'hidden';
                        that.nodes['content-list'].style.height = that.nodes['content-list'].offsetHeight + 'px';
                    }
                    that.isProcessing = true;
                    that.changeInterval && clearTimeout(that.changeInterval);
                    that.changeInterval = setTimeout(function(){
                        that.isProcessing = false;
                        that.nodes['content-list'].style.height = 'auto';
                        that.nodes['content-list'].style.overflow = 'visible';
                    }, that.params['duration']);
                })
                .addEvent('onTabShow', function(tabset, data){
                    that.nodes['content-list'].style.height = data['item']['tab']['container'].offsetHeight + 'px';
                    that.nodes['menu-label'].innerHTML = data['item']['title'];
                    that.triggerEvent('onTabShow', data);
                })
                .addEvent('onLabelTarget', function(tabset, data){
                    // If not in editing mod and tab does not contains any blocks, do not show it
                    if(!that.params['showEmptyTab'] && !that.isEditing && !cm.find('App.Block', null, data.item['tab']['inner']).length){
                        hide();
                    }else{
                        show();
                    }
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels']);
        });
        // Tabs
        processTabs();
        // Mobile menu
        cm.forEach(that.nodes['options'], processMenuItem);
        // Set target events
        setTargetEvents();
        // Add custom event
        if(that.params['customEvents']){
            cm.customEvent.add(that.params['node'], 'destruct', function(){
                that.destruct();
            });
            cm.customEvent.add(that.params['node'], 'redraw', function(){
                that.redraw();
            });
            cm.customEvent.add(that.params['node'], 'enableEditable', function(){
                that.enableEditing();
            });
            cm.customEvent.add(that.params['node'], 'disableEditable', function(){
                that.disableEditing();
            });
        }
        // Editing
        that.params['isEditing'] && that.enableEditing();
    };

    var processTabs = function(){
        that.tabs = that.components['tabset'].getTabs();
        cm.forEach(that.tabs, function(item){
            cm.addEvent(item['label']['link'], 'click', function(e){
                if(
                    that.isEditing
                    || (that.params['event'] == 'click' && that.components['tabset'].get() != item['id'])
                ){
                    cm.preventDefault(e);
                }
            });
        });
    };

    var processMenuItem = function(nodes){
        var item = cm.merge({
                'id' : '',
                'nodes' : nodes
            }, that.getNodeDataConfig(nodes['container']));
        cm.addEvent(nodes['container'], 'click', function(e){
            if(that.components['tabset'].get() != item['id']){
                cm.preventDefault(e);
                that.components['tabset'].set(item['id']);
                show();
            }
        });
        that.options.push(item);
    };

    var setTargetEvents = function(){
        if(that.params['event'] == 'hover'){
            cm.addEvent(that.nodes['container'], 'mouseover', mouseOverEvent);
        }
        if(that.params['event'] == 'hover' || that.params['useMouseOut']){
            cm.addEvent(that.nodes['container'], 'mouseout', mouseOutEvent);
        }
        cm.addEvent(window, 'click', clickOutEvent);
    };

    var removeTargetEvents = function(){
        if(that.params['event'] == 'hover'){
            cm.removeEvent(that.nodes['container'], 'mouseover', mouseOverEvent);
        }
        if(that.params['event'] == 'hover' || that.params['useMouseOut']){
            cm.removeEvent(that.nodes['container'], 'mouseout', mouseOutEvent);
        }
        cm.removeEvent(window, 'click', clickOutEvent);
    };

    var hide = function(){
        that.hideInterval && clearTimeout(that.hideInterval);
        that.hideInterval = setTimeout(function(){
            cm.removeClass(that.nodes['content'], 'is-show');
            that.nodes['menu-label'].innerHTML = '';
            that.hideInterval = setTimeout(function(){
                that.components['tabset'].unset();
            }, that.params['delay']);
        }, that.params['delay']);
    };

    var show = function(){
        var item = that.components['tabset'].getCurrentTab();
        if(item && (that.params['showEmptyTab'] || that.isEditing || cm.find('App.Block', null, item['tab']['inner']).length)){
            that.hideInterval && clearTimeout(that.hideInterval);
            cm.addClass(that.nodes['content'], 'is-show', true);
        }
    };

    var mouseOverEvent = function(){
        show();
    };

    var mouseOutEvent = function(e){
        var target = cm.getRelatedTarget(e);
        if(!cm.isParent(that.nodes['container'], target, true)){
            !that.isEditing && hide();
        }else{
            show();
        }
    };

    var clickOutEvent = function(e){
        var target = cm.getEventTarget(e);
        if(!cm.isParent(that.nodes['container'], target, true)){
            !that.isEditing && hide();
        }else{
            show();
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing is-editable');
            that.components['tabset'].setByIndex(0);
            show();
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable');
            hide();
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    that.destruct = function(){
        if(!that.isDestructed){
            that.isDestructed = true;
            removeTargetEvents();
            that.removeFromStack();
            cm.remove(that.nodes['container']);
        }
        return that;
    };

    that.redraw = function(){
        return that;
    };

    init();
});