cm.define('App.Block', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'type' : 'content',                     // content | form | mail
        'positionId' : 0,
        'zone' : 0,
        'parentId' : 0,
        'locked' : false,
        'visible' : true,
        'editorName' : 'app-editor',
        'thisContainer' : 'document.body',
        'topContainer' : 'top.document.body'
    }
},
function(params){
    var that = this;

    that.isDummy = false;
    that.isEditing = false;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'container' : cm.node('div'),
        'content' : cm.node('div')
    };
    that.node = null;
    that.zone = null;
    that.zones = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['name'] = that.params['positionId'];
        that.params['zoneName'] = [that.params['parentId'], that.params['zone']].join('_');
        that.node = that.params['node'];
    };

    var render = function(){
        that.styleObject = cm.getStyleObject(that.params['node']);
        that.dimensions = cm.getNodeOffset(that.params['node'], that.styleObject);
        // Construct
        new cm.top('Finder')('App.Zone', that.params['zoneName'], that.params['thisContainer'], constructZone);
        new cm.top('Finder')('App.Editor', that.params['editorName'], that.params['topContainer'], constructEditor);
    };

    var constructZone = function(classObject){
        if(classObject){
            that.zone = classObject
                .addBlock(that.params['name'], that);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject
                .removeBlock(that.params['name']);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addBlock(that.params['name'], that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .removeBlock(that.params['name']);
        }
    };

    var renderControls = function(){

    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!that.isEditing){
            that.isEditing = true;
            if(!that.params['locked']){
                cm.addClass(that.params['node'], 'is-editable');
            }
            if(!that.params['visible']){
                cm.addClass(that.params['node'], 'is-visible');
            }
            cm.customEvent.trigger(that.params['node'], 'enableEditing', {
                'type' : 'child',
                'self' : false
            });
        }
        return that;
    };

    that.disableEditing = function(){
        if(that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editable is-visible');
            cm.customEvent.trigger(that.params['node'], 'disableEditing', {
                'type' : 'child',
                'self' : false
            });
        }
        return that;
    };

    that.addZone = function(name, item){
        that.zones[name] = item;
        return that;
    };

    that.removeZone = function(name){
        delete that.zones[name];
        return that;
    };

    that.setZone = function(zone){
        destructZone(that.zone);
        constructZone(zone);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.remove = function(){
        destructEditor(that.components['editor']);
        return that;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.params['node'], that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});