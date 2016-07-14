cm.define('Module.LogoCarousel', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'duration' : 500,     // ms per slide
        'delay' : 1000,
        'columns' : 0
    }
},
function(params){
    var that = this;
    that.isInfinite = false;
    that.interval = null;
    that.iteration = -1;
    that.length = 0;
    that.width = 0;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.LogoCarousel', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.validateParamsProcessHandler = that.validateParamsProcess.bind(that);
        // Add events
        that.addEvent('onValidateParamsProcess', that.validateParamsProcessHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.validateParamsProcess = function(){
        var that = this;
        that.isInfinite = !that.params['delay'];
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.render.apply(that, arguments);
        // Start
        that.start();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        //
        that.length = that.nodes['items'].length;
        // Set animation
        that.isInfinite && cm.addClass(that.nodes['container'], 'is-infinite');
        // Init Animation
        //that.components['animation'] = new cm.Animation(that.nodes['itemsContainer']);
        return that;
    };

    classProto.start = function(){
        var that = this;
        //that.move();
        return that;
    };

    classProto.move = function(){
        var that = this;
        that.interval && clearTimeout(that.interval);
        that.interval = setTimeout(function(){
            if(that.item){
                cm.remove(that.item['container']);
            }
            //that.nodes['itemsContainer'].style.paddingLeft = that.width + 'px';
            that.iteration++;
            that.item = that.nodes['items'][that.iteration];
            var clone = cm.clone(that.item, true);
            that.nodes['items'].push(clone);
            that.width += that.item['container'].offsetWidth;
            cm.appendChild(clone['container'], that.nodes['itemsContainer']);
            cm.setCSSTranslate(that.nodes['itemsContainer'], (-that.width + 'px'), '0px');
            that.move();
        }, that.params['delay']);
        return that;
    };
});