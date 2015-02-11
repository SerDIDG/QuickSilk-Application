cm.define('App.TemplatesList', {
    'modules' : [
        'Params',
        'Events',
        'DataConfig',
        'DataNodes'
    ],
    'events' : [
        'onRender'
    ],
    'params' : {
        'node' : cm.Node('div')
    }
},
function(params){
    var that = this,
        checkInt,
        pageHeight = 0;

    var init = function(){
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        checkInt = setInterval(check, 5);
        cm.addEvent(window, 'resize', process);
        process();
        that.triggerEvent('onRender', {});
    };

    var check = function(){
        var sizes = cm.getPageSize();
        if(pageHeight != sizes['height']){
            process();
            pageHeight = cm.getPageSize()['height'];
        }
    };

    var process = function(){
        that.params['node'].style.height = '9000px';
        var sizes = cm.getPageSize(),
            height = 9000 - (sizes['height'] - sizes['winHeight']);
        that.params['node'].style.height = [Math.max(0, height), 'px'].join('');
    };

    /* ******* MAIN ******* */

    init();
});