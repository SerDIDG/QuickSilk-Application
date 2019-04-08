cm.define('App.ShutterstockOptimize', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'controllerEvents' : true,
        'item' : {},
        'formConstructor' : 'Com.Form',
        'formParams' : {
            'embedStructure' : 'append',
            'validate' : false,
            'renderButtons' : false,
            'renderButtonsSeparator' : false
        }
    },
    'strings' : {
        'help' :
            '<ul>' +
                '<li>Shutterstock images are too large to be uploaded to your website in their default size. Doing so will slow down the load time of your web page.</li>' +
                '<li>You can re-size the image width and height using the fields below, in order to optimize the image for your web page.</li>' +
                '<li>1600-2000px width is good for the images that are used as backgrounds, or header images.</li>' +
                '<li>600-1000px width will work fine for the images that are used in the content.</li>' +
                '<li>The width/height aspect ratio is locked, so your image will not distort after resizing.</li>' +
            '</ul>',
        'form' : {
            'width' : 'Width:',
            'height' : 'Height:'
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct in current context
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.ShutterstockOptimize', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        that.item = null;
        that.aspect = null;
        // Binds
        that.setWidthHandler = that.setWidth.bind(that);
        that.setHeightHandler = that.setHeight.bind(that);
        that.changeInputsHandler = that.changeInputs.bind(that);
    };

    classProto.onConstructEnd = function(){
        var that = this;
        that.set(that.params['item']);
    };

    classProto.renderView = function(){
        var that = this;
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__shutterstock-optimize'});
        // Hint
        that.nodes['help'] = cm.node('div', {'class' : 'pt__listing-clear', 'innerHTML' : that.lang('help')});
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);
        // Render form
        cm.getConstructor(that.params['formConstructor'], function(classConstructor){
            that.components['form'] = new classConstructor(
                cm.merge(that.params['formParams'], {
                    'container' : that.nodes['container']
                })
            );
            that.renderFormFields();
        });
    };

    classProto.renderFormFields = function(){
        var that = this;
        // Add Fields
        that.components['form']
            .appendChild(that.nodes['help'])
            .add('indent', {
                'name' : 'width',
                'label' : that.lang('form.width'),
                'maxLength' : 9,
                'defaultValue' : 0,
                'constructorParams' : {
                    'events' : {
                        'onInput' : that.setWidthHandler,
                        'onChange' : that.changeInputsHandler
                    }
                }
            })
            .add('indent', {
                'name' : 'height',
                'label' : that.lang('form.height'),
                'maxLength' : 9,
                'defaultValue' : 0,
                'constructorParams' : {
                    'events' : {
                        'onInput' : that.setHeightHandler,
                        'onChange' : that.changeInputsHandler
                    }
                }
            });
    };

    classProto.setWidth = function(){
        var that = this,
            widthField = that.components['form'].getField('width'),
            heightField = that.components['form'].getField('height'),
            width = widthField.fieldController.getRaw(),
            height = Math.round(parseFloat(width) / that.aspect);
        if(that.aspect){
            heightField.fieldController.set(height, false);
        }
    };

    classProto.setHeight = function(){
        var that = this,
            heightField = that.components['form'].getField('height'),
            widthField = that.components['form'].getField('width'),
            height = heightField.fieldController.getRaw(),
            width = Math.round(parseFloat(height) * that.aspect);
        if(that.aspect){
            widthField.fieldController.set(width, false);
        }
    };

    classProto.changeInputs = function(){
        var that = this,
            widthField = that.components['form'].getField('width'),
            heightField = that.components['form'].getField('height'),
            width = widthField.fieldController.getRaw(),
            height = heightField.fieldController.getRaw();
        if(!width || width === '0px'){
            widthField.fieldController.set(that.item['width'], false);
        }
        if(!height || height === '0px'){
            heightField.fieldController.set(that.item['height'], false);
        }
    };

    /******* PUBLIC *******/

    classProto.set = function(item){
        var that = this;
        that.item = item;
        that.aspect = that.item['width'] / that.item['height'];
        that.components['form'].set(that.item, false);
    };

    classProto.get = function(){
        var that = this;
        return that.components['form'].get();
    };
});