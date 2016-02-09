cm.define('Module.CalendarMonth', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'DataConfig',
        'DataNodes',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'delay' : 'cm._config.hideDelay',
        'name' : '',
        'itemIndent' : 1,
        'langs' : {
            'view_more' : 'View More'
        },
        'Com.Tooltip' : {
            'className' : 'module__calendar__event-tooltip',
            'top' : 'targetHeight',
            'left' : '-(selfWidth - targetWidth) + targetHeight'
        }
    }
},
function(params){
    var that = this;

    that.nodes = {};
    that.components = {};
    that.days = [];

    var init = function(){
        getCSSHelpers();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        render();
        that.triggerEvent('onRender');
    };

    var getCSSHelpers = function(){
        var rule;
        if(rule = cm.getCSSRule('.module__calendar__view-month__item-indent')[0]){
            that.params['itemIndent'] = cm.styleToNumber(rule.style.height);
        }
    };

    var validateParams = function(){
        that.params['Com.Tooltip']['top'] = cm.strReplace(that.params['Com.Tooltip']['left'], {
            '%itemIndent%' : that.params['itemIndent']
        });
        that.params['Com.Tooltip']['left'] = cm.strReplace(that.params['Com.Tooltip']['left'], {
            '%itemIndent%' : that.params['itemIndent']
        });
    };

    var render = function(){
        console.dir(that.nodes);
        // Event Tooltip
        cm.getConstructor('Com.Tooltip', function(classConstructor, className){
            that.components['tooltip'] = new classConstructor(
                cm.merge(that.params[className], {
                    'events' : {
                        'onHideStart' : function(){
                            //hideAllMoreEvents();
                        }
                    }
                })
            );
        });
        // Process Days
        cm.forEach(that.nodes['days'], processDay);
    };

    var processDay = function(nodes){
        var item = {
            'isShow' : false,
            'events' : [],
            'nodes' : nodes
        };
        // Process day events
        cm.forEach(item.nodes['events'], function(event){
            processEvent(item, event);
        });
        // Show all events on more button click
        cm.addEvent(item.nodes['more-button'], 'click', function(){
            showMoreEvents(item);
        });
        cm.addEvent(item.nodes['more-holder'], 'mouseover', function(e){
            showMoreEvents(item);
        });
        // Hide all events on mouse out and click
        cm.addEvent(item.nodes['more-holder'], 'mouseout', function(e){
            var target = cm.getRelatedTarget(e);
            if(!cm.isParent(item.nodes['more-holder'], target, true) && !that.components['tooltip'].isOwnNode(target)){
                hideMoreEvents(item);
            }
        });
        // Prevent document scrolling while scroll all events block
        cm.addIsolateScrolling(item.nodes['more-holder']);
        // Push
        that.days.push(item);
    };

    var processEvent = function(day, nodes){
        var item = {
            'config' : {
                'title' : null,
                'date' : null,
                'description' : null
            },
            'nodes' : nodes,
            'tooltip' : {}
        };
        item.config = cm.merge(item.config, that.getNodeDataConfig(item.nodes['container']));
        // Render tooltip content
        renderEventContent(item);
        // Show event tooltip
        cm.addEvent(item.nodes['container'], 'mouseover', function(){
            that.components['tooltip']
                .setTarget(item.nodes['container'])
                .setContent(item.tooltip['container'])
                .show();
        });
        // Push
        day.events.push(item);
    };

    var showMoreEvents = function(item){
        item.delay && clearTimeout(item.delay);
        if(!item.isShow){
            item.isShow = true;
            cm.setScrollTop(item.nodes['more-holder'], 0);
            cm.addClass(item.nodes['more-holder'], 'is-show');
        }
    };

    var hideMoreEvents = function(item, isImmediately){
        item.delay && clearTimeout(item.delay);
        if(item.isShow){
            if(isImmediately){
                item.isShow = false;
                cm.removeClass(item.nodes['more-holder'], 'is-show');
            }else{
                item.delay = setTimeout(function(){
                    item.isShow = false;
                    cm.removeClass(item.nodes['more-holder'], 'is-show');
                }, that.params['delay']);
            }
        }
    };

    var hideAllMoreEvents = function(){
        cm.forEach(that.days, function(item){
            hideMoreEvents(item);
        });
    };

    var renderEventContent = function(item){
        item.tooltip['container'] = cm.node('div', {'class' : 'lt__post'},
            cm.node('h4', {'class' : 'post-title', 'innerHTML' : item.config['title']}),
            cm.node('div', {'class' : 'post-info'},
                cm.node('div', {'class' : 'pt__line-info'},
                    cm.node('div', {'class' : 'date'}, item.config['date'])
                )
            )
        );
        if(!cm.isEmpty(item.config['description'])){
            cm.appendChild(
                cm.node('div', {'class' : 'post-abstract', 'innerHTML' : item.config['description']}),
                item.tooltip['container']
            );
        }
        if(!cm.isEmpty(item.config['url'])){
            cm.appendChild(
                cm.node('hr'),
                item.tooltip['container']
            );
            cm.appendChild(
                cm.node('div', {'class' : 'btn-wrap pull-center'},
                    cm.node('a', {'class' : 'button', 'href' : item.config['url']}, that.lang('view_more'))
                ),
                item.tooltip['container']
            );
        }
    };

    /* ******* CALLBACKS ******* */

    /* ******* PUBLIC ******* */

    init();
});