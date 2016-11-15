cm.define('App.FontInput', {
    'extend' : 'Com.AbstractInput',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'embedStructure' : 'replace',
        'className' : 'app__file-input',
        'styles' : {
            'font-family' : [
                "Arial, Helvetica, sans-serif",
                "Arial Black, Gadget, sans-serif",
                "Courier New, Courier, monospace",
                "Georgia, serif",
                "Impact, Charcoal, sans-serif",
                "Lucida Console, Monaco, monospace",
                "Lucida Sans Unicode, Lucida Grande, sans-serif",
                "Palatino Linotype, Book Antiqua, Palatino, serif",
                "Tahoma, Geneva, sans-serif",
                "Times New Roman, Times, serif",
                "Trebuchet MS, Helvetica, sans-serif",
                "Verdana, Geneva, sans-serif"
            ],
            'line-height' : [8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 108, 120],
            'font-size' : [8, 9, 10, 11, 12, 13, 14, 18, 20, 22, 24, 28, 32, 36, 42, 48, 54, 60, 72, 96],
            'font-weight' : [100, 200, 300, 400, 500, 600, 700, 800, 900],
            'font-style' : ['normal', 'italic'],
            'text-decoration' : ['none', 'underline']
        },
        'styleBinds' : {
            'font-weight' : {
                'normal' : 400,
                'bold' : 700
            }
        },
        'controls' : {
            'font-family' : true,
            'line-height' : true,
            'font-size' : true,
            'font-weight' : true,
            'font-style' : true,
            'text-decoration' : true,
            'color' : true,
            'background' : true
        },
        'showResetButtons' : true,
        'overrideControls' : true,
        'previewTag' : 'div',
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'top' : 'targetHeight + 6',
            'left' : '-6',
            'className' : 'app__stylizer-tooltip'
        },
        'Com.Select' : {
            'renderInBody' : false
        },
        'Com.ColorPicker' : {
            'renderInBody' : false,
            'showLabel' : false,
            'showClearButton' : false
        },
        'langs' : {
            '100' : 'Thin',
            '200' : 'Extra Light',
            '300' : 'Light',
            '400' : 'Regular',
            '500' : 'Medium',
            '600' : 'Semi Bold',
            '700' : 'Bold',
            '800' : 'Extra Bold',
            '900' : 'Black'
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractInput.apply(that, arguments);
});

