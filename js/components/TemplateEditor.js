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
        'sidebarName' : 'app-sidebar',
        'Com.Draganddrop' : {
            'renderTemporaryAria' : true
        }
    }
},
function(params){
    var that = this;
    
    that.components = {};
    that.nodes = {
        'AppTemplate' : {
            'container' : cm.Node('div')
        },
        'AppSidebar' : {
            'removeZone' : cm.Node('div'),
            'areas' : [],
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
        that.triggerEvent('onRender');
    };

    var render = function(){
        processPanelWidgets();
        initDragAndDrop();
        initSidebar();
    };

    var initSidebar = function(){
        var finder = cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject;
            that.components['sidebar']
                .addEvent('onExpand', onSidebarExpand)
                .addEvent('onCollapse', onSidebarCollapse);

            if(that.components['sidebar'].isExpanded){
                onSidebarExpand();
            }else{
                onSidebarCollapse();
            }
        });
        if(!finder || finder.length == 0){
            onSidebarCollapse();
        }
    };

    var onSidebarExpand = function(){
        var elements;
        // Enable widgets editable
        elements = cm.getByClass('app-pt__widget');
        cm.forEach(elements, function(widget){
            if(!cm.isClass(widget, 'is-locked')){
                cm.addClass(widget, 'is-editable');
            }
            if(cm.isClass(widget, 'is-hidden')){
                cm.addClass(widget, 'is-visible');
            }
        });
        // Enable columns editable
        elements = cm.getByClass('app-mod__columns');
        cm.forEach(elements, function(column){
            if(!cm.isClass(column, 'is-locked')){
                cm.addClass(column, 'is-editable');
            }
            if(cm.isClass(column, 'is-hidden')){
                cm.addClass(column, 'is-visible');
            }
        });
        // Enable spacers editable
        elements = cm.getByClass('app-mod__spacer');
        cm.forEach(elements, function(spacer){
            if(!cm.isClass(spacer, 'is-locked')){
                cm.addClass(spacer, 'is-editable');
            }
            if(cm.isClass(spacer, 'is-hidden')){
                cm.addClass(spacer, 'is-visible');
            }
        });
        // Enable slider editable
        elements = cm.getByClass('app-mod__slider');
        cm.forEach(elements, function(slider){
            if(!cm.isClass(slider, 'is-locked')){
                cm.addClass(slider, 'is-editable');
            }
            if(cm.isClass(slider, 'is-hidden')){
                cm.addClass(slider, 'is-visible');
            }
        });
        // Pause sliders
        cm.find('Com.Slider', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.pause();
        });
        // Redraw template
        cm.find('App.Template', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.redraw();
        });
    };

    var onSidebarCollapse = function(){
        var elements;
        // Disable widgets editable
        elements = cm.getByClass('app-pt__widget');
        cm.forEach(elements, function(widget){
            cm.removeClass(widget, 'is-editable is-visible');
        });
        // Disable columns editable
        elements = cm.getByClass('app-mod__columns');
        cm.forEach(elements, function(column){
            cm.removeClass(column, 'is-editable is-visible');
        });
        // Disable spacers editable
        elements = cm.getByClass('app-mod__spacer');
        cm.forEach(elements, function(spacer){
            cm.removeClass(spacer, 'is-editable is-visible');
        });
        // Disable slider editable
        elements = cm.getByClass('app-mod__slider');
        cm.forEach(elements, function(slider){
            cm.removeClass(slider, 'is-editable is-visible');
        });
        // UnPause sliders
        cm.find('Com.Slider', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.start();
        });
        // Redraw template
        cm.find('App.Template', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.redraw();
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
        cm.getConstructor('Com.Draganddrop', function(classConstructor){
            that.components['dd'] = new classConstructor(
                cm.merge({
                    'container' : that.nodes['AppTemplate']['container']
                }, that.params['Com.Draganddrop'])
            );
            // Register widgets areas and events
            cm.forEach(that.nodes['AppSidebar']['areas'], function(area){
                that.components['dd'].registerArea(area['container'], {
                    'isLocked' : true,
                    'isSystem' : true,
                    'hasPadding' : false,
                    'draggableInChildNodes' : false,
                    'cloneDraggable' : true
                });
            });
            that.components['dd']
                .registerArea(that.nodes['AppSidebar']['removeZone'], {
                    'isSystem' : true,
                    'isRemoveZone': true,
                    'hasPadding' : false
                })
                .addEvent('onDrop', onDrop)
                .addEvent('onReplace', onReplace)
                .addEvent('onRemove', onRemove);
        });
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