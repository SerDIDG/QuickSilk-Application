/*! ************ QuickSilk-Application v3.24.2 (2019-02-22 22:55) ************ */

// /* ************************************************ */
// /* ******* QUICKSILK: COMMON ******* */
// /* ************************************************ */

var App = {
    '_version' : '3.24.2',
    '_assetsUrl' : [window.location.protocol, window.location.hostname].join('//'),
    'Elements': {},
    'Nodes' : {},
    'Test' : []
};

var Module = {};

/* ******* COMMON ******* */

// Add variables

cm._variables['%AppVersion%'] = 'App._version';
cm._variables['%AppAssetsUrl%'] = 'App._assetsUrl';
cm.define('App.AbstractModule', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable',
        'onEnableEditing',
        'onDisableEditing'
    ],
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true,
        'customEvents' : true
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.AbstractModule', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.isEditing = null;
        // Bind
        that.enableEditingHandler = that.enableEditing.bind(that);
        that.disableEditingHandler = that.disableEditing.bind(that);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.onSetCustomEvents = function(){
        var that = this;
        cm.customEvent.add(that.params['node'], 'enableEditable', that.enableEditingHandler);
        cm.customEvent.add(that.params['node'], 'disableEditable', that.disableEditingHandler);
    };

    classProto.onUnsetCustomEvents = function(){
        var that = this;
        cm.customEvent.remove(that.params['node'], 'enableEditable', that.enableEditingHandler);
        cm.customEvent.remove(that.params['node'], 'disableEditable', that.disableEditingHandler);
    };

    /*** PUBLIC ***/

    classProto.enableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.replaceClass(that.params['node'], 'is-not-editing', 'is-editing is-editable');
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
            that.triggerEvent('onEnableEditing');
        }
        return that;
    };

    classProto.disableEditing = function(){
        var that = this;
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.replaceClass(that.params['node'], 'is-editing is-editable', 'is-not-editing');
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
            that.triggerEvent('onDisableEditing');
        }
        return that;
    };
});
cm.define('App.AbstractForm', {
    'extend' : 'Com.AbstractController'
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});
cm.define('App.AbstractModuleElement', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onChange'
    ],
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'required' : false,
        'pattern' : /^\s*$/g,
        'match' : false,
        'targetController' : false,
        'memorable' : true,
        'remember' : false,
        'inputEvent' : 'input'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('App.AbstractModuleElement', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Bind
        that.changeEventHandler = that.changeEvent.bind(that);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        // Restore value from local storage
        that.restoreLocalValue();
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // Get controller
        if(that.params['targetController']){
            that.renderController();
        }else if(!cm.isEmpty(that.nodes['inputs'])){
            that.renderInputs();
        }else{
            that.renderInput(that.nodes['input']);
        }
    };

    classProto.renderController = function(){
        var that = this;
        cm.find(that.params['targetController'], that.params['name'], that.nodes['field'], function(classObject){
            that.components['controller'] = classObject;
            that.components['controller'].addEvent('onChange', that.changeEventHandler);
        });
    };

    classProto.renderInputs = function(){
        var that = this;
        cm.forEach(that.nodes['inputs'], function(nodes){
            that.renderInput(nodes['input']);
        });
    };

    classProto.renderInput = function(node){
        var that = this;
        cm.addEvent(node, that.params['inputEvent'], that.changeEventHandler);
    };

    /*** EVENTS ***/

    classProto.changeEvent = function(){
        var that = this;
        var value = that.get();
        that.saveLocalValue();
        that.triggerEvent('onChange', value);
    };

    /*** DATA ***/

    classProto.saveLocalValue = function(){
        var that = this;
        if(that.params['memorable'] && that.params['remember']){
            var value = that.get();
            that.storageWrite('value', value);
        }
    };

    classProto.restoreLocalValue = function(){
        var that = this;
        if(that.params['memorable'] && that.params['remember']){
            var value = that.storageRead('value');
            that.set(value);
        }
    };

    classProto.setMultiple = function(values){
        var that = this;
        if(cm.isArray(value)){
            cm.forEach(that.nodes['inputs'], function(nodes, i){
                if(values[i]){
                    nodes['input'].value = values[i];
                }
            });
        }
    };

    classProto.getMultiple = function(){
        var that = this,
            values = [];
        cm.forEach(that.nodes['inputs'], function(nodes){
            values.push(nodes['input'].value);
        });
        return values;
    };

    classProto.validateValue = function(){
        var that = this,
            value = that.get(),
            test;
        if(cm.isRegExp(that.params['pattern'])){
            if(cm.isEmpty(value)){
                test = true;
            }else{
                test = that.params['pattern'].test(value);
            }
        }else{
            test = that.params['pattern'] === value;
        }
        return that.params['match']? test : !test;
    };

    /******* PUBLIC *******/

    classProto.set = function(value){
        var that = this;
        if(that.components['controller']){
            that.components['controller'].set(value);
        }else if(!cm.isEmpty(that.nodes['inputs'])){
            that.setMultiple(value);
        }else{
            that.nodes['input'].value = value;
        }
        return that;
    };

    classProto.get = function(){
        var that = this;
        if(that.components['controller']){
            return that.components['controller'].get();
        }
        if(!cm.isEmpty(that.nodes['inputs'])){
            return that.getMultiple();
        }
        return that.nodes['input'].value;
    };

    classProto.validate = function(){
        var that = this,
            isValid = true;
        if(that.params['required']){
            isValid = that.validateValue();
            if(isValid){
                cm.removeClass(that.nodes['field'], 'error');
                cm.addClass(that.nodes['errors'], 'hidden');
            }else{
                cm.addClass(that.nodes['field'], 'error');
                cm.removeClass(that.nodes['errors'], 'hidden');
            }
        }
        return isValid;
    };
});
App.FlowScenario = [{
    'title' : 'Edit Header and Footer',
    'order' : 2,
    'type' : 'flow',
    /*'flow' : 'compliant'*/
    'flow' : 'forced',
    'data' : [{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Click on Layouts</h3>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'layouts',
        'topMenu' : false,
        'content' : '<h3>Click on Inner Page Layout</h3>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template/layout/content/',
        'content' : '<h3>You\'re in the right place!</h3><p>Your header and footer can be edited in "Inner Page Layout". These changes will be applied to all pages using this layout.</p>'
    }]
},{
    'title' : 'How to change or edit templates',
    'order' : 3,
    'type' : 'flow',
    'flow' : 'forced',
    'data' : [{
        'position' : 'topMenuItem:modules:container:right',
        'arrow' : 'top',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Hover over Modules > Create</h3>'
    },{
        'position' : 'topMenuItem:modules:dropdown:right',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'modules',
        'content' : '<h3>Click on Templates</h3>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template-library',
        'content' : '<h3>Here are your existing templates</h3><p>You can customize any of these</p>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Click Template Library</h3><p>To browse new templates</p>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Here you can download new templates</h3><p>By hovering over the template and clicking "Install"</p>'
    }]
},{
    'title' : 'How to edit styles',
    'order' : 4,
    'type' : 'flow',
    'flow' : 'forced',
    'data' : [{
        'position' : 'topMenuItem:modules:container:right',
        'arrow' : 'top',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Hover over Modules > Create</h3>'
    },{
        'position' : 'topMenuItem:modules:dropdown:right',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'modules',
        'content' : '<h3>Click on Templates</h3>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template-library',
        'content' : '<h3>Hover over any of your existing templates</h3><p>And select "Customize"</p>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template/editor/edit/',
        'content' : '<h3>Click on Template Default Styles</h3>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Select any text style</h3><p>To edit the font, colours, etc.</p>'
    }]
},{
    'title' : 'Help Tour',
    'order' : 1,
    'type' : 'tour',
    'data' : [{
        'position' : 'window:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>QuickSilk Online Tour!</h3><p>Welcome to QuickSilk! Use the buttons at the bottom of each help bubble to quickly discover how to navigate and use the QuickSilk software. This online tour automatically appears the first time you login. Anytime after this, simply click on the help tour menu item for a quick refresher.</p>'
    },{
        'position' : 'topMenuItem:user:dropdown:left',
        'arrow' : 'right',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'user',
        'content' : '<h3>User Menu</h3><p>Click on your name to view the admin panel (future), your profile, or to logout. The View Profile link provides the ability to manage your subscription and billing, password, forum settings, working groups and public profile.</p>'
    },{
        'position' : 'topMenuItem:modules:dropdown:right',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'modules',
        'content' : '<h3>Modules</h3><p>The Module manager allows you to work on your modules from the administration panel. Simply mouse over the Modules menu and then scroll down and click on the module you wish to work with. </p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Left Panel Slider</h3><p>The left slider widget provides you with quick access to the modules, pages, layouts and template features. Simply click on the icon for the tab you wish to use.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'template-manager',
        'topMenu' : false,
        'content' : '<h3>Installed Modules</h3><p>The modules tab provides quick access to the modules that you\'ve subscribed to. Once you\'ve opened a page or a template, open the modules tab to drag and drop the modules you wish to include.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'pages',
        'topMenu' : false,
        'content' : '<h3>Site Pages</h3><p>The site pages tab allows you to quickly open, modify and manage your website pages. Simply open the tab and click on the web page you wish to work on.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'layouts',
        'topMenu' : false,
        'content' : '<h3>Page Layouts</h3><p>Use the page layout tab to open, modify and manage the layouts of your various web page templates. A page layout will consist of the common elements you have on every page.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'templates',
        'topMenu' : false,
        'content' : '<h3>Templates</h3><p>The templates tab displays the different custom or predesigned templates that you\'ve installed and are immediately available for use on your website. If you want to view or install other templates, you\'ll do so from the template gallery.</p>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Drop Area</h3><p>The drop area is where you drag and drop the modules. To move a module onto a page or template place your mouse on the desired module icon, hold down the left button on your mouse, and drag the module to the highlighted area of the page you wish to drop it, then let go of the mouse button.</p>'
    },{
        'position' : 'topMenuItem:support:container:right',
        'arrow' : 'top',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'support',
        'content' : '<h3>Need Help?</h3><p>Are you stuck, experiencing an issue, found a bug or have a suggestion? Simply click on this link and send us a message. FYI, to assist in the troubleshooting process we automatically collect information on the operating system, browser and browser version you are using. Our goal is to respond to your message within 1 business day.</p>'
    }]
}];
App._Blocks = {};

cm.define('App.Block', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove',
        'enableEditing',
        'disableEditing'
    ],
    'params' : {
        'node' : cm.Node('div'),
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
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = false;
    that.isRemoved = false;
    that.isEditing = null;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
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
    that.index = null;
    that.node = null;
    that.zone = null;
    that.zones = [];

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        var index;
        if(cm.isNumber(that.params['instanceId']) || cm.isString(that.params['instanceId'])){
            that.params['name'] = [that.params['type'], that.params['instanceId'], that.params['positionId']].join('_');
            that.params['zoneName'] = [that.params['type'], that.params['instanceId'], that.params['parentPositionId'], that.params['zone']].join('_');
        }else{
            that.params['name'] = [that.params['type'], that.params['positionId']].join('_');
            that.params['zoneName'] = [that.params['type'], that.params['parentPositionId'], that.params['zone']].join('_');
        }
        if(index = that.params['node'].getAttribute('data-index')){
            that.params['index'] = parseInt(index);
            that.params['node'].removeAttribute('data-index');
        }
        that.index = that.params['index'];
        // Export
        App._Blocks[that.params['name']] = that;
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions();
        // Construct
        cm.find('App.Editor', that.params['editorName'], null, function(classObject){
            new cm.Finder('App.Zone', that.params['zoneName'], null, constructZone);
            constructEditor(classObject);
        });
    };

    var constructZone = function(classObject){
        if(classObject){
            that.zone = classObject;
            that.zone.addBlock(that, that.index);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject;
            that.zone.removeBlock(that);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].addBlock(that, that.index);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].removeBlock(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.register = function(classObject){
        var zone = App._Zones[that.params['zoneName']];
        constructZone(zone);
        constructEditor(classObject);
        return that;
    };

    that.enableEditing = function(){
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
            that.getDimensions();
            cm.customEvent.trigger(that.node, 'enableEditing', {
                'direction' : 'child',
                'self' : false
            });
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
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
            that.getDimensions();
            cm.customEvent.trigger(that.node, 'disableEditing', {
                'direction' : 'child',
                'self' : false
            });
            that.triggerEvent('disableEditing');
        }
        return that;
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructZone(that.zone);
            destructEditor(that.components['editor']);
            while(that.zones.length){
                that.zones[0].remove();
            }
            cm.customEvent.trigger(that.node, 'destruct', {
                'direction' : 'child',
                'self' : false
            });
            delete App._Blocks[that.params['name']];
            that.removeFromStack();
            cm.remove(that.node);
            that.triggerEvent('onRemove');
        }
        return that;
    };

    that.addZone = function(item){
        that.zones.push(item);
        return that;
    };

    that.removeZone = function(zone){
        cm.arrayRemove(that.zones, zone);
        return that;
    };

    that.setZone = function(zone, index){
        that.index = index;
        destructZone(that.zone);
        constructZone(zone);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.getIndex = function(){
        if(that.zone){
            that.index = that.zone.getBlockIndex(that);
            return that.index;
        }
        return null;
    };

    that.getLower = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index + 1) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getDragNodes = function(){
        var nodes = [];
        cm.forEach(that.nodes['block']['drag'], function(item){
            nodes.push(item['container']);
        });
        return nodes;
    };

    that.getMenuNodes = function(){
        return that.nodes['block']['menu'];
    };

    that.getInnerNode = function(){
        return that.nodes['block']['inner'];
    };

    that.getDimensions = function(){
        if(!that.styleObject){
            that.styleObject = cm.getStyleObject(that.node);
        }
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, null);
        return that.dimensions;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});
