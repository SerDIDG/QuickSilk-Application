cm.define('App.ChartHubspotContacs', {
    'extend' : 'App.Chart',
    'params' : {
        'width' : '100%',
        'height' : '30em',
        'type' : 'horizontalBar',
        'simpleOptions' : {
            'label' : 'Count of Contacts',
            'fill' : false
        },
        'options' : {
            "scales" : {
                "xAxes" : [{
                    "ticks" : {
                        "beginAtZero" : true
                    }
                }]
            }
        }
    }
},
function(params){
    var that = this;
    // Call parent class construct
    App.Chart.apply(that, arguments);
});