cm.getConstructor('App.FontInput', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Variables
        that.previousRawValue = null;
        that.rawValue = null;
        // Bind context to methods
        that.validateParamsEndHandler = that.validateParamsEnd.bind(that);
        // Add events
        that.addEvent('onValidateParamsEnd', that.validateParamsEndHandler);
        // Call parent method - renderViewModel
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    /* *** PARAMS *** */

    classProto.validateParamsEnd = function(){
        var that = this;
        // Validate config
        that.validateItemConfig(that.params['value']);
        that.validateItemConfig(that.params['defaultValue']);
        // Extend global styles config
        that.extendGlobalConfig(that.params['value']);
        that.extendGlobalConfig(that.params['defaultValue']);
        that.sortGlobalConfig();
        // Override controls
        if(that.params['overrideControls']){
            cm.forEach(that.params['controls'], function(item, key){
                that.params['controls'][key] = !!(that.params['defaultValue'][key] || that.params['value'][key]);
            });
        }
        return that;
    };

    classProto.validateItemConfig = function(config){
        var that = this;
        if(config['line-height']){
            if(config['line-height'] != 'normal'){
                config['line-height'] = parseInt(config['line-height']);
            }
        }
        if(config['font-size']){
            config['font-size'] = parseInt(config['font-size']);
        }
        if(config['font-weight']){
            if(that.params['styleBinds']['font-weight'][config['font-weight']]){
                config['font-weight'] = that.params['styleBinds']['font-weight'][config['font-weight']];
            }
            config['font-weight'] = parseInt(config['font-weight']);
            config['font-weight'] = cm.inArray(that.params['styles']['font-weight'], config['font-weight'])? config['font-weight'] : 400;
        }
        if(config['font-style']){
            config['font-style'] = cm.inArray(that.params['styles']['font-style'], config['font-style'])? config['font-style'] : 'normal';
        }
        if(config['text-decoration']){
            config['text-decoration'] = cm.inArray(that.params['styles']['text-decoration'], config['text-decoration'])? config['text-decoration'] : 'none';
        }
        return config;
    };

    classProto.extendGlobalConfig = function(config){
        var that = this;
        if(config['font-size'] && !cm.inArray(that.params['styles']['font-size'], config['font-size'])){
            that.params['styles']['font-size'].push(config['font-size']);
        }
        if(config['line-height'] && !cm.inArray(that.params['styles']['line-height'], config['line-height'])){
            that.params['styles']['line-height'].push(config['line-height']);
        }
        if(config['font-family'] && !cm.inArray(that.params['styles']['font-family'], config['font-family'])){
            that.params['styles']['font-family'].push(config['font-family']);
        }
        return config;
    };

    classProto.sortGlobalConfig = function(){
        var that = this;
        that.params['styles']['font-size'].sort(function(a, b){
            return a - b;
        });
        that.params['styles']['line-height'].sort(function(a, b){
            if(a == 'normal'){
                return -1;
            }else if(b == 'normal'){
                return 1;
            }
            return a - b;
        });
        that.params['styles']['font-family'].sort(function(a, b){
            var t1 = a.toLowerCase().replace(/["']/g, ''),
                t2 = b.toLowerCase().replace(/["']/g, '');
            return (t1 < t2)? -1 : ((t1 > t2)? 1 : 0);
        });
        return that;
    };

    /* *** VIEW - VIEW MODEL *** */

    classProto.renderContent = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['container'] = cm.node('div', {'class' : 'app__stylizer__item'},
            nodes['preview'] = cm.node(that.params['previewTag'], {'class' : 'item-preview', 'innerHTML' : that.params['placeholder']})
        );
        cm.addClass(nodes['preview'], that.params['previewClassName']);
        // Render tooltip structure view
        that.renderTooltipView();
        // Push
        that.nodes['component'] = nodes;
        return nodes['container'];
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Render Tooltip
        that.renderTooltipControls();
        // Init Tooltip
        cm.getConstructor('Com.Tooltip', function(classConstructor, className){
            that.components['tooltip'] = new classConstructor(
                cm.merge(that.params[className], {
                    'content' : that.nodes['tooltip']['container'],
                    'target' : that.nodes['component']['container'],
                    'events' : {
                        'onShowStart' : function(){
                            cm.addClass(that.nodes['component']['container'], 'active')
                        },
                        'onHideStart' : function(){
                            cm.removeClass(that.nodes['component']['container'], 'active')
                        }
                    }
                })
            );
        });
        return that;
    };

    /* *** TOOLTIP VIEW - VIEW MODEL *** */

    classProto.renderTooltipView = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['container'] = cm.node('div', {'class' : 'pt__toolbar'},
            nodes['inner'] = cm.node('div', {'class' : 'inner'},
                nodes['group1'] = cm.node('ul', {'class' : 'group'}),
                nodes['group2'] = cm.node('ul', {'class' : 'group'}),
                nodes['group3'] = cm.node('ul', {'class' : 'group'}),
                nodes['group4'] = cm.node('ul', {'class' : 'group'})
            )
        );
        // Push
        that.nodes['tooltip'] = nodes;
        return nodes['container'];
    };

    classProto.renderTooltipControls = function(){
        var that = this;
        // Font-Family
        if(that.params['controls']['font-family']){
            that.renderFontFamilyControl();
        }
        // Font-Weight
        if(that.params['controls']['font-weight']){
            that.renderFontWeightControl();
        }
        // Font-Style
        if(that.params['controls']['font-style']){
            that.renderFontStyleControl();
        }
        // Text-Decoration
        if(that.params['controls']['text-decoration']){
            that.renderTextDecorationControl();
        }
        // Font-Size
        if(that.params['controls']['font-size']){
            that.renderFontSizeControl();
        }
        // Line-Height
        if(that.params['controls']['line-height']){
            that.renderLineHeightControl();
        }
        // Color
        if(that.params['controls']['color']){
            that.renderColorControl();
        }
        // Background
        if(that.params['controls']['background']){
            that.renderBackgroundControl();
        }
        // Reset
        if(that.params['showResetButtons']){
            that.renderResetControl();
        }else{
            cm.remove(that.nodes['tooltip']['group4']);
        }
    };

    classProto.renderFontFamilyControl = function(){
        var that = this;
        // Structure
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select medium'},
                that.nodes['tooltip']['font-family'] = cm.node('select', {'title' : that.lang('Font')})
            )
        );
        cm.forEach(that.params['styles']['font-family'], function(item){
            that.nodes['tooltip']['font-family'].appendChild(
                cm.node('option', {'value' : item, 'style' : {'font-family' : item}}, item.replace(/["']/g, '').split(',')[0])
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['font-family'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['font-family'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'font-family' : value}), true);
                        }
                    }
                })
            );
        });
        return that;
    };

    classProto.renderFontWeightControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group1'].appendChild(
            that.nodes['tooltip']['font-weight-button'] = cm.node('li', {'class' : 'button button-secondary is-icon'},
                cm.node('span', {'class' : 'icon toolbar bold'})
            )
        );
        cm.addEvent(that.nodes['tooltip']['font-weight-button'], 'click', function(){
            that.set(cm.merge(that.value, {'font-weight' : (that.value['font-weight'] > 400? 400 : 700)}), true);
        });
        // Select
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select medium'},
                that.nodes['tooltip']['font-weight'] = cm.node('select', {'title' : that.lang('Weight')})
            )
        );
        cm.forEach(that.params['styles']['font-weight'], function(item){
            that.nodes['tooltip']['font-weight'].appendChild(
                cm.node('option', {'value' : item}, that.lang(item))
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['font-weight'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['font-weight'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'font-weight' : value}), true);
                        }
                    }
                })
            );
        });
        return that;
    };

    classProto.renderFontStyleControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group1'].appendChild(
            that.nodes['tooltip']['font-style-button'] = cm.node('li', {'class' : 'button button-secondary is-icon'},
                cm.node('span', {'class' : 'icon toolbar italic'})
            )
        );
        cm.addEvent(that.nodes['tooltip']['font-style-button'], 'click', function(){
            that.set(cm.merge(that.value, {'font-style' : (that.value['font-style'] == 'italic'? 'normal' : 'italic')}), true);
        });
        return that;
    };

    classProto.renderTextDecorationControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group1'].appendChild(
            that.nodes['tooltip']['text-decoration-button'] = cm.node('li', {'class' : 'button button-secondary is-icon'},
                cm.node('span', {'class' : 'icon toolbar underline'})
            )
        );
        cm.addEvent(that.nodes['tooltip']['text-decoration-button'], 'click', function(){
            that.set(cm.merge(that.value, {'text-decoration' : (that.value['text-decoration'] == 'underline'? 'none' : 'underline')}), true);
        });
    };

    classProto.renderFontSizeControl = function(){
        var that = this;
        // Select
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select x-small'},
                that.nodes['tooltip']['font-size'] = cm.node('select', {'title' : that.lang('Size')})
            )
        );
        cm.forEach(that.params['styles']['font-size'], function(item){
            that.nodes['tooltip']['font-size'].appendChild(
                cm.node('option', {'value' : item}, item)
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['font-size'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['font-size'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'font-size' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderLineHeightControl = function(){
        var that = this;
        // Select
        that.nodes['tooltip']['group2'].appendChild(
            cm.node('li', {'class' : 'is-select x-small'},
                that.nodes['tooltip']['line-height'] = cm.node('select', {'title' : that.lang('Leading')})
            )
        );
        cm.forEach(that.params['styles']['line-height'], function(item){
            that.nodes['tooltip']['line-height'].appendChild(
                cm.node('option', {'value' : item}, (item == 'normal'? that.lang('auto') : item))
            );
        });
        // Component
        cm.getConstructor('Com.Select', function(classConstructor, className){
            that.components['line-height'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['line-height'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'line-height' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderColorControl = function(){
        var that = this;
        // Structure
        that.nodes['tooltip']['group3'].appendChild(
            cm.node('li', {'class' : 'is-select size-field'},
                that.nodes['tooltip']['color'] = cm.node('input', {'type' : 'text', 'title' : that.lang('Color')})
            )
        );
        // Component
        cm.getConstructor('Com.ColorPicker', function(classConstructor, className){
            that.components['color'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['color'],
                    'defaultValue' : that.params['defaultValue']['color'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'color' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderBackgroundControl = function(){
        var that = this;
        // Structure
        that.nodes['tooltip']['group3'].appendChild(
            cm.node('li', {'class' : 'is-select size-field'},
                that.nodes['tooltip']['background'] = cm.node('input', {'type' : 'text', 'title' : that.lang('Background')})
            )
        );
        // Component
        cm.getConstructor('Com.ColorPicker', function(classConstructor, className){
            that.components['background'] = new classConstructor(
                cm.merge(that.params[className], {
                    'node' : that.nodes['tooltip']['background'],
                    'defaultValue' : that.params['defaultValue']['background'],
                    'events' : {
                        'onChange' : function(my, value){
                            that.set(cm.merge(that.value, {'background' : value}), true);
                        }
                    }
                })
            );
        });
    };

    classProto.renderResetControl = function(){
        var that = this;
        // Button
        that.nodes['tooltip']['group4'].appendChild(
            cm.node('li',
                that.nodes['tooltip']['reset-button'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('Reset'))
            )
        );
        cm.addEvent(that.nodes['tooltip']['reset-button'], 'click', function(){
            that.clear(true);
        });
    };

    /* *** DATA VALUE *** */

    classProto.validateValue = function(value){
        var that = this;
        // Validate
        value = cm.isObject(value)? that.validateItemConfig(value) : that.params['defaultValue'];
        value['_type'] = 'font';
        // Prepare value for safe
        return value;
    };

    classProto.saveValue = function(value){
        var that = this;
        // Process
        that.previousRawValue = cm.clone(that.rawValue);
        that.rawValue = cm.clone(value);
        that.previousValue = cm.clone(that.value);
        that.value = cm.clone(value);
        // Process safe value
        cm.forEach(that.value, function(value, key){
            switch(key){
                case 'font-size':
                    that.value[key] = cm.isNumber(value) || /^\d+$/.test(value) ? (value + 'px') : value;
                    break;
                case 'line-height':
                    that.value[key] = cm.isNumber(value) || /^\d+$/.test(value) ? (value + 'px') : value;
                    break;
            }
        });
        // Set hidden input
        if(that.params['setHiddenInput']){
            if(!cm.isEmpty(value)){
                that.nodes['hidden'].value = JSON.stringify(that.value);
            }else{
                that.nodes['hidden'].value = ''
            }
        }
        return that;
    };

    classProto.setData = function(){
        var that = this;
        // Set components
        cm.forEach(that.rawValue, function(value, key){
            if(that.components[key]){
                that.components[key].set(value, false);
            }
            // Set buttons
            switch(key){
                case 'font-weight':
                    if(value > 400){
                        cm.addClass(that.nodes['tooltip']['font-weight-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-weight-button'], 'active');
                    }
                    break;
                case 'text-decoration':
                    if(value == 'underline'){
                        cm.addClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['text-decoration-button'], 'active');
                    }
                    break;
                case 'font-style':
                    if(value == 'italic'){
                        cm.addClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }else{
                        cm.removeClass(that.nodes['tooltip']['font-style-button'], 'active');
                    }
                    break;
            }
            // Set preview
            that.nodes['component']['preview'].style[cm.styleStrToKey(key)] = that.value[key];
        });
        return that;
    };

    /* *** ACTIONS *** */

    classProto.changeAction = function(triggerEvents){
        var that = this;
        triggerEvents = typeof triggerEvents == 'undefined'? true : triggerEvents;
        var isChanged = JSON.stringify(that.value) != JSON.stringify(that.previousValue);
        if(triggerEvents && isChanged){
            that.triggerEvent('onChange', that.value);
        }
        return that;
    };
});