cm.define('App.Chart', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'embedStructure' : 'append',
        'width' : 'auto',
        'height' : 'auto',
        'type' : 'doughnut',
        'showLegend' : false,
        'simpleData' : [],         // Simple options data [{"label" : "Foo", "value" : 300}]
        'simpleOptions' : {},
        'simpleBackgroundColor' : '@LESS.CmColor-Primary-DarkDefault',
        'data' : {},
        'options' : {}
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Chart', function(classConstructor, className, classProto, classInherit){
    classProto.renderView = function(){
        var that = this;
        that.triggerEvent('onRenderViewStart');
        that.nodes['container'] = cm.node('div', {'class' : 'app__chart'},
            that.nodes['canvas'] = cm.node('canvas', {
                'width' : that.params['width'],
                'height' : that.params['height']
            }),
            that.nodes['legend'] = cm.node('div', {'class' : 'chart__legend'})
        );
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Convert simple data
        if(!cm.isEmpty(that.params['simpleData'])){
            that.processSimpleData();
        }
        // Load script
        cm.loadScript({
            'path' : 'Chart',
            'src' : '%AppAssetsUrl%/libs/chartjs/Chart.min.js?%AppVersion%',
            'callback' : function(path){
                if(path){
                    that.components['chart'] = new path(that.nodes['canvas'], {
                        'type' : that.params['type'],
                        'data' : that.params['data'],
                        'options' : that.params['options']
                    });
                    if(that.params['showLegend']){
                        that.nodes['legend'].innerHTML = that.components['chart'].generateLegend();
                    }
                }
            }
        });
    };

    classProto.processSimpleData = function(){
        var that = this,
            dataset = cm.merge({
                'data' : [],
                'backgroundColor' : that.params['simpleBackgroundColor']
            }, that.params['simpleOptions']);
        // Merge Data
        that.params['data'] = {
            'labels' : [],
            'datasets' : [dataset]
        };
        cm.forEach(that.params['simpleData'], function(item){
            that.params['data']['labels'].push(item['label']);
            dataset['data'].push(item['value']);
        });
    };
});
cm.define('App.ChartHubspotContacs', {
    'extend' : 'App.Chart',
    'params' : {
        'width' : '100%',
        'height' : '30em',
        'type' : 'horizontalBar',
        'simpleOptions' : {
            'label' : 'Count of Contacts',
            'fill' : false
        },
        'options' : {
            "scales" : {
                "xAxes" : [{
                    "ticks" : {
                        "beginAtZero" : true
                    }
                }]
            }
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.Chart.apply(that, arguments);
});
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
        'highlightPlaceholders' : true,
        'placeholderHeight' : 0,
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
    that.pointerType = null;
    that.components = {};
    that.anim = {};

    that.zones = [];
    that.blocks = [];
    that.dummyBlocks = [];

    that.currentZones = null;
    that.currentBlocks = null;
    that.currentBlock = null;
    that.currentBlockZone = null;
    that.currentBlockOffset = null;
    that.currentBellow = null;

    /* *** INIT *** */

    var init = function(){
        getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var getLESSVariables = function(){
        that.params['dropDuration'] = cm.getTransitionDurationFromLESS('AppDashboard-DropDuration', that.params['dropDuration']);
        that.params['moveDuration'] = cm.getTransitionDurationFromLESS('AppDashboard-MoveDuration', that.params['moveDuration']);
    };

    var validateParams = function(){
        that.params['Com.Overlay']['container'] = that.params['draggableContainer'];
        // Check Graceful Degradation, and turn it to mobile and old ie.
        if(cm.isMobile()){
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
        // Unset zone, blocks bellow current graggable block
        if(that.currentBellow){
            unsetCurrentBelow();
        }
        // Remove placeholder
        hidePlaceholder();
        // Reset variables
        that.currentZones = [];
        that.currentBlocks = [];
        that.currentBlock = null;
        that.currentBlockZone = null;
        that.currentBlockOffset = {
            'left' : 0,
            'top' : 0
        };
        that.currentBellow = {
            'zone' : null,
            'block' : null,
            'position' : null
        };
        that.isProccess = false;
    };

    var start = function(e, block){
        // Prevent drag event not on LMB
        if(e.button){
            return;
        }
        // Prevent multiple drag event
        if(that.isProccess || that.currentBlock){
            return;
        }
        that.isProccess = true;
        that.pointerType = e.type;
        // Variables
        var params = getPosition(e);
        params['state'] = 'start';
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
        highlightCurrentZones();
        // Update positions of blocks and zones
        updateCurrentDimensions();
        // Find zone, block and placeholder under current graggable block
        setCurrentBelow(
            getCurrentBelow(params)
        );
        // Add events
        switch(that.pointerType){
            case 'mousedown' :
                cm.addEvent(window, 'mousemove', move);
                cm.addEvent(window, 'mouseup', stop);
                break;
            case 'touchstart' :
                cm.addEvent(window, 'touchmove', move);
                cm.addEvent(window, 'touchend', stop);
                break;
        }
        cm.addEvent(window, 'scroll', scroll);
        cm.customEvent.add(window, 'pageSizeChange', scroll);
        cm.preventDefault(e);
    };

    var move = function(e){
        // Variables
        var params = getPosition(e);
        params['state'] = 'move';
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
        cm.preventDefault(e);
    };

    var stop = function(){
        // Drop block
        if(!that.currentBellow.zone || that.currentBellow.zone.params['type'] === 'remove'){
            removeBlock(that.currentBlock, {
                'onEnd' : reset
            });
        }else{
            dropBlock(that.currentBlock, {
                'index' : that.currentBellow.index,
                'zone' : that.currentBellow.zone,
                'placeholder' : that.placeholder,
                'onEnd' : reset
            });
        }
        // Unhighlight zones
        unhighlightCurrentZones();
        // Hide content blocker
        that.components['overlays'].close();
        cm.removeClass(document.body, 'app__dashboard__body');
        // Remove events attached on document and template
        switch(that.pointerType){
            case 'mousedown' :
                cm.removeEvent(window, 'mousemove', move);
                cm.removeEvent(window, 'mouseup', stop);
                break;
            case 'touchstart' :
                cm.removeEvent(window, 'touchmove', move);
                cm.removeEvent(window, 'touchend', stop);
                break;
        }
        cm.removeEvent(window, 'scroll', scroll);
        cm.customEvent.remove(window, 'pageSizeChange', scroll);
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
        cm.forEach(item.getDragNodes(), function(node){
            cm.addEvent(node, 'touchstart', function(e){
                start(e, item);
            });
            cm.addEvent(node, 'mousedown', function(e){
                start(e, item);
            });
            cm.addEvent(node, 'contextmenu', function(e){
                cm.preventDefault(e);
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
            that.currentBlock = block.clone();
        }else{
            that.currentBlockZone = block.zone;
            that.currentBlock = block.unsetZone();
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
        if(!cm.isUndefined(params['width'])){
            node.style.width = [params['width'], 'px'].join('');
        }
        if(!cm.isUndefined(params['height'])){
            node.style.height = [params['height'], 'px'].join('');
        }
        if(!cm.isUndefined(params['opacity'])){
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
        if(block.node && cm.hasParentNode(block.node)){
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
            block.unsetZone().remove();
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
            'index' : false,
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
        if(cm.isNumber(params.index)){
            node.setAttribute('data-index', params.index.toString());
        }
        // Render temporary node
        temporaryNode = cm.node('div');
        temporaryNode.style.height = 0;
        if(params.block){
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
            'index' : false,
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
        if(cm.isNumber(params.index)){
            node.setAttribute('data-index', params.index.toString());
        }
        // Temporary node
        temporaryNode = cm.node('div');
        if(params.block){
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
                params.block.unsetZone().remove();
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
        cm.clearCSSTranslate(block.node);
    };

    /* *** PLACEHOLDER *** */

    var showPlaceholder = function(temp){
        if(!that.placeholder){
            that.placeholder = new App.DashboardPlaceholder({
                'highlight' : that.params['highlightPlaceholders'],
                'animate' : !that.isGracefulDegradation
            });
        }
        if(temp.params.state === 'start' && !that.currentBlock.isDummy){
            that.placeholder.show(that.currentBlock.dimensions['outer']['height']);
        }
        if(temp.block){
            that.placeholder.embed(temp.block.node, temp.position);
        }else if(temp.zone){
            that.placeholder.embed(temp.zone.node, 'last');
        }
        that.placeholder.show(that.params['placeholderHeight'], that.params['moveDuration']);
    };

    var hidePlaceholder = function(){
        if(that.placeholder){
            that.placeholder.remove();
        }
    };

    /* *** CURRENT *** */

    var updateCurrentDimensions = function(){
        cm.forEach(that.currentZones, function(item){
            item.updateDimensions();
        });
        cm.forEach(that.currentBlocks, function(item){
            item.updateDimensions();
        });
    };

    var getCurrentZones = function(block){
        return that.zones.filter(function(zone){
            if(
                zone.params['locked'] ||
                (zone.params['type'] !== 'remove' && block.params['type'] !== zone.params['type']) ||
                (zone.params['type'] === 'remove' && !block.params['removable']) ||
                cm.inArray(zone.params['disallow'], block.params['keyword']) ||
                cm.isParent(block.params['node'], zone.params['node'])
            ){
                return false;
            }
            return true;
        });
    };

    var getCurrentBlocks = function(block){
        return that.blocks.filter(function(item){
            if(
                block.params['type'] !== item.params['type'] ||
                cm.isParent(block.params['node'], item.params['node'])
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
                'index' : 0,
                'position' : null,
                'params' : params
            },
            firstBlock,
            lastBlock;
        // Find zone below current graggable block
        cm.forEach(that.currentZones, function(zone){
            if(
                params['left'] >= zone.dimensions['offset']['left'] &&
                params['left'] < zone.dimensions['offset']['right'] &&
                params['top'] >= zone.dimensions['offset']['top'] &&
                params['top'] <= zone.dimensions['offset']['bottom']
            ){
                if(!temp.zone){
                    temp.zone = zone;
                }else if(
                    zone.dimensions['offset']['width'] < temp.zone.dimensions['offset']['width'] ||
                    zone.dimensions['offset']['height'] < temp.zone.dimensions['offset']['height']
                ){
                    temp.zone = zone;
                }
            }
        });
        // If zone not highlighted by coordinates, assign current bellow block's zone
        if(!temp.zone){
            temp.zone = that.currentBellow.zone;
        }
        // If there no one zones are found, assign current graggable block's origin zone
        if(!temp.zone){
            temp.zone = that.currentBlockZone;
        }
        // Find block below current graggable block
        if(temp.zone){
            cm.forEach(temp.zone['blocks'], function(block){
                if(
                    params['top'] >= block.dimensions['outer']['top'] &&
                    params['top'] <= block.dimensions['outer']['bottom']
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
                firstBlock = temp.zone['blocks'][0];
                lastBlock = temp.zone['blocks'][temp.zone['blocks'].length - 1];
                if(firstBlock && params['top'] < firstBlock.dimensions['outer']['top']){
                    temp.block = firstBlock;
                    temp.position = 'top';
                }else if(lastBlock){
                    temp.block = lastBlock;
                    temp.position = 'bottom';
                }
            }
        }
        // Find index
        if(temp.block){
            temp.index = temp.position === 'top' ? temp.block.getIndex() : temp.block.getIndex() + 1;
        }
        return temp;
    };

    var setCurrentBelow = function(temp){
        // Unset old zone and set new one
        if(
            that.currentBellow.zone &&
            that.currentBellow.zone.isActive &&
            that.currentBellow.zone !== temp.zone
        ){
            that.currentBellow.zone.unactive();
        }
        if(temp.zone && !temp.zone.isActive){
            temp.zone.active();
        }
        // Unset old placeholder and new new one
        if(temp.block || temp.zone){
            showPlaceholder(temp);
        }else{
            hidePlaceholder();
        }
        // Set global variables
        that.currentBellow = temp;
    };

    var unsetCurrentBelow = function(){
        if(that.currentBellow.zone){
            that.currentBellow.zone.unactive();
        }
    };

    /* *** ZONE *** */

    var initZone = function(item){
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
            cm.addEvent(node, 'touchstart', function(e){
                start(e, item);
            });
            cm.addEvent(node, 'mousedown', function(e){
                start(e, item);
            });
        });
        that.dummyBlocks.push(item);
    };

    /* *** HELPERS *** */

    var getPosition = function(e){
        if(/pageSizeChange|sctoll/.test(e.type)){
            return cm._clientPosition;
        }
        return cm.getEventClientPosition(e);
    };

    var moveScroll = function(speed){
        var duration = 0,
            move = 0;
        if(speed === 0){
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
cm.define('App.DashboardPlaceholder', {
    'modules' : [
        'Params',
        'Events',
        'Langs'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'highlight' : true,
        'animate' : true,
        'container' : cm.node('div'),
        'insert' : 'appendChild'        // appendChild, insertBefore, insertAfter
    }
},
function(params){
    var that = this;

    that.nodes = {};
    that.node = null;
    that.container = null;
    that.insert = null;
    that.styleObject = null;
    that.offsets = null;
    that.dimensions = null;

    that.isAnimate = false;
    that.isShow = false;
    that.isEmbed = false;
    that.transitionDurationProperty = null;
    that.height = 0;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.transitionDurationProperty = cm.getSupportedStyle('transition-duration');
        that.isAnimate = that.params['animate'] && that.transitionDurationProperty;
    };

    var render = function(){
        // Render structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__dashboard__placeholder is-active is-highlight'});
        that.node = that.nodes['container'];
        that.embed(that.params['container'], that.params['insert']);
    };

    /* ******* PUBLIC ******* */

    that.embed = function(container, insert){
        if(cm.isNode(container)){
            // Validate
            switch(insert){
                case 'top':
                    insert = 'insertBefore';
                    break;
                case 'bottom':
                    insert = 'insertAfter';
                    break;
                case 'first':
                    insert = 'insertFirst';
                    break;
                case 'last':
                default:
                    insert = 'appendChild';
                    break;
            }
            if(that.container !== container || that.insert !== insert){
                that.isEmbed = true;
                that.container = container;
                that.insert = insert;
                // Embed
                cm[that.insert](that.node, that.container);
                // Calculate dimensions
                that.getDimensions();
            }
        }
        return that;
    };

    that.remove = function(){
        cm.remove(that.node);
        that.isEmbed = false;
        that.container = null;
        that.insert = null;
        that.height = null;
        that.nodes['container'].style.height = '0px';
        return that;
    };

    that.show = function(height, duration, animate){
        animate = cm.isUndefined(animate) ? that.isAnimate : animate;
        if(height !== that.height){
            that.isShow = true;
            if(animate){
                that.nodes['container'].style[that.transitionDurationProperty] = [duration, 'ms'].join('');
            }
            that.height = height;
            that.nodes['container'].style.height = [that.height, 'px'].join('');
        }
        return that;
    };

    that.hide = function(duration, animate){
        animate = cm.isUndefined(animate) ? that.isAnimate : animate;
        if(height !== that.height){
            that.isShow = false;
            if(animate){
                that.nodes['container'].style[that.transitionDurationProperty] = [duration, 'ms'].join('');
            }
            that.height = 0;
            that.nodes['container'].style.height = [that.height, 'px'].join('');
        }
        return that;
    };

    that.getDimensions = function(){
        if(!that.styleObject){
            that.styleObject = cm.getStyleObject(that.node);
        }
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, null);
        return that.dimensions;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});
App._DummyBlocks = [];

cm.define('App.DummyBlock', {
    'modules' : [
        'Params',
        'Events',
        'DataNodes',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'keyword' : '',
        'type' : 'template-manager',            // template-manager | form-manager | mail-manager
        'removable' : true,
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isDummy = true;
    that.isEditing = false;
    that.isRemoved = false;
    that.styleObject = null;
    that.dimensions = null;

    that.components = {};
    that.nodes = {
        'container' : cm.node('div'),
        'dummy' : cm.node('div')
    };
    that.index = null;
    that.node = null;
    that.zone = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['name'] = [that.params['type'], that.params['keyword']].join('_');
        // Export
        App._DummyBlocks.push(that);
    };

    var render = function(){
        that.node = that.params['node'];
        // Render spinner
        renderSpinner();
        // Calculate dimensions
        that.getDimensions();
        // Construct
        cm.find('App.Editor', that.params['editorName'], null, constructEditor);
    };

    var constructZone = function(classObject){
        if(classObject){
            that.zone = classObject;
            that.zone.addBlock(that, that.index);
        }
    };

    var destructZone = function(classObject){
        if(classObject){
            that.zone = classObject;
            that.zone.removeBlock(that);
            that.zone = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].addBlock(that, that.index);
        }
    };

    var renderSpinner = function(){
        that.nodes['spinner'] = cm.node('div', {'class' : 'app__block-spinner'},
            cm.node('div', {'class' : 'pt__box-loader is-absolute'},
                cm.node('div', {'class' : 'inner'})
            )
        );
        that.nodes['container'].appendChild(that.nodes['spinner']);
    };

    /* ******* PUBLIC ******* */

    that.register = function(classObject){
        constructEditor(classObject);
        return that;
    };

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.params['node'], 'is-editing is-editable is-visible');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.params['node'], 'is-editing is-editable is-visible');
        }
        return that;
    };

    that.setZone = function(zone, index){
        that.index = index;
        destructZone(that.zone);
        constructZone(zone);
        return that;
    };

    that.unsetZone = function(){
        destructZone(that.zone);
        return that;
    };

    that.getIndex = function(){
        if(that.zone){
            that.index = that.zone.getBlockIndex(that);
            return that.index;
        }
        return null;
    };

    that.getLower = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index) || null;
    };

    that.getUpper = function(){
        var index = that.getIndex();
        return that.zone.getBlock(index - 1) || null;
    };

    that.getDragNodes = function(){
        return [that.node];
    };

    that.showSpinner = function(){
        cm.addClass(that.nodes['spinner'], 'is-visible', true);
        return that;
    };

    that.hideSpinner = function(){
        cm.removeClass(that.nodes['spinner'], 'is-visible');
        return that;
    };

    that.clone = function(){
        var params = {
            'node' : cm.clone(that.node, true)
        };
        return that.cloneComponent(params);
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            cm.arrayRemove(App._DummyBlocks, that);
            that.removeFromStack();
            cm.remove(that.node);
            that.triggerEvent('onRemove');
        }
        return that;
    };

    that.getDimensions = function(){
        if(!that.styleObject){
            that.styleObject = cm.getStyleObject(that.node);
        }
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, null);
        return that.dimensions;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});
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
        'copy',

        'createRequest',
        'replaceRequest',
        'moveRequest',
        'deleteRequest',
        'updateRequest',
        'duplicateRequest',
        'copyRequest',

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
        // Register elements
        cm.forEach(App._Zones, function(item){
            item.register(that);
        });
        cm.forEach(App._Blocks, function(item){
            item.register(that);
        });
        cm.forEach(App._DummyBlocks, function(item){
            item.register(that);
        });
        // Set states
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
        // TODO: needs to be redone
        cm.find('Com.GridlistHelper', null, null, function(classObject){
            classObject.enableEditing();
        });
    };

    var setEditorType = function(type){
        if(cm.inArray(that.types, type) && type !== that.editorType){
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

    that.copyRequest = function(block){
        that.triggerEvent('copyRequest', block);
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

    // TODO: for placing not exists blocks, unused, can be removed or user for help tour
    that.place = function(node, block){
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

    that.copy = function(node, block){
        if(node && block){
            node = !cm.isNode(node) ? cm.strToHTML(node) : node;
            that.triggerEvent('copy', node);
            that.triggerEvent('onProcessEnd', node);
            that.components['template'].redraw();
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
            cm.addEvent(menu['copy'], 'click', function(){
                that.copyRequest(block);
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
cm.define('App.FileInput', {
    'extend' : 'Com.FileInput',
    'params' : {
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer',
        'fileUploader' : true,
        'fileUploaderConstructor' : 'App.FileUploaderContainer'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.FileInput.apply(that, arguments);
});
cm.define('App.FileUploader', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'onSelect',
        'onComplete',
        'onGet'
    ],
    'params' : {
        'max' : 0,
        'showStats' : true,
        'completeOnSelect' : true,
        'local' : true,
        'localConstructor' : 'App.FileUploaderLocal',
        'localParams' : {
            'embedStructure' : 'append',
            'fileList' : false
        },
        'fileManagerLazy' : true,
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManager',
        'fileManagerParams' : {
            'embedStructure' : 'append',
            'showStats' : false,
            'fullSize' : true
        },
        'stock' : false,
        'stockConstructor' : 'App.ShutterstockManager',
        'stockParams' : {
            'embedStructure' : 'append',
            'fullSize' : true
        },
        'Com.Tabset' : {
            'embedStructure' : 'append',
            'toggleOnHashChange' : false,
            'calculateMaxHeight' : true
        },
        'Com.FileStats' : {
            'embedStructure' : 'append',
            'toggleBox' : false,
            'inline' : true
        }
    },
    'strings' : {
        'tab_local' : 'Select From PC',
        'tab_filemanager' : 'File Manager',
        'tab_stock' : 'Shutterstock',
        'browse_local_single' : 'Choose file',
        'browse_local_multiple' : 'Choose files',
        'or' : 'or',
        'browse' : 'Browse'
    }
},
function(params){
    var that = this;
    that.nodes = {};
    that.components = {};
    that.items = [];
    that.activeTab = null;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.FileUploader', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.completeHandler = that.complete.bind(that);
        // Add events
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.get = function(){
        var that = this,
            data;
        if(that.activeTab){
            switch(that.activeTab['id']){
                case 'local':
                    data = that.components['local'].get();
                    that.afterGet(data);
                    break;
                case 'fileManager':
                    that.components['fileManager'].get();
                    break;
            }
        }
        return that;
    };

    classProto.complete = function(){
        var that = this,
            data;
        if(that.activeTab){
            switch(that.activeTab['id']){
                case 'local':
                    data = that.components['local'].get();
                    that.afterComplete(data);
                    break;
                case 'fileManager':
                    that.components['fileManager'].complete();
                    break;
                case 'stock':
                    that.components['stock'].complete();
                    break;
            }
        }
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        // Components parameters
        that.params['localParams']['max'] = that.params['max'];
        that.params['fileManagerParams']['max'] = that.params['max'];
        that.params['fileManagerParams']['lazy'] = that.params['fileManagerLazy'];
        that.params['stock']['max'] = that.params['max'];
        that.params['stock']['lazy'] = that.params['fileManagerLazy'];
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        that.triggerEvent('onRenderViewStart');
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__file-uploader'},
            that.nodes['inner'] = cm.node('div', {'class' : 'inner'},
                that.nodes['content'] = cm.node('div', {'class' : 'app__file-uploader__content'})
            )
        );
        // Local
        if(that.params['local']){
            that.nodes['local'] = that.renderLocal();
        }
        // File Manager
        if(that.params['fileManager']){
            that.nodes['fileManager'] = that.renderFileManager();
        }
        // File Manager
        if(that.params['stock']){
            that.nodes['stock'] = that.renderStock();
        }
        // Events
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Init Files Input
        if(that.params['local']){
            cm.getConstructor(that.params['localConstructor'], function(classObject){
                that.components['local'] = new classObject(
                    cm.merge(that.params['localParams'], {
                        'node' : that.nodes['local']['holder']
                    })
                );
                if(that.params['completeOnSelect']){
                    that.components['local'].addEvent('onSelect', function(my, data){
                        that.afterComplete(data);
                    });
                }
            });
        }
        // Init File Manager
        if(that.params['fileManager']){
            cm.getConstructor(that.params['fileManagerConstructor'], function(classObject){
                that.components['fileManager'] = new classObject(
                    cm.merge(that.params['fileManagerParams'], {
                        'node' : that.nodes['fileManager']['holder']
                    })
                );
                that.components['fileManager'].addEvent('onGet', function(my, data){
                    that.afterGet(data);
                });
                that.components['fileManager'].addEvent('onComplete', function(my, data){
                    that.afterComplete(data);
                });
            });
        }
        // Init Stock
        if(that.params['stock']){
            cm.getConstructor(that.params['stockConstructor'], function(classObject){
                that.components['stock'] = new classObject(
                    cm.merge(that.params['stockParams'], {
                        'node' : that.nodes['stock']['holder']
                    })
                );
                that.components['stock'].addEvent('onGet', function(my, data){
                    that.afterGet(data);
                });
                that.components['stock'].addEvent('onComplete', function(my, data){
                    that.afterComplete(data);
                });
            });
        }
        // Init Tabset
        that.renderTabset();
        // Init Stats
        if(that.params['showStats']){
            cm.getConstructor('Com.FileStats', function(classObject, className){
                that.components['stats'] = new classObject(
                    cm.merge(that.params[className], {
                        'container' : that.nodes['content']
                    })
                );
            });
        }
        return that;
    };

    classProto.renderTabset = function(){
        var that = this;
        cm.getConstructor('Com.Tabset', function(classObject, className){
            that.components['tabset'] = new classObject(
                cm.merge(that.params[className], {
                    'container' : that.nodes['content']
                })
            );
            that.components['tabset'].addEvent('onTabShow', function(my, data){
                that.activeTab = data;
                switch(that.activeTab['id']){
                    case 'fileManager':
                        that.components['fileManager'] && that.components['fileManager'].load();
                        break;
                    case 'stock':
                        that.components['stock'] && that.components['stock'].load();
                        break;
                }
            });
            that.renderTabs();
        });
        return that;
    };

    classProto.renderTabs = function(){
        var that = this,
            initialTab;
        if(that.params['local']){
            that.components['tabset'].addTab({
                'id' : 'local',
                'title' : that.lang('tab_local'),
                'content' : that.nodes['local']['li']
            });
            if(cm.isEmpty(initialTab)){
                initialTab = 'local'
            }
        }
        if(that.params['fileManager']){
            that.components['tabset'].addTab({
                'id' : 'fileManager',
                'title' : that.lang('tab_filemanager'),
                'content' : that.nodes['fileManager']['li']
            });
            if(cm.isEmpty(initialTab)){
                initialTab = 'fileManager';
            }
        }
        if(that.params['stock']){
            that.components['tabset'].addTab({
                'id' : 'stock',
                'title' : that.lang('tab_stock'),
                'content' : that.nodes['stock']['li']
            });
            if(cm.isEmpty(initialTab)){
                initialTab = 'stock';
            }
        }
        // Set initial tab
        that.components['tabset'].set(initialTab);
    };

    classProto.renderLocal = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['li'] = cm.node('li',
            nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__local-container'},
                nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'})
            )
        );
        return nodes;
    };

    classProto.renderFileManager = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['li'] = cm.node('li',
            nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__file-manager is-fullsize'},
                nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'})
            )
        );
        return nodes;
    };

    classProto.renderStock = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['li'] = cm.node('li',
            nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__stock is-fullsize'},
                nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'})
            )
        );
        return nodes;
    };

    /* *** AFTER EVENTS *** */

    classProto.afterGet = function(data){
        var that = this;
        that.items = data;
        that.triggerEvent('onGet', that.items);
        return that;
    };

    classProto.afterComplete = function(data){
        var that = this;
        that.items = data;
        that.triggerEvent('onComplete', that.items);
        return that;
    };
});
cm.define('App.FileUploaderContainer', {
    'extend' : 'Com.AbstractContainer',
    'events' : [
        'onComplete',
        'onGet'
    ],
    'params' : {
        'constructor' : 'App.FileUploader',
        'action' : '',
        'placeholder' : true,
        'placeholderConstructor' : 'Com.DialogContainer',
        'placeholderParams' : {
            'renderButtons' : true,
            'params' : {
                'width' : '1000'
            }
        }
    },
    'strings' : {
        'title_single' : 'Please select file',
        'title_multiple' : 'Please select files',
        'close' : 'Cancel',
        'save' : 'Select'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});


cm.getConstructor('App.FileUploaderContainer', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.isRequest = false;
        // Bind context to methods
        that.getHandler = that.get.bind(that);
        that.completeHandler = that.complete.bind(that);
        that.afterCompleteHandler = that.afterComplete.bind(that);
        // Add events
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.validateParams = function(){
        var that = this;
        // Call parent method
        classInherit.prototype.validateParams.apply(that, arguments);
        // Validate Request
        that.isRequest = !cm.isEmpty(that.params['action']) && window.Request && window.Request.send;
        // Validate Language Strings
        that.setLangs({
            'title' : !that.params['params']['max'] || that.params['params']['max'] > 1 ? that.lang('title_multiple') : that.lang('title_single')
        });
    };

    classProto.get = function(e){
        e && cm.preventDefault(e);
        var that = this;
        that.components['controller'] && that.components['controller'].get && that.components['controller'].get();
        return that;
    };

    classProto.complete = function(e){
        e && cm.preventDefault(e);
        var that = this;
        that.components['controller'] && that.components['controller'].complete && that.components['controller'].complete();
        return that;
    };

    /* *** SYSTEM *** */

    classProto.renderControllerEvents = function(){
        var that = this;
        // Call parent method
        classInherit.prototype.renderControllerEvents.apply(that, arguments);
        // Add specific events
        that.components['controller'].addEvent('onGet', function(my, data){
            that.afterGet(data);
        });
        that.components['controller'].addEvent('onComplete', function(my, data){
            that.afterComplete(data);
        });
        // Add Request Event
        if(that.isRequest){
            that.components['controller'].addEvent('onComplete', function(my, data){
                Request.send(that.params['action'], data, 'post', {
                    'node' : that.params['node'],
                    'controller' : that
                });
            });
        }
        return that;
    };

    classProto.renderPlaceholderButtons = function(){
        var that = this;
        that.components['placeholder'].addButton({
            'name' : 'close',
            'label' : that.lang('close'),
            'style' : 'button-transparent',
            'callback' : that.closeHandler
        });
        that.components['placeholder'].addButton({
            'name' : 'save',
            'label' : that.lang('save'),
            'style' : 'button-primary',
            'callback' : that.completeHandler
        });
        return that;
    };

    /* *** AFTER EVENTS *** */

    classProto.afterGet = function(data){
        var that = this;
        that.triggerEvent('onGet', data);
        return that;
    };

    classProto.afterComplete = function(data){
        var that = this;
        that.triggerEvent('onComplete', data);
        that.close();
        return that;
    };
});
cm.define('App.FileUploaderLocal', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'onSelect'
    ],
    'params' : {
        'max' : 0,
        'fileList' : true,
        'fileListConstructor' : 'App.MultipleFileInput',
        'fileListParams' : {
            'local' : false,
            'dropzone' : false,
            'fileManager' : false,
            'fileUploader' : false,
            'embedStructure' : 'append'
        },
        'dropzone' : true,
        'dropzoneConstructor' : 'Com.FileDropzone',
        'dropzoneParams' : {
            'embedStructure' : 'append',
            'rollover' : false,
            'height' : 256
        },
        'showOverlay' : true,
        'overlayDelay' : 'cm._config.loadDelay',
        'Com.Overlay' : {
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : true,
            'showContent' : false,
            'position' : 'absolute',
            'theme' : 'light'
        },
        'Com.FileReader' : {}
    },
    'strings' : {
        'browse_local_single' : 'Choose file',
        'browse_local_multiple' : 'Choose files',
        'or' : 'or',
        'browse' : 'Browse'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.FileUploaderLocal', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.nodes = {};
        that.components = {};
        that.items = [];
        that.isMultiple = false;
        that.isProccesing = false;
        that.overlayDelay = null;
        // Bind context to methods
        that.browseActionHandler = that.browseAction.bind(that);
        that.processFilesHandler = that.processFiles.bind(that);
        // Add events
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.get = function(){
        var that = this;
        return that.items;
    };

    classProto.validateParams = function(){
        var that = this;
        that.isMultiple = !that.params['max'] || that.params['max'] > 1;
        // Validate Language Strings
        that.setLangs({
            'browse_local' : !that.params['max'] || that.params['max'] > 1 ? that.lang('browse_local_multiple') : that.lang('browse_local_single')
        });
        // Components parameters
        that.params['fileListParams']['max'] = that.params['max'];
        that.params['dropzoneParams']['max'] = that.params['max'];
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        that.triggerEvent('onRenderViewStart');
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__local'},
            that.nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'},
                cm.node('div', {'class' : 'pt__buttons pull-center'},
                    cm.node('div', {'class' : 'inner'},
                        cm.node('div', {'class' : 'browse-button'},
                            cm.node('button', {'type' : 'button','class' : 'button button-primary button--xlarge'}, that.lang('browse_local')),
                            cm.node('div', {'class' : 'inner'},
                                that.nodes['input'] = cm.node('input', {'type' : 'file'})
                            )
                        )
                    )
                )
            )
        );
        if(that.params['dropzone']){
            that.nodes['dropzoneHolder'] = cm.node('div', {'class' : 'app__file-uploader__holder'},
                cm.node('div', {'class' : 'app__file-uploader__title'}, that.lang('or')),
                that.nodes['dropzone'] = cm.node('div', {'class' : 'app__file-uploader__dropzone'})
            );
            cm.appendChild(that.nodes['dropzoneHolder'], that.nodes['container']);
        }
        if(that.params['fileList']){
            that.nodes['files'] = cm.node('div', {'class' : 'app__file-uploader__files is-hidden'});
            cm.appendChild(that.nodes['files'], that.nodes['container']);
        }
        that.isMultiple && that.nodes['input'].setAttribute('multiple', 'multiple');
        // Events
        that.triggerEvent('onRenderViewProcess');
        cm.addEvent(that.nodes['input'], 'change', that.browseActionHandler);
        that.triggerEvent('onRenderViewEnd');
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Init Overlay
        cm.getConstructor('Com.Overlay', function(classConstructor, className){
            that.components['overlay'] = new classConstructor(
                cm.merge(that.params[className], {
                    'container' : that.nodes['container']
                })
            );
        });
        // Init FilerReader
        cm.getConstructor('Com.FileReader', function(classObject, className){
            that.components['reader'] = new classObject(that.params[className]);
        });
        // Init Dropzone
        if(that.params['dropzone']){
            cm.getConstructor(that.params['dropzoneConstructor'], function(classObject){
                that.components['dropzone'] = new classObject(
                    cm.merge(that.params['dropzoneParams'], {
                        'container' : that.nodes['dropzone']
                    })
                );
                that.components['dropzone'].addEvent('onSelect', function(my, data){
                    that.processFiles(data);
                });
            });
        }
        // Init Files Input
        if(that.params['fileList']){
            cm.getConstructor(that.params['fileListConstructor'], function(classObject){
                that.components['fileList'] = new classObject(
                    cm.merge(that.params['fileListParams'], {
                        'node' : that.nodes['files']
                    })
                );
                that.components['fileList'].addEvent('onItemAddEnd', function(){
                    if(that.components['fileList'].get().length){
                        cm.removeClass(that.nodes['files'], 'is-hidden');
                    }
                });
                that.components['fileList'].addEvent('onItemRemoveEnd', function(){
                    if(!that.components['fileList'].get().length){
                        cm.addClass(that.nodes['files'], 'is-hidden');
                    }
                });
            });
        }
    };

    /* *** PROCESS FILES *** */

    classProto.browseAction = function(e){
        var that = this,
            length = that.params['max'] ? Math.min(e.target.files.length, (that.params['max'] - that.items.length)) : e.target.files.length,
            data = [];
        cm.preventDefault(e);
        cm.forEach(length, function(i){
            data.push(e.target.files[i]);
        });
        that.processFiles(data);
        return that;
    };

    classProto.processFiles = function(data){
        var that = this,
            length = data.length;
        // Show Overlay
        if(that.params['showOverlay']){
            that.overlayDelay = setTimeout(function(){
                if(that.components['overlay'] && !that.components['overlay'].isOpen){
                    that.components['overlay'].open();
                }
            }, that.params['overlayDelay']);
        }
        // Process
        cm.forEach(data, function(file, i){
            that.components['reader'].read(file, function(item){
                that.items[i] = item;
                if(cm.getCount(that.items) === length){
                    that.finalizeFiles();
                }
            });
        });
        return that;
    };

    classProto.finalizeFiles = function(){
        var that = this;
        // Render Files List
        if(that.components['fileList']){
            that.renderFileList();
        }
        // Hide Overlay
        if(that.params['showOverlay']){
            that.overlayDelay && clearTimeout(that.overlayDelay);
            if(that.components['overlay'] && that.components['overlay'].isOpen){
                that.components['overlay'].close();
            }
        }
        // Trigger events
        that.triggerEvent('onSelect', that.items);
        return that;
    };

    classProto.renderFileList = function(){
        var that = this;
        cm.forEach(that.items, function(item){
            that.components['fileList'].addItem({'value' : item}, true);
        });
        return that;
    };
});
cm.define('App.Flow', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'controllerEvents' : true,
        'scenario' : App.FlowScenario,
        'directorConstructor' : 'App.FlowDirector',
        'directorParams' : {
            'autoStart' : false
        }
    },
    'strings' : {
        'description' : 'Choose a course:'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Flow', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.items = [];
        // Binds
        that.renderListItemHandler = that.renderListItem.bind(that);
    };

    classProto.onValidateParams = function(){
        var that = this;
        // Validate Scenario
        if(cm.isString(that.params['scenario'])){
            that.params['scenario'] = cm.parseJSON(that.params['scenario']);
        }
        // Sort scenario by order
        that.params['scenario'] = cm.arraySort(that.params['scenario'], 'order', 'desc');
    };

    classProto.onDestructProcess = function(){
        var that = this;
        that.components['director'] && !that.components['director'].isRunning && that.components['director'].destruct();
    };

    /******* VIEW MODEL *******/

    classProto.renderView = function(){
        var that = this;
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__flow__list'},
            cm.node('h4', that.lang('description')),
            cm.node('div', {'class' : 'pt__listing-items'},
                that.nodes['items'] = cm.node('ul')
            )
        );
        // Items
        cm.forEach(that.params['scenario'], that.renderListItemHandler);
    };

    classProto.renderListItem = function(item){
        var that = this,
            nodes =  {};
        // Validate scenario
        item['nodes'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('a', item['title'])
        );
        // Events
        cm.addEvent(nodes['link'], 'click', function(e){
            cm.preventDefault(e);
            that.components['director']
                .setScenario(item['data'])
                .setTarget(nodes['link'])
                .start();
        });
        // Embed
        cm.appendChild(nodes['container'], that.nodes['items']);
        that.items.push(item);
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Init Director
        cm.getConstructor(that.params['directorConstructor'], function(classObject){
            that.components['director'] = new classObject(that.params['directorParams']);
        });
    };
});
cm.define('App.FlowContainer', {
    'extend' : 'Com.AbstractContainer',
    'params' : {
        'constructor' : 'App.Flow',
        'placeholder' : true,
        'placeholderConstructor' : 'Com.DialogContainer',
        'placeholderParams' : {
            'params' : {
                'width' : 500,
                'className' : 'app__flow__dialog',
                'documentScroll' : true
            }
        }
    },
    'strings' : {
        'title' : 'QuickSilk Flow'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});


cm.getConstructor('App.FlowContainer', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;
});
cm.define('App.FlowDirector', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true,
        'destructOnStop' : true,
        'container' : 'document.body',
        'name' : 'app-helptour',
        'sidebarName' : 'app-sidebar',
        'topMenuName' : 'app-topmenu',
        'templateName' : 'app-template',
        'notificationName' : 'app-notification',
        'duration' : 500,
        'adaptiveFrom' : 768,
        'popupIndent' : 24,
        'overlayConstructor' : 'Com.Overlay',
        'overlayParams' : {
            'container' : 'document.body',
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : false,
            'showContent' : false,
            'name' : '',
            'theme' : 'transparent',
            'position' : 'absolute'
        }
    },
    'strings' : {
        'next' : 'Next',
        'back' : 'Back',
        'close' : 'Close',
        'cancel' : 'Cancel',
        'finish' : 'Finish'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.FlowDirector', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;
    
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.isRunning = false;
        that.scenario = App.HelpTourScenario;
        that.dimensions = {
            'sidebarCollapsed' : 0,
            'sidebarExpanded' : 0,
            'topMenu' : 0,
            'popupHeight' : 0,
            'popupSelfHeight' : 0,
            'popupContentHeight' : 0
        };
        that.startOptions = {
            'sidebarExpanded' : false,
            'sidebarTab' : 'modules',
            'notificationShow' : false
        };
        that.startX = 0;
        that.startY = 0;
        that.components = {
            'overlays' : {}
        };
        that.currentStage = -1;         // Scene ID
        that.currentScene = null;       // Scene Object
        that.currentSceneNode = null;
        that.previousStage = null;
        that.previousScene = null;
        that.previousSceneNode = null;
        that.sceneIntervals = {};
        // Binds
        that.startHandler = that.start.bind(that);
        that.stopHandler = that.stop.bind(that);
        that.nextHandler = that.next.bind(that);
        that.prevHandler = that.prev.bind(that);
        that.prepareHandler = that.prepare.bind(that);
        that.keyDownEventHandler = that.keyDownEvent.bind(that);
    };
    
    classProto.onValidateParamsProcess = function(){
        var that = this;
        // Overlay
        that.params['overlayParams']['container'] = that.params['container'];
        that.params['overlayParams']['name'] = [that.params['name'], 'overlay'].join('-')
    };

    classProto.onGetLESSVariablesProcess = function(){
        var that = this;
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppHelpTour-Duration', that.params['duration']);
        that.params['adaptiveFrom'] = cm.getLESSVariable('AppHelpTour-AdaptiveFrom', that.params['adaptiveFrom'], true);
    };
    
    classProto.onSetEvents = function(){
        var that = this;
        cm.addEvent(window, 'keydown', that.keyDownEventHandler);
    };

    classProto.onUnsetEvents = function(){
        var that = this;
        cm.removeEvent(window, 'keydown', that.keyDownEventHandler);
    };

    classProto.onRedraw = function(){
        var that = this;
        that.isRunning && that.setPopupPosition();
    };
    
    /******* VIEW MODEL *******/

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Init Overlay
        cm.getConstructor(that.params['overlayConstructor'], function(classConstructor){
            that.components['overlays']['main'] = new classConstructor(
                cm.merge(that.params['overlayParams'], {
                    'position' : 'fixed'
                })
            );
            that.components['overlays']['sidebar'] = new classConstructor(that.params['overlayParams']);
            that.components['overlays']['topMenu'] = new classConstructor(that.params['overlayParams']);
            that.components['overlays']['template'] = new classConstructor(
                cm.merge(that.params['overlayParams'], {
                    'position' : 'fixed'
                })
            );
        });
        return that;
    };

    /******* CONTROLS *******/

    classProto.prepare = function(){
        var that = this;
        // Get Sidebar
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject;
            that.components['overlays']['sidebar'].embed(that.components['sidebar'].getNodes('inner'));
        });
        // Get TopMenu
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
            that.components['overlays']['topMenu'].embed(that.components['topMenu'].getNodes('inner'));
        });
        // Get Template
        cm.find('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.components['overlays']['template'].embed(that.components['template'].getNodes('container'));
        });
        // Get Notification
        cm.find('App.Notification', that.params['notificationName'], null, function(classObject){
            that.components['notification'] = classObject;
        });
        // Start
        if(that.components['sidebar'] && that.components['topMenu'] && that.components['template']){
            return true;
        }else{
            cm.errorLog({
                'type' : 'error',
                'name' : that._name['full'],
                'message' : ['Required components does not constructed.'].join(' ')
            });
            return false;
        }
    };

    classProto.start = function(){
        var that = this,
            isPrepare = that.prepare();
        if(!that.isRunning && isPrepare){
            that.isRunning = true;
            // Close Containers
            cm.find('Com.AbstractContainer', null, null, function(classObject){
                classObject.close();
            }, {'childs' : true});
            // Render Popup
            that.renderPopup();
            // Save Sidebar State
            that.startOptions['sidebarExpanded'] = that.components['sidebar'].isExpanded;
            if(that.components['sidebar'].isExpanded){
                that.components['sidebar'].collapse();
            }
            that.startOptions['sidebarTab'] = that.components['sidebar'].getTab();
            that.components['sidebar'].unsetTab();
            // Save Notification State
            if(that.components['notification']){
                that.startOptions['notificationShow'] = that.components['notification'].isShow;
                if(that.components['notification'].isShow){
                    that.components['notification'].hide();
                }
            }
            // Collapse menu (mobile)
            that.components['topMenu'].collapse();
            // Show overlays
            cm.forEach(that.components['overlays'], function(item){
                item.open();
            });
            // Start scenario
            that.setStage(0);
        }
    };

    classProto.stop = function(){
        var that = this;
        if(that.isRunning){
            that.isRunning = false;
            // Remove Popup
            that.removePopup();
            // Restore Sidebar State
            if(that.startOptions['sidebarExpanded'] && !that.components['sidebar'].isExpanded){
                that.components['sidebar'].expand();
            }else if(!that.startOptions['sidebarExpanded'] && that.components['sidebar'].isExpanded){
                that.components['sidebar'].collapse();
            }
            that.components['sidebar'].setTab(that.startOptions['sidebarTab']);
            // Restore Notification State
            if(that.components['notification']){
                if(that.startOptions['notificationShow'] && !that.components['notification'].isShow){
                    that.components['notification'].show();
                }else if(!that.startOptions['notificationShow'] && that.components['notification'].isShow){
                    that.components['notification'].hide();
                }
            }
            // Hide overlays
            cm.forEach(that.components['overlays'], function(item){
                item.close();
            });
            // Stop scenario
            that.unsetStage();
            // Destruct
            that.params['destructOnStop'] && that.destruct();
        }
        return that;
    };

    classProto.next = function(){
        var that = this;
        if(that.currentStage >= 0){
            if(that.scenario[that.currentStage + 1]){
                that.setStage(that.currentStage + 1);
            }else{
                that.stop();
            }
        }
        return that;
    };

    classProto.prev = function(){
        var that = this;
        if(that.currentStage >= 0){
            if(that.scenario[that.currentStage - 1]){
                that.setStage(that.currentStage - 1);
            }else{
                that.stop();
            }
        }
        return that;
    };

    /******* SCREENPLAY *******/

    classProto.setScenario = function(scenario){
        var that = this;
        that.scenario = scenario;
        return that;
    };

    classProto.setStage = function(stage){
        var that = this;
        if(that.scenario[stage]){
            // Destruct Previous Scene
            that.unsetStage();
            // Construct New Scene
            that.currentStage = stage;
            that.currentScene = that.scenario[stage];
            // Set Overlays
            cm.forEach(that.currentScene['overlays'], function(item, key){
                that.components['overlays'][key].setTheme(item);
            });
            // Set Sidebar
            if(!that.currentScene['sidebar']){
                that.components['sidebar']
                    .unsetTab()
                    .collapse();
            }else{
                that.components['sidebar']
                    .setTab(that.currentScene['sidebar'])
                    .expand();
            }
            // Set Top Menu
            that.components['topMenu'].setActiveItem(that.currentScene['topMenu']);
            // Set Popup Arrow
            if(that.currentScene['arrow']){
                cm.addClass(that.nodes['popupArrows'][that.currentScene['arrow']], 'is-show');
            }
            // Set Popup Buttons
            if(that.currentStage === 0){
                that.nodes['back'].innerHTML = that.lang('close');
                that.nodes['next'].innerHTML = that.lang('next');
            }else if(that.currentStage === that.scenario.length - 1){
                that.nodes['back'].innerHTML = that.lang('back');
                that.nodes['next'].innerHTML = that.lang('finish');
            }else{
                that.nodes['back'].innerHTML = that.lang('back');
                that.nodes['next'].innerHTML = that.lang('next');
            }
            // Set Popup Content
            if(!that.previousStage){
                cm.addClass(that.nodes['popupContent'], 'is-immediately', true);
            }
            that.currentSceneNode = cm.node('div', {'class' : 'popup__content__item', 'innerHTML' : that.currentScene['content']});
            cm.appendChild(that.currentSceneNode, that.nodes['popupContent']);
            cm.addClass(that.currentSceneNode, 'is-show', true);
            // Set Popup Position
            that.setPopupPosition();
            // Construct
            that.currentScene['construct'] && that.currentScene['construct'].call(that);
        }
    };

    classProto.unsetStage = function(){
        var that = this;
        if(that.currentStage >= 0){
            that.previousStage = that.currentStage;
            that.previousScene = that.currentScene;
            that.previousSceneNode = that.currentSceneNode;
            // Top Menu
            that.components['topMenu'].unsetActiveItem(that.previousScene['topMenu']);
            // Clear Popup Arrow
            if(that.previousScene['arrow']){
                cm.removeClass(that.nodes['popupArrows'][that.previousScene['arrow']], 'is-show');
            }
            // Clear Scene Intervals
            cm.forEach(that.sceneIntervals, function(item){
                clearInterval(item);
            });
            // Remove Popup Node
            (function(node){
                setTimeout(function(){
                    cm.remove(node);
                }, that.params['duration']);
            })(that.previousSceneNode);
            // Remove immediately fix
            setTimeout(function(){
                cm.removeClass(that.nodes['popupContent'], 'is-immediately', true);
            }, 5);
            // Destruct
            that.previousScene['destruct'] && that.previousScene['destruct'].call(that);
        }
        that.currentStage = -1;
    };

    /******* POPUP *******/

    classProto.renderPopup = function(){
        var that = this;
        that.nodes['popupArrows'] = {};
        that.nodes['popup'] = cm.node('div', {'class' : 'app__helptour__popup'},
            that.nodes['popupArrows']['top'] = cm.node('div', {'class' : 'popup__arrow popup__arrow--top'}),
            that.nodes['popupArrows']['right'] = cm.node('div', {'class' : 'popup__arrow popup__arrow--right'}),
            that.nodes['popupArrows']['bottom'] = cm.node('div', {'class' : 'popup__arrow popup__arrow--bottom'}),
            that.nodes['popupArrows']['left'] = cm.node('div', {'class' : 'popup__arrow popup__arrow--left'}),
            that.nodes['popupClose'] = cm.node('div', {'class' : 'popup__close', 'title' : that.lang('close')}),
            that.nodes['popupContent'] = cm.node('div', {'class' : 'popup__content'}),
            that.nodes['popupButtons'] = cm.node('div', {'class' : 'popup__buttons'},
                cm.node('div', {'class' : 'btn-wrap pull-center'},
                    that.nodes['back'] = cm.node('button', that.lang('back')),
                    that.nodes['next'] = cm.node('button', that.lang('next'))
                )
            )
        );
        that.setPopupStartPosition();
        // Append
        cm.appendChild(that.nodes['popup'], that.params['container']);
        cm.addClass(that.nodes['popup'], 'is-show', true);
        // Events
        cm.addEvent(that.nodes['popupClose'], 'click', that.stopHandler);
        cm.addEvent(that.nodes['next'], 'click', that.nextHandler);
        cm.addEvent(that.nodes['back'], 'click', that.prevHandler);
    };

    classProto.removePopup = function(){
        var that = this;
        // Set end position
        that.setPopupStartPosition();
        cm.removeClass(that.nodes['popup'], 'is-show');
        // Remove node
        setTimeout(function(){
            cm.remove(that.nodes['popup']);
        }, that.params['duration']);
    };

    classProto.setPopupStartPosition = function(){
        var that = this;
        if(!that.startX){
            that.startX = [Math.round(cm.getX(that.params['node']) + that.params['node'].offsetWidth / 2), 'px'].join('');
        }
        if(!that.startY){
            that.startY = [Math.round(cm.getY(that.params['node']) + that.params['node'].offsetHeight / 2), 'px'].join('');
        }
        cm.setCSSTranslate(that.nodes['popup'], that.startX, that.startY, 0, 'scale(0)');
    };

    classProto.setPopupPosition = function(){
        var that = this,
            position, pageSize, top, left, conentHeight, topMenuItem;
        if(that.currentScene){
            pageSize = cm.getPageSize();
            // Desktop or mobile view
            if(pageSize['winWidth'] > that.params['adaptiveFrom']){
                that.getDimensions();
                position = that.currentScene['position'].split(':');
                conentHeight = that.dimensions['popupContentHeight'];
                // Set position
                switch(position[0]){
                    // Window related position
                    case 'window':
                        switch(position[1]){
                            case 'top':
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = that.params['popupIndent'];
                                break;
                            case 'bottom':
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = pageSize['winHeight'] - that.dimensions['popupHeight'] - that.params['popupIndent'];
                                break;
                            case 'center':
                            default:
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = Math.round((pageSize['winHeight'] - that.dimensions['popupHeight']) / 2);
                                break;
                        }
                        break;
                    // Top Menu related position
                    case 'topMenu':
                        switch(position[1]){
                            case 'center':
                            default:
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = that.dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                        }
                        break;
                    // Top Menu Item related position
                    case 'topMenuItem':
                        topMenuItem = that.components['topMenu'].getItem(position[1]);
                        if(!topMenuItem){
                            left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        }else if(position[2] && position[2] === 'dropdown' && topMenuItem['dropdown']){
                            if(position[3] && position[3] === 'left'){
                                left = cm.getX(topMenuItem['dropdown']) - that.nodes['popup'].offsetWidth - that.params['popupIndent'];
                            }else{
                                left = cm.getX(topMenuItem['dropdown']) + topMenuItem['dropdown'].offsetWidth + that.params['popupIndent'];
                            }
                        }else if(topMenuItem['container']){
                            if(position[3] && position[3] === 'left'){
                                left = cm.getX(topMenuItem['container']) + topMenuItem['container'].offsetWidth - that.nodes['popup'].offsetWidth;
                            }else{
                                left = cm.getX(topMenuItem['container']);
                            }
                        }else{
                            left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        }
                        top = that.dimensions['topMenu'] + that.params['popupIndent'];
                        break;
                    // Template related position
                    case 'template':
                        switch(position[1]){
                            case 'top':
                                left = (that.components['sidebar'].isExpanded ? that.dimensions['sidebarExpanded'] : that.dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = that.dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                            case 'bottom':
                                left = (that.components['sidebar'].isExpanded ? that.dimensions['sidebarExpanded'] : that.dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = pageSize['winHeight'] - that.dimensions['popupHeight'] - that.params['popupIndent'];
                                break;
                            case 'left':
                                left = (that.components['sidebar'].isExpanded ? that.dimensions['sidebarExpanded'] : that.dimensions['sidebarCollapsed']) + that.params['popupIndent'];
                                top = Math.round((pageSize['winHeight'] - that.dimensions['popupHeight']) / 2);
                                break;
                            case 'left-top':
                                left = (that.components['sidebar'].isExpanded ? that.dimensions['sidebarExpanded'] : that.dimensions['sidebarCollapsed']) + that.params['popupIndent'];
                                top = that.dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                            case 'center':
                            default:
                                left = (that.components['sidebar'].isExpanded ? that.dimensions['sidebarExpanded'] : that.dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = Math.round((pageSize['winHeight'] +  that.dimensions['topMenu'] - that.dimensions['popupHeight']) / 2);
                                break;
                        }
                        break;
                    // Default position
                    default:
                        left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        top = Math.round((pageSize['winHeight'] - that.dimensions['popupHeight']) / 2);
                        break;
                }
            }else{
                left = 0;
                top = 0;
                conentHeight = 'auto';
            }
            that.nodes['popupContent'].style.height = conentHeight === 'auto' ? conentHeight : [conentHeight, 'px'].join('');
            cm.setCSSTranslate(that.nodes['popup'], [left, 'px'].join(''), [top, 'px'].join(''), 0, 'scale(1)');
        }
    };

    /******* HELPERS *******/

    classProto.getDimensions = function(){
        var that = this;
        that.dimensions['sidebarCollapsed'] = cm.getLESSVariable('AppSidebar-WidthCollapsed', 0, true);
        that.dimensions['sidebarExpanded'] = cm.getLESSVariable('AppSidebar-WidthExpanded', 0, true);
        that.dimensions['topMenu'] = cm.getLESSVariable('AppTopMenu-Height', 0, true);
        if(!that.dimensions['popupSelfHeight']){
            that.dimensions['popupSelfHeight'] = that.nodes['popup'].offsetHeight;
        }
        if(that.currentSceneNode){
            that.dimensions['popupContentHeight'] = that.currentSceneNode.offsetHeight;
        }
        that.dimensions['popupHeight'] = that.dimensions['popupSelfHeight'] + that.dimensions['popupContentHeight'];
    };

    classProto.keyDownEvent = function(e){
        var that = this;
        if(that.isRunning){
            cm.preventDefault(e);
            switch(e.keyCode){
                case 27:
                    that.stop();
                    break;
                case 37:
                    that.prev();
                    break;
                case 39:
                    that.next();
                    break;
            }
        }
    };

    classProto.setTarget = function(node){
        var that = this;
        if(cm.isNode(node)){
            that.params['node'] = node;
        }
        return that;
    };
});
cm.define('App.FontInput', {
    'extend' : 'Com.AbstractInput',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'embedStructure' : 'replace',
        'controllerEvents' : true,
        'setHiddenInput' : true,
        'setContentInput' : true,
        'className' : 'app__file-input',
        'styles' : {
            'font-family' : [
                "Arial, Helvetica, sans-serif",
                "Arial Black, Gadget, sans-serif",
                "Courier New, Courier, monospace",
                "Georgia, serif",
                "Impact, Charcoal, sans-serif",
                "Lucida Console, Monaco, monospace",
                "Lucida Sans Unicode, Lucida Grande, sans-serif",
                "Palatino Linotype, Book Antiqua, Palatino, serif",
                "Tahoma, Geneva, sans-serif",
                "Times New Roman, Times, serif",
                "Trebuchet MS, Helvetica, sans-serif",
                "Verdana, Geneva, sans-serif"
            ],
            'line-height' : [8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 108, 120],
            'font-size' : [8, 9, 10, 11, 12, 13, 14, 18, 20, 22, 24, 28, 32, 36, 42, 48, 54, 60, 72, 96],
            'font-weight' : [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'font-style' : ['normal', 'italic'],
            'text-decoration' : ['none', 'underline']
        },
        'styleBinds' : {
            'font-weight' : {
                'normal' : 400,
                'bold' : 700
            }
        },
        'controls' : {
            'font-family' : true,
            'line-height' : true,
            'font-size' : true,
            'font-weight' : true,
            'font-style' : true,
            'text-decoration' : true,
            'color' : true,
            'background' : true
        },
        'showResetButtons' : true,
        'overrideControls' : true,
        'previewTag' : 'div',
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'top' : 'targetHeight + 6',
            'left' : '-6',
            'className' : 'app__stylizer-tooltip'
        },
        'Com.Select' : {
            'renderInBody' : false
        },
        'Com.ColorPicker' : {
            'renderInBody' : false,
            'showLabel' : false,
            'showClearButton' : false
        }
    },
    'strings' : {
        '100' : 'Thin',
        '200' : 'Extra Light',
        '300' : 'Light',
        '400' : 'Regular',
        '500' : 'Medium',
        '600' : 'Semi Bold',
        '700' : 'Bold',
        '800' : 'Extra Bold',
        '900' : 'Black'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractInput.apply(that, arguments);
});

cm.getConstructor('App.FontInput', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.previousRawValue = null;
        that.rawValue = null;
    };

    /* *** PARAMS *** */

    classProto.onValidateParamsEnd = function(){
        var that = this;
        // Validate config
        if(cm.isString(that.params['value'])){
            that.params['value'] = cm.parseJSON(that.params['value']);
        }
        if(cm.isString(that.params['defaultValue'])){
            that.params['defaultValue'] = cm.parseJSON(that.params['defaultValue']);
        }
        that.validateItemConfig(that.params['value']);
        that.validateItemConfig(that.params['defaultValue']);
        // Extend global styles config
        that.extendGlobalConfig(that.params['value']);
        that.extendGlobalConfig(that.params['defaultValue']);
        that.sortGlobalConfig();
        // Override controls
        if(that.params['overrideControls']){
            cm.forEach(that.params['controls'], function(item, key){
                that.params['controls'][key] = !!(that.params['defaultValue'][key] || that.params['value'][key]);
            });
        }
    };

    classProto.validateItemConfig = function(config){
        var that = this;
        if(config['line-height']){
            if(config['line-height'] !== 'normal'){
                config['line-height'] = parseInt(config['line-height']);
            }
        }
        if(config['font-size']){
            config['font-size'] = parseInt(config['font-size']);
        }
        if(config['font-weight']){
            if(that.params['styleBinds']['font-weight'][config['font-weight']]){
                config['font-weight'] = that.params['styleBinds']['font-weight'][config['font-weight']];
            }
            config['font-weight'] = parseInt(config['font-weight']);
            config['font-weight'] = cm.inArray(that.params['styles']['font-weight'], config['font-weight'])? config['font-weight'] : 400;
        }
        if(config['font-style']){
            config['font-style'] = cm.inArray(that.params['styles']['font-style'], config['font-style'])? config['font-style'] : 'normal';
        }
        if(config['text-decoration']){
            config['text-decoration'] = cm.inArray(that.params['styles']['text-decoration'], config['text-decoration'])? config['text-decoration'] : 'none';
        }
        return config;
    };

    classProto.extendGlobalConfig = function(config){
        var that = this;
        if(config['font-size'] && !cm.inArray(that.params['styles']['font-size'], config['font-size'])){
            that.params['styles']['font-size'].push(config['font-size']);
        }
        if(config['line-height'] && !cm.inArray(that.params['styles']['line-height'], config['line-height'])){
            that.params['styles']['line-height'].push(config['line-height']);
        }
        if(config['font-family'] && !cm.inArray(that.params['styles']['font-family'], config['font-family'])){
            that.params['styles']['font-family'].push(config['font-family']);
        }
        return config;
    };

    classProto.sortGlobalConfig = function(){
        var that = this;
        that.params['styles']['font-size'].sort(function(a, b){
            return a - b;
        });
        that.params['styles']['line-height'].sort(function(a, b){
            if(a === 'normal'){
                return -1;
            }else if(b === 'normal'){
                return 1;
            }
            return a - b;
        });
        that.params['styles']['font-family'].sort(function(a, b){
            var t1 = a.toLowerCase().replace(/["']/g, ''),
                t2 = b.toLowerCase().replace(/["']/g, '');
            return (t1 < t2)? -1 : ((t1 > t2)? 1 : 0);
        });
        return that;
    };

    /* *** VIEW - VIEW MODEL *** */

    classProto.renderContent = function(){
        var that = this,
            nodes = {};
        that.nodes['content'] = nodes;
        // Structure
        nodes['container'] = cm.node('div', {'class' : 'app__stylizer__item'},
            nodes['preview'] = cm.node(that.params['previewTag'], {'class' : 'item-preview', 'innerHTML' : that.params['placeholder']})
        );
        cm.addClass(nodes['preview'], that.params['previewClassName']);
        // Render tooltip structure view
        that.renderTooltipView();
        // Push
        return nodes['container'];
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // Render Tooltip
        that.renderTooltipControls();
        // Init Tooltip
        cm.getConstructor('Com.Tooltip', function(classConstructor, className){
            that.components['tooltip'] = new classConstructor(
                cm.merge(that.params[className], {
                    'content' : that.nodes['tooltip']['container'],
                    'target' : that.nodes['content']['container'],
                    'events' : {
                        'onShowStart' : function(){
                            cm.addClass(that.nodes['content']['container'], 'active')
                        },
                        'onHideStart' : function(){
                            cm.removeClass(that.nodes['content']['container'], 'active')
                        }
                    }
                })
            );
        });
        return that;
    };

    /* *** TOOLTIP VIEW - VIEW MODEL *** */

    classProto.renderTooltipView = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['container'] = cm.node('div', {'class' : 'pt__toolbar'},
            nodes['inner'] = cm.node('div', {'class' : 'inner'},
                nodes['group1'] = cm.node('ul', {'class' : 'group'}),
                nodes['group2'] = cm.node('ul', {'class' : 'group'}),
                nodes['group3'] = cm.node('ul', {'class' : 'group'}),
                nodes['group4'] = cm.node('ul', {'class' : 'group'})
            )
        );
        // Push
        that.nodes['tooltip'] = nodes;
        return nodes['container'];
    };

    classProto.renderTooltipControls = function(){
        var that = this;
        // Font-Family
        if(that.params['controls']['font-family']){
            that.renderFontFamilyControl();
        }
        // Font-Weight
        if(that.params['controls']['font-weight']){
            that.renderFontWeightControl();
        }
        // Font-Style
        if(that.params['controls']['font-style']){
            that.renderFontStyleControl();
        }
        // Text-Decoration
        if(that.params['controls']['text-decoration']){
            that.renderTextDecorationControl();
        }
        // Font-Size
        if(that.params['controls']['font-size']){
            that.renderFontSizeControl();
        }
        // Line-Height
        if(that.params['controls']['line-height']){
            that.renderLineHeightControl();
        }
        // Color
        if(that.params['controls']['color']){
            that.renderColorControl();
        }
        // Background
        if(that.params['controls']['background']){
            that.renderBackgroundControl();
        }
        // Reset
        if(that.params['showResetButtons']){
            that.renderResetControl();
        }else{
            cm.remove(that.nodes['tooltip']['group4']);
        }
    };

    classProto.renderFontFamilyControl = function(){
        var that = this;
        // Structure
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select medium'},
                that.nodes['tooltip']['font-family'] = cm.node('select', {'title' : that.lang('Font')})
            )
        );
        cm.forEach(that.params['styles']['font-family'], function(item){
            that.nodes['tooltip']['font-family'].appendChild(
                cm.node('option', {'value' : item, 'style' : {'font-family' : item}}, item.replace(/["']/g, '').split(',')[0])
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['font-family'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['font-family'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'font-family' : value}), true);
                        }
                    }
                })
            );
        });
        return that;
    };

    classProto.renderFontWeightControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group1'].appendChild(
            that.nodes['tooltip']['font-weight-button'] = cm.node('li', {'class' : 'button button-secondary is-icon'},
                cm.node('span', {'class' : 'icon toolbar bold'})
            )
        );
        cm.addEvent(that.nodes['tooltip']['font-weight-button'], 'click', function(){
            that.set(cm.merge(that.value, {'font-weight' : (that.value['font-weight'] > 400? 400 : 700)}), true);
        });
        // Select
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select medium'},
                that.nodes['tooltip']['font-weight'] = cm.node('select', {'title' : that.lang('Weight')})
            )
        );
        cm.forEach(that.params['styles']['font-weight'], function(item){
            that.nodes['tooltip']['font-weight'].appendChild(
                cm.node('option', {'value' : item}, that.lang(item))
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['font-weight'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['font-weight'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'font-weight' : value}), true);
                        }
                    }
                })
            );
        });
        return that;
    };

    classProto.renderFontStyleControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group1'].appendChild(
            that.nodes['tooltip']['font-style-button'] = cm.node('li', {'class' : 'button button-secondary is-icon'},
                cm.node('span', {'class' : 'icon toolbar italic'})
            )
        );
        cm.addEvent(that.nodes['tooltip']['font-style-button'], 'click', function(){
            that.set(cm.merge(that.value, {'font-style' : (that.value['font-style'] === 'italic'? 'normal' : 'italic')}), true);
        });
        return that;
    };

    classProto.renderTextDecorationControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group1'].appendChild(
            that.nodes['tooltip']['text-decoration-button'] = cm.node('li', {'class' : 'button button-secondary is-icon'},
                cm.node('span', {'class' : 'icon toolbar underline'})
            )
        );
        cm.addEvent(that.nodes['tooltip']['text-decoration-button'], 'click', function(){
            that.set(cm.merge(that.value, {'text-decoration' : (that.value['text-decoration'] === 'underline'? 'none' : 'underline')}), true);
        });
    };

    classProto.renderFontSizeControl = function(){
        var that = this;
        // Select
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select x-small'},
                that.nodes['tooltip']['font-size'] = cm.node('select', {'title' : that.lang('Size')})
            )
        );
        cm.forEach(that.params['styles']['font-size'], function(item){
            that.nodes['tooltip']['font-size'].appendChild(
                cm.node('option', {'value' : item}, item)
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['font-size'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['font-size'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'font-size' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderLineHeightControl = function(){
        var that = this;
        // Select
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select x-small'},
                that.nodes['tooltip']['line-height'] = cm.node('select', {'title' : that.lang('Leading')})
            )
        );
        cm.forEach(that.params['styles']['line-height'], function(item){
            that.nodes['tooltip']['line-height'].appendChild(
                cm.node('option', {'value' : item}, (item === 'normal'? that.lang('auto') : item))
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['line-height'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['line-height'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'line-height' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderColorControl = function(){
        var that = this;
        // Structure
        that.nodes['tooltip']['group3'].appendChild(
            cm.node('li', {'class' : 'is-select size-field'},
                that.nodes['tooltip']['color'] = cm.node('input', {'type' : 'text', 'title' : that.lang('Color')})
            )
        );
        // Component
        cm.getConstructor('Com.ColorPicker', function(classConstructor, className){
            that.components['color'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['color'],
                    'defaultValue' : that.params['defaultValue']['color'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'color' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderBackgroundControl = function(){
        var that = this;
        // Structure
        that.nodes['tooltip']['group3'].appendChild(
            cm.node('li', {'class' : 'is-select size-field'},
                that.nodes['tooltip']['background'] = cm.node('input', {'type' : 'text', 'title' : that.lang('Background')})
            )
        );
        // Component
        cm.getConstructor('Com.ColorPicker', function(classConstructor, className){
            that.components['background'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['background'],
                    'defaultValue' : that.params['defaultValue']['background'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'background' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderResetControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group4'].appendChild(
            cm.node('li',
                that.nodes['tooltip']['reset-button'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('Reset'))
            )
        );
        cm.addEvent(that.nodes['tooltip']['reset-button'], 'click', function(){
            that.clear(true);
        });
    };

    /* *** DATA VALUE *** */

    classProto.validateValue = function(value){
        var that = this;
        value = cm.isObject(value)? that.validateItemConfig(value) : that.params['defaultValue'];
        value['_type'] = 'font';
        return value;
    };

    classProto.saveValue = function(value){
        var that = this;
        // Process
        that.previousRawValue = cm.clone(that.rawValue);
        that.rawValue = cm.clone(value);
        that.previousValue = cm.clone(that.value);
        that.value = cm.clone(value);
        // Process safe value
        cm.forEach(that.value, function(value, key){
            switch(key){
                case 'font-size':
                    that.value[key] = cm.isNumber(value) || /^\d+$/.test(value) ? (value + 'px') : value;
                    break;
                case 'line-height':
                    that.value[key] = cm.isNumber(value) || /^\d+$/.test(value) ? (value + 'px') : value;
                    break;
            }
        });
        // Set hidden input
        if(that.params['setHiddenInput']){
            that.saveHiddenValue(that.value);
        }
        if(that.params['setContentInput']){
            that.setData(that.valueText);
        }
        return that;
    };

    classProto.setData = function(){
        var that = this;
        // Set components
        cm.forEach(that.rawValue, function(value, key){
            if(that.components[key]){
                that.components[key].set(value, false);
            }
            // Set buttons
            switch(key){
                case 'font-weight':
                    if(value > 400){
                        cm.addClass(that.nodes['tooltip']['font-weight-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-weight-button'], 'active');
                    }
                    break;
                case 'text-decoration':
                    if(value === 'underline'){
                        cm.addClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }
                    break;
                case 'font-style':
                    if(value === 'italic'){
                        cm.addClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }
                    break;
            }
            // Set preview
            that.nodes['content']['preview'].style[cm.styleStrToKey(key)] = that.value[key];
        });
    };
});
cm.define('App.FormStyles', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.FormStyles', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;
});
cm.define('App.HelpTour', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'container' : 'document.body',
        'name' : 'app-helptour',
        'sidebarName' : 'app-sidebar',
        'topMenuName' : 'app-topmenu',
        'templateName' : 'app-template',
        'notificationName' : 'app-notification',
        'duration' : 500,
        'adaptiveFrom' : 768,
        'autoStart' : false,
        'popupIndent' : 24,
        'Com.Overlay' : {
            'container' : 'document.body',
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : false,
            'showContent' : false,
            'name' : '',
            'theme' : 'transparent',
            'position' : 'absolute'
        }
    },
    'strings' : {
        'next' : 'Next',
        'back' : 'Back',
        'close' : 'Close',
        'cancel' : 'Cancel',
        'finish' : 'Finish'
    }
},
function(params){
    var that = this,
        dimensions = {
            'sidebarCollapsed' : 0,
            'sidebarExpanded' : 0,
            'topMenu' : 0,
            'popupHeight' : 0,
            'popupSelfHeight' : 0,
            'popupContentHeight' : 0
        },
        startOptions = {
            'sidebarExpanded' : false,
            'sidebarTab' : 'modules',
            'notificationShow' : false
        };

    that.nodes = {};
    that.components = {
        'overlays' : {}
    };
    that.currentStage = -1;
    that.currentScene = null;
    that.currentSceneNode = null;
    that.previousStage = null;
    that.previousScene = null;
    that.previousSceneNode = null;
    that.sceneIntervals = {};

    var init = function(){
        getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        validateParams();
        render();
        that.triggerEvent('onRender');
        that.params['autoStart'] && prepare();
    };

    var getLESSVariables = function(){
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppHelpTour-Duration', that.params['duration']);
        that.params['adaptiveFrom'] = cm.getLESSVariable('AppHelpTour-AdaptiveFrom', that.params['adaptiveFrom'], true);
    };

    var validateParams = function(){
        that.params['Com.Overlay']['container'] = that.params['container'];
        that.params['Com.Overlay']['name'] = [that.params['name'], 'overlay'].join('-')
    };

    var render = function(){
        cm.getConstructor('Com.Overlay', function(classConstructor){
            that.components['overlays']['main'] = new classConstructor(
                cm.merge(that.params['Com.Overlay'], {
                    'position' : 'fixed'
                })
            );
            that.components['overlays']['sidebar'] = new classConstructor(that.params['Com.Overlay']);
            that.components['overlays']['topMenu'] = new classConstructor(that.params['Com.Overlay']);
            that.components['overlays']['template'] = new classConstructor(
                cm.merge(that.params['Com.Overlay'], {
                    'position' : 'fixed'
                })
            );
            // Start tour on click
            cm.addEvent(that.params['node'], 'click', prepare);
        });
    };

    var getDimensions = function(){
        dimensions['sidebarCollapsed'] = cm.getLESSVariable('AppSidebar-WidthCollapsed', 0, true);
        dimensions['sidebarExpanded'] = cm.getLESSVariable('AppSidebar-WidthExpanded', 0, true);
        dimensions['topMenu'] = cm.getLESSVariable('AppTopMenu-Height', 0, true);
        if(!dimensions['popupSelfHeight']){
            dimensions['popupSelfHeight'] = that.nodes['popup'].offsetHeight;
        }
        if(that.currentSceneNode){
            dimensions['popupContentHeight'] = that.currentSceneNode.offsetHeight;
        }
        dimensions['popupHeight'] = dimensions['popupSelfHeight'] + dimensions['popupContentHeight'];
    };

    var prepare = function(){
        // Get Sidebar
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject;
            that.components['overlays']['sidebar'].embed(that.components['sidebar'].getNodes('inner'));
        });
        // Get TopMenu
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
            that.components['overlays']['topMenu'].embed(that.components['topMenu'].getNodes('inner'));
        });
        // Get Template
        cm.find('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.components['overlays']['template'].embed(that.components['template'].getNodes('container'));
        });
        // Get Notification
        cm.find('App.Notification', that.params['notificationName'], null, function(classObject){
            that.components['notification'] = classObject;
        });
        // Start
        if(that.components['sidebar'] && that.components['topMenu'] && that.components['template']){
            start();
        }else{
            cm.errorLog({
                'type' : 'error',
                'name' : that._name['full'],
                'message' : ['Required components does not constructed.'].join(' ')
            });
        }
    };

    var start = function(){
        // Close Containers
        cm.find('Com.AbstractContainer', null, null, function(classObject){
            classObject.close();
        }, {'childs' : true});
        // Render Popup
        renderPopup();
        // Save Sidebar State
        startOptions['sidebarExpanded'] = that.components['sidebar'].isExpanded;
        if(that.components['sidebar'].isExpanded){
            that.components['sidebar'].collapse();
        }
        startOptions['sidebarTab'] = that.components['sidebar'].getTab();
        that.components['sidebar'].unsetTab();
        // Save Notification State
        if(that.components['notification']){
            startOptions['notificationShow'] = that.components['notification'].isShow;
            if(that.components['notification'].isShow){
                that.components['notification'].hide();
            }
        }
        // Collapse menu (mobile)
        that.components['topMenu'].collapse();
        // Show overlays
        cm.forEach(that.components['overlays'], function(item){
            item.open();
        });
        // Start scenario
        setStage(0);
    };

    var stop = function(){
        // Remove Popup
        removePopup();
        // Restore Sidebar State
        if(startOptions['sidebarExpanded'] && !that.components['sidebar'].isExpanded){
            that.components['sidebar'].expand();
        }else if(!startOptions['sidebarExpanded'] && that.components['sidebar'].isExpanded){
            that.components['sidebar'].collapse();
        }
        that.components['sidebar'].setTab(startOptions['sidebarTab']);
        // Restore Notification State
        if(that.components['notification']){
            if(startOptions['notificationShow'] && !that.components['notification'].isShow){
                that.components['notification'].show();
            }else if(!startOptions['notificationShow'] && that.components['notification'].isShow){
                that.components['notification'].hide();
            }
        }
        // Hide overlays
        cm.forEach(that.components['overlays'], function(item){
            item.close();
        });
        // Stop scenario
        unsetStage();
    };

    var setStage = function(stage){
        if(App.HelpTourScenario[stage]){
            // Destruct Previous Scene
            unsetStage();
            // Construct New Scene
            that.currentStage = stage;
            that.currentScene = App.HelpTourScenario[stage];
            // Set Overlays
            cm.forEach(that.currentScene['overlays'], function(item, key){
                that.components['overlays'][key].setTheme(item);
            });
            // Set Sidebar
            if(!that.currentScene['sidebar']){
                that.components['sidebar']
                    .unsetTab()
                    .collapse();
            }else{
                that.components['sidebar']
                    .setTab(that.currentScene['sidebar'])
                    .expand();
            }
            // Set Top Menu
            that.components['topMenu'].setActiveItem(that.currentScene['topMenu']);
            // Set Popup Arrow
            if(that.currentScene['arrow']){
                cm.addClass(that.nodes['popupArrows'][that.currentScene['arrow']], 'is-show');
            }
            // Set Popup Buttons
            if(that.currentStage === 0){
                that.nodes['back'].innerHTML = that.lang('close');
                that.nodes['next'].innerHTML = that.lang('next');
            }else if(that.currentStage === App.HelpTourScenario.length - 1){
                that.nodes['back'].innerHTML = that.lang('back');
                that.nodes['next'].innerHTML = that.lang('finish');
            }else{
                that.nodes['back'].innerHTML = that.lang('back');
                that.nodes['next'].innerHTML = that.lang('next');
            }
            // Set Popup Content
            that.currentSceneNode = cm.Node('div', {'class' : 'popup__content__item', 'innerHTML' : that.currentScene['content']});
            that.nodes['popupContent'].appendChild(that.currentSceneNode);
            cm.addClass(that.currentSceneNode, 'is-show', true);
            // Set Popup Position
            setPopupPosition();
            // Construct
            that.currentScene['construct'] && that.currentScene['construct'].call(that);
        }
    };

    var unsetStage = function(){
        if(that.currentStage >= 0){
            that.previousStage = that.currentStage;
            that.previousScene = that.currentScene;
            that.previousSceneNode = that.currentSceneNode;
            // Top Menu
            that.components['topMenu'].unsetActiveItem(that.previousScene['topMenu']);
            // Clear Popup Arrow
            if(that.previousScene['arrow']){
                cm.removeClass(that.nodes['popupArrows'][that.previousScene['arrow']], 'is-show');
            }
            // Clear Scene Intervals
            cm.forEach(that.sceneIntervals, function(item){
                clearInterval(item);
            });
            // Remove Popup Node
            (function(node){
                setTimeout(function(){
                    cm.remove(node);
                }, that.params['duration']);
            })(that.previousSceneNode);
            // Destruct
            that.previousScene['destruct'] && that.previousScene['destruct'].call(that);
        }
        that.currentStage = -1;
    };

    var renderPopup = function(){
        that.nodes['popupArrows'] = {};
        that.nodes['popup'] = cm.Node('div', {'class' : 'app__helptour__popup'},
            that.nodes['popupArrows']['top'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--top'}),
            that.nodes['popupArrows']['right'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--right'}),
            that.nodes['popupArrows']['bottom'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--bottom'}),
            that.nodes['popupArrows']['left'] = cm.Node('div', {'class' : 'popup__arrow popup__arrow--left'}),
            that.nodes['popupClose'] = cm.Node('div', {'class' : 'popup__close', 'title' : that.lang('close')}),
            that.nodes['popupContent'] = cm.Node('div', {'class' : 'popup__content'}),
            that.nodes['popupButtons'] = cm.Node('div', {'class' : 'popup__buttons'},
                cm.Node('div', {'class' : 'btn-wrap pull-center'},
                    that.nodes['back'] = cm.Node('button', that.lang('back')),
                    that.nodes['next'] = cm.Node('button', that.lang('next'))
                )
            )
        );
        setPopupStartPosition();
        // Append
        that.params['container'].appendChild(that.nodes['popup']);
        cm.addClass(that.nodes['popup'], 'is-show', true);
        // Events
        cm.addEvent(that.nodes['popupClose'], 'click', stop);
        cm.addEvent(that.nodes['next'], 'click', that.next);
        cm.addEvent(that.nodes['back'], 'click', that.prev);
        cm.addEvent(window, 'resize', setPopupPosition);
        cm.addEvent(window, 'keydown', popupClickEvents);
    };

    var removePopup = function(){
        // Remove events
        cm.removeEvent(window, 'resize', setPopupPosition);
        cm.removeEvent(window, 'keydown', popupClickEvents);
        // Set end position
        setPopupStartPosition();
        cm.removeClass(that.nodes['popup'], 'is-show');
        // Remove node
        setTimeout(function(){
            cm.remove(that.nodes['popup']);
        }, that.params['duration']);
    };

    var setPopupStartPosition = function(){
        var left = [Math.round(cm.getX(that.params['node']) + that.params['node'].offsetWidth / 2), 'px'].join(''),
            top = [Math.round(cm.getY(that.params['node']) + that.params['node'].offsetHeight / 2), 'px'].join('');
        cm.setCSSTranslate(that.nodes['popup'], left, top, 0, 'scale(0)');
    };

    var popupClickEvents = function(e){
        cm.preventDefault(e);
        switch(e.keyCode){
            case 27:
                stop();
                break;
            case 37:
                that.prev();
                break;
            case 39:
                that.next();
                break;
        }
    };

    var setPopupPosition = function(){
        var position, pageSize, top, left, conentHeight, topMenuItem;
        if(that.currentScene){
            pageSize = cm.getPageSize();
            // Desktop or mobile view
            if(pageSize['winWidth'] > that.params['adaptiveFrom']){
                getDimensions();
                position = that.currentScene['position'].split(':');
                conentHeight = dimensions['popupContentHeight'];
                // Set position
                switch(position[0]){
                    // Window related position
                    case 'window':
                        switch(position[1]){
                            case 'top':
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = that.params['popupIndent'];
                                break;
                            case 'bottom':
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = pageSize['winHeight'] - dimensions['popupHeight'] - that.params['popupIndent'];
                                break;
                            case 'center':
                            default:
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = Math.round((pageSize['winHeight'] - dimensions['popupHeight']) / 2);
                                break;
                        }
                        break;
                    // Top Menu related position
                    case 'topMenu':
                        switch(position[1]){
                            case 'center':
                            default:
                                left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                                top = dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                        }
                        break;
                    // Top Menu Item related position
                    case 'topMenuItem':
                        topMenuItem = that.components['topMenu'].getItem(position[1]);
                        if(!topMenuItem){
                            left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        }else if(position[2] && position[2] === 'dropdown' && topMenuItem['dropdown']){
                            if(position[3] && position[3] === 'left'){
                                left = cm.getX(topMenuItem['dropdown']) - that.nodes['popup'].offsetWidth - that.params['popupIndent'];
                            }else{
                                left = cm.getX(topMenuItem['dropdown']) + topMenuItem['dropdown'].offsetWidth + that.params['popupIndent'];
                            }
                        }else if(topMenuItem['container']){
                            if(position[3] && position[3] === 'left'){
                                left = cm.getX(topMenuItem['container']) + topMenuItem['container'].offsetWidth - that.nodes['popup'].offsetWidth;
                            }else{
                                left = cm.getX(topMenuItem['container']);
                            }
                        }else{
                            left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        }
                        top = dimensions['topMenu'] + that.params['popupIndent'];
                        break;
                    // Template related position
                    case 'template':
                        switch(position[1]){
                            case 'top':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                            case 'bottom':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = pageSize['winHeight'] - dimensions['popupHeight'] - that.params['popupIndent'];
                                break;
                            case 'left':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']) + that.params['popupIndent'];
                                top = Math.round((pageSize['winHeight'] - dimensions['popupHeight']) / 2);
                                break;
                            case 'left-top':
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']) + that.params['popupIndent'];
                                top = dimensions['topMenu'] + that.params['popupIndent'];
                                break;
                            case 'center':
                            default:
                                left = (that.components['sidebar'].isExpanded ? dimensions['sidebarExpanded'] : dimensions['sidebarCollapsed']);
                                left = Math.round((pageSize['winWidth'] + left - that.nodes['popup'].offsetWidth) / 2);
                                top = Math.round((pageSize['winHeight'] +  dimensions['topMenu'] - dimensions['popupHeight']) / 2);
                                break;
                        }
                        break;
                    // Default position
                    default:
                        left = Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2);
                        top = Math.round((pageSize['winHeight'] - dimensions['popupHeight']) / 2);
                        break;
                }
            }else{
                left = 0;
                top = 0;
                conentHeight = 'auto';
            }
            that.nodes['popupContent'].style.height = conentHeight === 'auto' ? conentHeight : [conentHeight, 'px'].join('');
            cm.setCSSTranslate(that.nodes['popup'], [left, 'px'].join(''), [top, 'px'].join(''), 0, 'scale(1)');
        }
    };

    /* ******* MAIN ******* */

    that.start = function(){
        prepare();
        return that;
    };

    that.stop = function(){
        stop();
        return that;
    };

    that.next = function(){
        if(that.currentStage >= 0){
            if(App.HelpTourScenario[that.currentStage + 1]){
                setStage(that.currentStage + 1);
            }else{
                stop();
            }
        }
        return that;
    };

    that.prev = function(){
        if(that.currentStage >= 0){
            if(App.HelpTourScenario[that.currentStage - 1]){
                setStage(that.currentStage - 1);
            }else{
                stop();
            }
        }
        return that;
    };

    init();
});

/* ******* HELP TOUR SCENARIO ******* */

App.HelpTourScenario = [{
    'position' : 'window:center',
    'arrow' : false,
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : false,
    'content' : '<h3>QuickSilk Online Tour!</h3><p>Welcome to QuickSilk! Use the buttons at the bottom of each help bubble to quickly discover how to navigate and use the QuickSilk software. This online tour automatically appears the first time you login. Anytime after this, simply click on the help tour menu item for a quick refresher.</p>'
},{
    'position' : 'topMenuItem:user:dropdown:left',
    'arrow' : 'right',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'user',
    'content' : '<h3>User Menu</h3><p>Click on your name to view the admin panel (future), your profile, or to logout. The View Profile link provides the ability to manage your subscription and billing, password, forum settings, working groups and public profile.</p>'
},{
    'position' : 'topMenuItem:modules:dropdown:right',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'modules',
    'content' : '<h3>Modules</h3><p>The Module manager allows you to work on your modules from the administration panel. Simply mouse over the Modules menu and then scroll down and click on the module you wish to work with. </p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : false,
    'content' : '<h3>Left Panel Slider</h3><p>The left slider widget provides you with quick access to the modules, pages, layouts and template features. Simply click on the icon for the tab you wish to use.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'template-manager',
    'topMenu' : false,
    'content' : '<h3>Installed Modules</h3><p>The modules tab provides quick access to the modules that you\'ve subscribed to. Once you\'ve opened a page or a template, open the modules tab to drag and drop the modules you wish to include.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'pages',
    'topMenu' : false,
    'content' : '<h3>Site Pages</h3><p>The site pages tab allows you to quickly open, modify and manage your website pages. Simply open the tab and click on the web page you wish to work on.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'layouts',
    'topMenu' : false,
    'content' : '<h3>Page Layouts</h3><p>Use the page layout tab to open, modify and manage the layouts of your various web page templates. A page layout will consist of the common elements you have on every page.</p>'
},{
    'position' : 'template:left-top',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'transparent',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'sidebar' : 'templates',
    'topMenu' : false,
    'content' : '<h3>Templates</h3><p>The templates tab displays the different custom or predesigned templates that you\'ve installed and are immediately available for use on your website. If you want to view or install other templates, you\'ll do so from the template gallery.</p>'
},{
    'position' : 'template:center',
    'arrow' : false,
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'dark',
        'template' : 'light'
    },
    'sidebar' : false,
    'topMenu' : false,
    'content' : '<h3>Drop Area</h3><p>The drop area is where you drag and drop the modules. To move a module onto a page or template place your mouse on the desired module icon, hold down the left button on your mouse, and drag the module to the highlighted area of the page you wish to drop it, then let go of the mouse button.</p>'
},{
    'position' : 'topMenuItem:support:container:right',
    'arrow' : 'top',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'support',
    'content' : '<h3>Need Help?</h3><p>Are you stuck, experiencing an issue, found a bug or have a suggestion? Simply click on this link and send us a message. FYI, to assist in the troubleshooting process we automatically collect information on the operating system, browser and browser version you are using. Our goal is to respond to your message within 1 business day.</p>'
}];
cm.define('App.ImageInput', {
    'extend' : 'Com.ImageInput',
    'params' : {
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer',
        'fileUploader' : true,
        'fileUploaderConstructor' : 'App.FileUploaderContainer'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.ImageInput.apply(that, arguments);
});
cm.define('App.LivePreviewContent', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'name' : 'app-livepreview',
        'renderStructure' : true,
        'embedStructureOnRender' : false,
        'Com.Overlay' : {
            'removeOnClose' : true,
            'showSpinner' : true,
            'showContent' : false,
            'position' : 'absolute',
            'theme' : 'light'
        }
    }
},
function(params){
    var that = this;
    that.isPower = true;
    that.isPowerProcess = false;
    that.powerCount = 0;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.LivePreviewContent', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.devicePowerToggleHandler = that.devicePowerToggle.bind(that);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        that.renderLoaderView();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Init Overlay
        cm.getConstructor('Com.Overlay', function(classConstructor, className){
            that.components['overlay'] = new classConstructor(
                cm.merge(that.params[className], {
                    'container' : that.nodes['deviceScreen']
                })
            );
        });
        // IFrame Load Event
        cm.addEvent(that.nodes['iframe'], 'load', function(){
            that.components['overlay'] && that.components['overlay'].close();
        });
        // Device
        cm.addEvent(that.nodes['devicePower'], 'mousedown', that.devicePowerToggleHandler);
        return that;
    };

    classProto.setView = function(type){
        var that = this;
        cm.removeClass(that.nodes['container'], 'is-desktop is-tablet is-mobile');
        cm.addClass(that.nodes['container'], ['is', type].join('-'));
        return that;
    };

    classProto.setTemplate = function(src){
        var that = this;
        that.components['overlay'] && that.components['overlay'].open();
        that.nodes['iframe'].src = src;
        return that;
    };

    classProto.renderLoaderView = function(){
        var that = this;
        // Render loader
        that.nodes['loader'] = {};
        that.nodes['loader']['container'] = cm.node('div', {'class' : 'device__loader is-hidden'},
            cm.node('div', {'class' : 'inner'},
                cm.node('div', {'class' : 'icon app-i__quicksilk'})
            )
        );
        // Render Blues
        that.nodes['blues'] = {};
        that.nodes['blues']['container'] = cm.node('div', {'class' : 'device__blues is-hidden'},
            cm.node('div', {'class' : 'inner'},
                cm.node('p', 'A problem has been detected and QuickSilk has been shut down to prevent damage to your device.'),
                cm.node('p', 'The problem seems to be caused by the following file: FAKEPOWERBUTTON.SYS'),
                cm.node('p', 'POWER_FAULT_IN_NONPOWERED_BUTTON'),
                cm.node('p', 'If this is the first time you\'ve seen this Stop error screen, restart your device. If this screen appears again, check to make sure you are not pressing power button.'),
                cm.node('p', 'Technical Information:'),
                cm.node('p', '*** START'),
                cm.node('p', '010101000110100001100101011100100110010100100000011000010111001001100101001000000110111001101111001000000100010101100001011100110111010001100101011100100010000001000101011001110110011101110011001000000111010101110000001000000110100001100101011100100110010100101100001000000110011101101111001000000110000101110111011000010111100100100001'),
                cm.node('p', '*** END')
            )
        );
        // Embed
        cm.appendChild(that.nodes['blues']['container'], that.nodes['deviceScreen']);
        cm.appendChild(that.nodes['loader']['container'], that.nodes['deviceScreen']);
        return that;
    };

    classProto.devicePowerToggle = function(){
        var that = this;
        if(!that.isPowerProcess){
            if(that.isPower){
                that.devicePowerOff();
            }else{
                that.devicePowerOn();
            }
        }
        return that;
    };

    classProto.devicePowerOff = function(){
        var that = this;
        that.isPower = false;
        that.isPowerProcess = true;
        cm.addClass(that.nodes['deviceContent'], 'is-hidden');
        cm.addClass(that.nodes['blues']['container'], 'is-hidden');
        setTimeout(function(){
            that.isPowerProcess = false;
        }, 500);
        return that;
    };

    classProto.devicePowerOn = function(){
        var that = this;
        that.powerCount++;
        that.isPower = true;
        that.isPowerProcess = true;
        if(that.powerCount == 1){
            that.devicePowerOnFailed();
        }else{
            that.devicePowerOnNormal();
        }
        return that;
    };

    classProto.devicePowerOnNormal = function(){
        var that = this;
        cm.replaceClass(that.nodes['deviceContent'], 'is-hidden', 'is-loading');
        cm.removeClass(that.nodes['loader']['container'], 'is-hidden');
        setTimeout(function(){
            cm.removeClass(that.nodes['deviceContent'], 'is-loading');
            cm.addClass(that.nodes['loader']['container'], 'is-loaded');
            setTimeout(function(){
                cm.replaceClass(that.nodes['loader']['container'] , 'is-loaded', 'is-hidden');
                setTimeout(function(){
                    that.isPowerProcess = false;
                }, 500);
            }, 500);
        }, 1500);
        return that;
    };

    classProto.devicePowerOnFailed = function(){
        var that = this;
        cm.replaceClass(that.nodes['blues']['container'], 'is-hidden', 'is-loading');
        cm.removeClass(that.nodes['loader']['container'], 'is-hidden');
        setTimeout(function(){
            cm.removeClass(that.nodes['blues']['container'], 'is-loading');
            cm.addClass(that.nodes['loader']['container'], 'is-loaded');
            setTimeout(function(){
                cm.replaceClass(that.nodes['loader']['container'] , 'is-loaded', 'is-hidden');
                setTimeout(function(){
                    that.isPowerProcess = false;
                }, 500);
            }, 500);
        }, 1500);
        return that;
    };
});
cm.define('App.LivePreviewMenu', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'name' : 'app-livepreview',
        'topMenuName' : 'app-topmenu',
        'contentName' : 'app-livepreview',
        'renderStructure' : false,
        'embedStructureOnRender' : false
    }
},
function(params){
    var that = this;
    that.template = null;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.LivePreviewMenu', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Find Select
        cm.find('Com.Select', 'templates', that.nodes['container'], function(classInstance){
            that.components['select'] = classInstance;
            that.components['select'].addEvent('onChange', function(my, data){
                that.setTemplate(data);
            });
            that.setTemplate(that.components['select'].get());
        });
        // Find TopMenu
        new cm.Finder('App.TopMenu', that.params['topMenuName'], null, function(classInstance){
            that.components['topMenu'] = classInstance;
        });
        // Find Content
        new cm.Finder('App.LivePreviewContent', that.params['contentName'], null, function(classInstance){
            that.components['content'] = classInstance;
        });
        // Set events
        cm.addEvent(that.nodes['desktop'], 'click', function(){
            that.reset();
            that.setView('desktop');
        });
        cm.addEvent(that.nodes['tablet'], 'click', function(){
            that.reset();
            that.setView('tablet');
        });
        cm.addEvent(that.nodes['mobile'], 'click', function(){
            that.reset();
            that.setView('mobile');
        });
        cm.addEvent(that.nodes['select'], 'click', function(){
            that.storageWrite('template', that.template);
            try{
                window.close();
            }catch(e){}
        });
        return that;
    };

    classProto.reset = function(){
        var that = this;
        cm.removeClass(that.nodes['desktop'], 'active');
        cm.removeClass(that.nodes['tablet'], 'active');
        cm.removeClass(that.nodes['mobile'], 'active');
        return that;
    };

    classProto.setView = function(type){
        var that = this;
        cm.addClass(that.nodes[type], 'active');
        that.components['content'] && that.components['content'].setView(type);
        // Collapse menu (mobile)
        that.components['topMenu'] && that.components['topMenu'].collapse();
        return that;
    };

    classProto.setTemplate = function(src){
        var that = this;
        that.template = src;
        that.components['content'] && that.components['content'].setTemplate(src);
        // Collapse menu (mobile)
        that.components['topMenu'] && that.components['topMenu'].collapse();
        return that;
    };
});
cm.define('App.LoginBox', {
    'modules' : [
        'Params',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'preventClickEvent' : true,
            'adaptiveX' : true,
            'adaptiveY' : true,
            'scroll' : false,
            'left' : '(targetWidth - selfWidth) / 2',
            'top' : 'targetHeight + 8',
            'className' : 'app-pt__box-login__tooltip'
        }
    }
},
function(params){
    var that = this,
        components = {};

    that.nodes = {
        'button' : cm.Node('div'),
        'target' : cm.Node('div')
    };

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        // Render tooltip
        components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'target' : that.nodes['button'],
                'content' : that.nodes['target'],
                'events' : {
                    'onShow' : show
                }
            })
        );
    };

    var show = function(){
        // Focus text input
        var input = cm.getByAttr('type', 'text', that.nodes['target'])[0];
        input && input.focus();
    };

    /* ******* MAIN ******* */

    init();
});
cm.define('App.MenuConstructor', {
    'extend' : 'App.AbstractForm',
    'params' : {
        'node' : cm.node('div'),
        'embedStructure' : 'none',
        'renderStructure' : false,
        'collectorPriority' : 100,
        'namePrefix' : 'params'
    }
},
function(params){
    var that = this;
    that.items = {};
    // Call parent class construct
    App.AbstractForm.apply(that, arguments);
});

