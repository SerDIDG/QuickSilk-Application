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
        that.perspective = 0;
        that.nodes = {
            'container' : cm.node('div'),
            'inner' : cm.node('div')
        };
        that.toggleHandler = that.toggle.bind(that);
        that.setPerspectiveHandler = that.setPerspective.bind(that);
        that.onPointerOverHandler = that.onPointerOver.bind(that);
        that.onPointerOutHandler = that.onPointerOut.bind(that);
        that.onBodyClickHandler = that.onBodyClick.bind(that);
    };

    classProto.onDestruct = function(){
        var that = this;
        cm.removeEvent(document.body, 'pointerover', that.onBodyClickHandler);
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
        cm.addEvent(that.nodes.container, 'pointerover', that.onPointerOverHandler);
        cm.addEvent(that.nodes.container, 'pointerout', that.onPointerOutHandler);
        cm.addEvent(that.nodes.container, 'mouseover', that.onPointerOverHandler);
        cm.addEvent(that.nodes.container, 'mouseout', that.onPointerOutHandler);
        cm.addEvent(document.body, 'pointerdown', that.onBodyClickHandler);
    };

    classProto.onPointerOver = function(e){
        var that = this;
        cm.preventDefault(e);
        if(e.type === 'pointerover'){
            cm.removeEvent(that.nodes.container, 'mouseover', that.onPointerOverHandler);
        }
        var target = cm.getEventTarget(e);
        if(cm.isParent(that.nodes.container, target, true)){
            if(e.pointerType === 'mouse'){
                that.show();
            }else{
                that.toggle();
            }
        }
    };

    classProto.onPointerOut = function(e){
        var that = this;
        cm.preventDefault(e);
        if(e.type === 'pointerout'){
            cm.removeEvent(that.nodes.container, 'mouseout', that.onPointerOutHandler);
        }
        if(e.pointerType === 'mouse'){
            var target = cm.getRelatedTarget(e);
            if(!cm.isParent(that.nodes.container, target, true)){
                that.hide();
            }
        }
    };

    classProto.onBodyClick = function(e){
        var that = this;
        if(e.pointerType !== 'mouse'){
            var target = cm.getEventTarget(e);
            if(!cm.isParent(that.nodes.container, target, true)){
                that.hide();
            }
        }
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
        if(!that.isEditing && !that.isFlipped){
            that.isFlipped = true;
            that.setPerspective();
            cm.addClass(that.nodes.container, 'active');
        }
        return that;
    };

    classProto.hide = function(){
        var that = this;
        if(!that.isEditing && that.isFlipped){
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