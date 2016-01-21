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
    that.isProcessed = false;
    that.isExpanded = false;

    /* *** INIT *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
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
        cm.addClass(cm.getDocumentHtml(), 'is-editor');
        if(that.components['sidebar']){
            that.components['sidebar'].resize();
            if(that.components['sidebar'].isExpanded){
                sidebarExpandAction();
            }else{
                sidebarCollapseAction();
            }
        }
        if(!that.components['sidebar'] && that.components['topmenu']){
            adminPageAction();
        }
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
    };

    var sidebarCollapseAction = function(){
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
            cm.remove(block.getInnerNode());
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
        if(that.components['sidebar'] && that.components['sidebar'].isExpanded){
            zone.enableEditing();
        }else{
            zone.disableEditing();
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
        if(that.components['sidebar'] && that.components['sidebar'].isExpanded){
            block.enableEditing();
        }else{
            block.disableEditing();
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