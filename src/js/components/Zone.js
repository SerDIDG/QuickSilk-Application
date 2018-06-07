cm.define('App.Zone', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'type' : 'template-manager',            // template-manager | form-manager | mail | remove
        'instanceId' : false,
        'zone' : 0,
        'layerId' : 0,
        'link' : false,                         // {'positionId' : 0, 'layerId' : 0, type' : ''}
        'locked' : false,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isEditing = null;
    that.isRemoved = false;
    that.isActive = false;
    that.styleObject = null;
    that.offsets = null;
    that.dimensions = null;

    that.components = {};
    that.node = null;
    that.block = null;
    that.dummyBlocks = [];
    that.blocks = [];

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        if(that.params['link']){
            that.params['linkName'] = [that.params['link']['type'], that.params['link']['positionId'], that.params['zone']].join('_');
            that.params['blockName'] = [that.params['link']['type'], that.params['link']['positionId']].join('_');
        }else{
            that.params['blockName'] = [that.params['type'], that.params['positionId']].join('_');
        }
        if(cm.isNumber(that.params['instanceId']) || cm.isString(that.params['instanceId'])){
            that.params['name'] = [that.params['type'], that.params['instanceId'], that.params['positionId'], that.params['zone']].join('_');
        }else{
            that.params['name'] = [that.params['type'], that.params['positionId'], that.params['zone']].join('_');
        }
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions();
        // Init zone
        cm.addClass(that.node, 'app__zone');
        cm.addClass(that.node, ['is', that.params['type']].join('-'));
        if(that.params['locked']){
            cm.addClass(that.node, 'is-locked');
        }else{
            cm.addClass(that.node, 'is-available');
        }
        // Construct
        new cm.Finder('App.Block', that.params['blockName'], null, constructBlock);
        new cm.Finder('App.Editor', that.params['editorName'], null, constructEditor, {'event' : 'onProcessStart'});
    };

    var constructBlock = function(classObject){
        if(classObject){
            that.block = classObject
                .addZone(that);
        }
    };

    var destructBlock = function(classObject){
        if(classObject){
            that.block = classObject
                .removeZone(that);
            that.block = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addZone(that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .removeZone(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.node, 'is-editing', true);
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editable', true);
            }
            that.getDimensions();
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing', true);
            if(!that.params['locked']){
                cm.removeClass(that.node, 'is-editable', true);
            }
            that.getDimensions();
        }
        return that;
    };

    that.addBlock = function(block, index){
        if(block.isDummy){
            if(!cm.isUndefined(index) && cm.isNumber(index)){
                that.dummyBlocks[index] = block;
            }else{
                that.dummyBlocks.push(block);
            }
        }else{
            if(!cm.isUndefined(index) && cm.isNumber(index)){
                that.blocks.splice(index, 0, block);
            }else{
                that.blocks.push(block);
            }
        }
        return that;
    };

    that.removeBlock = function(block){
        if(block.isDummy){
            cm.arrayRemove(that.dummyBlocks, block);
        }else{
            cm.arrayRemove(that.blocks, block);
        }
        return that;
    };

    that.getBlockIndex = function(block){
        if(block.isDummy){
            return that.dummyBlocks.indexOf(block);
        }else{
            return that.blocks.indexOf(block);
        }
    };

    that.getBlock = function(index){
        return that.blocks[index];
    };

    that.highlight = function(){
        if(!that.params['locked']){
            cm.addClass(that.node, 'is-highlight');
        }
        return that;
    };

    that.unhighlight = function(){
        if(!that.params['locked']){
            cm.removeClass(that.node, 'is-highlight');
        }
        return that;
    };

    that.active = function(){
        if(!that.params['locked']){
            that.isActive = true;
            cm.addClass(that.node, 'is-active');
        }
        return that;
    };

    that.unactive = function(){
        if(!that.params['locked']){
            that.isActive = false;
            cm.removeClass(that.node, 'is-active');
        }
        return that;
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructBlock(that.block);
            destructEditor(that.components['editor']);
            while(that.blocks.length){
                that.blocks[0].remove();
            }
            that.removeFromStack();
            cm.remove(that.params['node']);
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