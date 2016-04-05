cm.define('Module.WorkingArea', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : '',
        'isEditing' : false,
        'customEvents' : true
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div')
    };
    that.components = {};

    that.isEditing = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){

    };

    var render = function(){
        // Add custom event
        if(that.params['customEvents']){
            cm.customEvent.add(that.params['node'], 'enableEditable', function(){
                that.enableEditing();
            });
            cm.customEvent.add(that.params['node'], 'disableEditable', function(){
                that.disableEditing();
            });
        }
        // Editing
        that.params['isEditing'] && that.enableEditing();
    };

    var preventLinkEvent = function(e){
        cm.preventDefault(e);
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing is-editable');
            cm.addEvent(that.nodes['container'], 'click', preventLinkEvent);
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable');
            cm.removeEvent(that.nodes['container'], 'click', preventLinkEvent);
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    init();
});