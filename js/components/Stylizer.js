cm.define('App.Stylizer', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRender',
        'onSelect',
        'onChange'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'active' : {},
        'default' : {},
        'styles' : {
            'font-family' : [
                "Arial, Helvetica, sans-serif",
                "'Arial Black', Gadget, sans-serif",
                "'Courier New', Courier, monospace",
                "Georgia, serif",
                "Impact, Charcoal, sans-serif",
                "'Lucida Console', Monaco, monospace",
                "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
                "Tahoma, Geneva, sans-serif",
                "'Times New Roman', Times, serif",
                "'Trebuchet MS', Helvetica, sans-serif",
                "Verdana, Geneva, sans-serif"
            ],
            'line-height' : ['normal', 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 108, 120],
            'font-size' : [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96],
            'font-weight' : [300, 400, 600, 700, 800],
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
            'color' : true
        },
        'showResetButtons' : true,
        'overrideControls' : true,
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
            'renderInBody' : false
        },
        'langs' : {
            '300' : 'Light',
            '400' : 'Regular',
            '600' : 'Semi-Bold',
            '700' : 'Bold',
            '800' : 'Extra-Bold'
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.Node('div'),
        'input' : cm.Node('input', {'type' : 'hidden'}),
        'preview' : cm.Node('div'),
        'tooltip' : {}
    };
    that.components = {};
    that.value = null;
    that.previousValue = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        // Render editor toolbar
        renderTooltip();
        // Add to stack
        that.addToStack(that.nodes['container']);
        // Set
        set(cm.merge(that.params['default'], that.params['active']), false);
        // Trigger events
        that.triggerEvent('onRender', that.value);
    };

    var validateParams = function(){
        if(cm.isNode(that.nodes['input'])){
            that.params['name'] = that.nodes['input'].getAttribute('name') || that.params['name'];
        }
        // Get config
        that.params['active'] = cm.merge(
            that.params['active'],
            that.getNodeDataConfig(that.nodes['input'], 'value')
        );
        that.params['default'] = cm.merge(
            that.params['default'],
            that.getNodeDataConfig(that.nodes['input'], 'data-default')
        );
        // Validate config
        validateItemConfig(that.params['active']);
        validateItemConfig(that.params['default']);
        // Extend global styles config
        extendGlobalConfig(that.params['active']);
        extendGlobalConfig(that.params['default']);
        // Override controls
        if(that.params['overrideControls']){
            cm.forEach(that.params['controls'], function(item, key){
                that.params['controls'][key] = !!that.params['default'][key];
            });
        }
    };

    var validateItemConfig = function(config){
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

    var extendGlobalConfig = function(config){
        if(!cm.inArray(that.params['styles']['font-size'], config['font-size'])){
            that.params['styles']['font-size'].push(config['font-size']);
            that.params['styles']['font-size'].sort(function(a, b){
                return a - b;
            });
        }
        if(!cm.inArray(that.params['styles']['line-height'], config['line-height'])){
            that.params['styles']['line-height'].push(config['line-height']);
            that.params['styles']['line-height'].sort(function(a, b){
                if(a == 'normal'){
                    return -1;
                }else if(b == 'normal'){
                    return 1;
                }
                return a - b;
            });
        }
        if(!cm.inArray(that.params['styles']['font-family'], config['font-family'])){
            that.params['styles']['font-family'].push(config['font-family']);
            that.params['styles']['font-family'].sort(function(a, b){
                var t1 = a.toLowerCase().replace(/["']/g, ''),
                    t2 = b.toLowerCase().replace(/["']/g, '');
                return (t1 < t2)? -1 : ((t1 > t2)? 1 : 0);
            });
        }
    };

    var renderTooltip = function(){
        // Structure
        that.nodes['tooltip']['container'] = cm.Node('div', {'class' : 'pt__toolbar'},
            cm.Node('div', {'class' : 'inner'},
                that.nodes['tooltip']['group1'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group2'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group3'] = cm.Node('ul', {'class' : 'group'}),
                that.nodes['tooltip']['group4'] = cm.Node('ul', {'class' : 'group'})
            )
        );
        // Font-Family
        if(that.params['controls']['font-family']){
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['font-family'] = cm.Node('select', {'title' : that.lang('Font')})
                )
            );
            cm.forEach(that.params['styles']['font-family'], function(item){
                that.nodes['tooltip']['font-family'].appendChild(
                    cm.Node('option', {'value' : item, 'style' : {'font-family' : item}}, item.replace(/["']/g, '').split(',')[0])
                );
            });
            that.components['font-family'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-family'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-family' : value}), true);
                        }
                    }
                })
            );
        }
        // Font-Weight
        if(that.params['controls']['font-weight']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['font-weight-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar bold'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['font-weight-button'], 'click', function(){
                set(cm.merge(that.value, {'font-weight' : (that.value['font-weight'] > 400? 400 : 700)}), true);
            });
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['font-weight'] = cm.Node('select', {'title' : that.lang('Weight')})
                )
            );
            cm.forEach(that.params['styles']['font-weight'], function(item){
                that.nodes['tooltip']['font-weight'].appendChild(
                    cm.Node('option', {'value' : item}, that.lang(item))
                );
            });
            that.components['font-weight'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-weight'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-weight' : value}), true);
                        }
                    }
                })
            );
        }
        // Font-Style
        if(that.params['controls']['font-style']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['font-style-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar italic'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['font-style-button'], 'click', function(){
                set(cm.merge(that.value, {'font-style' : (that.value['font-style'] == 'italic'? 'normal' : 'italic')}), true);
            });
        }
        // Text-Decoration
        if(that.params['controls']['text-decoration']){
            // Button
            that.nodes['tooltip']['group1'].appendChild(
                that.nodes['tooltip']['text-decoration-button'] = cm.Node('li', {'class' : 'button button-secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar underline'})
                )
            );
            cm.addEvent(that.nodes['tooltip']['text-decoration-button'], 'click', function(){
                set(cm.merge(that.value, {'text-decoration' : (that.value['text-decoration'] == 'underline'? 'none' : 'underline')}), true);
            });
        }
        // Font-Size
        if(that.params['controls']['font-size']){
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select x-small'},
                    that.nodes['tooltip']['font-size'] = cm.Node('select', {'title' : that.lang('Size')})
                )
            );
            cm.forEach(that.params['styles']['font-size'], function(item){
                that.nodes['tooltip']['font-size'].appendChild(
                    cm.Node('option', {'value' : item}, item)
                );
            });
            that.components['font-size'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['font-size'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'font-size' : value}), true);
                        }
                    }
                })
            );
        }
        // Line-Height
        if(that.params['controls']['line-height']){
            // Select
            that.nodes['tooltip']['group2'].appendChild(
                cm.Node('li', {'class' : 'is-select x-small'},
                    that.nodes['tooltip']['line-height'] = cm.Node('select', {'title' : that.lang('Leading')})
                )
            );
            cm.forEach(that.params['styles']['line-height'], function(item){
                that.nodes['tooltip']['line-height'].appendChild(
                    cm.Node('option', {'value' : item}, (item == 'normal'? that.lang('auto') : item))
                );
            });
            that.components['line-height'] = new Com.Select(
                cm.merge(that.params['Com.Select'], {
                    'select' : that.nodes['tooltip']['line-height'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'line-height' : value}), true);
                        }
                    }
                })
            );
        }
        // Color
        if(that.params['controls']['color']){
            that.nodes['tooltip']['group3'].appendChild(
                cm.Node('li', {'class' : 'is-select medium'},
                    that.nodes['tooltip']['color'] = cm.Node('input', {'type' : 'text', 'title' : that.lang('Color')})
                )
            );
            that.components['color'] = new Com.ColorPicker(
                cm.merge(that.params['Com.ColorPicker'], {
                    'input' : that.nodes['tooltip']['color'],
                    'defaultValue' : that.params['default']['color'],
                    'events' : {
                        'onChange' : function(my, value){
                            set(cm.merge(that.value, {'color' : value}), true);
                        }
                    }
                })
            );
        }
        // Reset
        if(that.params['showResetButtons']){
            // Button
            that.nodes['tooltip']['group4'].appendChild(
                cm.Node('li',
                    that.nodes['tooltip']['reset-default-button'] = cm.Node('div', {'class' : 'button button-primary'}, that.lang('Reset to default'))
                )
            );
            that.nodes['tooltip']['group4'].appendChild(
                cm.Node('li',
                    that.nodes['tooltip']['reset-current-button'] = cm.Node('div', {'class' : 'button button-primary'}, that.lang('Reset to current'))
                )
            );
            cm.addEvent(that.nodes['tooltip']['reset-default-button'], 'click', function(){
                set(cm.clone(that.params['default']), true);
            });
            cm.addEvent(that.nodes['tooltip']['reset-current-button'], 'click', function(){
                set(cm.clone(that.params['active']), true);
            });
        }
        // Render tooltip
        that.components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'content' : that.nodes['tooltip']['container'],
                'target' : that.nodes['container'],
                'events' : {
                    'onShowStart' : function(){
                        cm.addClass(that.nodes['container'], 'active')
                    },
                    'onHideStart' : function(){
                        cm.removeClass(that.nodes['container'], 'active')
                    }
                }
            })
        );
    };

    var set = function(styles, triggerEvents){
        var prepared = cm.clone(styles);
        that.previousValue = cm.clone(that.value);
        that.value = styles;
        // Set components
        cm.forEach(styles, function(value, key){
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
                case 'font-size':
                    prepared[key] = [value, 'px'].join('');
                    break;
                case 'line-height':
                    prepared[key] = value == 'normal'? value :[value, 'px'].join('');
                    break;
            }
            // Set preview
            that.nodes['preview'].style[cm.styleStrToKey(key)] = prepared[key];
        });
        // Set hidden input data
        that.nodes['input'].value = JSON.stringify(prepared);
        // Trigger events
        if(triggerEvents){
            that.triggerEvent('onSelect', that.value);
            eventOnChange();
        }
    };

    var eventOnChange = function(){
        if(JSON.stringify(that.value) != JSON.stringify(that.previousValue)){
            that.triggerEvent('onChange', that.value);
        }
    };

    /* ******* MAIN ******* */

    that.set = function(styles, triggerEvents){
        triggerEvents = typeof triggerEvents != 'undefined'? triggerEvents : true;
        styles = cm.isObject(styles)? validateItemConfig(styles) : that.params['default'];
        set(styles, triggerEvents);
        return that;
    };

    that.get = function(){
        return that.value;
    };

    init();
});