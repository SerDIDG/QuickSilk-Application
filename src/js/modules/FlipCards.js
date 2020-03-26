cm.define('Module.FlipCards', {
    'extend': 'App.AbstractModule',
    'params': {
        'effect' : 'none'           // none, flip, flip-vertical, fade, fade-grow
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.FlipCards', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        that.isFlipped = false;
        that.isMouseOver = false;
        that.perspective = 0;
        that.nodes = {
            'container' : cm.node('div'),
            'inner' : cm.node('div')
        };
        that.toggleHandler = that.toggle.bind(that);
        that.setPerspectiveHandler = that.setPerspective.bind(that);
    };

    classProto.onEnableEditing = function(){
        var that = this;
        cm.removeClass(that.nodes.container, ['effect', that.params.effect].join('--'));
    };

    classProto.onDisableEditing = function(){
        var that = this;
        cm.addClass(that.nodes.container, ['effect', that.params.effect].join('--'));
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // View
        cm.addEvent(that.nodes.container, 'mouseover', function(e){
            var target = cm.getEventTarget(e);
            if(cm.isParent(that.nodes.container, target, true)){
                that.isMouseOver = true;
                that.show();
            }
        });
        cm.addEvent(that.nodes.container, 'mouseout', function(e){
            var target = cm.getRelatedTarget(e);
            if(!cm.isParent(that.nodes.container, target, true)){
                that.isMouseOver = false;
                that.hide();
            }
        });
        cm.addEvent(that.nodes.container, 'click', function(e){
            if(!that.isFlipped || that.isFlipped && !that.isMouseOver){
                that.toggle();
            }
        });
    };

    classProto.setPerspective = function(){
        var that = this,
            rect = cm.getRect(that.nodes.container),
            rectMean = (rect.width + rect.height) / 2,
            pageMean = (cm._pageSize.winWidth + cm._pageSize.winHeight) / 2,
            ratio = pageMean / rectMean,
            perspective = Math.round(rectMean + rectMean * ratio);
        if(perspective !== that.perspective){
            that.perspective = perspective;
            that.nodes.container.style.perspective = perspective + 'px';
        }
        return that;
    };

    classProto.show = function(){
        var that = this;
        if(!that.isFlipped){
            that.isFlipped = true;
            that.setPerspective();
            cm.addClass(that.nodes.container, 'active');
        }
        return that;
    };

    classProto.hide = function(){
        var that = this;
        if(that.isFlipped){
            that.isFlipped = false;
            that.setPerspective();
            cm.removeClass(that.nodes.container, 'active');
        }
        return that;
    };

    classProto.toggle = function(){
        var that = this;
        if(!that.isFlipped){
            that.show();
        }else{
            that.hide();
        }
        return that;
    };
});