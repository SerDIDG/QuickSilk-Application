cm.define('App.Chart', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'embedStructure' : 'append',
        'width' : 'auto',
        'height' : 'auto',
        'type' : 'doughnut',
        'showLegend' : false,
        'simpleData' : [],         // Simple options data [{"label" : "Foo", "value" : 300}]
        'simpleOptions' : {},
        'simpleBackgroundColor' : '@LESS.CmColor-Primary-DarkDefault',
        'data' : {},
        'options' : {}
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Chart', function(classConstructor, className, classProto, classInherit){
    classProto.renderView = function(){
        var that = this;
        that.triggerEvent('onRenderViewStart');
        that.nodes['container'] = cm.node('div', {'class' : 'app__chart'},
            that.nodes['canvas'] = cm.node('canvas', {
                'width' : that.params['width'],
                'height' : that.params['height']
            }),
            that.nodes['legend'] = cm.node('div', {'class' : 'chart__legend'})
        );
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Convert simple data
        if(!cm.isEmpty(that.params['simpleData'])){
            that.processSimpleData();
        }
        // Load script
        cm.loadScript({
            'path' : 'Chart',
            'src' : '%AppAssetsUrl%/libs/chartjs/Chart.min.js?%AppVersion%',
            'callback' : function(path){
                if(path){
                    that.components['chart'] = new path(that.nodes['canvas'], {
                        'type' : that.params['type'],
                        'data' : that.params['data'],
                        'options' : that.params['options']
                    });
                    if(that.params['showLegend']){
                        that.nodes['legend'].innerHTML = that.components['chart'].generateLegend();
                    }
                }
            }
        });
    };

    classProto.processSimpleData = function(){
        var that = this,
            dataset = cm.merge({
                'data' : [],
                'backgroundColor' : that.params['simpleBackgroundColor']
            }, that.params['simpleOptions']);
        // Merge Data
        that.params['data'] = {
            'labels' : [],
            'datasets' : [dataset]
        };
        cm.forEach(that.params['simpleData'], function(item){
            that.params['data']['labels'].push(item['label']);
            dataset['data'].push(item['value']);
        });
    };
});