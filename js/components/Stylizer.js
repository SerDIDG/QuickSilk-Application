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
        'Com.Tooltip' : {
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'top' : 'targetHeight + 6',
            'left' : '-6',
            'className' : 'app__stylizer-tooltip'
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
        // Render editor toolbar
        renderTooltip();
        // Process items
        cm.forEach(that.nodes['items'], renderItem);
        // Trigger events
        that.triggerEvent('onRender');
    };

    var renderTooltip = function(){
        // Structure
        that.nodes['tooltip']['container'] = cm.Node('div', {'class' : 'pt__toolbar'},
            cm.Node('div', {'class' : 'inner'},
                cm.Node('ul', {'class' : 'group'},
                    cm.Node('li', {'class' : 'button button-secondary is-icon'},
                        cm.Node('span', {'class' : 'icon toolbar italic'})
                    ),
                    cm.Node('li', {'class' : 'button button-secondary is-icon'},
                        cm.Node('span', {'class' : 'icon toolbar underline'})
                    )
                ),
                cm.Node('ul', {'class' : 'group'},
                    cm.Node('li', {'class' : 'is-select medium'},
                        that.nodes['tooltip']['selectFont'] = cm.Node('select',
                            cm.Node('option', that.lang('Font'))
                        )
                    ),
                    cm.Node('li', {'class' : 'is-select medium'},
                        that.nodes['tooltip']['selectSize'] = cm.Node('select',
                            cm.Node('option', that.lang('Size'))
                        )
                    ),
                    cm.Node('li', {'class' : 'is-select medium'},
                        that.nodes['tooltip']['inputColor'] = cm.Node('input', {'type' : 'text'})
                    )
                )
            )
        );
        // Components
        that.components['selectFont'] = new Com.Select({
            'select' : that.nodes['tooltip']['selectFont'],
            'renderInBody' : false
        });
        that.components['selectSize'] = new Com.Select({
            'select' : that.nodes['tooltip']['selectSize'],
            'renderInBody' : false
        });
        that.components['inputColor'] = new Com.ColorPicker({
            'input' : that.nodes['tooltip']['inputColor'],
            'renderInBody' : false
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

    var renderItem = function(nodes){
        var item = cm.merge({
            'container' : cm.Node('div'),
            'input' : cm.Node('input', {'type' : 'hidden'}),
            'preview' : cm.Node('div')
        }, nodes);
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

    /* ******* MAIN ******* */

    init();
});