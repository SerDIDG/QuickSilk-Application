cm.define('App.ModuleRolloverTabs', {
    modules: [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    events: [
        'onRenderStart',
        'onRender',
        'onTabShowStart',
        'onTabShow',
        'onTabHideStart',
        'onTabHide',
        'onEnableEditing',
        'onEnableEditable',
        'onDisableEditing',
        'onDisableEditable',
    ],
    params: {
        node: cm.Node('div'),
        name: '',
        event: 'hover',                          // hover | click
        stay: false,
        showEmptyTab: false,
        duration: 'cm._config.animDuration',
        delay: 'cm._config.hideDelay',
        width: 'auto',
        attachment: 'container',                 // container | screen
        expand: 'bottom',                        // top | bottom
        active: false,
        isEditing: false,
        customEvents: true,
        'Com.TabsetHelper': {}
    }
},
function(params) {
    const that = this;

    that.nodes = {
        container: cm.node('div'),
        inner: cm.node('div'),
        'menu-label': cm.node('div'),
        labels: [],
        options: [],
        tabs: []
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

    const init = function() {
        getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params.events);
        that.getDataNodes(that.params.node);
        that.getDataConfig(that.params.node);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params.node);
        that.triggerEvent('onRender');
    };

    const getLESSVariables = function() {
        that.params.duration = cm.getTransitionDurationFromLESS('AppMod-RolloverTabs-Duration', that.params.duration);
    };

    const validateParams = function() {
        that.params['Com.TabsetHelper'].node = that.nodes.inner;
        that.params['Com.TabsetHelper'].name = [that.params.name, 'tabset'].join('-');
        that.params['Com.TabsetHelper'].targetEvent = that.params.event;
    };

    const render = function() {
        // Classes
        cm.addClass(that.nodes.container, ['attachment', that.params.attachment].join('-'));
        cm.addClass(that.nodes.container, ['expand', that.params.expand].join('-'));

        // Process Tabset
        cm.getConstructor('Com.TabsetHelper', (classConstructor, className) => {
            that.components.tabset = new classConstructor(that.params[className])
            processTabset();
        });

        // Tabs
        processTabs();

        // Mobile menu
        processMenu();

        // Set target events
        setTargetEvents();

        // Add custom event
        if (that.params.customEvents) {
            cm.customEvent.add(that.params.node, 'destruct', () => that.destruct());
            cm.customEvent.add(that.params.node, 'redraw', () => that.redraw());
            cm.customEvent.add(that.params.node, 'enableEditable', () => that.enableEditing());
            cm.customEvent.add(that.params.node, 'disableEditable', () => that.disableEditing());
        }

        // Set
        if (that.params.active) {
            that.components.tabset.set(that.params.active);
        }

        // Editing
        that.params.isEditing && that.enableEditing();
    };

    const processTabset = function() {
        that.components.tabset
            .addEvent('onTabHideEnd', (tabset, item) => {
                that.triggerEvent('onTabHide', item);
            })
            .addEvent('onTabChangeStart', (tabset, item) => {
                // If not in editing and tab does not contain any blocks, do not show it
                if (!that.params.showEmptyTab && !that.isEditing && that.components.tabset.isTabEmpty(item.id)) {
                    hide(item);
                } else {
                    show(item);
                }

                // Container
                if (!that.isProcessing) {
                    that.nodes['content-list'].style.overflow = 'hidden';
                    that.nodes['content-list'].style.height = that.nodes['content-list'].offsetHeight + 'px';
                }
                that.isProcessing = true;
                that.changeInterval && clearTimeout(that.changeInterval);
                that.changeInterval = setTimeout(() => {
                    that.isProcessing = false;
                    that.nodes['content-list'].style.height = 'auto';
                    that.nodes['content-list'].style.overflow = 'visible';
                }, that.params.duration);
            })
            .addEvent('onTabShowEnd', function(tabset, item) {
                that.nodes['content-list'].style.height = item.tab.container.offsetHeight + 'px';
                that.nodes['menu-label'].innerHTML = item.title;
                that.triggerEvent('onTabShow', item);
            })
            .processTabs(that.nodes.tabs, that.nodes.labels);
    };

    const processTabs = function() {
        that.tabs = that.components.tabset.getTabs();
        cm.forEach(that.tabs, (item) => cm.click.add(item.label.link, (e) => {
            if (
                that.isEditing ||
                (that.params.event === 'click' && that.components.tabset.get() !== item.id)
            ) {
                cm.preventDefault(e);
            }
        }));
    };

    /*** MOBILE MENU ***/

    const processMenu = function() {
        // Button
        cm.addEvent(that.nodes['menu-icon'], 'click', toggleMenu);

        // Items
        cm.forEach(that.nodes.options, processMenuItem);
    };

    const processMenuItem = function(nodes) {
        const item = cm.merge({
            id: '',
            nodes: nodes
        }, that.getNodeDataConfig(nodes.container));

        cm.addEvent(nodes.container, 'click', (e) => {
            if (that.components.tabset.get() !== item.id) {
                cm.preventDefault(e);
                that.components.tabset.set(item.id);
                hideMenu();
                show();
            }
        });

        that.options.push(item);
    };

    const toggleMenu = function() {
        if (that.isMenuShow) {
            hideMenu();
        } else {
            showMenu();
        }
    };

    const hideMenu = function() {
        that.isMenuShow = false;
        cm.removeClass(that.nodes['menu-inner'], 'active');
    };

    const showMenu = function() {
        that.isMenuShow = true;
        cm.addClass(that.nodes['menu-inner'], 'active');
    };

    /*** EVENTS ***/

    const setTargetEvents = function() {
        if (that.params.event === 'hover') {
            cm.addEvent(that.nodes.container, 'mouseover', mouseOverEvent);
        }
        if (!that.params.stay) {
            cm.addEvent(that.nodes.container, 'mouseout', mouseOutEvent);
            cm.addEvent(window, 'click', clickOutEvent);
        }
    };

    const removeTargetEvents = function() {
        if (that.params.event === 'hover') {
            cm.removeEvent(that.nodes.container, 'mouseover', mouseOverEvent);
        }
        if (!that.params.stay) {
            cm.removeEvent(that.nodes.container, 'mouseout', mouseOutEvent);
            cm.removeEvent(window, 'click', clickOutEvent);
        }
    };

    const hide = function(item) {
        item = item || that.components.tabset.getCurrentTab();
        that.hideInterval && clearTimeout(that.hideInterval);
        that.hideInterval = setTimeout(() => {
            that.resizeInterval && clearInterval(that.resizeInterval);
            that.triggerEvent('onTabHideStart', item);
            cm.removeClass(that.nodes.content, 'is-show');
            that.nodes['menu-label'].innerHTML = '';
            that.components.tabset.unsetHead();
            that.hideInterval = setTimeout(() => {
                that.components.tabset.unset();
            }, that.params.delay);
        }, that.params.delay);
    };

    const show = function(item) {
        item = item || that.components.tabset.getCurrentTab();
        if (item && (that.params.showEmptyTab || that.isEditing || !that.components.tabset.isTabEmpty(item.id))) {
            that.triggerEvent('onTabShowStart', item);

            // Set position
            that.redraw();

            // Show
            that.hideInterval && clearTimeout(that.hideInterval);
            cm.addClass(that.nodes.content, 'is-show', true);
        }
    };

    const mouseOverEvent = function() {
        show();
    };

    const mouseOutEvent = function(e) {
        const target = cm.getRelatedTarget(e);
        if (!cm.isParent(that.nodes.container, target, true)) {
            !that.isEditing && hide();
        } else {
            show();
        }
    };

    const clickOutEvent = function(e) {
        const target = cm.getEventTarget(e);
        if (!cm.isParent(that.nodes.container, target, true)) {
            hideMenu();
            !that.isEditing && hide();
        } else {
            show();
        }
    };

    const contentResizeHandler = function() {
        that.previousPosition = cm.clone(that.currentPosition);
        that.currentPosition = cm.getRect(that.nodes.container);

        // Variables
        const isSameTop = that.previousPosition && that.previousPosition.top === that.currentPosition.top;
        const isSameBottom = that.previousPosition && that.previousPosition.bottom === that.currentPosition.bottom;
        const isSameWidth = that.previousPosition && that.previousPosition.width === that.currentPosition.width;

        // Set Content Min Width
        if (!isSameWidth) {
            switch (that.params.attachment) {
                case 'screen':
                    that.nodes.content.style.minWidth = Math.min(that.params.width, that.currentPosition.width) + 'px';
                    break;
                case 'container':
                    that.nodes.content.style.minWidth = that.currentPosition.width + 'px';
                    break;
            }
        }

        // Set Content Position
        if (!isSameTop || !isSameBottom) {
            const pageSize = cm.getPageSize();
            switch (that.params.expand) {
                case 'top':
                    that.nodes.content.style.top = 'auto';
                    that.nodes.content.style.bottom = pageSize.winHeight - that.currentPosition.top + 'px';
                    break;
                case 'bottom':
                    that.nodes.content.style.top = that.currentPosition.bottom + 'px';
                    that.nodes.content.style.bottom = 'auto';
                    break;
            }
        }
    };

    /******* PUBLIC *******/

    that.enableEditing = function() {
        if (!cm.isBoolean(that.isEditing) || !that.isEditing) {
            that.isEditing = true;
            cm.replaceClass(that.params.node, 'is-not-editing', 'is-editing is-editable');
            that.components.tabset.setByIndex(0);
            show();
            that.triggerEvent('onEnableEditing');
            that.triggerEvent('onEnableEditable');
        }
        return that;
    };

    that.disableEditing = function() {
        if (!cm.isBoolean(that.isEditing) || that.isEditing) {
            that.isEditing = false;
            cm.replaceClass(that.params.node, 'is-editing is-editable', 'is-not-editing');
            hide();
            that.triggerEvent('onDisableEditing');
            that.triggerEvent('onDisableEditable');
        }
        return that;
    };

    that.destruct = function() {
        if (!that.isDestructed) {
            that.isDestructed = true;
            removeTargetEvents();
            that.removeFromStack();
            cm.remove(that.nodes.container);
        }
        return that;
    };

    that.redraw = function() {
        that.resizeInterval && clearInterval(that.resizeInterval);
        switch (that.params.attachment) {
            case 'screen':
                if (that.isEditing) {
                    that.previousPosition = null;
                    that.currentPosition = null;
                    that.nodes.content.style.maxWidth = '';
                    that.nodes.content.style.minWidth = '';
                    that.nodes.content.style.top = '';
                    that.nodes.content.style.bottom = '';
                } else {
                    that.previousPosition = null;
                    that.currentPosition = null;
                    that.nodes.content.style.maxWidth = that.params.width;
                    contentResizeHandler();
                    that.resizeInterval = setInterval(contentResizeHandler, 5);
                }
                break;
        }
        return that;
    };

    that.getNodes = function(key){
        return that.nodes[key] || that.nodes;
    };

    init();
});