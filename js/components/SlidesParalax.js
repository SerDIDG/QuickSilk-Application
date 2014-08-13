App['SlidesParallax'] = function(o){
    var that = this,
        config = cm.merge({
            'node' : cm.Node('div'),
            'nodesMarker' : 'TplSlides',
            'configMarker' : 'data-config',
            'moveRatio' : 1.3,
            'nodes' : {},
            'events' : {},
            'langs' : {}
        }, o),
        API = {
            'onRender' : []
        },
        nodes = {
            'items' : []
        },
        items = [],
        isMobile,
        isWorked;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        convertEvents(config['events']);
        getNodes(config['node'], config['nodesMarker']);
        getConfig(config['node'], config['configMarker']);
        render();
    };

    var render = function(){
        // Check device type
        checkDeviceType();
        // Process items
        processItems();
        // Add window scroll event
        if(!isMobile){
            start();
        }
        // Add resize handler
        cm.addEvent(window, 'resize', onWindowResize);
        // API onRender event
        executeEvent('onRender', {});
    };

    var start = function(){
        isWorked = true;
        // Get slides offset
        getItemsDimention();
        setBackgroundPosition();
        cm.addEvent(window, 'scroll', onWindowScroll);
    };

    var stop = function(){
        isWorked = false;
        cm.removeEvent(window, 'scroll', onWindowScroll);
        cm.forEach(items, function(item){
            item['image'].style.backgroundPosition = '0 0';
        });
    };

    var processItems = function(){
        cm.forEach(nodes['items'], processItem);
    };

    var processItem = function(item){
        item = cm.merge({
            'offsetY1' : 0,
            'offsetY2' : 0,
            'height' : 0,
            'config' : {
                'startY' : 0
            }
        }, item);
        // Get item config
        var sourceConfig = item['image'].getAttribute('data-config');
        if(sourceConfig){
            item['config'] = cm.merge(item['config'], JSON.parse(sourceConfig));
        }
        // Push to items array
        items.push(item);
    };

    var getItemsDimention = function(){
        cm.forEach(items, function(item){
            item['offsetY1'] = cm.getY(item['container']);
            item['height'] = item['container'].offsetHeight;
            item['offsetY2'] = item['offsetY1'] + item['height'];
        });
    };

    var setBackgroundPosition = function(){
        var scrollY1 = cm.getBodyScrollTop(),
            screenHeight = cm.getPageSize('winHeight'),
            scrollY2 = scrollY1 + screenHeight,
            bgY = 0;
        cm.forEach(items, function(item){
            if(item['offsetY1'] <= scrollY2 && item['offsetY2'] >= scrollY1){
                bgY = Math.round((scrollY1 - item['offsetY1']) / config['moveRatio']) - parseInt(item['config']['startY']);
                item['image'].style.backgroundPosition = ['0 ', bgY, 'px'].join('');
            }
        });
    };

    var onWindowScroll = (function(){
        return setBackgroundPosition;
        /*
        if(Com.UA.is('IE') || Com.UA.is('FF')){
            return setBackgroundPosition;
        }else{
            return function(){
                setTimeout(setBackgroundPosition,1);
            }
        }
        */
    })();

    var onWindowResize = function(){
        // Check device type
        checkDeviceType();
        // Start or stop
        if(!isMobile && !isWorked){
            start();
        }
        if(isMobile && isWorked){
            stop();
        }
    };

    var checkDeviceType = function(){
        isMobile = cm.getPageSize('width') <= config['mobileScreen'];
    };

    /* *** MISC FUNCTIONS *** */

    var convertEvents = function(o){
        cm.forEach(o, function(item, key){
            if(API[key] && typeof item == 'function'){
                API[key].push(item);
            }
        });
    };

    var getNodes = function(container, marker){
        if(container){
            var sourceNodes = {};
            if(marker){
                sourceNodes = cm.getNodes(container)[marker] || {};
            }else{
                sourceNodes = cm.getNodes(container);
            }
            nodes = cm.merge(nodes, sourceNodes);
        }
        nodes = cm.merge(nodes, config['nodes']);
    };

    var getConfig = function(container, marker){
        if(container){
            marker = marker || 'data-config';
            var sourceConfig = container.getAttribute(marker);
            if(sourceConfig){
                config = cm.merge(config, JSON.parse(sourceConfig));
            }
        }
    };

    var lang = function(str){
        if(!config['langs'][str]){
            config['langs'][str] = str;
        }
        return config['langs'][str];
    };

    var executeEvent = function(event, params){
        API[event].forEach(function(item){
            item(that, params || {});
        });
    };

    /* ******* MAIN ******* */

    that.addEvent = function(event, handler){
        if(API[event] && typeof handler == 'function'){
            API[event].push(handler);
        }
        return that;
    };

    that.removeEvent = function(event, handler){
        if(API[event] && typeof handler == 'function'){
            API[event] = API[event].filter(function(item){
                return item != handler;
            });
        }
        return that;
    };

    init();
};