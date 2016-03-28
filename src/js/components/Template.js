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
            'overlapping' : false
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
        'header' : cm.Node('div'),
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
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        setState();
        redraw(true);
        that.triggerEvent('onRender');
    };

    var render = function(){
        // Structure
        that.nodes['headerFake'] = cm.node('div', {'class' : 'tpl__header__fake'});
        cm.insertAfter(that.nodes['headerFake'], that.nodes['headerContainer']);
        // Find components
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
        });
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.components['sidebar'] = classObject;
        });
        new cm.Finder('App.Editor', that.params['editorName'], null, function(classObject){
            that.components['editor'] = classObject
                .addEvent('onResize', resize);
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
    };

    var setState = function(){
        if(that.params['header']['overlapping']){
            cm.addClass(that.nodes['headerContainer'], 'is-overlapping');
        }
        if(that.params['header']['fixed']){
            cm.addClass(that.nodes['headerContainer'], 'is-fixed');
        }
        if(that.params['header']['fixed'] && !that.params['header']['overlapping']){
            cm.addClass(that.nodes['headerFake'], 'is-show');
        }
    };

    var unsetState = function(){
        cm.removeClass(that.nodes['headerContainer'], 'is-overlapping is-fixed');
        cm.removeClass(that.nodes['headerFake'], 'is-show');
    };

    var resize = function(editor, params){
        var rule;
        if(rule = cm.getCSSRule('html.is-sidebar--expanded .tpl__container')[0]){
            rule.style.marginLeft = [params['sidebar']['width'], 'px'].join('');
        }
        if(rule = cm.getCSSRule('html.is-sidebar--expanded .tpl__header__container.is-fixed')[0]){
            rule.style.left = [params['sidebar']['width'], 'px'].join('');
        }
    };

    var redraw = function(triggerEvents){
        // Fixed Header
        that.offsets['top'] = that.components['topMenu'] ? that.components['topMenu'].getDimensions('height') : 0;
        that.offsets['left'] = that.components['sidebar'] ? that.components['sidebar'].getDimensions('width') : 0;
        that.offsets['header'] = that.nodes['header'].offsetHeight;
        that.offsets['footer'] = that.nodes['footer'].offsetHeight;
        that.offsets['height'] = cm.getPageSize('winHeight') - that.offsets['top'];
        // Resize
        that.nodes['inner'].style.minHeight = that.offsets['height'] + 'px';
        if(that.isEditing){
            if(that.params['footer']['sticky']){
                that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['header'] - that.offsets['footer']), 0) + 'px';
            }
        }else{
            if(that.params['header']['fixed'] && !that.params['header']['overlapping']){
                that.nodes['headerFake'].style.height = that.offsets['header'] + 'px';
            }
            if(that.params['footer']['sticky']){
                if(that.params['header']['overlapping']){
                    that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['footer']), 0) + 'px';
                }else{
                    that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['header'] - that.offsets['footer']), 0) + 'px';
                }
            }
        }
        // Redraw Events
        if(triggerEvents){
            that.triggerEvent('onRedraw');
        }
    };

    /* ******* MAIN ******* */

    that.redraw = function(triggerEvents){
        triggerEvents = typeof triggerEvents == 'undefined'? true : triggerEvents;
        redraw(triggerEvents);
        return that;
    };

    that.enableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || !that.isEditing){
            that.isEditing = true;
            unsetState();
            that.redraw();
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            setState();
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

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});