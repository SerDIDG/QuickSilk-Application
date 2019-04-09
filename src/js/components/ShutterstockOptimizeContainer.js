cm.define('App.ShutterstockOptimizeContainer', {
    'extend' : 'Com.AbstractContainer',
    'events' : [
        'onComplete',
        'onCancel'
    ],
    'params' : {
        'item' : {},
        'constructor' : 'App.ShutterstockOptimize',
        'params' : {
            'embedStructure' : 'append'
        },
        'placeholder' : true,
        'placeholderConstructor' : 'Com.DialogContainer',
        'placeholderParams' : {
            'renderButtons' : true,
            'renderHelp' : true,
            'params' : {
                'width' : 500
            }
        }
    },
    'strings' : {
        'title' : 'Select Image Size',
        'close' : 'Cancel',
        'save' : 'Select',
        'help' :
            '<div class="pt__listing-clear">' +
                '<ul>' +
                    '<li>Shutterstock images are too large to be uploaded to your website in their default size. Doing so will slow down the load time of your web page.</li>' +
                    '<li>You can re-size the image width and height using the fields below, in order to optimize the image for your web page.</li>' +
                    '<li>1600-2000px width is good for the images that are used as backgrounds, or header images.</li>' +
                    '<li>600-1000px width will work fine for the images that are used in the content.</li>' +
                    '<li>The width/height aspect ratio is locked, so your image will not distort after resizing.</li>' +
                '</ul>' +
            '</div>',
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractContainer.apply(that, arguments);
});

cm.getConstructor('App.ShutterstockOptimizeContainer', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Variables
        that.state = 'initial';
        // Bind context to methods
        that.completeHandler = that.complete.bind(that);
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.renderPlaceholderButtons = function(){
        var that = this;
        that.components['placeholder'].addButton({
            'name' : 'close',
            'label' : that.lang('close'),
            'style' : 'button-transparent',
            'callback' : that.closeHandler
        });
        that.components['placeholder'].addButton({
            'name' : 'save',
            'label' : that.lang('save'),
            'style' : 'button-primary',
            'callback' : that.completeHandler
        });
    };

    /******* PUBLIC *******/

    classProto.set = function(item){
        var that = this;
        that.params['params']['item'] = item;
        if(that.components['controller']){
            that.components['controller'].set(item);
        }
        return that;
    };

    classProto.get = function(){
        var that = this;
        return that.components['controller'] && that.components['controller'].get && that.components['controller'].get();
    };

    classProto.complete = function(){
        var that = this;
        that.state = 'complete';
        that.triggerEvent('onComplete', that.get());
        that.close();
        return that;
    };
});