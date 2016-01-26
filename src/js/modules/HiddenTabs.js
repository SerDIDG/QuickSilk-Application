cm.define('App.ModuleHiddenTabs', {
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
        'onRender',
        'onTabShow',
        'onTabHide'
    ],
    'params' : {
        'node' : cm.Node('div'),
        'name' : '',
        'active' : false,
        'Com.TabsetHelper' : {
            'node' : cm.Node('div'),
            'name' : ''
        }
    }
},
function(params){
    var that = this;

    that.nodes = {
        'container' : cm.node('div'),
        'inner' : cm.node('div'),
        'labels' : [],
        'tabs' : []
    };
    that.components = {};

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        validateParams();
        that.triggerEvent('onRenderStart');
        render();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRender');
    };

    var validateParams = function(){
        that.params['Com.TabsetHelper']['node'] = that.nodes['inner'];
        that.params['Com.TabsetHelper']['name'] = [that.params['name'], 'tabset'].join('-');
    };

    var render = function(){
        cm.log(that.nodes);
        processTabset();
    };

    var processTabset = function(){
        cm.getConstructor('Com.TabsetHelper', function(classConstructor){
            that.components['tabset'] = new classConstructor(that.params['Com.TabsetHelper'])
                .addEvent('onLabelTarget', function(tabset, data){

                })
                .addEvent('onTabHide', function(tabset, data){
                    that.triggerEvent('onTabHide', data);
                })
                .addEvent('onTabShow', function(tabset, data){
                    that.triggerEvent('onTabShow', data);
                })
                .processTabs(that.nodes['tabs'], that.nodes['labels'])
                .set(that.params['active']);
        });
    };

    /* ******* PUBLIC ******* */

    init();
});