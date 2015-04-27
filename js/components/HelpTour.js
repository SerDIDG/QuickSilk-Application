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
            'close' : 'Close'
        }
    }
},
function(params){
    var that = this,
        dimensions = {
            'sidebarCollapsed' : 0,
            'sidebarExpanded' : 0,
            'topMenu' : 0
        },
        startOptions = {
            'sidebarExpanded' : false,
            'sidebarTab' : 'modules'
        };

    that.nodes = {};
    that.components = {
        'overlays' : {}
    };
    that.currentStage = null;
    that.currentScene = null;
    that.previousStage = null;
    that.previousScene = null;
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
    };

    var getCSSHelpers = function(){
        that.params['duration'] = cm.getTransitionDurationFromRule('.app__helptour-helper__duration');
    };

    var validateParams = function(){
        that.params['Com.Overlay']['container'] = that.params['container'];
        that.params['Com.Overlay']['name'] = [that.params['name'], 'overlay'].join('-')
    };

    var render = function(){
        cm.getClass('Com.Overlay', function(classConstructor){
            that.components['overlays']['main'] = new classConstructor(
                cm.merge(that.params['Com.Overlay'], {
                    'position' : 'fixed'
                })
            );
            that.components['overlays']['sidebar'] = new classConstructor(that.params['Com.Overlay']);
            that.components['overlays']['topMenu'] = new classConstructor(that.params['Com.Overlay']);
            that.components['overlays']['template'] = new classConstructor(that.params['Com.Overlay']);
        });
        // Start tour on click
        cm.addEvent(that.params['node'], 'click', prepare);
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
            dimensions['topMenu'] = cm.styleToNumber(rule.style.width);
        }
    };

    var prepare = function(){
        var finder;
        // Get Sidebar
        finder = cm.find('App.Sidebar', that.params['sidebarName'])[0];
        if(finder){
            that.components['sidebar'] = finder['class'];
            that.components['overlays']['sidebar'].embed(that.components['sidebar'].getNodes('inner'));
        }
        // Get TopMenu
        finder = cm.find('App.TopMenu', that.params['topMenuName'])[0];
        if(finder){
            that.components['topMenu'] = finder['class'];
            that.components['overlays']['topMenu'].embed(that.components['topMenu'].getNodes('inner'));
        }
        // Get TopMenu
        finder = cm.find('App.Template', that.params['templateName'])[0];
        if(finder){
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
        getDimensions();
        // Render popup
        renderPopup();
        // Sidebar
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
        // Restore state
        if(startOptions['sidebarExpanded'] && !that.components['sidebar'].isExpanded){
            that.components['sidebar'].expand();
        }else if(!startOptions['sidebarExpanded'] && that.components['sidebar'].isExpanded){
            that.components['sidebar'].collapse();
        }
        that.components['sidebar'].setTab(startOptions['sidebarTab']);
        // Hide popup
        that.nodes['popup'].style.left = [cm.getX(that.params['node']), 'px'].join('');
        that.nodes['popup'].style.top = [cm.getY(that.params['node']), 'px'].join('');
        cm.removeClass(that.nodes['popup'], 'is-show');
        setTimeout(function(){
            cm.removeEvent(window, 'resize', setPopupPosition);
            cm.remove(that.nodes['popup']);
        }, that.params['duration']);
        // Hide overlays
        cm.forEach(that.components['overlays'], function(item){
            item.close();
        });
        // Stop scenario
        unsetStage();
    };

    var setStage = function(stage){
        var contentNode;
        if(App.HelpTourScenario[stage]){
            // Destruct previous scene
            unsetStage();
            // Construct new scene
            that.currentStage = stage;
            that.currentScene = App.HelpTourScenario[stage];
            // Set overlays
            cm.forEach(that.currentScene['overlays'], function(item, key){
                that.components['overlays'][key].setTheme(item);
            });
            // Set popup content
            cm.clearNode(that.nodes['popupContent']);
            contentNode = cm.Node('div', {'class' : 'popup__content__item', 'innerHTML' : that.currentScene['content']});
            that.nodes['popupContent'].appendChild(contentNode);
            // Set popup position
            setPopupPosition();
            // Construct
            that.currentScene['construct'] && that.currentScene['construct'].call(that);
        }
    };

    var unsetStage = function(){
        if(that.currentStage){
            that.previousStage = that.currentStage;
            that.previousScene = that.currentScene;
            cm.forEach(that.sceneIntervals, function(item){
                clearInterval(item);
            });
            that.previousScene['destruct'] && that.previousScene['destruct'].call(that);
        }
        that.currentStage = null;
    };

    var renderPopup = function(){
        that.nodes['popup'] = cm.Node('div', {'class' : 'app__helptour__popup'},
            that.nodes['popupContent'] = cm.Node('div', {'class' : 'popup__content'}),
            cm.Node('div', {'class' : 'btn-wrap pull-center'},
                that.nodes['close'] = cm.Node('button', {'class' : 'button-transparent'}, that.lang('close')),
                that.nodes['back'] = cm.Node('button', that.lang('back')),
                that.nodes['next'] = cm.Node('button', that.lang('next'))
            )
        );
        that.nodes['popup'].style.left = [cm.getX(that.params['node']), 'px'].join('');
        that.nodes['popup'].style.top = [cm.getY(that.params['node']), 'px'].join('');
        that.params['container'].appendChild(that.nodes['popup']);
        cm.addClass(that.nodes['popup'], 'is-show', true);
        // Events
        cm.addEvent(that.nodes['close'], 'click', stop);
        cm.addEvent(that.nodes['next'], 'click', function(){
            if(App.HelpTourScenario[that.currentStage + 1]){
                setStage(that.currentStage + 1);
            }
        });
        cm.addEvent(that.nodes['back'], 'click', function(){
            if(App.HelpTourScenario[that.currentStage - 1]){
                setStage(that.currentStage - 1);
            }
        });
        cm.addEvent(window, 'resize', setPopupPosition);
    };

    var setPopupPosition = function(){
        var pageSize;
        if(that.currentScene){
            getDimensions();
            pageSize = cm.getPageSize();
            switch(that.currentScene['position']){
                case 'center':
                    that.nodes['popup'].style.left = [Math.round((pageSize['winWidth'] - that.nodes['popup'].offsetWidth) / 2), 'px'].join('');
                    that.nodes['popup'].style.top = [Math.round((pageSize['winHeight'] - that.nodes['popup'].offsetHeight) / 2), 'px'].join('');
                    break;
            }
        }
    };

    /* ******* MAIN ******* */

    init();
});

