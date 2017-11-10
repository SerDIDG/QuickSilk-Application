cm.define('App.AbstractModuleElement', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onChange'
    ],
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'required' : false,
        'pattern' : /^\s*$/g,
        'match' : false,
        'targetController' : false,
        'memorable' : true,
        'remember' : false,
        'inputEvent' : 'input'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('App.AbstractModuleElement', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind
        that.changeEventHandler = that.changeEvent.bind(that);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        // Restore value from local storage
        that.restoreLocalValue();
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Get controller
        if(that.params['targetController']){
            that.renderController();
        }else if(!cm.isEmpty(that.nodes['inputs'])){
            that.renderInputs();
        }else{
            that.renderInput(that.nodes['input']);
        }
    };

    classProto.renderController = function(){
        var that = this;
        cm.find(that.params['targetController'], that.params['name'], that.nodes['field'], function(classObject){
            that.components['controller'] = classObject;
            that.components['controller'].addEvent('onChange', that.changeEventHandler);
        });
    };

    classProto.renderInputs = function(){
        var that = this;
        cm.forEach(that.nodes['inputs'], function(nodes){
            that.renderInput(nodes['input']);
        });
    };

    classProto.renderInput = function(node){
        var that = this;
        cm.addEvent(node, that.params['inputEvent'], that.changeEventHandler);
    };

    /*** EVENTS ***/

    classProto.changeEvent = function(){
        var that = this;
        var value = that.get();
        that.saveLocalValue();
        that.triggerEvent('onChange', value);
    };

    /*** DATA ***/

    classProto.saveLocalValue = function(){
        var that = this;
        if(that.params['memorable'] && that.params['remember']){
            var value = that.get();
            that.storageWrite('value', value);
        }
    };

    classProto.restoreLocalValue = function(){
        var that = this;
        if(that.params['memorable'] && that.params['remember']){
            var value = that.storageRead('value');
            that.set(value);
        }
    };

    classProto.setMultiple = function(values){
        var that = this;
        if(cm.isArray(value)){
            cm.forEach(that.nodes['inputs'], function(nodes, i){
                if(values[i]){
                    nodes['input'].value = values[i];
                }
            });
        }
    };

    classProto.getMultiple = function(){
        var that = this,
            values = [];
        cm.forEach(that.nodes['inputs'], function(nodes){
            values.push(nodes['input'].value);
        });
        return values;
    };

    classProto.validateValue = function(){
        var that = this,
            value = that.get(),
            test;
        if(cm.isRegExp(that.params['pattern'])){
            if(cm.isEmpty(value)){
                test = true;
            }else{
                test = that.params['pattern'].test(value);
            }
        }else{
            test = that.params['pattern'] === value;
        }
        return that.params['match']? test : !test;
    };

    /******* PUBLIC *******/

    classProto.set = function(value){
        var that = this;
        if(that.components['controller']){
            that.components['controller'].set(value);
        }else if(!cm.isEmpty(that.nodes['inputs'])){
            that.setMultiple(value);
        }else{
            that.nodes['input'].value = value;
        }
        return that;
    };

    classProto.get = function(){
        var that = this;
        if(that.components['controller']){
            return that.components['controller'].get();
        }
        if(!cm.isEmpty(that.nodes['inputs'])){
            return that.getMultiple();
        }
        return that.nodes['input'].value;
    };

    classProto.validate = function(){
        var that = this,
            isValid = true;
        if(that.params['required']){
            isValid = that.validateValue();
            if(isValid){
                cm.removeClass(that.nodes['field'], 'error');
                cm.addClass(that.nodes['errors'], 'hidden');
            }else{
                cm.addClass(that.nodes['field'], 'error');
                cm.removeClass(that.nodes['errors'], 'hidden');
            }
        }
        return isValid;
    };
});