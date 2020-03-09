cm.define('Module.MobileMenu', {
    'extend': 'App.AbstractModule',
    'events' : [
        'onShow',
        'onHide'
    ],
    'params': {
        'view': 'horizontal',                      // sidebar-right | sidebar-left | dropdown | dropdown-overlap
        'container' : 'document.body'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.MobileMenu', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.isVisible = false;
        that.isProcessing = false;
        // Nodes
        that.nodes = {
            'container': cm.node('div'),
            'toggle': cm.node('div'),
            'close': cm.node('div'),
            'menu': cm.node('div')
        };
        // Binds
        that.toggleHandler = that.toggle.bind(that);
        that.toggleMenuHandler = that.toggleMenu.bind(that);
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // View
        cm.addClass(that.nodes.container, ['view', that.params.view].join('--'));
        cm.addClass(that.nodes.container, 'is-hide');
        cm.addClass(that.nodes.menu, ['view', that.params.view].join('--'));
        cm.addClass(that.nodes.menu, 'is-hide');
        // Events
        cm.addEvent(that.nodes.toggle, 'click', that.toggleHandler);
        cm.addEvent(that.nodes.close, 'click', that.toggleHandler);
        cm.addEvent(that.nodes.menu, 'click', that.toggleMenuHandler);
    };

    classProto.toggle = function(){
        var that = this;
        if(that.isVisible){
            that.hide();
        }else{
            that.show();
        }
    };

    classProto.toggleMenu = function(e){
        var that = this,
            target = cm.getEventTarget(e);
        if(target === that.nodes.menu){
            that.toggle();
        }
    };

    classProto.show = function(){
        var that = this;
        if(!that.isVisible && !that.isProcessing){
            that.isProcessing = true;
            // Start
            switch(that.params.view){
                case 'fullscreen':
                case 'sidebar-right':
                case 'sidebar-left':
                    cm.appendChild(that.nodes.menu, that.params.container);
                    break;
            }
            // Process
            that.nodes.menu.style.display = 'block';
            switch(that.params.view){
                case 'dropdown':
                case 'dropdown-overlap':
                    that.nodes.menu.style.height = '0px';
                    that.nodes.menu.style.overflow = 'hidden';
                    break;
            }
            cm.onSchedule(function(){
                cm.replaceClass(that.nodes.container, 'is-hide', 'is-show');
                cm.replaceClass(that.nodes.menu, 'is-hide', 'is-show');
                switch(that.params.view){
                    case 'dropdown':
                    case 'dropdown-overlap':
                        that.nodes.menu.style.height = that.nodes.menu.scrollHeight + 'px';
                        break;
                }
                cm.addEvent(that.nodes.menu, 'transitionend', function onTransitionEnd(){
                    cm.removeEvent(that.nodes.menu, 'transitionend', onTransitionEnd);
                    switch(that.params.view){
                        case 'dropdown':
                        case 'dropdown-overlap':
                            that.nodes.menu.style.height = 'auto';
                            that.nodes.menu.style.overflow = 'visible';
                            break;
                    }
                    that.isVisible = true;
                    that.isProcessing = false;
                    that.triggerEvent('onShow');
                });
            });
        }
    };

    classProto.hide = function(){
        var that = this;
        if(that.isVisible && !that.isProcessing){
            that.isProcessing = true;
            // Process
            switch(that.params.view){
                case 'dropdown':
                case 'dropdown-overlap':
                    that.nodes.menu.style.height = that.nodes.menu.scrollHeight + 'px';
                    that.nodes.menu.style.overflow = 'hidden';
                    break;
            }
            cm.onSchedule(function(){
                cm.replaceClass(that.nodes.container, 'is-show', 'is-hide');
                cm.replaceClass(that.nodes.menu, 'is-show', 'is-hide');
                switch(that.params.view){
                    case 'dropdown':
                    case 'dropdown-overlap':
                        that.nodes.menu.style.height = '0px';
                        break;
                }
                cm.addEvent(that.nodes.menu, 'transitionend', function onTransitionEnd(){
                    cm.removeEvent(that.nodes.menu, 'transitionend', onTransitionEnd);
                    that.nodes.menu.style.display = 'none';
                    switch(that.params.view){
                        case 'fullscreen':
                        case 'sidebar-right':
                        case 'sidebar-left':
                            cm.appendChild(that.nodes.menu, that.nodes.container);
                            break;
                    }
                    that.isVisible = false;
                    that.isProcessing = false;
                    that.triggerEvent('onHide');
                });
            });
        }
    };
});