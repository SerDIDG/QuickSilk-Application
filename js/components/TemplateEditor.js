App['TemplateEditor'] = function(o){
    var that = this,
        config = cm.merge({
            'node' : cm.Node('div'),
            'events' : {},
            'nodes' : {},
            'Com.Draganddrop' : {
                'renderTemporaryAria' : true
            }
        }, o),
        API = {
            'onDrop' : [],
            'onAppend' : [],
            'onRemove' : [],
            'onEmbed' : [],
            'onReplace' : []
        },
        nodes = {
            'AppNodes' : {
                'wrapperCollapsible' : cm.Node('div'),
                'scroll' : cm.Node('div')
            },
            'AppWidgetsPanel' : {
                'container' : cm.Node('div'),
                'removeZone' : cm.Node('div'),
                'widgetsContainer' : cm.Node('div'),
                'widgets' : []
            },
            'Template' : {
                'container' : cm.Node('div'),
                'scroll' : cm.Node('div')
            }
        },
        coms = {},
        components;

    /* *** INIT *** */

    var init = function(){
        // Init collector
        components = new Com.Collector();
        // Convert events to API
        convertEvents(config['events']);
        // Collect nodes
        getNodes(config['node']);
        // Process panel widgets
        processPanelWidgets();
        // Drag & Drop
        initDragAndDrop();
        // Construct components
        components.construct();
    };
    
    var renderLoaderBox = function(){
        var node;
        node = cm.Node('div', {'class' : 'cm-loader-box position'},
            cm.Node('div', {'class' : 'inner'})
        );
        return node;
    };

    var processPanelWidgets = function(){
        cm.forEach(nodes['AppWidgetsPanel']['widgets'], function(item){
            item['container'].setAttribute('data-com-draganddrop', 'draggable');
            item['dummy'].setAttribute('data-com-draganddrop', 'drag');
        });
    };

    var initDragAndDrop = function(){
        coms['dd'] = new Com.Draganddrop(
            cm.merge({
                'container' : nodes['Template']['container'],
                'scrollNode' : nodes['Template']['scroll'],
                'draggableContainer' : nodes['AppNodes']['wrapperCollapsible']
            }, config['Com.Draganddrop'])
        );
        // Register widgets areas and events
        coms['dd']
            .registerArea(nodes['AppWidgetsPanel']['widgetsContainer'], {
                'isLocked' : true,
                'isSystem' : true,
                'hasPadding' : false,
                'draggableInChildNodes' : false,
                'cloneDraggable' : true
            })
            .registerArea(nodes['AppWidgetsPanel']['removeZone'], {
                'isSystem' : true,
                'isRemoveZone': true,
                'hasPadding' : false
            })
            .addEvent('onDrop', onDrop)
            .addEvent('onReplace', onReplace)
            .addEvent('onRemove', onRemove);
    };

    /* *** DROP EVENTS *** */

    var onDrop = function(dd, widget){
        if(widget['from']['isTemporary']){
            widget['dummy'] = widget['item']['drag'];
            // Embed loader box
            widget['loaderBox'] = renderLoaderBox();
            widget['dummy'].appendChild(widget['loaderBox']);
            cm.addClass(widget['loaderBox'], 'fadein', true);
            // API onAppend event
            executeEvent('onAppend', {
                'item' : widget,
                'node' : widget['node'],
                'to' : widget['to'],
                'index' : widget['index']
            });
        }else{
            // API onDrop event
            executeEvent('onDrop', widget);
        }
    };

    var onRemove = function(dd, widget){
        // API onRemove event
        executeEvent('onRemove', widget);
    };

    var onReplace = function(dd, widget){
        // API onRemove event
        executeEvent('onReplace', widget);
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

    var executeEvent = function(event, params){
        API[event].forEach(function(item){
            item(that, params || {});
        });
    };

    /* ******* MAIN ******* */

    that.registerArea = function(area, params){
        coms['dd'].registerArea(area, params);
        return that;
    };

    that.removeArea = function(area, params){
        coms['dd'].removeArea(area, params);
        return that;
    };

    that.removeWidget = function(widget, params){
        coms['dd'].removeDraggable(widget, params);
        return that;
    };

    that.replaceWidget = function(oldNode, newNode, params){
        coms['dd'].replaceDraggable(oldNode, newNode, params);
        return that;
    };

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