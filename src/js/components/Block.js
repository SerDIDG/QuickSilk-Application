App._Blocks = {};

cm.define('App.Block', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'onRemove',
        'enableEditing',
        'disableEditing'
    ],
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'removeOnDestruct' : true,
        'controllerEvents' : true,
        'customEvents' : false,
        'resizeEvent' : true,
        'scrollEvent' : true,
        'type' : 'template-manager',            // template-manager | form-manager | mail
        'instanceId' : false,
        'positionId' : 0,
        'zone' : 0,
        'parentPositionId' : 0,
        'layerId' : 0,
        'index' : false,
        'locked' : false,
        'visible' : true,
        'removable' : true,
        'sticky' : false,
        'animated' : false,
        'effect' : 'none',                      // https://daneden.github.io/animate.css/
        'editorName' : 'app-editor',
        'templateName' : 'app-template',
        'templateController' : 'Template'
    }
},
function(params){
    var that = this;
    // Call parent class construct in current context
    Com.AbstractController.apply(that, arguments);
});


cm.getConstructor('App.Block', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
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
        that.isTemplateRequired = false;
        that.isDummy = false;
        that.isRemoved = false;
        that.isEditing = null;
        that.isProcessed = false;
        that.styleObject = null;
        that.dimensions = null;
        that.pageDimensions = {};
        that.index = null;
        that.node = null;
        that.zone = null;
        that.zones = [];
        // Binds
        that.constructZoneHandler = that.constructZone.bind(that);
        that.animProcessHandler = that.animProcess.bind(that);
    };

    classProto.onValidateParamsEnd = function(){
        var that = this;
        that.node = that.params['node'];
        // Find parent zone
        if(cm.isNumber(that.params['instanceId']) || cm.isString(that.params['instanceId'])){
            that.params['name'] = [that.params['type'], that.params['instanceId'], that.params['positionId']].join('_');
            that.params['zoneName'] = [that.params['type'], that.params['instanceId'], that.params['parentPositionId'], that.params['zone']].join('_');
        }else{
            that.params['name'] = [that.params['type'], that.params['positionId']].join('_');
            that.params['zoneName'] = [that.params['type'], that.params['parentPositionId'], that.params['zone']].join('_');
        }
        // Index
        var index = that.node.getAttribute('data-index');
        if(!cm.isEmpty(index)){
            that.params['index'] = parseInt(index);
            that.params['node'].removeAttribute('data-index');
        }
        that.index = that.params['index'];
        // Animation
        if(that.params['animated']){
            that.params['animated'] = !(cm.isEmpty(that.params['effect']) || that.params['effect'] === 'none');
        }
        // Export to global array
        App._Blocks[that.params['name']] = that;
    };

    classProto.onDestructStart = function(){
        var that = this;
        // Unset block from zone and editor
        that.destructZone(that.zone);
        that.destructEditor(that.components['editor']);
        while(that.zones.length){
            that.zones[0].remove();
        }
        // Delete from global array
        delete App._Blocks[that.params['name']];
    };

    classProto.onSetEvents = function(){
        var that = this;
        cm.customEvent.add(that.node, 'redraw', that.redrawHandler);
    };

    classProto.onUnsetEvents = function(){
        var that = this;
        cm.customEvent.remove(that.node, 'redraw', that.redrawHandler);
    };

    classProto.onRedraw = function(){
        var that = this;
        // Update dimensions
        that.getDimensions();
        // Editing states
        if(that.isEditing){
            that.redrawOnEditing();
        }else{
            that.redrawOnNormal();
        }
    };

    classProto.onScroll = function(){
        var that = this;
        if(!that.isEditing){
            that.animProcess();
        }
    };

    /*** VIEW MODEL ***/

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // Process Template
        that.getTemplate();
        // Process Editor and parent zone
        cm.find('App.Editor', that.params['editorName'], null, function(classObject){
            new cm.Finder('App.Zone', that.params['zoneName'], null, that.constructZoneHandler);
            that.constructEditor(classObject);
        });
    };

    /*** REDRAW ***/

    classProto.redrawOnNormal = function(){
        var that = this,
            heightIndent,
            topIndent,
            bottomIndent;
        // Sticky block
        if(that.params['sticky']){
            cm.addClass(that.node, 'is-sticky');
            // Get template controller
            that.getTemplate();
            // Calculate
            if(that.components['template']){
                heightIndent =
                    cm.getPageSize('winHeight') -
                    that.dimensions['margin']['top'] -
                    that.dimensions['margin']['bottom'] -
                    (that.components['template'].getTopMenuDimensions('height') || 0) -
                    (that.components['template'].getFixedHeaderHeight() || 0);
                topIndent =
                    that.dimensions['margin']['top'] +
                    (that.components['template'].getTopMenuDimensions('height') || 0) +
                    (that.components['template'].getFixedHeaderHeight() || 0);
                bottomIndent = that.dimensions['margin']['bottom'];
                // Set
                that.node.style.top = topIndent + 'px';
                that.node.style.bottomIndent = bottomIndent + 'px';
                that.nodes['block']['container'].style.maxHeight = heightIndent + 'px';
            }
        }
        // Animations
        if(that.params['animated']){
            that.animEnable();
        }
    };

    classProto.redrawOnEditing = function(){
        var that = this;
        // Sticky block
        if(that.params['sticky']){
            cm.removeClass(that.node, 'is-sticky');
            // Clear
            that.node.style.top = '';
            that.node.style.bottom = '';
            that.nodes['block']['container'].style.maxHeight = '';
        }
        // Animations
        if(that.params['animated']){
            that.animDisable();
        }
    };

    /* ******* ANIMATIONS ******* */

    classProto.animEnable = function(){
        var that = this;
        cm.addClass(that.nodes['block']['container'], 'cm-animate');
        cm.addClass(that.nodes['block']['container'], ['pre', that.params['effect']].join('-'));
        that.animRestore();
        that.animProcess();
        return that;
    }

    classProto.animDisable = function(){
        var that = this;
        cm.removeClass(that.nodes['block']['container'], 'cm-animate');
        cm.removeClass(that.nodes['block']['container'], ['pre', that.params['effect']].join('-'));
        cm.removeClass(that.nodes['block']['container'], 'animate__animated');
        cm.removeClass(that.nodes['block']['container'], ['animate', that.params['effect']].join('__'));
        return that;
    };

    classProto.animProcess = function(){
        var that = this;
        if(!that.isProcessed){
            that.getDimensions();
            that.getPageDimensions();
            // Rules for different block sizes.
            if(that.dimensions['offset']['height'] < that.pageDimensions['winHeight']){
                // Rules for block, which size is smaller than page's.
                if(
                    that.dimensions['offset']['top'] >= 0 &&
                    that.dimensions['offset']['bottom'] <= that.pageDimensions['winHeight']
                ){
                    that.animSet();
                }
            }else{
                // Rules for block, which size is larger than page's.
                if(
                    (that.dimensions['offset']['top'] < 0 && that.dimensions['bottom'] >= that.pageDimensions['winHeight'] / 2) ||
                    (that.dimensions['offset']['bottom'] > that.pageDimensions['winHeight'] && that.dimensions['offset']['top'] <= that.pageDimensions['winHeight'] / 2)
                ){
                    that.animSet();
                }
            }
        }
    };

    classProto.animRestore = function(){
        var that = this;
        that.isProcessed = false;
        cm.removeClass(that.nodes['block']['container'], 'animate__animated');
        cm.removeClass(that.nodes['block']['container'], ['animate', that.params['effect']].join('__'));
    };

    classProto.animSet = function(){
        var that = this;
        that.isProcessed = true;
        cm.addClass(that.nodes['block']['container'], 'animate__animated');
        cm.addClass(that.nodes['block']['container'], ['animate', that.params['effect']].join('__'));
    };

    /*** ZONES ***/

    classProto.addZone = function(item){
        var that = this;
        that.zones.push(item);
        return that;
    };

    classProto.removeZone = function(zone){
        var that = this;
        cm.arrayRemove(that.zones, zone);
        return that;
    };

    classProto.setZone = function(zone, index){
        var that = this;
        that.index = index;
        that.destructZone(that.zone);
        that.constructZone(zone);
        return that;
    };

    classProto.unsetZone = function(){
        var that = this;
        that.destructZone(that.zone);
        return that;
    };

    classProto.constructZone = function(classObject){
        var that = this;
        if(classObject){
            that.zone = classObject;
            that.zone.addBlock(that, that.index);
        }
    };

    classProto.destructZone = function(classObject){
        var that = this;
        if(classObject){
            that.zone = classObject;
            that.zone.removeBlock(that);
            that.zone = null;
        }
    };

    /*** EDITOR ***/

    classProto.constructEditor = function(classObject){
        var that = this;
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].addBlock(that, that.index);
        }
    };

    classProto.destructEditor = function(classObject){
        var that = this;
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].removeBlock(that);
        }
    };

    /*** TEMPLATE ***/

    classProto.getTemplate = function(){
        var that = this;
        if(!that.components['template']){
            that.components['template']= cm.reducePath(that.params['templateController'], window);
            if(!that.components['template']){
                cm.find('App.Template', that.params['templateName'], null, function(classObject){
                    that.components['template'] = classObject;
                });
            }
        }
    };

    /*** EDITING ***/

    classProto.enableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.node, 'is-editing');
            cm.replaceClass(that.node, 'is-hidden', 'is-visible');
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editable');
                cm.customEvent.trigger(that.node, 'enableEditable', {
                    'direction' : 'child',
                    'self' : false
                });
            }
            cm.removeClass(that.nodes['block']['container'], 'cm__animate');
            // Redraw
            that.redraw();
            cm.customEvent.trigger(that.node, 'enableEditing', {
                'direction' : 'child',
                'self' : false
            });
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    classProto.disableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing');
            if(!that.params['visible']){
                cm.replaceClass(that.node, 'is-visible', 'is-hidden');
            }
            if(!that.params['locked']){
                cm.removeClass(that.node, 'is-editable');
                cm.customEvent.trigger(that.node, 'disableEditable', {
                    'direction' : 'child',
                    'self' : false
                });
            }
            cm.addClass(that.nodes['block']['container'], 'cm__animate');
            // Redraw
            that.redraw();
            cm.customEvent.trigger(that.node, 'disableEditing', {
                'direction' : 'child',
                'self' : false
            });
            that.triggerEvent('disableEditing');
        }
        return that;
    };

    /******* PUBLIC *******/

    classProto.register = function(classObject){
        var that = this,
            zone = App._Zones[that.params['zoneName']];
        that.constructZone(zone);
        that.constructEditor(classObject);
        return that;
    };

    classProto.remove = function(){
        var that = this;
        if(!that.isRemoved){
            that.isRemoved = true;
            that.destruct();
            that.triggerEvent('onRemove');
        }
        return that;
    };

    classProto.getIndex = function(){
        var that = this;
        if(that.zone){
            that.index = that.zone.getBlockIndex(that);
            return that.index;
        }
        return null;
    };

    classProto.getLower = function(){
        var that = this,
            index = that.getIndex();
        return that.zone.getBlock(index + 1) || null;
    };

    classProto.getUpper = function(){
        var that = this,
            index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    classProto.getDragNodes = function(){
        var that = this,
            nodes = [];
        cm.forEach(that.nodes['block']['drag'], function(item){
            nodes.push(item['container']);
        });
        return nodes;
    };

    classProto.getMenuNodes = function(){
        var that = this;
        return that.nodes['block']['menu'];
    };

    classProto.getInnerNode = function(){
        var that = this;
        return that.nodes['block']['inner'];
    };

    classProto.getDimensions = function(){
        var that = this;
        if(!that.styleObject){
            that.styleObject = cm.getStyleObject(that.node);
        }
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, null);
        return that.dimensions;
    };

    classProto.updateDimensions = function(){
        var that = this;
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    classProto.getPageDimensions = function(){
        var that = this;
        that.pageDimensions = cm.getPageSize();
        return that.pageDimensions;
    };
});
