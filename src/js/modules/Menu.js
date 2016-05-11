/* ******* MODULES: MENU ******* */

cm.define('Module.Menu', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : '',
        'type' : 'horizontal'           // horizontal | vertical
    }
},
function(params){
    var that = this;
    that.nodes = {
        'select' : {
            'select' : cm.node('select')
        }
    };
    that.construct(params);
});

cm.getConstructor('Module.Menu', function(classConstructor, className, classProto){
    classProto.construct = function(params){
        var that = this;
        that.processSelectHandler = that.processSelect.bind(that);
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        that.render();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Events
        cm.addEvent(that.nodes['select']['select'], 'change', that.processSelectHandler);
        return that;
    };

    classProto.processSelect = function(){
        var that = this;
        var value = that.nodes['select']['select'].value;
        if(!cm.isEmpty(value)){
            window.location.href = value;
        }
        return that;
    };
});