cm.define('App.ShutterstockManager', {
    'extend' : 'Com.AbstractFileManager',
    'params' : {
        'lazy' : true,
        'showStats' : false,
        'toolbarConstructor' : 'Com.Toolbar',
        'toolbarParams' : {
            'embedStructure' : 'first'
        },
        'searchConstructor' : 'Com.Input',
        'searchParams' : {
            'embedStructure' : 'append',
            'lazy' : true,
            'icon' : 'icon small search linked'
        },
        'categoriesRequestConstructor' : 'Com.Request',
        'categoriesRequestParams' : {
            'autoSend' : false,
            'responseHTML' : false,
            'ajax' : {
                'type' : 'json',
                'method' : 'get',
                'url' : '/shutterstock-api/images/categories'
            }
        },
        'categoriesConstructor' : 'Com.TabsetHelper',
        'categoriesParams' : {
        },
        'paginationConstructor' : 'Com.GalleryScrollPagination',
        'paginationParams' : {
            'embedStructure' : 'append',
            'showButton' : 'once',
            'perPage' : 30,
            'columns' : 5,
            'responseCountKey' : 'total_count',
            'responseHTML' : false,
            'ajax' : {
                'type' : 'json',
                'method' : 'get',
                'url' : '/shutterstock-api/images/search/%page%'
            }
        },
        'overlayConstructor' : 'Com.Overlay',
        'overlayParams' : {
            'autoOpen' : false,
            'lazy' : true,
            'position' : 'absolute'
        }
    },
    'strings' : {
        'all' : 'All',
        'server_error' : 'An unexpected error has occurred. Please try again later.'
    }
},
function(params){
    var that = this;
    that.getFilesProcessType = null;
    that.isLoaded = false;
    // Call parent class construct
    Com.AbstractFileManager.apply(that, arguments);
});

