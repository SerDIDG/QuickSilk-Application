cm.define('App.ShutterstockStats', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'adminLink' : '/admin/shutterstock/',
        'tooltipConstructor' : 'Com.HelpBubble',
        'tooltipParams' : {
            'renderStructure' : true,
            'embedStructureOnRender' : true,
            'showLabel' : true,
            'showIcon' : false,
            'type' : 'container'
        }
    },
    'strings' : {
        'message' : 'Images are watermarked and can be used only on a temporary basis, and for evaluation purposes. To remove the watermark and obtain the usage rights to use the image on your website (only) you must purchase a license. A list of all temporary images you’ve downloaded, as well as the ability to purchase a use license - can be found in Modules > Manage > Shutterstock. <a href="%adminLink%" target="_blank">Click here</a> to go to the module.'
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
            that.nodes['content'] = cm.node('div', {'class' : 'com__file-stats__list is-inline'},
                that.nodes['list'] = cm.node('ul',
                    cm.node('li', {
                        'innerHTML' : that.lang('message', {
                            '%adminLink%' : that.params['adminLink']
                        })
                    })
                )
            )
        );
        // Events
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
    };

    classProto.renderViewModel = function(){
        var that = this;
    };
});