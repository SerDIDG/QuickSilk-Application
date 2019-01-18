cm.define('App.shutterStockManager', {
    'extend' : 'Com.AbstractFileManager',
    'params' : {
        'lazy' : false,
        'toolbarConstructor' : 'Com.Toolbar',
        'toolbarParams' : {
            'embedStructure' : 'append'
        },
        'searchConstructor' : 'Com.Input',
        'searchParams' : {
            'embedStructure' : 'append'
        },
        'categoriesConstructor' : 'Com.Tabset',
        'categoriesParams' : {
            'tabsPosition' : 'left',
            'embedStructure' : 'append'
        }
    }
},
function(params){
    var that = this;
    that.getFilesProcessType = null;
    that.isLoaded = false;
    // Call parent class construct
    Com.AbstractFileManager.apply(that, arguments);
});

cm.getConstructor('App.shutterStockManager', function(classConstructor, className, classProto, classInherit){
    classProto.tabs = [{
        'title' : 'All',
        'id' : 'all'
    },{
        'title' : 'All 1',
        'id' : 'all1'
    },{
        'title' : 'All 2',
        'id' : 'all2'
    },{
        'title' : 'All 3',
        'id' : 'all3'
    },{
        'title' : 'All 4',
        'id' : 'all4'
    },{
        'title' : 'All 5',
        'id' : 'all5'
    },{
        'title' : 'All 6',
        'id' : 'all6'
    },{
        'title' : 'All 7',
        'id' : 'all7'
    },{
        'title' : 'All 8',
        'id' : 'all8'
    },{
        'title' : 'All 9',
        'id' : 'all9'
    },{
        'title' : 'All 10',
        'id' : 'all10'
    }];

    classProto.renderViewModel = function(){
        var that = this;
        // Render toolbar
        cm.getConstructor(that.params['toolbarConstructor'], function(classObject){
            that.components['toolbar'] = new classObject(
                cm.merge(that.params['toolbarParams'], {
                    'container' : that.nodes['holder']['inner']
                })
            );
            that.components['toolbar'].addGroup({
                'name' : 'all',
                'position' : 'justify',
                'adaptive' : false,
                'flex' : true
            });
            that.components['toolbar'].addField({
                'name' : 'search',
                'group' : 'all',
                'constructor' : that.params['searchConstructor'],
                'constructorParams' : that.params['searchParams']
            });
        });
        // Render categories
        cm.getConstructor(that.params['categoriesConstructor'], function(classObject){
            that.components['categories'] = new classObject(
                cm.merge(that.params['categoriesParams'], {
                    'container' : that.nodes['holder']['inner']
                })
            );
            that.components['categories'].addTabs(that.tabs);
            that.components['categories'].set('all');
        });
        // Show
        cm.removeClass(that.nodes['holder']['container'], 'is-hidden', true);
    };
});