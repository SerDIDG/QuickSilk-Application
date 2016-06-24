cm.define('App.MenuConstructorPreview', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'node' : cm.node('div'),
        'embedStructure' : 'none',
        'collectorPriority' : 100
    }
},
function(params){
    var that = this;
    that.lessDefault = null;
    that.lessDefaultVariables = {};
    that.lessVariables = {};
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.MenuConstructorPreview', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.set = function(o){
        var that = this;
        that.lessVariables = o || {};
        cm.log(o);
        that.components['less'] && that.parseLess();
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Default Less Styles
        that.lessDefault = that.nodes['less'].innerHTML;
        // Less Parser
        if(typeof window.less != 'undefined'){
            that.components['less'] = window.less;
            that.parseDefaultLessVariables();
        }
        return that; 
    };

    classProto.parseLess = function(){
        var that = this;
        that.components['less'].render(that.lessDefault, {'modifyVars' : that.lessVariables}, function(e, data){
            if(data && !cm.isEmpty(data['css'])){
                that.nodes['css'].innerHTML = data['css'];
            }
        });
        return that;
    };

    classProto.parseDefaultLessVariables = function(){
        var that = this,
            o = {},
            variables,
            name,
            value;
        that.components['less'].parse(that.lessDefault, {}, function (e, tree) {
            if(tree){
                variables = tree.variables();
                cm.forEach(variables, function(item){
                    name = item['name'].substring(1);
                    value = item['value'].toCSS();
                    o[name] = value;
                });
            }
        });
        that.lessDefaultVariables = o;
        return that;
    };
});