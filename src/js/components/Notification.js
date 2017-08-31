cm.define('App.Notification', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true,
        'remember' : true
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Notification', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.isShow = null;
        that.isShowStorage = false;
        // Binds
        that.showHandler = that.show.bind(that);
        that.hideHandler = that.hide.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        // State
        that.isShow = cm.isClass(that.nodes['container'], 'is-show');
        // Check storage
        if(that.params['remember']){
            that.isShowStorage = that.storageRead('isShow');
            that.isShow = that.isShowStorage !== null ? that.isShowStorage : that.isShow;
        }
        // Trigger events
        if(that.isShow){
            that.show(true, true);
        }else{
            that.hide(true, true);
        }
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Events
        cm.addEvent(that.nodes['close'], 'click', function(){
            that.hide();
        });
    };

    /******* PUBLIC *******/

    classProto.show = function(isImmediately, force){
        var that = this;
        if(force || !cm.isBoolean(that.isShow) || !that.isShow){
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isShow', true);
            }
            // Immediately animate
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
            }
            // Show
            that.isShow = true;
            cm.replaceClass(that.nodes['container'], 'is-hide', 'is-show');
            // Immediately animate
            if(isImmediately){
                cm.removeClass(that.nodes['container'], 'is-immediately');
            }
        }
        return that;
    };

    classProto.hide = function(isImmediately, force){
        var that = this;
        if(force || !cm.isBoolean(that.isShow) || that.isShow){
            // Write storage
            if(that.params['remember']){
                that.storageWrite('isShow', false);
            }
            // Immediately animate
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately');
            }
            // Hide
            that.isShow = false;
            cm.replaceClass(that.nodes['container'], 'is-show', 'is-hide');
            // Immediately animate
            if(isImmediately){
                cm.removeClass(that.nodes['container'], 'is-immediately');
            }
        }
        return that;
    };

    classProto.toggle = function(){
        var that = this;
        if(that.isShow){
            that.hide();
        }else{
            that.show();
        }
        return that;
    };

});