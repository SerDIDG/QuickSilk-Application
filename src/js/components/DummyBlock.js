cm.define('App.DummyBlock', {
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
        'name' : '',
        'type' : 'content',                     // content | form | mail
        'sidebarName' : 'app-sidebar',
        'editorName' : 'app-editor',
        'thisContainer' : 'document.body',
        'topContainer' : 'top.document.body'
    }
},
function(params){
    var that = this;

    that.isDummy = true;
    that.isEditing = false;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'dummy' : cm.node('div')
    };
    that.node = null;
    that.zone = null;

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
        that.params['name'] = [that.params['type'], that.params['keyword']].join('_');
        that.node = that.params['node'];
    };

    var render = function(){
        that.styleObject = cm.getStyleObject(that.node);
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject);
        // Construct
        new cm.top('Finder')('App.Editor', that.params['editorName'], that.params['topContainer'], constructEditor);
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addDummyBlock(that.params['name'], that);
        }
    };

    var renderLoaderBox = function(){
        var node;
        node = cm.Node('div', {'class' : 'pt__box-loader position'},
            cm.Node('div', {'class' : 'inner'})
        );
        return node;
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        that.isEditing = true;
        return that;
    };

    that.disableEditing = function(){
        that.isEditing = false;
        return that;
    };

    that.getDragNodes = function(){
        return [that.node];
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    that.clone = function(){
        that.node = cm.clone(that.params['node'], true);
        return that;
    };

    init();
});