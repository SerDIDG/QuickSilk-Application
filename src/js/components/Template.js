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
        'onEnableEditing',
        'onDisableEditing',
    ],
    'params' : {
        'node' : cm.node('div'),
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
        'container' : cm.node('div'),
        'inner' : cm.node('div'),
        'headerContainer' : cm.node('div'),
        'headerTransformed' : cm.node('div'),
        'header' : cm.node('div'),
        'header2' : cm.node('div'),
        'content' : cm.node('div'),
        'footer' : cm.node('div'),
        'buttonUp' : cm.node('div'),
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
                that.offsets['contentHeightCalc'] =
                    that.offsets['height'] -
                    that.offsets['header'] -
                    that.offsets['footer'] -
                    (that.params['content']['editableIndent'] * 2);
                if(that.params['header']['transformed']){
                    that.offsets['contentHeightCalc'] =
                        that.offsets['contentHeightCalc'] -
                        that.offsets['header2'] -
                        that.params['content']['editableIndent'];
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
            that.triggerEvent('onEnableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(!cm.isBoolean(that.isEditing) || that.isEditing){
            that.isEditing = false;
            cm.removeClass(that.nodes['container'], 'is-editing');
            that.redraw();
            that.triggerEvent('onDisableEditing');
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

    that.getTopMenuDimensions = function(key){
        return that.components['topMenu'] ? that.components['topMenu'].getDimensions(key) : null;
    };

    that.getHeaderDimensions = function(key){
        var rect = cm.getRect(that.nodes['header']);
        return key ? rect[key] : rect;
    };

    that.getHeader2Dimensions = function(key){
        var rect = cm.getRect(that.nodes['header2']);
        return key ? rect[key] : rect;
    };

    that.getFixedHeaderHeight = function(){
        return Math.max(
            (that.params['header']['fixed'] ? that.getHeaderDimensions('height') : 0),
            (that.params['header']['transformed'] ? that.getHeader2Dimensions('height') : 0)
        );
    };

    that.getFooterDimensions = function(key){
        var rect = cm.getRect(that.nodes['footer']);
        return key ? rect[key] : rect;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});