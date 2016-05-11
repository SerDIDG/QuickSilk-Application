/* ******* MODULES: MENU ******* */

cm.define('App.ModuleMenu', {
    'modules' : [
        'Params',
        'DataNodes'
    ],
    'params' : {
        'node' : cm.node('div')
    }
},
function(params){
    var that = this;

    that.nodes = {
        'select' : cm.node('select')
    };

    /* *** CLASS FUNCTIONS *** */

    var init = function(){
        that.setParams(params);
        that.getDataNodes(that.params['node']);
        render();
    };

    var render = function(){
        cm.addEvent(that.nodes['select'], 'change', toggle);
    };

    var toggle = function(){
        var value = that.nodes['select'].value;
        if(!cm.isEmpty(value)){
            window.location.href = value;
        }
    };

    /* *** MAIN *** */

    init();
});