cm.getConstructor('App.ShutterstockManager', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.categories = [{
            'id' : 'all',
            'name' : that.lang('all')
        }];
        that.currentCategory = null;
        that.currentQuery = null;
        that.currentItem = null;
        // Binds
        that.renderCategoriesResponseHandler = that.renderCategoriesResponse.bind(that);
        that.renderCategoriesErrorHandler = that.renderCategoriesError.bind(that);
        that.renderListPageHandler = that.renderListPage.bind(that);
        that.renderListErrorHandler = that.renderListError.bind(that);
        that.setListCategoryHandler = that.setListCategory.bind(that);
        that.setListQueryHandler = that.setListQuery.bind(that);
    };

    classProto.renderController = function(){
        var that = this;
        that.isLoaded = true;
        // Request categories
        cm.getConstructor(that.params['categoriesRequestConstructor'], function(classConstructor){
            that.components['categoriesRequest'] = new classConstructor(
                cm.merge(that.params['categoriesRequestParams'], {
                    'overlayContainer' : that.nodes['inner']
                })
            );
            that.components['categoriesRequest'].addEvent('onSuccess', that.renderCategoriesResponseHandler);
            that.components['categoriesRequest'].addEvent('onError', that.renderCategoriesErrorHandler);
            that.components['categoriesRequest'].send();
        });
    };

    /* *** CATEGORIES *** */

    classProto.renderCategoriesError = function(){
        var that = this,
            node = cm.node('div', {'class' : 'cm__empty is-show'}, that.lang('server_error'));
        // Embed
        cm.clearNode(that.nodes['holder']['inner']);
        cm.appendChild(node, that.nodes['holder']['inner']);
        // Show
        cm.removeClass(that.nodes['holder']['container'], 'is-hidden', true);
    };

    classProto.renderCategoriesResponse = function(request, response){
        var that = this,
            data = response['filtered'];
        // Render categories
        that.categories = cm.extend(that.categories, data);
        that.renderCategoriesView();
        that.renderCategoriesViewModel();
        // Show
        cm.removeClass(that.nodes['holder']['container'], 'is-hidden', true);
    };

    classProto.renderCategoriesView = function(){
        var that = this,
            nodes = {};
        that.nodes['categories'] = nodes;
        // Render structure
        nodes['container'] = cm.node('div', {'class' : 'stock__view'},
            cm.node('div', {'class' : 'stock__tabs'},
                cm.node('div', {'class' : 'inner'},
                    cm.node('div', {'class' : 'pt__listing-items'},
                        nodes['tabsHolder'] = cm.node('ul')
                    )
                )
            ),
            nodes['list'] = cm.node('div', {'class' : 'stock__list'},
                nodes['listHolder'] = cm.node('div', {'class' : 'inner'})
            )
        );
        // Render tabs
        cm.forEach(that.categories, function(item){
            that.renderTab(item);
        });
        // Embed
        cm.clearNode(that.nodes['holder']['inner']);
        cm.appendChild(nodes['container'], that.nodes['holder']['inner']);
    };

    classProto.renderTab = function(item){
        var that = this,
            nodes = {};
        // Validate
        item['title'] = item['name'];
        item['label'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('a', item['title'])
        );
        // Embed
        cm.appendChild(nodes['container'], that.nodes['categories']['tabsHolder']);
    };

    classProto.renderCategoriesViewModel = function(){
        var that = this;
        // Render toolbar
        cm.getConstructor(that.params['toolbarConstructor'], function(classConstructor){
            that.components['toolbar'] = new classConstructor(
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
                'constructorParams' : cm.merge(that.params['searchParams'], {
                    'events' : {
                        'onChange' : that.setListQueryHandler
                    }
                })
            });
        });
        // Init tabset helper
        cm.getConstructor(that.params['categoriesConstructor'], function(classConstructor){
            that.components['tabset'] = new classConstructor(
                cm.merge(that.params['categoriesParams'], {
                    'items' : that.categories
                })
            );
            that.components['tabset'].addEvent('onTabShowStart', that.setListCategoryHandler);
            that.components['tabset'].set('all');
        });
        // Init overlay
        cm.getConstructor(that.params['overlayConstructor'], function(classConstructor){
            that.components['overlay'] = new classConstructor(
                cm.merge(that.params['overlayParams'], {
                    'container' : that.nodes['categories']['list']
                })
            );
        });
        // Init pagination
        cm.getConstructor(that.params['paginationConstructor'], function(classConstructor){
            that.components['pagination'] = new classConstructor(
                cm.merge(that.params['paginationParams'], {
                    'container' : that.nodes['categories']['listHolder'],
                    'scrollNode' : that.nodes['categories']['listHolder']
                })
            );
            that.components['pagination'].addEvent('onStart', function(){
                that.removeListError();
            });
            that.components['pagination'].addEvent('onEnd', function(){
                that.components['overlay'].close();
            });
            that.components['pagination'].addEvent('onPageRenderEnd', that.renderListPageHandler);
            that.components['pagination'].addEvent('onError', that.renderListErrorHandler);
        });
    };

    /* *** LIST *** */

    classProto.renderListError = function(){
        var that = this;
        if(cm.isEmpty(that.components['pagination'].currentPage)){
            // Render structure
            if(!that.nodes['categories']['error']){
                that.nodes['categories']['error'] = cm.node('div', {'class' : 'cm__empty'}, that.lang('server_error'));
            }
            // Embed
            cm.insertFirst(that.nodes['categories']['error'], that.nodes['categories']['listHolder']);
            cm.addClass(that.nodes['categories']['error'], 'is-show', true);
        }
    };

    classProto.removeListError = function(){
        var that = this;
        cm.removeClass(that.nodes['categories']['error'], 'is-show');
        cm.remove(that.nodes['categories']['error']);
    };

    classProto.renderListPage = function(pagination, page){
        var that = this;
        // Render items
        cm.forEach(page['data'], function(item){
            that.renderListItem(item, page['container']);
        });
    };

    classProto.renderListItem = function(item, container){
        var that = this,
            nodes = {};
        item['nodes'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('div', {'class' : 'pt__image is-loading is-centered is-background is-cover is-hover', 'title' : item['description']},
                cm.node('div', {'class' : 'inner'},
                    nodes['descr'] = cm.node('div', {'class' : 'descr'})
                )
            )
        );
        nodes['descr'].style.backgroundImage = cm.URLToCSSURL(item['assets']['huge_thumb']['url']);
        // Load
        cm.onImageLoad(item['assets']['huge_thumb']['url'], function(){
            cm.addClass(nodes['link'], 'is-loaded', true);
        });
        // Events
        cm.addEvent(nodes['link'], 'click', function(){
            that.setListItem(item);
        });
        cm.addEvent(nodes['link'], 'dblclick', function(){
            that.processFiles(item);
            that.complete();
        });
        // Embed
        cm.appendChild(nodes['container'], container);
    };

    classProto.setListCategory = function(tabset, tab){
        var that = this;
        that.currentCategory = tab['id'];
        // Update pagination action
        if(that.components['pagination']){
            that.components['overlay'].open();
            // Set category
            that.components['pagination'].setAction({
                'params' : {
                    'category' : that.currentCategory === 'all' ? null : that.currentCategory
                }
            });
        }
    };

    classProto.setListQuery = function(input, value){
        var that = this;
        that.currentQuery = value;
        // Update pagination action
        if(that.components['pagination']){
            that.components['overlay'].open();
            // Set query
            that.components['pagination'].setAction({
                'params' : {
                    'query' : that.currentQuery
                }
            });
        }
    };

    classProto.setListItem = function(item){
        var that = this;
        // Unset previous
        if(that.currentItem){
            cm.removeClass(that.currentItem['nodes']['link'], 'active');
            that.currentItem = null;
        }
        // Set new
        cm.addClass(item['nodes']['link'], 'active');
        that.currentItem = item;
        that.processFiles(item);
    };

    /* *** PROCESS FILES *** */

    classProto.convertFile = function(data){
        return {
            'value' : data['assets']['preview']['url'],
            'name' : data['description'],
            'mime' : data['media_type'],
            'size' : null,
            'url' : data['assets']['preview']['url']
        }
    };
});