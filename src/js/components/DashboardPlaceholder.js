cm.define('App.DashboardPlaceholder', {
    'modules' : [
        'Params',
        'Events',
        'Langs'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'highlight' : true,
        'animate' : true,
        'index' : 0,
        'container' : cm.node('div'),
        'insert' : 'appendChild'        // appendChild, insertBefore, insertAfter
    }
},
function(params){
    var that = this;

    that.nodes = {};
    that.node = null;
    that.styleObject = null;
    that.offsets = null;
    that.dimensions = null;

    that.isAnimate = false;
    that.isActive = false;
    that.isShow = false;
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
        that.nodes['container'] = cm.node('div', {'class' : 'app__dashboard__placeholder'});
        cm[that.params['insert']](that.nodes['container'], that.params['container']);
        that.node = that.nodes['container'];
        // Calculate dimensions
        that.getDimensions();
    };

    /* ******* PUBLIC ******* */

    that.active = function(){
        that.isActive = true;
        cm.addClass(that.nodes['container'], 'is-active');
        if(that.params['highlight']){
            cm.addClass(that.nodes['container'], 'is-highlight');
        }
        return that;
    };

    that.unactive = function(){
        that.isActive = false;
        cm.removeClass(that.nodes['container'], 'is-active is-highlight');
        return that;
    };

    that.show = function(height, duration, animate){
        animate = typeof animate == 'undefined' ? that.isAnimate : animate;
        that.isShow = true;
        if(animate){
            that.nodes['container'].style[that.transitionDurationProperty] = [duration, 'ms'].join('');
        }
        that.height = height;
        that.nodes['container'].style.height = [height, 'px'].join('');
        return that;
    };

    that.hide = function(duration, animate){
        animate = typeof animate == 'undefined' ? that.isAnimate : animate;
        that.isShow = false;
        if(animate){
            that.nodes['container'].style[that.transitionDurationProperty] = [duration, 'ms'].join('');
        }
        that.nodes['container'].style.height = '0px';
        return that;
    };

    that.restore = function(duration){
        that.show(that.height, duration);
        return that;
    };

    that.remove = function(){
        cm.remove(that.node);
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