cm.getConstructor('App.MenuConstructor', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.destructProcessHander = that.destructProcess.bind(that);
        // Add events
        that.addEvent('onDestructProcess', that.destructProcessHander);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.destructProcess = function(){
        var that = this;
        that.components['finder'] && that.components['finder'].remove();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Find Components
        cm.forEach(App.MenuConstructorNames, function(name, variable){
            var item = {
                'variable' : variable,
                'name' : that.getName(name),
                'selfName' : that.getSelfName(name)
            };
            cm.find('*', item['name'], that.nodes['container'], function(classObject){
                item['controller'] = classObject;
                item['controller'].addEvent('onChange', function(my, data){
                    item['value'] = data;
                    that.processPreview();
                });
                item['value'] = item['controller'].get();
            });
            that.items[item['variable']] = item;
        });
        // Find Preview
        that.components['finder'] = new cm.Finder('App.MenuConstructorPreview', null, null, function(classObject){
            that.components['preview'] = classObject;
            that.processPreview();
        }, {'multiple' : true});
        return that;
    };

    classProto.getName = function(name){
        var that = this;
        return that.params['namePrefix']
            + name
                .split('.')
                .map(function(value){
                    return '[' + value + ']';
                })
                .join('');
    };

    classProto.getSelfName = function(name){
        var that = this;
        return name.split('.').pop();
    };

    classProto.processPreview = function(){
        var that = this,
            data = {},
            split;
        cm.forEach(that.items, function(item){
            if(item['value'] !== undefined){
                switch(item['value']['_type']){
                    case 'file':
                        data[item['variable']] = cm.URLToCSSURL(item['value']['url']);
                        break;
                    case 'font':
                        cm.forEach(item['value'], function(value, name){
                            data[item['variable'] + App.MenuConstructorNamesFont[name]] = value;
                        });
                        break;
                    default:
                        if(/BorderSize|Padding/.test(item['variable'])){
                            split = item['value'].split(/\s+/);
                            cm.forEach(App.MenuConstructorNamesBox, function(name, i){
                                data[[item['variable'], name].join('-')] = split[i];
                            });
                        }
                        data[item['variable']] = item['value'];
                        break;
                }
            }
        });
        that.components['preview'] && that.components['preview'].set(data);
    };
});

