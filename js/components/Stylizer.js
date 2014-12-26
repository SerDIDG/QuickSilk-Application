cm.define('App.Stylizer', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
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
            'line-height' : [12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 80, 88, 96, 108, 120],
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
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'top' : 'targetHeight + 6',
            'left' : '-6',
            'className' : 'app__stylizer-tooltip'
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
        'items' : [],
        'tooltip' : {}
    };
    that.components = {};
    that.items = [];
    that.current = null;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        // Process items
        cm.forEach(that.nodes['items'], renderItem);
        // Render editor toolbar
        renderTooltip();
        // Trigger events
        that.triggerEvent('onRender');
    };

    var renderItem = function(nodes){
        var item = cm.merge({
            'container' : cm.Node('div'),
            'input' : cm.Node('input', {'type' : 'hidden'}),
            'preview' : cm.Node('div'),
            'config' : {},
            'default' : {}
        }, nodes);
        // Get config
        item['config'] = that.getNodeDataConfig(item['input'], 'value');
        item['default'] = that.getNodeDataConfig(item['input'], 'data-default');
        // Validate config
        validateItemConfig(item['config']);
        validateItemConfig(item['default']);
        // Extend global styles config
        extendGlobalConfig(item['config']);
        extendGlobalConfig(item['default']);
        cm.log(that.params['styles']);
        // Set selectable class
        cm.addClass(item['container'], 'pt__selectable');
        // Show tooltip on click
        cm.addEvent(item['container'], 'click', function(){
            if(that.current != item){
                that.current = item;
                that.components['tooltip']
                    .setTarget(item['container'])
                    .show();
            }
        });
        // Push to global array
        that.items.push(item);
    };

    var validateItemConfig = function(config){
        if(config['line-height']){
            config['line-height'] = parseInt(config['line-height']);
        }
        if(config['font-size']){
            config['font-size'] = parseInt(config['font-size']);
        }
        if(config['font-weight']){
            if(that.params['styleBinds']['font-weight'][config['font-weight']]){
                config['font-weight'] = that.params['styleBinds']['font-weight'][config['font-weight']];
            }
            config['font-weight'] = cm.inArray(that.params['styles']['font-weight'], config['font-weight'])? config['font-weight'] : 400;
        }
        if(config['font-style']){
            config['font-style'] = cm.inArray(that.params['styles']['font-style'], config['font-style'])? config['font-style'] : 'normal';
        }
        if(config['text-decoration']){
            config['font-style'] = cm.inArray(that.params['styles']['font-style'], config['font-style'])? config['font-style'] : 'none';
        }
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
                cm.Node('ul', {'class' : 'group'},
                    cm.Node('li', {'class' : 'button button-secondary is-icon'},
                        cm.Node('span', {'class' : 'icon toolbar bold'})
                    ),
                    cm.Node('li', {'class' : 'button button-secondary is-icon'},
                        cm.Node('span', {'class' : 'icon toolbar italic'})
                    ),
                    cm.Node('li', {'class' : 'button button-secondary is-icon'},
                        cm.Node('span', {'class' : 'icon toolbar underline'})
                    )
                ),
                cm.Node('ul', {'class' : 'group'},
                    cm.Node('li', {'class' : 'is-select medium'},
                        that.nodes['tooltip']['font-family'] = cm.Node('select', {'title' : that.lang('Font')})
                    ),
                    cm.Node('li', {'class' : 'is-select medium'},
                        that.nodes['tooltip']['font-weight'] = cm.Node('select', {'title' : that.lang('Weight')})
                    ),
                    cm.Node('li', {'class' : 'is-select x-small'},
                        that.nodes['tooltip']['font-size'] = cm.Node('select', {'title' : that.lang('Size')})
                    ),
                    cm.Node('li', {'class' : 'is-select x-small'},
                        that.nodes['tooltip']['line-height'] = cm.Node('select', {'title' : that.lang('Leading')})
                    )
                ),
                cm.Node('ul', {'class' : 'group'},
                    cm.Node('li', {'class' : 'is-select x-small'},
                        that.nodes['tooltip']['color'] = cm.Node('input', {'type' : 'text', 'title' : that.lang('Color')})
                    )
                )
            )
        );
        // Render selects
        cm.forEach(that.params['styles']['font-family'], function(item){
            that.nodes['tooltip']['font-family'].appendChild(
                cm.Node('option', {'value' : item, 'style' : {'font-family' : item}}, item.replace(/["']/g, '').split(',')[0])
            );
        });
        cm.forEach(that.params['styles']['font-weight'], function(item){
            that.nodes['tooltip']['font-weight'].appendChild(
                cm.Node('option', {'value' : item}, that.lang(item))
            );
        });
        cm.forEach(that.params['styles']['font-size'], function(item){
            that.nodes['tooltip']['font-size'].appendChild(
                cm.Node('option', {'value' : item}, item)
            );
        });
        cm.forEach(that.params['styles']['line-height'], function(item){
            that.nodes['tooltip']['line-height'].appendChild(
                cm.Node('option', {'value' : item}, item)
            );
        });
        // Components
        that.components['font-family'] = new Com.Select({
            'select' : that.nodes['tooltip']['font-family'],
            'renderInBody' : false
        });
        that.components['font-weight'] = new Com.Select({
            'select' : that.nodes['tooltip']['font-weight'],
            'renderInBody' : false
        });
        that.components['font-size'] = new Com.Select({
            'select' : that.nodes['tooltip']['font-size'],
            'renderInBody' : false
        });
        that.components['line-height'] = new Com.Select({
            'select' : that.nodes['tooltip']['line-height'],
            'renderInBody' : false
        });
        that.components['color'] = new Com.ColorPicker({
            'input' : that.nodes['tooltip']['color'],
            'renderInBody' : false,
            'showInputValue' : false
        });
        // Render tooltip
        that.components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'content' : that.nodes['tooltip']['container'],
                'events' : {
                    'onShowStart' : function(){
                        cm.addClass(that.current['container'], 'active')
                    },
                    'onHideStart' : function(){
                        cm.removeClass(that.current['container'], 'active')
                    }
                }
            })
        );
    };

    /* ******* MAIN ******* */

    init();
});