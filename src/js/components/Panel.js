cm.define('App.Panel', {
    'modules' : [
        'Params',
        'Events',
        'Langs',
        'Structure',
        'DataConfig',
        'Storage',
        'Stack'
    ],
    'events' : [
        'onRenderStart',
        'onRender',
        'onOpenStart',
        'onOpen',
        'onCloseStart',
        'onClose',
        'onError',
        'onSaveStart',
        'onSave',
        'onSaveEnd',
        'onSaveError',
        'onSaveSuccess',
        'onSaveFailure',
        'onLoadStart',
        'onLoad',
        'onLoadEnd',
        'onLoadError',
        'onCancelStart',
        'onCancel'
    ],
    'params' : {
        'node' : cm.node('div'),
        'container' : 'document.body',
        'name' : '',
        'embedStructure' : 'append',
        'type' : 'sidebar',                             // sidebar | story | fullscreen
        'duration' : 'cm._config.animDurationLong',
        'autoOpen' : true,
        'destructOnClose' : true,
        'showCloseButton' : true,
        'showBackButton' : false,
        'showButtons' : true,
        'showOverlay' : true,
        'overlayDelay' : 0 ,
        'overlayPosition' : 'content',                  // dialog | content
        'title' : null,
        'content' : null,
        'collector' : null,
        'constructCollector' : true,
        'responseKey' : 'data',
        'responseContentKey' : 'data.content',
        'responseTitleKey' : 'data.title',
        'responseStatusKey' : 'data.success',
        'renderContentOnSuccess' : false,
        'closeOnSuccess' : true,
        'get' : {                                       // Get dialog content ajax
            'type' : 'json',
            'method' : 'GET',
            'url' : '',                                 // Request URL. Variables: %baseurl%, %callback%.
            'params' : ''                               // Params object. Variables: %baseurl%, %callback%.
        },
        'post' : {                                      // Submit form ajax
            'type' : 'json',
            'method' : 'POST',
            'url' : '',                                 // Request URL. Variables: %baseurl%, %callback%.
            'params' : ''                               // Params object. Variables: %baseurl%, %callback%.
        },
        'langs' : {
            'close' : 'Close',
            'cancel' : 'Cancel',
            'save' : 'Save',
            'saving' : 'Saving...',
            'reload' : 'Reload',
            'cancelDescription' : 'Cancel'
        },
        'Com.Request' : {
            'wrapContent' : true,
            'swapContentOnError' : false,
            'renderContentOnSuccess' : false,
            'autoSend' : false,
            'responseKey' : 'data',
            'responseHTML' : true
        },
        'Com.Overlay' : {
            'autoOpen' : false,
            'removeOnClose' : true,
            'showSpinner' : true,
            'showContent' : false,
            'position' : 'absolute',
            'theme' : 'light'
        }
    }
},
function(params){
    var that = this;
    that.nodes = {};
    that.components = {};
    that.isOpen = false;
    that.isLoaded = false;
    that.isDestructed = false;
    that.isProccesing = false;
    that.destructOnClose = false;
    that.hasGetRequest = false;
    that.hasPostRequest = false;
    that.isGetRequest = false;
    that.isPostRequest = false;
    that.transitionInterval = null;
    that.construct(params);
});

