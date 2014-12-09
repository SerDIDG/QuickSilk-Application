App['Stylizer'] = function(o){
    var that = this,
        config = cm.merge({
            'container' : document.body,
            'langs' : {
                'Font' : 'Font'
            }
        }, o),
        nodes = {
            'tooltip' : {}
        },
        components = {},
        itemsNodes = [],
        items = [],

        current;

    var init = function(){
        // Render tooltip
        renderTooltip();
        // Collect items
        itemsNodes = cm.getByAttr('data-app-stylizer', 'item', config['container']);
        cm.forEach(itemsNodes, renderItem);
    };

    var renderTooltip = function(){
        // Structure
        nodes['tooltip']['container'] = cm.Node('div', {'class' : 'pt__toolbar app-stylizer-toolbar'},
            cm.Node('ul', {'class' : 'group'},
                cm.Node('li', {'class' : 'button secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar bold'})
                ),
                cm.Node('li', {'class' : 'button secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar italic'})
                ),
                cm.Node('li', {'class' : 'button secondary is-icon'},
                    cm.Node('span', {'class' : 'icon toolbar underline'})
                )
            ),
            cm.Node('ul', {'class' : 'group'},
                cm.Node('li', {'class' : 'is-select medium'},
                    nodes['tooltip']['selectFont'] = cm.Node('select',
                        cm.Node('option', lang('Font'))
                    )
                ),
                cm.Node('li', {'class' : 'is-select medium'},
                    nodes['tooltip']['selectSize'] = cm.Node('select',
                        cm.Node('option', lang('Size'))
                    )
                ),
                cm.Node('li', {'class' : 'is-select medium'},
                    nodes['tooltip']['selectColor'] = cm.Node('select',
                        cm.Node('option', lang('Color'))
                    )
                ),
                cm.Node('li', {'class' : 'is-select medium'},
                    nodes['tooltip']['selectStyle'] = cm.Node('select',
                        cm.Node('option', lang('Style'))
                    )
                )
            )
        );
        // Components
        components['selectFont'] = new Com.Select({
            'select' : nodes['tooltip']['selectFont'],
            'renderInBody' : false
        });
        components['selectSize'] = new Com.Select({
            'select' : nodes['tooltip']['selectSize'],
            'renderInBody' : false
        });
        components['selectColor'] = new Com.Select({
            'select' : nodes['tooltip']['selectColor'],
            'renderInBody' : false
        });
        components['selectStyle'] = new Com.Select({
            'select' : nodes['tooltip']['selectStyle'],
            'renderInBody' : false
        });
        // Render tooltip
        components['tooltip'] = new Com.Tooltip({
            'targetEvent' : 'click',
            'hideOnReClick' : true,
            'top' : 'targetHeight + 6',
            'left' : '-6',
            'className' : 'app-stylizer-tooltip',
            'content' : nodes['tooltip']['container'],
            'events' : {
                'onShowStart' : function(){
                    cm.addClass(current['container'], 'active')
                },
                'onHideStart' : function(){
                    cm.removeClass(current['container'], 'active')
                }
            }
        });
    };

    var renderItem = function(container){
        var item = {
            'container' : container,
            'node' : cm.getByAttr('data-app-stylizer', 'node') || cm.Node('div'),
            'nodes' : {},
            'components' : {}
        };
        // Set selectable class
        cm.addClass(item['container'], 'cm-selectable');
        // Show tooltip on click
        cm.addEvent(item['container'], 'click', function(){
            if(current != item){
                current = item;
                components['tooltip']
                    .setTarget(item['container'])
                    .show();
            }
        });
        // Push to global array
        items.push(item);
    };

    var lang = function(str){
        if(!config['langs'][str]){
            config['langs'][str] = str;
        }
        return config['langs'][str];
    };

    /* *** MAIN *** */

    init();
};