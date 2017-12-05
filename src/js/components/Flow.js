cm.define('App.Flow', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'renderStructure' : true,
        'embedStructureOnRender' : true,
        'controllerEvents' : true,
        'scenario' : App.FlowScenario,
        'directorConstructor' : 'App.FlowDirector',
        'directorParams' : {
            'autoStart' : false
        }
    },
    'strings' : {
        'description' : 'Choose a course:'
    }
},
function(params){
    var that = this;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Flow', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.items = [];
        // Binds
        that.renderListItemHandler = that.renderListItem.bind(that);
    };

    classProto.onValidateParams = function(){
        var that = this;
        // Validate Scenario
        if(cm.isString(that.params['scenario'])){
            that.params['scenario'] = cm.parseJSON(that.params['scenario']);
        }
        // Sort scenario by order
        that.params['scenario'] = cm.arraySort(that.params['scenario'], 'order', 'desc');
    };

    classProto.onDestructProcess = function(){
        var that = this;
        that.components['director'] && !that.components['director'].isRunning && that.components['director'].destruct();
    };

    /******* VIEW MODEL *******/

    classProto.renderView = function(){
        var that = this;
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__flow__list'},
            cm.node('h4', that.lang('description')),
            cm.node('div', {'class' : 'pt__listing-items'},
                that.nodes['items'] = cm.node('ul')
            )
        );
        // Items
        cm.forEach(that.params['scenario'], that.renderListItemHandler);
    };

    classProto.renderListItem = function(item){
        var that = this,
            nodes =  {};
        // Validate scenario
        item['nodes'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('a', item['title'])
        );
        // Events
        cm.addEvent(nodes['link'], 'click', function(e){
            cm.preventDefault(e);
            that.components['director']
                .setScenario(item['data'])
                .setTarget(nodes['link'])
                .start();
        });
        // Embed
        cm.appendChild(nodes['container'], that.nodes['items']);
        that.items.push(item);
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Init Director
        cm.getConstructor(that.params['directorConstructor'], function(classObject){
            that.components['director'] = new classObject(that.params['directorParams']);
        });
    };
});