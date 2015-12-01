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
        'onRender',
        'onExpand',
        'onCollapse',
        'onDrop',
        'onAppend',
        'onRemove',
        'onEmbed',
        'onReplace',
        'onUpdate',
        'onForceRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-editor',
        'sidebarName' : 'app-sidebar',
        'App.Dashboard' : {}
    }
},
function(params){
    var that = this;
    
    that.components = {};
    that.nodes = {};
    that.states = {
        'sidebarExpanded' : false
    };

    that.zones = {};
    that.blocks = {};
    that.dummyBlocks = {};
    that.isProcessed = false;
    that.isExpanded = false;

    /* *** INIT *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var render = function(){
        initSidebar();
        initDashboard();
        windowResize();
        cm.addEvent(window, 'resize', windowResize);
    };

    var initSidebar = function(){
        new cm.Finder('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject
                .addEvent('onExpand', sidebarExpandAction)
                .addEvent('onCollapse', sidebarCollapseAction);

            if(that.components['sidebar'].isExpanded){
                sidebarExpandAction();
            }else{
                sidebarCollapseAction();
            }
        });
    };

    var initDashboard = function(){
        cm.getConstructor('App.Dashboard', function(classConstructor){
            that.components['dashboard'] = new classConstructor(that.params['App.Dashboard'])
                .addEvent('onDrop', onDrop)
                .addEvent('onReplace', onReplace)
                .addEvent('onRemove', onRemove);
            // Add Blocks
            cm.forEach(that.dummyBlocks, function(item){
                that.components['dashboard'].addDummyBlock(item);
            });
            cm.forEach(that.zones, function(item){
                that.components['dashboard'].addZone(item);
            });
        });
    };

    var sidebarExpandAction = function(){
        that.isExpanded = true;
        cm.forEach(that.zones, function(item){
            item.enableEditing();
        });
        cm.forEach(that.blocks, function(item){
            item.enableEditing();
        });
        that.triggerEvent('onExpand');

        return false;

        var elements;
        // Enable widgets editable
        /*
        elements = cm.getByClass('app__block');
        cm.forEach(elements, function(widget){
            if(!cm.isClass(widget, 'is-locked')){
                cm.addClass(widget, 'is-editable');
            }
            if(cm.isClass(widget, 'is-hidden')){
                cm.addClass(widget, 'is-visible');
            }
        });
        */
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
        // Enable block editable
        /*
        cm.find('App.Block', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.enableEditMode();
        });
        */
        // Enable gridlist editable
        cm.find('Com.GridlistHelper', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.enableEditMode();
        });
        // Redraw template
        cm.find('App.Template', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.redraw();
        });
    };

    var sidebarCollapseAction = function(){
        that.isExpanded = false;
        cm.forEach(that.zones, function(item){
            item.disableEditing();
        });
        cm.forEach(that.blocks, function(item){
            item.disableEditing();
        });
        that.triggerEvent('onCollapse');

        return false;

        var elements;
        // Disable widgets editable
        /*
        elements = cm.getByClass('app__block');
        cm.forEach(elements, function(widget){
            cm.removeClass(widget, 'is-editable is-visible');
        });
        */
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
        // Disable block editable
        /*
        cm.find('App.Block', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.disableEditMode();
        });
        */
        // Disable gridlist editable
        cm.find('Com.GridlistHelper', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.disableEditMode();
        });
        // Redraw template
        cm.find('App.Template', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.redraw();
        });
    };

    var onAdminPage = function(){
        // Enable gridlist editable
        cm.find('Com.GridlistHelper', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.enableEditMode();
        });
    };

    var windowResize = function(){
        // This code must be placed in Sidebar component!!!
        animFrame(function(){
            var pageSize = cm.getPageSize();

            if(that.components['sidebar']){
                if(pageSize['winWidth'] <= cm._config['adaptiveFrom']){
                    if(that.components['sidebar'].isExpanded && that.isExpanded){
                        that.states['sidebarExpanded'] = true;
                        that.components['sidebar'].collapse(true);
                    }
                }else{
                    if(that.states['sidebarExpanded'] && !that.isExpanded){
                        that.states['sidebarExpanded'] = false;
                        that.components['sidebar'].expand(true);
                    }
                }
            }
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

    that.addZone = function(name, item){
        that.zones[name] = item;
        if(that.components['dashboard']){
            that.components['dashboard'].addZone(item);
        }
        return that;
    };

    that.removeZone = function(name){
        delete that.zones[name];
        return that;
    };

    that.addBlock = function(name, item){
        that.blocks[name] = item;
        if(that.components['dashboard']){
            that.components['dashboard'].addBlock(item);
        }
        return that;
    };

    that.removeBlock = function(name){
        delete that.blocks[name];
        return that;
    };

    that.addDummyBlock = function(name, item){
        that.dummyBlocks[name] = item;
        if(that.components['dashboard']){
            that.components['dashboard'].addDummyBlock(item);
        }
        return that;
    };





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

    that.deleteAllTemporary = function() {
        var dummy = cm.getByAttr('data-node', 'dummy', that.nodes['AppTemplate']['container']);
        cm.forEach(dummy, function(node) {
            that.removeWidget(node.parentNode);
        });
    };

    that.updateTemporaryWidget = function(content) {
        var dummy = cm.getByAttr('data-node', 'dummy', that.nodes['AppTemplate']['container']);
        cm.forEach(dummy, function(node) {
            var element = cm.strToHTML(content);
            that.components['dd'].replaceDraggable(node.parentNode, element, {'noEvent': true, 'onStop': function() {
                //register drop areas
                var areas = cm.getByAttr('data-com-draganddrop', 'area', element);
                cm.forEach(areas, function(area) {
                    that.components['dd'].registerArea(area, {});
                });
                that.triggerEvent('onUpdate', {'node': element});
            }});
        });
    };

    that.getWidget = function(id) {
        var draggableList = that.components['dd'].getDraggableList(),
            widgets = [],
            result = null;
        cm.forEach(draggableList, function(item) {
            widgets = cm.getByClass('app__block', item['node']);
            if (widgets[0] && widgets[0].getAttribute('data-block-position-id') == id) {
                result = item;
            }
        });
        return result;
    };

    that.updateWidget = function(content, id) {
        var item = that.getWidget(id);
        if(item){
            var element = cm.strToHTML(content);
            that.components['dd'].replaceDraggable(item['node'], element, {'noEvent': true, 'onStop': function() {
                //register drop areas
                var areas = cm.getByAttr('data-com-draganddrop', 'area', element);
                cm.forEach(areas, function(area) {
                    that.components['dd'].registerArea(area, {});
                });
                that.triggerEvent('onUpdate', {'node': element});
            }});
        }
    };

    that.deleteWidget = function(id) {
        var item = that.getWidget(id);
        if(item){
            that.components['dd'].removeDraggable(item['node'], {'noEvent': true});
        }
    };

    init();
});