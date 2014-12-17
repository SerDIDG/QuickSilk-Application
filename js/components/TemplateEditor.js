cm.define('App.TemplateEditor', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Storage'
    ],
    'events' : [
        'onRender',
        'onDrop',
        'onAppend',
        'onRemove',
        'onEmbed',
        'onReplace'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'Com.Draganddrop' : {
            'renderTemporaryAria' : true
        }
    }
},
function(params){
    var that = this;
    
    that.components = {};
    that.nodes = {
        'Template' : {
            'container' : cm.Node('div')
        },
        'AppSidebar' : {
            'removeZone' : cm.Node('div'),
            'widgetsContainer' : cm.Node('div'),
            'widgets' : []
        }
    };

    /* *** INIT *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node'], that.params['nodesDataMarker'], null);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        initSidebar();
        processPanelWidgets();
        initDragAndDrop();
        that.triggerEvent('onRender');
    };

    var initSidebar = function(){
        if(App.Elements['App.Sidebar']){
            App.Elements['App.Sidebar']
                .addEvent('onExpand', onSidebarExpand)
                .addEvent('onCollapse', onSidebarCollapse);

            if(App.Elements['App.Sidebar'].isExpanded){
                onSidebarExpand();
            }else{
                onSidebarCollapse();
            }
        }else{
            onSidebarCollapse();
        }
    };

    var onSidebarExpand = function(){
        var columns, widgets;
        // Enable columns editable
        columns = cm.getByClass('app-mod__columns');
        cm.forEach(columns, function(column){
            if(!cm.isClass(column, 'is-locked')){
                cm.addClass(column, 'is-editable');
            }
            if(cm.isClass(column, 'is-hidden')){
                cm.addClass(column, 'is-visible');
            }
        });
        // Enable widgets editable
        widgets = cm.getByClass('app-widget');
        cm.forEach(widgets, function(widget){
            if(!cm.isClass(widget, 'is-locked')){
                cm.addClass(widget, 'is-editable');
            }
            if(cm.isClass(widget, 'is-hidden')){
                cm.addClass(widget, 'is-visible');
            }
        });
    };

    var onSidebarCollapse = function(){
        var columns, widgets;
        // Disable columns editable
        columns = cm.getByClass('app-mod__columns');
        cm.forEach(columns, function(column){
            cm.removeClass(column, 'is-editable is-visible');
        });
        // Disable widgets editable
        widgets = cm.getByClass('app-widget');
        cm.forEach(widgets, function(widget){
            cm.removeClass(widget, 'is-editable is-visible');
        });
    };

    var renderLoaderBox = function(){
        var node;
        node = cm.Node('div', {'class' : 'pt__box-loader position'},
            cm.Node('div', {'class' : 'inner'})
        );
        return node;
    };

    var processPanelWidgets = function(){
        cm.forEach(that.nodes['AppSidebar']['widgets'], function(item){
            item['container'].setAttribute('data-com-draganddrop', 'draggable');
            item['dummy'].setAttribute('data-com-draganddrop', 'drag');
        });
    };

    var initDragAndDrop = function(){
        that.components['dd'] = new Com.Draganddrop(
            cm.merge({
                'container' : that.nodes['Template']['container']
            }, that.params['Com.Draganddrop'])
        );
        // Register widgets areas and events
        that.components['dd']
            .registerArea(that.nodes['AppSidebar']['widgetsContainer'], {
                'isLocked' : true,
                'isSystem' : true,
                'hasPadding' : false,
                'draggableInChildNodes' : false,
                'cloneDraggable' : true
            })
            .registerArea(that.nodes['AppSidebar']['removeZone'], {
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
            that.triggerEvent('onAppend', {
                'item' : widget,
                'node' : widget['node'],
                'to' : widget['to'],
                'index' : widget['index']
            });
        }else{
            // API onDrop event
            that.triggerEvent('onDrop', widget);
        }
    };

    var onRemove = function(dd, widget){
        // API onRemove event
        that.triggerEvent('onRemove', widget);
    };

    var onReplace = function(dd, widget){
        // API onRemove event
        that.triggerEvent('onReplace', widget);
    };

    /* ******* MAIN ******* */

    that.registerArea = function(area, params){
        that.components['dd'].registerArea(area, params);
        return that;
    };

    that.removeArea = function(area, params){
        that.components['dd'].removeArea(area, params);
        return that;
    };

    that.removeWidget = function(widget, params){
        that.components['dd'].removeDraggable(widget, params);
        return that;
    };

    that.replaceWidget = function(oldNode, newNode, params){
        that.components['dd'].replaceDraggable(oldNode, newNode, params);
        return that;
    };

    init();
});