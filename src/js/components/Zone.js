cm.define('App.Zone', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'zone' : 0,
        'parentId' : 0,
        'type' : 'content',          // content | form | mail | remove
        'locked' : false,
        'editorName' : 'app-editor',
        'thisContainer' : 'document.body',
        'topContainer' : 'top.document.body'
    }
},
function(params){
    var that = this;

    that.isEditing = false;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.node = null;
    that.block = null;
    that.blocks = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataConfig(that.params['node']);
        validateParams();
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['name'] = [that.params['parentId'], that.params['zone']].join('_');
        that.params['blockName'] = that.params['parentId'];
        that.node = that.params['node'];
    };

    var render = function(){
        that.styleObject = cm.getStyleObject(that.node);
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject);
        // Init zone
        cm.addClass(that.node, 'app__zone');
        cm.addClass(that.node, ['is', that.params['type']].join('-'));
        if(that.params['locked']){
            cm.addClass(that.node, 'is-locked');
        }else{
            cm.addClass(that.node, 'is-available');
        }
        // Construct
        new cm.top('Finder')('App.Block', that.params['blockName'], that.params['thisContainer'], constructBlock);
        new cm.top('Finder')('App.Editor', that.params['editorName'], that.params['topContainer'], constructEditor);
    };

    var constructBlock = function(classObject){
        if(classObject){
            that.block = classObject
                .addZone(that.params['name'], that);
        }
    };

    var destructBlock = function(classObject){
        if(classObject){
            that.block = classObject
                .removeZone(that.params['name']);
            that.block = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addZone(that.params['name'], that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .removeZone(that.params['name']);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!that.isEditing){
            that.isEditing = true;
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editing');
            }
        }
        return that;
    };

    that.disableEditing = function(){
        if(that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing');
        }
        return that;
    };

    that.addBlock = function(name, item){
        that.blocks[name] = item;
        return that;
    };

    that.removeBlock = function(name){
        delete that.blocks[name];
        return that;
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
            cm.addClass(that.node, 'is-active');
        }
        return that;
    };

    that.unactive = function(){
        if(!that.params['locked']){
            cm.removeClass(that.node, 'is-active');
        }
        return that;
    };

    that.remove = function(){
        destructBlock(that.block);
        destructEditor(that.components['editor']);
        return that;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});