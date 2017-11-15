cm.define('App.Notification', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false,
        'controllerEvents' : true,
        'show' : 'inherit',                           // true | false | inherit
        'remember' : true,
        'rememberTime' : false
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
        // Binds
        that.showHandler = that.show.bind(that);
        that.hideHandler = that.hide.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this,
            isShowStorage,
            storageDate,
            isExpiredStorage;
        // Check inherit state
        that.isShow = that.params['show'] === 'inherit' ? cm.isClass(that.nodes['container'], 'is-show') : that.params['show'];
        // Check storage
        if(that.params['remember']){
            isShowStorage = that.storageRead('isShow');
            storageDate = that.storageRead('date');
            // Check state
            if(!cm.isUndefined(isShowStorage) && !cm.isUndefined(storageDate)){
                isExpiredStorage = that.params['rememberTime']? (Date.now() - parseInt(that.params['rememberTime']) > parseInt(storageDate)) : false;
                that.isShow = isExpiredStorage ? that.isShow : isShowStorage;
            }
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
                that.storageWrite('date', Date.now());
            }
            // Immediately animate
            if(isImmediately){
                cm.addClass(that.nodes['container'], 'is-immediately', true);
            }
            // Show
            that.isShow = true;
            cm.replaceClass(that.nodes['container'], 'is-hide', 'is-show');
            // Immediately animate
            if(isImmediately){
                setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                }, 5);
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
                that.storageWrite('date', Date.now());
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
                setTimeout(function(){
                    cm.removeClass(that.nodes['container'], 'is-immediately');
                }, 5);
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