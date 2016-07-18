cm.define('Module.LogoCarousel', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'duration' : 1000,          // ms per slide
        'delay' : 2000,             // ms
        'columns' : 0,
        'mobileColumns' : 1,
        'stopOnHover' : true
    }
},
function(params){
    var that = this;
    that.items = {};
    that.itemsLength = 0;
    that.isProccess = false;
    that.isInfinite = false;
    that.moveInterval = null;
    that.current = null;
    that.columns = 0;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.LogoCarousel', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.validateParamsProcessHandler = that.validateParamsProcess.bind(that);
        that.destructProcessHandler = that.destructProcess.bind(that);
        that.redrawProcessHandler = that.redrawProcess.bind(that);
        that.startHandler = that.start.bind(that);
        that.stopHandler = that.stop.bind(that);
        that.mouseOverEventHandler = that.mouseOverEvent.bind(that);
        that.mouseOutEventHandler = that.mouseOutEvent.bind(that);
        that.moveProcessHandler = that.moveProcess.bind(that);
        // Add events
        that.addEvent('onValidateParamsProcess', that.validateParamsProcessHandler);
        that.addEvent('onDestructProcess', that.destructProcessHandler);
        that.addEvent('onRedraw', that.redrawProcessHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.validateParamsProcess = function(){
        var that = this;
        that.isInfinite = !that.params['delay'];
        that.delay = that.params['duration'] + that.params['delay'];
        return that;
    };

    classProto.destructProcess = function(){
        var that = this;
        that.stop();
        that.moveInterval && clearTimeout(that.moveInterval);
        return that;
    };

    classProto.redrawProcess = function(){
        var that = this,
            desktopCol = ['col', that.params['columns']].join('-'),
            mobileCol = ['col', that.params['mobileColumns']].join('-');
        if(cm._deviceType == 'mobile'){
            that.columns = that.params['mobileColumns'];
            cm.replaceClass(that.nodes['grid'], desktopCol, mobileCol);
        }else{
            that.columns = that.params['columns'];
            cm.replaceClass(that.nodes['grid'], mobileCol, desktopCol);
        }
        that.restart();
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.render.apply(that, arguments);
        // Start
        that.redraw();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Items
        that.items = cm.clone(that.nodes['items']);
        that.itemsLength = that.items.length;
        // Set animation
        that.isInfinite && cm.addClass(that.nodes['container'], 'is-infinite');
        cm.setCSSTransitionDuration(that.nodes['itemsContainer'], that.params['duration']);
        // Set hover event
        cm.addEvent(that.nodes['container'], 'mouseover', that.mouseOverEventHandler);
        cm.addEvent(that.nodes['container'], 'mouseout', that.mouseOutEventHandler);
        return that;
    };

    classProto.restart = function(){
        var that = this;
        that.stop();
        that.restore();
        that.move();
        return that;
    };

    classProto.start = function(){
        var that = this;
        if(!that.isProccess){
            that.isProccess = true;
        }
        return that;
    };

    classProto.stop = function(){
        var that = this;
        if(that.isProccess){
            that.isProccess = false;
        }
        return that;
    };

    classProto.move = function(){
        var that = this;
        that.isProccess = true;
        that.moveProcess();
        that.moveRepeater();
        return that;
    };

    classProto.moveRepeater = function(){
        var that = this;
        that.moveInterval && clearTimeout(that.moveInterval);
        that.moveInterval = setTimeout(function(){
            that.moveProcess();
            that.moveRepeater();
        }, that.delay);
        return that;
    };

    classProto.moveProcess = function(){
        var that = this;
        if(that.isProccess && that.itemsLength > that.columns){
            // Remove previous slide
            that.restore();
            // Get current
            that.current = that.items.shift();
            that.items.push(that.current);
            // Move
            cm.setCSSTranslate(that.nodes['itemsContainer'], (-that.current['container'].offsetWidth + 'px'), '0px');
        }
        return that;
    };

    classProto.restore = function(){
        var that = this;
        if(that.current){
            cm.addClass(that.nodes['container'], 'is-immediately', true);
            cm.setCSSTranslate(that.nodes['itemsContainer'], '0px', '0px');
            cm.insertLast(that.current['container'], that.nodes['itemsContainer']);
            cm.removeClass(that.nodes['container'], 'is-immediately', true);
        }
        return that;
    };

    classProto.mouseOverEvent = function(e){
        var that = this;
        that.params['stopOnHover'] && that.stop();
        return that;
    };

    classProto.mouseOutEvent = function(e){
        var that = this,
            target = cm.getRelatedTarget(e);
        if(!cm.isParent(that.nodes['container'], target, true)){
            that.params['stopOnHover'] && that.start();
        }
        return that;
    };
});