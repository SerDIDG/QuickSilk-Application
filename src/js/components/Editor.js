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
        'place',
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
        'node' : cm.node('div'),
        'name' : 'app-editor',
        'topMenuName' : 'app-topmenu',
        'sidebarName' : 'app-sidebar',
        'templateName' : 'app-template',
        'editorType' : 'template-manager',
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

    that.types = ['template-manager', 'form-manager', 'listing-directory-card'];
    that.components = {};
    that.nodes = {};

    that.zones = [];
    that.blocks = [];
    that.dummyBlocks = [];
    that.editorType = null;
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
        validateParams();
        render();
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.editorType = that.params['editorType'];
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
                .addEvent('onExpandEnd', sidebarExpandAction)
                .addEvent('onCollapseStart', sidebarCollapseAction)
                .addEvent('onTabShow', function(sidebar, item){
                    setEditorType(item['id']);
                });
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

    var sidebarExpandAction = function(){
        if(!cm.isBoolean(that.isExpanded) || !that.isExpanded){
            that.isExpanded = true;
            cm.replaceClass(cm.getDocumentHtml(), 'is-editor--collapsed', 'is-editor--expanded');
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
        if(!cm.isBoolean(that.isExpanded)  || that.isExpanded){
            that.isExpanded = false;
            cm.replaceClass(cm.getDocumentHtml(), 'is-editor--expanded', 'is-editor--collapsed');
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

    var setEditorType = function(type){
        if(cm.inArray(that.types, type) && type != that.editorType){
            that.editorType = type;
        }
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
                    that.components['template'].redraw();
                }
            });
        }
        return that;
    };

    that.place = function(node){
        if(node && block){
            node = !cm.isNode(node) ? cm.strToHTML(node) : node;
            that.components['dashboard'].appendBlock(node, {
                'onEnd' : function(){
                    that.triggerEvent('place', node);
                    that.triggerEvent('onProcessEnd', node);
                    that.components['template'].redraw();
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
                    that.components['template'].redraw();
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
                    that.components['template'].redraw();
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
                    that.components['template'].redraw();
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
            that.components['template'].redraw();
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