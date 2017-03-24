cm.define('App.AbstractModuleElement', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'required' : false,
        'pattern' : /^\s*$/g,
        'match' : false,
        'targetController' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('App.AbstractModuleElement', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Get controller
        if(that.params['targetController']){
            cm.find(that.params['targetController'], that.params['name'], that.nodes['field'], function(classObject){
                that.components['controller'] = classObject;
            });
        }
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

    classProto.getMultiple = function(){
        var that = this,
            value = [];
        cm.forEach(that.nodes['inputs'], function(nodes){
            value.push(nodes['input'].value);
        });
        return value;
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