cm.define('App.ShutterstockManager', {
    'extend' : 'Com.AbstractFileManager',
    'params' : {
        'name' : 'shutterstock-manager',
        'lazy' : true,
        'showStats' : true,
        'statsConstructor' : 'App.ShutterstockStats',
        'statsParams' : {},
        'toolbarConstructor' : 'Com.Toolbar',
        'toolbarParams' : {
            'embedStructure' : 'first'
        },
        'searchConstructor' : 'Com.Input',
        'searchParams' : {
            'embedStructure' : 'append',
            'defaultValue' : null,
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
        'categoriesParams' : {},
        'paginationConstructor' : 'Com.GalleryScrollPagination',
        'paginationParams' : {
            'embedStructure' : 'append',
            'showButton' : 'once',
            'gridClass' : 'pt__grid--files',
            'perPage' : 25,
            'columns' : 5,
            'responseCountKey' : 'total_count',
            'responseHTML' : false,
            'ajax' : {
                'type' : 'json',
                'method' : 'get',
                'url' : '/shutterstock-api/images/search/%page%',
                'urlPurchased' : '/shutterstock-api/images/src'
            }
        },
        'overlayConstructor' : 'Com.Overlay',
        'overlayParams' : {
            'autoOpen' : false,
            'lazy' : true,
            'position' : 'absolute'
        },
        'tourConstructor' : 'Com.Overlay',
        'tourParams' : {
            'autoOpen' : false,
            'lazy' : true,
            'showSpinner' : false,
            'showContent' : true,
            'position' : 'absolute'
        }
    },
    'strings' : {
        'categories' : {
            '_all' : 'All',
            '_purchased' : 'My Purchased Images'
        },
        'server_error' : 'An unexpected error has occurred. Please try again later.',
        'empty' : 'There are no items to show.',
        'tour' : {
            'content' : '<p>Images are watermarked and can be used only on a temporary basis, and for evaluation purposes. To remove the watermark and obtain the usage rights to use the image on your website (only) you must purchase a license. A list of all temporary images you’ve downloaded, as well as the ability to purchase a use license - can be found in Modules > Manage > Shutterstock.</p>',
            'confirm' : 'Yes, I agree',
            'check' : 'Don\'t show this message again'
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

cm.getConstructor('App.ShutterstockManager', function(classConstructor, className, classProto, classInherit){
    classProto.onConstructStart = function(){
        var that = this;
        // Variables
        that.categories = [{
            'id' : '_purchased',
            'name' : that.lang('categories._purchased')
        },{
            'id' : '_all',
            'name' : that.lang('categories._all')
        }];
        that.currentCategory = null;
        that.currentQuery = null;
        that.currentItem = null;
        // Binds
        that.renderCategoriesResponseHandler = that.renderCategoriesResponse.bind(that);
        that.renderCategoriesErrorHandler = that.renderCategoriesError.bind(that);
        that.renderListPageHandler = that.renderListPage.bind(that);
        that.renderListErrorHandler = that.renderListError.bind(that);
        that.renderListEmptyHandler = that.renderListEmpty.bind(that);
        that.setListCategoryHandler = that.setListCategory.bind(that);
        that.setListQueryHandler = that.setListQuery.bind(that);
        that.showTourHandler = that.showTour.bind(that);
        that.hideTourHandler = that.hideTour.bind(that);
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

    classProto.renderCategoriesError = function(request, response){
        var that = this,
            message = !cm.isEmpty(response['message']) ? response['message'] : 'server_error',
            node = cm.node('div', {'class' : 'cm__empty is-show'}, that.lang(message));
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
        // Show tour
        that.showTour();
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
        item['title'] = item['name'].replace('/', ' / ');
        item['label'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('a', item['title'])
        );
        // Embed
        cm.appendChild(nodes['container'], that.nodes['categories']['tabsHolder']);
        // Separator
        if(item['id'] === '_purchased'){
            nodes['sep'] = cm.node('li', {'class' : 'sep'});
            cm.appendChild(nodes['sep'], that.nodes['categories']['tabsHolder']);
        }
    };

    classProto.renderCategoriesViewModel = function(){
        var that = this,
            toolbarSearchField;
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
            toolbarSearchField = that.components['toolbar'].getField('search', 'all');
            that.components['search'] = toolbarSearchField['controller'];
        });
        // Init tabset helper
        cm.getConstructor(that.params['categoriesConstructor'], function(classConstructor){
            that.components['tabset'] = new classConstructor(
                cm.merge(that.params['categoriesParams'], {
                    'items' : that.categories
                })
            );
            that.components['tabset'].addEvent('onTabShowStart', that.setListCategoryHandler);
            that.components['tabset'].set('_all');
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
                that.removeListErrors();
            });
            that.components['pagination'].addEvent('onEnd', function(){
                that.components['overlay'].close();
            });
            that.components['pagination'].addEvent('onPageRenderEnd', that.renderListPageHandler);
            that.components['pagination'].addEvent('onError', that.renderListErrorHandler);
            that.components['pagination'].addEvent('onEmpty', that.renderListEmptyHandler);
        });
        // Init tour
        cm.getConstructor(that.params['tourConstructor'], function(classConstructor){
            that.components['tour'] = new classConstructor(
                cm.merge(that.params['tourParams'], {
                    'container' : that.nodes['container']
                })
            );
            that.components['tour'].addEvent('onOpenStart', function(){
                cm.addClass(that.nodes['container'], 'is-blur');
            });
            that.components['tour'].addEvent('onCloseStart', function(){
                cm.removeClass(that.nodes['container'], 'is-blur');
            });
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

    classProto.renderListEmpty = function(){
        var that = this;
        if(that.components['pagination'].currentPage === 1){
            that.components['pagination'].clear();
            // Render structure
            if(!that.nodes['categories']['empty']){
                that.nodes['categories']['empty'] = cm.node('div', {'class' : 'cm__empty'}, that.lang('empty'));
            }
            // Embed
            cm.insertFirst(that.nodes['categories']['empty'], that.nodes['categories']['listHolder']);
            cm.addClass(that.nodes['categories']['empty'], 'is-show', true);
        }
    };

    classProto.removeListErrors = function(){
        var that = this;
        cm.removeClass(that.nodes['categories']['error'], 'is-show');
        cm.remove(that.nodes['categories']['error']);
        cm.removeClass(that.nodes['categories']['empty'], 'is-show');
        cm.remove(that.nodes['categories']['empty']);
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
        item = cm.merge(item, that.convertFile(item));
        item['nodes'] = nodes;
        // Structure
        nodes['container'] = cm.node('li',
            nodes['link'] = cm.node('div', {'class' : 'pt__image is-loading is-centered is-background is-cover is-hover', 'title' : item['description']},
                cm.node('div', {'class' : 'inner'},
                    nodes['descr'] = cm.node('div', {'class' : 'descr'})
                )
            )
        );
        nodes['descr'].style.backgroundImage = cm.URLToCSSURL(item['thumbnail']);
        // Load
        cm.onImageLoad(item['thumbnail'], function(){
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
        that.setPagination();
    };

    classProto.setListQuery = function(input, value){
        var that = this;
        that.currentQuery = value;
        // Update pagination action
        that.setPagination();
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

    classProto.setPagination = function(){
        var that = this,
            pageCount = that.currentCategory === '_purchased' ? 1 : 0,
            urlType = that.currentCategory === '_purchased' ? 'urlPurchased' : 'url',
            category = /^_/.test(that.currentCategory) ? null : that.currentCategory,
            query = that.currentCategory === '_purchased' ? null : that.currentQuery;
        // Set search
        if(that.currentCategory === '_purchased'){
            that.components['search'].disable();
        }else{
            that.components['search'].enable();
        }
        // Set pagination
        if(that.components['pagination']){
            that.components['overlay'].open();
            that.components['pagination'].setParams({
                'pageCount' : pageCount
            });
            that.components['pagination'].setAction({
                'url' : that.params['paginationParams']['ajax'][urlType],
                'params' : {
                    'category' : category,
                    'query' : query
                }
            });
        }
    };

    /* *** TOUR *** */

    classProto.renderTourView = function(){
        var that = this,
            nodes = {};
        that.nodes['tour'] = nodes;
        // Structure
        nodes['container'] = cm.node('div', {'class' : 'stock__tour'},
            cm.node('div', {'class' : 'inner'},
                cm.node('div', {'class' : 'stock__tour__content', 'innerHTML' : that.lang('tour.content')}),
                cm.node('div', {'class' : 'pt__buttons'},
                    nodes['buttonsInner'] = cm.node('div', {'class' : 'inner'},
                        nodes['buttonsLeft'] = cm.node('div', {'class' : 'left'}),
                        nodes['buttonsRight'] = cm.node('div', {'class' : 'right'},
                            nodes['confirm'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('tour.confirm'))
                        )
                    )
                )
            )
        );
        // Components
        cm.getConstructor('Com.Check', function(classConstructor){
            that.components['tourCheck'] = new classConstructor({
                'placeholder' : that.lang('tour.check'),
                'container' : nodes['buttonsLeft']
            });
        });
        // Events
        cm.addEvent(nodes['confirm'], 'click', that.hideTourHandler);
        // Set content
        that.components['tour'].setContent(nodes['container']);
    };

    classProto.showTour = function(){
        var that = this,
            isConfirmed = that.storageRead('tourConfirmed') === 'yes';
        if(!isConfirmed){
            that.renderTourView();
            that.components['tour'].open();
        }
    };

    classProto.hideTour = function(){
        var that = this,
            isChecked = that.components['tourCheck'].get();
        if(isChecked){
            that.storageWrite('tourConfirmed', 'yes');
        }
        that.components['tour'].close();
    };

    /* *** PROCESS FILES *** */

    classProto.convertFile = function(data){
        // Return converted data
        if(data['assets']){
            return {
                'value' : data['assets']['preview']['url'],
                'name' : data['assets']['preview']['url'].split('/').pop(),
                'description' : data['description'],
                'mime' : data['media_type'],
                'size' : null,
                'url' : data['assets']['preview']['url'],
                'thumbnail' : data['assets']['huge_thumb']['url'],
                'id' : data['id'],
                'source' : 'shutterstock_preview'
            }
        }else{
            return {
                'value' : data['src'],
                'name' : data['src'].split('/').pop(),
                'description' : '',
                'mime' : null,
                'size' : null,
                'url' : data['src'],
                'thumbnail' : data['src'],
                'id' : data['id'],
                'source' : 'shutterstock_purchased'
            }
        }
    };
});