/* ******* NAMES ******* */

App.MenuConstructorNamesBox = ['Top', 'Right', 'Bottom', 'Left'];

App.MenuConstructorNamesFont = {
    'line-height' : 'LineHeight',
    'font-weight' : 'Weight',
    'font-style' : 'Style',
    'text-decoration' : 'Decoration',
    'font-family' : 'Family',
    'font-size' : 'Size',
    'color' : 'Color'
};

App.MenuConstructorNames = {

    /* *** PRIMARY ITEM *** */

    'Primary-Item-Padding' : 'primary_items.inner-padding',
    'Primary-Item-Indent' : 'primary_items.inner-between',

    'Primary-Default-BackgroundColor' : 'primary_items.default.background-color',
    'Primary-Default-BackgroundImage' : 'primary_items.default.background-image',
    'Primary-Default-BackgroundRepeat' : 'primary_items.default.background-repeat',
    'Primary-Default-BackgroundPosition' : 'primary_items.default.background-position',
    'Primary-Default-BackgroundScaling' : 'primary_items.default.background-scaling',
    'Primary-Default-BackgroundAttachment' : 'primary_items.default.background-attachment',
    'Primary-Default-BorderSize' : 'primary_items.default.border-size',
    'Primary-Default-BorderStyle' : 'primary_items.default.border-style',
    'Primary-Default-BorderColor' : 'primary_items.default.border-color',
    'Primary-Default-BorderRadius' : 'primary_items.default.border-radius',
    'Primary-Default-FontLineHeight' : 'primary_items.default.font.line-height',
    'Primary-Default-FontWeight' : 'primary_items.default.font.font-weight',
    'Primary-Default-FontStyle' : 'primary_items.default.font.font-style',
    'Primary-Default-FontDecoration' : 'primary_items.default.font.text-decoration',
    'Primary-Default-FontFamily' : 'primary_items.default.font.font-family',
    'Primary-Default-FontSize' : 'primary_items.default.font.font-size',
    'Primary-Default-FontColor' : 'primary_items.default.font.color',
    'Primary-Default-Font' : 'primary_items.default.font',

    'Primary-Hover-BackgroundColor' : 'primary_items.hover.background-color',
    'Primary-Hover-BackgroundImage' : 'primary_items.hover.background-image',
    'Primary-Hover-BackgroundRepeat' : 'primary_items.hover.background-repeat',
    'Primary-Hover-BackgroundPosition' : 'primary_items.hover.background-position',
    'Primary-Hover-BackgroundScaling' : 'primary_items.hover.background-scaling',
    'Primary-Hover-BackgroundAttachment' : 'primary_items.hover.background-attachment',
    'Primary-Hover-BorderSize' : 'primary_items.hover.border-size',
    'Primary-Hover-BorderStyle' : 'primary_items.hover.border-style',
    'Primary-Hover-BorderColor' : 'primary_items.hover.border-color',
    'Primary-Hover-BorderRadius' : 'primary_items.hover.border-radius',
    'Primary-Hover-FontLineHeight' : 'primary_items.hover.font.line-height',
    'Primary-Hover-FontWeight' : 'primary_items.hover.font.font-weight',
    'Primary-Hover-FontStyle' : 'primary_items.hover.font.font-style',
    'Primary-Hover-FontDecoration' : 'primary_items.hover.font.text-decoration',
    'Primary-Hover-FontFamily' : 'primary_items.hover.font.font-family',
    'Primary-Hover-FontSize' : 'primary_items.hover.font.font-size',
    'Primary-Hover-FontColor' : 'primary_items.hover.font.color',
    'Primary-Hover-Font' : 'primary_items.hover.font',

    'Primary-Active-BackgroundColor' : 'primary_items.active.background-color',
    'Primary-Active-BackgroundImage' : 'primary_items.active.background-image',
    'Primary-Active-BackgroundRepeat' : 'primary_items.active.background-repeat',
    'Primary-Active-BackgroundPosition' : 'primary_items.active.background-position',
    'Primary-Active-BackgroundScaling' : 'primary_items.active.background-scaling',
    'Primary-Active-BackgroundAttachment' : 'primary_items.active.background-attachment',
    'Primary-Active-BorderSize' : 'primary_items.active.border-size',
    'Primary-Active-BorderStyle' : 'primary_items.active.border-style',
    'Primary-Active-BorderColor' : 'primary_items.active.border-color',
    'Primary-Active-BorderRadius' : 'primary_items.active.border-radius',
    'Primary-Active-FontLineHeight' : 'primary_items.active.font.line-height',
    'Primary-Active-FontWeight' : 'primary_items.active.font.font-weight',
    'Primary-Active-FontStyle' : 'primary_items.active.font.font-style',
    'Primary-Active-FontDecoration' : 'primary_items.active.font.text-decoration',
    'Primary-Active-FontFamily' : 'primary_items.active.font.font-family',
    'Primary-Active-FontSize' : 'primary_items.active.font.font-size',
    'Primary-Active-FontColor' : 'primary_items.active.font.color',
    'Primary-Active-Font' : 'primary_items.active.font',

    /* *** PRIMARY CONTAINER *** */

    'Primary-Container-Padding' : 'primary_container.inner-padding',
    'Primary-Container-BackgroundColor' : 'primary_container.background-color',
    'Primary-Container-BackgroundImage' : 'primary_container.background-image',
    'Primary-Container-BackgroundRepeat' : 'primary_container.background-repeat',
    'Primary-Container-BackgroundPosition' : 'primary_container.background-position',
    'Primary-Container-BackgroundScaling' : 'primary_container.background-scaling',
    'Primary-Container-BackgroundAttachment' : 'primary_container.background-attachment',
    'Primary-Container-BorderSize' : 'primary_container.border-size',
    'Primary-Container-BorderStyle' : 'primary_container.border-style',
    'Primary-Container-BorderColor' : 'primary_container.border-color',
    'Primary-Container-BorderRadius' : 'primary_container.border-radius',

    /* *** SECONDARY ITEM *** */

    'Secondary-Item-Padding' : 'secondary_items.inner-padding',
    'Secondary-Item-Indent' : 'secondary_items.inner-between',

    'Secondary-Default-BackgroundColor' : 'secondary_items.default.background-color',
    'Secondary-Default-BackgroundImage' : 'secondary_items.default.background-image',
    'Secondary-Default-BackgroundRepeat' : 'secondary_items.default.background-repeat',
    'Secondary-Default-BackgroundPosition' : 'secondary_items.default.background-position',
    'Secondary-Default-BackgroundScaling' : 'secondary_items.default.background-scaling',
    'Secondary-Default-BackgroundAttachment' : 'secondary_items.default.background-attachment',
    'Secondary-Default-BorderSize' : 'secondary_items.default.border-size',
    'Secondary-Default-BorderStyle' : 'secondary_items.default.border-style',
    'Secondary-Default-BorderColor' : 'secondary_items.default.border-color',
    'Secondary-Default-BorderRadius' : 'secondary_items.default.border-radius',
    'Secondary-Default-FontLineHeight' : 'secondary_items.default.font.line-height',
    'Secondary-Default-FontWeight' : 'secondary_items.default.font.font-weight',
    'Secondary-Default-FontStyle' : 'secondary_items.default.font.font-style',
    'Secondary-Default-FontDecoration' : 'secondary_items.default.font.text-decoration',
    'Secondary-Default-FontFamily' : 'secondary_items.default.font.font-family',
    'Secondary-Default-FontSize' : 'secondary_items.default.font.font-size',
    'Secondary-Default-FontColor' : 'secondary_items.default.font.color',
    'Secondary-Default-Font' : 'secondary_items.default.font',

    'Secondary-Hover-BackgroundColor' : 'secondary_items.hover.background-color',
    'Secondary-Hover-BackgroundImage' : 'secondary_items.hover.background-image',
    'Secondary-Hover-BackgroundRepeat' : 'secondary_items.hover.background-repeat',
    'Secondary-Hover-BackgroundPosition' : 'secondary_items.hover.background-position',
    'Secondary-Hover-BackgroundScaling' : 'secondary_items.hover.background-scaling',
    'Secondary-Hover-BackgroundAttachment' : 'secondary_items.hover.background-attachment',
    'Secondary-Hover-BorderSize' : 'secondary_items.hover.border-size',
    'Secondary-Hover-BorderStyle' : 'secondary_items.hover.border-style',
    'Secondary-Hover-BorderColor' : 'secondary_items.hover.border-color',
    'Secondary-Hover-BorderRadius' : 'secondary_items.hover.border-radius',
    'Secondary-Hover-FontLineHeight' : 'secondary_items.hover.font.line-height',
    'Secondary-Hover-FontWeight' : 'secondary_items.hover.font.font-weight',
    'Secondary-Hover-FontStyle' : 'secondary_items.hover.font.font-style',
    'Secondary-Hover-FontDecoration' : 'secondary_items.hover.font.text-decoration',
    'Secondary-Hover-FontFamily' : 'secondary_items.hover.font.font-family',
    'Secondary-Hover-FontSize' : 'secondary_items.hover.font.font-size',
    'Secondary-Hover-FontColor' : 'secondary_items.hover.font.color',
    'Secondary-Hover-Font' : 'secondary_items.hover.font',

    'Secondary-Active-BackgroundColor' : 'secondary_items.active.background-color',
    'Secondary-Active-BackgroundImage' : 'secondary_items.active.background-image',
    'Secondary-Active-BackgroundRepeat' : 'secondary_items.active.background-repeat',
    'Secondary-Active-BackgroundPosition' : 'secondary_items.active.background-position',
    'Secondary-Active-BackgroundScaling' : 'secondary_items.active.background-scaling',
    'Secondary-Active-BackgroundAttachment' : 'secondary_items.active.background-attachment',
    'Secondary-Active-BorderSize' : 'secondary_items.active.border-size',
    'Secondary-Active-BorderStyle' : 'secondary_items.active.border-style',
    'Secondary-Active-BorderColor' : 'secondary_items.active.border-color',
    'Secondary-Active-BorderRadius' : 'secondary_items.active.border-radius',
    'Secondary-Active-FontLineHeight' : 'secondary_items.active.font.line-height',
    'Secondary-Active-FontWeight' : 'secondary_items.active.font.font-weight',
    'Secondary-Active-FontStyle' : 'secondary_items.active.font.font-style',
    'Secondary-Active-FontDecoration' : 'secondary_items.active.font.text-decoration',
    'Secondary-Active-FontFamily' : 'secondary_items.active.font.font-family',
    'Secondary-Active-FontSize' : 'secondary_items.active.font.font-size',
    'Secondary-Active-FontColor' : 'secondary_items.active.font.color',
    'Secondary-Active-Font' : 'secondary_items.active.font',

    'Secondary-Container-Padding' : 'secondary_container.inner-padding',
    'Secondary-Container-BackgroundColor' : 'secondary_container.background-color',
    'Secondary-Container-BackgroundImage' : 'secondary_container.background-image',
    'Secondary-Container-BackgroundRepeat' : 'secondary_container.background-repeat',
    'Secondary-Container-BackgroundScaling' : 'secondary_container.background-scaling',
    'Secondary-Container-BackgroundPosition' : 'secondary_container.background-position',
    'Secondary-Container-BackgroundAttachment' : 'secondary_container.background-attachment',
    'Secondary-Container-BorderSize' : 'secondary_container.border-size',
    'Secondary-Container-BorderStyle' : 'secondary_container.border-style',
    'Secondary-Container-BorderColor' : 'secondary_container.border-color',
    'Secondary-Container-BorderRadius' : 'secondary_container.border-radius',

    /* *** MOBILE *** */

    'Mobile-Padding' : 'mobile.inner-padding',
    'Mobile-BackgroundColor' : 'mobile.background-color',
    'Mobile-BackgroundImage' : 'mobile.menu-icon',
    'Mobile-BorderSize' : 'mobile.border-size',
    'Mobile-BorderStyle' : 'mobile.border-style',
    'Mobile-BorderColor' : 'mobile.border-color',
    'Mobile-BorderRadius' : 'mobile.border-radius',
    'Mobile-FontLineHeight' : 'mobile.font.line-height',
    'Mobile-FontWeight' : 'mobile.font.font-weight',
    'Mobile-FontStyle' : 'mobile.font.font-style',
    'Mobile-FontDecoration' : 'mobile.font.font-style',
    'Mobile-FontFamily' : 'mobile.font.font-family',
    'Mobile-FontSize' : 'mobile.font.font-size',
    'Mobile-FontColor' : 'mobile.font.font-color',
    'Mobile-Font' : 'mobile.font'
};
cm.define('App.MenuConstructorPreview', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'node' : cm.node('div'),
        'embedStructure' : 'none',
        'renderStructure' : false,
        'collectorPriority' : 100
    }
},
function(params){
    var that = this;
    that.lessDefault = null;
    that.lessVariables = {};
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.MenuConstructorPreview', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.set = function(o){
        var that = this;
        that.lessVariables = o || {};
        that.parseLess();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Default Less Styles
        that.lessDefault = that.nodes['less'].innerHTML;
        // Less Parser
        cm.loadScript({
            'path' : 'less',
            'src' : '%assetsUrl%/libs/less/less.min.js?%version%',
            'callback' : function(path){
                if(path){
                    that.components['less'] = path;
                    that.parseLess();
                }
            }
        });
        // Menu Module
        cm.find('Module.Menu', null, that.nodes['contentInner'], function(classObject){
            that.components['menu'] = classObject;
        });
        // Toolbar - Background Switcher
        cm.find('Com.ColorPicker', 'background', that.nodes['title']['container'], function(classObject){
            that.components['background'] = classObject;
            that.components['background'].addEvent('onChange', function(my, data){
                that.nodes['contentInner'].style.backgroundColor = data;
            });
        });
        // Toolbar - View Switcher
        cm.find('Com.Select', 'view', that.nodes['title']['container'], function(classObject){
            that.components['view'] = classObject;
            that.components['view'].addEvent('onChange', function(my, data){
                that.components['menu'] && that.components['menu'].setView(data);
                switch(data){
                    case 'horizontal':
                        that.components['submenu'] && that.components['submenu'].set('dropdown');
                        cm.addClass(that.nodes['title']['toolbar']['submenu'], 'is-hidden');
                        break;
                    case 'vertical':
                        that.components['submenu'] && that.components['submenu'].set('visible');
                        cm.removeClass(that.nodes['title']['toolbar']['submenu'], 'is-hidden');
                        break;
                    case 'mobile':
                        cm.addClass(that.nodes['title']['toolbar']['submenu'], 'is-hidden');
                        break;
                }
            });
        });
        // Toolbar - Submenu View Switcher
        cm.find('Com.Select', 'submenu', that.nodes['title']['container'], function(classObject){
            that.components['submenu'] = classObject;
            that.components['submenu'].addEvent('onChange', function(my, data){
                that.components['menu'] && that.components['menu'].setSubmenuView(data);
            });
        });
        // Toolbar - Align Switcher
        cm.find('Com.Select', 'align', that.nodes['title']['container'], function(classObject){
            that.components['align'] = classObject;
            that.components['align'].addEvent('onChange', function(my, data){
                that.components['menu'] && that.components['menu'].setAlign(data);
            });
        });
        return that;
    };

    classProto.parseLess = function(){
        var that = this;
        that.components['less'] && that.components['less'].render(that.lessDefault, {'modifyVars' : that.lessVariables}, function(e, data){
            if(data && !cm.isEmpty(data['css'])){
                that.nodes['css'].innerHTML = data['css'];
            }
        });
        return that;
    };
});
cm.define('App.MultipleFileInput', {
    'extend' : 'Com.MultipleFileInput',
    'params' : {
        'inputConstructor' : 'App.FileInput',
        'local' : true,
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManagerContainer',
        'fileUploader' : true,
        'fileUploaderConstructor' : 'App.FileUploaderContainer'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.MultipleFileInput.apply(that, arguments);
});
cm.define('App.Notification', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true,
        'show' : 'inherit',                           // true | false | inherit
        'remember' : true,
        'rememberTime' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Notification', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.isShow = null;
        // Binds
        that.showHandler = that.show.bind(that);
        that.hideHandler = that.hide.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this,
            isShowStorage,
            storageDate,
            isExpiredStorage;
        // Check inherit state
        that.isShow = that.params['show'] === 'inherit' ? cm.isClass(that.nodes['container'], 'is-show') : that.params['show'];
        // Check storage
        if(that.params['remember']){
            isShowStorage = that.storageRead('isShow');
            storageDate = that.storageRead('date');
            // Check state
            if(!cm.isUndefined(isShowStorage) && !cm.isUndefined(storageDate)){
                isExpiredStorage = that.params['rememberTime']? (Date.now() - parseInt(that.params['rememberTime']) > parseInt(storageDate)) : false;
                that.isShow = isExpiredStorage ? that.isShow : isShowStorage;
            }
        }
        // Trigger events
        if(that.isShow){
            that.show(true, true);
        }else{
            that.hide(true, true);
        }
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Events
        cm.addEvent(that.nodes['close'], 'click', function(){
            that.hide();
        });
    };

    /******* PUBLIC *******/

    classProto.show = function(isImmediately, force){
        var that = this;
        if(force || !cm.isBoolean(that.isShow) || !that.isShow){
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isShow', true);
                that.storageWrite('date', Date.now());
            }
            // Immediately animate
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately', true);
            }
            // Show
            that.isShow = true;
            cm.replaceClass(that.nodes['container'], 'is-hide', 'is-show');
            // Immediately animate
            if(isImmediately){
                setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                }, 5);
            }
        }
        return that;
    };

    classProto.hide = function(isImmediately, force){
        var that = this;
        if(force || !cm.isBoolean(that.isShow) || that.isShow){
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isShow', false);
                that.storageWrite('date', Date.now());
            }
            // Immediately animate
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
            }
            // Hide
            that.isShow = false;
            cm.replaceClass(that.nodes['container'], 'is-show', 'is-hide');
            // Immediately animate
            if(isImmediately){
                setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                }, 5);
            }
        }
        return that;
    };

    classProto.toggle = function(){
        var that = this;
        if(that.isShow){
            that.hide();
        }else{
            that.show();
        }
        return that;
    };

});
cm.define('App.Panel', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'onOpenStart',
        'onOpen',
        'onOpenEnd',
        'onCloseStart',
        'onClose',
        'onCloseEnd',
        'onError',
        'onSaveStart',
        'onSave',
        'onSaveEnd',
        'onSaveError',
        'onSaveSuccess',
        'onSaveFailure',
        'onLoadStart',
        'onLoad',
        'onLoadEnd',
        'onLoadError',
        'onCancelStart',
        'onCancel'
    ],
    'params' : {
        'node' : cm.node('div'),
        'container' : 'document.body',
        'name' : '',
        'embedStructure' : 'append',
        'embedStructureOnRender' : false,
        'customEvents' : true,
        'constructCollector' : true,
        'removeOnDestruct' : true,
        'type' : 'full',                                // sidebar | story | full
        'duration' : 'cm._config.animDurationLong',
        'autoOpen' : true,
        'destructOnClose' : true,
        'removeOnClose' : true,
        'showCloseButton' : true,
        'showBackButton' : false,
        'showButtons' : true,
        'showOverlay' : true,
        'overlayDelay' : 0 ,
        'overlayPosition' : 'content',                  // dialog | content
        'title' : null,
        'content' : null,
        'responseKey' : 'data',
        'responseContentKey' : 'data.content',
        'responseTitleKey' : 'data.title',
        'responseStatusKey' : 'data.success',
        'responsePreviewKey' : 'data.preview',
        'renderContentOnSuccess' : false,
        'closeOnSuccess' : true,
        'get' : {                                       // Get dialog content ajax
            'type' : 'json',
            'method' : 'GET',
            'url' : '',                                 // Request URL. Variables: %baseUrl%, %callback%.
            'params' : ''                               // Params object. Variables: %baseUrl%, %callback%.
        },
        'post' : {                                      // Submit form ajax
            'type' : 'json',
            'method' : 'POST',
            'url' : '',                                 // Request URL. Variables: %baseUrl%, %callback%.
            'params' : ''                               // Params object. Variables: %baseUrl%, %callback%.
        },
        'Com.Request' : {
            'wrapContent' : true,
            'swapContentOnError' : false,
            'renderContentOnSuccess' : false,
            'autoSend' : false,
            'responseKey' : 'data',
            'responseHTML' : true
        },
        'Com.Overlay' : {
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : true,
            'showContent' : false,
            'position' : 'absolute',
            'theme' : 'light'
        }
    },
    'strings' : {
        'close' : 'Close',
        'back' : 'Back',
        'cancel' : 'Cancel',
        'save' : 'Save',
        'saving' : 'Saving...',
        'reload' : 'Reload',
        'cancelDescription' : 'Cancel'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Panel', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    /* *** INIT *** */

    classProto.construct = function(params){
        var that = this;
        // Variables
        that.nodes = {};
        that.components = {};
        that.isOpen = false;
        that.isHide = false;
        that.isLoaded = false;
        that.isDestructed = false;
        that.isProccesing = false;
        that.destructOnClose = false;
        that.hasGetRequest = false;
        that.hasPostRequest = false;
        that.isGetRequest = false;
        that.isPostRequest = false;
        that.transitionInterval = null;
        // Bind context to methods
        that.openHandler = that.open.bind(that);
        that.closeHandler = that.close.bind(that);
        that.saveHandler = that.save.bind(that);
        that.cancelHandler = that.cancel.bind(that);
        that.loadHandler = that.load.bind(that);
        that.transitionOpenHandler = that.transitionOpen.bind(that);
        that.transitionCloseHandler = that.transitionClose.bind(that);
        that.windowKeydownHandler = that.windowKeydown.bind(that);
        that.constructEndHandler = that.constructEnd.bind(that);
        that.setEventsProcessHandler = that.setEventsProcess.bind(that);
        that.unsetEventsProcessHandler = that.unsetEventsProcess.bind(that);
        that.onGetLESSVariablesProcessHandler = that.onGetLESSVariablesProcess.bind(that);
        // Add events
        that.addEvent('onConstructEnd', that.constructEndHandler);
        that.addEvent('onGetLESSVariablesProcess', that.onGetLESSVariablesProcessHandler);
        that.addEvent('onSetEventsProcess', that.setEventsProcessHandler);
        that.addEvent('onUnsetEventsProcess', that.unsetEventsProcessHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.destruct = function(){
        var that = this;
        if(that.isOpen){
            that.destructOnClose = true;
            that.close();
        }else if(!that.isDestructed){
            that.destructOnClose = that.params['destructOnClose'];
            // Call parent method
            _inherit.prototype.destruct.apply(that, arguments);
        }
        return that;
    };

    classProto.constructEnd = function(){
        var that = this;
        that.params['autoOpen'] && that.open();
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        that.triggerEvent('onValidateParamsStart');
        that.triggerEvent('onValidateParamsProcess');
        that.params['Com.Request']['Com.Overlay'] = that.params['Com.Overlay'];
        that.params['Com.Request']['showOverlay'] = that.params['showOverlay'];
        that.params['Com.Request']['overlayDelay'] = that.params['overlayDelay'];
        that.params['Com.Request']['responseKey'] = that.params['responseKey'];
        that.params['Com.Request']['responseHTMLKey'] = that.params['responseContentKey'];
        that.params['Com.Request']['responseStatusKey'] = that.params['responseStatusKey'];
        that.params['Com.Request']['renderContentOnSuccess'] = that.params['renderContentOnSuccess'];
        that.destructOnClose = that.params['destructOnClose'];
        that.hasGetRequest = !cm.isEmpty(that.params['get']['url']);
        that.hasPostRequest = !cm.isEmpty(that.params['post']['url']);
        that.triggerEvent('onValidateParamsEnd');
        return that;
    };

    classProto.onGetLESSVariablesProcess = function(){
        var that = this;
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppPanel-Duration', that.params['duration']);
        return that;
    };

    classProto.setEventsProcess = function(){
        var that = this;
        cm.addEvent(window, 'keydown', that.windowKeydownHandler);
        return that;
    };

    classProto.unsetEventsProcess = function(){
        var that = this;
        cm.removeEvent(window, 'keydown', that.windowKeydownHandler);
        return that;
    };

    /* *** PUBLIC *** */

    classProto.open = function(){
        var that = this;
        if(that.isDestructed){
            that.setEvents();
            that.isDestructed = false;
        }
        if(!that.isOpen){
            that.embedStructure(that.nodes['container']);
            that.addToStack(that.nodes['container']);
            that.triggerEvent('onOpenStart');
            // Get
            if(that.hasGetRequest){
                that.load();
            }else{
                that.isLoaded = true;
                that.showButton(['close', 'save']);
                that.params['showButtons'] && that.showButtons(true);
                cm.customEvent.trigger(that.nodes['contentHolder'], 'redraw', {
                    'direction' : 'child',
                    'self' : false
                });
            }
            // Animate
            that.nodes['contentHolder'].scrollTop = 0;
            cm.addClass(that.nodes['container'], 'is-open', true);
            that.transitionInterval = setTimeout(that.transitionOpenHandler, that.params['duration']);
        }
        return that;
    };

    classProto.close = function(){
        var that = this;
        if(that.isProccesing){
            that.cancel();
        }
        if(that.isOpen){
            that.triggerEvent('onCloseStart');
            cm.removeClass(that.nodes['container'], 'is-open', true);
            that.transitionInterval = setTimeout(that.transitionCloseHandler, that.params['duration']);
        }
        return that;
    };

    classProto.hide = function(){
        var that = this;
        if(!that.isHide){
            that.isHide = true;
            cm.replaceClass(that.nodes['container'], 'is-show', 'is-hide');
        }
        return that;
    };

    classProto.show = function(){
        var that = this;
        if(that.isHide){
            that.isHide = false;
            cm.replaceClass(that.nodes['container'], 'is-hide', 'is-show');
        }
        return that;
    };

    classProto.save = function(){
        var that = this,
            params;
        if(that.isProccesing){
            that.cancel();
        }
        that.isPostRequest = true;
        that.triggerEvent('onSaveStart');
        if(that.hasPostRequest){
            // Get Params and Form Data
            params = cm.clone(that.params['post']);
            if(params['formData']){
                params['params'] = new FormData(that.nodes['contentHolder']);
            }else{
                params['params'] = cm.merge(params['params'], cm.getFDO(that.nodes['contentHolder']));
            }
            // Send
            that.showButton(['cancel', 'saving']);
            that.components['request']
                .setAction(params, 'update')
                .send();
        }else{
            that.showButton(['close', 'save']);
            that.triggerEvent('onSave');
            that.triggerEvent('onSaveEnd');
        }
        return that;
    };
    
    classProto.load = function(){
        var that = this;
        if(that.isProccesing){
            that.cancel();
        }
        that.isGetRequest = true;
        that.triggerEvent('onLoadStart');
        if(that.hasGetRequest){
            that.showButton('cancel');
            that.components['request']
                .setAction(that.params['get'], 'update')
                .send();
        }else{
            that.showButton(['close', 'save']);
            that.triggerEvent('onLoad');
            that.triggerEvent('onLoadEnd');
        }
        return that;
    };

    classProto.cancel = function(){
        var that = this;
        that.triggerEvent('onCancelStart');
        that.components['request'].abort();
        if(that.isLoaded){
            that.showButton(['close', 'save']);
        }else{
            that.showButton(['close', 'reload']);
        }
        that.triggerEvent('onCancel');
        return that;
    };

    /* *** CONTENT *** */

    classProto.setTitle = function(node){
        var that = this;
        cm.customEvent.trigger(that.nodes['label'], 'destruct', {
            'direction' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['label']);
        node = cm.strToHTML(node);
        if(!cm.isEmpty(node)){
            cm.appendNodes(node, that.nodes['label']);
            that.constructCollector(that.nodes['label']);
        }
        return that;
    };

    classProto.setContent = function(node){
        var that = this;
        cm.customEvent.trigger(that.nodes['contentHolder'], 'destruct', {
            'direction' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['contentHolder']);
        node = cm.strToHTML(node);
        if(!cm.isEmpty(node)){
            cm.appendNodes(node, that.nodes['contentHolder']);
            that.constructCollector(that.nodes['contentHolder']);
        }
        return that;
    };

    classProto.setPreview = function(node){
        var that = this;
        cm.customEvent.trigger(that.nodes['previewHolder'], 'destruct', {
            'direction' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['previewHolder']);
        node = cm.strToHTML(node);
        if(!cm.isEmpty(node)){
            cm.addClass(that.nodes['previewHolder'], 'is-show');
            cm.appendNodes(node, that.nodes['previewHolder']);
            that.constructCollector(that.nodes['previewHolder']);
        }
        return that;
    };

    /* *** SYSTEM *** */

    classProto.renderView = function(){
        var that = this;
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__panel'},
            that.nodes['dialogHolder'] = cm.node('div', {'class' : 'app__panel__dialog-holder'},
                that.nodes['dialog'] = cm.node('div', {'class' : 'app__panel__dialog'},
                    that.nodes['inner'] = cm.node('div', {'class' : 'inner'},
                        that.nodes['title'] = cm.node('div', {'class' : 'title'},
                            that.nodes['label'] = cm.node('div', {'class' : 'label'})
                        ),
                        that.nodes['content'] = cm.node('div', {'class' : 'content'},
                            that.nodes['contentHolder'] = cm.node('div', {'class' : 'inner'})
                        )
                    )
                )
            ),
            that.nodes['previewHolder'] = cm.node('div', {'class' : 'app__panel__preview-holder'},
                that.nodes['preview'] = cm.node('div', {'class' : 'app__panel__preview'},
                    cm.node('div', {'class' : 'inner'},
                        cm.node('div', {'class' : 'title'}),
                        cm.node('div', {'class' : 'content'})
                    )
                )
            )
        );
        // Close Buttons
        if(that.params['showCloseButton']){
            that.nodes['close'] = cm.node('div', {'class' : 'icon cm-i cm-i__circle-close', 'title' : that.lang('close')});
            cm.addEvent(that.nodes['close'], 'click', that.closeHandler);
            cm.insertLast(that.nodes['close'], that.nodes['title']);
        }
        if(that.params['showBackButton']){
            that.nodes['back'] = cm.node('div', {'class' : 'icon cm-i cm-i__circle-arrow-left', 'title' : that.lang('back')});
            cm.addEvent(that.nodes['back'], 'click', that.closeHandler);
            cm.insertFirst(that.nodes['back'], that.nodes['title']);
        }
        // Buttons
        that.renderButtonsView();
        if(that.params['showButtons']){
            cm.appendChild(that.nodes['buttons'], that.nodes['inner']);
        }
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Overlay
        switch(that.params['overlayPosition']){
            case 'content':
                that.params['Com.Overlay']['container'] = that.nodes['content'];
                that.params['Com.Request']['overlayContainer'] = that.nodes['content'];
                break;
            case 'dialog':
            default:
                that.params['Com.Overlay']['container'] = that.nodes['dialog'];
                that.params['Com.Request']['overlayContainer'] = that.nodes['dialog'];
                break;
        }
        // Request
        if(that.hasGetRequest || that.hasPostRequest){
            that.params['Com.Request']['container'] = that.nodes['contentHolder'];
            cm.getConstructor('Com.Request', function(classConstructor, className){
                that.components['request'] = new classConstructor(that.params[className]);
                that.components['request']
                    .addEvent('onStart', function(){
                        that.isProccesing = true;
                    })
                    .addEvent('onEnd', function(){
                        that.isProccesing = false;
                        that.params['showButtons'] && that.showButtons();
                        if(that.isGetRequest){
                            that.triggerEvent('onLoadEnd');
                        }else if(that.isPostRequest){
                            that.triggerEvent('onSaveEnd');
                        }
                        that.isGetRequest = false;
                        that.isPostRequest = false;
                    })
                    .addEvent('onSuccess', function(my, data){
                        if(that.isGetRequest){
                            that.loadResponse(data);
                        }else if(that.isPostRequest){
                            that.saveResponse(data);
                        }
                    })
                    .addEvent('onError', function(){
                        if(that.isGetRequest){
                            that.loadError();
                        }else if(that.isPostRequest){
                            that.saveError();
                        }
                    })
                    .addEvent('onContentRender', function(){
                        that.constructCollector(that.nodes['contentHolder']);
                    })
                    .addEvent('onContentRenderEnd', function(){
                        cm.customEvent.trigger(that.nodes['contentHolder'], 'redraw', {
                            'direction' : 'child',
                            'self' : false
                        });
                    });
            });
        }
        // Set Content
        !cm.isEmpty(that.params['title']) && that.setTitle(that.params['title']);
        !cm.isEmpty(that.params['content']) && that.setContent(that.params['content']);
        return that;
    };

    classProto.setAttributes = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.setAttributes.apply(that, arguments);
        // Type class
        cm.addClass(that.nodes['container'], ['app__panel', that.params['type']].join('--'));
        return that;
    };

    classProto.showButton = function(items){
        var that = this;
        cm.forEach(that.nodes['button'], function(node){
            cm.addClass(node, 'display-none');
        });
        if(cm.isArray(items)){
            cm.forEach(items, function(item){
                if(that.nodes['button'][item]){
                    cm.removeClass(that.nodes['button'][item], 'display-none');
                }
            });
        }else if(that.nodes['button'][items]){
            cm.removeClass(that.nodes['button'][items], 'display-none');
        }
    };

    classProto.showButtons = function(immediately){
        var that = this;
        cm.appendChild(that.nodes['buttons'], that.nodes['inner']);
        if(immediately){
            cm.addClass(that.nodes['buttons'], 'is-immediately', true);
        }
        cm.addClass(that.nodes['buttons'], 'is-show', true);
        return that;
    };

    classProto.renderButtonsView = function(){
        var that = this;
        that.nodes['button'] = {};
        // Structure
        that.nodes['buttons'] = cm.node('div', {'class' : 'buttons'},
            cm.node('div', {'class' : 'inner'},
                cm.node('div', {'class' : 'pt__buttons pull-justify'},
                    cm.node('div', {'class' : 'inner'},
                        that.nodes['button']['close'] = cm.node('div', {'class' : 'button button-danger'}, that.lang('close')),
                        that.nodes['button']['cancel'] = cm.node('div', {'class' : 'button button-danger'}, that.lang('cancel')),
                        that.nodes['button']['save'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('save')),
                        that.nodes['button']['reload'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('reload')),
                        that.nodes['button']['saving'] = cm.node('div', {'class' : 'button button-primary has-icon has-icon-small'},
                            cm.node('div', {'class' : 'icon small loader'}),
                            cm.node('div', {'class' : 'label'}, that.lang('saving'))
                        )
                    )
                )
            )
        );
        // Attributes
        that.nodes['button']['cancel'].setAttribute('title', that.lang('cancelDescription'));
        that.nodes['button']['saving'].setAttribute('title', that.lang('cancelDescription'));
        // Events
        cm.addEvent(that.nodes['button']['save'], 'click', that.saveHandler);
        cm.addEvent(that.nodes['button']['close'], 'click', that.closeHandler);
        cm.addEvent(that.nodes['button']['cancel'], 'click', that.cancelHandler);
        cm.addEvent(that.nodes['button']['saving'], 'click', that.cancelHandler);
        cm.addEvent(that.nodes['button']['reload'], 'click', that.loadHandler);
        return that;
    };

    classProto.windowKeydown = function(e){
        var that = this;
        if(cm.isKeyCode(e.keyCode, 'escape')){
            that.close();
        }
        return that;
    };

    classProto.transitionOpen = function(){
        var that = this;
        that.isOpen = true;
        that.triggerEvent('onOpen');
        that.triggerEvent('onOpenEnd');
        return that;
    };

    classProto.transitionClose = function(){
        var that = this;
        that.isOpen = false;
        that.destructOnClose && that.destruct();
        that.params['removeOnClose'] && cm.remove(that.nodes['container']);
        that.triggerEvent('onClose');
        that.triggerEvent('onCloseEnd');
        return that;
    };

    classProto.loadResponse = function(data){
        var that = this;
        that.isLoaded = true;
        that.setTitle(cm.objectSelector(that.params['responseTitleKey'], data['response']));
        that.setPreview(cm.objectSelector(that.params['responsePreviewKey'], data['response']));
        that.showButton(['close', 'save']);
        that.triggerEvent('onLoad');
        return that;
    };

    classProto.loadError = function(){
        var that = this;
        if(!that.isLoaded){
            that.showButton(['close', 'reload']);
        }else{
            that.showButton(['close', 'save']);
        }
        that.triggerEvent('onLoadError');
        that.triggerEvent('onError', 'load');
        return that;
    };

    classProto.saveResponse = function(data){
        var that = this;
        if(!data['status'] || (data['status'] && that.params['renderContentOnSuccess'])){
            that.setTitle(cm.objectSelector(that.params['responseTitleKey'], data['response']));
            that.setPreview(cm.objectSelector(that.params['responsePreviewKey'], data['response']));
            that.showButton(['close', 'save']);
        }
        if(data['status']){
            if(that.params['closeOnSuccess']){
                that.close();
            }
            that.triggerEvent('onSaveSuccess', data);
        }else{
            that.triggerEvent('onSaveFailure', data);
        }
        that.triggerEvent('onSave', data);
        return that;
    };

    classProto.saveError = function(){
        var that = this;
        that.showButton(['close', 'save']);
        that.triggerEvent('onSaveError');
        that.triggerEvent('onError', 'save');
        return that;
    };
});
cm.define('App.PanelContainer', {
    'extend' : 'Com.AbstractContainer',
    'events' : [
        'onOpenStart',
        'onOpenEnd',
        'onCloseStart',
        'onCloseEnd'
    ],
    'params' : {
        'constructor' : 'App.Panel',
        'container' : 'document.body',
        'destructOnClose' : true,
        'restoreHolderContent' : true,
        'params' : {
            'destructOnClose' : false,
            'autoOpen' : false
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});

cm.getConstructor('App.PanelContainer', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.destructProcessHander = that.destructProcess.bind(that);
        that.showHandler = that.show.bind(that);
        that.hideHandler = that.hide.bind(that);
        // Add events
        that.addEvent('onDestructProcess', that.destructProcessHander);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.destructProcess = function(){
        var that = this;
        that.components['finder'] && that.components['finder'].remove();
        return that;
    };

    classProto.show = function(e){
        var that = this;
        e && cm.preventDefault(e);
        that.components['controller'] && that.components['controller'].show();
        return that;
    };

    classProto.hide = function(e){
        var that = this;
        e && cm.preventDefault(e);
        that.components['controller'] && that.components['controller'].hide();
        return that;
    };

    classProto.renderControllerEvents = function(){
        var that = this;
        that.components['controller'].addEvent('onOpenStart', function(){
            that.triggerEvent('onOpenStart', that.components['controller']);
            that.setHolderContent();
            that.afterOpenController();
        });
        that.components['controller'].addEvent('onOpenEnd', function(){
            that.processNestedPanels();
            that.triggerEvent('onOpenEnd', that.components['controller']);
        });
        that.components['controller'].addEvent('onCloseStart', function(){
            that.triggerEvent('onCloseStart', that.components['controller']);
        });
        that.components['controller'].addEvent('onCloseEnd', function(){
            that.restoreHolderContent();
            that.afterCloseController();
            that.triggerEvent('onCloseEnd', that.components['controller']);
        });
        return that;
    };

    classProto.processNestedPanels = function(){
        var that = this,
            node = that.components['controller'].getStackNode(),
            config = {
                'childs' : true,
                'multiple' : true
            };
        // Find Nested Containers
        that.components['finder'] = new cm.Finder('App.PanelContainer', null, node, function(classObject){
            classObject.setParams({
                'params' : {
                    'type' : 'story',
                    'showButtons' : false,
                    'showBackButton' : true,
                    'showCloseButton' : false
                }
            });
            classObject.addEvent('onOpenStart', that.hideHandler);
            classObject.addEvent('onCloseStart', that.showHandler);
        }, config);
        return that;
    };

    classProto.setHolderContent = function(){
        var that = this;
        if(!cm.isEmpty(that.nodes['content']) && cm.isParent(that.nodes['holder'], that.nodes['content'])){
            that.components['controller'].setContent(that.nodes['content']);
        }
        return that;
    };

    classProto.restoreHolderContent = function(){
        var that = this;
        cm.appendChild(that.nodes['content'], that.nodes['holder']);
        return that;
    };
});
cm.define('App.SearchBox', {
    'modules' : [
        'Params',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'preventClickEvent' : true,
            'adaptiveX' : true,
            'adaptiveY' : false,
            'left' : '-selfWidth+targetWidth',
            'top' : 'targetHeight + 8',
            'className' : 'app-mod__search__tooltip'
        }
    }
},
function(params){
    var that = this,
        components = {};

    that.nodes = {
        'button' : cm.Node('div'),
        'target' : cm.Node('div')
    };

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        // Render tooltip
        components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'target' : that.nodes['button'],
                'content' : that.nodes['target'],
                'events' : {
                    'onShow' : show
                }
            })
        );
    };

    var show = function(){
        // Focus text input
        var input = cm.getByAttr('type', 'text', that.nodes['target'])[0];
        input && input.focus();
    };

    /* ******* MAIN ******* */

    init();
});
cm.define('App.ShutterstockManager', {
    'extend' : 'Com.AbstractFileManager',
    'params' : {
        'lazy' : true,
        'showStats' : false,
        'toolbarConstructor' : 'Com.Toolbar',
        'toolbarParams' : {
            'embedStructure' : 'first'
        },
        'searchConstructor' : 'Com.Input',
        'searchParams' : {
            'embedStructure' : 'append',
            'defaultValue' : null,
            'lazy' : true,
            'icon' : 'icon small search linked'
        },
        'categoriesRequestConstructor' : 'Com.Request',
        'categoriesRequestParams' : {
            'autoSend' : false,
            'responseHTML' : false,
            'ajax' : {
                'type' : 'json',
                'method' : 'get',
                'url' : '/shutterstock-api/images/categories'
            }
        },
        'categoriesConstructor' : 'Com.TabsetHelper',
        'categoriesParams' : {
        },
        'paginationConstructor' : 'Com.GalleryScrollPagination',
        'paginationParams' : {
            'embedStructure' : 'append',
            'showButton' : 'once',
            'gridClass' : 'pt__grid--files',
            'perPage' : 25,
            'columns' : 5,
            'responseCountKey' : 'total_count',
            'responseHTML' : false,
            'ajax' : {
                'type' : 'json',
                'method' : 'get',
                'url' : '/shutterstock-api/images/search/%page%',
                'urlPurchased' : '/shutterstock-api/images/src'
            }
        },
        'overlayConstructor' : 'Com.Overlay',
        'overlayParams' : {
            'autoOpen' : false,
            'lazy' : true,
            'position' : 'absolute'
        }
    },
    'strings' : {
        'categories' : {
            '_all' : 'All',
            '_purchased' : 'My Purchased Images'
        },
        'server_error' : 'An unexpected error has occurred. Please try again later.'
    }
},
function(params){
    var that = this;
    that.getFilesProcessType = null;
    that.isLoaded = false;
    // Call parent class construct
    Com.AbstractFileManager.apply(that, arguments);
});

