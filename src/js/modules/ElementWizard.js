cm.define('Mod.ElementWizard', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onTabShow',
        'onTabHide',
        'onTabChange',
        'onValidate'
    ],
    'params' : {
        'scrollNode' : 'document.body',
        'scrollDuration' : 'cm._config.animDurationLong',
        'topMenuName' : 'app-topmenu',
        'templateName' : 'app-template',
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay',
        'active' : null,
        'Com.TabsetHelper' : {
            'targetEvent' : 'none'
        },
        'Com.AbstractInput' : {
            'className' : 'tabs__input'
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Mod.ElementWizard', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.tabs = {};
        that.tabsCount = 0;
        that.options = [];
        that.isProcessing = false;
        that.changeInterval = null;
        that.currentTab = null;
        // Bind
        that.prevTabHandler = that.prevTab.bind(that);
        that.nextTabHandler = that.nextTab.bind(that);
        that.doneTabHandler = that.doneTab.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        if(that.currentTab === null){
            if(that.params['active'] && that.tabs[that.params['active']]){
                that.setTab(that.params['active']);
            }else{
                that.setTabByIndex(0);
            }
        }
    };

    classProto.onValidateParams = function(){
        var that = this;
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = that.params['name'];
        that.params['Com.AbstractInput']['container'] = that.nodes['container'];
        that.params['Com.AbstractInput']['name'] = that.params['name'];
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Init scroll
        that.components['scroll'] = new cm.Animation(that.params['scrollNode']);
        // Get TopMenu
        new cm.Finder('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
            that.topMenuParams = that.components['topMenu'].getParams();
        });
        // Get Template
        new cm.Finder('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.templateParams = that.components['template'].getParams();
        });
        // Process Tabset
        that.processTabset();
        that.processTabs();
        that.processMenu();
        // Buttons
        that.processButtons();
        that.processInput();
    };

    classProto.processTabset = function(){
        var that = this;
        cm.getConstructor('Com.TabsetHelper', function(classConstructor, className){
            that.components['tabset'] = new classConstructor(that.params[className])
                .addEvent('onTabHide', function(tabset, item){
                    that.triggerEvent('onTabHide', item);
                })
                .addEvent('onTabShowStart', function(tabset, item){
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
                .addEvent('onTabShow', function(tabset, item){
                    that.currentTab = item;
                    that.nodes['content-list'].style.height = item['tab']['container'].offsetHeight + 'px';
                    that.setMenu();
                    that.setButtons();
                    that.setInput();
                    that.triggerEvent('onTabShow', item);
                    that.triggerEvent('onTabChange', item);
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
                if(that.validateTab() && that.currentTab['id'] !== item['id']){
                    that.setTab(item['id']);
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
                if(that.validateTab() && that.currentTab['id'] !== item['id']){
                    that.setTab(item['id']);
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
        cm.addEvent(that.nodes['buttonDone'], 'click', that.doneTabHandler);
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

    classProto.processInput = function(){
        var that = this;
        cm.getConstructor('Com.AbstractInput', function(classConstructor, className){
            that.components['input'] = new classConstructor(that.params[className]);
        });
    };

    classProto.setInput = function(){
        var that = this;
        that.currentTab && that.components['input'] && that.components['input'].set(that.currentTab['id']);
    };

    /*** TABS ***/

    classProto.validateTab = function(item){
        var that = this,
            tab = cm.isUndefined(item) ? that.currentTab : item,
            isValid = true;
        if(!that.isEditing){
            cm.find('App.AbstractModuleElement', null, tab['tab']['inner'], function(classObject){
                if(cm.isFunction(classObject.validate)){
                    if(!classObject.validate()){
                        isValid = false;
                    }
                }
            }, {'childs' : true});
        }
        return isValid;
    };

    classProto.prevTab = function(e){
        var that = this;
        cm.preventDefault(e);
        if(that.validateTab() && that.currentTab['index'] > 0){
            var index = that.currentTab['index'] - 1;
            that.setTabByIndex(index);
            that.scrollToTop();
        }
    };

    classProto.nextTab = function(e){
        var that = this;
        cm.preventDefault(e);
        if(that.validateTab() && that.currentTab['index'] < that.tabsCount - 1){
            var index = that.currentTab['index'] + 1;
            that.setTabByIndex(index);
            that.scrollToTop();
        }
    };

    classProto.doneTab = function(e){
        var that = this;
        if(!that.validate()){
            cm.preventDefault(e);
            that.showError();
        }else{
            that.hideError();
        }
    };

    classProto.setTab = function(id){
        var that = this;
        that.components['tabset'].set(id);
    };

    classProto.setTabByIndex = function(index){
        var that = this;
        that.components['tabset'].setByIndex(index);
    };

    classProto.getCurrentTab = function(){
        var that = this;
        return that.currentTab;
    };

    /*** ERRORS ***/

    classProto.showError = function(){
        var that = this;
        cm.removeClass(that.nodes['notifications'], 'is-hidden');
        return that;
    };

    classProto.hideError = function(){
        var that = this;
        cm.addClass(that.nodes['notifications'], 'is-hidden');
        return that;
    };

    /******* PUBLIC *******/

    classProto.validate = function(){
        var that = this,
            isValid = true;
        cm.forEach(that.tabs, function(item){
            if(isValid && !that.validateTab(item)){
                that.setTabByIndex(item['index']);
                that.scrollToTop();
                isValid = false;
            }
        });
        that.triggerEvent('onValidate', {
            'valid' : isValid
        });
        return isValid;
    };

    classProto.scrollToTop = function(){
        var that = this,
            rect = cm.getOffsetRect(that.nodes['container']),
            page = cm.getRect(window),
            expectedTop = rect.offset.top - 16,
            inRange;
        // Add top menu gape
        if(that.components['topMenu']){
            page.top += that.components['topMenu'].getDimensions('height');
            expectedTop -= that.components['topMenu'].getDimensions('height');
        }
        // Add template's fixed header gape
        if(that.components['template'] && that.templateParams['header']['fixed']){
            page.top += that.components['template'].getHeaderDimensions('height');
            expectedTop -= that.components['template'].getHeaderDimensions('height');
        }
        // Check range
        inRange = rect.top > page.top && rect.top < page.bottom;
        expectedTop = Math.max(expectedTop, 0);
        if(!inRange){
            that.components['scroll'].go({'style' : {'docScrollTop' : expectedTop}, 'duration' : that.params['scrollDuration'], 'anim' : 'smooth'});
        }
        return that;
    };
});
