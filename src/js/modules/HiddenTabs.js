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
        that.params['duration'] = cm.getTransitionDurationFromRule('.app-mod__hidden-tabs__duration') || that.params['duration'];
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['targetEvent'] = that.params['event'];
    };

    var render = function(){
        // Process Tabset
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper'])
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
                    show();
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels']);
        });
        // Mobile menu
        cm.forEach(that.nodes['options'], function(item){
            var config = that.getNodeDataConfig(item['container']);
            cm.addEvent(item['container'], 'click', function(){
                that.components['tabset'].set(config['id']);
                show();
            });
        });
        // Target events
        if(that.params['event'] == 'hover'){
            cm.addEvent(that.nodes['container'], 'mouseover', function(e){
                show();
            });
            cm.addEvent(that.nodes['container'], 'mouseout', function(e){
                var target = cm.getRelatedTarget(e);
                if(!cm.isParent(that.nodes['container'], target, true)){
                    !that.isEditing && hide();
                }
            });
        }
        cm.addEvent(window, 'click', function(e){
            var target = cm.getEventTarget(e);
            if(!cm.isParent(that.nodes['container'], target, true)){
                !that.isEditing && hide();
            }else{
                show();
            }
        });
        // Add custom event
        if(that.params['customEvents']){
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
        if(that.components['tabset'].current){
            that.hideInterval && clearTimeout(that.hideInterval);
            cm.addClass(that.nodes['content'], 'is-show', true);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
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
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable');
            hide();
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    that.redraw = function(){
        return that;
    };

    init();
});