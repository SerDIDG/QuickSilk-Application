cm.define('Mod.Form', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onSubmit',
        'onReset'
    ],
    'params' : {
        'remember' : false,
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

cm.getConstructor('Mod.Form', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

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
        _inherit.prototype.renderViewModel.apply(that, arguments);
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
            item['controller'].set(item['value']);
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
        if(cm.isFormInputFocused() && cm.isKey(e, 'enter')){
            cm.preventDefault(e);
        }
    };

    classProto.submitEvent = function(e){
        var that = this,
            data;
        cm.preventDefault(e);
        // Submit
        data = new FormData(that.nodes['form']);
        that.triggerEvent('onSubmit', {
            'form' : that.nodes['form'],
            'data' : data,
            'action' : that.params['action']
        });
        that.clear();
    };

    classProto.resetEvent = function(e){
        var that = this;
        var data = new FormData(that.nodes['form']);
        cm.preventDefault(e);
        that.triggerEvent('onReset', {
            'form' : that.nodes['form'],
            'data' : data,
            'action' : that.params['action']
        });
        that.clear();
    };

    /******* PUBLIC *******/

    classProto.clear = function(){
        var that = this;
        that.storageClear('items');
        return that;
    };
});