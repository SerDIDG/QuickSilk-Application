cm.define('App.ShutterstockOptimizeContainer', {
    'extend' : 'Com.AbstractContainer',
    'events' : [
        'onComplete',
        'onCancel'
    ],
    'params' : {
        'item' : {},
        'constructor' : 'App.ShutterstockOptimize',
        'params' : {
            'embedStructure' : 'append'
        },
        'placeholder' : true,
        'placeholderConstructor' : 'Com.DialogContainer',
        'placeholderParams' : {
            'renderButtons' : true,
            'params' : {
                'width' : 350,
                'theme' : 'theme-compact'
            }
        }
    },
    'strings' : {
        'title' : 'Optimize image',
        'close' : 'Cancel',
        'save' : 'Select'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});

cm.getConstructor('App.ShutterstockOptimizeContainer', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.state = 'initial';
        // Bind context to methods
        that.completeHandler = that.complete.bind(that);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.renderPlaceholderButtons = function(){
        var that = this;
        that.components['placeholder'].addButton({
            'name' : 'close',
            'label' : that.lang('close'),
            'style' : 'button-transparent',
            'callback' : that.closeHandler
        });
        that.components['placeholder'].addButton({
            'name' : 'save',
            'label' : that.lang('save'),
            'style' : 'button-primary',
            'callback' : that.completeHandler
        });
    };

    /******* PUBLIC *******/

    classProto.set = function(item){
        var that = this;
        that.params['params']['item'] = item;
        if(that.components['controller']){
            that.components['controller'].set(item);
        }
        return that;
    };

    classProto.get = function(){
        var that = this;
        return that.components['controller'] && that.components['controller'].get && that.components['controller'].get();
    };

    classProto.complete = function(){
        var that = this;
        that.state = 'complete';
        that.triggerEvent('onComplete', that.get());
        that.close();
        return that;
    };
});