App.HelpTourScenario = [{
    'position' : 'center',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'dark',
        'template' : 'dark'
    },
    'content' : '<h3>Welcome to the QuickSilk Online Tour!</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>'
},{
    'position' : 'center',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'content' : '<h3>Modules Menu</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>',
    'construct' : function(){
        var that = this,
            nodes = that.components['topMenu'].getNodes('items')['modules'];
        if(nodes){
            that.sceneIntervals['dropdown'] = setTimeout(function(){
                cm.addClass(nodes['container'], 'active', true);
            }, that.params['duration']);
        }
    },
    'destruct' : function(){
        var that = this,
            nodes = that.components['topMenu'].getNodes('items')['modules'];
        if(nodes){
            cm.removeClass(nodes['container'], 'active');
        }
    }
},{
    'position' : 'center',
    'overlays' : {
        'main' : 'transparent',
        'sidebar' : 'dark',
        'topMenu' : 'transparent',
        'template' : 'dark'
    },
    'content' : '<h3>User Menu</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam viverra feugiat massa sed ultricies. Maecenas at metus ac massa porttitor congue.</p>',
    'construct' : function(){
        var that = this,
            nodes = that.components['topMenu'].getNodes('items')['user'];
        if(nodes){
            that.sceneIntervals['dropdown'] = setTimeout(function(){
                cm.addClass(nodes['container'], 'active', true);
            }, that.params['duration']);
        }
    },
    'destruct' : function(){
        var that = this,
            nodes = that.components['topMenu'].getNodes('items')['user'];
        if(nodes){
            cm.removeClass(nodes['container'], 'active');
        }
    }
}];