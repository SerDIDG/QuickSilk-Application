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
        'type' : 'content',                     // content | form | mail
        'positionId' : 0,
        'zone' : 0,
        'parentId' : 0,
        'index' : false,
        'locked' : false,
        'visible' : true,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = false;
    that.isRemoved = false;
    that.isEditing = false;
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
        that.params['name'] = that.params['positionId'];
        that.params['zoneName'] = [that.params['parentId'], that.params['zone']].join('_');
        if(index = that.params['node'].getAttribute('data-index')){
            that.params['index'] = parseInt(index);
            that.params['node'].removeAttribute('data-index');
        }
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions(); 
        // Construct
        new cm.Finder('App.Zone', that.params['zoneName'], null, function(classObject){
            constructZone(classObject, that.params['index']);
        });
        new cm.Finder('App.Editor', that.params['editorName'], null, function(classObject){
            constructEditor(classObject);
        });
    };

    var constructZone = function(classObject, index){
        if(classObject){
            that.zone = classObject
                .addBlock(that, index);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject
                .removeBlock(that);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addBlock(that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .removeBlock(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing');
            if(!that.params['visible']){
                cm.addClass(that.params['node'], 'is-visible');
            }
            if(!that.params['locked']){
                cm.addClass(that.params['node'], 'is-editable');
                cm.customEvent.trigger(that.params['node'], 'enableEditable', {
                    'type' : 'child',
                    'self' : false
                });
            }
            cm.customEvent.trigger(that.params['node'], 'enableEditing', {
                'type' : 'child',
                'self' : false
            });
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing');
            if(!that.params['visible']){
                cm.removeClass(that.params['node'], 'is-visible');
            }
            if(!that.params['locked']){
                cm.removeClass(that.params['node'], 'is-editable');
                cm.customEvent.trigger(that.params['node'], 'disableEditable', {
                    'type' : 'child',
                    'self' : false
                });
            }
            cm.customEvent.trigger(that.params['node'], 'disableEditing', {
                'type' : 'child',
                'self' : false
            });
            that.triggerEvent('disableEditing');
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
        destructZone(that.zone);
        constructZone(zone, index);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.getIndex = function(){
        if(that.zone){
            return that.zone.getBlockIndex(that);
        }
        return null;
    };

    that.getLower = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index + 1) || null;
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

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructZone(that.zone);
            destructEditor(that.components['editor']);
            while(that.zones.length){
                that.zones[0].remove();
            }
            that.removeFromStack();
            cm.remove(that.node);
            that.triggerEvent('onRemove');
        }
        return that;
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