cm.define('App.Dashboard', {
    'modules' : [
        'Params',
        'Events'
    ],
    'events' : [
        'onRender',
        'onInit',
        'onDragStart',
        'onDrop',
        'onRemove',
        'onReplace'
    ],
    'params' : {
        'draggableContainer' : 'document.body',
        'scroll' : true,
        'scrollNode' : window,
        'scrollSpeed' : 1,                           // ms per 1px
        'useGracefulDegradation' : true,
        'dropDuration' : 400,
        'moveDuration' : 200,
        'highlightZones' : true,                     // highlight zones on drag start
        'highlightPlaceholders' : true,
        'animateRemove' : true,
        'removeNode' : true
    }
},
function(params){
    var that = this,
        anims = {},
        zones = [],
        zonesList = [],
        blockList = [],
        filteredAvailablezones = [],
        checkInt,
        placeholderInt,
        pageSize,
        isScrollProccess = false,

        current,
        currentAboveItem,
        currentPosition,
        currentZone,
        currentPlaceholder,
        previousZone;

    that.isGracefulDegradation = false;
    that.isZonesHighlight = false;
    that.pageSize = {};
    that.offset = {
        'left' : 0,
        'top' : 0
    };

    that.blocks = [];
    that.dummyBlocks = [];
    that.zones = [];

    that.currentZones = [];
    that.currentZone = null;
    that.currentBlock = null;

    /* *** INIT *** */

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        validateParams();
        render();
        that.triggerEvent('onRender');
    };

    var getCSSHelpers = function(){
        that.params['dropDuration'] = cm.getTransitionDurationFromRule('.app__dashboard__drop-duration');
        that.params['moveDuration'] = cm.getTransitionDurationFromRule('.app__dashboard__move-duration');
    };

    var validateParams = function(){
        // Check Graceful Degradation, and turn it to mobile and old ie.
        if(that.params['useGracefulDegradation'] && ((cm.is('IE') && cm.isVersion() < 9) || cm.isMobile())){
            that.isGracefulDegradation = true;
        }
    };

    var render = function(){
        anims['scroll'] = new cm.Animation(that.params['scrollNode']);
    };

    /* *** DRAG AND DROP PROCESS ** */

    var start = function(e, block){
        cm.preventDefault(e);
        // Prevent multiple drag event
        if(that.currentBlock){
            return;
        }
        // Prevent drag event not on LMB
        if(!cm.isTouch && e.button){
            return;
        }
        // Hide IFRAMES and EMBED tags
        cm.hideSpecialTags();
        cm.addClass(document.body, 'app__dashboard__body');
        that.pageSize = cm.getPageSize();
        // Get pointer position
        var params = {
            'left' : cm._clientPosition['x'],
            'top' : cm._clientPosition['y']
        };
        // Check event type and get cursor / finger position
        var tempCurrentAboveItem,
            tempCurrentPosition;
        // Filter zones
        that.currentZones = getDroppableZones(block);
        // API onDragStart Event
        that.triggerEvent('onDragStart', {
            'item' : block,
            'node' : block.node,
            'from' : block.zone
        });
        // Prepare widget, get offset, set start position, set widget as current
        prepareBlock(block, params);
        // Highlight zones
        if(that.params['highlightZones']){
            toggleZonesHighlight();
        }
        // Calculate elements position and dimension
        getPositionsAll();
        // Render Placeholder Blocks
        renderPlaceholderBlocks();
        // Find above block item
        cm.forEach(that.currentBlock.zone.blocks, function(block){
            if(x >= block['dimensions']['absoluteX1'] && x < block['dimensions']['absoluteX2'] && y >= block['dimensions']['absoluteY1'] && y <= block['dimensions']['absoluteY2']){
                tempCurrentAboveItem = block;
                // Check above block position
                if((y - tempCurrentAboveItem['dimensions']['absoluteY1']) < (tempCurrentAboveItem['dimensions']['absoluteHeight'] / 2)){
                    tempCurrentPosition = 'top';
                }else{
                    tempCurrentPosition = 'bottom';
                }
            }
        });
        // If current current block not above other block items
        if(!tempCurrentAboveItem && current['zone']['items'].length){
            if(y < current['zone']['dimensions']['y1']){
                tempCurrentAboveItem = current['zone']['items'][0];
                tempCurrentPosition = 'top';
            }else{
                tempCurrentAboveItem = current['zone']['items'][current['zone']['items'].length - 1];
                tempCurrentPosition = 'bottom';
            }
        }
        // Set placeholder
        if(tempCurrentAboveItem){
            currentPlaceholder = tempCurrentAboveItem['placeholder'][tempCurrentPosition];
        }else{
            currentPlaceholder = current['zone']['placeholder'][0];
        }
        if(currentPlaceholder){
            cm.addClass(currentPlaceholder['node'], 'is-active');
            if(that.params['highlightPlaceholders']){
                cm.addClass(currentPlaceholder['node'], 'is-highlight');
            }
            currentPlaceholder['node'].style.height = [current['dimensions']['absoluteHeight'], 'px'].join('');
        }
        // Set current zone and above
        that.currentZone = current['zone'];
        currentAboveItem = tempCurrentAboveItem;
        currentPosition = tempCurrentPosition;
        that.currentZone.active();
        // Add move event on document
        cm.addEvent(window, 'mousemove', move);
        cm.addEvent(window, 'mouseup', stop);
    };

    var move = function(e){
        cm.preventDefault(e);
        // Check event type and get cursor / finger position
        var x = cm._clientPosition['x'],
            y = cm._clientPosition['y'],
            posY = y - current['dimensions']['offsetY'],
            posX = x - current['dimensions']['offsetX'],
            styleX,
            styleY,
            tempCurrentzone,
            tempCurrentAboveItem,
            tempCurrentPosition;
        // Calculate drag direction and set new position
        styleX = [posX, 'px'].join('');
        styleY = [posY, 'px'].join('');
        cm.setCSSTranslate(current['node'], styleX, styleY);
        // Scroll node
        if(that.params['scroll']){
        //if(false){
            if(y + 48 > that.pageSize['winHeight']){
                toggleScroll(1);
            }else if(y - 48 < 0){
                toggleScroll(-1);
            }else{
                toggleScroll(0);
            }
        }
        // Check and recalculate position
        checkPosition();
        // Find above zone
        cm.forEach(filteredAvailablezones, function(zone){
            if(x >= zone['dimensions']['x1'] && x < zone['dimensions']['x2'] && y >= zone['dimensions']['y1'] && y <= zone['dimensions']['y2']){
                if(!tempCurrentzone){
                    tempCurrentzone = zone;
                }else if(zone['dimensions']['width'] < tempCurrentzone['dimensions']['width'] || zone['dimensions']['height'] < tempCurrentzone['dimensions']['height']){
                    tempCurrentzone = zone;
                }
            }
        });
        // Find above block item
        if(tempCurrentzone){
            cm.forEach(tempCurrentzone['items'], function(block){
                if(x >= block['dimensions']['absoluteX1'] && x < block['dimensions']['absoluteX2'] && y >= block['dimensions']['absoluteY1'] && y <= block['dimensions']['absoluteY2']){
                    tempCurrentAboveItem = block;
                    // Check above block position
                    if((y - tempCurrentAboveItem['dimensions']['absoluteY1']) < (tempCurrentAboveItem['dimensions']['absoluteHeight'] / 2)){
                        tempCurrentPosition = 'top';
                    }else{
                        tempCurrentPosition = 'bottom';
                    }
                }
            });
        }else{
            tempCurrentzone = currentZone;
        }
        // If current current block not above other block items
        if(!tempCurrentAboveItem && tempCurrentzone['items'].length){
            if(y < tempCurrentzone['dimensions']['innerY1']){
                tempCurrentAboveItem = tempCurrentzone['items'][0];
                tempCurrentPosition = 'top';
            }else{
                tempCurrentAboveItem = tempCurrentzone['items'][tempCurrentzone['items'].length - 1];
                tempCurrentPosition = 'bottom';
            }
        }
        // Animate previous placeholder and get current
        if(currentPlaceholder){
            cm.removeClass(currentPlaceholder['node'], 'is-active is-highlight');
        }
        if(currentAboveItem && tempCurrentAboveItem && currentAboveItem['placeholder'][currentPosition] != tempCurrentAboveItem['placeholder'][tempCurrentPosition]){
            animatePlaceholder(currentAboveItem['placeholder'][currentPosition], 0, that.params['moveDuration']);
            currentPlaceholder = tempCurrentAboveItem['placeholder'][tempCurrentPosition];
        }else if(!currentAboveItem && tempCurrentAboveItem){
            animatePlaceholder(currentZone['placeholder'][0], 0, that.params['moveDuration']);
            currentPlaceholder = tempCurrentAboveItem['placeholder'][tempCurrentPosition];
        }else if(currentAboveItem && !tempCurrentAboveItem){
            animatePlaceholder(currentAboveItem['placeholder'][currentPosition], 0, that.params['moveDuration']);
            currentPlaceholder = tempCurrentzone['placeholder'][0];
        }else if(!currentAboveItem && !tempCurrentAboveItem && currentZone != tempCurrentzone){
            animatePlaceholder(currentZone['placeholder'][0], 0, that.params['moveDuration']);
            currentPlaceholder = tempCurrentzone['placeholder'][0];
        }
        // Animate current placeholder
        if(currentPlaceholder){
            cm.addClass(currentPlaceholder['node'], 'is-active');
            if(that.params['highlightPlaceholders']){
                cm.addClass(currentPlaceholder['node'], 'is-highlight');
            }
            animatePlaceholder(currentPlaceholder, current['dimensions']['absoluteHeight'], that.params['moveDuration']);
        }
        // Unset classname from previous active zone
        if(currentZone && currentZone != tempCurrentzone){
            cm.removeClass(currentZone['node'], 'is-active');
            previousZone = currentZone;
        }
        // Set current to global
        currentZone = tempCurrentzone;
        currentAboveItem = tempCurrentAboveItem;
        currentPosition = tempCurrentPosition;
        // Set active zone class name
        if(!(previousZone && previousZone['isTemporary'] && currentZone['isRemoveZone'])){
            cm.addClass(currentZone['node'], 'is-active');
        }
    };

    var stop = function(e){
        var currentHeight;
        // Remove check position event
        //checkInt && clearInterval(checkInt);
        // Remove move events attached on document
        cm.removeClass(document.body, 'pt__dnd-body');
        cm.removeEvent(window, 'mousemove', move);
        cm.removeEvent(window, 'mouseup', stop);
        // Calculate height of block block, like he already dropped in zone, to animate height of fake empty space
        getPosition(current);
        current['node'].style.width = [(currentZone['dimensions']['innerWidth'] - current['dimensions']['margin']['left'] - current['dimensions']['margin']['right']), 'px'].join('');
        currentHeight = current['node'].offsetHeight + current['dimensions']['margin']['top'] + current['dimensions']['margin']['bottom'];
        current['node'].style.width = [current['dimensions']['width'], 'px'].join('');
        // If current block located above another block item, drops after/before it, or drops in zone
        if(currentAboveItem){
            // Animate placeholder blocks
            if(currentHeight != currentAboveItem['placeholder'][currentPosition]['node'].offsetHeight){
                animatePlaceholder(currentAboveItem['placeholder'][currentPosition], currentHeight, that.params['dropDuration']);
            }
            // Drop Item to zone
            dropBlockToZone(current, currentZone, {
                'target' : currentAboveItem['node'],
                'append' : currentPosition == 'top' ? 'before' : 'after',
                'index' : currentZone['items'].indexOf(currentAboveItem) + (currentPosition == 'top' ? 0 : 1),
                'top' : [currentPosition == 'top'? currentAboveItem['dimensions']['absoluteY1'] : currentAboveItem['dimensions']['absoluteY2'], 'px'].join(''),
                'onStop' : unsetCurrentBlock
            });
        }else if(currentZone['isRemoveZone'] || currentZone['isTemporary']){
            removeBlock(current, {
                'onStop' : unsetCurrentBlock
            });
        }else{
            // Animate placeholder blocks
            animatePlaceholder(currentZone['placeholder'][0], currentHeight, that.params['dropDuration']);
            // Drop Item to zone
            dropBlockToZone(current, currentZone, {
                'onStop' : unsetCurrentBlock
            });
        }
        // Unset placeholder
        if(currentPlaceholder){
            cm.removeClass(currentPlaceholder['node'], 'is-active is-highlight');
        }
        // Unset active zone classname
        if(currentZone){
            cm.removeClass(currentZone['node'], 'is-active');
        }
        // Un Highlight zones
        if(that.params['highlightZones']){
            toggleZonesHighlight();
        }
        // Show IFRAMES and EMBED tags
        cm.showSpecialTags();
    };

    /* *** BLOCK *** */

    var initBlock = function(node, zone, params){
        // Config
        var block = cm.merge({
            'node' : node,
            'styleObject' : cm.getStyleObject(node),
            'type' : 'item',
            'placeholder' : {
                'top' : null,
                'bottom' : null
            },
            'dimensions' : {
                'offsetX' : 0,
                'offsetY' : 0
            }
        }, params);
        block['zone'] = zone;
        block['anim'] = new cm.Animation(block['node']);
        // Set block event on element
        initBlockDrag(block);
        // Return item to push in zone array
        blockList.push(block);
        return block;
    };

    var prepareBlock = function(block, params){
        block.updateDimensions();
        // Get offset using pointer position
        that.offset['left'] = block.dimensions['outer']['left'] - params['left'];
        that.offset['top'] = block.dimensions['outer']['top'] - params['top'];
        // Clone dummy block or unset area from block
        if(block.isDummy){
            that.currentBlock = block
                .clone();
        }else{
            that.currentBlock = block
                .unsetZone();
        }
        // Set widget start position
        that.currentBlock['node'].style.top = 0;
        that.currentBlock['node'].style.left = 0;
        moveBlock(that.currentBlock, {
            'left' : that.currentBlock.dimensions['outer']['left'],
            'top' : that.currentBlock.dimensions['outer']['top'],
            'width' : that.currentBlock.dimensions['offset']['width']
        });
        // Insert widget to body
        that.params['draggableContainer'].appendChild(that.currentBlock['node']);
        // Set helper classes
        cm.addClass(that.currentBlock['node'], 'app__dashboard__helper');
        cm.addClass(that.currentBlock['node'], 'is-active', true);
    };

    var moveBlock = function(block, params, offset){
        // Calculate
        var left = params['left'],
            top = params['top'],
            node = params['node'] || block['node'];
        if(offset){
            left += block.dimensions['offsetLeft'];
            top += block.dimensions['offsetTop'];
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


    var cloneBlock = function(block){
        var clonedNode = block['node'].cloneNode(true),
            zone = zones[0],
            clonedBlock = initBlock(clonedNode, zone, {});

        clonedBlock['dimensions'] = cm.clone(block['dimensions']);
        zone['items'].push(clonedBlock);
        return clonedBlock;
    };

    var dropBlockToZone = function(block, zone, params){
        params = cm.merge({
            'target' : zone['node'],
            'append' : 'child',
            'index' : 0,
            'width' : [zone['dimensions']['innerWidth'], 'px'].join(''),
            'top' : [zone['dimensions']['innerY1'] - block['dimensions']['margin']['top'], 'px'].join(''),
            'left' : [zone['dimensions']['innerX1'] - block['dimensions']['margin']['left'], 'px'].join(''),
            'onStart' : function(){},
            'onStop' : function(){}
        }, params);
        // System onStart event
        params['onStart']();
        // Animate block item, like it drops in zone
        cm.addClass(block['node'], 'is-drop', true);
        block['node'].style.width = params['width'];
        cm.setCSSTranslate(block['node'], params['left'], params['top']);
        // On Dnimate Stop
        setTimeout(function(){
            // Append element in new position
            switch(params['append']){
                case 'child' :
                    cm.appendChild(block['node'], params['target']);
                    break;
                case 'before' :
                    cm.insertBefore(block['node'], params['target']);
                    break;
                case 'after' :
                    cm.insertAfter(block['node'], params['target']);
                    break;
                case 'first' :
                    cm.insertFirst(block['node'], params['target']);
                    break;
            }
            // Remove block helper classname
            cm.removeClass(block['node'], 'pt__dnd-helper is-drop is-active', true);
            // Reset styles
            block['node'].style.left = 'auto';
            block['node'].style.top = 'auto';
            block['node'].style.width = 'auto';
            cm.setCSSTranslate(current['node'], 'auto', 'auto');
            // Set index of block item in new zone
            zone['items'].splice(params['index'], 0, block);
            // API onDrop Event
            that.triggerEvent('onDrop', {
                'item' : block,
                'node' : block['node'],
                'to' : zone,
                'from' : block['zone'],
                'index' : params['index']
            });
            // Set block new zone
            block['zone'] = zone;
            // System onStop event
            params['onStop']();
        }, that.params['dropDuration']);
    };

    var removeBlock = function(block, params){
        var style, anim, node;
        // Remove handler
        var handler = function(){
            if(that.params['removeNode']){
                cm.remove(node);
            }
            // Remove from block list
            blockList = blockList.filter(function(item){
                return item != block;
            });
            unsetBlockFromZone(block);
            // API onRemove Event
            if(!params['noEvent']){
                that.triggerEvent('onRemove', {
                    'item' : block,
                    'node' : block['node'],
                    'from' : block['zone']
                });
            }
            // System onStop event
            params['onStop']();
        };
        // Config
        params = cm.merge({
            'isCurrent' : block === current,
            'isInDOM' : cm.inDOM(block['node']),
            'onStart' : function(){},
            'onStop' : function(){}
        }, params);
        // System onStart event
        params['onStart']();
        // If block not in DOM, we don't need to wrap and animate it
        if(params['isInDOM'] && that.params['animateRemove']){
            // If block is current - just animate pull out left, else - wrap to removable node
            if(params['isCurrent']){
                node = block['node'];
                anim = block['anim'];
                style = {
                    'left' : [-(block['dimensions']['absoluteWidth'] + 50), 'px'].join(''),
                    'opacity' : 0
                }
            }else{
                node = cm.wrap(cm.Node('div', {'class' : 'pt__dnd-removable'}), block['node']);
                anim = new cm.Animation(node);
                style = {
                    'height' : '0px',
                    'opacity' : 0
                }
            }
            // Animate block, like it disappear
            anim.go({
                'duration' : that.params['dropDuration'],
                'anim' : 'smooth',
                'style' : style,
                'onStop' : handler
            });
        }else{
            node = block['node'];
            handler();
        }
    };

    var unsetBlockFromZone = function(block){
        block['zone']['items'] = block['zone']['items'].filter(function(item){
            return item != block;
        });
    };

    var unsetCurrentBlock = function(){
        // Remove placeholder blocks
        removePlaceholderBlocks();
        // Reset other
        current = false;
        currentAboveItem = false;
        currentZone = false;
        previousZone = false;
    };

    /* *** PLACEHOLDER *** */

    var renderPlaceholderBlocks = function(){
        var placeholder;
        cm.forEach(zones, function(zone){
            if(zone['isLocked']){
                return;
            }

            if(!zone['items'].length){
                placeholder = renderPlaceholder();
                cm.appendChild(placeholder['node'], zone['node']);
                zone['placeholder'].push(placeholder);
            }
            cm.forEach(zone['items'], function(block, i){
                if(i === 0){
                    placeholder = renderPlaceholder();
                    cm.insertBefore(placeholder['node'], block['node']);
                    zone['placeholder'].push(placeholder);
                }
                placeholder = renderPlaceholder();
                cm.insertAfter(placeholder['node'], block['node']);
                zone['placeholder'].push(placeholder);
                // Associate with block
                block['placeholder']['top'] = zone['placeholder'][i];
                block['placeholder']['bottom'] = zone['placeholder'][i + 1];
            });
        });
    };

    var renderPlaceholder = function(){
        var node = cm.Node('div', {'class' : 'pt__dnd-placeholder'});
        return {
            'node' : node,
            'anim' : new cm.Animation(node),
            'isShow' : false
        };
    };

    var removePlaceholderBlocks = function(){
        cm.forEach(zones, function(zone){
            cm.forEach(zone['placeholder'], function(placeholder){
                cm.remove(placeholder['node']);
            });
            zone['placeholder'] = [];
        });
    };

    var animatePlaceholder = function(placeholder, height, duration) {
        var style;
        height = [height, 'px'].join('');
        if(!that.isGracefulDegradation && (style = cm.getSupportedStyle('transition-duration'))){
            placeholder['node'].style[style] = [duration, 'ms'].join('');
        }
        placeholder['node'].style.height = height;
    };

    /* *** POSITION CALCULATION FUNCTIONS *** */

    var getPosition = function(item){
        item['dimensions'] = cm.extend(item['dimensions'], cm.getFullRect(item['node'], item['styleObject']));
    };

    var getPositions = function(arr){
        cm.forEach(arr, getPosition);
    };

    var getPositionsAll = function(){
        getPositions(zones);
        cm.forEach(zones, function(zone){
            getPositions(zone['items']);
        });
    };

    var recalculatePosition = function(item){
        //item['dimensions']['x1'] = cm.getRealX(item['node']);
        item['dimensions']['y1'] = cm.getRealY(item['node']);
        //item['dimensions']['x2'] = item['dimensions']['x1'] + item['dimensions']['width'];
        item['dimensions']['y2'] = item['dimensions']['y1'] + item['dimensions']['height'];

        //item['dimensions']['innerX1'] = item['dimensions']['x1'] + item['dimensions']['padding']['left'];
        item['dimensions']['innerY1'] = item['dimensions']['y1'] + item['dimensions']['padding']['top'];
        //item['dimensions']['innerX2'] = item['dimensions']['innerX1'] + item['dimensions']['innerWidth'];
        item['dimensions']['innerY2'] = item['dimensions']['innerY1'] + item['dimensions']['innerHeight'];

        //item['dimensions']['absoluteX1'] = item['dimensions']['x1'] - item['dimensions']['margin']['left'];
        item['dimensions']['absoluteY1'] = item['dimensions']['y1'] - item['dimensions']['margin']['top'];
        //item['dimensions']['absoluteX2'] = item['dimensions']['x2'] + item['dimensions']['margin']['right'];
        item['dimensions']['absoluteY2'] = item['dimensions']['y2'] + item['dimensions']['margin']['bottom'];
    };

    var recalculatePositions = function(arr){
        cm.forEach(arr, recalculatePosition);
    };

    var recalculatePositionsAll = function(){
        var placeholderHeight = 0;
        // Reset current active placeholder height, cause we need to calculate clear positions
        if(currentPlaceholder){
            cm.addClass(currentPlaceholder['node'], 'is-immediately');
            placeholderHeight = currentPlaceholder['node'].offsetHeight;
            currentPlaceholder['node'].style.height = 0;
        }
        recalculatePositions(zones);
        cm.forEach(zones, function(zone){
            recalculatePositions(zone['items']);
        });
        // Restoring placeholder height after calculation
        if(currentPlaceholder && placeholderHeight){
            currentPlaceholder['node'].style.height = [placeholderHeight, 'px'].join('');
            (function(currentPlaceholder){
                setTimeout(function(){
                    cm.removeClass(currentPlaceholder['node'], 'is-immediately');
                }, 5);
            })(currentPlaceholder);
        }
    };

    var checkPosition = function(){
        var filteredZones = getFilteredZones();
        if(filteredZones[0]['dimensions']['y1'] != cm.getRealY(filteredZones[0]['node'])){
            recalculatePositionsAll();
        }
    };

    /* *** ZONE *** */

    var initZone = function(item){
        that.zones.push(item);
    };

    var getFilteredZones = function(){
        return zones.filter(function(zone){
            // Filter out locked zones and inner zones
            if(zone['isTemporary'] || zone['isSystem']){
                return false;
            }
            // True - pass zone
            return true;
        });
    };

    var toggleZonesHighlight = function(){
        if(that.currentZones){
            if(that.isZonesHighlight){
                that.isZonesHighlight = false;
                cm.forEach(that.currentZones, function(zone){
                    zone.unhighlight();
                });
            }else{
                that.isZonesHighlight = true;
                cm.forEach(that.currentZones, function(zone){
                    zone.highlight();
                });
            }
        }
    };

    var getDroppableZones = function(block){
        return that.zones.filter(function(zone){
            if(cm.isParent(block.params['node'], zone.params['node']) || zone.params['locked'] || block.params['type'] != zone.params['type']){
                return false;
            }
            return true;
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

    var toggleScroll = function(speed){
        var scrollRemaining,
            duration,
            styles = {};

        if(speed == 0){
            isScrollProccess = false;
            anims['scroll'].stop();
        }else if(speed < 0 && !isScrollProccess){
            isScrollProccess = true;
            duration = cm.getScrollTop(that.params['scrollNode']) * that.params['scrollSpeed'];
            if(cm.isWindow(that.params['scrollNode'])){
                styles['docScrollTop'] = 0;
            }else{
                styles['scrollTop'] = 0;
            }
            anims['scroll'].go({'style' : styles, 'duration' : duration, 'onStop' : function(){
                isScrollProccess = false;
                //getPositionsAll();
                //recalculatePositionsAll();
            }});
        }else if(speed > 0 && !isScrollProccess){
            isScrollProccess = true;
            scrollRemaining = cm.getScrollHeight(that.params['scrollNode']) - that.pageSize['winHeight'];
            if(cm.isWindow(that.params['scrollNode'])){
                styles['docScrollTop'] = scrollRemaining;
            }else{
                styles['scrollTop'] = scrollRemaining;
            }
            duration = scrollRemaining * that.params['scrollSpeed'];
            anims['scroll'].go({'style' : styles, 'duration' : duration, 'onStop' : function(){
                isScrollProccess = false;
                //getPositionsAll();
                //recalculatePositionsAll();
            }});
        }
    };

    /* ******* MAIN ******* */

    that.addBlock = function(item){
        initBlock(item);
        return that;
    };

    that.addDummyBlock = function(item){
        initDummyBlock(item);
        return that;
    };

    that.addZone = function(item){
        initZone(item);
        return that;
    };



    that.getZone = function(node){
        var zone;
        cm.forEach(zones, function(item){
            if(item['node'] === node){
                zone = item;
            }
        });
        return zone;
    };

    that.registerZone = function(node, params){
        if(cm.isNode(node) && node.tagName){
            initZone(node, params || {});
        }
        return that;
    };

    that.removeZone = function(node, params){
        if(cm.isNode(node) && cm.inArray(zonesList, node)){
            zonesList = zonesList.filter(function(zone){
                return zone != node;
            });
            zones = zones.filter(function(zone){
                return zone['node'] != node;
            });
        }
        return that;
    };

    that.getBlock = function(node){
        var block;
        cm.forEach(blockList, function(item){
            if(item['node'] === node){
                block = item;
            }
        });
        return block;
    };

    that.getBlockList = function(){
        return blockList;
    };

    that.registerBlock = function(node, zoneNode, params){
        var block, zone, newBlock, index, childNodes, blockNodes = [];
        // Find block item by node
        block = that.getBlock(node);
        // If block already exists - reinit it, else - init like new block item
        if(block){
            initBlockDrag(block);
        }else if(cm.inArray(zonesList, zoneNode)){
            node.setAttribute('data-com-draganddrop', 'block');
            // Fins zone item by node
            zone = that.getzone(zoneNode);
            // Find block index
            if(zone['blockInChildNodes']){
                childNodes = zone['node'].childNodes;
                cm.forEach(childNodes, function(node){
                    if(node.tagName && node.getAttribute('data-com-draganddrop') == 'block'){
                        blockNodes.push(node);
                    }
                });
            }else{
                blockNodes = cm.getByAttr('data-com-draganddrop', 'block', zone['node']);
            }
            index = blockNodes.indexOf(node);
            // Register block
            newBlock = initBlock(node, zone, params || {});
            zone['items'].splice(index, 0, newBlock);
        }
        return that;
    };

    that.replaceBlock = function(oldBlockNode, newBlockNode, params){
        var oldBlock,
            newBlock;
        // Find block item
        cm.forEach(blockList, function(item){
            if(item['node'] === oldBlockNode){
                oldBlock = item;
            }
        });
        if(oldBlock){
            // Find old block zone and index in zone
            var zone = oldBlock['zone'],
                index = zone['items'].indexOf(oldBlock),
                node = cm.wrap(cm.Node('div', {'class' : 'pt__dnd-removable', 'style' : 'height: 0px;'}), newBlockNode),
                anim = new cm.Animation(node);
            // Append new block into DOM
            cm.insertAfter(node, oldBlockNode);
            // Remove old block
            removeBlock(oldBlock, params);
            // Animate new block
            anim.go({'style' : {'height' : [cm.getRealHeight(node, 'offset', 0), 'px'].join(''), 'opacity' : 1}, 'duration' : 300, 'anim' : 'simple', 'onStop' : function(){
                cm.insertAfter(newBlockNode, node);
                cm.remove(node);
                // Register new block
                newBlock = initBlock(newBlockNode, zone);
                zone['items'].splice(index, 0, newBlock);
                // API onEmbed event
                that.triggerEvent('onReplace', {
                    'item' : newBlock,
                    'node' : newBlock['node'],
                    'to' : newBlock['to']
                });
            }});
        }
        return that;
    };

    that.removeBlock = function(node, params){
        var block;
        // Find block item
        cm.forEach(blockList, function(item){
            if(item['node'] === node){
                block = item;
            }
        });
        if(block){
            // Remove
            removeBlock(block, params || {});
        }
        return that;
    };

    that.getOrderingNodes = function(){
        var results = [],
            arr,
            filteredZones = getFilteredZones();
        // Build array
        cm.forEach(filteredZones, function(zone){
            arr = {
                'zone' : zone['node'],
                'items' : []
            };
            cm.forEach(zone['items'], function(item){
                arr['items'].push(item['node']);
            });
            results.push(arr);
        });
        return filteredZones.length == 1 ? arr['items'] : results;
    };

    that.getOrderingIDs = function(){
        var results = {},
            arr,
            filteredZones = getFilteredZones();
        // Build array
        cm.forEach(filteredZones, function(zone){
            arr = {};
            cm.forEach(zone['items'], function(item, i){
                if(!item['id']){
                    throw new Error('Attribute "data-id" not specified on item node.');
                }
                arr[item['id']] = i;
            });
            results[zone['id']] = arr;
        });
        return filteredZones.length == 1 ? arr : results;
    };
    
    init();
});