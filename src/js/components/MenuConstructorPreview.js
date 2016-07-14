cm.define('App.MenuConstructorPreview', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'node' : cm.node('div'),
        'embedStructure' : 'none',
        'renderStructure' : false,
        'collectorPriority' : 100
    }
},
function(params){
    var that = this;
    that.lessDefault = null;
    that.lessVariables = {};
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.MenuConstructorPreview', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.set = function(o){
        var that = this;
        that.lessVariables = o || {};
        that.parseLess();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Default Less Styles
        that.lessDefault = that.nodes['less'].innerHTML;
        // Less Parser
        cm.loadScript({
            'path' : 'less',
            'src' : '%assetsUrl%/libs/less/less.min.js?%version%',
            'callback' : function(path){
                if(path){
                    that.components['less'] = path;
                    that.parseLess();
                }
            }
        });
        // Menu Module
        cm.find('Module.Menu', null, that.nodes['contentInner'], function(classObject){
            that.components['menu'] = classObject;
        });
        // Toolbar - Background Switcher
        cm.find('Com.ColorPicker', 'background', that.nodes['title'], function(classObject){
            that.components['background'] = classObject;
            that.components['background'].addEvent('onChange', function(my, data){
                that.nodes['contentInner'].style.backgroundColor = data;
            });
        });
        // Toolbar - View Switcher
        cm.find('Com.Select', 'view', that.nodes['title'], function(classObject){
            that.components['view'] = classObject;
            that.components['view'].addEvent('onChange', function(my, data){
                that.components['menu'] && that.components['menu'].setView(data);
            });
        });
        // Toolbar - Align Switcher
        cm.find('Com.Select', 'align', that.nodes['title'], function(classObject){
            that.components['align'] = classObject;
            that.components['align'].addEvent('onChange', function(my, data){
                that.components['menu'] && that.components['menu'].setAlign(data);
            });
        });
        return that;
    };

    classProto.parseLess = function(){
        var that = this;
        that.components['less'] && that.components['less'].render(that.lessDefault, {'modifyVars' : that.lessVariables}, function(e, data){
            if(data && !cm.isEmpty(data['css'])){
                that.nodes['css'].innerHTML = data['css'];
            }
        });
        return that;
    };
});