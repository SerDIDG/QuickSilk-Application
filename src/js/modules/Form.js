cm.define('Mod.Form', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'remember' : false,
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
        that.items = {};
        that.values = {};
        // Binds
        that.processItemHandler = that.processItem.bind(that);
        that.processWizardHandler = that.processWizard.bind(that);
        that.unloadEventHanlder = that.unloadEvent.bind(that);
    };

    classProto.onDestruct = function(){
        var that = this;
        that.components['finder'] && that.components['finder'].remove();
        that.components['finderWizard'] && that.components['finderWizard'].remove();
        cm.removeEvent(window, 'unload', that.unloadEventHanlder);
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Init form saving
        if(that.params['remember']){
            // Page unload event
            cm.addEvent(window, 'unload', that.unloadEventHanlder);
            // Local saving
            if(that.params['local']){
                that.values = that.storageRead('items');
                that.components['finder'] = new cm.Finder('App.AbstractModuleElement', null, that.nodes['container'], that.processItemHandler, {
                    'multiple' : true,
                    'childs' : true
                });
                that.components['finderWizard'] = new cm.Finder('Mod.ElementWizard', null, that.nodes['container'], that.processWizardHandler, {
                    'multiple' : true
                });
            }
        }
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
        item['controller'].addEvent('onTabChange', function(my, data){
            item['tab'] = item['controller'].getCurrentTab();
            item['value'] = item['tab']['id'];
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
    };

    classProto.processSave = function(){
        var that = this;
        that.storageWrite('items', that.values);
    };

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

    /******* PUBLIC *******/

    classProto.clear = function(){
        var that = this;
        that.storageClear('items');
        return that;
    };
});