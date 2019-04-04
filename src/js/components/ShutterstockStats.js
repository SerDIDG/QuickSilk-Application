cm.define('App.ShutterstockStats', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'adminLink' : '/admin/shutterstock/'
    },
    'strings' : {
        'message' : 'A list of all temporary images you’ve downloaded, as well as the ability to purchase a use license - can be found <a href="%adminLink%" target="_blank">here</a>.'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.ShutterstockStats', function(classConstructor, className, classProto, classInherit){
    classProto.renderView = function(){
        var that = this;
        that.triggerEvent('onRenderViewStart');
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'com__file-stats'},
            that.nodes['content'] = cm.node('div', {'class' : 'pt__line-info'},
                cm.node('div', {'class' : 'icon small info'}),
                cm.node('div', {
                    'class' : 'item',
                    'innerHTML' : that.lang('message', {
                        '%adminLink%' : that.params['adminLink']
                    })
                })
            )
        );
        // Events
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
    };
});