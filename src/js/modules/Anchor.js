cm.define('Module.Anchor', {
    'extend' : 'App.AbstractModule',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'duration' : 'cm._config.animDuration',
        'scroll' : 'document.body',
        'topMenuName' : 'app-topmenu',
        'templateName' : 'app-template'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModule.apply(that, arguments);
});

cm.getConstructor('Module.Anchor', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Variables
        that.isActive = false;
        that.topMenuParams = {};
        that.templateParams = {};
        // Bind context to methods
        that.onHashChangeHandler = that.onHashChange.bind(that);
        that.onConstructEndHandler = that.onConstructEnd.bind(that);
        that.onDestructProcessHandler = that.onDestructProcess.bind(that);
        that.onRedrawHandler = that.onRedraw.bind(that);
        // Add events
        that.addEvent('onConstructEnd', that.onConstructEndHandler);
        that.addEvent('onDestructProcess', that.onDestructProcessHandler);
        that.addEvent('onRedraw', that.onRedrawHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.onConstructEnd = function(){
        var that = this;
        that.prepareHash({
            'immediately' : true,
            'force' : true
        });
        return that;
    };

    classProto.onDestructProcess = function(){
        var that = this;
        // Remove location hash change handler
        cm.removeEvent(window, 'hashchange', that.onHashChangeHandler);
        // Remove current hash if it equal to anchor name
        that.clearHash();
        return that;
    };

    classProto.onRedraw = function(){
        var that = this;
        that.prepareHash({
            'immediately' : true,
            'force' : true
        });
        return that;
    };

    classProto.onHashChange = function(e){
        var that = this;
        if(that.isHashActive()){
            cm.preventDefault(e);
        }
        that.prepareHash({
            'immediately' : false,
            'force' : false
        });
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Get TopMenu
        new cm.Finder('App.TopMenu', that.params['topMenuName'], null, function(classObject){
            that.components['topMenu'] = classObject;
            that.topMenuParams = that.components['topMenu'].getParams();
        });
        // Get Template
        new cm.Finder('App.Template', that.params['templateName'], null, function(classObject){
            that.components['template'] = classObject;
            that.templateParams = that.components['template'].getParams();
        });
        // Init animation handler
        that.components['animation'] = new cm.Animation(that.params['scroll']);
        // Add location hash change handler
        cm.addEvent(window, 'hashchange', that.onHashChangeHandler);
        return that;
    };

    classProto.prepareHash = function(params){
        var that = this;
        // Configure
        params = cm.merge({
            'immediately' : false,
            'force' : false
        }, params);
        // Check hash state
        if(that.isHashActive()){
            if(!that.isActive || params['force']){
                that.isActive = true;
                that.processHash(params);
            }
        }else{
            that.isActive = false;
        }
        return that;
    };

    classProto.processHash = function(params){
        var that = this,
            styles = {},
            top = 0;
        // Prepare
        top = cm.getY(that.params['node']);
        // Add top menu gape
        if(that.components['topMenu']){
            top -= that.components['topMenu'].getDimensions('height');
        }
        // Add template's fixed header gape
        if(that.components['template'] && that.templateParams['header']['fixed']){
            top -= that.components['template'].getHeaderDimensions('height');
        }
        // Set safe values
        top = Math.max(top, 0);
        top = Math.min(top, cm._pageSize['scrollHeight']);
        // Move scroll
        if(params['immediately']){
            cm.setScrollTop(that.params['scroll'], top);
        }else{
            // Scroll style
            if(that.params['scroll'] == document.body){
                styles = {'docScrollTop' : top};
            }else{
                styles = {'scrollTop' : top};
            }
            // Go
            that.components['animation'].go({'style' : styles, 'anim' : 'smooth', 'duration' : that.params['duration']});
        }
        return that;
    };

    classProto.clearHash = function(){
        var that = this,
            url;
        if(that.isHashActive()){
            url = window.location.href.replace(/(#.*)$/, '');
            window.history.replaceState(null, null, url);
        }
        return that;
    };

    classProto.isHashActive = function(){
        var that = this,
            hash = window.location.hash.replace(/^#/, '');
        return that.params['name'] === hash;
    };
});