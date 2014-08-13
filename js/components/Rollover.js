App['Rollover'] = function(o){
    var that = this,
        config = cm.merge({
            'node' : cm.Node('div'),
            'height' : 400,
            'duration' : 500,
            'nodes' : {
                'app-rollover' : {}
            }
        }, o),
        privateConfgig = {
            'nodes' : {
                'app-rollover' : ['button', 'container']
            }
        },
        nodes = {},
        anims = {},
        startHeight = 0,
        isOpen;

    var init = function(){
        var container;
        // Collect nodes
        getNodes();
        // Check height of container and status
        container = nodes['app-rollover']['container'];
        if(container.offsetHeight === container.scrollHeight){
            startHeight = config['height'];
            isOpen = true;
            cm.replaceClass(config['node'], 'is-close', 'is-open');
        }else{
            startHeight = container.offsetHeight;
            isOpen = false;
            cm.replaceClass(config['node'], 'is-open', 'is-close');
        }
        // Render
        render();
    };

    var getNodes = function(){
        // Get nodes
        cm.forEach(privateConfgig['nodes'], function(item, key){
            nodes[key] = {};
            cm.forEach(item, function(value){
                nodes[key][value] = cm.getByAttr(['data', key].join('-'), value, config['node'])[0] || cm.Node('div')
            });
        });
        // Merge collected nodes with each defined in config
        nodes = cm.merge(nodes, config['nodes']);
    };

    var render = function(){
        anims['container'] = new cm.Animation(nodes['app-rollover']['container']);
        // Add click event on button, that collapse / expand container block
        cm.addEvent(nodes['app-rollover']['button'], 'click', clickEvent);
    };

    var clickEvent = function(){
        console.log(1);
        if(isOpen){
            cm.replaceClass(config['node'], 'is-open', 'is-close');
            anims['container'].go({'style' : {'height' : [startHeight, 'px'].join('')}, 'duration' : config['duration'], 'anim' : 'smooth'});
        }else{
            cm.replaceClass(config['node'], 'is-close', 'is-open');
            anims['container'].go({
                'style' : {'height' : [(nodes['app-rollover']['container'].scrollHeight + nodes['app-rollover']['button'].scrollHeight), 'px'].join('')},
                'duration' : config['duration'],
                'anim' : 'smooth'
            });
        }
        isOpen = !isOpen;
    };

    /* ******* MAIN ******* */

    init();
};