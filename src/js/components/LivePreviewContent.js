cm.define('App.LivePreviewContent', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'name' : 'app-livepreview',
        'renderStructure' : true,
        'embedStructureOnRender' : false,
        'Com.Overlay' : {
            'removeOnClose' : true,
            'showSpinner' : true,
            'showContent' : false,
            'position' : 'absolute',
            'theme' : 'light'
        }
    }
},
function(params){
    var that = this;
    that.isPower = true;
    that.isPowerProcess = false;
    that.powerCount = 0;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.LivePreviewContent', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.devicePowerToggleHandler = that.devicePowerToggle.bind(that);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        that.renderLoaderView();
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Init Overlay
        cm.getConstructor('Com.Overlay', function(classConstructor, className){
            that.components['overlay'] = new classConstructor(
                cm.merge(that.params[className], {
                    'container' : that.nodes['deviceScreen']
                })
            );
        });
        // IFrame Load Event
        cm.addEvent(that.nodes['iframe'], 'load', function(){
            that.components['overlay'] && that.components['overlay'].close();
        });
        // Device
        cm.addEvent(that.nodes['devicePower'], 'mousedown', that.devicePowerToggleHandler);
        return that;
    };

    classProto.setView = function(type){
        var that = this;
        cm.removeClass(that.nodes['container'], 'is-desktop is-tablet is-mobile');
        cm.addClass(that.nodes['container'], ['is', type].join('-'));
        return that;
    };

    classProto.setTemplate = function(src){
        var that = this;
        that.components['overlay'] && that.components['overlay'].open();
        that.nodes['iframe'].src = src;
        return that;
    };

    classProto.renderLoaderView = function(){
        var that = this;
        // Render loader
        that.nodes['loader'] = {};
        that.nodes['loader']['container'] = cm.node('div', {'class' : 'device__loader is-hidden'},
            cm.node('div', {'class' : 'inner'},
                cm.node('div', {'class' : 'icon app-i__quicksilk'})
            )
        );
        // Render Blues
        that.nodes['blues'] = {};
        that.nodes['blues']['container'] = cm.node('div', {'class' : 'device__blues is-hidden'},
            cm.node('div', {'class' : 'inner'},
                cm.node('p', 'A problem has been detected and QuickSilk has been shut down to prevent damage to your device.'),
                cm.node('p', 'The problem seems to be caused by the following file: FAKEPOWERBUTTON.SYS'),
                cm.node('p', 'POWER_FAULT_IN_NONPOWERED_BUTTON'),
                cm.node('p', 'If this is the first time you\'ve seen this Stop error screen, restart your device. If this screen appears again, check to make sure you are not pressing power button.'),
                cm.node('p', 'Technical Information:'),
                cm.node('p', '*** START'),
                cm.node('p', '010101000110100001100101011100100110010100100000011000010111001001100101001000000110111001101111001000000100010101100001011100110111010001100101011100100010000001000101011001110110011101110011001000000111010101110000001000000110100001100101011100100110010100101100001000000110011101101111001000000110000101110111011000010111100100100001'),
                cm.node('p', '*** END')
            )
        );
        // Embed
        cm.appendChild(that.nodes['blues']['container'], that.nodes['deviceScreen']);
        cm.appendChild(that.nodes['loader']['container'], that.nodes['deviceScreen']);
        return that;
    };

    classProto.devicePowerToggle = function(){
        var that = this;
        if(!that.isPowerProcess){
            if(that.isPower){
                that.devicePowerOff();
            }else{
                that.devicePowerOn();
            }
        }
        return that;
    };

    classProto.devicePowerOff = function(){
        var that = this;
        that.isPower = false;
        that.isPowerProcess = true;
        cm.addClass(that.nodes['deviceContent'], 'is-hidden');
        cm.addClass(that.nodes['blues']['container'], 'is-hidden');
        setTimeout(function(){
            that.isPowerProcess = false;
        }, 500);
        return that;
    };

    classProto.devicePowerOn = function(){
        var that = this;
        that.powerCount++;
        that.isPower = true;
        that.isPowerProcess = true;
        if(that.powerCount == 1){
            that.devicePowerOnFailed();
        }else{
            that.devicePowerOnNormal();
        }
        return that;
    };

    classProto.devicePowerOnNormal = function(){
        var that = this;
        cm.replaceClass(that.nodes['deviceContent'], 'is-hidden', 'is-loading');
        cm.removeClass(that.nodes['loader']['container'], 'is-hidden');
        setTimeout(function(){
            cm.removeClass(that.nodes['deviceContent'], 'is-loading');
            cm.addClass(that.nodes['loader']['container'], 'is-loaded');
            setTimeout(function(){
                cm.replaceClass(that.nodes['loader']['container'] , 'is-loaded', 'is-hidden');
                setTimeout(function(){
                    that.isPowerProcess = false;
                }, 500);
            }, 500);
        }, 1500);
        return that;
    };

    classProto.devicePowerOnFailed = function(){
        var that = this;
        cm.replaceClass(that.nodes['blues']['container'], 'is-hidden', 'is-loading');
        cm.removeClass(that.nodes['loader']['container'], 'is-hidden');
        setTimeout(function(){
            cm.removeClass(that.nodes['blues']['container'], 'is-loading');
            cm.addClass(that.nodes['loader']['container'], 'is-loaded');
            setTimeout(function(){
                cm.replaceClass(that.nodes['loader']['container'] , 'is-loaded', 'is-hidden');
                setTimeout(function(){
                    that.isPowerProcess = false;
                }, 500);
            }, 500);
        }, 1500);
        return that;
    };
});