cm.getConstructor('App.ShutterstockManager', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.categories = [{
            'id' : '_purchased',
            'name' : that.lang('categories._purchased')
        },{
            'id' : '_all',
            'name' : that.lang('categories._all')
        }];
        that.currentCategory = null;
        that.currentQuery = null;
        that.currentItem = null;
        // Binds
        that.renderCategoriesResponseHandler = that.renderCategoriesResponse.bind(that);
        that.renderCategoriesErrorHandler = that.renderCategoriesError.bind(that);
        that.renderListPageHandler = that.renderListPage.bind(that);
        that.renderListErrorHandler = that.renderListError.bind(that);
        that.setListCategoryHandler = that.setListCategory.bind(that);
        that.setListQueryHandler = that.setListQuery.bind(that);
    };

    classProto.renderController = function(){
        var that = this;
        that.isLoaded = true;
        // Request categories
        cm.getConstructor(that.params['categoriesRequestConstructor'], function(classConstructor){
            that.components['categoriesRequest'] = new classConstructor(
                cm.merge(that.params['categoriesRequestParams'], {
                    'overlayContainer' : that.nodes['inner']
                })
            );
            that.components['categoriesRequest'].addEvent('onSuccess', that.renderCategoriesResponseHandler);
            that.components['categoriesRequest'].addEvent('onError', that.renderCategoriesErrorHandler);
            that.components['categoriesRequest'].send();
        });
    };

    /* *** CATEGORIES *** */

    classProto.renderCategoriesError = function(){
        var that = this,
            node = cm.node('div', {'class' : 'cm__empty is-show'}, that.lang('server_error'));
        // Embed
        cm.clearNode(that.nodes['holder']['inner']);
        cm.appendChild(node, that.nodes['holder']['inner']);
        // Show
        cm.removeClass(that.nodes['holder']['container'], 'is-hidden', true);
    };

    classProto.renderCategoriesResponse = function(request, response){
        var that = this,
            data = response['filtered'];
        // Render categories
        that.categories = cm.extend(that.categories, data);
        that.renderCategoriesView();
        that.renderCategoriesViewModel();
        // Show
        cm.removeClass(that.nodes['holder']['container'], 'is-hidden', true);
    };

    classProto.renderCategoriesView = function(){
        var that = this,
            nodes = {};
        that.nodes['categories'] = nodes;
        // Render structure
        nodes['container'] = cm.node('div', {'class' : 'stock__view'},
            cm.node('div', {'class' : 'stock__tabs'},
                cm.node('div', {'class' : 'inner'},
                    cm.node('div', {'class' : 'pt__listing-items'},
                        nodes['tabsHolder'] = cm.node('ul')
                    )
                )
            ),
            nodes['list'] = cm.node('div', {'class' : 'stock__list'},
                nodes['listHolder'] = cm.node('div', {'class' : 'inner'})
            )
        );
        // Render tabs
        cm.forEach(that.categories, function(item){
            that.renderTab(item);
        });
        // Embed
        cm.clearNode(that.nodes['holder']['inner']);
        cm.appendChild(nodes['container'], that.nodes['holder']['inner']);
    };

    classProto.renderTab = function(item){
        var that = this,
            nodes = {};
        // Validate
        item['title'] = item['name'];
        item['label'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('a', item['title'])
        );
        // Embed
        cm.appendChild(nodes['container'], that.nodes['categories']['tabsHolder']);
        // Separator
        if(item['id'] === '_purchased'){
            nodes['sep'] = cm.node('li', {'class' : 'sep'});
            cm.appendChild(nodes['sep'], that.nodes['categories']['tabsHolder']);
        }
    };

    classProto.renderCategoriesViewModel = function(){
        var that = this,
            toolbarSearchField;
        // Render toolbar
        cm.getConstructor(that.params['toolbarConstructor'], function(classConstructor){
            that.components['toolbar'] = new classConstructor(
                cm.merge(that.params['toolbarParams'], {
                    'container' : that.nodes['holder']['inner']
                })
            );
            that.components['toolbar'].addGroup({
                'name' : 'all',
                'position' : 'justify',
                'adaptive' : false,
                'flex' : true
            });
            that.components['toolbar'].addField({
                'name' : 'search',
                'group' : 'all',
                'constructor' : that.params['searchConstructor'],
                'constructorParams' : cm.merge(that.params['searchParams'], {
                    'events' : {
                        'onChange' : that.setListQueryHandler
                    }
                })
            });
            toolbarSearchField = that.components['toolbar'].getField('search', 'all');
            that.components['search'] = toolbarSearchField['controller'];
        });
        // Init tabset helper
        cm.getConstructor(that.params['categoriesConstructor'], function(classConstructor){
            that.components['tabset'] = new classConstructor(
                cm.merge(that.params['categoriesParams'], {
                    'items' : that.categories
                })
            );
            that.components['tabset'].addEvent('onTabShowStart', that.setListCategoryHandler);
            that.components['tabset'].set('_all');
        });
        // Init overlay
        cm.getConstructor(that.params['overlayConstructor'], function(classConstructor){
            that.components['overlay'] = new classConstructor(
                cm.merge(that.params['overlayParams'], {
                    'container' : that.nodes['categories']['list']
                })
            );
        });
        // Init pagination
        cm.getConstructor(that.params['paginationConstructor'], function(classConstructor){
            that.components['pagination'] = new classConstructor(
                cm.merge(that.params['paginationParams'], {
                    'container' : that.nodes['categories']['listHolder'],
                    'scrollNode' : that.nodes['categories']['listHolder']
                })
            );
            that.components['pagination'].addEvent('onStart', function(){
                that.removeListError();
            });
            that.components['pagination'].addEvent('onEnd', function(){
                that.components['overlay'].close();
            });
            that.components['pagination'].addEvent('onPageRenderEnd', that.renderListPageHandler);
            that.components['pagination'].addEvent('onError', that.renderListErrorHandler);
        });
    };

    /* *** LIST *** */

    classProto.renderListError = function(){
        var that = this;
        if(cm.isEmpty(that.components['pagination'].currentPage)){
            // Render structure
            if(!that.nodes['categories']['error']){
                that.nodes['categories']['error'] = cm.node('div', {'class' : 'cm__empty'}, that.lang('server_error'));
            }
            // Embed
            cm.insertFirst(that.nodes['categories']['error'], that.nodes['categories']['listHolder']);
            cm.addClass(that.nodes['categories']['error'], 'is-show', true);
        }
    };

    classProto.removeListError = function(){
        var that = this;
        cm.removeClass(that.nodes['categories']['error'], 'is-show');
        cm.remove(that.nodes['categories']['error']);
    };

    classProto.renderListPage = function(pagination, page){
        var that = this;
        // Render items
        cm.forEach(page['data'], function(item){
            that.renderListItem(item, page['container']);
        });
    };

    classProto.renderListItem = function(item, container){
        var that = this,
            nodes = {};
        item['nodes'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('div', {'class' : 'pt__image is-loading is-centered is-background is-cover is-hover', 'title' : item['description']},
                cm.node('div', {'class' : 'inner'},
                    nodes['descr'] = cm.node('div', {'class' : 'descr'})
                )
            )
        );
        nodes['descr'].style.backgroundImage = cm.URLToCSSURL(item['assets']['huge_thumb']['url']);
        // Load
        cm.onImageLoad(item['assets']['huge_thumb']['url'], function(){
            cm.addClass(nodes['link'], 'is-loaded', true);
        });
        // Events
        cm.addEvent(nodes['link'], 'click', function(){
            that.setListItem(item);
        });
        cm.addEvent(nodes['link'], 'dblclick', function(){
            that.processFiles(item);
            that.complete();
        });
        // Embed
        cm.appendChild(nodes['container'], container);
    };

    classProto.setListCategory = function(tabset, tab){
        var that = this,
            urlType,
            category;
        that.currentCategory = tab['id'];
        // Update pagination action
        if(that.components['pagination']){
            that.components['overlay'].open();
            // Set search
            if(that.currentCategory === '_purchased'){
                that.components['search'].reset();
                that.components['search'].disable();
            }else{
                that.components['search'].enable();
            }
            // Set ajax parameters
            urlType = that.currentCategory === '_purchased' ? 'urlPurchased' : 'url';
            category = /^_/.test(that.currentCategory) ? null : that.currentCategory;
            that.components['pagination'].setAction({
                'url' : that.params['paginationParams']['ajax'][urlType],
                'params' : {
                    'category' : category
                }
            });
        }
    };

    classProto.setListQuery = function(input, value){
        var that = this,
            rebuild;
        that.currentQuery = value;
        // Update pagination action
        if(that.components['pagination']){
            that.components['overlay'].open();
            // Set ajax parameters
            rebuild = that.currentCategory !== '_purchased';
            that.components['pagination'].setAction({
                'params' : {
                    'query' : that.currentQuery
                }
            }, null, null, rebuild);
        }
    };

    classProto.setListItem = function(item){
        var that = this;
        // Unset previous
        if(that.currentItem){
            cm.removeClass(that.currentItem['nodes']['link'], 'active');
            that.currentItem = null;
        }
        // Set new
        cm.addClass(item['nodes']['link'], 'active');
        that.currentItem = item;
        that.processFiles(item);
    };

    /* *** PROCESS FILES *** */

    classProto.convertFile = function(data){
        var name = data['assets']['preview']['url'].split('/').pop();
        // Return converted data
        return {
            'value' : data['assets']['preview']['url'],
            'name' : name,
            'description' : data['description'],
            'mime' : data['media_type'],
            'size' : null,
            'url' : data['assets']['preview']['url'],
            'id' : data['id'],
            'source' : 'shutterstock_preview'
        }
    };
});
cm.define('App.Sidebar', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Storage',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onCollapseStart',
        'onCollapse',
        'onCollapseEnd',
        'onExpandStart',
        'onExpand',
        'onExpandEnd',
        'onTabShow',
        'onTabHide',
        'onResize'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : 'app-sidebar',
        'duration' : 'cm._config.animDurationLong',
        'active' : 'template-manager',
        'target' : 'document.html',
        'remember' : true,
        'theme' : 'dark',
        'ajax' : {
            'type' : 'json',
            'method' : 'get',
            'url' : '',                                             // Request URL. Variables: %tab%, %callback% for JSONP.
            'params' : ''                                           // Params object. %tab%, %callback% for JSONP.
        },
        'Com.TabsetHelper' : {
            'node' : cm.Node('div'),
            'name' : '',
            'responseHTML' : true
        },
        'Com.Overlay' : {
            'theme' : 'dark',
            'className' : 'sidebar__overlay'
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'inner' : cm.Node('div'),
        'collapseButtons' : [],
        'labels' : [],
        'tabs' : []
    };
    that.components = {};
    that.isExpanded = null;
    that.openInterval = null;
    that.currentTab = null;
    that.previousTab = null;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var getLESSVariables = function(){
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppSidebar-Duration', that.params['duration']);
        that.params['theme'] = cm.getLESSVariable('AppSidebar-Theme', that.params['theme']).toLowerCase();
    };

    var validateParams = function(){
        that.params['Com.Overlay']['theme'] = that.params['theme'];
        that.params['Com.Overlay']['name'] = that.params['name'];
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['ajax'] = that.params['ajax'];
        that.params['Com.TabsetHelper']['overlayParams'] = that.params['Com.Overlay']
    };

    var render = function(){
        var isExpanded,
            storageExpanded;
        // Init tabset
        processTabset();
        // Add events on collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addEvent(item['container'], 'click', that.toggle);
        });
        // Check toggle class
        isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        // Check storage
        if(that.params['remember']){
            storageExpanded = that.storageRead('isExpanded');
            isExpanded = storageExpanded !== null ? storageExpanded : isExpanded;
        }
        // Trigger events
        if(isExpanded){
            that.expand(true, true);
        }else{
            that.collapse(true, true);
        }
        cm.addEvent(window, 'resize', resizeAction);
        cm.customEvent.add(that.nodes['container'], 'scrollSizeChange', resizeAction);
    };

    var processTabset = function(){
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper'])
                .addEvent('onLabelTarget', function(tabset, item){
                    if(!that.isExpanded || tabset.get() === item['id']){
                        that.toggle();
                    }
                })
                .addEvent('onTabHide', function(tabset, item){
                    that.previousTab = item;
                    that.triggerEvent('onTabHide', item);
                })
                .addEvent('onTabShow', function(tabset, item){
                    that.currentTab = item;
                    that.triggerEvent('onTabShow', item);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels'])
                .set(that.params['active']);
        });
        // Tabs events
        cm.forEach(that.nodes['tabs'], function(item){
            cm.addIsolateScrolling(item['descr']);
        });
    };

    var resizeAction = function(){
        animFrame(function(){
            if(cm._pageSize['winWidth'] <= cm._config['adaptiveFrom']){
                if(that.isExpanded){
                    that.collapse(true);
                }
            }
        });
    };

    var afterExpand = function(){
        cm.replaceClass(that.params['target'], 'is-sidebar--collapsed is-sidebar--expanding', 'is-sidebar--expanded', true);
        that.triggerEvent('onExpandEnd');
    };

    var afterCollapse = function(){
        cm.replaceClass(that.params['target'], 'is-sidebar--expanded is-sidebar--collapsing', 'is-sidebar--collapsed', true);
        that.triggerEvent('onCollapseEnd');
    };

    /* ******* MAIN ******* */

    that.collapse = function(isImmediately, force){
        if(force || typeof that.isExpanded !== 'boolean' || that.isExpanded){
            that.isExpanded = false;
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isExpanded', false);
            }
            that.triggerEvent('onCollapseStart');
            // Set immediately animation hack
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
                cm.addClass(that.params['target'], 'is-immediately');
            }
            cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed', true);
            cm.addClass(that.params['target'], 'is-sidebar--collapsing', true);
            // Trigger collapse event after change classes
            that.triggerEvent('onCollapse');
            // Unset active class to collapse buttons
            cm.forEach(that.nodes['collapseButtons'], function(item){
                cm.removeClass(item['container'], 'active');
            });
            // Remove immediately animation hack
            that.openInterval && clearTimeout(that.openInterval);
            if(isImmediately){
                afterCollapse();
                that.openInterval = setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                    cm.removeClass(that.params['target'], 'is-immediately');
                }, 5);
            }else{
                that.openInterval = setTimeout(function(){
                    afterCollapse();
                }, that.params['duration'] + 5);
            }
        }
        return that;
    };

    that.expand = function(isImmediately, force){
        if(force || typeof that.isExpanded !== 'boolean' || !that.isExpanded){
            that.isExpanded = true;
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isExpanded', true);
            }
            that.triggerEvent('onExpandStart');
            // Set immediately animation hack
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
                cm.addClass(that.params['target'], 'is-immediately');
            }
            cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded', true);
            cm.addClass(that.params['target'], 'is-sidebar--expanding', true);
            // Trigger expand event after change classes
            that.triggerEvent('onExpand');
            // Set active class to collapse buttons
            cm.forEach(that.nodes['collapseButtons'], function(item){
                cm.addClass(item['container'], 'active');
            });
            // Remove immediately animation hack
            that.openInterval && clearTimeout(that.openInterval);
            if(isImmediately){
                afterExpand();
                that.openInterval = setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                    cm.removeClass(that.params['target'], 'is-immediately');
                }, 5);
            }else{
                that.openInterval = setTimeout(function(){
                    afterExpand();
                }, that.params['duration'] + 5);
            }
        }
        return that;
    };

    that.toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
        return that;
    };

    that.refresh = function(){
        if(that.components['tabset']){
            that.components['tabset'].refresh();
        }
        return that;
    };

    that.setTab = function(id){
        if(that.components['tabset']){
            that.components['tabset'].set(id);
        }
        return that;
    };

    that.unsetTab = function(){
        if(that.components['tabset']){
            that.components['tabset'].unset();
        }
        return that;
    };

    that.getTab = function(){
        if(that.components['tabset']){
            return that.components['tabset'].get();
        }
        return null;
    };

    that.refreshTab = function(id){
        if(that.components['tabset']){
            that.components['tabset'].refreshTab(id);
        }
        return that;
    };

    that.getDimensions = function(key){
        var rect = cm.getRect(that.nodes['container']);
        return rect[key] || rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
cm.define('App.Template', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRedraw',
        'onResize',
        'enableEditing',
        'disableEditing'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-template',
        'scrollNode' : 'document.body',
        'scrollDuration' : 1000,
        'topMenuName' : 'app-topmenu',
        'sidebarName' : 'app-sidebar',
        'editorName' : 'app-editor',
        'template' : {
            'type' : 'box',            // wide | box
            'width' : 1000,
            'align' : 'center',
            'indent' : 24
        },
        'header' : {
            'fixed' : false,
            'overlapping' : false,
            'sticky' : false,           // Not implemented
            'transformed' : false,
            'mobileFixed' : null,
            'mobileOverlapping' : null
        },
        'content' : {
            'editableIndent' : 0
        },
        'footer' : {
            'sticky' : true
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'inner' : cm.Node('div'),
        'headerContainer' : cm.Node('div'),
        'headerTransformed' : cm.Node('div'),
        'header' : cm.Node('div'),
        'header2' : cm.Node('div'),
        'content' : cm.Node('div'),
        'footer' : cm.Node('div'),
        'buttonUp' : cm.Node('div'),
        'buttonsUp' : []
    };

    that.isEditing = null;
    that.components = {};
    that.anim = {};
    that.offsets = {};

    var init = function(){
        getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        redraw(true);
        that.triggerEvent('onRender');
    };

    var getLESSVariables = function(){
        that.params['content']['editableIndent'] = cm.getLESSVariable('AppTpl-Content-EditableIndent', that.params['content']['editableIndent'], true);
    };

    var validateParams = function(){
        if(!cm.isBoolean(that.params['header']['mobileOverlapping'])){
            that.params['header']['mobileOverlapping'] = that.params['header']['overlapping'];
        }
        if(!cm.isBoolean(that.params['header']['mobileFixed'])){
            that.params['header']['mobileFixed'] = that.params['header']['fixed'];
        }
    };

    var render = function(){
        // Structure
        that.nodes['headerSpace'] = cm.node('div', {'class' : 'tpl__header__space'});
        cm.insertAfter(that.nodes['headerSpace'], that.nodes['headerContainer']);
        // Find components
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
        });
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject;
        });
        new cm.Finder('App.Editor', that.params['editorName'], null, function(classObject){
            that.components['editor'] = classObject;
        }, {'event' : 'onProcessStart'});
        // Scroll Controllers
        that.anim['scroll'] = new cm.Animation(that.params['scrollNode']);
        cm.addEvent(that.nodes['buttonUp'], 'click', that.scrollToTop);
        // Events
        cm.addEvent(window, 'resize', function(){
            animFrame(function(){
                that.triggerEvent('onResize');
                redraw(true);
            });
        });
        cm.addEvent(window, 'scroll', function(){
            animFrame(function(){
                scroll();
            });
        });
    };

    var setState = function(){
        if(cm.getPageSize('winWidth') <= cm._config.screenTabletPortrait){
            if(that.params['header']['mobileOverlapping']){
                cm.addClass(that.nodes['headerContainer'], 'is-overlapping');
            }
            if(that.params['header']['mobileFixed']){
                cm.addClass(that.nodes['headerContainer'], 'is-fixed');
            }
            if(that.params['header']['mobileFixed'] && !that.params['header']['mobileOverlapping']){
                cm.addClass(that.nodes['headerSpace'], 'is-show');
            }
        }else{
            if(that.params['header']['overlapping']){
                cm.addClass(that.nodes['headerContainer'], 'is-overlapping');
            }
            if(that.params['header']['fixed']){
                cm.addClass(that.nodes['headerContainer'], 'is-fixed');
            }
            if(that.params['header']['fixed'] && !that.params['header']['overlapping']){
                cm.addClass(that.nodes['headerSpace'], 'is-show');
            }
        }
        cm.addClass(that.nodes['headerTransformed'], 'is-fixed');
        cm.removeClass(that.nodes['headerTransformed'], 'is-show');
    };

    var unsetState = function(){
        cm.removeClass(that.nodes['headerContainer'], 'is-overlapping is-fixed');
        cm.removeClass(that.nodes['headerSpace'], 'is-show');
        cm.removeClass(that.nodes['headerTransformed'], 'is-fixed');
        if(that.params['header']['transformed']){
            cm.addClass(that.nodes['headerTransformed'], 'is-show');
        }
    };

    var stateHelper = function(){
        unsetState();
        if(!that.isEditing || cm.getPageSize('winWidth') <= cm._config.screenTabletPortrait){
            setState();
        }
    };

    var redraw = function(triggerEvents){
        stateHelper();
        getOffsets();
        resizeContent();
        setHeaderTransformed();
        // Redraw Events
        if(triggerEvents){
            that.triggerEvent('onRedraw');
        }
    };

    var scroll = function(){
        getOffsets();
        setHeaderTransformed();
    };

    var getOffsets = function(){
        that.offsets['top'] = that.components['topMenu'] ? that.components['topMenu'].getDimensions('height') : 0;
        that.offsets['left'] = that.components['sidebar'] ? that.components['sidebar'].getDimensions('width') : 0;
        that.offsets['header'] = that.nodes['header'].offsetHeight;
        that.offsets['header2'] = that.nodes['header2'].offsetHeight;
        that.offsets['footer'] = that.nodes['footer'].offsetHeight;
        that.offsets['height'] = cm.getPageSize('winHeight') - that.offsets['top'];
        that.offsets['scrollTop'] = cm.getBodyScrollTop();
    };

    var resizeContent = function(){
        that.nodes['inner'].style.minHeight = that.offsets['height'] + 'px';
        if(that.isEditing){
            if(that.params['footer']['sticky']){
                that.offsets['contentHeightCalc'] = that.offsets['height']
                    - that.offsets['header']
                    - that.offsets['footer']
                    - (that.params['content']['editableIndent'] * 2);
                if(that.params['header']['transformed']){
                    that.offsets['contentHeightCalc'] = that.offsets['contentHeightCalc']
                        - that.offsets['header2']
                        - that.params['content']['editableIndent'];
                }
                that.nodes['content'].style.minHeight = Math.max(that.offsets['contentHeightCalc'], 0) + 'px';
            }
        }else{
            if(that.params['header']['fixed'] && !that.params['header']['overlapping']){
                that.nodes['headerSpace'].style.height = that.offsets['header'] + 'px';
            }
            if(that.params['footer']['sticky']){
                if(that.params['header']['overlapping']){
                    that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['footer']), 0) + 'px';
                }else{
                    that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['header'] - that.offsets['footer']), 0) + 'px';
                }
            }
        }
    };

    var setHeaderTransformed = function(){
        if(that.params['header']['transformed']){
            if(that.isEditing){
                cm.addClass(that.nodes['headerTransformed'], 'is-show');
            }else{
                if(that.offsets['scrollTop'] >= that.offsets['header']){
                    cm.addClass(that.nodes['headerTransformed'], 'is-show');
                }else{
                    cm.removeClass(that.nodes['headerTransformed'], 'is-show');
                }
            }
        }
    };

    /* ******* MAIN ******* */

    that.redraw = function(triggerEvents){
        triggerEvents = cm.isUndefined(triggerEvents) ? true : triggerEvents;
        redraw(triggerEvents);
        return that;
    };

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.nodes['container'], 'is-editing');
            that.redraw();
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.nodes['container'], 'is-editing');
            that.redraw();
            that.triggerEvent('disableEditing');
        }
        return that;
    };

    that.scrollTo = function(num, duration){
        that.anim['scroll'].go({'style' : {'docScrollTop' : num}, 'duration' : duration, 'anim' : 'smooth'});
        return that;
    };

    that.scrollToTop = function(){
        that.scrollTo(0, that.params['scrollDuration']);
        return that;
    };

    that.scrollStop = function(){
        that.anim['scroll'].stop();
        return that;
    };

    that.getHeaderDimensions = function(key){
        var rect = cm.getRect(that.nodes['header']);
        return rect[key] || rect;
    };

    that.getFooterDimensions = function(key){
        var rect = cm.getRect(that.nodes['footer']);
        return rect[key] || rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
cm.define('App.TopMenu', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onCollapse',
        'onExpand',
        'onUndo',
        'onRedo'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : 'app-topmenu',
        'target' : 'document.html'
    }
},
function(params){
    var that = this,
        eventInterval;

    that.nodes = {
        'container': cm.node('div'),
        'inner': cm.node('div'),
        'button': cm.node('div'),
        'target': cm.node('div'),
        'items' : {}
    };
    that.isExpanded = false;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        render();
        that.triggerEvent('onRender');
    };

    var render = function(){
        preventMenuBlinking();
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        cm.addEvent(that.nodes['button'], 'click', that.toggle);
        if(that.nodes['items']['undo']){
            cm.addEvent(that.nodes['items']['undo']['link'], 'click', that.undo);
        }
        if(that.nodes['items']['redo']){
            cm.addEvent(that.nodes['items']['redo']['link'], 'click', that.redo);
        }
        cm.addEvent(window, 'resize', preventMenuBlinking);
    };

    var preventMenuBlinking = function(){
        cm.addClass(that.nodes['container'], 'cm__transition-disable');
        eventInterval && clearTimeout(eventInterval);
        eventInterval = setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'cm__transition-disable');
        }, 5);
    };

    /* ******* MAIN ******* */

    /* *** REQUESTS *** */

    that.undo = function(){
        that.triggerEvent('onUndo');
        return that;
    };

    that.redo = function(){
        that.triggerEvent('onRedo');
        return that;
    };

    /* *** PUBLIC *** */

    that.expand = function(){
        if(!that.isExpanded){
            that.isExpanded = true;
            cm.addClass(that.nodes['button'], 'active');
            cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded');
            cm.replaceClass(that.params['target'], 'is-topmenu--collapsed', 'is-topmenu--expanded', true);
            that.triggerEvent('onExpand');
        }
        return that;
    };

    that.collapse = function(){
        if(that.isExpanded){
            that.isExpanded = false;
            cm.removeClass(that.nodes['button'], 'active');
            cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed');
            cm.replaceClass(that.params['target'], 'is-topmenu--expanded', 'is-topmenu--collapsed', true);
            that.triggerEvent('onCollapse');
        }
        return that;
    };

    that.toggle = function(){
        if(that.isExpanded){
            that.collapse();
        }else{
            that.expand();
        }
        return that;
    };

    that.setActiveItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            cm.addClass(item['container'], 'active')
        }
        return that;
    };

    that.unsetActiveItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            cm.removeClass(item['container'], 'active')
        }
        return that;
    };

    that.getItem = function(id){
        var item;
        if(id && (item = that.nodes['items'][id])){
            return item;
        }
        return null;
    };

    that.getDimensions = function(key){
        var rect = cm.getRect(that.nodes['container']);
        return rect[key] || rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
App._Zones = {};

cm.define('App.Zone', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRemove'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'type' : 'template-manager',            // template-manager | form-manager | mail | remove
        'instanceId' : false,
        'zone' : 0,
        'layerId' : 0,
        'link' : false,                         // {'positionId' : 0, 'layerId' : 0, type' : ''}
        'locked' : false,
        'disallow' : [],
        'editorName' : 'app-editor'
    }
},
function(params){
    var that = this;

    that.isEditing = null;
    that.isRemoved = false;
    that.isActive = false;
    that.styleObject = null;
    that.offsets = null;
    that.dimensions = null;

    that.components = {};
    that.node = null;
    that.block = null;
    that.dummyBlocks = [];
    that.blocks = [];

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        if(that.params['link']){
            that.params['linkName'] = [that.params['link']['type'], that.params['link']['positionId'], that.params['zone']].join('_');
            that.params['blockName'] = [that.params['link']['type'], that.params['link']['positionId']].join('_');
        }else{
            that.params['blockName'] = [that.params['type'], that.params['positionId']].join('_');
        }
        if(cm.isNumber(that.params['instanceId']) || cm.isString(that.params['instanceId'])){
            that.params['name'] = [that.params['type'], that.params['instanceId'], that.params['positionId'], that.params['zone']].join('_');
        }else{
            that.params['name'] = [that.params['type'], that.params['positionId'], that.params['zone']].join('_');
        }
        // Export
        App._Zones[that.params['name']] = that;
    };

    var render = function(){
        that.node = that.params['node'];
        // Calculate dimensions
        that.getDimensions();
        // Init zone
        cm.addClass(that.node, 'app__zone');
        cm.addClass(that.node, ['is', that.params['type']].join('-'));
        if(that.params['locked']){
            cm.addClass(that.node, 'is-locked');
        }else{
            cm.addClass(that.node, 'is-available');
        }
        // Construct
        cm.find('App.Editor', that.params['editorName'], null, function(classObject){
            new cm.Finder('App.Block', that.params['blockName'], null, constructBlock);
            constructEditor(classObject);
        });
    };

    var constructBlock = function(classObject){
        if(classObject){
            that.block = classObject;
            that.block.addZone(that);
        }
    };

    var destructBlock = function(classObject){
        if(classObject){
            that.block = classObject;
            that.block.removeZone(that);
            that.block = null;
        }
    };

    var constructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].addZone(that);
        }
    };

    var destructEditor = function(classObject){
        if(classObject){
            that.components['editor'] = classObject;
            that.components['editor'].removeZone(that);
        }
    };

    /* ******* PUBLIC ******* */

    that.register = function(classObject){
        var block = App._Blocks[that.params['blockName']];
        constructBlock(block);
        constructEditor(classObject);
        return that;
    };

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.addClass(that.node, 'is-editing', true);
            if(!that.params['locked']){
                cm.addClass(that.node, 'is-editable', true);
            }
            that.getDimensions();
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.node, 'is-editing', true);
            if(!that.params['locked']){
                cm.removeClass(that.node, 'is-editable', true);
            }
            that.getDimensions();
        }
        return that;
    };

    that.addBlock = function(block, index){
        if(block.isDummy){
            if(!cm.isUndefined(index) && cm.isNumber(index)){
                that.dummyBlocks[index] = block;
            }else{
                that.dummyBlocks.push(block);
            }
        }else{
            if(!cm.isUndefined(index) && cm.isNumber(index)){
                that.blocks.splice(index, 0, block);
            }else{
                that.blocks.push(block);
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

    that.getBlockIndex = function(block){
        if(block.isDummy){
            return that.dummyBlocks.indexOf(block);
        }else{
            return that.blocks.indexOf(block);
        }
    };

    that.getBlock = function(index){
        return that.blocks[index];
    };

    that.highlight = function(){
        if(!that.params['locked']){
            cm.addClass(that.node, 'is-highlight');
        }
        return that;
    };

    that.unhighlight = function(){
        if(!that.params['locked']){
            cm.removeClass(that.node, 'is-highlight');
        }
        return that;
    };

    that.active = function(){
        if(!that.params['locked']){
            that.isActive = true;
            cm.addClass(that.node, 'is-active');
        }
        return that;
    };

    that.unactive = function(){
        if(!that.params['locked']){
            that.isActive = false;
            cm.removeClass(that.node, 'is-active');
        }
        return that;
    };

    that.remove = function(){
        if(!that.isRemoved){
            that.isRemoved = true;
            destructBlock(that.block);
            destructEditor(that.components['editor']);
            while(that.blocks.length){
                that.blocks[0].remove();
            }
            delete App._Zones[that.params['name']];
            that.removeFromStack();
            cm.remove(that.params['node']);
            that.triggerEvent('onRemove');
        }
        return that;
    };

    that.getDimensions = function(){
        if(!that.styleObject){
            that.styleObject = cm.getStyleObject(that.node);
        }
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, null);
        return that.dimensions;
    };

    that.updateDimensions = function(){
        that.dimensions = cm.getNodeOffset(that.node, that.styleObject, that.dimensions);
        return that.dimensions;
    };

    init();
});
cm.define('App.elFinderFileManager', {
    'extend' : 'Com.AbstractFileManager',
    'params' : {
        'lazy' : false,
        'config' : {
            url : '',
            lang : {},
            dotFiles : false,
            useBrowserHistory : false,
            resizable : false,
            width : 'auto',
            height : 'auto',
            commandsOptions : {
                getfile : {
                    folders : false,
                    multiple : false
                }
            }
        }
    }
},
function(params){
    var that = this;
    that.getFilesProcessType = null;
    that.isLoaded = false;
    // Call parent class construct
    Com.AbstractFileManager.apply(that, arguments);
});

