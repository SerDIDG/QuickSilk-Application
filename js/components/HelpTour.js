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
        that.params['duration'] = cm.getTransitionDurationFromRule('.app__helptour-helper__duration');
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
        var finder;
        // Get Sidebar
        if(finder = cm.find('App.Sidebar', that.params['sidebarName'])[0]){
            that.components['sidebar'] = finder['class'];
            that.components['overlays']['sidebar'].embed(that.components['sidebar'].getNodes('inner'));
        }
        // Get TopMenu
        if(finder = cm.find('App.TopMenu', that.params['topMenuName'])[0]){
            that.components['topMenu'] = finder['class'];
            that.components['overlays']['topMenu'].embed(that.components['topMenu'].getNodes('inner'));
        }
        // Get TopMenu
        if(finder = cm.find('App.Template', that.params['templateName'])[0]){
            that.components['template'] = finder['class'];
            that.components['overlays']['template'].embed(that.components['template'].getNodes('container'));
        }
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
        that.nodes['popup'].style.left = [Math.round(cm.getX(that.params['node']) + that.params['node'].offsetWidth / 2), 'px'].join('');
        that.nodes['popup'].style.top = [Math.round(cm.getY(that.params['node']) + that.params['node'].offsetHeight / 2), 'px'].join('');
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
        var position, pageSize, top, left, topMenuItem;
        if(that.currentScene){
            getDimensions();
            pageSize = cm.getPageSize();
            position = that.currentScene['position'].split(':');
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
                        if(position[3] && position[3] == 'right'){
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
            that.nodes['popup'].style.left = [left, 'px'].join('');
            that.nodes['popup'].style.top = [top, 'px'].join('');
            that.nodes['popupContent'].style.height = [dimensions['popupContentHeight'], 'px'].join('')
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
    'content' : '<h3>Welcome to the QuickSilk Online Tour!</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
},{
    'position' : 'topMenuItem:user:dropdown:right',
    'arrow' : 'right',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'user',
    'content' : '<h3>User Menu</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
},{
    'position' : 'topMenuItem:modules:dropdown:left',
    'arrow' : 'left',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'modules',
    'content' : '<h3>Modules Menu</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
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
    'content' : '<h3>Left Panel</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
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
    'content' : '<h3>Left Panel: Templates</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
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
    'content' : '<h3>Left Panel: Layouts</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
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
    'content' : '<h3>Left Panel: Pages</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
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
    'content' : '<h3>Left Panel: Modules</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
},{
    'position' : 'template:center',
    'arrow' : false,
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'dark',
        'template' : 'transparent'
    },
    'sidebar' : 'modules',
    'topMenu' : false,
    'content' : '<h3>Drop Area</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
},{
    'position' : 'topMenuItem:help_support:container:right',
    'arrow' : 'top',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'sidebar' : false,
    'topMenu' : 'help_support',
    'content' : '<h3>Need Help?</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
}];