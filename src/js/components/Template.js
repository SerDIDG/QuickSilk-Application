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
        'stickyFooter' : false,
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
            'type' : 'box',            // wide | box
            'width' : 1000,
            'align' : 'center',
            'fixed' : false,
            'overlapping' : false
        },
        'footer' : {
            'type' : 'box',            // wide | box
            'width' : 1000,
            'align' : 'center'
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
        'buttonUp' : cm.Node('div')
    };

    that.isEditing = null;
    that.compoennts = {};
    that.anim = {};
    that.offsets = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
        redraw(true);
    };

    var render = function(){
        // Find components
        cm.find('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.compoennts['topMenu'] = classObject;
        });
        cm.find('App.Sidebar', that.params['sidebarName'], null, function(classObject){
            that.compoennts['sidebar'] = classObject;
        });
        new cm.Finder('App.Editor', that.params['editorName'], null, function(classObject){
            that.compoennts['editor'] = classObject
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
        that.offsets['top'] = that.compoennts['topMenu'] ? that.compoennts['topMenu'].getDimensions('height') : 0;
        that.offsets['left'] = that.compoennts['sidebar'] ? that.compoennts['sidebar'].getDimensions('width') : 0;
        that.offsets['header'] = that.nodes['header'].offsetHeight;
        that.offsets['footer'] = that.nodes['footer'].offsetHeight;
        that.offsets['height'] = cm.getPageSize('winHeight') - that.offsets['top'];
        // Resize
        that.nodes['inner'].style.minHeight = that.offsets['height'] + 'px';
        if(that.isEditing){
            that.nodes['content'].style.top = 0;
            if(that.params['stickyFooter']){
                that.nodes['content'].style.minHeight = Math.max((that.offsets['height'] - that.offsets['header'] - that.offsets['footer']), 0) + 'px';
            }
        }else{
            if(that.params['header']['fixed'] && !that.params['header']['overlapping']){
                that.nodes['content'].style.top = that.offsets['header'] + 'px';
            }
            if(that.params['stickyFooter']){
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
            cm.removeClass(that.nodes['headerContainer'], 'is-overlapping is-fixed');
            that.redraw();
            that.triggerEvent('enableEditing');
        }
        return that;
    };

    that.disableEditing = function(){
        if(typeof that.isEditing !== 'boolean' || that.isEditing){
            that.isEditing = false;
            if(that.params['header']['overlapping']){
                cm.addClass(that.nodes['headerContainer'], 'is-overlapping');
            }
            if(that.params['header']['fixed']){
                cm.addClass(that.nodes['headerContainer'], 'is-fixed');
            }
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