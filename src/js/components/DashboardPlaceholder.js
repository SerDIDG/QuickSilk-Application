cm.define('App.DashboardPlaceholder', {
    'modules' : [
        'Params',
        'Events',
        'Langs'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onShowEnd',
        'onHideEnd'
    ],
    'params' : {
        'highlight' : true,
        'animate' : true,
        'container' : cm.node('div'),
        'insert' : 'appendChild'        // appendChild, insertBefore, insertAfter
    }
},
function(params){
    var that = this;

    that.nodes = {};
    that.node = null;
    that.container = null;
    that.insert = null;
    that.styleObject = null;
    that.offsets = null;
    that.dimensions = null;

    that.isAnimate = false;
    that.isShow = false;
    that.isEmbed = false;
    that.transitionInterval = null;
    that.transitionDurationProperty = null;
    that.height = 0;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.transitionDurationProperty = cm.getSupportedStyle('transition-duration');
        that.isAnimate = that.params['animate'] && that.transitionDurationProperty;
    };

    var render = function(){
        // Render structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__dashboard__placeholder is-active is-highlight'});
        that.node = that.nodes['container'];
        that.embed(that.params['container'], that.params['insert']);
    };

    /* ******* PUBLIC ******* */

    that.embed = function(container, insert){
        if(cm.isNode(container)){
            // Validate
            switch(insert){
                case 'top':
                    insert = 'insertBefore';
                    break;
                case 'bottom':
                    insert = 'insertAfter';
                    break;
                case 'first':
                    insert = 'insertFirst';
                    break;
                case 'last':
                default:
                    insert = 'appendChild';
                    break;
            }
            if(that.container !== container || that.insert !== insert){
                that.isEmbed = true;
                that.container = container;
                that.insert = insert;
                // Embed
                cm[that.insert](that.node, that.container);
                // Calculate dimensions
                that.getDimensions();
            }
        }
        return that;
    };

    that.remove = function(){
        cm.remove(that.node);
        that.isEmbed = false;
        that.container = null;
        that.insert = null;
        that.height = null;
        that.nodes['container'].style.height = '0px';
        return that;
    };

    that.show = function(height, duration, animate){
        animate = cm.isUndefined(animate) ? that.isAnimate : animate;
        if(height !== that.height){
            that.isShow = true;
            if(animate){
                that.nodes['container'].style[that.transitionDurationProperty] = [duration, 'ms'].join('');
            }
            that.height = height;
            that.nodes['container'].style.height = [that.height, 'px'].join('');
            // Event
            that.transitionInterval && clearTimeout(that.transitionInterval);
            that.transitionInterval = setTimeout(function(){
                that.triggerEvent('onShowEnd');
            }, duration + 30);
        }
        return that;
    };

    that.hide = function(duration, animate){
        animate = cm.isUndefined(animate) ? that.isAnimate : animate;
        if(height !== that.height){
            that.isShow = false;
            if(animate){
                that.nodes['container'].style[that.transitionDurationProperty] = [duration, 'ms'].join('');
            }
            that.height = 0;
            that.nodes['container'].style.height = [that.height, 'px'].join('');
            // Event
            that.transitionInterval && clearTimeout(that.transitionInterval);
            that.transitionInterval = setTimeout(function(){
            that.triggerEvent('onHideEnd');
            }, duration + 30);
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