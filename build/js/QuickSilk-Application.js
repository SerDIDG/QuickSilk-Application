var App = {
    'Elements': {},
    'Nodes' : {},
    'Test' : []
};

var Module = {};
cm.define('App.Block', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove',
        'enableEditing',
        'disableEditing'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'type' : 'template-manager',            // template-manager | form-manager | mail
        'positionId' : 0,
        'zone' : 0,
        'parentId' : 0,
        'layerId' : 0,
        'index' : false,
        'locked' : false,
        'visible' : true,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = false;
    that.isRemoved = false;
    that.isEditing = null;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'container' : cm.node('div'),
        'block' : {
            'container' : cm.node('div'),
            'inner' : cm.node('div'),
            'drag' : [],
            'menu' : {
                'edit' : cm.node('div'),
                'duplicate' : cm.node('div'),
                'delete' : cm.node('div')
            }
        }
    };
    that.node = null;
    that.zone = null;
    that.zones = [];

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        var index;
        that.params['name'] = [that.params['type'], that.params['layerId'], that.params['positionId']].join('_');
        that.params['zoneName'] = [that.params['type'], that.params['layerId'], that.params['parentId'], that.params['zone']].join('_');
        if(index = that.params['node'].getAttribute('data-index')){
            that.params['index'] = parseInt(index);
            that.params['node'].removeAttribute('data-index');
        }
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions();
        // Construct
        new cm.Finder('App.Zone', that.params['zoneName'], null, function(classObject){
            constructZone(classObject, that.params['index']);
        });
        new cm.Finder('App.Editor', that.params['editorName'], null, function(classObject){
            constructEditor(classObject);
        }, {'event' : 'onProcessStart'});
    };

    var constructZone = function(classObject, index){
        if(classObject){
            that.zone = classObject
                .addBlock(that, index);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject
                .removeBlock(that);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addBlock(that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .removeBlock(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.node, 'is-editing');
            cm.addClass(that.node, 'is-visible');
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editable');
                cm.customEvent.trigger(that.node, 'enableEditable', {
                    'type' : 'child',
                    'self' : false
                });
            }
            cm.removeClass(that.nodes['block']['container'], 'cm__animate');
            cm.customEvent.trigger(that.node, 'enableEditing', {
                'type' : 'child',
                'self' : false
            });
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing');
            if(!that.params['visible']){
                cm.removeClass(that.node, 'is-visible');
            }
            if(!that.params['locked']){
                cm.removeClass(that.node, 'is-editable');
                cm.customEvent.trigger(that.node, 'disableEditable', {
                    'type' : 'child',
                    'self' : false
                });
            }
            cm.addClass(that.nodes['block']['container'], 'cm__animate');
            cm.customEvent.trigger(that.node, 'disableEditing', {
                'type' : 'child',
                'self' : false
            });
            that.triggerEvent('disableEditing');
        }
        return that;
    };

    that.addZone = function(item){
        that.zones.push(item);
        return that;
    };

    that.removeZone = function(zone){
        cm.arrayRemove(that.zones, zone);
        return that;
    };

    that.setZone = function(zone, index){
        destructZone(that.zone);
        constructZone(zone, index);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.getIndex = function(){
        if(that.zone){
            return that.zone.getBlockIndex(that);
        }
        return null;
    };

    that.getLower = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index + 1) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getDragNodes = function(){
        var nodes = [];
        cm.forEach(that.nodes['block']['drag'], function(item){
            nodes.push(item['container']);
        });
        return nodes;
    };

    that.getMenuNodes = function(){
        return that.nodes['block']['menu'];
    };

    that.getInnerNode = function(){
        return that.nodes['block']['inner'];
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructZone(that.zone);
            destructEditor(that.components['editor']);
            while(that.zones.length){
                that.zones[0].remove();
            }
            that.removeFromStack();
            cm.remove(that.node);
            that.triggerEvent('onRemove');
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
cm.define('App.Dashboard', {
    'modules' : [
        'Params',
        'Events'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onDragStart',
        'onMove',
        'onDrop',
        'onRemoveStart',
        'onRemove',
        'onRemoveEnd',
        'onReplaceStart',
        'onReplace',
        'onReplaceEnd',
        'onAppendStart',
        'onAppend',
        'onAppendEnd'
    ],
    'params' : {
        'draggableContainer' : 'document.body',
        'scrollNode' : 'document.body',
        'scrollSpeed' : 1,                           // ms per 1px
        'scrollStep' : 48,
        'useGracefulDegradation' : true,
        'dropDuration' : 400,
        'moveDuration' : 200,
        'highlightZones' : true,                     // highlight zones on drag start
        'highlightPlaceholders' : true,
        'placeholderHeight' : 64,
        'Com.Overlay' : {
            'container' : 'document.body',
            'duration' : 0,
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : false,
            'showContent' : false,
            'position' : 'fixed',
            'theme' : 'transparent'
        }
    }
},
function(params){
    var that = this;

    that.isGracefulDegradation = false;
    that.isScrollProccess = false;
    that.isProccess = false;
    that.components = {};
    that.anim = {};

    that.zones = [];
    that.blocks = [];
    that.dummyBlocks = [];

    that.currentZones = null;
    that.currentBlocks = null;
    that.currentBlock = null;
    that.currentBlockOffset = null;
    that.currentBellow = null;

    /* *** INIT *** */

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var getCSSHelpers = function(){
        that.params['dropDuration'] = cm.getTransitionDurationFromRule('.app__dashboard__drop-duration');
        that.params['moveDuration'] = cm.getTransitionDurationFromRule('.app__dashboard__move-duration');
    };

    var validateParams = function(){
        that.params['Com.Overlay']['container'] = that.params['draggableContainer'];
        // Check Graceful Degradation, and turn it to mobile and old ie.
        if(
            that.params['useGracefulDegradation']
            && ((cm.is('IE') && cm.isVersion() < 9)
            || cm.isMobile())
        ){
            that.isGracefulDegradation = true;
        }
        // Permanent disable animation
        that.isGracefulDegradation = true;
    };

    var render = function(){
        reset();
        // Overlay, for protect content while dragging
        cm.getConstructor('Com.Overlay', function(classConstructor){
            that.components['overlays'] = new classConstructor(that.params['Com.Overlay']);
        });
        // Init scroll
        that.anim['scroll'] = new cm.Animation(that.params['scrollNode']);
    };

    /* *** DRAG AND DROP ** */

    var reset = function(){
        // Unset zone, blocks and placeholder bellow current graggable block
        if(that.currentBellow){
            unsetCurrentBelow();
        }
        // Remove placeholders
        removePlaceholders();
        // Reset variables
        that.currentZones = [];
        that.currentBlocks = [];
        that.currentBlock = null;
        that.currentBlockOffset = {
            'left' : 0,
            'top' : 0
        };
        that.currentBellow = {
            'zone' : null,
            'block' : null,
            'position' : null,
            'placeholder' : null
        };
        that.isProccess = false;
    };

    var start = function(e, block){
        cm.preventDefault(e);
        // Prevent multiple drag event
        if(that.isProccess || that.currentBlock){
            return;
        }
        // Prevent drag event not on LMB
        if(!cm.isTouch && e.button){
            return;
        }
        that.isProccess = true;
        // Variables
        var params = getPosition(e);
        cm.addClass(document.body, 'app__dashboard__body');
        // Open overlay to prevent lose focus on child iframe
        that.components['overlays'].open();
        // Filter zones and blocks to work with it
        that.currentZones = getCurrentZones(block);
        that.currentBlocks = getCurrentBlocks(block);
        // API onDragStart Event
        that.triggerEvent('onDragStart', {
            'item' : block,
            'node' : block.node,
            'zone' : block.zone
        });
        // Prepare widget, get offset, set start position, set widget as current
        prepareBlock(block, params);
        // Highlight zones
        if(that.params['highlightZones']){
            highlightCurrentZones();
        }
        // Update positions of blocks and zones
        getCurrentDimensions();
        // Render placeholders
        renderPlaceholders();
        // Find zone, block and placeholder under current graggable block
        setCurrentBelow(
            getCurrentBelow(params)
        );
        // Add events
        cm.addEvent(window, 'mousemove', move);
        cm.addEvent(window, 'mouseup', stop);
        cm.addEvent(window, 'scroll', scroll);
    };

    var move = function(e){
        cm.preventDefault(e);
        // Variables
        var params = getPosition(e);
        // Scroll node
        if(params['top'] + that.params['scrollStep'] > cm._pageSize['winHeight']){
            moveScroll(1);
        }else if(params['top'] - that.params['scrollStep'] < 0){
            moveScroll(-1);
        }else{
            moveScroll(0);
        }
        // Move block
        moveBlock(that.currentBlock, params, true);
        // Find zone, block and placeholder under current graggable block
        setCurrentBelow(
            getCurrentBelow(params)
        );
    };

    var stop = function(){
        // Drop block
        if(!that.currentBellow.zone || that.currentBellow.zone.params['type'] == 'remove'){
            removeBlock(that.currentBlock, {
                'onEnd' : reset
            });
        }else{
            dropBlock(that.currentBlock, {
                'index' : that.currentBellow.placeholder.params['index'],
                'zone' : that.currentBellow.zone,
                'placeholder' : that.currentBellow.placeholder,
                'onEnd' : reset
            });
        }
        // Unhighlight zones
        if(that.params['highlightZones']){
            unhighlightCurrentZones();
        }
        // Hide content blocker
        that.components['overlays'].close();
        cm.removeClass(document.body, 'app__dashboard__body');
        // Remove events attached on document and template
        cm.removeEvent(window, 'mousemove', move);
        cm.removeEvent(window, 'mouseup', stop);
        cm.removeEvent(window, 'scroll', scroll);
    };

    var scroll = function(e){
        // Variables
        var params = getPosition(e);
        // Update positions of blocks and zones
        updateCurrentDimensions();
        // Find zone, block and placeholder under current graggable block
        setCurrentBelow(
            getCurrentBelow(params)
        );
    };

    /* *** BLOCK *** */

    var initBlock = function(item){
        item.placeholders = {
            'top' : null,
            'bottom' : null
        };
        cm.forEach(item.getDragNodes(), function(node){
            cm.addEvent(node, 'mousedown', function(e){
                start(e, item);
            });
        });
        resetBlock(item);
        that.blocks.push(item);
    };

    var prepareBlock = function(block, params){
        var dimensions = block.getDimensions();
        // Get offset using pointer position
        that.currentBlockOffset['top'] = params['top'] - dimensions['outer']['top'];
        that.currentBlockOffset['left'] = params['left'] - dimensions['outer']['left'];
        // Clone dummy block or unset area from block
        if(block.isDummy){
            that.currentBlock = block
                .clone();
        }else{
            that.currentBlock = block
                .unsetZone();
        }
        // Insert widget to body
        cm.appendChild(that.currentBlock.node, that.params['draggableContainer']);
        // Set helper classes
        cm.addClass(that.currentBlock['node'], 'is-immediately');
        cm.addClass(that.currentBlock['node'], 'is-dragging');
        cm.addClass(that.currentBlock['node'], 'is-active', true);
        // Set widget start position
        moveBlock(that.currentBlock, {
            'top' : dimensions['outer']['top'],
            'left' : dimensions['outer']['left'],
            'width' : dimensions['offset']['width']
        });
        that.currentBlock.updateDimensions();
        setTimeout(function(){
            cm.removeClass(that.currentBlock['node'], 'is-immediately');
        }, 5);
    };

    var moveBlock = function(block, params, offset){
        // Calculate
        var top = params['top'],
            left = params['left'],
            node = params['node'] || block['node'];
        if(offset){
            top -= that.currentBlockOffset['top'];
            left -= that.currentBlockOffset['left'];
        }
        if(typeof params['width'] != 'undefined'){
            node.style.width = [params['width'], 'px'].join('');
        }
        if(typeof params['height'] != 'undefined'){
            node.style.height = [params['height'], 'px'].join('');
        }
        if(typeof params['opacity'] != 'undefined'){
            node.style.opacity = params['opacity'];
        }
        cm.setCSSTranslate(node, [left, 'px'].join(''), [top, 'px'].join(''));
    };

    var removeBlock = function(block, params){
        var node;
        that.isProccess = true;
        // Merge params
        params = cm.merge({
            'onStart' : function(){},
            'onEnd' : function(){},
            'triggerEvent' : true
        }, params);
        // System onStart event
        params['onStart']();
        // Global event
        if(params['triggerEvent']){
            that.triggerEvent('onRemoveStart', block);
        }
        // Check if widget exists and placed in DOM
        if(cm.hasParentNode(block.node)){
            // Update block dimensions
            block.updateDimensions();
            // Init drop state
            cm.addClass(block.node, 'is-dropping', true);
            // Move widget
            if(block === that.currentBlock){
                node = block.node;
                moveBlock(block, {
                    'left' : -block.dimensions['outer']['width'],
                    'top' : block.dimensions['outer']['top'],
                    'opacity' : 0
                });
            }else{
                node = cm.Node('div', {'class' : 'app__dashboard__helper'});
                cm.insertAfter(node, block.node);
                cm.appendChild(block.node, node);
                cm.transition(node, {
                    'properties' : {
                        'height' : '0px',
                        'opacity' : 0
                    },
                    'duration' : that.params['dropDuration']
                });
            }
        }else{
            node = block.node;
        }
        // After animation event
        setTimeout(function(){
            // Remove temporary node
            cm.remove(node);
            // Remove block
            block.unsetZone()
                 .remove();
            if(params['triggerEvent']){
                that.triggerEvent('onRemove', block);
                that.triggerEvent('onRemoveEnd', block);
            }
            that.isProccess = false;
            // System onEnd event
            params['onEnd']();
        }, that.params['dropDuration']);
    };

    var dropBlock = function(block, params){
        var width, height;
        // Merge params
        params = cm.merge({
            'index' : 0,
            'zone' : null,
            'placeholder' : null,
            'onStart' : function(){},
            'onEnd' : function(){}
        }, params);
        // System onStart event
        params['onStart']();
        // Get dimensions
        params.zone.getDimensions();
        // Init drop state
        if(block.isDummy){
            block.showSpinner();
        }
        // Get block height
        width = params.zone.dimensions['inner']['width'] - block.dimensions['margin']['left'] - block.dimensions['margin']['right'];
        block.node.style.width = [width, 'px'].join('');
        height = block.node.offsetHeight + block.dimensions['margin']['top'] + block.dimensions['margin']['bottom'];
        block.node.style.width = [block.dimensions['offset']['width'], 'px'].join('');
        // Move block
        cm.addClass(block.node, 'is-dropping', true);
        if(params.placeholder){
            params.placeholder.getDimensions();
            moveBlock(block, {
                'left' : params.placeholder.dimensions['outer']['left'] - block.dimensions['margin']['left'],
                'top' : params.placeholder.dimensions['outer']['top'] - block.dimensions['margin']['top'],
                'width' : width
            });
            // Animate placeholder
            params.placeholder.show(height, that.params['dropDuration'], true);
        }else{
            moveBlock(block, {
                'left' : params.zone.dimensions['inner']['left'] - block.dimensions['margin']['left'],
                'top' : params.zone.dimensions['inner']['top'] - block.dimensions['margin']['top'],
                'width' : width
            });
        }
        // Animation end event
        setTimeout(function(){
            // Reset styles
            resetBlock(block);
            // Append
            if(params.placeholder){
                cm.insertAfter(block.node, params.placeholder.node);
            }else{
                cm.appendChild(block.node, params.zone.node);
            }
            block.setZone(params.zone, params['index']);
            that.triggerEvent('onDrop', block);
            // System onEnd event
            params['onEnd']();
        }, that.params['dropDuration']);
    };

    var appendBlock = function(node, params){
        var dimensions, temporaryNode;
        that.isProccess = true;
        // Merge params
        params = cm.merge({
            'block' : null,
            'zone' : null,
            'triggerEvent' : true,
            'index' : false,
            'onStart' : function(){},
            'onEnd' : function(){}
        }, params);
        // System onStart event
        params['onStart']();
        // Global event
        if(params['triggerEvent']){
            that.triggerEvent('onAppendStart', {
                'node' : node
            });
        }
        if(cm.isNumber(params.index)){
            node.setAttribute('data-index', params.index.toString());
        }
        // Render temporary node
        temporaryNode = cm.node('div');
        temporaryNode.style.height = 0;
        if(params.block){
            cm.insertAfter(temporaryNode, params.block.node);
        }else{
            cm.appendChild(temporaryNode, params.zone.node);
        }
        cm.appendChild(node, temporaryNode);
        cm.addClass(node, 'is-replacing', true);
        cm.addClass(temporaryNode, 'app__dashboard__helper', true);
        // Get new block dimensions
        dimensions = cm.getNodeOffset(node);
        // Animate
        cm.transition(temporaryNode, {
            'properties' : {
                'height' : [dimensions['outer']['height'], 'px'].join('')
            },
            'duration' : that.params['dropDuration']
        });
        cm.transition(node, {'properties' : {'opacity' : 1}, 'duration' : that.params['dropDuration']});
        // After animation event
        setTimeout(function(){
            cm.removeClass(node, 'is-replacing');
            cm.insertAfter(node, temporaryNode);
            cm.remove(temporaryNode);
            // Global event
            if(params['triggerEvent']){
                that.triggerEvent('onAppend', {
                    'node' : node
                });
                that.triggerEvent('onAppendEnd', {
                    'node' : node
                });
            }
            that.isProccess = false;
            // System onEnd event
            params['onEnd']();
        }, that.params['dropDuration']);
    };

    var replaceBlock = function(node, params){
        var halfTime = that.params['dropDuration'] / 2,
            dimensions,
            temporaryNode;
        that.isProccess = true;
        // Merge params
        params = cm.merge({
            'block' : null,
            'zone' : null,
            'triggerEvent' : true,
            'index' : false,
            'onStart' : function(){},
            'onEnd' : function(){}
        }, params);
        // System onStart event
        params['onStart']();
        // Global event
        if(params['triggerEvent']){
            that.triggerEvent('onReplaceStart', {
                'node' : node
            });
        }
        if(cm.isNumber(params.index)){
            node.setAttribute('data-index', params.index.toString());
        }
        // Temporary node
        temporaryNode = cm.node('div');
        if(params.block){
            cm.insertAfter(temporaryNode, params.block.node);
            cm.appendChild(params.block.node, temporaryNode);
            cm.appendChild(node, temporaryNode);
            // Animate fade previous block
            cm.transition(params.block.node, {'properties' : {'opacity' : 0}, 'duration' : halfTime});
        }else{
            cm.appendChild(temporaryNode, params.zone.node);
            cm.appendChild(node, temporaryNode);
            // Set initial styles
            temporaryNode.style.height = 0;
        }
        cm.addClass(node, 'is-replacing', true);
        cm.addClass(temporaryNode, 'app__dashboard__helper', true);
        // Get new block dimensions
        dimensions = cm.getNodeOffset(node);
        // Animate
        cm.transition(temporaryNode, {
            'properties' : {
                'height' : [dimensions['outer']['height'], 'px'].join('')
            },
            'duration' : that.params['dropDuration']
        });
        cm.transition(node, {'properties' : {'opacity' : 1}, 'duration' : halfTime, 'delayIn' : halfTime});
        // After animation event
        setTimeout(function(){
            if(params.block){
                params.block
                    .unsetZone()
                    .remove();
            }
            cm.removeClass(node, 'is-replacing');
            cm.insertAfter(node, temporaryNode);
            cm.remove(temporaryNode);
            // Global event
            if(params['triggerEvent']){
                that.triggerEvent('onReplace', {
                    'node' : node
                });
                that.triggerEvent('onReplaceEnd', {
                    'node' : node
                });
            }
            that.isProccess = false;
            // System onEnd event
            params['onEnd']();
        }, that.params['dropDuration']);
    };

    var resetBlock = function(block){
        // Remove helper classes
        cm.removeClass(block.node, 'is-immediately is-dragging is-dropping is-active', true);
        // Reset styles
        block.node.style.left = '';
        block.node.style.top = '';
        block.node.style.width = '';
        block.node.style.opacity = '';
        cm.setCSSTranslate(block.node, 'auto', 'auto');
    };

    /* *** PLACEHOLDER *** */

    var renderPlaceholders = function(){
        var placeholder;
        cm.forEach(that.currentZones, function(zone){
            zone.placeholders = [];
            if(!zone['blocks'].length){
                placeholder = new App.DashboardPlaceholder({
                    'highlight' : that.params['highlightPlaceholders'],
                    'animate' : !that.isGracefulDegradation,
                    'index' : 0,
                    'container' : zone.node,
                    'insert' : 'appendChild'
                });
                zone.placeholders.push(placeholder);
            }else{
                cm.forEach(zone['blocks'], function(block, i){
                    block.placeholders = {};
                    if(!i){
                        placeholder = new App.DashboardPlaceholder({
                            'highlight' : that.params['highlightPlaceholders'],
                            'animate' : !that.isGracefulDegradation,
                            'index' : i,
                            'container' : block.node,
                            'insert' : 'insertBefore'
                        });
                        zone.placeholders.push(placeholder);
                    }
                    placeholder = new App.DashboardPlaceholder({
                        'highlight' : that.params['highlightPlaceholders'],
                        'animate' : !that.isGracefulDegradation,
                        'index' : i + 1,
                        'container' : block.node,
                        'insert' : 'insertAfter'
                    });
                    zone.placeholders.push(placeholder);
                    // Associate with block
                    block.placeholders['top'] = zone.placeholders[i];
                    block.placeholders['bottom'] = zone.placeholders[i + 1];
                });
            }
        });
    };

    var removePlaceholders = function(){
        cm.forEach(that.currentZones, function(zone){
            cm.forEach(zone.placeholders, function(placeholder){
                placeholder.remove();
            });
            zone.placeholders = [];
        });
    };

    /* *** CURRENT *** */

    var getCurrentDimensions = function(){
        var isPlaceholderShow;
        if(that.currentBellow.placeholder && (isPlaceholderShow = that.currentBellow.placeholder.isShow)){
            that.currentBellow.placeholder.hide(0);
        }
        cm.forEach(that.currentZones, function(item){
            item.getDimensions();
        });
        cm.forEach(that.currentBlocks, function(item){
            item.getDimensions();
        });
        if(that.currentBellow.placeholder && isPlaceholderShow){
           that.currentBellow.placeholder.restore(0);
        }
    };

    var updateCurrentDimensions = function(){
        var isPlaceholderShow;
        if(that.currentBellow.placeholder && (isPlaceholderShow = that.currentBellow.placeholder.isShow)){
            that.currentBellow.placeholder.hide(0);
        }
        cm.forEach(that.currentZones, function(item){
            item.updateDimensions();
        });
        cm.forEach(that.currentBlocks, function(item){
            item.updateDimensions();
        });
        if(that.currentBellow.placeholder && isPlaceholderShow){
            that.currentBellow.placeholder.restore(0);
        }
    };

    var getCurrentZones = function(block){
        return that.zones.filter(function(zone){
            if(
                cm.isParent(block.params['node'], zone.params['node'])
                || zone.params['locked']
                || zone.params['type'] != 'remove' && block.params['type'] != zone.params['type']
            ){
                return false;
            }
            return true;
        });
    };

    var getCurrentBlocks = function(block){
        return that.blocks.filter(function(item){
            if(
                cm.isParent(block.params['node'], item.params['node'])
                || block.params['type'] != item.params['type']
            ){
                return false;
            }
            return true;
        });
    };

    var getCurrentBelow = function(params){
        var temp = {
            'zone' : null,
            'block' : null,
            'position' : null,
            'placeholder' : null
        };
        // Find zone below current graggable block
        cm.forEach(that.currentZones, function(zone){
            if(
                params['left'] >= zone.dimensions['offset']['left']
                && params['left'] < zone.dimensions['offset']['right']
                && params['top'] >= zone.dimensions['offset']['top']
                && params['top'] <= zone.dimensions['offset']['bottom']
            ){
                if(!temp.zone){
                    temp.zone = zone;
                }else if(
                    zone.dimensions['offset']['width'] < temp.zone.dimensions['offset']['width']
                    || zone.dimensions['offset']['height'] < temp.zone.dimensions['offset']['height']
                ){
                    temp.zone = zone;
                }
            }
        });
        if(!temp.zone){
            temp.zone = that.currentBellow.zone;
        }
        // Find block below current graggable block
        if(temp.zone){
            cm.forEach(temp.zone['blocks'], function(block){
                if(
                    params['top'] >= block.dimensions['outer']['top']
                    && params['top'] <= block.dimensions['outer']['bottom']
                ){
                    temp.block = block;
                    // Find position
                    if((params['top'] - block.dimensions['outer']['top']) < (block.dimensions['outer']['height'] / 2)){
                        temp.position = 'top';
                    }else{
                        temp.position = 'bottom';
                    }
                }
            });
            if(!temp.block && temp.zone['blocks'].length){
                if(params['top'] < temp.zone.dimensions['inner']['top']){
                    temp.block = temp.zone['blocks'][0];
                    temp.position = 'top';
                }else{
                    temp.block = temp.zone['blocks'][temp.zone['blocks'].length - 1];
                    temp.position = 'bottom';
                }
            }
        }
        // Find placeholder
        if(temp.block){
            temp.placeholder = temp.block.placeholders[temp.position];
        }else if(temp.zone){
            temp.placeholder = temp.zone.placeholders[0];
        }
        return temp;
    };

    var setCurrentBelow = function(temp){
        // Unset old zone and set new one
        if(
            that.currentBellow.zone
            && that.currentBellow.zone.isActive
            && that.currentBellow.zone != temp.zone
        ){
            that.currentBellow.zone.unactive();
        }
        if(
            temp.zone
            && !temp.zone.isActive
            && temp.zone != that.currentBellow.placeholder
        ){
            temp.zone.active();
        }
        // Unset old placeholder and new new one
        if(
            that.currentBellow.placeholder
            && that.currentBellow.placeholder.isActive
            && that.currentBellow.placeholder != temp.placeholder
        ){
            that.currentBellow.placeholder.unactive();
            that.currentBellow.placeholder.hide(that.params['moveDuration']);
        }
        if(
            temp.placeholder
            && !temp.placeholder.isActive
            && temp.placeholder != that.currentBellow.placeholder
        ){
            temp.placeholder.active();
            //temp.placeholder.show(that.currentBlock.dimensions['outer']['height'], that.params['moveDuration']);
            temp.placeholder.show(that.params['placeholderHeight'], that.params['moveDuration']);
        }
        // Update positions of blocks and zones
        if(
            that.currentBellow.zone != temp.zone
            || that.currentBellow.placeholder != temp.placeholder
        ){
            //updateCurrentDimensions();
        }
        // Set global variables
        that.currentBellow = temp;
    };

    var unsetCurrentBelow = function(){
        if(that.currentBellow.zone){
            that.currentBellow.zone
                .unactive();
        }
        if(that.currentBellow.placeholder){
            that.currentBellow.placeholder
                .unactive()
                .hide()
                .remove();
        }
    };

    /* *** ZONE *** */

    var initZone = function(item){
        item.placeholders = [];
        that.zones.push(item);
    };

    var highlightCurrentZones = function(){
        cm.forEach(that.currentZones, function(zone){
            zone.highlight();
        });
    };

    var unhighlightCurrentZones = function(){
        cm.forEach(that.currentZones, function(zone){
            zone.unhighlight();
        });
    };

    /* *** DUMMY *** */

    var initDummyBlock = function(item){
        cm.forEach(item.getDragNodes(), function(node){
            cm.addEvent(node, 'mousedown', function(e){
                start(e, item);
            });
        });
        that.dummyBlocks.push(item);
    };

    /* *** HELPERS *** */

    var getPosition = function(e){
        if(e.type == 'scroll'){
            return cm._clientPosition;
        }
        return cm.getEventClientPosition(e);
    };

    var moveScroll = function(speed){
        var duration = 0,
            move = 0;
        if(speed == 0){
            that.isScrollProccess = false;
            that.anim['scroll'].stop();
            return true;
        }
        if(that.isScrollProccess){
           return true;
        }
        that.isScrollProccess = true;
        if(speed < 0){
            move = 0;
            duration = cm.getBodyScrollTop() * that.params['scrollSpeed'];
        }else{
            move = Math.max(cm.getBodyScrollHeight() - cm._pageSize['winHeight'], 0);
            duration = move * that.params['scrollSpeed'];
        }
        that.anim['scroll'].go({'style' : {'docScrollTop' : move}, 'duration' : duration, 'anim' : 'smooth'});
    };

    /* ******* MAIN ******* */

    that.addBlock = function(block){
        if(block.isDummy){
            initDummyBlock(block);
        }else{
            initBlock(block);
        }
        return that;
    };

    that.removeBlock = function(block, params){
        removeBlock(block, params);
        return that;
    };

    that.replaceBlock = function(node, params){
        replaceBlock(node, params);
        return that;
    };

    that.appendBlock = function(node, params){
        appendBlock(node, params);
        return that;
    };

    that.addZone = function(item){
        initZone(item);
        return that;
    };
    
    init();
});
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
cm.define('App.DummyBlock', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'keyword' : '',
        'type' : 'template-manager',            // template-manager | form-manager | mail
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = true;
    that.isEditing = false;
    that.isRemoved = false;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'container' : cm.node('div'),
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
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['name'] = [that.params['type'], that.params['keyword']].join('_');
    };

    var render = function(){
        that.node = that.params['node'];
        // Render spinner
        renderSpinner();
        // Calculate dimensions
        that.getDimensions();
        // Construct
        new cm.Finder('App.Editor', that.params['editorName'], null, constructEditor, {'event' : 'onProcessStart'});
    };

    var constructZone = function(classObject, index){
        if(classObject){
            that.zone = classObject
                .addBlock(that, index);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject
                .removeBlock(that);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addBlock(that);
        }
    };

    var renderSpinner = function(){
        that.nodes['spinner'] = cm.node('div', {'class' : 'app__block-spinner'},
            cm.node('div', {'class' : 'pt__box-loader is-absolute'},
                cm.node('div', {'class' : 'inner'})
            )
        );
        that.nodes['container'].appendChild(that.nodes['spinner']);
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing is-editable is-visible');
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable is-visible');
        }
        return that;
    };

    that.setZone = function(zone, index){
        destructZone(that.zone);
        constructZone(zone, index);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.getIndex = function(){
        if(that.zone){
            return that.zone.getBlockIndex(that);
        }
        return null;
    };

    that.getLower = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getDragNodes = function(){
        return [that.node];
    };

    that.showSpinner = function(){
        cm.addClass(that.nodes['spinner'], 'is-visible', true);
        return that;
    };

    that.hideSpinner = function(){
        cm.removeClass(that.nodes['spinner'], 'is-visible');
        return that;
    };

    that.clone = function(){
        var params = {
            'node' : cm.clone(that.node, true)
        };
        return that.cloneComponent(params);
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            that.removeFromStack();
            cm.remove(that.node);
            that.triggerEvent('onRemove');
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
cm.define('App.Editor', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack',
        'Storage'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onProcessStart',
        'onExpand',
        'onCollapse',
        'onResize',

        'create',
        'replace',
        'move',
        'delete',
        'update',
        'duplicate',

        'createRequest',
        'replaceRequest',
        'moveRequest',
        'deleteRequest',
        'updateRequest',
        'duplicateRequest',

        'onProcessEnd'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-editor',
        'topMenuName' : 'app-topmenu',
        'sidebarName' : 'app-sidebar',
        'templateName' : 'app-template',
        'App.Dashboard' : {},
        'Com.Overlay' : {
            'container' : 'document.body',
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : true,
            'showContent' : false,
            'position' : 'fixed',
            'theme' : 'light'
        }
    }
},
function(params){
    var that = this;

    that.components = {};
    that.nodes = {};

    that.zones = [];
    that.blocks = [];
    that.dummyBlocks = [];
    that.isRendered = false;
    that.isProcessed = false;
    that.isExpanded = null;

    /* *** INIT *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var render = function(){
        cm.getConstructor('App.Dashboard', function(classConstructor, className){
            that.components['dashboard'] = new classConstructor(that.params[className])
                .addEvent('onDrop', dropRequest)
                .addEvent('onRemove', removeRequest);
        });
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topmenu'] = classObject;
        });
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject
                .addEvent('onResize', sidebarResizeAction)
                .addEvent('onExpandEnd', sidebarExpandAction)
                .addEvent('onCollapseEnd', sidebarCollapseAction);
        });
        cm.find('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
        });
        process();
    };

    var process = function(){
        that.triggerEvent('onProcessStart');
        cm.addClass(cm.getDocumentHtml(), 'is-editor');
        if(that.components['sidebar']){
            that.components['sidebar'].resize();
            if(that.components['sidebar'].isExpanded){
                sidebarExpandAction();
            }else{
                sidebarCollapseAction();
            }
        }else{
            sidebarCollapseAction();
        }
        if(!that.components['sidebar'] && that.components['topmenu']){
            adminPageAction();
        }
        that.isRendered = true;
    };

    var sidebarResizeAction = function(sidebar, params){
        cm.addClass(cm.getDocumentHtml(), 'is-immediately');
        that.triggerEvent('onResize', {
            'sidebar' : params
        });
        setTimeout(function(){
            cm.removeClass(cm.getDocumentHtml(), 'is-immediately');
        }, 5);
    };

    var sidebarExpandAction = function(){
        if(typeof that.isExpanded !== 'boolean' || !that.isExpanded){
            that.isExpanded = true;
            cm.addClass(cm.getDocumentHtml(), 'is-editing');
            cm.forEach(that.zones, function(item){
                item.enableEditing();
            });
            cm.forEach(that.blocks, function(item){
                item.enableEditing();
            });
            cm.forEach(that.dummyBlocks, function(item){
                item.enableEditing();
            });
            that.components['template'].enableEditing();
            that.triggerEvent('onExpand');
        }
    };

    var sidebarCollapseAction = function(){
        if(typeof that.isExpanded !== 'boolean' || that.isExpanded){
            that.isExpanded = false;
            cm.removeClass(cm.getDocumentHtml(), 'is-editing');
            cm.forEach(that.zones, function(item){
                item.disableEditing();
            });
            cm.forEach(that.blocks, function(item){
                item.disableEditing();
            });
            cm.forEach(that.dummyBlocks, function(item){
                item.disableEditing();
            });
            that.components['template'].disableEditing();
            that.triggerEvent('onCollapse');
        }
    };

    var adminPageAction = function(){
        // Enable gridlist editable
        cm.find('Com.GridlistHelper', null, null, function(classObject){
            classObject.enableEditing();
        });
    };

    /* *** DASHBOARD REQUEST EVENTS *** */

    var dropRequest = function(dashboard, block){
        if(block.isDummy){
            that.createRequest(block);
        }else{
            that.moveRequest(block);
        }
    };

    var removeRequest = function(dashboard, block){
        if(!block.isDummy){
            that.deleteRequest(block);
        }
    };

    /* ******* MAIN ******* */

    /* *** REQUESTS *** */

    that.createRequest = function(block){
        that.triggerEvent('createRequest', block);
        return that;
    };

    that.deleteRequest = function(block){
        that.triggerEvent('deleteRequest', block);
        return that;
    };

    that.moveRequest = function(block){
        that.triggerEvent('moveRequest', block);
        return that;
    };

    that.replaceRequest = function(block){
        that.triggerEvent('replaceRequest', block);
        return that;
    };

    that.updateRequest = function(block){
        that.triggerEvent('updateRequest', block);
        return that;
    };

    that.duplicateRequest = function(block){
        that.triggerEvent('duplicateRequest', block);
        return that;
    };

    /* *** ACTIONS *** */

    that.create = function(node, block){
        if(node && block){
            node = !cm.isNode(node) ? cm.strToHTML(node) : node;
            that.components['dashboard'].replaceBlock(node, {
                'block' : block,
                'zone' : block.zone,
                'index' : block.getIndex(),
                'onEnd' : function(){
                    that.triggerEvent('create', node);
                    that.triggerEvent('onProcessEnd', node);
                }
            });
        }
        return that;
    };

    that.replace = function(node, block){
        if(node && block){
            node = !cm.isNode(node) ? cm.strToHTML(node) : node;
            that.components['dashboard'].replaceBlock(node, {
                'block' : block,
                'zone' : block.zone,
                'index' : block.getIndex(),
                'onEnd' : function(){
                    that.triggerEvent('replace', node);
                    that.triggerEvent('onProcessEnd', node);
                }
            });
        }
        return that;
    };

    that.delete = function(block){
        if(block){
            that.components['dashboard'].removeBlock(block, {
                'triggerEvent' : false,
                'onEnd' : function(){
                    that.triggerEvent('delete', block.node);
                    that.triggerEvent('onProcessEnd', block.node);
                }
            });
        }
        return that;
    };

    that.duplicate = function(node, block){
        if(node && block){
            node = !cm.isNode(node) ? cm.strToHTML(node) : node;
            that.components['dashboard'].appendBlock(node, {
                'block' : block,
                'zone' : block.zone,
                'index' : block.getIndex() + 1,
                'onEnd' : function(){
                    that.triggerEvent('duplicate', node);
                    that.triggerEvent('onProcessEnd', node);
                }
            });
        }
        return that;
    };

    that.update = function(node, block){
        if(node && block){
            node = !cm.isNode(node) ? cm.strToHTML(node) : node;
            cm.clearNode(block.getInnerNode());
            cm.appendChild(node, block.getInnerNode());
            that.triggerEvent('update', node);
            that.triggerEvent('onProcessEnd', node);
        }
        return that;
    };

    /* *** SYSTEM *** */

    that.addZone = function(zone){
        that.zones.push(zone);
        that.components['dashboard'].addZone(zone);
        if(that.isRendered){
            if(that.components['sidebar'] && that.components['sidebar'].isExpanded){
                zone.enableEditing();
            }else{
                zone.disableEditing();
            }
        }
        return that;
    };

    that.removeZone = function(zone){
        cm.arrayRemove(that.zones, zone);
        return that;
    };

    that.addBlock = function(block){
        if(block.isDummy){
            that.dummyBlocks.push(block);
        }else{
            var menu = block.getMenuNodes();
            cm.addEvent(menu['edit'], 'click', function(){
                that.replaceRequest(block);
            });
            cm.addEvent(menu['duplicate'], 'click', function(){
                that.duplicateRequest(block);
            });
            cm.addEvent(menu['delete'], 'click', function(){
                that.deleteRequest(block);
            });
            that.blocks.push(block);
        }
        that.components['dashboard'].addBlock(block);
        if(that.isRendered){
            if(that.components['sidebar'] && that.components['sidebar'].isExpanded){
                block.enableEditing();
            }else{
                block.disableEditing();
            }
        }
        return that;
    };

    that.removeBlock = function(block){
        if(block.isDummy){
            cm.arrayRemove(that.dummyBlocks, block);
        }else{
            cm.arrayRemove(that.blocks, block);
        }
        return that;
    };

    init();
});
cm.define('App.HelpTour', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'container' : 'document.body',
        'name' : 'app-helptour',
        'sidebarName' : 'app-sidebar',
        'topMenuName' : 'app-topmenu',
        'templateName' : 'app-template',
        'duration' : 500,
        'adaptiveFrom' : 768,
        'autoStart' : false,
        'popupIndent' : 24,
        'Com.Overlay' : {
            'container' : 'document.body',
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : false,
            'showContent' : false,
            'name' : '',
            'theme' : 'transparent',
            'position' : 'absolute'
        },
        'langs' : {
            'next' : 'Next',
            'back' : 'Back',
            'close' : 'Close',
            'cancel' : 'Cancel',
            'finish' : 'Finish'
        }
    }
},
function(params){
    var that = this,
        dimensions = {
            'sidebarCollapsed' : 0,
            'sidebarExpanded' : 0,
            'topMenu' : 0,
            'popupHeight' : 0,
            'popupSelfHeight' : 0,
            'popupContentHeight' : 0
        },
        startOptions = {
            'sidebarExpanded' : false,
            'sidebarTab' : 'modules'
        };

    that.nodes = {};
    that.components = {
        'overlays' : {}
    };
    that.currentStage = -1;
    that.currentScene = null;
    that.currentSceneNode = null;
    that.previousStage = null;
    that.previousScene = null;
    that.previousSceneNode = null;
    that.sceneIntervals = {};

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        validateParams();
        render();
        that.triggerEvent('onRender');
        that.params['autoStart'] && prepare();
    };

    var getCSSHelpers = function(){
        var rule;
        that.params['duration'] = cm.getTransitionDurationFromRule('.app__helptour-helper__duration');
        if(rule = cm.getCSSRule('.app__helptour-helper__adaptive-from')[0]){
            that.params['adaptiveFrom'] = cm.styleToNumber(rule.style.width);
        }
    };

    var validateParams = function(){
        that.params['Com.Overlay']['container'] = that.params['container'];
        that.params['Com.Overlay']['name'] = [that.params['name'], 'overlay'].join('-')
    };

    var render = function(){
        cm.getConstructor('Com.Overlay', function(classConstructor){
            that.components['overlays']['main'] = new classConstructor(
                cm.merge(that.params['Com.Overlay'], {
                    'position' : 'fixed'
                })
            );
            that.components['overlays']['sidebar'] = new classConstructor(that.params['Com.Overlay']);
            that.components['overlays']['topMenu'] = new classConstructor(that.params['Com.Overlay']);
            that.components['overlays']['template'] = new classConstructor(that.params['Com.Overlay']);
            // Start tour on click
            cm.addEvent(that.params['node'], 'click', prepare);
        });
    };

    var getDimensions = function(){
        var rule;
        if(rule = cm.getCSSRule('.app__sidebar-helper__width-collapsed')[0]){
            dimensions['sidebarCollapsed'] = cm.styleToNumber(rule.style.width);
        }
        if(rule = cm.getCSSRule('.app__sidebar-helper__width-expanded')[0]){
            dimensions['sidebarExpanded'] = cm.styleToNumber(rule.style.width);
        }
        if(rule = cm.getCSSRule('.app__topmenu-helper__height')[0]){
            dimensions['topMenu'] = cm.styleToNumber(rule.style.height);
        }
        if(!dimensions['popupSelfHeight']){
            dimensions['popupSelfHeight'] = that.nodes['popup'].offsetHeight;
        }
        if(that.currentSceneNode){
            dimensions['popupContentHeight'] = that.currentSceneNode.offsetHeight;
        }
        dimensions['popupHeight'] = dimensions['popupSelfHeight'] + dimensions['popupContentHeight'];
    };

    var prepare = function(){
        // Get Sidebar
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject;
            that.components['overlays']['sidebar'].embed(that.components['sidebar'].getNodes('inner'));
        });
        // Get TopMenu
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
            that.components['overlays']['topMenu'].embed(that.components['topMenu'].getNodes('inner'));
        });
        // Get Template
        cm.find('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.components['overlays']['template'].embed(that.components['template'].getNodes('container'));
        });
        // Start
        if(that.components['sidebar'] && that.components['topMenu'] && that.components['template']){
            start();
        }else{
            cm.errorLog({
                'type' : 'error',
                'name' : that._name['full'],
                'message' : ['Required components does not constructed.'].join(' ')
            });
        }
    };

    var start = function(){
        // Render Popup
        renderPopup();
        // Save Sidebar State
        startOptions['sidebarExpanded'] = that.components['sidebar'].isExpanded;
        if(that.components['sidebar'].isExpanded){
            that.components['sidebar'].collapse();
        }
        startOptions['sidebarTab'] = that.components['sidebar'].getTab();
        that.components['sidebar'].unsetTab();
        // Collapse menu (mobile)
        that.components['topMenu'].collapse();
        // Show overlays
        cm.forEach(that.components['overlays'], function(item){
            item.open();
        });
        // Start scenario
        setStage(0);
    };

    var stop = function(){
        // Remove Popup
        removePopup();
        // Restore Sidebar State
        if(startOptions['sidebarExpanded'] && !that.components['sidebar'].isExpanded){
            that.components['sidebar'].expand();
        }else if(!startOptions['sidebarExpanded'] && that.components['sidebar'].isExpanded){
            that.components['sidebar'].collapse();
        }
        that.components['sidebar'].setTab(startOptions['sidebarTab']);
        // Hide overlays
        cm.forEach(that.components['overlays'], function(item){
            item.close();
        });
        // Stop scenario
        unsetStage();
    };

    var setStage = function(stage){
        if(App.HelpTourScenario[stage]){
            // Destruct Previous Scene
            unsetStage();
            // Construct New Scene
            that.currentStage = stage;
            that.currentScene = App.HelpTourScenario[stage];
            // Set Overlays
            cm.forEach(that.currentScene['overlays'], function(item, key){
                that.components['overlays'][key].setTheme(item);
            });
            // Set Sidebar
            if(!that.currentScene['sidebar']){
                that.components['sidebar']
                    .unsetTab()
                    .collapse();
            }else{
                that.components['sidebar']
                    .setTab(that.currentScene['sidebar'])
                    .expand();
            }
            // Set Top Menu
            that.components['topMenu'].setActiveItem(that.currentScene['topMenu']);
            // Set Popup Arrow
            if(that.currentScene['arrow']){
                cm.addClass(that.nodes['popupArrows'][that.currentScene['arrow']], 'is-show');
            }
            // Set Popup Buttons
            if(that.currentStage == 0){
                that.nodes['back'].innerHTML = that.lang('close');
                that.nodes['next'].innerHTML = that.lang('next');
            }else if(that.currentStage == App.HelpTourScenario.length - 1){
                that.nodes['back'].innerHTML = that.lang('back');
                that.nodes['next'].innerHTML = that.lang('finish');
            }else{
                that.nodes['back'].innerHTML = that.lang('back');
                that.nodes['next'].innerHTML = that.lang('next');
            }
            // Set Popup Content
            that.currentSceneNode = cm.Node('div', {'class' : 'popup__content__item', 'innerHTML' : that.currentScene['content']});
            that.nodes['popupContent'].appendChild(that.currentSceneNode);
            cm.addClass(that.currentSceneNode, 'is-show', true);
            // Set Popup Position
            setPopupPosition();
            // Construct
            that.currentScene['construct'] && that.currentScene['construct'].call(that);
        }
    };

    var unsetStage = function(){
        if(that.currentStage >= 0){
            that.previousStage = that.currentStage;
            that.previousScene = that.currentScene;
            that.previousSceneNode = that.currentSceneNode;
            // Top Menu
            that.components['topMenu'].unsetActiveItem(that.previousScene['topMenu']);
            // Clear Popup Arrow
            if(that.previousScene['arrow']){
                cm.removeClass(that.nodes['popupArrows'][that.previousScene['arrow']], 'is-show');
            }
            // Clear Scene Intervals
            cm.forEach(that.sceneIntervals, function(item){
                clearInterval(item);
            });
            // Remove Popup Node
            (function(node){
                setTimeout(function(){
                    cm.remove(node);
                }, that.params['duration']);
            })(that.previousSceneNode);
            // Destruct
            that.previousScene['destruct'] && that.previousScene['destruct'].call(that);
        }
        that.currentStage = -1;
    };

    var renderPopup = function(){
        that.nodes['popupArrows'] = {};
        that.nodes['popup'] = cm.Node('div', {'class' : 'app__helptour__popup'},
            that.nodes['popupArrows']['top'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--top'}),
            that.nodes['popupArrows']['right'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--right'}),
            that.nodes['popupArrows']['bottom'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--bottom'}),
            that.nodes['popupArrows']['left'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--left'}),
            that.nodes['popupClose'] = cm.Node('div', {'class' : 'popup__close', 'title' : that.lang('close')}),
            that.nodes['popupContent'] = cm.Node('div', {'class' : 'popup__content'}),
            that.nodes['popupButtons'] = cm.Node('div', {'class' : 'popup__buttons'},
                cm.Node('div', {'class' : 'btn-wrap pull-center'},
                    that.nodes['back'] = cm.Node('button', that.lang('back')),
                    that.nodes['next'] = cm.Node('button', that.lang('next'))
                )
            )
        );
        setPopupStartPosition();
        // Append
        that.params['container'].appendChild(that.nodes['popup']);
        cm.addClass(that.nodes['popup'], 'is-show', true);
        // Events
        cm.addEvent(that.nodes['popupClose'], 'click', stop);
        cm.addEvent(that.nodes['next'], 'click', that.next);
        cm.addEvent(that.nodes['back'], 'click', that.prev);
        cm.addEvent(window, 'resize', setPopupPosition);
        cm.addEvent(window, 'keydown', popupClickEvents);
    };

    var removePopup = function(){
        // Remove events
        cm.removeEvent(window, 'resize', setPopupPosition);
        cm.removeEvent(window, 'keydown', popupClickEvents);
        // Set end position
        setPopupStartPosition();
        cm.removeClass(that.nodes['popup'], 'is-show');
        // Remove node
        setTimeout(function(){
            cm.remove(that.nodes['popup']);
        }, that.params['duration']);
    };

    var setPopupStartPosition = function(){
        var left = [Math.round(cm.getX(that.params['node']) + that.params['node'].offsetWidth / 2), 'px'].join(''),
            top = [Math.round(cm.getY(that.params['node']) + that.params['node'].offsetHeight / 2), 'px'].join('');
        cm.setCSSTranslate(that.nodes['popup'], left, top, 0, 'scale(0)');
    };

    var popupClickEvents = function(e){
        e = cm.getEvent(e);
        switch(e.keyCode){
            case 27:
                stop();
                break;
            case 37:
                that.prev();
                break;
            case 39:
                that.next();
                break;
        }
    };

    var setPopupPosition = function(){
        var position, pageSize, top, left, conentHeight, topMenuItem;
        if(that.currentScene){
            pageSize = cm.getPageSize();
            // Desktop or mobile view
            if(pageSize['winWidth'] > that.params['adaptiveFrom']){
                getDimensions();
                position = that.currentScene['position'].split(':');
                conentHeight = dimensions['popupContentHeight'];
                // Set position
                switch(position[0]){
                    // Window related position
                    case 'window':
                        switch(position[1]){
                            case 'top':
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = that.params['popupIndent'];
                                break;
                            case 'bottom':
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = pageSize['winHeight'] - dimensions['popupHeight'] - that.params['popupIndent'];
                                break;
                            case 'center':
                            default:
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = Math.round((pageSize['winHeight'] - dimensions['popupHeight']) / 2);
                                break;
                        }
                        break;
                    // Top Menu related position
                    case 'topMenu':
                        switch(position[1]){
                            case 'center':
                            default:
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                        }
                        break;
                    // Top Menu Item related position
                    case 'topMenuItem':
                        topMenuItem = that.components['topMenu'].getItem(position[1]);
                        if(!topMenuItem){
                            left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        }else if(position[2] && position[2] == 'dropdown' && topMenuItem['dropdown']){
                            if(position[3] && position[3] == 'left'){
                                left = cm.getX(topMenuItem['dropdown']) - that.nodes['popup'].offsetWidth - that.params['popupIndent'];
                            }else{
                                left = cm.getX(topMenuItem['dropdown']) + topMenuItem['dropdown'].offsetWidth + that.params['popupIndent'];
                            }
                        }else if(topMenuItem['container']){
                            if(position[3] && position[3] == 'left'){
                                left = cm.getX(topMenuItem['container']) + topMenuItem['container'].offsetWidth - that.nodes['popup'].offsetWidth;
                            }else{
                                left = cm.getX(topMenuItem['container']);
                            }
                        }else{
                            left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        }
                        top = dimensions['topMenu'] + that.params['popupIndent'];
                        break;
                    // Template related position
                    case 'template':
                        switch(position[1]){
                            case 'top':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                            case 'bottom':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = pageSize['winHeight'] - dimensions['popupHeight'] - that.params['popupIndent'];
                                break;
                            case 'left':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']) + that.params['popupIndent'];
                                top = Math.round((pageSize['winHeight'] - dimensions['popupHeight']) / 2);
                                break;
                            case 'left-top':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']) + that.params['popupIndent'];
                                top = dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                            case 'center':
                            default:
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = Math.round((pageSize['winHeight'] +  dimensions['topMenu'] - dimensions['popupHeight']) / 2);
                                break;
                        }
                        break;
                    // Default position
                    default:
                        left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        top = Math.round((pageSize['winHeight'] - dimensions['popupHeight']) / 2);
                        break;
                }
            }else{
                left = 0;
                top = 0;
                conentHeight = 'auto';
            }
            that.nodes['popupContent'].style.height = conentHeight == 'auto' ? conentHeight : [conentHeight, 'px'].join('');
            cm.setCSSTranslate(that.nodes['popup'], [left, 'px'].join(''), [top, 'px'].join(''), 0, 'scale(1)');
        }
    };

    /* ******* MAIN ******* */

    that.start = function(){
        prepare();
        return that;
    };

    that.stop = function(){
        stop();
        return that;
    };

    that.next = function(){
        if(that.currentStage >= 0){
            if(App.HelpTourScenario[that.currentStage + 1]){
                setStage(that.currentStage + 1);
            }else{
                stop();
            }
        }
        return that;
    };

    that.prev = function(){
        if(that.currentStage >= 0){
            if(App.HelpTourScenario[that.currentStage - 1]){
                setStage(that.currentStage - 1);
            }else{
                stop();
            }
        }
        return that;
    };

    init();
});

/* ******* HELP TOUR SCENARIO ******* */

App.HelpTourScenario = [{
    'position' : 'window:center',
    'arrow' : false,
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : false,
    'content' : '<h3>QuickSilk Online Tour!</h3><p>Welcome to QuickSilk! Use the buttons at the bottom of each help bubble to quickly discover how to navigate and use the QuickSilk software. This online tour automatically appears the first time you login. Anytime after this, simply click on the help tour menu item for a quick refresher.</p>'
},{
    'position' : 'topMenuItem:user:dropdown:left',
    'arrow' : 'right',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'user',
    'content' : '<h3>User Menu</h3><p>Click on your name to view the admin panel (future), your profile, or to logout. The View Profile link provides the ability to manage your subscription and billing, password, forum settings, working groups and public profile.</p>'
},{
    'position' : 'topMenuItem:modules:dropdown:right',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'modules',
    'content' : '<h3>Modules</h3><p>The Module manager allows you to work on your modules from the administration panel. Simply mouse over the Modules menu and then scroll down and click on the module you wish to work with. </p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : false,
    'content' : '<h3>Left Panel Slider</h3><p>The left slider widget provides you with quick access to the modules, pages, layouts and template features. Simply click on the icon for the tab you wish to use.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'template-manager',
    'topMenu' : false,
    'content' : '<h3>Installed Modules</h3><p>The modules tab provides quick access to the modules that you\'ve subscribed to. Once you\'ve opened a page or a template, open the modules tab to drag and drop the modules you wish to include.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'pages',
    'topMenu' : false,
    'content' : '<h3>Site Pages</h3><p>The site pages tab allows you to quickly open, modify and manage your website pages. Simply open the tab and click on the web page you wish to work on.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'layouts',
    'topMenu' : false,
    'content' : '<h3>Page Layouts</h3><p>Use the page layout tab to open, modify and manage the layouts of your various web page templates. A page layout will consist of the common elements you have on every page.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'templates',
    'topMenu' : false,
    'content' : '<h3>Templates</h3><p>The templates tab displays the different custom or predesigned templates that you\'ve installed and are immediately available for use on your website. If you want to view or install other templates, you\'ll do so from the template gallery.</p>'
},{
    'position' : 'template:center',
    'arrow' : false,
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'dark',
        'template' : 'light'
    },
    'sidebar' : false,
    'topMenu' : false,
    'content' : '<h3>Drop Area</h3><p>The drop area is where you drag and drop the modules. To move a module onto a page or template place your mouse on the desired module icon, hold down the left button on your mouse, and drag the module to the highlighted area of the page you wish to drop it, then let go of the mouse button.</p>'
},{
    'position' : 'topMenuItem:support:container:right',
    'arrow' : 'top',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'support',
    'content' : '<h3>Need Help?</h3><p>Are you stuck, experiencing an issue, found a bug or have a suggestion? Simply click on this link and send us a message. FYI, to assist in the troubleshooting process we automatically collect information on the operating system, browser and browser version you are using. Our goal is to respond to your message within 1 business day.</p>'
}];
cm.define('App.LoginBox', {
    'modules' : [
        'Params',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'preventClickEvent' : true,
            'adaptiveX' : true,
            'adaptiveY' : true,
            'left' : '(targetWidth - selfWidth) / 2',
            'top' : 'targetHeight + 8',
            'className' : 'app-pt__box-login__tooltip'
        }
    }
},
function(params){
    var that = this,
        components = {};

    that.nodes = {
        'button' : cm.Node('div'),
        'target' : cm.Node('div')
    };

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        // Render tooltip
        components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'target' : that.nodes['button'],
                'content' : that.nodes['target'],
                'events' : {
                    'onShow' : show
                }
            })
        );
    };

    var show = function(){
        // Focus text input
        var input = cm.getByAttr('type', 'text', that.nodes['target'])[0];
        input && input.focus();
    };

    /* ******* MAIN ******* */

    init();
});
cm.define('App.SearchBox', {
    'modules' : [
        'Params',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'preventClickEvent' : true,
            'adaptiveX' : true,
            'adaptiveY' : false,
            'left' : '-selfWidth+targetWidth',
            'top' : 'targetHeight + 8',
            'className' : 'app-mod__search__tooltip'
        }
    }
},
function(params){
    var that = this,
        components = {};

    that.nodes = {
        'button' : cm.Node('div'),
        'target' : cm.Node('div')
    };

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        // Render tooltip
        components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'target' : that.nodes['button'],
                'content' : that.nodes['target'],
                'events' : {
                    'onShow' : show
                }
            })
        );
    };

    var show = function(){
        // Focus text input
        var input = cm.getByAttr('type', 'text', that.nodes['target'])[0];
        input && input.focus();
    };

    /* ******* MAIN ******* */

    init();
});
cm.define('App.Sidebar', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Storage',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onCollapseStart',
        'onCollapse',
        'onCollapseEnd',
        'onExpandStart',
        'onExpand',
        'onExpandEnd',
        'onTabShow',
        'onTabHide',
        'onResize'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-sidebar',
        'duration' : 300,
        'active' : 'template-manager',
        'target' : 'document.html',
        'remember' : true,
        'ajax' : {
            'type' : 'json',
            'method' : 'get',
            'url' : '',                                             // Request URL. Variables: %tab%, %callback% for JSONP.
            'params' : ''                                           // Params object. %tab%, %callback% for JSONP.
        },
        'Com.TabsetHelper' : {
            'node' : cm.Node('div'),
            'name' : '',
            'responseHTML' : true
        }
    }
},
function(params){
    var that = this,
        scrollBarSize = 0,
        menuWidth = 0,
        contentWidth;

    that.nodes = {
        'container' : cm.Node('div'),
        'inner' : cm.Node('div'),
        'collapseButtons' : [],
        'labels' : [],
        'tabs' : []
    };
    that.components = {};
    that.isExpanded = null;
    that.openInterval = null;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var getCSSHelpers = function(){
        that.params['duration'] = cm.getTransitionDurationFromRule('.app__sidebar-helper__duration');
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['ajax'] = that.params['ajax'];
    };

    var render = function(){
        var isExpanded, helperMenuRule, helperContentRule;
        // Init tabset
        processTabset();
        // Get sidebar dimensions from CSS
        scrollBarSize = cm._scrollSize;
        if(helperMenuRule = cm.getCSSRule('.app__sidebar-helper__menu-width')[0]){
            menuWidth = cm.styleToNumber(helperMenuRule.style.width);
        }
        if(helperContentRule = cm.getCSSRule('.app__sidebar-helper__content-width')[0]){
            contentWidth = cm.styleToNumber(helperContentRule.style.width);
        }
        // Add events on collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addEvent(item['container'], 'click', that.toggle);
        });
        // Resize sidebar relative to scroll bar size
        resize();
        // Check toggle class
        isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        // Check storage
        if(that.params['remember']){
            isExpanded = that.storageRead('isExpanded');
        }
        // Trigger events
        if(isExpanded){
            that.expand(true, true);
        }else{
            that.collapse(true, true);
        }
        cm.addEvent(window, 'resize', resizeAction);
        cm.customEvent.add(that.nodes['container'], 'scrollSizeChange', resizeAction);
    };

    var processTabset = function(){
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper'])
                .addEvent('onLabelTarget', function(tabset, data){
                    if(!that.isExpanded || tabset.get() == data['item']['id']){
                        that.toggle();
                    }
                })
                .addEvent('onTabHide', function(tabset, data){
                    that.triggerEvent('onTabHide', data);
                })
                .addEvent('onTabShow', function(tabset, data){
                    that.triggerEvent('onTabShow', data);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels'])
                .set(that.params['active']);
        });
        // Tabs events
        cm.forEach(that.nodes['tabs'], function(item){
            cm.addIsolateScrolling(item['descr']);
        });
    };

    var resize = function(){
        var rule,
            params = {
                'innerWidth' : contentWidth + scrollBarSize,
                'width' : menuWidth + contentWidth + scrollBarSize,
                'contentWidth' : contentWidth,
                'menuWidth' : menuWidth,
                'scrollBarSize' : scrollBarSize
            };
        cm.addClass(that.nodes['container'], 'is-immediately');
        if(rule = cm.getCSSRule('.app__sidebar .sidebar__content')[0]){
            rule.style.width = [params['innerWidth'], 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app__sidebar .sidebar__remove-zone')[0]){
            rule.style.width = [params['innerWidth'], 'px'].join('');
        }
        if((rule = cm.getCSSRule('.app__sidebar.is-expanded')[0]) || (rule = cm.getCSSRule('.is-expanded.app__sidebar')[0])){
            rule.style.width = [params['width'], 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app__sidebar-helper__width-expanded')[0]){
            rule.style.width = [params['width'], 'px'].join('');
        }
        that.triggerEvent('onResize', params);
        setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'is-immediately');
        }, 5);
    };

    var resizeAction = function(){
        animFrame(function(){
            if(cm._scrollSize != scrollBarSize){
                scrollBarSize = cm._scrollSize;
                resize();
            }
            if(cm._pageSize['winWidth'] <= cm._config['adaptiveFrom']){
                if(that.isExpanded){
                    that.collapse(true);
                }
            }
        });
    };

    /* ******* MAIN ******* */

    that.collapse = function(isImmediately, force){
        if(force || typeof that.isExpanded !== 'boolean' || that.isExpanded){
            that.isExpanded = false;
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isExpanded', false);
            }
            that.triggerEvent('onCollapseStart');
            // Set immediately animation hack
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
                cm.addClass(that.params['target'], 'is-immediately');
            }
            cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed', true);
            cm.replaceClass(that.params['target'], 'is-sidebar--expanded', 'is-sidebar--collapsed', true);
            // Unset active class to collapse buttons
            cm.forEach(that.nodes['collapseButtons'], function(item){
                cm.removeClass(item['container'], 'active');
            });
            // Remove immediately animation hack
            that.openInterval && clearTimeout(that.openInterval);
            if(isImmediately){
                that.triggerEvent('onCollapse');
                that.triggerEvent('onCollapseEnd');
                that.openInterval = setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                    cm.removeClass(that.params['target'], 'is-immediately');
                }, 5);
            }else{
                that.openInterval = setTimeout(function(){
                    that.triggerEvent('onCollapse');
                    that.triggerEvent('onCollapseEnd');
                }, that.params['duration'] + 5);
            }
        }
        return that;
    };

    that.expand = function(isImmediately, force){
        if(force || typeof that.isExpanded !== 'boolean' || !that.isExpanded){
            that.isExpanded = true;
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isExpanded', true);
            }
            that.triggerEvent('onExpandStart');
            // Set immediately animation hack
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
                cm.addClass(that.params['target'], 'is-immediately');
            }
            cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded', true);
            cm.replaceClass(that.params['target'], 'is-sidebar--collapsed', 'is-sidebar--expanded', true);
            // Set active class to collapse buttons
            cm.forEach(that.nodes['collapseButtons'], function(item){
                cm.addClass(item['container'], 'active');
            });
            // Remove immediately animation hack
            that.openInterval && clearTimeout(that.openInterval);
            if(isImmediately){
                that.triggerEvent('onExpand');
                that.triggerEvent('onExpandEnd');
                that.openInterval = setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                    cm.removeClass(that.params['target'], 'is-immediately');
                }, 5);
            }else{
                that.openInterval = setTimeout(function(){
                    that.triggerEvent('onExpand');
                    that.triggerEvent('onExpandEnd');
                }, that.params['duration'] + 5);
            }
        }
        return that;
    };

    that.toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
        return that;
    };

    that.setTab = function(id){
        if(that.components['tabset']){
            that.components['tabset'].set(id);
        }
        return that;
    };

    that.unsetTab = function(){
        if(that.components['tabset']){
            that.components['tabset'].unset();
        }
        return that;
    };

    that.getTab = function(){
        if(that.components['tabset']){
            return that.components['tabset'].get();
        }
        return null;
    };

    that.resize = function(){
        resize();
        return that;
    };

    that.getDimensions = function(key){
        var rect = cm.getRect(that.nodes['container']);
        return rect[key] || rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
cm.define('App.Stylizer', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onSelect',
        'onChange'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'active' : {},
        'default' : {},
        'styles' : {
            'font-family' : [
                "Arial, Helvetica, sans-serif",
                "Arial Black, Gadget, sans-serif",
                "Courier New, Courier, monospace",
                "Georgia, serif",
                "Impact, Charcoal, sans-serif",
                "Lucida Console, Monaco, monospace",
                "Lucida Sans Unicode, Lucida Grande, sans-serif",
                "Palatino Linotype, Book Antiqua, Palatino, serif",
                "Tahoma, Geneva, sans-serif",
                "Times New Roman, Times, serif",
                "Trebuchet MS, Helvetica, sans-serif",
                "Verdana, Geneva, sans-serif"
            ],
            'line-height' : [8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 108, 120],
            'font-size' : [8, 9, 10, 11, 12, 13, 14, 18, 20, 22, 24, 28, 32, 36, 42, 48, 54, 60, 72, 96],
            'font-weight' : [100, 300, 400, 600, 700, 800],
            'font-style' : ['normal', 'italic'],
            'text-decoration' : ['none', 'underline']
        },
        'styleBinds' : {
            'font-weight' : {
                'normal' : 400,
                'bold' : 700
            }
        },
        'controls' : {
            'font-family' : true,
            'line-height' : true,
            'font-size' : true,
            'font-weight' : true,
            'font-style' : true,
            'text-decoration' : true,
            'color' : true
        },
        'showResetButtons' : true,
        'overrideControls' : true,
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'top' : 'targetHeight + 6',
            'left' : '-6',
            'className' : 'app__stylizer-tooltip'
        },
        'Com.Select' : {
            'renderInBody' : false
        },
        'Com.ColorPicker' : {
            'renderInBody' : false
        },
        'langs' : {
            '100' : 'Thin',
            '300' : 'Light',
            '400' : 'Regular',
            '600' : 'Semi-Bold',
            '700' : 'Bold',
            '800' : 'Extra-Bold'
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'input' : cm.Node('input', {'type' : 'hidden'}),
        'preview' : cm.Node('div'),
        'tooltip' : {}
    };
    that.components = {};
    that.value = null;
    that.previousValue = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        // Render editor toolbar
        renderTooltip();
        // Add to stack
        that.addToStack(that.nodes['container']);
        // Set
        set(cm.merge(that.params['default'], that.params['active']), false);
        // Trigger events
        that.triggerEvent('onRender', that.value);
    };

    var validateParams = function(){
        if(cm.isNode(that.nodes['input'])){
            that.params['name'] = that.nodes['input'].getAttribute('name') || that.params['name'];
        }
        // Get config
        that.params['default'] = cm.merge(
            that.params['default'],
            that.getNodeDataConfig(that.nodes['input'], 'data-default')
        );
        that.params['active'] = cm.merge(
            cm.merge(that.params['default'], that.params['active']),
            that.getNodeDataConfig(that.nodes['input'], 'value')
        );
        // Validate config
        validateItemConfig(that.params['active']);
        validateItemConfig(that.params['default']);
        // Extend global styles config
        extendGlobalConfig(that.params['active']);
        extendGlobalConfig(that.params['default']);
        sortGlobalConfig();
        // Override controls
        if(that.params['overrideControls']){
            cm.forEach(that.params['controls'], function(item, key){
                that.params['controls'][key] = !!that.params['default'][key];
            });
        }
    };

    var validateItemConfig = function(config){
        if(config['line-height']){
            if(config['line-height'] != 'normal'){
                config['line-height'] = parseInt(config['line-height']);
            }
        }
        if(config['font-size']){
            config['font-size'] = parseInt(config['font-size']);
        }
        if(config['font-weight']){
            if(that.params['styleBinds']['font-weight'][config['font-weight']]){
                config['font-weight'] = that.params['styleBinds']['font-weight'][config['font-weight']];
            }
            config['font-weight'] = parseInt(config['font-weight']);
            config['font-weight'] = cm.inArray(that.params['styles']['font-weight'], config['font-weight'])? config['font-weight'] : 400;
        }
        if(config['font-style']){
            config['font-style'] = cm.inArray(that.params['styles']['font-style'], config['font-style'])? config['font-style'] : 'normal';
        }
        if(config['text-decoration']){
            config['text-decoration'] = cm.inArray(that.params['styles']['text-decoration'], config['text-decoration'])? config['text-decoration'] : 'none';
        }
        return config;
    };

    var extendGlobalConfig = function(config){
        if(config['font-size'] && !cm.inArray(that.params['styles']['font-size'], config['font-size'])){
            that.params['styles']['font-size'].push(config['font-size']);
        }
        if(config['line-height'] && !cm.inArray(that.params['styles']['line-height'], config['line-height'])){
            that.params['styles']['line-height'].push(config['line-height']);
        }
        if(config['font-family'] && !cm.inArray(that.params['styles']['font-family'], config['font-family'])){
            that.params['styles']['font-family'].push(config['font-family']);
        }
    };

    var sortGlobalConfig = function(){
        that.params['styles']['font-size'].sort(function(a, b){
            return a - b;
        });
        that.params['styles']['line-height'].sort(function(a, b){
            if(a == 'normal'){
                return -1;
            }else if(b == 'normal'){
                return 1;
            }
            return a - b;
        });
        that.params['styles']['font-family'].sort(function(a, b){
            var t1 = a.toLowerCase().replace(/["']/g, ''),
                t2 = b.toLowerCase().replace(/["']/g, '');
            return (t1 < t2)? -1 : ((t1 > t2)? 1 : 0);
        });
    };

    var renderTooltip = function(){
        // Structure
        that.nodes['tooltip']['container'] = cm.Node('div', {'class' : 'pt__toolbar'},
            cm.Node('div', {'class' : 'inner'},
                that.nodes['tooltip']['group1'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group2'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group3'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group4'] = cm.Node('ul', {'class' : 'group'})
            )
        );
        // Font-Family
        if(that.params['controls']['font-family']){
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['font-family'] = cm.Node('select', {'title' : that.lang('Font')})
                )
            );
            cm.forEach(that.params['styles']['font-family'], function(item){
                that.nodes['tooltip']['font-family'].appendChild(
                    cm.Node('option', {'value' : item, 'style' : {'font-family' : item}}, item.replace(/["']/g, '').split(',')[0])
                );
            });
            that.components['font-family'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-family'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-family' : value}), true);
                        }
                    }
                })
            );
        }
        // Font-Weight
        if(that.params['controls']['font-weight']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['font-weight-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar bold'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['font-weight-button'], 'click', function(){
                set(cm.merge(that.value, {'font-weight' : (that.value['font-weight'] > 400? 400 : 700)}), true);
            });
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['font-weight'] = cm.Node('select', {'title' : that.lang('Weight')})
                )
            );
            cm.forEach(that.params['styles']['font-weight'], function(item){
                that.nodes['tooltip']['font-weight'].appendChild(
                    cm.Node('option', {'value' : item}, that.lang(item))
                );
            });
            that.components['font-weight'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-weight'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-weight' : value}), true);
                        }
                    }
                })
            );
        }
        // Font-Style
        if(that.params['controls']['font-style']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['font-style-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar italic'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['font-style-button'], 'click', function(){
                set(cm.merge(that.value, {'font-style' : (that.value['font-style'] == 'italic'? 'normal' : 'italic')}), true);
            });
        }
        // Text-Decoration
        if(that.params['controls']['text-decoration']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['text-decoration-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar underline'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['text-decoration-button'], 'click', function(){
                set(cm.merge(that.value, {'text-decoration' : (that.value['text-decoration'] == 'underline'? 'none' : 'underline')}), true);
            });
        }
        // Font-Size
        if(that.params['controls']['font-size']){
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select x-small'},
                    that.nodes['tooltip']['font-size'] = cm.Node('select', {'title' : that.lang('Size')})
                )
            );
            cm.forEach(that.params['styles']['font-size'], function(item){
                that.nodes['tooltip']['font-size'].appendChild(
                    cm.Node('option', {'value' : item}, item)
                );
            });
            that.components['font-size'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-size'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-size' : value}), true);
                        }
                    }
                })
            );
        }
        // Line-Height
        if(that.params['controls']['line-height']){
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select x-small'},
                    that.nodes['tooltip']['line-height'] = cm.Node('select', {'title' : that.lang('Leading')})
                )
            );
            cm.forEach(that.params['styles']['line-height'], function(item){
                that.nodes['tooltip']['line-height'].appendChild(
                    cm.Node('option', {'value' : item}, (item == 'normal'? that.lang('auto') : item))
                );
            });
            that.components['line-height'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['line-height'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'line-height' : value}), true);
                        }
                    }
                })
            );
        }
        // Color
        if(that.params['controls']['color']){
            that.nodes['tooltip']['group3'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['color'] = cm.Node('input', {'type' : 'text', 'title' : that.lang('Color')})
                )
            );
            that.components['color'] = new Com.ColorPicker(
                cm.merge(that.params['Com.ColorPicker'], {
                    'input' : that.nodes['tooltip']['color'],
                    'defaultValue' : that.params['default']['color'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'color' : value}), true);
                        }
                    }
                })
            );
        }
        // Reset
        if(that.params['showResetButtons']){
            // Button
            that.nodes['tooltip']['group4'].appendChild(
                cm.Node('li',
                    that.nodes['tooltip']['reset-default-button'] = cm.Node('div', {'class' : 'button button-primary'}, that.lang('Reset to default'))
                )
            );
            that.nodes['tooltip']['group4'].appendChild(
                cm.Node('li',
                    that.nodes['tooltip']['reset-current-button'] = cm.Node('div', {'class' : 'button button-primary'}, that.lang('Reset to current'))
                )
            );
            cm.addEvent(that.nodes['tooltip']['reset-default-button'], 'click', function(){
                set(cm.clone(that.params['default']), true);
            });
            cm.addEvent(that.nodes['tooltip']['reset-current-button'], 'click', function(){
                set(cm.clone(that.params['active']), true);
            });
        }
        // Render tooltip
        that.components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'content' : that.nodes['tooltip']['container'],
                'target' : that.nodes['container'],
                'events' : {
                    'onShowStart' : function(){
                        cm.addClass(that.nodes['container'], 'active')
                    },
                    'onHideStart' : function(){
                        cm.removeClass(that.nodes['container'], 'active')
                    }
                }
            })
        );
    };

    var set = function(styles, triggerEvents){
        var prepared = cm.clone(styles);
        that.previousValue = cm.clone(that.value);
        that.value = styles;
        // Set components
        cm.forEach(styles, function(value, key){
            if(that.components[key]){
                that.components[key].set(value, false);
            }
            // Set buttons
            switch(key){
                case 'font-weight':
                    if(value > 400){
                        cm.addClass(that.nodes['tooltip']['font-weight-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-weight-button'], 'active');
                    }
                    break;
                case 'text-decoration':
                    if(value == 'underline'){
                        cm.addClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }
                    break;
                case 'font-style':
                    if(value == 'italic'){
                        cm.addClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }
                    break;
                case 'font-size':
                    prepared[key] = [value, 'px'].join('');
                    break;
                case 'line-height':
                    prepared[key] = value == 'normal'? value :[value, 'px'].join('');
                    break;
            }
            // Set preview
            that.nodes['preview'].style[cm.styleStrToKey(key)] = prepared[key];
        });
        // Set hidden input data
        that.nodes['input'].value = JSON.stringify(prepared);
        // Trigger events
        if(triggerEvents){
            that.triggerEvent('onSelect', that.value);
            eventOnChange();
        }
    };

    var eventOnChange = function(){
        if(JSON.stringify(that.value) != JSON.stringify(that.previousValue)){
            that.triggerEvent('onChange', that.value);
        }
    };

    /* ******* MAIN ******* */

    that.set = function(styles, triggerEvents){
        triggerEvents = typeof triggerEvents != 'undefined'? triggerEvents : true;
        styles = cm.isObject(styles)? validateItemConfig(styles) : that.params['default'];
        set(styles, triggerEvents);
        return that;
    };

    that.get = function(){
        return that.value;
    };

    init();
});
cm.define('App.Template', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRedraw',
        'onResize',
        'enableEditing',
        'disableEditing'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-template',
        'stickyFooter' : false,
        'scrollNode' : 'document.body',
        'scrollDuration' : 1000,
        'topMenuName' : 'app-topmenu',
        'sidebarName' : 'app-sidebar',
        'editorName' : 'app-editor',
        'template' : {
            'type' : 'box',            // wide | box
            'width' : 1000,
            'align' : 'center',
            'indent' : 24
        },
        'header' : {
            'type' : 'box',            // wide | box
            'width' : 1000,
            'align' : 'center',
            'fixed' : false,
            'overlapping' : false
        },
        'footer' : {
            'type' : 'box',            // wide | box
            'width' : 1000,
            'align' : 'center'
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'inner' : cm.Node('div'),
        'headerContainer' : cm.Node('div'),
        'header' : cm.Node('div'),
        'content' : cm.Node('div'),
        'footer' : cm.Node('div'),
        'buttonUp' : cm.Node('div')
    };

    that.isEditing = null;
    that.compoennts = {};
    that.anim = {};
    that.offsets = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
        redraw(true);
    };

    var render = function(){
        // Find components
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.compoennts['topMenu'] = classObject;
        });
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.compoennts['sidebar'] = classObject;
        });
        new cm.Finder('App.Editor', that.params['editorName'], null, function(classObject){
            that.compoennts['editor'] = classObject
                .addEvent('onResize', resize);
        }, {'event' : 'onProcessStart'});
        // Scroll Controllers
        that.anim['scroll'] = new cm.Animation(that.params['scrollNode']);
        cm.addEvent(that.nodes['buttonUp'], 'click', that.scrollToTop);
        // Events
        cm.addEvent(window, 'resize', function(){
            animFrame(function(){
                that.triggerEvent('onResize');
                redraw(true);
            });
        });
    };

    var resize = function(editor, params){
        var rule;
        if(rule = cm.getCSSRule('html.is-sidebar--expanded .tpl__container')[0]){
            rule.style.marginLeft = [params['sidebar']['width'], 'px'].join('');
        }
        if(rule = cm.getCSSRule('html.is-sidebar--expanded .tpl__header__container.is-fixed')[0]){
            rule.style.left = [params['sidebar']['width'], 'px'].join('');
        }
    };

    var redraw = function(triggerEvents){
        // Fixed Header
        that.offsets['top'] = that.compoennts['topMenu'] ? that.compoennts['topMenu'].getDimensions('height') : 0;
        that.offsets['left'] = that.compoennts['sidebar'] ? that.compoennts['sidebar'].getDimensions('width') : 0;
        that.offsets['header'] = that.nodes['header'].offsetHeight;
        that.offsets['footer'] = that.nodes['footer'].offsetHeight;
        that.offsets['height'] = cm.getPageSize('winHeight') - that.offsets['top'];
        // Resize
        that.nodes['inner'].style.minHeight = that.offsets['height'] + 'px';
        if(that.isEditing){
            that.nodes['content'].style.top = 0;
            if(that.params['stickyFooter']){
                that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['header'] - that.offsets['footer']), 0) + 'px';
            }
        }else{
            if(that.params['header']['fixed'] && !that.params['header']['overlapping']){
                that.nodes['content'].style.top = that.offsets['header'] + 'px';
            }
            if(that.params['stickyFooter']){
                if(that.params['header']['overlapping']){
                    that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['footer']), 0) + 'px';
                }else{
                    that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['header'] - that.offsets['footer']), 0) + 'px';
                }
            }
        }
        // Redraw Events
        if(triggerEvents){
            that.triggerEvent('onRedraw');
        }
    };

    /* ******* MAIN ******* */

    that.redraw = function(triggerEvents){
        triggerEvents = typeof triggerEvents == 'undefined'? true : triggerEvents;
        redraw(triggerEvents);
        return that;
    };

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
            that.isEditing = true;
            cm.removeClass(that.nodes['headerContainer'], 'is-overlapping is-fixed');
            that.redraw();
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            if(that.params['header']['overlapping']){
                cm.addClass(that.nodes['headerContainer'], 'is-overlapping');
            }
            if(that.params['header']['fixed']){
                cm.addClass(that.nodes['headerContainer'], 'is-fixed');
            }
            that.redraw();
            that.triggerEvent('disableEditing');
        }
        return that;
    };

    that.scrollTo = function(num, duration){
        that.anim['scroll'].go({'style' : {'docScrollTop' : num}, 'duration' : duration, 'anim' : 'smooth'});
        return that;
    };

    that.scrollToTop = function(){
        that.scrollTo(0, that.params['scrollDuration']);
        return that;
    };

    that.scrollStop = function(){
        that.anim['scroll'].stop();
        return that;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
cm.define('App.TopMenu', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onCollapse',
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-topmenu',
        'target' : 'document.html'
    }
},
function(params){
    var that = this,
        eventInterval;

    that.nodes = {
        'container': cm.Node('div'),
        'inner': cm.Node('div'),
        'button': cm.Node('div'),
        'target': cm.Node('div'),
        'items' : {}
    };
    that.isExpanded = false;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        render();
        that.triggerEvent('onRender');
    };

    var render = function(){
        preventMenuBlinking();
        cm.addEvent(that.nodes['button'], 'click', that.toggle);
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        cm.addEvent(window, 'resize', preventMenuBlinking);
    };

    var preventMenuBlinking = function(){
        cm.addClass(that.nodes['container'], 'cm__transition-disable');
        eventInterval && clearTimeout(eventInterval);
        eventInterval = setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'cm__transition-disable');
        }, 5);
    };

    /* ******* MAIN ******* */

    that.expand = function(){
        if(!that.isExpanded){
            that.isExpanded = true;
            cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded');
            cm.replaceClass(that.params['target'], 'is-topmenu--collapsed', 'is-topmenu--expanded', true);
            that.triggerEvent('onExpand');
        }
        return that;
    };

    that.collapse = function(){
        if(that.isExpanded){
            that.isExpanded = false;
            cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed');
            cm.replaceClass(that.params['target'], 'is-topmenu--expanded', 'is-topmenu--collapsed', true);
            that.triggerEvent('onCollapse');
        }
        return that;
    };

    that.toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
        return that;
    };

    that.setActiveItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            cm.addClass(item['container'], 'active')
        }
        return that;
    };

    that.unsetActiveItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            cm.removeClass(item['container'], 'active')
        }
        return that;
    };

    that.getItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            return item;
        }
        return null;
    };

    that.getDimensions = function(key){
        var rect = cm.getRect(that.nodes['container']);
        return rect[key] || rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
cm.define('App.Zone', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'zone' : 0,
        'parentId' : 0,
        'layerId' : 0,
        'type' : 'template-manager',            // template-manager | form-manager | mail | remove
        'link' : false,                         // {'parentId' : 0, 'layerId' : 0, type' : ''}
        'locked' : false,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isEditing = null;
    that.isRemoved = false;
    that.isActive = false;
    that.styleObject = null;
    that.offsets = null;
    that.dimensions = null;

    that.components = {};
    that.node = null;
    that.block = null;
    that.dummyBlocks = [];
    that.blocks = [];

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        if(that.params['link']){
            that.params['linkName'] = [that.params['link']['type'], that.params['link']['layerId'], that.params['link']['parentId'], that.params['zone']].join('_');
            that.params['blockName'] = [that.params['link']['type'], that.params['link']['layerId'], that.params['link']['parentId']].join('_');
        }else{
            that.params['blockName'] = [that.params['type'], that.params['layerId'], that.params['parentId']].join('_');
        }
        that.params['name'] = [that.params['type'], that.params['layerId'], that.params['parentId'], that.params['zone']].join('_');
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions();
        // Init zone
        cm.addClass(that.node, 'app__zone');
        cm.addClass(that.node, ['is', that.params['type']].join('-'));
        if(that.params['locked']){
            cm.addClass(that.node, 'is-locked');
        }else{
            cm.addClass(that.node, 'is-available');
        }
        // Construct
        new cm.Finder('App.Block', that.params['blockName'], null, constructBlock);
        new cm.Finder('App.Editor', that.params['editorName'], null, constructEditor, {'event' : 'onProcessStart'});
    };

    var constructBlock = function(classObject){
        if(classObject){
            that.block = classObject
                .addZone(that);
        }
    };

    var destructBlock = function(classObject){
        if(classObject){
            that.block = classObject
                .removeZone(that);
            that.block = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .addZone(that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject
                .removeZone(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.node, 'is-editing', true);
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editable', true);
            }
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing', true);
            if(!that.params['locked']){
                cm.removeClass(that.node, 'is-editable', true);
            }
        }
        return that;
    };

    that.addBlock = function(block, index){
        if(block.isDummy){
            if(typeof index != 'undefined' && cm.isNumber(index)){
                that.dummyBlocks[index] = block;
            }else{
                that.dummyBlocks.push(block);
            }
        }else{
            if(typeof index != 'undefined' && cm.isNumber(index)){
                that.blocks.splice(index, 0, block);
            }else{
                that.blocks.push(block);
            }
        }
        return that;
    };

    that.removeBlock = function(block){
        if(block.isDummy){
            cm.arrayRemove(that.dummyBlocks, block);
        }else{
            cm.arrayRemove(that.blocks, block);
        }
        return that;
    };

    that.getBlockIndex = function(block){
        if(block.isDummy){
            return that.dummyBlocks.indexOf(block);
        }else{
            return that.blocks.indexOf(block);
        }
    };

    that.getBlock = function(index){
        return that.blocks[index];
    };

    that.highlight = function(){
        if(!that.params['locked']){
            cm.addClass(that.node, 'is-highlight');
        }
        return that;
    };

    that.unhighlight = function(){
        if(!that.params['locked']){
            cm.removeClass(that.node, 'is-highlight');
        }
        return that;
    };

    that.active = function(){
        if(!that.params['locked']){
            that.isActive = true;
            cm.addClass(that.node, 'is-active');
        }
        return that;
    };

    that.unactive = function(){
        if(!that.params['locked']){
            that.isActive = false;
            cm.removeClass(that.node, 'is-active');
        }
        return that;
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructBlock(that.block);
            destructEditor(that.components['editor']);
            while(that.blocks.length){
                that.blocks[0].remove();
            }
            that.removeFromStack();
            cm.remove(that.params['node']);
            that.triggerEvent('onRemove');
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

cm.define('App.ModuleHiddenTabs', {
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
        'onTabShow',
        'onTabHide',
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'event' : 'hover',              // hover | click
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay',
        'isEditing' : false,
        'customEvents' : true,
        'Com.TabsetHelper' : {

        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div'),
        'inner' : cm.node('div'),
        'menu-label' : cm.node('div'),
        'labels' : [],
        'options' : [],
        'tabs' : []
    };
    that.components = {};

    that.isEditing = null;
    that.isProcessing = false;
    that.hideInterval = null;
    that.changeInterval = null;

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var getCSSHelpers = function(){
        that.params['duration'] = cm.getTransitionDurationFromRule('.app-mod__hidden-tabs__duration') || that.params['duration'];
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['targetEvent'] = that.params['event'];
    };

    var render = function(){
        // Process Tabset
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper'])
                .addEvent('onTabHide', function(tabset, data){
                    that.triggerEvent('onTabHide', data);
                })
                .addEvent('onTabShowStart', function(tabset, data){
                    if(!that.isProcessing){
                        that.nodes['content-list'].style.overflow = 'hidden';
                        that.nodes['content-list'].style.height = that.nodes['content-list'].offsetHeight + 'px';
                    }
                    that.isProcessing = true;
                    that.changeInterval && clearTimeout(that.changeInterval);
                    that.changeInterval = setTimeout(function(){
                        that.isProcessing = false;
                        that.nodes['content-list'].style.height = 'auto';
                        that.nodes['content-list'].style.overflow = 'visible';
                    }, that.params['duration']);
                })
                .addEvent('onTabShow', function(tabset, data){
                    that.nodes['content-list'].style.height = data['item']['tab']['container'].offsetHeight + 'px';
                    that.nodes['menu-label'].innerHTML = data['item']['title'];
                    that.triggerEvent('onTabShow', data);
                })
                .addEvent('onLabelTarget', function(tabset, data){
                    show();
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels']);
        });
        // Mobile menu
        cm.forEach(that.nodes['options'], function(item){
            var config = that.getNodeDataConfig(item['container']);
            cm.addEvent(item['container'], 'click', function(){
                that.components['tabset'].set(config['id']);
                show();
            });
        });
        // Target events
        if(that.params['event'] == 'hover'){
            cm.addEvent(that.nodes['container'], 'mouseover', function(e){
                show();
            });
            cm.addEvent(that.nodes['container'], 'mouseout', function(e){
                var target = cm.getRelatedTarget(e);
                if(!cm.isParent(that.nodes['container'], target, true)){
                    !that.isEditing && hide();
                }
            });
        }
        cm.addEvent(window, 'click', function(e){
            var target = cm.getEventTarget(e);
            if(!cm.isParent(that.nodes['container'], target, true)){
                !that.isEditing && hide();
            }else{
                show();
            }
        });
        // Add custom event
        if(that.params['customEvents']){
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
        // Editing
        that.params['isEditing'] && that.enableEditing();
    };

    var hide = function(){
        that.hideInterval && clearTimeout(that.hideInterval);
        that.hideInterval = setTimeout(function(){
            cm.removeClass(that.nodes['content'], 'is-show');
            that.nodes['menu-label'].innerHTML = '';
            that.hideInterval = setTimeout(function(){
                that.components['tabset'].unset();
            }, that.params['delay']);
        }, that.params['delay']);
    };

    var show = function(){
        if(that.components['tabset'].current){
            that.hideInterval && clearTimeout(that.hideInterval);
            cm.addClass(that.nodes['content'], 'is-show', true);
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing is-editable');
            that.components['tabset'].setByIndex(0);
            show();
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable');
            hide();
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    that.redraw = function(){
        return that;
    };

    init();
});
cm.define('Module.Menu', {
    'modules' : [
        'Params',
        'DataNodes'
    ],
    'params' : {
        'node' : cm.Node('div')
    }
},
function(params){
    var that = this;

    that.nodes = {
        'select' : cm.Node('select')
    };

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        render();
    };

    var render = function(){
        cm.addEvent(that.nodes['select'], 'change', toggle);
    };

    var toggle = function(){
        var value = that.nodes['select'].value;
        if(!cm.isEmpty(value)){
            window.location.href = value;
        }
    };

    /* *** MAIN *** */

    init();
});