cm.getConstructor('App.elFinderFileManager', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.getFilesEventHandler = that.getFilesEvent.bind(that);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.get = function(){
        var that = this;
        that.getFilesProcessType = 'get';
        if(that.components['controller']){
            that.components['controller'].exec('getfile');
        }else{
            classInherit.prototype.get.apply(that, arguments);
        }
        return that;
    };

    classProto.complete = function(){
        var that = this;
        that.getFilesProcessType = 'complete';
        if(that.components['controller']){
            that.components['controller'].exec('getfile');
        }else{
            classInherit.prototype.complete.apply(that, arguments);
        }
        return that;
    };

    classProto.redraw = function(){
        var that = this;
        if(that.components['controller']){
            that.components['controller'].resize('auto', 'auto');
        }
        that.triggerEvent('onRedraw');
        return that;
    };

    classProto.renderController = function(){
        var that = this;
        // Init elFinder
        if(!that.components['controller']){
            if(typeof elFinder !== 'undefined'){
                that.isLoaded = true;
                that.components['controller'] = new elFinder(that.nodes['holder']['inner'],
                    cm.merge(that.params['config'], {
                        commandsOptions : {
                            getfile : {
                                multiple: that.isMultiple
                            }
                        },
                        getFileCallback : that.getFilesEventHandler
                    })
                );
                // Show
                cm.removeClass(that.nodes['holder']['container'], 'is-hidden', true);
                that.components['controller'].show();
                that.components['controller'].resize('auto', 'auto');
            }else{
                cm.errorLog({
                    'name' : that._name['full'],
                    'message' : ['elFinder does not exists.'].join(' ')
                });
            }
        }
        return that;
    };

    /* *** PROCESS FILES *** */

    classProto.getFilesEvent = function(data){
        var that = this;
        // Read files and convert to file format
        that.processFiles(data);
        // Callbacks
        switch(that.getFilesProcessType){
            case 'get':
                classInherit.prototype.get.call(that);
                break;
            case 'complete':
                classInherit.prototype.complete.call(that);
                break;
            default:
                classInherit.prototype.complete.call(that);
                break;

        }
        that.getFilesProcessType = null;
        return that;
    };

    classProto.convertFile = function(data){
        if(!data || data['mime'] === 'directory'){
            return false;
        }
        return {
            'value' : data['url'],
            'name' : data['name'],
            'mime' : data['mime'],
            'size' : data['size'],
            'url' : data['url'],
            'source' : 'elFinder'
        }
    };
});
cm.define('App.elFinderFileManagerContainer', {
    'extend' : 'Com.AbstractFileManagerContainer',
    'params' : {
        'constructor' : 'App.elFinderFileManager'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractFileManagerContainer.apply(that, arguments);
});
cm.define('Module.Anchor', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'duration' : 'cm._config.animDuration',
        'scroll' : 'document.body',
        'topMenuName' : 'app-topmenu',
        'templateName' : 'app-template',
        'customEvents' : true,
        'resizeEvent' : true,
        'scrollEvent' : true
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.Anchor', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Variables
        that.isActive = false;
        that.isHashProcess = false;
        that.isRenewProcess = false;
        that.topMenuParams = {};
        that.templateParams = {};
        // Bind context to methods
        that.onHashChangeHandler = that.onHashChange.bind(that);
        that.onConstructEndHandler = that.onConstructEnd.bind(that);
        that.onDestructProcessHandler = that.onDestructProcess.bind(that);
        that.onRedrawHandler = that.onRedraw.bind(that);
        that.onScrollHandler = that.onScroll.bind(that);
        // Add events
        that.addEvent('onConstructEnd', that.onConstructEndHandler);
        that.addEvent('onDestructProcess', that.onDestructProcessHandler);
        that.addEvent('onRedraw', that.onRedrawHandler);
        that.addEvent('onScroll', that.onScrollHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.onConstructEnd = function(){
        var that = this;
        that.prepareHash({
            'immediately' : true,
            'force' : true
        });
        return that;
    };

    classProto.onDestructProcess = function(){
        var that = this;
        // Remove location hash change handler
        cm.removeEvent(window, 'hashchange', that.onHashChangeHandler);
        // Remove current hash if it equal to anchor name
        that.clearHash();
        return that;
    };

    classProto.onRedraw = function(){
        var that = this;
        that.prepareHash({
            'immediately' : true,
            'force' : true
        });
        return that;
    };

    classProto.onScroll = function(){
        var that = this;
        if(!that.isHashProcess){
            that.clearHash();
        }
        return that;
    };

    classProto.onHashChange = function(e){
        var that = this;
        if(that.isRenewProcess){
            cm.preventDefault(e);
            that.isRenewProcess = false;
            that.isActive = false;
        }else{
            if(that.isHashActive()){
                cm.preventDefault(e);
            }
            that.prepareHash({
                'immediately' : false,
                'force' : false
            });
        }
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Get TopMenu
        new cm.Finder('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
            that.topMenuParams = that.components['topMenu'].getParams();
        });
        // Get Template
        new cm.Finder('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.templateParams = that.components['template'].getParams();
        });
        // Init animation handler
        that.components['animation'] = new cm.Animation(that.params['scroll']);
        // Add location hash change handler
        cm.addEvent(window, 'hashchange', that.onHashChangeHandler);
        return that;
    };

    classProto.prepareHash = function(params){
        var that = this;
        // Configure
        params = cm.merge({
            'immediately' : false,
            'force' : false
        }, params);
        // Check hash state
        if(that.isHashActive()){
            if(!that.isActive || params['force']){
                that.isActive = true;
                that.processHash(params);
            }
        }else{
            that.isActive = false;
        }
        return that;
    };

    classProto.processHash = function(params){
        var that = this,
            styles = {},
            top = 0;
        // Prepare
        top = cm.getY(that.params['node']);
        // Add top menu gape
        if(that.components['topMenu']){
            top -= that.components['topMenu'].getDimensions('height');
        }
        // Add template's fixed header gape
        if(that.components['template'] && that.templateParams['header']['fixed']){
            top -= that.components['template'].getHeaderDimensions('height');
        }
        // Set safe values
        top = Math.max(top, 0);
        top = Math.min(top, cm._pageSize['scrollHeight']);
        // Move scroll
        if(params['immediately']){
            that.isHashProcess = false;
            cm.setScrollTop(that.params['scroll'], top);
        }else{
            that.isHashProcess = true;
            // Scroll style
            if(that.params['scroll'] == document.body){
                styles = {'docScrollTop' : top};
            }else{
                styles = {'scrollTop' : top};
            }
            // Go
            that.components['animation'].go({'style' : styles, 'anim' : 'smooth', 'duration' : that.params['duration'], 'onStop' : function(){
                setTimeout(function(){
                    that.isHashProcess = false;
                }, 500);
            }});
        }
        return that;
    };

    classProto.clearHash = function(){
        var that = this,
            url;
        if(cm._isDocumentLoad && that.isHashActive()){
            that.isRenewProcess = true;
            url = window.location.href.replace(/(#.*)$/, '');
            window.location.hash = ['__hash', Date.now(), 'hash__'].join('--');
            window.history.replaceState(null, null, url);
        }
        return that;
    };

    classProto.isHashActive = function(){
        var that = this,
            hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        return that.params['name'] === hash;
    };
});
/* ******* COMPONENTS: CALENDAR ******* */

cm.define('Module.Calendar', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Callbacks',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onError',
        'onAbort',
        'onSuccess',
        'onSendStart',
        'onSendEnd',
        'onProcessEnd'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : '',
        'defaultView' : 'agenda',                                   // agenda | week | month
        'isViewPreloaded' : false,
        'animateDuration' : 'cm._config.animDuration',
        'showLoader' : true,
        'loaderDelay' : 'cm._config.loadDelay',
        'responseKey' : 'data',                                     // Instead of using filter callback, you can provide response array key
        'responseHTML' : true,                                      // If true, html will append automatically
        'ajax' : {
            'type' : 'json',
            'method' : 'get',
            'url' : '',                                             // Request URL. Variables: %baseUrl%, %view%, %year%, %month%, %week%, %callback% for JSONP.
            'params' : {                                            // Params object. %baseUrl%, %view%, %year%, %month%, %week%, %callback% for JSONP.
                'view' : '%view%',
                'week' : '%week%',
                'month' : '%month%',
                'year' : '%year%',
                'query' : '%query%'
            }
        },
        'Com.Overlay' : {
            'position' : 'absolute',
            'autoOpen' : false,
            'removeOnClose' : true,
            'appendMode' : 'insertFirst'
        }
    },
    'strings' : {
        'server_error' : 'An unexpected error has occurred. Please try again later.'
    }
},
function(params){
    var that = this,
        viewDetailsPattern = {
            'view' : null,
            'week' : null,
            'month' : null,
            'year' : null,
            'query' : null
        };

    that.nodes = {
        'container' : cm.node('div'),
        'buttons' : {
            'views' : {
                'agenda' : cm.node('div'),
                'week' : cm.node('div'),
                'month' : cm.node('div')
            }
        },
        'holder' : {
            'container' : cm.node('div'),
            'inner' : cm.node('div')
        }
    };
    that.components = {};
    that.animations = {};

    that.ajaxHandler = null;
    that.isProcess = false;
    that.isRendering = false;
    that.loaderDelay = null;
    that.viewDetails = cm.clone(viewDetailsPattern);

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['name'] = that.params['name'].toString();
        that.params['defaultView'] = cm.inArray(['agenda', 'week', 'month'], that.params['defaultView']) ? that.params['defaultView'] : 'month';
        that.params['Com.Overlay']['container'] = that.nodes['container'];
    };

    var render = function(){
        // Overlay
        cm.getConstructor('Com.Overlay', function(classConstructor, className){
            that.components['loader'] = new classConstructor(that.params[className]);
        });
        // Animations
        that.animations['response'] = new cm.Animation(that.nodes['holder']['container']);
        // View Buttons
        cm.forEach(that.nodes['buttons']['views'], function(node, key){
            cm.addEvent(node, 'click', function(e){
                cm.preventDefault(e);
                setView({
                    'view' : key
                });
            });
        });
        // View Finder
        new cm.Finder('Module.CalendarAgenda', that.params['name'], that.nodes['holder']['inner'], function(classObject){
            classObject.addEvent('onRequestView', function(calendar, data){
                setView(data);
            });
        }, {'multiple' : true});
        new cm.Finder('Module.CalendarWeek', that.params['name'], that.nodes['holder']['inner'], function(classObject){
            classObject.addEvent('onRequestView', function(calendar, data){
                setView(data);
            });
        }, {'multiple' : true});
        new cm.Finder('Module.CalendarMonth', that.params['name'], that.nodes['holder']['inner'], function(classObject){
            classObject.addEvent('onRequestView', function(calendar, data){
                setView(data);
            });
        }, {'multiple' : true});
        // Render View
        !that.params['isViewPreloaded'] && setView({
            'view' : that.params['defaultView']
        });
    };

    var setViewDetails = function(data){
        that.viewDetails = cm.merge(viewDetailsPattern, data);
    };

    var setView = function(data){
        if(that.isProcess){
            that.abort();
        }
        if(!that.isProcess && !that.isRendering){
            setViewDetails(data);
            cm.forEach(that.nodes['buttons']['views'], function(node, key){
                if(key === that.viewDetails['view']){
                    cm.replaceClass(node, 'button-secondary', 'button-primary');
                }else{
                    cm.replaceClass(node, 'button-primary', 'button-secondary');
                }
            });
            that.ajaxHandler = that.callbacks.request(that, cm.clone(that.params['ajax']));
        }
    };

    /* ******* CALLBACKS ******* */

    /* *** AJAX *** */

    that.callbacks.prepare = function(that, config){
        config = that.callbacks.beforePrepare(that, config);
        config['url'] = cm.strReplace(config['url'], {
            '%baseUrl%' : cm._baseUrl,
            '%view%' : that.viewDetails['view'],
            '%year%' : that.viewDetails['year'],
            '%month%' : that.viewDetails['month'],
            '%week%' : that.viewDetails['week'],
            '%query%' : that.viewDetails['query']
        });
        config['params'] = cm.objectReplace(config['params'], {
            '%baseUrl%' : cm._baseUrl,
            '%view%' : that.viewDetails['view'],
            '%year%' : that.viewDetails['year'],
            '%month%' : that.viewDetails['month'],
            '%week%' : that.viewDetails['week'],
            '%query%' : that.viewDetails['query']
        });
        config = that.callbacks.afterPrepare(that, config);
        return config;
    };

    that.callbacks.beforePrepare = function(that, config){
        return config;
    };

    that.callbacks.afterPrepare = function(that, config){
        return config;
    };

    that.callbacks.request = function(that, config){
        config = that.callbacks.prepare(that, config);
        // Return ajax handler (XMLHttpRequest) to providing abort method.
        return cm.ajax(
            cm.merge(config, {
                'onStart' : function(){
                    that.callbacks.start(that);
                },
                'onSuccess' : function(response){
                    that.callbacks.response(that, config, response);
                },
                'onError' : function(){
                    that.callbacks.error(that, config);
                },
                'onAbort' : function(){
                    that.callbacks.abort(that, config);
                },
                'onEnd' : function(){
                    that.callbacks.end(that);
                }
            })
        );
    };

    that.callbacks.filter = function(that, config, response){
        var data,
            dataItem = cm.objectSelector(that.params['responseKey'], response);
        if(dataItem && !cm.isEmpty(dataItem)){
            data = dataItem;
        }
        return data;
    };

    that.callbacks.start = function(that, config){
        that.isProcess = true;
        // Show Loader
        if(that.params['showLoader']){
            that.loaderDelay = setTimeout(function(){
                if(that.components['loader'] && !that.components['loader'].isOpen){
                    that.components['loader'].open();
                }
            }, that.params['loaderDelay']);
        }
        that.triggerEvent('onSendStart');
    };

    that.callbacks.end = function(that, config){
        that.isProcess = false;
        // Hide Loader
        if(that.params['showLoader']){
            that.loaderDelay && clearTimeout(that.loaderDelay);
            if(that.components['loader'] && that.components['loader'].isOpen){
                that.components['loader'].close();
            }
        }
        that.triggerEvent('onSendEnd');
        that.triggerEvent('onProcessEnd', that.nodes['holder']['inner']);
    };

    that.callbacks.response = function(that, config, response){
        if(!cm.isEmpty(response)){
            response = that.callbacks.filter(that, config, response);
        }
        if(!cm.isEmpty(response)){
            that.callbacks.success(that, response);
        }else{
            that.callbacks.error(that, config);
        }
    };

    that.callbacks.error = function(that, config){
        that.callbacks.renderError(that, config);
        that.triggerEvent('onError');
    };

    that.callbacks.success = function(that, response){
        that.callbacks.render(that, response);
        that.triggerEvent('onSuccess', response);
    };

    that.callbacks.abort = function(that, config){
        that.triggerEvent('onAbort');
    };

    /* *** RENDER *** */

    that.callbacks.renderTemporary = function(that){
        return cm.node('div', {'class' : 'calendar__temporary'});
    };

    that.callbacks.render = function(that, data){
        var nodes, temporary;
        if(that.params['responseHTML']){
            that.isRendering = true;
            temporary = that.callbacks.renderTemporary(that);
            nodes = cm.strToHTML(data);
            cm.appendNodes(nodes, temporary);
            that.callbacks.append(that, temporary);
        }
    };

    that.callbacks.renderError = function(that, config){
        if(that.params['responseHTML']){
            that.isRendering = true;
            var temporary = that.callbacks.renderTemporary(that);
            temporary.appendChild(
                cm.node('div', {'class' : 'cm__empty'}, that.lang('server_error'))
            );
            that.callbacks.append(that, temporary);
        }
    };

    that.callbacks.append = function(that, temporary){
        var height;
        // Wrap old content
        if(!that.nodes['holder']['temporary']){
            that.nodes['holder']['temporary'] = that.callbacks.renderTemporary(that);
            cm.appendNodes(that.nodes['holder']['inner'].childNodes, that.nodes['holder']['temporary']);
            cm.appendChild(that.nodes['holder']['temporary'], that.nodes['holder']['inner']);
        }
        cm.removeClass(that.nodes['holder']['temporary'], 'is-show', true);
        // Append temporary
        cm.appendChild(temporary, that.nodes['holder']['inner']);
        cm.addClass(temporary, 'is-show', true);
        // Animate
        cm.removeClass(that.nodes['holder']['container'], 'is-loaded', true);
        cm.addClass(that.nodes['holder']['container'], 'is-show', true);
        height = temporary.offsetHeight;
        that.animations['response'].go({
            'style' : {'height' : [height, 'px'].join('')},
            'duration' : that.params['animateDuration'],
            'anim' : 'smooth',
            'onStop' : function(){
                that.nodes['holder']['container'].style.height = '';
                cm.remove(that.nodes['holder']['temporary']);
                cm.addClass(that.nodes['holder']['container'], 'is-loaded', true);
                that.nodes['holder']['temporary'] = temporary;
                that.isRendering = false;
            }
        });
    };

    /* ******* PUBLIC ******* */

    that.refresh = function(){
        setView(that.viewDetails);
        return that;
    };

    that.abort = function(){
        if(that.ajaxHandler && that.ajaxHandler.abort){
            that.ajaxHandler.abort();
        }
        return that;
    };

    that.setAction = function(o, mode, update){
        mode = cm.inArray(['raw', 'update', 'current'], mode)? mode : 'current';
        switch(mode){
            case 'raw':
                that.params['ajax'] = cm.merge(that._raw.params['ajax'], o);
                break;
            case 'current':
                that.params['ajax'] = cm.merge(that.params['ajax'], o);
                break;
            case 'update':
                that.params['ajax'] = cm.merge(that._update.params['ajax'], o);
                break;
        }
        if(update){
            that._update.params['ajax'] = cm.clone(that.params['ajax']);
        }
        return that;
    };

    init();
});

