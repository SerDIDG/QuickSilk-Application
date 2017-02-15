cm.define('App.FormStyles', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.FormStyles', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstruct = function(){
        var that = this;
        // Bind context to methods
        that.outerIndentTriggerHandler = that.outerIndentTrigger.bind(that);
        that.backgroundPositionTriggerHandler = that.backgroundPositionTrigger.bind(that);
    };

    classProto.onRender = function(){
        var that = this;
        that.outerIndentTrigger();
        that.backgroundPositionTrigger();
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Find Components
        cm.find('Com.BoxTools', 'outer-indent', that.nodes['container'], function(classObject){
            that.components['outer-indent'] = classObject;
        });
        cm.find('Com.PositionTools', 'background-position', that.nodes['container'], function(classObject){
            that.components['background-position'] = classObject;
        });
        // Outer Indent Trigger
        cm.addEvent(that.nodes['outer-indent-auto'], 'change', that.outerIndentTriggerHandler);
        // Background Position Trigger
        cm.addEvent(that.nodes['background-position-custom'], 'change', that.backgroundPositionTriggerHandler);
    };

    classProto.outerIndentTrigger = function(){
        var that = this;
        if(that.nodes['outer-indent-auto'].checked){
            that.components['outer-indent'].disable();
        }else{
            that.components['outer-indent'].enable();
        }
    };

    classProto.backgroundPositionTrigger = function(e){
        var that = this;
        if(that.nodes['background-position-custom'].checked){
            that.components['background-position'].disable();
            that.nodes['background-position-value'].disabled = false;
            e && that.nodes['background-position-value'].focus();
        }else{
            that.components['background-position'].enable();
            that.nodes['background-position-value'].disabled = true;
        }
    };
});