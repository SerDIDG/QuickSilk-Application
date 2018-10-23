App._DummyBlocks = [];

cm.define('App.DummyBlock', {
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
        'onRemove'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'keyword' : '',
        'type' : 'template-manager',            // template-manager | form-manager | mail-manager
        'removable' : true,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = true;
    that.isEditing = false;
    that.isRemoved = false;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'container' : cm.node('div'),
        'dummy' : cm.node('div')
    };
    that.index = null;
    that.node = null;
    that.zone = null;

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
        that.params['name'] = [that.params['type'], that.params['keyword']].join('_');
        // Export
        App._DummyBlocks.push(that);
    };

    var render = function(){
        that.node = that.params['node'];
        // Render spinner
        renderSpinner();
        // Calculate dimensions
        that.getDimensions();
        // Construct
        cm.find('App.Editor', that.params['editorName'], null, constructEditor);
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
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].addBlock(that, that.index);
        }
    };

    var renderSpinner = function(){
        that.nodes['spinner'] = cm.node('div', {'class' : 'app__block-spinner'},
            cm.node('div', {'class' : 'pt__box-loader is-absolute'},
                cm.node('div', {'class' : 'inner'})
            )
        );
        that.nodes['container'].appendChild(that.nodes['spinner']);
    };

    /* ******* PUBLIC ******* */

    that.register = function(classObject){
        constructEditor(classObject);
        return that;
    };

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing is-editable is-visible');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable is-visible');
        }
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
        return that.zone.getBlock(index) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getDragNodes = function(){
        return [that.node];
    };

    that.showSpinner = function(){
        cm.addClass(that.nodes['spinner'], 'is-visible', true);
        return that;
    };

    that.hideSpinner = function(){
        cm.removeClass(that.nodes['spinner'], 'is-visible');
        return that;
    };

    that.clone = function(){
        var params = {
            'node' : cm.clone(that.node, true)
        };
        return that.cloneComponent(params);
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            cm.arrayRemove(App._DummyBlocks, that);
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