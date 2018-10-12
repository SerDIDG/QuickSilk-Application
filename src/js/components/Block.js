App._Blocks = {};

cm.define('App.Block', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove',
        'enableEditing',
        'disableEditing'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'type' : 'template-manager',            // template-manager | form-manager | mail
        'instanceId' : false,
        'positionId' : 0,
        'zone' : 0,
        'parentPositionId' : 0,
        'layerId' : 0,
        'index' : false,
        'locked' : false,
        'visible' : true,
        'removable' : true,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = false;
    that.isRemoved = false;
    that.isEditing = null;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'container' : cm.node('div'),
        'block' : {
            'container' : cm.node('div'),
            'inner' : cm.node('div'),
            'drag' : [],
            'menu' : {
                'edit' : cm.node('div'),
                'duplicate' : cm.node('div'),
                'delete' : cm.node('div')
            }
        }
    };
    that.index = null;
    that.node = null;
    that.zone = null;
    that.zones = [];

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        var index;
        if(cm.isNumber(that.params['instanceId']) || cm.isString(that.params['instanceId'])){
            that.params['name'] = [that.params['type'], that.params['instanceId'], that.params['positionId']].join('_');
            that.params['zoneName'] = [that.params['type'], that.params['instanceId'], that.params['parentPositionId'], that.params['zone']].join('_');
        }else{
            that.params['name'] = [that.params['type'], that.params['positionId']].join('_');
            that.params['zoneName'] = [that.params['type'], that.params['parentPositionId'], that.params['zone']].join('_');
        }
        if(index = that.params['node'].getAttribute('data-index')){
            that.params['index'] = parseInt(index);
            that.params['node'].removeAttribute('data-index');
        }
        that.index = that.params['index'];
        // Export
        App._Blocks[that.params['name']] = that;
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions();
        // Construct
        //new cm.Finder('App.Zone', that.params['zoneName'], null, constructZone);
        new cm.Finder('App.Editor', that.params['editorName'], null, constructEditor, {'event' : 'onProcessStart'});
        //cm.find('App.Editor', that.params['editorName'], null, constructEditor);
    };

    var constructZone = function(classObject){
        if(classObject){
            that.zone = classObject;
            that.zone.addBlock(that, that.index);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject;
            that.zone.removeBlock(that);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        var zone = App._Zones[that.params['zoneName']];
        constructZone(zone);
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].addBlock(that, that.index);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].removeBlock(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.node, 'is-editing');
            cm.replaceClass(that.node, 'is-hidden', 'is-visible');
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editable');
                cm.customEvent.trigger(that.node, 'enableEditable', {
                    'type' : 'child',
                    'self' : false
                });
            }
            cm.removeClass(that.nodes['block']['container'], 'cm__animate');
            that.getDimensions();
            cm.customEvent.trigger(that.node, 'enableEditing', {
                'type' : 'child',
                'self' : false
            });
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing');
            if(!that.params['visible']){
                cm.replaceClass(that.node, 'is-visible', 'is-hidden');
            }
            if(!that.params['locked']){
                cm.removeClass(that.node, 'is-editable');
                cm.customEvent.trigger(that.node, 'disableEditable', {
                    'type' : 'child',
                    'self' : false
                });
            }
            cm.addClass(that.nodes['block']['container'], 'cm__animate');
            that.getDimensions();
            cm.customEvent.trigger(that.node, 'disableEditing', {
                'type' : 'child',
                'self' : false
            });
            that.triggerEvent('disableEditing');
        }
        return that;
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructZone(that.zone);
            destructEditor(that.components['editor']);
            while(that.zones.length){
                that.zones[0].remove();
            }
            cm.customEvent.trigger(that.node, 'destruct', {
                'type' : 'child',
                'self' : false
            });
            that.removeFromStack();
            cm.remove(that.node);
            that.triggerEvent('onRemove');
        }
        return that;
    };

    that.addZone = function(item){
        that.zones.push(item);
        return that;
    };

    that.removeZone = function(zone){
        cm.arrayRemove(that.zones, zone);
        return that;
    };

    that.setZone = function(zone, index){
        that.index = index;
        destructZone(that.zone);
        constructZone(zone);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.getIndex = function(){
        if(that.zone){
            that.index = that.zone.getBlockIndex(that);
            return that.index;
        }
        return null;
    };

    that.getLower = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index + 1) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getDragNodes = function(){
        var nodes = [];
        cm.forEach(that.nodes['block']['drag'], function(item){
            nodes.push(item['container']);
        });
        return nodes;
    };

    that.getMenuNodes = function(){
        return that.nodes['block']['menu'];
    };

    that.getInnerNode = function(){
        return that.nodes['block']['inner'];
    };

    that.getDimensions = function(){
        if(!that.styleObject){
            that.styleObject = cm.getStyleObject(that.node);
        }
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, null);
        return that.dimensions;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});