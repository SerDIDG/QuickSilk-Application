cm.define('Mod.Form', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onSubmit',
        'onReset',
        'onValidate'
    ],
    'params' : {
        'remember' : false,
        'validate' : true,
        'local' : false,
        'unload' : false,
        'action' : null,
        'ajax' : {
            'method' : 'POST',
            'async' : false,
            'beacon' : true,
            'local' : false
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Mod.Form', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.isAjax = false;
        that.isUnload = false;
        that.items = {};
        that.values = {};
        that.nodes = {
            'form' : cm.node('form')
        };
        // Binds
        that.processItemHandler = that.processItem.bind(that);
        that.processWizardHandler = that.processWizard.bind(that);
        that.unloadEventHanlder = that.unloadEvent.bind(that);
        that.submitEventHandler = that.submitEvent.bind(that);
        that.resetEventHandler = that.resetEvent.bind(that);
        that.keypressEventHandler = that.keypressEvent.bind(that);
    };

    classProto.onDestruct = function(){
        var that = this;
        that.components['finder'] && that.components['finder'].remove();
        that.components['finderWizard'] && that.components['finderWizard'].remove();
        that.isUnload && cm.removeEvent(window, 'unload', that.unloadEventHanlder);
    };

    classProto.onValidateParams = function(){
        var that = this;
        // If URL parameter exists, use ajax data
        if(!cm.isEmpty(that.params['ajax']['url'])){
            that.isAjax = true;
        }
        that.isUnload = that.params['unload'] && that.isAjax;
        // Get form action
        that.params['action'] = that.nodes['form'].getAttribute('action') || that.params['action'];
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // Init form saving
        if(that.params['remember']){
            // Page unload event
            that.isUnload && cm.addEvent(window, 'unload', that.unloadEventHanlder);
            // Local saving
            if(that.params['local']){
                that.values = that.storageRead('items') || {};
                that.components['finder'] = new cm.Finder('App.AbstractModuleElement', null, that.nodes['container'], that.processItemHandler, {
                    'multiple' : true,
                    'childs' : true
                });
                that.components['finderWizard'] = new cm.Finder('Mod.ElementWizard', null, that.nodes['container'], that.processWizardHandler, {
                    'multiple' : true
                });
            }
        }
        // Form events
        cm.addEvent(that.nodes['form'], 'keypress', that.keypressEventHandler);
        cm.addEvent(that.nodes['form'], 'submit', that.submitEventHandler);
        cm.addEvent(that.nodes['form'], 'reset', that.resetEventHandler);
        return that;
    };

    classProto.processItem = function(classObject){
        var that = this;
        if(classObject.getParams('memorable')){
            var item = {
                'controller' : classObject,
                'name' : classObject.getParams('name'),
                'value' : null
            };
            // Merge
            if(that.values[item['name']]){
                item['value'] = that.values[item['name']];
            }
            // Set value
            if(!cm.isEmpty(item['value'])){
                item['controller'].set(item['value']);
            }
            // Events
            item['controller'].addEvent('onChange', function(my, data){
                item['value'] = item['controller'].get();
                that.values[item['name']] = item['value'];
                that.processSave();
            });
            item['controller'].addEvent('onDestruct', function(my){
                delete that.values[item['name']];
                delete that.items[item['name']];
                that.processSave();
            });
            // Push
            that.values[item['name']] = item['value'];
            that.items[item['name']] = item;
        }
    };

    classProto.processWizard = function(classObject){
        var that = this;
        var item = {
            'controller' : classObject,
            'name' : classObject.getParams('name'),
            'value' : null
        };
        // Merge
        if(that.values[item['name']]){
            item['value'] = that.values[item['name']];
        }
        // Set value
        item['controller'].setTab(item['value']);
        // Events
        item['controller'].addEvent('onTabChange', function(){
            item['tab'] = item['controller'].getCurrentTab();
            item['value'] = item['tab']['id'];
            that.values[item['name']] = item['value'];
            that.processSave();
        });
        item['controller'].addEvent('onDestruct', function(){
            delete that.values[item['name']];
            delete that.items[item['name']];
            that.processSave();
        });
        // Push
        that.values[item['name']] = item['value'];
        that.items[item['name']] = item;
    };

    classProto.processSave = function(){
        var that = this;
        that.storageWrite('items', that.values);
    };

    classProto.clearStoredItems = function(){
        var that = this;
        that.storageClear('items');
    };

    /*** EVENTS ***/

    classProto.unloadEvent = function(){
        var that = this,
            data;
        // Get Data
        if(that.params['local']){
            data = that.values
        }else{
            data = cm.getFDO(that.nodes['container']);
        }
        // Send
        that.components['ajax'] = cm.ajax(
            cm.merge(that.params['ajax'], {
                'params' : data
            })
        );
    };

    classProto.keypressEvent = function(e){
        var that = this;
        if(cm.isFormInputFocused() && e.code === 'Enter'){
            cm.preventDefault(e);
        }
    };

    classProto.submitEvent = function(e){
        var that = this;
        cm.preventDefault(e);
        that.submit();
    };

    classProto.resetEvent = function(e){
        var that = this;
        cm.preventDefault(e);
        that.clear();
    };

    /******* PUBLIC *******/

    classProto.validate = function(){
        var that = this,
            data = new FormData(that.nodes['form']),
            isValid = true,
            findOptions = {
                'childs' : true
            };
        cm.find('App.AbstractModuleElement', null, that.nodes['form'], function(classObject){
            if(cm.isFunction(classObject.validate)){
                if(!classObject.validate()){
                    isValid = false;
                }
            }
        }, findOptions);
        that.triggerEvent('onValidate', {
            'form' : that.nodes['form'],
            'data' : data,
            'action' : that.params['action'],
            'isValid' : isValid
        });
        return isValid;
    };

    classProto.submit = function(){
        var that = this,
            data = new FormData(that.nodes['form']),
            isValid = true;
        // Validate
        if(that.params['validate']){
            isValid = that.validate();
        }
        if(isValid){
            that.clearStoredItems();
            that.triggerEvent('onSubmit', {
                'form' : that.nodes['form'],
                'data' : data,
                'action' : that.params['action']
            });
        }
        return that;
    };

    classProto.clear = function(){
        var that = this,
            data = new FormData(that.nodes['form']),
            findOptions = {
                'childs' : true
            };
        cm.find('App.AbstractModuleElement', null, that.nodes['form'], function(classObject){
            cm.isFunction(classObject.clear) && classObject.clear();
        }, findOptions);
        that.clearStoredItems();
        that.triggerEvent('onReset', {
            'form' : that.nodes['form'],
            'data' : data,
            'action' : that.params['action']
        });
        return that;
    };
});