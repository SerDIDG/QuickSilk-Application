cm.define('App.LoginBox', {
    'modules' : [
        'Params',
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
            'preventClickEvent' : true,
            'adaptiveX' : true,
            'adaptiveY' : true,
            'left' : '(targetWidth - selfWidth) / 2',
            'top' : 'targetHeight + 8',
            'className' : 'app-pt__box-login__tooltip'
        }
    }
},
function(params){
    var that = this,
        components = {};

    that.nodes = {
        'button' : cm.Node('div'),
        'target' : cm.Node('div')
    };

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        that.getDataConfig(that.params['node']);
        render();
    };

    var render = function(){
        // Render tooltip
        components['tooltip'] = new Com.Tooltip(
            cm.merge(that.params['Com.Tooltip'], {
                'target' : that.nodes['button'],
                'content' : that.nodes['target'],
                'events' : {
                    'onShow' : show
                }
            })
        );
    };

    var show = function(){
        // Focus text input
        var input = cm.getByAttr('type', 'text', that.nodes['target'])[0];
        input && input.focus();
    };

    /* ******* MAIN ******* */

    init();
});