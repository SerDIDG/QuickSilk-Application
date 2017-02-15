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
        'customEvents' : true,
        'href' : '',
        'target' : '_self'
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
        if(cm.isNode(that.params['node'])){
            that.params['href'] = that.params['node'].getAttribute('href') || that.params['href'];
            that.params['target'] = that.params['node'].getAttribute('target') || that.params['target'];
        }
    };

    var render = function(){
        // Set State
        defaultState();
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

    var editState = function(){
        cm.addClass(that.nodes['container'], 'is-editing is-editable');
        if(!cm.isEmpty(that.params['href'])){
            cm.removeClass(that.nodes['container'], 'is-link');
            cm.removeEvent(that.nodes['container'], 'click', linkAction);
        }
    };

    var defaultState = function(){
        cm.removeClass(that.nodes['container'], 'is-editing is-editable');
        if(!cm.isEmpty(that.params['href'])){
            cm.addClass(that.nodes['container'], 'is-link');
            cm.addEvent(that.nodes['container'], 'click', linkAction);
        }
    };

    var linkAction = function(e){
        var target = cm.getEventTarget(e);
        if((target.tagName && target.tagName.toLowerCase() !== 'a') || cm.isEmpty(target.getAttribute('href'))){
            cm.preventDefault(e);
            switch(that.params['target']){
                case '_blank':
                    window.open(that.params['href'],'_blank');
                    break;
                default:
                    window.location.href = that.params['href'];
                    break;
            }
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            editState();
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            defaultState();
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    init();
});