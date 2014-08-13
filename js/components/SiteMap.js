App['SiteMap'] = function(o){
    var that = this,
        config = cm.merge({
            'node' : cm.Node('div'),
            'configMarker' : 'data-config',
            'scroll' : true,
            'animatePadding' : true,
            'duration' : 500,
            'nodes' : {}
        }, o),
        nodes = {
            'AppNodes' : {
                'container' : cm.Node('div')
            },
            'Template' : {
                'content' : cm.Node('div'),
                'footer' : cm.Node('div')
            },
            'AppSitemap' : {
                'button' : cm.Node('div'),
                'target' : cm.Node('div')
            }
        },
        animations = {},
        isHide = true,
        animScrollType;

    var init = function(){
        getConfig(config['node'], config['configMarker']);
        getNodes(document.body);
        // Init
        if(cm.inDOM(nodes['AppSitemap']['button'])){
            set();

            animations['container'] = new cm.Animation(nodes['AppSitemap']['target']);
            animations['content'] = new cm.Animation(nodes['Template']['content']);

            cm.addEvent(window, 'resize', set);
            cm.addEvent(nodes['AppSitemap']['button'], 'click', function(){
                getScrollAnim();
                if(isHide){
                    show();
                }else{
                    hide();
                }
            });
        }
    };

    var getScrollAnim = function(){
        if(config['scroll']){
            animScrollType = 'node';
            animations['scroll'] = new cm.Animation(nodes['Template']['container']);
            /*
            if(cm.isClass(nodes['AppNodes']['container'], 'has-topmenu') || cm.isClass(nodes['AppNodes']['container'], 'has-widgets')){
                animScrollType = 'node';
                animations['scroll'] = new cm.Animation(nodes['Template']['container']);
            }else{
                animScrollType = 'document';
                animations['scroll'] = new cm.Animation(document.body);
            }
            */
        }
    };

    var set = function(){
        if(config['animatePadding']){
            nodes['Template']['content'].style.paddingBottom = [nodes['Template']['footer'].offsetHeight, 'px'].join('');
        }
    };

    var show = function(){
        var containerHeight, footerHeight;
        if(isHide){
            isHide = false;
            // Add css class to button
            cm.addClass(nodes['AppSitemap']['button'], 'is-show');
            // Get sitemap height
            containerHeight = cm.getRealHeight(nodes['AppSitemap']['target']);
            // Animate map height
            animations['container'].go({'style': {'height' : [containerHeight,'px'].join('')}, 'anim' : 'smooth', 'duration' : config['duration'], 'onStop' : function(){
                nodes['AppSitemap']['target'].style.height = 'auto';
                nodes['AppSitemap']['target'].style.overflow = 'visible';
            }});
            // Animate content padding-bottom
            if(config['animatePadding']){
                footerHeight = nodes['Template']['footer'].offsetHeight;
                animations['content'].go({'style': {'paddingBottom' : [containerHeight + footerHeight,'px'].join('')}, 'anim' : 'smooth', 'duration' : config['duration']});
            }
            // Scroll to document bottom
            config['scroll'] && animations['scroll'].go({
                'style' : getScrollStyle(animScrollType),
                'anim' : 'smooth',
                'duration' : config['duration']
            });
        }
    };

    var hide = function(){
        var footerHeight;
        if(!isHide){
            isHide = true;
            // Remove css class from button
            cm.removeClass(nodes['AppSitemap']['button'], 'is-show');
            // Animate map height
            nodes['AppSitemap']['target'].style.overflow = 'hidden';
            animations['container'].go({'style' : {'height': '0px'}, 'anim' : 'acceleration', 'duration' : config['duration']});
            // Animate content padding-bottom
            if(config['animatePadding']){
                nodes['AppSitemap']['target'].style.height = 0;
                footerHeight = nodes['Template']['footer'].offsetHeight;
                nodes['AppSitemap']['target'].style.height = 'auto';
                animations['content'].go({'style': {'paddingBottom' : [footerHeight,'px'].join('')}, 'anim' : 'acceleration', 'duration' : config['duration']});
            }
        }
    };

    var getScrollStyle = function(type){
        var types = {
            'document' : {'docScrollTop' : cm.getPageSize('height')},
            'node' : {'scrollTop' : nodes['Template']['container'].scrollHeight}
        };
        return types[type];
    };

    /* *** MISC FUNCTIONS **** */

    var getNodes = function(container, marker){
        if(container){
            var sourceNodes = {};
            if(marker){
                sourceNodes = cm.getNodes(container)[marker] || {};
            }else{
                sourceNodes = cm.getNodes(container);
            }
            nodes = cm.merge(nodes, sourceNodes);
        }
        nodes = cm.merge(nodes, config['nodes']);
    };

    var getConfig = function(container, marker){
        if(container){
            marker = marker || 'data-config';
            var sourceConfig = container.getAttribute(marker);
            if(sourceConfig){
                config = cm.merge(config, JSON.parse(sourceConfig));
            }
        }
    };

    /* ******* MAIN ******* */

    init();
};