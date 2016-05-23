cm.define('Dev.TBSC', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'Structure',
        'DataConfig',
        'DataNodes',
        'Storage',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : '',
        'customEvents' : true,
        'ipadSpeed' : 0.12,
        'characterSpeed' : 0.4,
        'character2Speed' : 0.288,
        'raysSpeed' : 0.342
    }
},
function(params){
    var that = this;
    that.nodes = {};
    that.components = {};
    that.isEditing = null;
    that.isDestructed = false;
    that.construct(params);
});

cm.getConstructor('Dev.TBSC', function(classConstructor, className, classProto){
    classProto.construct = function(params){
        var that = this;
        that.resizeHandler = that.resize.bind(that);
        that.scrollHandler = that.scroll.bind(that);
        that.setHandler = that.set.bind(that);
        that.redrawHandler = that.redraw.bind(that);
        that.enableEditingHandler = that.enableEditing.bind(that);
        that.disableEditingHandler = that.disableEditing.bind(that);
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        that.render();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
        return that;
    };

    classProto.destruct = function(){
        var that = this;
        if(!that.isDestructed){
            that.isDestructed = true;
            cm.removeEvent(window, 'scroll', that.scrollHandler);
            cm.removeEvent(window, 'resize', that.resizeHandler);
            that.removeFromStack();
        }
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Refresh Layout
        that.redraw();
        // Set Events
        cm.addEvent(window, 'scroll', that.scrollHandler);
        cm.addEvent(window, 'resize', that.resizeHandler);
        // Add custom event
        if(that.params['customEvents']){
            cm.customEvent.add(that.params['node'], 'destruct', function(){
                that.destruct();
            });
            cm.customEvent.add(that.params['node'], 'redraw', function(){
                that.redraw();
            });
            cm.customEvent.add(that.params['node'], 'enableEditable', function(){
                that.enableEditing();
            });
            cm.customEvent.add(that.params['node'], 'disableEditable', function(){
                that.disableEditing();
            });
        }
        return that;
    };

    classProto.resize = function(){
        var that = this;
        that.redraw();
        return that;
    };

    classProto.scroll = function(){
        var that = this;
        if(!that.isEditing){
            that.set();
        }
        return that;
    };

    classProto.redraw = function(){
        var that = this;
        if(!that.isEditing){
            cm.addClass(that.nodes['line']['container'], 'is-start');
            cm.removeClass(that.nodes['height'], 'is-hidden');
            // Position
            that.winWidth = cm.getPageSize('winWidth');
            that.posX = cm.getX(that.nodes['container']);
            that.posY = cm.getY(that.nodes['container']);
            // iPad
            that.ipadStartY = 70;
            that.ipadEndY = 0;
            // Character
            that.characterStartY = -210;
            that.characterEndY = 0;
            // Character 2
            that.character2StartY = -150;
            that.character2EndY = 0;
            // Rays
            that.raysStartY = -180;
            that.raysEndY = 0;
            // Set
            that.set();
        }else {
            cm.setCSSTranslate(that.nodes['line']['ipad'], '0px', '0px');
            cm.setCSSTranslate(that.nodes['line']['character'], '0px', '0px');
            cm.setCSSTranslate(that.nodes['line']['character2'], '0px', '0px');
            cm.setCSSTranslate(that.nodes['line']['rays'], '0px', '0px');
        }
        return that;
    };

    classProto.set = function(){
        var that = this,
            scrollTop = cm.getBodyScrollTop(),
            scrollOffset = scrollTop,
            ipadTrans = that.ipadStartY - (scrollOffset * that.params['ipadSpeed']),
            characterTrans = that.characterStartY + (scrollOffset * that.params['characterSpeed']),
            character2Trans = that.character2StartY + (scrollOffset * that.params['character2Speed']),
            raysTransTrans = that.raysStartY + (scrollOffset * that.params['raysSpeed']);
        // Ipad
        if(ipadTrans >= that.ipadStartY){
            cm.setCSSTranslate(that.nodes['line']['ipad'], '0px', (that.ipadStartY + 'px'));
        }else if(ipadTrans >= that.ipadEndY){
            cm.setCSSTranslate(that.nodes['line']['ipad'], '0px', (ipadTrans + 'px'));
        }else{
            cm.setCSSTranslate(that.nodes['line']['ipad'], '0px', (that.ipadEndY + 'px'));
        }
        // Character
        if(characterTrans <= that.characterStartY){
            cm.setCSSTranslate(that.nodes['line']['character'], (that.characterStartY + 'px'), '0px');
        }else if(characterTrans <= that.characterEndY){
            cm.setCSSTranslate(that.nodes['line']['character'], (characterTrans + 'px'), '0px');
        }else{
            cm.setCSSTranslate(that.nodes['line']['character'], (that.characterEndY + 'px'), '0px');
        }
        // Character 2
        if(character2Trans <= that.character2StartY){
            cm.setCSSTranslate(that.nodes['line']['character2'], (that.character2StartY + 'px'), '0px');
        }else if(character2Trans <= that.character2EndY){
            cm.setCSSTranslate(that.nodes['line']['character2'], (character2Trans + 'px'), '0px');
        }else{
            cm.setCSSTranslate(that.nodes['line']['character2'], (that.character2EndY + 'px'), '0px');
        }
        // Rays
        if(raysTransTrans <= that.raysStartY){
            cm.setCSSTranslate(that.nodes['line']['rays'], (that.raysStartY + 'px'), '0px');
        }else if(raysTransTrans <= that.raysEndY){
            cm.setCSSTranslate(that.nodes['line']['rays'], (raysTransTrans + 'px'), '0px');
        }else{
            cm.setCSSTranslate(that.nodes['line']['rays'], (that.raysEndY + 'px'), '0px');
        }
    };

    classProto.enableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            that.redraw();
        }
        return that;
    };

    classProto.disableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            that.redraw();
        }
        return that;
    };
});