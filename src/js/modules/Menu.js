cm.define('Module.Menu', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'node' : cm.node('div'),
        'embedStructure' : 'none',
        'renderStructure' : false,
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
    that.alignValues = ['left', 'center', 'right', 'justify'];
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.Menu', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.processSelectHandler = that.processSelect.bind(that);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
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

    classProto.setView = function(view){
        var that = this;
        switch(view){
            case 'horizontal':
                cm.removeClass(that.nodes['container'], 'is-vertical mod__menu--adaptive');
                cm.addClass(that.nodes['container'], 'is-horizontal');
            break;
            case 'vertical':
                cm.removeClass(that.nodes['container'], 'is-horizontal mod__menu--adaptive');
                cm.addClass(that.nodes['container'], 'is-vertical');
                break;
            case 'mobile':
                cm.addClass(that.nodes['container'], 'mod__menu--adaptive');
                break;
        }
        return that;
    };

    classProto.setAlign = function(align){
        var that = this;
        if(cm.inArray(that.alignValues, align)){
            // Reset
            cm.forEach(that.alignValues, function(item){
                cm.removeClass(that.nodes['container'], ['pull', item].join('-'));
            });
            // Set
            cm.addClass(that.nodes['container'], ['pull', align].join('-'));
        }
        return that;
    };
});