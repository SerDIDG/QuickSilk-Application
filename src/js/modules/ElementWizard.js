cm.define('Mod.ElementWizard', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onTabShow',
        'onTabHide'
    ],
    'params' : {
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay',
        'Com.TabsetHelper' : {
            'targetEvent' : 'none'
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Mod.ElementWizard', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.tabs = {};
        that.tabsCount = 0;
        that.options = [];
        that.isProcessing = false;
        that.changeInterval = null;
        that.currentTab = 0;
        // Bind
        that.prevTabHandler = that.prevTab.bind(that);
        that.nextTabHandler = that.nextTab.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        that.setTab(0);
    };

    classProto.onValidateParams = function(){
        var that = this;
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Process Tabset
        that.processTabset();
        that.processTabs();
        that.processMenu();
        // Buttons
        that.processButtons();
    };

    classProto.processTabset = function(){
        var that = this;
        cm.getConstructor('Com.TabsetHelper', function(classConstructor, className){
            that.components['tabset'] = new classConstructor(that.params[className])
                .addEvent('onTabHide', function(tabset, data){
                    that.triggerEvent('onTabHide', data['item']);
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
                    that.currentTab = data['item'];
                    that.nodes['content-list'].style.height = data['item']['tab']['container'].offsetHeight + 'px';
                    that.setMenu();
                    that.setButtons();
                    that.triggerEvent('onTabShow', data['item']);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels']);
        });
    };

    classProto.processTabs = function(){
        var that = this;
        that.tabs = that.components['tabset'].getTabs();
        that.tabsCount = that.components['tabset'].getTabsCount();
        cm.forEach(that.tabs, function(item){
            cm.addEvent(item['label']['container'], 'click', function(){
                if(that.validateTab() && that.currentTab['id'] != item['id']){
                    that.components['tabset'].set(item['id']);
                }
            });
        });
    };

    classProto.processMenu = function(){
        var that = this;
        cm.forEach(that.nodes['options'], function(nodes){
            var item = cm.merge({
                'id' : '',
                'nodes' : nodes
            }, that.getNodeDataConfig(nodes['container']));
            // Click Events
            cm.addEvent(nodes['container'], 'click', function(){
                if(that.validateTab() && that.currentTab['id'] != item['id']){
                    that.components['tabset'].set(item['id']);
                }
            });
            // Push
            that.options.push(item);
        });
    };

    classProto.setMenu = function(){
        var that = this;
        that.nodes['menu-label'].innerHTML = that.currentTab['title'];
    };

    classProto.processButtons = function(){
        var that = this;
        cm.addEvent(that.nodes['buttonPrev'], 'click', that.prevTabHandler);
        cm.addEvent(that.nodes['buttonNext'], 'click', that.nextTabHandler);
    };

    classProto.setButtons = function(){
        var that = this,
            index = that.currentTab['index'];
        if(index === 0){
            cm.addClass(that.nodes['buttonPrev'], 'is-hidden');
            cm.removeClass(that.nodes['buttonNext'], 'is-hidden');
            cm.addClass(that.nodes['buttonDone'], 'is-hidden');
        }
        if(index > 0 && index < that.tabsCount - 1){
            cm.removeClass(that.nodes['buttonPrev'], 'is-hidden');
            cm.removeClass(that.nodes['buttonNext'], 'is-hidden');
            cm.addClass(that.nodes['buttonDone'], 'is-hidden');
        }
        if(index === that.tabsCount - 1){
            cm.removeClass(that.nodes['buttonPrev'], 'is-hidden');
            cm.addClass(that.nodes['buttonNext'], 'is-hidden');
            cm.removeClass(that.nodes['buttonDone'], 'is-hidden');
        }
    };

    /*** TABS ***/

    classProto.validateTab = function(){
        var that = this,
            isValid = true;
        if(!that.isEditing){
            cm.find('App.AbstractModuleElement', null, that.currentTab['tab']['inner'], function(classObject){
                if(cm.isFunction(classObject.validate)){
                    if(!classObject.validate()){
                        isValid = false;
                    }
                }
            }, {'childs' : true});
        }
        return isValid;
    };

    classProto.prevTab = function(){
        var that = this;
        if(that.validateTab() && that.currentTab['index'] > 0){
            var index = that.currentTab['index'] - 1;
            that.setTab(index);
        }
    };

    classProto.nextTab = function(){
        var that = this;
        if(that.validateTab() && that.currentTab['index'] < that.tabsCount - 1){
            var index = that.currentTab['index'] + 1;
            that.setTab(index);
        }
    };

    classProto.setTab = function(index){
        var that = this;
        that.components['tabset'].setByIndex(index);
    };
});