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