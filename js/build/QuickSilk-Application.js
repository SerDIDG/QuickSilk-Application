var App = {
    'Elements': {},
    'Nodes' : {}
};
App['Anchor'] = function(o){
    var that = this,
        config = cm.merge({
            'link' : cm.Node('a'),
            'href' : null,
            'target' : cm.Node('div'),
            'scroll' : document.body,
            'indentY' : 0,
            'duration' : 800,
            'setURL' : true
        }, o),
        anims = {};

    var init = function(){
        var y, styles;
        // Init scroll animation
        anims['scroll'] = new cm.Animation(config['scroll']);
        // Add click event
        cm.addEvent(config['link'], 'click', function(e){
            e = cm.getEvent(e);
            cm.preventDefault(e);
            // Set url
            if(config['setURL'] && cm.isHistoryAPI && config['href']){
                window.history.pushState(false, false, config['href']);
            }
            // Get target position and animate to it
            y = config['target'].offsetTop + config['indent'];
            if(config['scroll'] == document.body){
                styles = {'docScrollTop' : y};
            }else{
                styles = {'scrollTop' : y};
            }
            anims['scroll'].go({'style' : styles, 'anim' : 'smooth', 'duration' : config['duration']});
        }, true, true);
    };

    /* ******* MAIN ******* */

    that.setIndent = function(indent){
        if(!isNaN(indent)){
            config['indent'] = indent
        }
        return that;
    };

    init();

};
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
        },
        'langs' : {
            'next' : 'Next',
            'back' : 'Back',
            'close' : 'Close',
            'cancel' : 'Cancel',
            'finish' : 'Finish'
        }
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
            'sidebarTab' : 'modules'
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
        getCSSHelpers();
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

    var getCSSHelpers = function(){
        var rule;
        that.params['duration'] = cm.getTransitionDurationFromRule('.app__helptour-helper__duration');
        if(rule = cm.getCSSRule('.app__helptour-helper__adaptive-from')[0]){
            that.params['adaptiveFrom'] = cm.styleToNumber(rule.style.width);
        }
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
            that.components['overlays']['template'] = new classConstructor(that.params['Com.Overlay']);
            // Start tour on click
            cm.addEvent(that.params['node'], 'click', prepare);
        });
    };

    var getDimensions = function(){
        var rule;
        if(rule = cm.getCSSRule('.app-lt__sidebar-helper__width-collapsed')[0]){
            dimensions['sidebarCollapsed'] = cm.styleToNumber(rule.style.width);
        }
        if(rule = cm.getCSSRule('.app-lt__sidebar-helper__width-expanded')[0]){
            dimensions['sidebarExpanded'] = cm.styleToNumber(rule.style.width);
        }
        if(rule = cm.getCSSRule('.app-lt__topmenu-helper__height')[0]){
            dimensions['topMenu'] = cm.styleToNumber(rule.style.height);
        }
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
        // Get TopMenu
        cm.find('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.components['overlays']['template'].embed(that.components['template'].getNodes('container'));
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
        // Render Popup
        renderPopup();
        // Save Sidebar State
        startOptions['sidebarExpanded'] = that.components['sidebar'].isExpanded;
        if(that.components['sidebar'].isExpanded){
            that.components['sidebar'].collapse();
        }
        startOptions['sidebarTab'] = that.components['sidebar'].getTab();
        that.components['sidebar'].unsetTab();
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
            if(that.currentStage == 0){
                that.nodes['back'].innerHTML = that.lang('close');
                that.nodes['next'].innerHTML = that.lang('next');
            }else if(that.currentStage == App.HelpTourScenario.length - 1){
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
        e = cm.getEvent(e);
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
                        }else if(position[2] && position[2] == 'dropdown' && topMenuItem['dropdown']){
                            if(position[3] && position[3] == 'left'){
                                left = cm.getX(topMenuItem['dropdown']) - that.nodes['popup'].offsetWidth - that.params['popupIndent'];
                            }else{
                                left = cm.getX(topMenuItem['dropdown']) + topMenuItem['dropdown'].offsetWidth + that.params['popupIndent'];
                            }
                        }else if(topMenuItem['container']){
                            if(position[3] && position[3] == 'left'){
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
            that.nodes['popupContent'].style.height = conentHeight == 'auto' ? conentHeight : [conentHeight, 'px'].join('');
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
    'sidebar' : 'modules',
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
cm.define('App.ModuleMenu', {
    'modules' : [
        'Params',
        'DataNodes'
    ],
    'params' : {
        'node' : cm.Node('div')
    }
},
function(params){
    var that = this;

    that.nodes = {
        'select' : cm.Node('select')
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
App['Rollover'] = function(o){
    var that = this,
        config = cm.merge({
            'node' : cm.Node('div'),
            'height' : 400,
            'duration' : 500,
            'nodes' : {
                'app-rollover' : {}
            }
        }, o),
        privateConfgig = {
            'nodes' : {
                'app-rollover' : ['button', 'container']
            }
        },
        nodes = {},
        anims = {},
        startHeight = 0,
        isOpen;

    var init = function(){
        var container;
        // Collect nodes
        getNodes();
        // Check height of container and status
        container = nodes['app-rollover']['container'];
        if(container.offsetHeight === container.scrollHeight){
            startHeight = config['height'];
            isOpen = true;
            cm.replaceClass(config['node'], 'is-close', 'is-open');
        }else{
            startHeight = container.offsetHeight;
            isOpen = false;
            cm.replaceClass(config['node'], 'is-open', 'is-close');
        }
        // Render
        render();
    };

    var getNodes = function(){
        // Get nodes
        cm.forEach(privateConfgig['nodes'], function(item, key){
            nodes[key] = {};
            cm.forEach(item, function(value){
                nodes[key][value] = cm.getByAttr(['data', key].join('-'), value, config['node'])[0] || cm.Node('div')
            });
        });
        // Merge collected nodes with each defined in config
        nodes = cm.merge(nodes, config['nodes']);
    };

    var render = function(){
        anims['container'] = new cm.Animation(nodes['app-rollover']['container']);
        // Add click event on button, that collapse / expand container block
        cm.addEvent(nodes['app-rollover']['button'], 'click', clickEvent);
    };

    var clickEvent = function(){
        console.log(1);
        if(isOpen){
            cm.replaceClass(config['node'], 'is-open', 'is-close');
            anims['container'].go({'style' : {'height' : [startHeight, 'px'].join('')}, 'duration' : config['duration'], 'anim' : 'smooth'});
        }else{
            cm.replaceClass(config['node'], 'is-close', 'is-open');
            anims['container'].go({
                'style' : {'height' : [(nodes['app-rollover']['container'].scrollHeight + nodes['app-rollover']['button'].scrollHeight), 'px'].join('')},
                'duration' : config['duration'],
                'anim' : 'smooth'
            });
        }
        isOpen = !isOpen;
    };

    /* ******* MAIN ******* */

    init();
};
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
        'onRender',
        'onCollapse',
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-sidebar',
        'active' : 'modules',
        'target' : 'document.html',
        'remember' : true,
        'Com.TabsetHelper' : {
            'node' : cm.Node('div'),
            'name' : ''
        }
    }
},
function(params){
    var that = this,
        scrollBarSize = 0,
        menuWidth = 0,
        contentWidth;

    that.nodes = {
        'container' : cm.Node('div'),
        'inner' : cm.Node('div'),
        'collapseButtons' : [],
        'labels' : [],
        'tabs' : [],
        'areas' : [],
        'widgets' : []
    };
    that.components = {};
    that.isExpanded = false;

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        validateParams();
        render();
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
    };

    var render = function(){
        var helperMenuRule, helperContentRule;
        // Init tabset
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper']);
            that.components['tabset'].addEvent('onLabelClick', function(tabset, data){
                if(!that.isExpanded || tabset.get() == data['id']){
                    that.toggle();
                }
            });
            that.components['tabset'].addTabs(that.nodes['tabs'], that.nodes['labels']);
            that.components['tabset'].set(that.params['active']);
        });
        // Get sidebar dimensions from CSS
        scrollBarSize = cm._scrollSize;
        if(helperMenuRule = cm.getCSSRule('.app-lt__sidebar-helper__menu-width')[0]){
            menuWidth = cm.styleToNumber(helperMenuRule.style.width);
        }
        if(helperContentRule = cm.getCSSRule('.app-lt__sidebar-helper__content-width')[0]){
            contentWidth = cm.styleToNumber(helperContentRule.style.width);
        }
        // Add events on collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addEvent(item['container'], 'click', that.toggle);
        });
        // Resize sidebar relative to scroll bar size
        resize();
        // Check toggle class
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
        // Check storage
        if(that.params['remember']){
            that.isExpanded = that.storageRead('isExpanded');
        }
        // Check sidebars visibility
        if(!cm.inDOM(that.nodes['container']) || cm.getStyle(that.nodes['container'], 'display') == 'none'){
            that.isExpanded = false;
        }
        // Trigger events
        if(that.isExpanded){
            that.expand(true);
        }else{
            that.collapse(true);
        }
        cm.addEvent(window, 'resize', onResize);
    };

    var resize = function(){
        var rule;
        cm.addClass(that.nodes['container'], 'is-immediately');
        if(rule = cm.getCSSRule('.app-lt__sidebar .sidebar__content')[0]){
            rule.style.width = [contentWidth + scrollBarSize, 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app-lt__sidebar .sidebar__remove-zone')[0]){
            rule.style.width = [contentWidth + scrollBarSize, 'px'].join('');
        }
        if((rule = cm.getCSSRule('.app-lt__sidebar.is-expanded')[0]) || (rule = cm.getCSSRule('.is-expanded.app-lt__sidebar')[0])){
            rule.style.width = [menuWidth + contentWidth + scrollBarSize, 'px'].join('');
        }
        if(rule = cm.getCSSRule('html.is-sidebar--expanded .tpl__container')[0]){
            rule.style.marginLeft = [menuWidth + contentWidth + scrollBarSize, 'px'].join('');
        }
        if(rule = cm.getCSSRule('.app-lt__sidebar-helper__width-expanded')[0]){
            rule.style.width = [menuWidth + contentWidth + scrollBarSize, 'px'].join('');
        }
        setTimeout(function(){
            cm.removeClass(that.nodes['container'], 'is-immediately');
        }, 5);
    };

    var onResize = function(){
        if(cm._scrollSize != scrollBarSize){
            scrollBarSize = cm._scrollSize;
            resize();
        }
    };

    /* ******* MAIN ******* */

    that.collapse = function(isImmediately){
        var tab;
        that.isExpanded = false;
        // Set immediately animation hack
        if(isImmediately){
            cm.addClass(that.nodes['container'], 'is-immediately');
            cm.addClass(that.params['target'], 'is-immediately');
        }
        cm.replaceClass(that.nodes['container'], 'is-expanded', 'is-collapsed', true);
        cm.replaceClass(that.params['target'], 'is-sidebar--expanded', 'is-sidebar--collapsed', true);
        // Unset active class to collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.removeClass(item['container'], 'active');
        });
        // Remove immediately animation hack
        if(isImmediately){
            setTimeout(function(){
                cm.removeClass(that.nodes['container'], 'is-immediately');
                cm.removeClass(that.params['target'], 'is-immediately');
            }, 5);
        }
        // Write storage
        if(that.params['remember']){
            that.storageWrite('isExpanded', false);
        }
        that.triggerEvent('onCollapse');
        return that;
    };

    that.expand = function(isImmediately){
        that.isExpanded = true;
        // Set immediately animation hack
        if(isImmediately){
            cm.addClass(that.nodes['container'], 'is-immediately');
            cm.addClass(that.params['target'], 'is-immediately');
        }
        cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded', true);
        cm.replaceClass(that.params['target'], 'is-sidebar--collapsed', 'is-sidebar--expanded', true);
        // Set active class to collapse buttons
        cm.forEach(that.nodes['collapseButtons'], function(item){
            cm.addClass(item['container'], 'active');
        });
        // Remove immediately animation hack
        if(isImmediately){
            setTimeout(function(){
                cm.removeClass(that.nodes['container'], 'is-immediately');
                cm.removeClass(that.params['target'], 'is-immediately');
            }, 5);
        }
        // Write storage
        if(that.params['remember']){
            that.storageWrite('isExpanded', true);
        }
        that.triggerEvent('onExpand');
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

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
cm.define('App.Stylizer', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onSelect',
        'onChange'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'active' : {},
        'default' : {},
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
            'font-weight' : [100, 300, 400, 600, 700, 800],
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
            'color' : true
        },
        'showResetButtons' : true,
        'overrideControls' : true,
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
            'renderInBody' : false
        },
        'langs' : {
            '100' : 'Thin',
            '300' : 'Light',
            '400' : 'Regular',
            '600' : 'Semi-Bold',
            '700' : 'Bold',
            '800' : 'Extra-Bold'
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'input' : cm.Node('input', {'type' : 'hidden'}),
        'preview' : cm.Node('div'),
        'tooltip' : {}
    };
    that.components = {};
    that.value = null;
    that.previousValue = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        // Render editor toolbar
        renderTooltip();
        // Add to stack
        that.addToStack(that.nodes['container']);
        // Set
        set(cm.merge(that.params['default'], that.params['active']), false);
        // Trigger events
        that.triggerEvent('onRender', that.value);
    };

    var validateParams = function(){
        if(cm.isNode(that.nodes['input'])){
            that.params['name'] = that.nodes['input'].getAttribute('name') || that.params['name'];
        }
        // Get config
        that.params['default'] = cm.merge(
            that.params['default'],
            that.getNodeDataConfig(that.nodes['input'], 'data-default')
        );
        that.params['active'] = cm.merge(
            cm.merge(that.params['default'], that.params['active']),
            that.getNodeDataConfig(that.nodes['input'], 'value')
        );
        // Validate config
        validateItemConfig(that.params['active']);
        validateItemConfig(that.params['default']);
        // Extend global styles config
        extendGlobalConfig(that.params['active']);
        extendGlobalConfig(that.params['default']);
        sortGlobalConfig();
        // Override controls
        if(that.params['overrideControls']){
            cm.forEach(that.params['controls'], function(item, key){
                that.params['controls'][key] = !!that.params['default'][key];
            });
        }
    };

    var validateItemConfig = function(config){
        if(config['line-height']){
            if(config['line-height'] != 'normal'){
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

    var extendGlobalConfig = function(config){
        if(config['font-size'] && !cm.inArray(that.params['styles']['font-size'], config['font-size'])){
            that.params['styles']['font-size'].push(config['font-size']);
        }
        if(config['line-height'] && !cm.inArray(that.params['styles']['line-height'], config['line-height'])){
            that.params['styles']['line-height'].push(config['line-height']);
        }
        if(config['font-family'] && !cm.inArray(that.params['styles']['font-family'], config['font-family'])){
            that.params['styles']['font-family'].push(config['font-family']);
        }
    };

    var sortGlobalConfig = function(){
        that.params['styles']['font-size'].sort(function(a, b){
            return a - b;
        });
        that.params['styles']['line-height'].sort(function(a, b){
            if(a == 'normal'){
                return -1;
            }else if(b == 'normal'){
                return 1;
            }
            return a - b;
        });
        that.params['styles']['font-family'].sort(function(a, b){
            var t1 = a.toLowerCase().replace(/["']/g, ''),
                t2 = b.toLowerCase().replace(/["']/g, '');
            return (t1 < t2)? -1 : ((t1 > t2)? 1 : 0);
        });
    };

    var renderTooltip = function(){
        // Structure
        that.nodes['tooltip']['container'] = cm.Node('div', {'class' : 'pt__toolbar'},
            cm.Node('div', {'class' : 'inner'},
                that.nodes['tooltip']['group1'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group2'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group3'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group4'] = cm.Node('ul', {'class' : 'group'})
            )
        );
        // Font-Family
        if(that.params['controls']['font-family']){
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['font-family'] = cm.Node('select', {'title' : that.lang('Font')})
                )
            );
            cm.forEach(that.params['styles']['font-family'], function(item){
                that.nodes['tooltip']['font-family'].appendChild(
                    cm.Node('option', {'value' : item, 'style' : {'font-family' : item}}, item.replace(/["']/g, '').split(',')[0])
                );
            });
            that.components['font-family'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-family'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-family' : value}), true);
                        }
                    }
                })
            );
        }
        // Font-Weight
        if(that.params['controls']['font-weight']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['font-weight-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar bold'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['font-weight-button'], 'click', function(){
                set(cm.merge(that.value, {'font-weight' : (that.value['font-weight'] > 400? 400 : 700)}), true);
            });
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['font-weight'] = cm.Node('select', {'title' : that.lang('Weight')})
                )
            );
            cm.forEach(that.params['styles']['font-weight'], function(item){
                that.nodes['tooltip']['font-weight'].appendChild(
                    cm.Node('option', {'value' : item}, that.lang(item))
                );
            });
            that.components['font-weight'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-weight'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-weight' : value}), true);
                        }
                    }
                })
            );
        }
        // Font-Style
        if(that.params['controls']['font-style']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['font-style-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar italic'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['font-style-button'], 'click', function(){
                set(cm.merge(that.value, {'font-style' : (that.value['font-style'] == 'italic'? 'normal' : 'italic')}), true);
            });
        }
        // Text-Decoration
        if(that.params['controls']['text-decoration']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['text-decoration-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar underline'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['text-decoration-button'], 'click', function(){
                set(cm.merge(that.value, {'text-decoration' : (that.value['text-decoration'] == 'underline'? 'none' : 'underline')}), true);
            });
        }
        // Font-Size
        if(that.params['controls']['font-size']){
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select x-small'},
                    that.nodes['tooltip']['font-size'] = cm.Node('select', {'title' : that.lang('Size')})
                )
            );
            cm.forEach(that.params['styles']['font-size'], function(item){
                that.nodes['tooltip']['font-size'].appendChild(
                    cm.Node('option', {'value' : item}, item)
                );
            });
            that.components['font-size'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-size'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-size' : value}), true);
                        }
                    }
                })
            );
        }
        // Line-Height
        if(that.params['controls']['line-height']){
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select x-small'},
                    that.nodes['tooltip']['line-height'] = cm.Node('select', {'title' : that.lang('Leading')})
                )
            );
            cm.forEach(that.params['styles']['line-height'], function(item){
                that.nodes['tooltip']['line-height'].appendChild(
                    cm.Node('option', {'value' : item}, (item == 'normal'? that.lang('auto') : item))
                );
            });
            that.components['line-height'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['line-height'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'line-height' : value}), true);
                        }
                    }
                })
            );
        }
        // Color
        if(that.params['controls']['color']){
            that.nodes['tooltip']['group3'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['color'] = cm.Node('input', {'type' : 'text', 'title' : that.lang('Color')})
                )
            );
            that.components['color'] = new Com.ColorPicker(
                cm.merge(that.params['Com.ColorPicker'], {
                    'input' : that.nodes['tooltip']['color'],
                    'defaultValue' : that.params['default']['color'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'color' : value}), true);
                        }
                    }
                })
            );
        }
        // Reset
        if(that.params['showResetButtons']){
            // Button
            that.nodes['tooltip']['group4'].appendChild(
                cm.Node('li',
                    that.nodes['tooltip']['reset-default-button'] = cm.Node('div', {'class' : 'button button-primary'}, that.lang('Reset to default'))
                )
            );
            that.nodes['tooltip']['group4'].appendChild(
                cm.Node('li',
                    that.nodes['tooltip']['reset-current-button'] = cm.Node('div', {'class' : 'button button-primary'}, that.lang('Reset to current'))
                )
            );
            cm.addEvent(that.nodes['tooltip']['reset-default-button'], 'click', function(){
                set(cm.clone(that.params['default']), true);
            });
            cm.addEvent(that.nodes['tooltip']['reset-current-button'], 'click', function(){
                set(cm.clone(that.params['active']), true);
            });
        }
        // Render tooltip
        that.components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'content' : that.nodes['tooltip']['container'],
                'target' : that.nodes['container'],
                'events' : {
                    'onShowStart' : function(){
                        cm.addClass(that.nodes['container'], 'active')
                    },
                    'onHideStart' : function(){
                        cm.removeClass(that.nodes['container'], 'active')
                    }
                }
            })
        );
    };

    var set = function(styles, triggerEvents){
        var prepared = cm.clone(styles);
        that.previousValue = cm.clone(that.value);
        that.value = styles;
        // Set components
        cm.forEach(styles, function(value, key){
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
                    if(value == 'underline'){
                        cm.addClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }
                    break;
                case 'font-style':
                    if(value == 'italic'){
                        cm.addClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }
                    break;
                case 'font-size':
                    prepared[key] = [value, 'px'].join('');
                    break;
                case 'line-height':
                    prepared[key] = value == 'normal'? value :[value, 'px'].join('');
                    break;
            }
            // Set preview
            that.nodes['preview'].style[cm.styleStrToKey(key)] = prepared[key];
        });
        // Set hidden input data
        that.nodes['input'].value = JSON.stringify(prepared);
        // Trigger events
        if(triggerEvents){
            that.triggerEvent('onSelect', that.value);
            eventOnChange();
        }
    };

    var eventOnChange = function(){
        if(JSON.stringify(that.value) != JSON.stringify(that.previousValue)){
            that.triggerEvent('onChange', that.value);
        }
    };

    /* ******* MAIN ******* */

    that.set = function(styles, triggerEvents){
        triggerEvents = typeof triggerEvents != 'undefined'? triggerEvents : true;
        styles = cm.isObject(styles)? validateItemConfig(styles) : that.params['default'];
        set(styles, triggerEvents);
        return that;
    };

    that.get = function(){
        return that.value;
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
        'onRender',
        'onRedraw'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-template',
        'fixedHeader' : false,
        'stickyFooter' : false,
        'scroll' : 'document.body',
        'scrollDuration' : 1000
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'header' : cm.Node('div'),
        'content' : cm.Node('div'),
        'footer' : cm.Node('div'),
        'buttonUp' : cm.Node('div')
    };

    that.anim = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        render();
        that.triggerEvent('onRender');
        redraw(true);
    };

    var render = function(){
        // Scroll Controllers
        that.anim['scroll'] = new cm.Animation(that.params['scroll']);
        cm.addEvent(that.nodes['buttonUp'], 'click', that.scrollToTop);
        // Resize events
        cm.addEvent(window, 'resize', function(){
            redraw(true);
        });
    };

    var redraw = function(triggerEvents){
        // Fixed Header
        if(that.params['fixedHeader']){
            //fixedHeader();
        }
        // Sticky Footer
        if(that.params['stickyFooter']){
            stickyFooter();
        }
        // Redraw Events
        if(triggerEvents){
            that.triggerEvent('onRedraw');
        }
    };

    var fixedHeader = function(){
        var headerHeight = that.nodes['header'].offsetHeight;
        that.nodes['content'].style.marginTop = headerHeight + 'px';
    };

    var stickyFooter = function(){
        var windowHeight = cm.getPageSize('winHeight'),
            contentTop = cm.getY(that.nodes['content']),
            footerHeight = that.nodes['footer'].offsetHeight;
        that.nodes['content'].style.minHeight = Math.max((windowHeight - contentTop - footerHeight), 0) + 'px';
    };

    /* ******* MAIN ******* */

    that.redraw = function(triggerEvents){
        triggerEvents = typeof triggerEvents == 'undefined'? true : triggerEvents;
        redraw(triggerEvents);
        return that;
    };

    that.scrollToTop = function(){
        that.anim['scroll'].go({'style' : {'docScrollTop' : '0'}, 'duration' : that.params['scrollDuration'], 'anim' : 'smooth'});
        return that;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});
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
        'onReplace',
        'onUpdate',
        'onForceRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'sidebarName' : 'app-sidebar',
        'Com.Draganddrop' : {
            'renderTemporaryAria' : true,
            'highlightChassis' : true
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
    that.states = {
        'sidebarExpanded' : false
    };
    that.isExpanded = false;

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
        windowResize();
        cm.addEvent(window, 'resize', windowResize);
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
            onAdminPage();
        }
    };

    var onSidebarExpand = function(){
        var elements;
        that.isExpanded = true;
        // Enable widgets editable
        elements = cm.getByClass('app__block');
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
        // Enable gridlist editable
        cm.find('Com.GridlistHelper', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.enableEditMode();
        });
        // Redraw template
        cm.find('App.Template', null, that.nodes['AppTemplate']['container'], function(classObject){
            classObject.redraw();
        });
    };

    var onSidebarCollapse = function(){
        var elements;
        that.isExpanded = false;
        // Disable widgets editable
        elements = cm.getByClass('app__block');
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
        'onExpand'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : 'app-topmenu',
        'target' : 'document.html'
    }
},
function(params){
    var that = this,
        eventInterval;

    that.nodes = {
        'container': cm.Node('div'),
        'inner': cm.Node('div'),
        'button': cm.Node('div'),
        'target': cm.Node('div'),
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
        cm.addEvent(that.nodes['button'], 'click', that.toggle);
        that.isExpanded = cm.isClass(that.nodes['container'], 'is-expanded');
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

    that.expand = function(){
        if(!that.isExpanded){
            that.isExpanded = true;
            cm.replaceClass(that.nodes['container'], 'is-collapsed', 'is-expanded');
            cm.replaceClass(that.params['target'], 'is-topmenu--collapsed', 'is-topmenu--expanded', true);
            that.triggerEvent('onExpand');
        }
        return that;
    };

    that.collapse = function(){
        if(that.isExpanded){
            that.isExpanded = false;
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

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});