/* *** CALENDAR EVENT *** */

cm.define('Module.CalendarEvent', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'data' : {
            'title' : null,
            'date' : null,
            'description' : null
        },
        'Com.Tooltip' : {
            'delay' : 'cm._config.hideDelayLong',
            'className' : 'module__calendar-event-tooltip',
            'minWidth' : 250
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'template' : null
    };
    that.components = {};
    that.template = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var render = function(){
        // Render tooltip
        cm.getConstructor('Com.Tooltip', function(classConstructor, className){
            that.components['tooltip'] = new classConstructor(
                cm.merge(that.params[className],{
                    'target' : that.params['node']
                })
            );
        });
    };

    var renderContent = function(template){
        if(!cm.isEmpty(that.params['data']['title'])){
            template['title'].innerHTML = that.params['data']['title'];
        }
        if(!cm.isEmpty(that.params['data']['date'])){
            template['date'].innerHTML = that.params['data']['date'];
        }
        if(!cm.isEmpty(that.params['data']['description'])){
            template['description'].innerHTML = that.params['data']['description'];
        }else{
            cm.remove(template['description-container']);
        }
        if(!cm.isEmpty(that.params['data']['url'])){
            template['button'].setAttribute('href', that.params['data']['url']);
        }else{
            cm.remove(template['button-container']);
        }
    };

    /* ******* PUBLIC ******* */

    that.setTemplate = function(node){
        that.nodes['template'] = cm.getNodes(node);
        if(that.nodes['template']){
            renderContent(that.nodes['template']);
            that.components['tooltip'] && that.components['tooltip'].setContent(that.nodes['template']['container']);
        }
        return that;
    };

    that.setTooltipParams = function(o){
        that.params['Com.Tooltip'] = cm.merge(that.params['Com.Tooltip'], o);
        that.components['tooltip'] && that.components['tooltip'].setParams(that.params['Com.Tooltip']);
        return that;
    };

    init();
});

/* *** CALENDAR VIEW ABSTRACT *** */

cm.define('Module.AbstractCalendarView', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onRequestView'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'viewName' : '',
        'itemShortIndent' : 1,
        'itemShortHeight' : 24,
        'dayIndent' : 4,
        'Com.Tooltip' : {}
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div'),
        'buttons' : {
            'container' : cm.node('div'),
            'prev' : cm.node('div'),
            'next' : cm.node('div'),
            'search-button' : cm.node('div'),
            'search-input' : cm.node('input'),
            'views' : {
                'agenda' : cm.node('div'),
                'week' : cm.node('div'),
                'month' : cm.node('div')
            }
        },
        'templates' : {
            'event' : {}
        }
    };
    that.components = {};
    that.days = [];

    var init = function(){
        that.getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        that.renderToolbar();
        that.render();
        that.triggerEvent('onRender');
    };

    /* ******* PUBLIC ******* */

    init();
});

cm.getConstructor('Module.AbstractCalendarView', function(classConstructor, className, classProto){
    classProto.getLESSVariables = function(){
        var that = this;
        that.params['itemShortIndent'] = cm.getLESSVariable('ComCalendarEvent-Short-Indent', that.params['itemShortIndent'], true);
        that.params['itemShortHeight'] = cm.getLESSVariable('ComCalendarEvent-Short-Height', that.params['itemShortHeight'], true);
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        that.params['name'] = that.params['name'].toString();
        if(that.params['Com.Tooltip']['width'] !== 'auto'){
            that.params['Com.Tooltip']['width'] = cm.strReplace(that.params['Com.Tooltip']['width'], {
                '%itemShortIndent%' : that.params['itemShortIndent'],
                '%itemShortHeight%' : that.params['itemShortHeight'],
                '%dayIndent%' : that.params['dayIndent']
            });
        }
        that.params['Com.Tooltip']['top'] = cm.strReplace(that.params['Com.Tooltip']['top'], {
            '%itemShortIndent%' : that.params['itemShortIndent'],
            '%itemShortHeight%' : that.params['itemShortHeight'],
            '%dayIndent%' : that.params['dayIndent']
        });
        that.params['Com.Tooltip']['left'] = cm.strReplace(that.params['Com.Tooltip']['left'], {
            '%itemShortIndent%' : that.params['itemShortIndent'],
            '%itemShortHeight%' : that.params['itemShortHeight'],
            '%dayIndent%' : that.params['dayIndent']
        });
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Find events and set template and tooltip config
        new cm.Finder('Module.CalendarEvent', null, that.params['node'], function(classObject){
            // Clone template
            var template = cm.clone(that.nodes['templates']['event']['container'], true);
            // Set Node
            classObject
                .setTooltipParams(that.params['Com.Tooltip'])
                .setTemplate(template);
        }, {'multiple' : true});
        return that;
    };

    classProto.renderToolbar = function(){
        var that = this;
        // Toolbar Controls
        new cm.Finder('Com.Select', 'week', that.nodes['buttons']['container'], function(classObject){
            that.components['week'] = classObject
                .addEvent('onChange', that.updateView.bind(that));
        });
        new cm.Finder('Com.Select', 'month', that.nodes['buttons']['container'], function(classObject){
            that.components['month'] = classObject
                .addEvent('onChange',  that.updateView.bind(that));
        });
        new cm.Finder('Com.Select', 'year', that.nodes['buttons']['container'], function(classObject){
            that.components['year'] = classObject
                .addEvent('onChange', that.updateView.bind(that));
        });
        // Search
        cm.addEvent(that.nodes['buttons']['search-input'], 'keypress', function(e){
            if(e.keyCode == 13){
                cm.preventDefault(e);
                that.updateView();
            }
        });
        cm.addEvent(that.nodes['buttons']['search-button'], 'click', function(e){
            cm.preventDefault(e);
            that.updateView();
        });
        // View Buttons
        cm.forEach(that.nodes['buttons']['views'], function(node, key){
            if(key === that.params['viewName']){
                cm.replaceClass(node, 'button-secondary', 'button-primary');
            }else{
                cm.replaceClass(node, 'button-primary', 'button-secondary');
            }
            cm.addEvent(node, 'click', function(e){
                cm.preventDefault(e);
                that.requestView({
                    'view' : key
                });
            });
        });
        // Prev / Next Buttons
        cm.addEvent(that.nodes['buttons']['prev'], 'click', function(e){
            cm.preventDefault(e);
            that.prev();
        });
        cm.addEvent(that.nodes['buttons']['next'], 'click', function(e){
            cm.preventDefault(e);
            that.next();
        });
        return that;
    };

    classProto.searchQuery = function(str){
        var that = this;
        var data = that.getData();
        data.query = str;
        that.requestView(data);
        return that;
    };

    classProto.requestView = function(data){
        var that = this;
        that.triggerEvent('onRequestView', data);
        return that;
    };

    classProto.getData = function(){
        var that = this;
        return {
            'query' : that.nodes['buttons']['search-input'].value,
            'view' : that.params['viewName'],
            'year' : that.components['year'] ? that.components['year'].get() : null,
            'month' : that.components['month'] ? that.components['month'].get() : null,
            'week' : that.components['week'] ? that.components['week'].get() : null
        };
    };

    classProto.updateView = function(){
        var that = this;
        that.triggerEvent('onRequestView', that.getData());
        return that;
    };

    classProto.prev = function(){
        var that = this;
        var data = that.getData();
        if(data['week'] !== null){
            if(data['week'] == 1){
                data['year']--;
                data['week'] = cm.getWeeksInYear(data['year']);
            }else{
                data['week']--;
            }
        }else if(data['month'] !== null){
            if(data['month'] == 0){
                data['year']--;
                data['month'] = 11;
            }else{
                data['month']--;
            }
        }else{
            data['year']--;
        }
        that.requestView(data);
        return that;
    };

    classProto.next = function(){
        var that = this;
        var data = that.getData();
        if(data['week'] !== null){
            if(data['week'] == cm.getWeeksInYear(data['year'])){
                data['year']++;
                data['week'] = 1;
            }else{
                data['week']++;
            }
        }else if(data['month'] !== null){
            if(data['month'] == 11){
                data['year']++;
                data['month'] = 0;
            }else{
                data['month']++;
            }
        }else {
            data['year']++;
        }
        that.requestView(data);
        return that;
    };
});

/* *** CALENDAR MONTH VIEW *** */

cm.define('Module.CalendarMonth', {
    'extend' : 'Module.AbstractCalendarView',
    'params' : {
        'viewName' : 'month',
        'Com.Tooltip' : {
            'width' : '(targetWidth + %dayIndent%) * 2 - targetHeight * 2',
            'top' : 'targetHeight + %itemShortIndent%',
            'left' : '-(selfWidth - targetWidth) - targetHeight'
        }
    }
},
function(params){
    var that = this;
    Module.AbstractCalendarView.apply(that, arguments);
});

cm.getConstructor('Module.CalendarMonth', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.processDay = function(nodes){
        var that = this;
        var item = {
            'isShow' : false,
            'nodes' : nodes
        };
        // Show all events on more button click
        cm.addEvent(item.nodes['more-button'], 'click', function(){
            that.showMoreEvents(item);
        });
        // Prevent document scrolling while scroll all events block
        cm.addIsolateScrolling(item.nodes['more-holder']);
        // Push
        that.days.push(item);
    };

    classProto.showMoreEvents = function(item){
        var that = this;
        item.delay && clearTimeout(item.delay);
        if(!item.isShow){
            item.isShow = true;
            cm.setScrollTop(item.nodes['more-holder'], 0);
            cm.addClass(item.nodes['more-holder'], 'is-show');
        }
    };

    classProto.hideMoreEvents = function(item, isImmediately){
        var that = this;
        item.delay && clearTimeout(item.delay);
        if(item.isShow){
            if(isImmediately){
                item.isShow = false;
                cm.removeClass(item.nodes['more-holder'], 'is-show');
            }else{
                item.delay = setTimeout(function(){
                    item.isShow = false;
                    cm.removeClass(item.nodes['more-holder'], 'is-show');
                }, that.params['delay']);
            }
        }
    };

    classProto.getLESSVariables = function(){
        var that = this;
        _inherit.prototype.getLESSVariables.call(that);
        that.params['dayIndent'] = cm.getLESSVariable('ComCalendarMonth-Day-Indent', that.params['dayIndent'], true);
        return that;
    };

    classProto.render = function(){
        var that = this;
        _inherit.prototype.render.call(that);
        cm.forEach(that.nodes['days'], that.processDay.bind(that));
        return that;
    };
});

/* *** CALENDAR WEEK VIEW *** */

cm.define('Module.CalendarWeek', {
    'extend' : 'Module.AbstractCalendarView',
    'params' : {
        'viewName' : 'week',
        'Com.Tooltip' : {
            'width' : '(targetWidth + %dayIndent%) * 2 - targetHeight * 2',
            'top' : 'targetHeight + %itemShortIndent%',
            'left' : 'targetHeight'
        }
    }
},
function(params){
    var that = this;
    Module.AbstractCalendarView.apply(that, arguments);
});

cm.getConstructor('Module.CalendarWeek', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.getLESSVariables = function(){
        var that = this;
        _inherit.prototype.getLESSVariables.call(that);
        that.params['dayIndent'] = cm.getLESSVariable('ComCalendarWeek-Day-Indent', that.params['dayIndent'], true);
        return that;
    };
});

/* *** CALENDAR AGENDA VIEW *** */

