cm.define('App.ShutterstockStats', {
    'extend' : 'Com.AbstractController',
    'params' : {
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
        'message' : 'Intro text stating about watermarks and necessity to buy original images from Shutterstock module - and a link to it.',
        'title' : 'Terms of Use',
        'content' :
            '<div>' +
            '   <p>Images are for digital use within QuickSilk only and may not be used for print.</p>' +
            '   <p>You may not use the image as a trademark or logo for a business.</p>' +
            '   <p>You may not portray a person in a way that may be offensive, including: in connection with adult-oriented services or ads for dating services; in connection with political endorsements; with pornographic, defamatory, unlawful, offensive or immoral content; and as suffering from, or being treated for, a physical or mental ailment.</p>' +
            '   <p>You may only use the image for campaigns and content created on QuickSilk, and not with other website or content services. Downloading of the standalone image file outside of QuickSilk is prohibited.</p>' +
            '</div>'
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
                    cm.node('li', {'class' : 'icon small info'}),
                    cm.node('li', that.lang('message')),
                    that.nodes['terms'] = cm.node('li')
                )
            )
        );
        // Events
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
    };

    classProto.renderViewModel = function(){
        var that = this;
        cm.getConstructor(that.params['tooltipConstructor'], function(classObject){
            that.components['tooltip'] = new classObject(
                cm.merge(that.params['tooltipParams'], {
                    'container' : that.nodes['terms'],
                    'title' : that.lang('title'),
                    'content' : that.lang('content')
                })
            );
        });
    };
});