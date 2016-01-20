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
            'index' : 0,
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
        // Render temporary node
        temporaryNode = cm.node('div');
        temporaryNode.style.height = 0;
        if(params.block){
            node.setAttribute('data-index', params.index.toString());
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
            'index' : 0,
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
        // Temporary node
        temporaryNode = cm.node('div');
        if(params.block){
            node.setAttribute('data-index', params.index.toString());
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
                    params['left'] >= block.dimensions['outer']['left']
                    && params['left'] < block.dimensions['outer']['right']
                    && params['top'] >= block.dimensions['outer']['top']
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