cm.define('Module.CalendarAgenda', {
    'extend' : 'Module.AbstractCalendarView',
    'params' : {
        'viewName' : 'agenda',
        'Com.Tooltip' : {
            'width' : 'targetWidth - %itemShortHeight% * 2',
            'top' : 'targetHeight + %itemShortIndent%',
            'left' : 'targetHeight'
        }
    }
},
function(params){
    var that = this;
    Module.AbstractCalendarView.apply(that, arguments);
});
cm.define('Mod.ElementCaptcha', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'memorable' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementCheckbox', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'inputEvent' : 'change'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementCheckbox', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.validateValue = function(){
        var that = this;
        return that.get();
    };

    classProto.get = function(){
        var that = this;
        return that.nodes['input'].checked;
    };

    classProto.set = function(value){
        var that = this;
        that.nodes['input'].checked = value;
        return that;
    };
});
cm.define('Mod.ElementDatePicker', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.Datepicker',
        'pattern' : /^(0000-00-00)$/
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementFileUploader', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'App.FileInput',
        'memorable' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementMultiCheckbox', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'inputEvent' : 'change'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementMultiCheckbox', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.getMultiple = function(){
        var that = this,
            values = [];
        cm.forEach(that.nodes['inputs'], function(nodes){
            if(nodes['input'].checked){
                values.push(nodes['input'].value);
            }
        });
        return values;
    };

    classProto.setMultiple = function(values){
        var that = this;
        if(cm.isArray(values)){
            cm.forEach(that.nodes['inputs'], function(nodes){
                nodes['input'].checked = cm.inArray(values, nodes['input'].value);
            });
        }
    };
});
cm.define('Mod.ElementMultiField', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.MultiField',
        'memorable' : false,
        'demo' : false
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementMultiField', function(classConstructor, className, classProto, classInherit){
    classProto.onEnableEditing = function(){
        var that = this;
        cm.appendChild(that.nodes['content']['templateInner'], that.nodes['content']['templateContainer']);
        if(that.params['demo']){
            if(that.components['controller']){
                that.components['controller']
                    .clear();
            }
        }
    };

    classProto.onDisableEditing = function(){
        var that = this;
        cm.remove(that.nodes['content']['templateInner']);
        if(that.params['demo']){
            if(that.components['controller']){
                that.components['controller']
                    .clear()
                    .setTemplate(that.nodes['content']['templateInner']);
            }
        }
    };
});
cm.define('Mod.ElementPassword', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementRadioButton', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'inputEvent' : 'change'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementRadioButton', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.getMultiple = function(){
        var that = this,
            value = '';
        cm.forEach(that.nodes['inputs'], function(nodes){
            if(nodes['input'].checked){
                value = nodes['input'].value;
            }
        });
        return value;
    };

    classProto.setMultiple = function(value){
        var that = this;
        cm.forEach(that.nodes['inputs'], function(nodes){
            nodes['input'].checked = nodes['input'].value == value;
        });
    };
});
cm.define('Mod.ElementSelect', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.Select'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementText', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementTextArea', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementTimePicker', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'targetController' : 'Com.TimeSelect',
        'pattern' : /^(00-00-00)$/
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.ElementWizard', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onTabShow',
        'onTabHide',
        'onTabChange'
    ],
    'params' : {
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay',
        'active' : null,
        'Com.TabsetHelper' : {
            'targetEvent' : 'none'
        },
        'Com.AbstractInput' : {
            'className' : 'tabs__input'
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Mod.ElementWizard', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.tabs = {};
        that.tabsCount = 0;
        that.options = [];
        that.isProcessing = false;
        that.changeInterval = null;
        that.currentTab = null;
        // Bind
        that.prevTabHandler = that.prevTab.bind(that);
        that.nextTabHandler = that.nextTab.bind(that);
        that.doneTabHandler = that.doneTab.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        if(that.currentTab === null){
            if(that.params['active'] && that.tabs[that.params['active']]){
                that.setTab(that.params['active']);
            }else{
                that.setTabByIndex(0);
            }
        }
    };

    classProto.onValidateParams = function(){
        var that = this;
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = that.params['name'];
        that.params['Com.AbstractInput']['container'] = that.nodes['container'];
        that.params['Com.AbstractInput']['name'] = that.params['name'];
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Process Tabset
        that.processTabset();
        that.processTabs();
        that.processMenu();
        // Buttons
        that.processButtons();
        that.processInput();
    };

    classProto.processTabset = function(){
        var that = this;
        cm.getConstructor('Com.TabsetHelper', function(classConstructor, className){
            that.components['tabset'] = new classConstructor(that.params[className])
                .addEvent('onTabHide', function(tabset, item){
                    that.triggerEvent('onTabHide', item);
                })
                .addEvent('onTabShowStart', function(tabset, item){
                    if(!that.isProcessing){
                        that.nodes['content-list'].style.overflow = 'hidden';
                        that.nodes['content-list'].style.height = that.nodes['content-list'].offsetHeight + 'px';
                    }
                    that.isProcessing = true;
                    that.changeInterval && clearTimeout(that.changeInterval);
                    that.changeInterval = setTimeout(function(){
                        that.isProcessing = false;
                        that.nodes['content-list'].style.height = 'auto';
                        that.nodes['content-list'].style.overflow = 'visible';
                    }, that.params['duration']);
                })
                .addEvent('onTabShow', function(tabset, item){
                    that.currentTab = item;
                    that.nodes['content-list'].style.height = item['tab']['container'].offsetHeight + 'px';
                    that.setMenu();
                    that.setButtons();
                    that.setInput();
                    that.triggerEvent('onTabShow', item);
                    that.triggerEvent('onTabChange', item);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels']);
        });
    };

    classProto.processTabs = function(){
        var that = this;
        that.tabs = that.components['tabset'].getTabs();
        that.tabsCount = that.components['tabset'].getTabsCount();
        cm.forEach(that.tabs, function(item){
            cm.addEvent(item['label']['container'], 'click', function(){
                if(that.validateTab() && that.currentTab['id'] !== item['id']){
                    that.setTab(item['id']);
                }
            });
        });
    };

    classProto.processMenu = function(){
        var that = this;
        cm.forEach(that.nodes['options'], function(nodes){
            var item = cm.merge({
                'id' : '',
                'nodes' : nodes
            }, that.getNodeDataConfig(nodes['container']));
            // Click Events
            cm.addEvent(nodes['container'], 'click', function(){
                if(that.validateTab() && that.currentTab['id'] !== item['id']){
                    that.setTab(item['id']);
                }
            });
            // Push
            that.options.push(item);
        });
    };

    classProto.setMenu = function(){
        var that = this;
        that.nodes['menu-label'].innerHTML = that.currentTab['title'];
    };

    classProto.processButtons = function(){
        var that = this;
        cm.addEvent(that.nodes['buttonPrev'], 'click', that.prevTabHandler);
        cm.addEvent(that.nodes['buttonNext'], 'click', that.nextTabHandler);
        cm.addEvent(that.nodes['buttonDone'], 'click', that.doneTabHandler);
    };

    classProto.setButtons = function(){
        var that = this,
            index = that.currentTab['index'];
        if(index === 0){
            cm.addClass(that.nodes['buttonPrev'], 'is-hidden');
            cm.removeClass(that.nodes['buttonNext'], 'is-hidden');
            cm.addClass(that.nodes['buttonDone'], 'is-hidden');
        }
        if(index > 0 && index < that.tabsCount - 1){
            cm.removeClass(that.nodes['buttonPrev'], 'is-hidden');
            cm.removeClass(that.nodes['buttonNext'], 'is-hidden');
            cm.addClass(that.nodes['buttonDone'], 'is-hidden');
        }
        if(index === that.tabsCount - 1){
            cm.removeClass(that.nodes['buttonPrev'], 'is-hidden');
            cm.addClass(that.nodes['buttonNext'], 'is-hidden');
            cm.removeClass(that.nodes['buttonDone'], 'is-hidden');
        }
    };

    classProto.processInput = function(){
        var that = this;
        cm.getConstructor('Com.AbstractInput', function(classConstructor, className){
            that.components['input'] = new classConstructor(that.params[className]);
        });
    };

    classProto.setInput = function(){
        var that = this;
        that.currentTab && that.components['input'] && that.components['input'].set(that.currentTab['id']);
    };

    /*** TABS ***/

    classProto.validateTab = function(){
        var that = this,
            isValid = true;
        if(!that.isEditing){
            cm.find('App.AbstractModuleElement', null, that.currentTab['tab']['inner'], function(classObject){
                if(cm.isFunction(classObject.validate)){
                    if(!classObject.validate()){
                        isValid = false;
                    }
                }
            }, {'childs' : true});
        }
        return isValid;
    };

    classProto.prevTab = function(e){
        var that = this;
        cm.preventDefault(e);
        if(that.validateTab() && that.currentTab['index'] > 0){
            var index = that.currentTab['index'] - 1;
            that.setTabByIndex(index);
        }
    };

    classProto.nextTab = function(e){
        var that = this;
        cm.preventDefault(e);
        if(that.validateTab() && that.currentTab['index'] < that.tabsCount - 1){
            var index = that.currentTab['index'] + 1;
            that.setTabByIndex(index);
        }
    };

    classProto.doneTab = function(e){
        var that = this;
        if(!that.validateTab()){
            cm.preventDefault(e);
        }
    };

    classProto.setTab = function(id){
        var that = this;
        that.components['tabset'].set(id);
    };

    classProto.setTabByIndex = function(index){
        var that = this;
        that.components['tabset'].setByIndex(index);
    };

    classProto.getCurrentTab = function(){
        var that = this;
        return that.currentTab;
    };
});
cm.define('Mod.ElementWysiwyg', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});
cm.define('Mod.Form', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onSubmit',
        'onReset'
    ],
    'params' : {
        'remember' : false,
        'local' : false,
        'unload' : false,
        'action' : null,
        'ajax' : {
            'method' : 'POST',
            'async' : false,
            'beacon' : true,
            'local' : false
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Mod.Form', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.isAjax = false;
        that.isUnload = false;
        that.items = {};
        that.values = {};
        that.nodes = {
            'form' : cm.node('form')
        };
        // Binds
        that.processItemHandler = that.processItem.bind(that);
        that.processWizardHandler = that.processWizard.bind(that);
        that.unloadEventHanlder = that.unloadEvent.bind(that);
        that.submitEventHandler = that.submitEvent.bind(that);
        that.resetEventHandler = that.resetEvent.bind(that);
        that.keypressEventHandler = that.keypressEvent.bind(that);
    };

    classProto.onDestruct = function(){
        var that = this;
        that.components['finder'] && that.components['finder'].remove();
        that.components['finderWizard'] && that.components['finderWizard'].remove();
        that.isUnload && cm.removeEvent(window, 'unload', that.unloadEventHanlder);
    };

    classProto.onValidateParams = function(){
        var that = this;
        // If URL parameter exists, use ajax data
        if(!cm.isEmpty(that.params['ajax']['url'])){
            that.isAjax = true;
        }
        that.isUnload = that.params['unload'] && that.isAjax;
        // Get form action
        that.params['action'] = that.nodes['form'].getAttribute('action') || that.params['action'];
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Init form saving
        if(that.params['remember']){
            // Page unload event
            that.isUnload && cm.addEvent(window, 'unload', that.unloadEventHanlder);
            // Local saving
            if(that.params['local']){
                that.values = that.storageRead('items') || {};
                that.components['finder'] = new cm.Finder('App.AbstractModuleElement', null, that.nodes['container'], that.processItemHandler, {
                    'multiple' : true,
                    'childs' : true
                });
                that.components['finderWizard'] = new cm.Finder('Mod.ElementWizard', null, that.nodes['container'], that.processWizardHandler, {
                    'multiple' : true
                });
            }
        }
        // Form events
        cm.addEvent(that.nodes['form'], 'keypress', that.keypressEventHandler);
        cm.addEvent(that.nodes['form'], 'submit', that.submitEventHandler);
        cm.addEvent(that.nodes['form'], 'reset', that.resetEventHandler);
        return that;
    };

    classProto.processItem = function(classObject){
        var that = this;
        if(classObject.getParams('memorable')){
            var item = {
                'controller' : classObject,
                'name' : classObject.getParams('name'),
                'value' : null
            };
            // Merge
            if(that.values[item['name']]){
                item['value'] = that.values[item['name']];
            }
            // Set value
            item['controller'].set(item['value']);
            // Events
            item['controller'].addEvent('onChange', function(my, data){
                item['value'] = item['controller'].get();
                that.values[item['name']] = item['value'];
                that.processSave();
            });
            item['controller'].addEvent('onDestruct', function(my){
                delete that.values[item['name']];
                delete that.items[item['name']];
                that.processSave();
            });
            // Push
            that.values[item['name']] = item['value'];
            that.items[item['name']] = item;
        }
    };

    classProto.processWizard = function(classObject){
        var that = this;
        var item = {
            'controller' : classObject,
            'name' : classObject.getParams('name'),
            'value' : null
        };
        // Merge
        if(that.values[item['name']]){
            item['value'] = that.values[item['name']];
        }
        // Set value
        item['controller'].setTab(item['value']);
        // Events
        item['controller'].addEvent('onTabChange', function(){
            item['tab'] = item['controller'].getCurrentTab();
            item['value'] = item['tab']['id'];
            that.values[item['name']] = item['value'];
            that.processSave();
        });
        item['controller'].addEvent('onDestruct', function(){
            delete that.values[item['name']];
            delete that.items[item['name']];
            that.processSave();
        });
        // Push
        that.values[item['name']] = item['value'];
        that.items[item['name']] = item;
    };

    classProto.processSave = function(){
        var that = this;
        that.storageWrite('items', that.values);
    };

    /*** EVENTS ***/

    classProto.unloadEvent = function(){
        var that = this,
            data;
        // Get Data
        if(that.params['local']){
            data = that.values
        }else{
            data = cm.getFDO(that.nodes['container']);
        }
        // Send
        that.components['ajax'] = cm.ajax(
            cm.merge(that.params['ajax'], {
                'params' : data
            })
        );
    };

    classProto.keypressEvent = function(e){
        var that = this;
        if(cm.isFormInputFocused() && cm.isKey(e, 'enter')){
            cm.preventDefault(e);
        }
    };

    classProto.submitEvent = function(e){
        var that = this,
            data;
        cm.preventDefault(e);
        // Submit
        data = new FormData(that.nodes['form']);
        that.triggerEvent('onSubmit', {
            'form' : that.nodes['form'],
            'data' : data,
            'action' : that.params['action']
        });
        that.clear();
    };

    classProto.resetEvent = function(e){
        var that = this;
        var data = new FormData(that.nodes['form']);
        cm.preventDefault(e);
        that.triggerEvent('onReset', {
            'form' : that.nodes['form'],
            'data' : data,
            'action' : that.params['action']
        });
        that.clear();
    };

    /******* PUBLIC *******/

    classProto.clear = function(){
        var that = this;
        that.storageClear('items');
        return that;
    };
});
cm.define('Module.LogoCarousel', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'duration' : 1000,          // ms per slide
        'delay' : 2000,             // ms
        'columns' : 0,
        'mobileColumns' : 1,
        'stopOnHover' : true
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.LogoCarousel', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Variables
        that.items = {};
        that.itemsLength = 0;
        that.isInfinite = false;
        that.isAnimate = true;
        that.isProccess = false;
        that.moveInterval = null;
        that.current = null;
        that.columns = 0;
        // Bind context to methods
        that.onValidateParamsProcessHandler = that.onValidateParamsProcess.bind(that);
        that.onDestructProcessHandler = that.onDestructProcess.bind(that);
        that.onRedrawHandler = that.onRedraw.bind(that);
        that.startHandler = that.start.bind(that);
        that.stopHandler = that.stop.bind(that);
        that.mouseOverEventHandler = that.mouseOverEvent.bind(that);
        that.mouseOutEventHandler = that.mouseOutEvent.bind(that);
        that.moveProcessHandler = that.moveProcess.bind(that);
        // Add events
        that.addEvent('onValidateParamsProcess', that.onValidateParamsProcessHandler);
        that.addEvent('onDestructProcess', that.onDestructProcessHandler);
        that.addEvent('onRedraw', that.onRedrawHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.onValidateParamsProcess = function(){
        var that = this;
        that.isInfinite = !that.params['delay'];
        that.delay = that.params['duration'] + that.params['delay'];
        that.isAnimate = !(!that.params['duration'] && !that.params['duration']);
        return that;
    };

    classProto.onDestructProcess = function(){
        var that = this;
        that.stop();
        that.moveInterval && clearTimeout(that.moveInterval);
        return that;
    };

    classProto.onRedraw = function(){
        var that = this,
            desktopCol = ['col', that.params['columns']].join('-'),
            mobileCol = ['col', that.params['mobileColumns']].join('-');
        if(cm._deviceType == 'mobile'){
            that.columns = that.params['mobileColumns'];
            cm.replaceClass(that.nodes['grid'], desktopCol, mobileCol);
        }else{
            that.columns = that.params['columns'];
            cm.replaceClass(that.nodes['grid'], mobileCol, desktopCol);
        }
        that.restart();
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.render.apply(that, arguments);
        // Start
        that.redraw();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Items
        that.items = cm.clone(that.nodes['items']);
        that.itemsLength = that.items.length;
        // Set animation
        that.isInfinite && cm.addClass(that.nodes['container'], 'is-infinite');
        that.components['animation'] = new cm.Animation(that.nodes['itemsContainer']);
        // Set hover event
        cm.addEvent(that.nodes['container'], 'mouseover', that.mouseOverEventHandler);
        cm.addEvent(that.nodes['container'], 'mouseout', that.mouseOutEventHandler);
        return that;
    };

    classProto.restart = function(){
        var that = this;
        that.stop();
        that.restore();
        that.move();
        return that;
    };

    classProto.start = function(){
        var that = this;
        if(!that.isProccess){
            that.isProccess = true;
        }
        return that;
    };

    classProto.stop = function(){
        var that = this;
        if(that.isProccess){
            that.isProccess = false;
        }
        return that;
    };

    classProto.move = function(){
        var that = this;
        that.isProccess = true;
        that.moveProcess();
        that.moveRepeater();
        return that;
    };

    classProto.moveRepeater = function(){
        var that = this;
        that.moveInterval && clearTimeout(that.moveInterval);
        that.moveInterval = setTimeout(function(){
            that.moveProcess();
            that.moveRepeater();
        }, that.delay);
        return that;
    };

    classProto.moveProcess = function(){
        var that = this;
        if(that.isAnimate && that.isProccess && that.itemsLength > that.columns){
            // Remove previous slide
            that.restore();
            // Get current
            that.current = that.items.shift();
            that.items.push(that.current);
            // Move
            that.components['animation'].go({
                'style' : {'left' : (-that.current['container'].offsetWidth + 'px')},
                'duration' : that.params['duration'],
                'anim' : that.isInfinite ? 'linear' : 'smooth'
            });
        }
        return that;
    };

    classProto.restore = function(){
        var that = this;
        if(that.current){
            cm.addClass(that.nodes['container'], 'is-immediately', true);
            that.nodes['itemsContainer'].style.left = '0px';
            cm.insertLast(that.current['container'], that.nodes['itemsContainer']);
            cm.removeClass(that.nodes['container'], 'is-immediately', true);
        }
        return that;
    };

    classProto.mouseOverEvent = function(e){
        var that = this;
        that.params['stopOnHover'] && that.stop();
        return that;
    };

    classProto.mouseOutEvent = function(e){
        var that = this,
            target = cm.getRelatedTarget(e);
        if(!cm.isParent(that.nodes['container'], target, true)){
            that.params['stopOnHover'] && that.start();
        }
        return that;
    };
});
cm.define('Module.Menu', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'view' : 'horizontal',                      // horizontal | vertical
        'submenu' : 'visible',                      // visible | dropdown | specific | collapsible
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.Menu', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Variables
        that.nodes = {
            'select' : {
                'select' : cm.node('select')
            }
        };
        that.alignValues = ['left', 'center', 'right', 'justify'];
        that.submeniViewValues = ['visible', 'dropdown', 'specific', 'collapsible'];
        // Bind context to methods
        that.processSelectHandler = that.processSelect.bind(that);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Events
        cm.addEvent(that.nodes['select']['select'], 'change', that.processSelectHandler);
        // Submenu
        that.processSubMenu(that.nodes['menu']['items']);
        return that;
    };

    classProto.processSubMenu = function(items){
        var that = this;
        cm.forEach(items, function(item){
            if(item['sub']){
                that.processSubMenuItem(item);
                that.processSubMenu(item['sub']['items']);
            }
        });
        return that;
    };

    classProto.processSubMenuItem = function(item){
        var that = this;
        // Init animation
        item['sub']['_animate'] = new cm.Animation(item['sub']['container']);
        item['sub']['_visible'] = cm.isClass(item['container'], 'active');
        // Set events
        if(!item['sub']['_visible']){
            cm.addEvent(item['container'], 'mouseover', function(e){
                if(that.params['view'] === 'vertical' && that.params['submenu'] === 'collapsible'){
                    that.showSubMenuItemCollapsible(e, item);
                }
            });
            cm.addEvent(item['container'], 'mouseout', function(e){
                if(that.params['view'] === 'vertical' && that.params['submenu'] === 'collapsible'){
                    that.hideSubMenuItemCollapsible(e, item);
                }
            });
        }
        return that;
    };

    classProto.showSubMenuItemCollapsible = function(e, item){
        var that = this,
            originalHeight,
            height;
        item['sub']['_delay'] && clearTimeout(item['sub']['_delay']);
        item['sub']['_delay'] = setTimeout(function(){
            if(!item['sub']['_show']){
                item['sub']['_show'] = true;
                // Calculate real height
                originalHeight = item['sub']['container'].offsetHeight;
                item['sub']['container'].style.height = 'auto';
                height = item['sub']['container'].offsetHeight;
                item['sub']['container'].style.height = originalHeight + 'px';
                // Animate
                item['sub']['_animate'].go({
                    'style' : {'height' : (height + 'px')},
                    'duration' : that.params['duration'],
                    'anim' : 'smooth',
                    'onStop' : function(){
                        item['sub']['container'].style.height = 'auto';
                    }
                });
            }
        }, that.params['delay']);
        return that;
    };

    classProto.hideSubMenuItemCollapsible = function(e, item){
        var that = this,
            target = cm.getRelatedTarget(e);
        if(!cm.isParent(item['container'], target, true)){
            item['sub']['_delay'] && clearTimeout(item['sub']['_delay']);
            item['sub']['_delay'] = setTimeout(function(){
                if(item['sub']['_show']){
                    item['sub']['_show'] = false;
                    // Animate
                    item['sub']['_animate'].go({
                        'style' : {'height' : ('0px')},
                        'duration' : that.params['duration'],
                        'anim' : 'smooth',
                        'onStop' : function(){
                            item['sub']['container'].style.height = '';
                        }
                    });
                }
            }, that.params['delay']);
        }
        return that;
    };

    classProto.processSelect = function(){
        var that = this;
        var value = that.nodes['select']['select'].value;
        if(!cm.isEmpty(value)){
            window.location.href = value;
        }
        return that;
    };

    classProto.setView = function(view){
        var that = this;
        that.params['view'] = view;
        switch(view){
            case 'horizontal':
                cm.removeClass(that.nodes['container'], 'is-vertical mod__menu--adaptive');
                cm.addClass(that.nodes['container'], 'is-horizontal');
                that.setSubmenuView('dropdown');
            break;
            case 'vertical':
                cm.removeClass(that.nodes['container'], 'is-horizontal mod__menu--adaptive');
                cm.addClass(that.nodes['container'], 'is-vertical');
                that.setSubmenuView('visible');
                break;
            case 'mobile':
                cm.addClass(that.nodes['container'], 'mod__menu--adaptive');
                break;
        }
        return that;
    };

    classProto.setAlign = function(align){
        var that = this;
        if(cm.inArray(that.alignValues, align)){
            // Reset
            cm.forEach(that.alignValues, function(item){
                cm.removeClass(that.nodes['container'], ['pull', item].join('-'));
            });
            // Set
            cm.addClass(that.nodes['container'], ['pull', align].join('-'));
        }
        return that;
    };

    classProto.setSubmenuView = function(view){
        var that = this;
        if(cm.inArray(that.submeniViewValues, view)){
            // Reset
            cm.forEach(that.submeniViewValues, function(item){
                cm.removeClass(that.nodes['container'], ['is', item].join('-'));
            });
            // Set
            that.params['submenu'] = view;
            cm.addClass(that.nodes['container'], ['is', view].join('-'));
        }
        return that;
    };
});
/* ******* MODULES: MENU ******* */

cm.define('App.ModuleMenu', {
    'modules' : [
        'Params',
        'DataNodes'
    ],
    'params' : {
        'node' : cm.node('div')
    }
},
function(params){
    var that = this;

    that.nodes = {
        'select' : cm.node('select')
    };

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        render();
    };

    var render = function(){
        cm.addEvent(that.nodes['select'], 'change', toggle);
    };

    var toggle = function(){
        var value = that.nodes['select'].value;
        if(!cm.isEmpty(value)){
            window.location.href = value;
        }
    };

    /* *** MAIN *** */

    init();
});
cm.define('App.ModuleRolloverTabs', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onTabShow',
        'onTabHide',
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'event' : 'hover',                          // hover | click
        'stay' : false,
        'showEmptyTab' : false,
        'duration' : 'cm._config.animDuration',
        'delay' : 'cm._config.hideDelay',
        'width' : 'auto',
        'attachment' : 'container',                 // container | screen
        'expand' : 'bottom',                        // top | bottom
        'active' : false,
        'isEditing' : false,
        'customEvents' : true,
        'Com.TabsetHelper' : {}
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div'),
        'inner' : cm.node('div'),
        'menu-label' : cm.node('div'),
        'labels' : [],
        'options' : [],
        'tabs' : []
    };
    that.components = {};
    that.tabs = [];
    that.options = [];

    that.isEditing = null;
    that.isProcessing = false;
    that.hideInterval = null;
    that.changeInterval = null;
    that.resizeInterval = null;
    that.currentPosition = null;
    that.previousPosition = null;
    that.isMenuShow = false;

    var init = function(){
        getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var getLESSVariables = function(){
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppMod-RolloverTabs-Duration', that.params['duration']);
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
        that.params['Com.TabsetHelper']['targetEvent'] = that.params['event'];
    };

    var render = function(){
        // Classes
        cm.addClass(that.nodes['container'], ['attachment', that.params['attachment']].join('-'));
        cm.addClass(that.nodes['container'], ['expand', that.params['expand']].join('-'));
        // Process Tabset
        cm.getConstructor('Com.TabsetHelper', function(classConstructor, className){
            that.components['tabset'] = new classConstructor(that.params[className])
                .addEvent('onTabHide', function(tabset, item){
                    that.triggerEvent('onTabHide', item);
                })
                .addEvent('onTabShowStart', function(tabset, item){
                    // If not in editing and tab does not contains any blocks, do not show it
                    if(!that.params['showEmptyTab'] && !that.isEditing && that.components['tabset'].isTabEmpty(item['id'])){
                        hide(item);
                    }else{
                        show(item);
                    }
                    // Container
                    if(!that.isProcessing){
                        that.nodes['content-list'].style.overflow = 'hidden';
                        that.nodes['content-list'].style.height = that.nodes['content-list'].offsetHeight + 'px';
                    }
                    that.isProcessing = true;
                    that.changeInterval && clearTimeout(that.changeInterval);
                    that.changeInterval = setTimeout(function(){
                        that.isProcessing = false;
                        that.nodes['content-list'].style.height = 'auto';
                        that.nodes['content-list'].style.overflow = 'visible';
                    }, that.params['duration']);
                })
                .addEvent('onTabShow', function(tabset, item){
                    that.nodes['content-list'].style.height = item['tab']['container'].offsetHeight + 'px';
                    that.nodes['menu-label'].innerHTML = item['title'];
                    that.triggerEvent('onTabShow', item);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels']);
        });
        // Tabs
        processTabs();
        // Mobile menu
        processMenu();
        // Set target events
        setTargetEvents();
        // Add custom event
        if(that.params['customEvents']){
            cm.customEvent.add(that.params['node'], 'destruct', function(){
                that.destruct();
            });
            cm.customEvent.add(that.params['node'], 'redraw', function(){
                that.redraw();
            });
            cm.customEvent.add(that.params['node'], 'enableEditable', function(){
                that.enableEditing();
            });
            cm.customEvent.add(that.params['node'], 'disableEditable', function(){
                that.disableEditing();
            });
        }
        // Set
        if(that.params['active']){
            that.components['tabset'].set(that.params['active']);
        }
        // Editing
        that.params['isEditing'] && that.enableEditing();
    };

    var processTabs = function(){
        that.tabs = that.components['tabset'].getTabs();
        cm.forEach(that.tabs, function(item){
            cm.addEvent(item['label']['link'], 'click', function(e){
                if(
                    that.isEditing
                    || (that.params['event'] === 'click' && that.components['tabset'].get() !== item['id'])
                ){
                    cm.preventDefault(e);
                }
            });
        });
    };

    /* *** MOBILE MENU ***/

    var processMenu = function(){
        // Button
        cm.addEvent(that.nodes['menu-icon'], 'click', toggleMenu);
        // Items
        cm.forEach(that.nodes['options'], processMenuItem);
    };

    var processMenuItem = function(nodes){
        var item = cm.merge({
                'id' : '',
                'nodes' : nodes
            }, that.getNodeDataConfig(nodes['container']));
        cm.addEvent(nodes['container'], 'click', function(e){
            if(that.components['tabset'].get() !== item['id']){
                cm.preventDefault(e);
                that.components['tabset'].set(item['id']);
                hideMenu();
                show();
            }
        });
        that.options.push(item);
    };

    var toggleMenu = function(){
        if(that.isMenuShow){
            hideMenu();
        }else{
            showMenu();
        }
    };

    var hideMenu = function(){
        that.isMenuShow = false;
        cm.removeClass(that.nodes['menu-inner'], 'active');
    };

    var showMenu = function(){
        that.isMenuShow = true;
        cm.addClass(that.nodes['menu-inner'], 'active');
    };

    /*** EVENTS ***/

    var setTargetEvents = function(){
        if(that.params['event'] === 'hover'){
            cm.addEvent(that.nodes['container'], 'mouseover', mouseOverEvent);
        }
        if(!that.params['stay']){
            cm.addEvent(that.nodes['container'], 'mouseout', mouseOutEvent);
            cm.addEvent(window, 'click', clickOutEvent);
        }
    };

    var removeTargetEvents = function(){
        if(that.params['event'] === 'hover'){
            cm.removeEvent(that.nodes['container'], 'mouseover', mouseOverEvent);
        }
        if(!that.params['stay']){
            cm.removeEvent(that.nodes['container'], 'mouseout', mouseOutEvent);
            cm.removeEvent(window, 'click', clickOutEvent);
        }
    };

    var hide = function(){
        that.hideInterval && clearTimeout(that.hideInterval);
        that.hideInterval = setTimeout(function(){
            that.resizeInterval && clearInterval(that.resizeInterval);
            cm.removeClass(that.nodes['content'], 'is-show');
            that.nodes['menu-label'].innerHTML = '';
            that.components['tabset'].unsetHead();
            that.hideInterval = setTimeout(function(){
                that.components['tabset'].unset();
            }, that.params['delay']);
        }, that.params['delay']);
    };

    var show = function(item){
        item = that.components['tabset'].getCurrentTab() || item;
        if(item && (that.params['showEmptyTab'] || that.isEditing || !that.components['tabset'].isTabEmpty(item['id']))){
            // Set position
            that.redraw();
            // Show
            that.hideInterval && clearTimeout(that.hideInterval);
            cm.addClass(that.nodes['content'], 'is-show', true);
        }
    };

    var mouseOverEvent = function(){
        show();
    };

    var mouseOutEvent = function(e){
        var target = cm.getRelatedTarget(e);
        if(!cm.isParent(that.nodes['container'], target, true)){
            !that.isEditing && hide();
        }else{
            show();
        }
    };

    var clickOutEvent = function(e){
        var target = cm.getEventTarget(e);
        if(!cm.isParent(that.nodes['container'], target, true)){
            hideMenu();
            !that.isEditing && hide();
        }else{
            show();
        }
    };

    var contentResizeHandler = function(){
        that.previousPosition = cm.clone(that.currentPosition);
        that.currentPosition = cm.getRect(that.nodes['container']);
        // Variables
        var isSameTop = that.previousPosition && that.previousPosition['top'] === that.currentPosition['top'];
        var isSameBottom = that.previousPosition && that.previousPosition['bottom'] === that.currentPosition['bottom'];
        var isSameWidth = that.previousPosition && that.previousPosition['width'] === that.currentPosition['width'];
        // Set Content Min Width
        if(!isSameWidth){
            switch(that.params['attachment']){
                case 'screen':
                    that.nodes['content'].style.minWidth = Math.min(that.params['width'], that.currentPosition['width']) + 'px';
                    break;
                case 'container':
                    that.nodes['content'].style.minWidth = that.currentPosition['width'] + 'px';
                    break;
            }
        }
        // Set Content Position
        if(!isSameTop || !isSameBottom){
            var pageSize = cm.getPageSize();
            switch(that.params['expand']) {
                case 'top':
                    that.nodes['content'].style.top = 'auto';
                    that.nodes['content'].style.bottom = pageSize['winHeight'] - that.currentPosition['top'] + 'px';
                    break;
                case 'bottom':
                    that.nodes['content'].style.top = that.currentPosition['bottom'] + 'px';
                    that.nodes['content'].style.bottom = 'auto';
                    break;
            }
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            cm.replaceClass(that.params['node'], 'is-not-editing', 'is-editing is-editable');
            that.components['tabset'].setByIndex(0);
            show();
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.replaceClass(that.params['node'], 'is-editing is-editable', 'is-not-editing');
            hide();
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    that.destruct = function(){
        if(!that.isDestructed){
            that.isDestructed = true;
            removeTargetEvents();
            that.removeFromStack();
            cm.remove(that.nodes['container']);
        }
        return that;
    };

    that.redraw = function(){
        that.resizeInterval && clearInterval(that.resizeInterval);
        switch(that.params['attachment']) {
            case 'screen':
                if(that.isEditing){
                    that.previousPosition = null;
                    that.currentPosition = null;
                    that.nodes['content'].style.maxWidth = '';
                    that.nodes['content'].style.minWidth = '';
                    that.nodes['content'].style.top = '';
                    that.nodes['content'].style.bottom = '';
                }else{
                    that.previousPosition = null;
                    that.currentPosition = null;
                    that.nodes['content'].style.maxWidth = that.params['width'];
                    contentResizeHandler();
                    that.resizeInterval = setInterval(contentResizeHandler, 5);
                }
                break;
        }
        return that;
    };

    init();
});
cm.define('Module.WorkingArea', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'enableEditing',
        'disableEditing',
        'enableEditable',
        'disableEditable'
    ],
    'params' : {
        'node' : cm.node('div'),
        'name' : '',
        'isEditing' : false,
        'customEvents' : true,
        'href' : '',
        'target' : '_self'
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div')
    };
    that.components = {};

    that.isEditing = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        if(cm.isNode(that.params['node'])){
            that.params['href'] = that.params['node'].getAttribute('href') || that.params['href'];
            that.params['target'] = that.params['node'].getAttribute('target') || that.params['target'];
        }
    };

    var render = function(){
        // Set State
        defaultState();
        // Add custom event
        if(that.params['customEvents']){
            cm.customEvent.add(that.params['node'], 'enableEditable', function(){
                that.enableEditing();
            });
            cm.customEvent.add(that.params['node'], 'disableEditable', function(){
                that.disableEditing();
            });
        }
        // Editing
        that.params['isEditing'] && that.enableEditing();
    };

    var editState = function(){
        cm.addClass(that.nodes['container'], 'is-editing is-editable');
        if(!cm.isEmpty(that.params['href'])){
            cm.removeClass(that.nodes['container'], 'is-link');
            cm.removeEvent(that.nodes['container'], 'click', linkAction);
        }
    };

    var defaultState = function(){
        cm.removeClass(that.nodes['container'], 'is-editing is-editable');
        if(!cm.isEmpty(that.params['href'])){
            cm.addClass(that.nodes['container'], 'is-link');
            cm.addEvent(that.nodes['container'], 'click', linkAction);
        }
    };

    var linkAction = function(e){
        var target = cm.getEventTarget(e);
        if((target.tagName && target.tagName.toLowerCase() !== 'a') || cm.isEmpty(target.getAttribute('href'))){
            cm.preventDefault(e);
            switch(that.params['target']){
                case '_blank':
                    window.open(that.params['href'],'_blank');
                    break;
                default:
                    window.location.href = that.params['href'];
                    break;
            }
        }
    };

    /* ******* PUBLIC ******* */

    that.enableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || !that.isEditing){
            that.isEditing = true;
            editState();
            that.triggerEvent('enableEditing');
            that.triggerEvent('enableEditable');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            defaultState();
            that.triggerEvent('disableEditing');
            that.triggerEvent('disableEditable');
        }
        return that;
    };

    init();
});