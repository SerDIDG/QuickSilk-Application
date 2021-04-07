cm.define('Mod.ElementReCaptcha', {
    'extend' : 'App.AbstractModuleElement',
    'params' : {
        'memorable' : false,
        'validate' : false,
        'sitekey' : null
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.AbstractModuleElement.apply(that, arguments);
});

cm.getConstructor('Mod.ElementReCaptcha', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.value = '';
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // Init recaptcha
        that.nodes['input'] = that.nodes['field'].querySelector('.g-recaptcha');
        that.params['sitekey'] = that.nodes['input'].getAttribute('data-sitekey');
        /*
        if('grecaptcha' in window){
            that.setCaptchaComponent(window.grecaptcha);
        }
        */
    };

    classProto.set = function(value){
        var that = this;
        that.value = value;
        return that;
    };

    classProto.get = function(){
        var that = this,
            value;
        if(that.components['captcha']){
            value = that.components['captcha'].getResponse(that._widgetId);
        }else{
            value = that.value;
        }
        return value;
    };

    classProto.setCaptchaComponent = function(recaptcha){
        var that = this;
        if(typeof recaptcha !== 'undefined'){
            that.components['captcha'] = recaptcha;
            that.components['captcha'].ready(function(){
                try{
                    that._widgetId = that.components['captcha'].render(that.nodes['input'], {'sitekey': that.params['sitekey']});
                }catch(e){
                    cm.errorLog({
                        'name' : that._name['full'],
                        'type' : 'attention',
                        'message' : e
                    });
                }
            });
        }
        return that;
    };
});
