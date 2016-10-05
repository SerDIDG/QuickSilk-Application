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
                if(that.params['view'] == 'vertical' && that.params['submenu'] == 'collapsible'){
                    that.showSubMenuItemCollapsible(e, item);
                }
            });
            cm.addEvent(item['container'], 'mouseout', function(e){
                if(that.params['view'] == 'vertical' && that.params['submenu'] == 'collapsible'){
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