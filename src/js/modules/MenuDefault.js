cm.define('App.ModuleMenu', {
    'extend' : 'App.AbstractModule',
    'events' : [
        'onItemClick'
    ],
    'params' : {
        'renderStructure' : false,
        'embedStructureOnRender' : false
    }
},
function(){
    App.AbstractModule.apply(this, arguments);
});

cm.getConstructor('App.ModuleMenu', function(classConstructor, className, classProto, classInherit){
    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - renderViewModel
        classInherit.prototype.renderViewModel.apply(that, arguments);

        // Collect items
        // ToDo: process items recursively
        that.items = [];
        cm.forEach(that.nodes.items, that.processItems.bind(that));

        // Select change event
        cm.addEvent(that.nodes.select, 'click', that.selectClickEvent.bind(that));
        cm.addEvent(that.nodes.select, 'change', that.selectChangeEvent.bind(that));
    };

    classProto.processItems = function(nodes){
        var that = this;

        var item = {
            container: nodes.container,
            nodes: nodes
        };

        if(item.nodes.link){
            item.value = item.nodes.link.getAttribute('href');
        }

        cm.addEvent(item.container, 'click', function(event){
            that.itemClickEvent(event, item);
        });

        that.items.push(item);
    };

    classProto.itemClickEvent = function(event, item){
        var that = this;
        that.triggerEvent('onItemClick', item);
    };

    classProto.selectClickEvent = function(event){
        var that = this;

        var value = that.nodes.select.value;
        var item = that.items.find(function(testItem){
            return testItem.value === value;
        });

        if(item){
            that.triggerEvent('onItemClick', item);
        }
    };

    classProto.selectChangeEvent = function(event){
        var that = this;

        var value = that.nodes.select.value;
        if(!cm.isEmpty(value)){
            window.location.href = value;
        }
    };

    classProto.set = function(value){
        var that = this;

        // Set link active
        cm.forEach(that.items, function(item){
            if(item.value === value){
                cm.addClass(item.container, 'active');
            }else{
                cm.removeClass(item.container, 'active');
            }
        });

        // Set select menu
        that.nodes.select.value = value;

        return that;
    };
});
