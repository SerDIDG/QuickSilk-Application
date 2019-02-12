cm.define('App.FileUploader', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'onSelect',
        'onComplete',
        'onGet'
    ],
    'params' : {
        'max' : 0,
        'showStats' : true,
        'completeOnSelect' : true,
        'local' : true,
        'localConstructor' : 'App.FileUploaderLocal',
        'localParams' : {
            'embedStructure' : 'append',
            'fileList' : false
        },
        'fileManagerLazy' : true,
        'fileManager' : true,
        'fileManagerConstructor' : 'App.elFinderFileManager',
        'fileManagerParams' : {
            'embedStructure' : 'append',
            'showStats' : false,
            'fullSize' : true
        },
        'stock' : false,
        'stockConstructor' : 'App.ShutterstockManager',
        'stockParams' : {
            'embedStructure' : 'append',
            'fullSize' : true
        },
        'Com.Tabset' : {
            'embedStructure' : 'append',
            'toggleOnHashChange' : false,
            'calculateMaxHeight' : true
        },
        'Com.FileStats' : {
            'embedStructure' : 'append',
            'toggleBox' : false,
            'inline' : true
        }
    },
    'strings' : {
        'tab_local' : 'Select From PC',
        'tab_filemanager' : 'File Manager',
        'tab_stock' : 'Shutterstock',
        'browse_local_single' : 'Choose file',
        'browse_local_multiple' : 'Choose files',
        'or' : 'or',
        'browse' : 'Browse'
    }
},
function(params){
    var that = this;
    that.nodes = {};
    that.components = {};
    that.items = [];
    that.activeTab = null;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.FileUploader', function(classConstructor, className, classProto, classInherit){
    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        that.completeHandler = that.complete.bind(that);
        // Add events
        // Call parent method
        classInherit.prototype.construct.apply(that, arguments);
    };

    classProto.get = function(){
        var that = this,
            data;
        if(that.activeTab){
            switch(that.activeTab['id']){
                case 'local':
                    data = that.components['local'].get();
                    that.afterGet(data);
                    break;
                case 'fileManager':
                    that.components['fileManager'].get();
                    break;
            }
        }
        return that;
    };

    classProto.complete = function(){
        var that = this,
            data;
        if(that.activeTab){
            switch(that.activeTab['id']){
                case 'local':
                    data = that.components['local'].get();
                    that.afterComplete(data);
                    break;
                case 'fileManager':
                    that.components['fileManager'].complete();
                    break;
                case 'stock':
                    that.components['stock'].complete();
                    break;
            }
        }
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        // Components parameters
        that.params['localParams']['max'] = that.params['max'];
        that.params['fileManagerParams']['max'] = that.params['max'];
        that.params['fileManagerParams']['lazy'] = that.params['fileManagerLazy'];
        that.params['stock']['max'] = that.params['max'];
        that.params['stock']['lazy'] = that.params['fileManagerLazy'];
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        that.triggerEvent('onRenderViewStart');
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__file-uploader'},
            that.nodes['inner'] = cm.node('div', {'class' : 'inner'},
                that.nodes['content'] = cm.node('div', {'class' : 'app__file-uploader__content'})
            )
        );
        // Local
        if(that.params['local']){
            that.nodes['local'] = that.renderLocal();
        }
        // File Manager
        if(that.params['fileManager']){
            that.nodes['fileManager'] = that.renderFileManager();
        }
        // File Manager
        if(that.params['stock']){
            that.nodes['stock'] = that.renderStock();
        }
        // Events
        that.triggerEvent('onRenderViewProcess');
        that.triggerEvent('onRenderViewEnd');
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Init Files Input
        if(that.params['local']){
            cm.getConstructor(that.params['localConstructor'], function(classObject){
                that.components['local'] = new classObject(
                    cm.merge(that.params['localParams'], {
                        'node' : that.nodes['local']['holder']
                    })
                );
                if(that.params['completeOnSelect']){
                    that.components['local'].addEvent('onSelect', function(my, data){
                        that.afterComplete(data);
                    });
                }
            });
        }
        // Init File Manager
        if(that.params['fileManager']){
            cm.getConstructor(that.params['fileManagerConstructor'], function(classObject){
                that.components['fileManager'] = new classObject(
                    cm.merge(that.params['fileManagerParams'], {
                        'node' : that.nodes['fileManager']['holder']
                    })
                );
                that.components['fileManager'].addEvent('onGet', function(my, data){
                    that.afterGet(data);
                });
                that.components['fileManager'].addEvent('onComplete', function(my, data){
                    that.afterComplete(data);
                });
            });
        }
        // Init Stock
        if(that.params['stock']){
            cm.getConstructor(that.params['stockConstructor'], function(classObject){
                that.components['stock'] = new classObject(
                    cm.merge(that.params['stockParams'], {
                        'node' : that.nodes['stock']['holder']
                    })
                );
                that.components['stock'].addEvent('onGet', function(my, data){
                    that.afterGet(data);
                });
                that.components['stock'].addEvent('onComplete', function(my, data){
                    that.afterComplete(data);
                });
            });
        }
        // Init Tabset
        that.renderTabset();
        // Init Stats
        if(that.params['showStats']){
            cm.getConstructor('Com.FileStats', function(classObject, className){
                that.components['stats'] = new classObject(
                    cm.merge(that.params[className], {
                        'container' : that.nodes['content']
                    })
                );
            });
        }
        return that;
    };

    classProto.renderTabset = function(){
        var that = this;
        cm.getConstructor('Com.Tabset', function(classObject, className){
            that.components['tabset'] = new classObject(
                cm.merge(that.params[className], {
                    'container' : that.nodes['content']
                })
            );
            that.components['tabset'].addEvent('onTabShow', function(my, data){
                that.activeTab = data;
                switch(that.activeTab['id']){
                    case 'fileManager':
                        that.components['fileManager'] && that.components['fileManager'].load();
                        break;
                    case 'stock':
                        that.components['stock'] && that.components['stock'].load();
                        break;
                }
            });
            that.renderTabs();
        });
        return that;
    };

    classProto.renderTabs = function(){
        var that = this,
            initialTab;
        if(that.params['local']){
            that.components['tabset'].addTab({
                'id' : 'local',
                'title' : that.lang('tab_local'),
                'content' : that.nodes['local']['li']
            });
            if(cm.isEmpty(initialTab)){
                initialTab = 'local'
            }
        }
        if(that.params['fileManager']){
            that.components['tabset'].addTab({
                'id' : 'fileManager',
                'title' : that.lang('tab_filemanager'),
                'content' : that.nodes['fileManager']['li']
            });
            if(cm.isEmpty(initialTab)){
                initialTab = 'fileManager';
            }
        }
        if(that.params['stock']){
            that.components['tabset'].addTab({
                'id' : 'stock',
                'title' : that.lang('tab_stock'),
                'content' : that.nodes['stock']['li']
            });
            if(cm.isEmpty(initialTab)){
                initialTab = 'stock';
            }
        }
        // Set initial tab
        that.components['tabset'].set(initialTab);
    };

    classProto.renderLocal = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['li'] = cm.node('li',
            nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__local-container'},
                nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'})
            )
        );
        return nodes;
    };

    classProto.renderFileManager = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['li'] = cm.node('li',
            nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__file-manager is-fullsize'},
                nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'})
            )
        );
        return nodes;
    };

    classProto.renderStock = function(){
        var that = this,
            nodes = {};
        // Structure
        nodes['li'] = cm.node('li',
            nodes['container'] = cm.node('div', {'class' : 'app__file-uploader__stock is-fullsize'},
                nodes['holder'] = cm.node('div', {'class' : 'app__file-uploader__holder'})
            )
        );
        return nodes;
    };

    /* *** AFTER EVENTS *** */

    classProto.afterGet = function(data){
        var that = this;
        that.items = data;
        that.triggerEvent('onGet', that.items);
        return that;
    };

    classProto.afterComplete = function(data){
        var that = this;
        that.items = data;
        that.triggerEvent('onComplete', that.items);
        return that;
    };
});