cm.getConstructor('App.Panel', function(classConstructor, className, classProto){

    /* *** PUBLIC *** */

    classProto.construct = function(params){
        var that = this;
        that.openHandler = that.open.bind(that);
        that.closeHandler = that.close.bind(that);
        that.saveHandler = that.save.bind(that);
        that.cancelHandler = that.cancel.bind(that);
        that.loadHandler = that.load.bind(that);
        that.transitionOpenHandler = that.transitionOpen.bind(that);
        that.transitionCloseHandler = that.transitionClose.bind(that);
        that.windowKeydownHandler = that.windowKeydown.bind(that);
        that.getLESSVariables();
        that.setParams(params);
        that.convertEvents(that.params['events']);
        that.getDataConfig(that.params['node']);
        that.validateParams();
        that.addToStack(that.params['node']);
        that.triggerEvent('onRenderStart');
        that.render();
        that.setEvents();
        that.addToStack(that.nodes['container']);
        that.triggerEvent('onRender');
        that.params['autoOpen'] && that.open();
        return that;
    };

    classProto.destruct = function(){
        var that = this;
        if(that.isOpen){
            that.destructOnClose = true;
            that.close();
        }else if(!that.isDestructed){
            that.isDestructed = true;
            cm.customEvent.trigger(that.nodes['contentHolder'], 'destruct', {
                'type' : 'child',
                'self' : false
            });
            that.unsetEvents();
            that.removeFromStack();
            cm.remove(that.nodes['container']);
        }
        return that;
    };

    classProto.open = function(){
        var that = this;
        if(!that.isOpen){
            that.embedStructure(that.nodes['container']);
            that.triggerEvent('onOpenStart');
            // Get
            if(that.hasGetRequest){
                that.load();
            }else{
                that.isLoaded = true;
                that.showButton(['close', 'save']);
                that.params['showButtons'] && that.showButtons(true);
                cm.customEvent.trigger(that.nodes['contentHolder'], 'redraw', {
                    'type' : 'child',
                    'self' : false
                });
            }
            // Animate
            that.nodes['contentHolder'].scrollTop = 0;
            cm.addClass(that.nodes['container'], 'is-open', true);
            that.transitionInterval = setTimeout(that.transitionOpenHandler, that.params['duration']);
        }
        return that;
    };

    classProto.close = function(){
        var that = this;
        if(that.isProccesing){
            that.cancel();
        }
        if(that.isOpen){
            that.triggerEvent('onCloseStart');
            cm.removeClass(that.nodes['container'], 'is-open', true);
            that.transitionInterval = setTimeout(that.transitionCloseHandler, that.params['duration']);
        }
        return that;
    };

    classProto.save = function(){
        var that = this,
            params;
        if(that.isProccesing){
            that.cancel();
        }
        that.isPostRequest = true;
        that.triggerEvent('onSaveStart');
        if(that.hasPostRequest){
            // Get Params and Form Data
            params = cm.clone(that.params['post']);
            if(params['formData']){
                params['params'] = new FormData(that.nodes['contentHolder']);
            }else{
                params['params'] = cm.merge(params['params'], cm.getFDO(that.nodes['contentHolder']));
            }
            // Send
            that.showButton(['cancel', 'saving']);
            that.components['request']
                .setAction(params, 'update')
                .send();
        }else{
            that.showButton(['close', 'save']);
            that.triggerEvent('onSave');
            that.triggerEvent('onSaveEnd');
        }
        return that;
    };
    
    classProto.load = function(){
        var that = this;
        if(that.isProccesing){
            that.cancel();
        }
        that.isGetRequest = true;
        that.triggerEvent('onLoadStart');
        if(that.hasGetRequest){
            that.showButton('cancel');
            that.components['request']
                .setAction(that.params['get'], 'update')
                .send();
        }else{
            that.showButton(['close', 'save']);
            that.triggerEvent('onLoad');
            that.triggerEvent('onLoadEnd');
        }
        return that;
    };

    classProto.cancel = function(){
        var that = this;
        that.triggerEvent('onCancelStart');
        that.components['request'].abort();
        if(that.isLoaded){
            that.showButton(['close', 'save']);
        }else{
            that.showButton(['close', 'reload']);
        }
        that.triggerEvent('onCancel');
        return that;
    };

    /* *** CONTENT *** */

    classProto.setTitle = function(value){
        var that = this;
        cm.customEvent.trigger(that.nodes['label'], 'destruct', {
            'type' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['label']);
        if(cm.isNode(value)){
            cm.appendChild(value, that.nodes['label']);
        }else if(!cm.isEmpty(value)){
            that.nodes['label'].innerHTML = value;
        }
        return that;
    };

    classProto.setContent = function(node){
        var that = this;
        cm.customEvent.trigger(that.nodes['contentHolder'], 'destruct', {
            'type' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['contentHolder']);
        if(cm.isNode(node)){
            cm.appendChild(node, that.nodes['contentHolder']);
        }
        return that;
    };

    /* *** SYSTEM *** */

    classProto.getLESSVariables = function(){
        var that = this;
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppPanel-Duration', that.params['duration']);
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        that.params['Com.Request']['Com.Overlay'] = that.params['Com.Overlay'];
        that.params['Com.Request']['showOverlay'] = that.params['showOverlay'];
        that.params['Com.Request']['overlayDelay'] = that.params['overlayDelay'];
        that.params['Com.Request']['responseKey'] = that.params['responseKey'];
        that.params['Com.Request']['responseHTMLKey'] = that.params['responseContentKey'];
        that.params['Com.Request']['responseStatusKey'] = that.params['responseStatusKey'];
        that.params['Com.Request']['renderContentOnSuccess'] = that.params['renderContentOnSuccess'];
        that.destructOnClose = that.params['destructOnClose'];
        that.hasGetRequest = !cm.isEmpty(that.params['get']['url']);
        that.hasPostRequest = !cm.isEmpty(that.params['post']['url']);
        return that;
    };

    classProto.render = function(){
        var that = this;
        // Structure
        that.renderView();
        // Attributes
        that.setAttributes();
        // Content
        that.setTitle(that.params['title']);
        that.setContent(that.params['content']);
        // Overlay
        switch(that.params['overlayPosition']){
            case 'content':
                that.params['Com.Overlay']['container'] = that.nodes['content'];
                that.params['Com.Request']['overlayContainer'] = that.nodes['content'];
                break;
            case 'dialog':
            default:
                that.params['Com.Overlay']['container'] = that.nodes['dialog'];
                that.params['Com.Request']['overlayContainer'] = that.nodes['dialog'];
                break;
        }
        // Request
        that.params['Com.Request']['container'] = that.nodes['contentHolder'];
        cm.getConstructor('Com.Request', function(classConstructor, className){
            that.components['request'] = new classConstructor(that.params[className]);
            that.components['request']
                .addEvent('onStart', function(){
                    that.isProccesing = true;
                })
                .addEvent('onEnd', function(){
                    that.isProccesing = false;
                    that.params['showButtons'] && that.showButtons();
                    if(that.isGetRequest){
                        that.triggerEvent('onLoadEnd');
                    }else if(that.isPostRequest){
                        that.triggerEvent('onSaveEnd');
                    }
                    that.isGetRequest = false;
                    that.isPostRequest = false;
                })
                .addEvent('onSuccess', function(my, data){
                    if(that.isGetRequest){
                        that.loadResponse(data);
                    }else if(that.isPostRequest){
                        that.saveResponse(data);
                    }
                })
                .addEvent('onError', function(){
                    if(that.isGetRequest){
                        that.loadError();
                    }else if(that.isPostRequest){
                        that.saveError();
                    }
                })
                .addEvent('onContentRender', function(){
                    that.constructCollector();
                })
                .addEvent('onContentRenderEnd', function(){
                    cm.customEvent.trigger(that.nodes['contentHolder'], 'redraw', {
                        'type' : 'child',
                        'self' : false
                    });
                });
        });
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__panel'},
            that.nodes['dialog'] = cm.node('div', {'class' : 'app__panel__dialog'},
                that.nodes['inner'] = cm.node('div', {'class' : 'inner'},
                    that.nodes['title'] = cm.node('div', {'class' : 'title'},
                        that.nodes['label'] = cm.node('div', {'class' : 'label'})
                    ),
                    that.nodes['content'] = cm.node('div', {'class' : 'content'},
                        that.nodes['contentHolder'] = cm.node('div', {'class' : 'inner'})
                    )
                )
            )
        );
        // Close Buttons
        that.nodes['close'] = cm.node('div', {'class' : 'icon cm-i cm-i__circle-close'});
        if(that.params['showCloseButton']){
            cm.insertLast(that.nodes['close'], that.nodes['title']);
        }
        that.nodes['back'] = cm.node('div', {'class' : 'icon cm-i cm-i__circle-arrow-left'});
        if(that.params['showBackButton']){
            cm.insertFirst(that.nodes['back'], that.nodes['title']);
        }
        // Buttons
        that.nodes['buttons'] = that.renderButtons();
        if(that.params['showButtons']){
            cm.appendChild(that.nodes['buttons'], that.nodes['inner']);
        }
        return that;
    };

    classProto.showButton = function(items){
        var that = this;
        cm.forEach(that.nodes['button'], function(node){
            cm.addClass(node, 'display-none');
        });
        if(cm.isArray(items)){
            cm.forEach(items, function(item){
                if(that.nodes['button'][item]){
                    cm.removeClass(that.nodes['button'][item], 'display-none');
                }
            });
        }else if(that.nodes['button'][items]){
            cm.removeClass(that.nodes['button'][items], 'display-none');
        }
    };

    classProto.showButtons = function(immediately){
        var that = this;
        cm.appendChild(that.nodes['buttons'], that.nodes['inner']);
        if(immediately){
            cm.addClass(that.nodes['buttons'], 'is-immediately', true);
        }
        cm.addClass(that.nodes['buttons'], 'is-show', true);
        return that;
    };

    classProto.renderButtons = function(){
        var that = this;
        that.nodes['button'] = {};
        // Structure
        that.nodes['buttons'] = cm.node('div', {'class' : 'buttons'},
            cm.node('div', {'class' : 'inner'},
                cm.node('div', {'class' : 'pt__buttons pull-justify'},
                    cm.node('div', {'class' : 'inner'},
                        that.nodes['button']['close'] = cm.node('div', {'class' : 'button button-danger'}, that.lang('close')),
                        that.nodes['button']['cancel'] = cm.node('div', {'class' : 'button button-danger'}, that.lang('cancel')),
                        that.nodes['button']['save'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('save')),
                        that.nodes['button']['reload'] = cm.node('div', {'class' : 'button button-primary'}, that.lang('reload')),
                        that.nodes['button']['saving'] = cm.node('div', {'class' : 'button button-primary has-icon has-icon-small'},
                            cm.node('div', {'class' : 'icon small loader'}),
                            cm.node('div', {'class' : 'label'}, that.lang('saving'))
                        )
                    )
                )
            )
        );
        // Attributes
        that.nodes['button']['cancel'].setAttribute('title', that.lang('cancelDescription'));
        that.nodes['button']['saving'].setAttribute('title', that.lang('cancelDescription'));
        // Events
        cm.addEvent(that.nodes['button']['save'], 'click', that.saveHandler);
        cm.addEvent(that.nodes['button']['close'], 'click', that.closeHandler);
        cm.addEvent(that.nodes['button']['cancel'], 'click', that.cancelHandler);
        cm.addEvent(that.nodes['button']['saving'], 'click', that.cancelHandler);
        cm.addEvent(that.nodes['button']['reload'], 'click', that.loadHandler);
        return that.nodes['buttons'];
    };

    classProto.setAttributes = function(){
        var that = this;
        // Attributes
        cm.addClass(that.nodes['container'], ['app__panel', that.params['type']].join('--'));
        that.nodes['back'].setAttribute('title', that.lang('close'));
        that.nodes['close'].setAttribute('title', that.lang('close'));
        // Events
        cm.addEvent(that.nodes['back'], 'click', that.closeHandler);
        cm.addEvent(that.nodes['close'], 'click', that.closeHandler);
        return that;
    };

    classProto.setEvents = function(){
        var that = this;
        cm.addEvent(window, 'keydown', that.windowKeydownHandler);
        return that;
    };

    classProto.unsetEvents = function(){
        var that = this;
        cm.removeEvent(window, 'keydown', that.windowKeydownHandler);
        return that;
    };

    classProto.windowKeydown = function(e){
        var that = this,
            target = cm.getEventTarget(e);
        if(cm.isKeyCode(e.keyCode, 'escape')){
            that.close();
        }
        return that;
    };

    classProto.constructCollector = function(){
        var that = this;
        if(that.params['constructCollector']){
            if(that.params['collector']){
                that.params['collector'].construct(that.nodes['contentHolder']);
            }else{
                cm.find('Com.Collector', null, null, function(classObject){
                    classObject.construct(that.nodes['contentHolder']);
                });
            }
        }
        return that;
    };

    classProto.transitionOpen = function(){
        var that = this;
        that.isOpen = true;
        that.triggerEvent('onOpen');
        return that;
    };

    classProto.transitionClose = function(){
        var that = this;
        that.destructOnClose && that.destruct();
        cm.remove(that.nodes['container']);
        that.isOpen = false;
        that.triggerEvent('onClose');
        return that;
    };

    classProto.loadResponse = function(data){
        var that = this;
        that.isLoaded = true;
        that.setTitle(cm.objectSelector(that.params['responseTitleKey'], data['response']));
        that.showButton(['close', 'save']);
        that.triggerEvent('onLoad');
        return that;
    };

    classProto.loadError = function(){
        var that = this;
        if(!that.isLoaded){
            that.showButton(['close', 'reload']);
        }else{
            that.showButton(['close', 'save']);
        }
        that.triggerEvent('onLoadError');
        that.triggerEvent('onError', 'load');
        return that;
    };

    classProto.saveResponse = function(data){
        var that = this;
        if(!data['status'] || (data['status'] && that.params['renderContentOnSuccess'])){
            that.setTitle(cm.objectSelector(that.params['responseTitleKey'], data['response']));
            that.showButton(['close', 'save']);
        }
        if(data['status']){
            if(that.params['closeOnSuccess']){
                that.close();
            }
            that.triggerEvent('onSaveSuccess', data);
        }else{
            that.triggerEvent('onSaveFailure', data);
        }
        that.triggerEvent('onSave', data);
        return that;
    };

    classProto.saveError = function(){
        var that = this;
        that.showButton(['close', 'save']);
        that.triggerEvent('onSaveError');
        that.triggerEvent('onError', 'save');
        return that;
    };
});