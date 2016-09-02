cm.define('App.Panel', {
    'extend' : 'Com.AbstractController',
    'events' : [
        'onOpenStart',
        'onOpen',
        'onOpenEnd',
        'onCloseStart',
        'onClose',
        'onCloseEnd',
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
        'embedStructureOnRender' : false,
        'customEvents' : true,
        'constructCollector' : true,
        'removeOnDestruct' : true,
        'type' : 'full',                                // sidebar | story | full
        'duration' : 'cm._config.animDurationLong',
        'autoOpen' : true,
        'destructOnClose' : true,
        'removeOnClose' : true,
        'showCloseButton' : true,
        'showBackButton' : false,
        'showButtons' : true,
        'showOverlay' : true,
        'overlayDelay' : 0 ,
        'overlayPosition' : 'content',                  // dialog | content
        'title' : null,
        'content' : null,
        'responseKey' : 'data',
        'responseContentKey' : 'data.content',
        'responseTitleKey' : 'data.title',
        'responseStatusKey' : 'data.success',
        'responsePreviewKey' : 'data.preview',
        'renderContentOnSuccess' : false,
        'closeOnSuccess' : true,
        'get' : {                                       // Get dialog content ajax
            'type' : 'json',
            'method' : 'GET',
            'url' : '',                                 // Request URL. Variables: %baseUrl%, %callback%.
            'params' : ''                               // Params object. Variables: %baseUrl%, %callback%.
        },
        'post' : {                                      // Submit form ajax
            'type' : 'json',
            'method' : 'POST',
            'url' : '',                                 // Request URL. Variables: %baseUrl%, %callback%.
            'params' : ''                               // Params object. Variables: %baseUrl%, %callback%.
        },
        'langs' : {
            'close' : 'Close',
            'back' : 'Back',
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
    that.isHide = false;
    that.isLoaded = false;
    that.isDestructed = false;
    that.isProccesing = false;
    that.destructOnClose = false;
    that.hasGetRequest = false;
    that.hasPostRequest = false;
    that.isGetRequest = false;
    that.isPostRequest = false;
    that.transitionInterval = null;
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.Panel', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    /* *** INIT *** */

    classProto.construct = function(params){
        var that = this;
        // Bind context to methods
        that.openHandler = that.open.bind(that);
        that.closeHandler = that.close.bind(that);
        that.saveHandler = that.save.bind(that);
        that.cancelHandler = that.cancel.bind(that);
        that.loadHandler = that.load.bind(that);
        that.transitionOpenHandler = that.transitionOpen.bind(that);
        that.transitionCloseHandler = that.transitionClose.bind(that);
        that.windowKeydownHandler = that.windowKeydown.bind(that);
        that.constructEndHandler = that.constructEnd.bind(that);
        that.setEventsProcessHandler = that.setEventsProcess.bind(that);
        that.unsetEventsProcessHandler = that.unsetEventsProcess.bind(that);
        // Add events
        that.addEvent('onConstructEnd', that.constructEndHandler);
        that.addEvent('onSetEventsProcess', that.setEventsProcessHandler);
        that.addEvent('onUnsetEventsProcess', that.unsetEventsProcessHandler);
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.destruct = function(){
        var that = this;
        if(that.isOpen){
            that.destructOnClose = true;
            that.close();
        }else if(!that.isDestructed){
            that.destructOnClose = that.params['destructOnClose'];
            // Call parent method
            _inherit.prototype.destruct.apply(that, arguments);
        }
        return that;
    };

    classProto.constructEnd = function(){
        var that = this;
        that.params['autoOpen'] && that.open();
        return that;
    };

    classProto.getLESSVariables = function(){
        var that = this;
        that.triggerEvent('onGetLESSVariablesStart');
        that.triggerEvent('onGetLESSVariablesProcess');
        that.params['duration'] = cm.getTransitionDurationFromLESS('AppPanel-Duration', that.params['duration']);
        that.triggerEvent('onGetLESSVariablesEnd');
        return that;
    };

    classProto.validateParams = function(){
        var that = this;
        that.triggerEvent('onValidateParamsStart');
        that.triggerEvent('onValidateParamsProcess');
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
        that.triggerEvent('onValidateParamsEnd');
        return that;
    };

    classProto.setEventsProcess = function(){
        var that = this;
        cm.addEvent(window, 'keydown', that.windowKeydownHandler);
        return that;
    };

    classProto.unsetEventsProcess = function(){
        var that = this;
        cm.removeEvent(window, 'keydown', that.windowKeydownHandler);
        return that;
    };

    /* *** PUBLIC *** */

    classProto.open = function(){
        var that = this;
        if(that.isDestructed){
            that.setEvents();
            that.isDestructed = false;
        }
        if(!that.isOpen){
            that.embedStructure(that.nodes['container']);
            that.addToStack(that.nodes['container']);
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

    classProto.hide = function(){
        var that = this;
        if(!that.isHide){
            that.isHide = true;
            cm.replaceClass(that.nodes['container'], 'is-show', 'is-hide');
        }
        return that;
    };

    classProto.show = function(){
        var that = this;
        if(that.isHide){
            that.isHide = false;
            cm.replaceClass(that.nodes['container'], 'is-hide', 'is-show');
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

    classProto.setTitle = function(node){
        var that = this;
        cm.customEvent.trigger(that.nodes['label'], 'destruct', {
            'type' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['label']);
        node = cm.strToHTML(node);
        if(!cm.isEmpty(node)){
            cm.appendNodes(node, that.nodes['label']);
            that.constructCollector(that.nodes['label']);
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
        node = cm.strToHTML(node);
        if(!cm.isEmpty(node)){
            cm.appendNodes(node, that.nodes['contentHolder']);
            that.constructCollector(that.nodes['contentHolder']);
        }
        return that;
    };

    classProto.setPreview = function(node){
        var that = this;
        cm.customEvent.trigger(that.nodes['previewHolder'], 'destruct', {
            'type' : 'child',
            'self' : false
        });
        cm.clearNode(that.nodes['previewHolder']);
        node = cm.strToHTML(node);
        if(!cm.isEmpty(node)){
            cm.addClass(that.nodes['previewHolder'], 'is-show');
            cm.appendNodes(node, that.nodes['previewHolder']);
            that.constructCollector(that.nodes['previewHolder']);
        }
        return that;
    };

    /* *** SYSTEM *** */

    classProto.renderView = function(){
        var that = this;
        // Structure
        that.nodes['container'] = cm.node('div', {'class' : 'app__panel'},
            that.nodes['dialogHolder'] = cm.node('div', {'class' : 'app__panel__dialog-holder'},
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
            ),
            that.nodes['previewHolder'] = cm.node('div', {'class' : 'app__panel__preview-holder'},
                that.nodes['preview'] = cm.node('div', {'class' : 'app__panel__preview'},
                    cm.node('div', {'class' : 'inner'},
                        cm.node('div', {'class' : 'title'}),
                        cm.node('div', {'class' : 'content'})
                    )
                )
            )
        );
        // Close Buttons
        if(that.params['showCloseButton']){
            that.nodes['close'] = cm.node('div', {'class' : 'icon cm-i cm-i__circle-close', 'title' : that.lang('close')});
            cm.addEvent(that.nodes['close'], 'click', that.closeHandler);
            cm.insertLast(that.nodes['close'], that.nodes['title']);
        }
        if(that.params['showBackButton']){
            that.nodes['back'] = cm.node('div', {'class' : 'icon cm-i cm-i__circle-arrow-left', 'title' : that.lang('back')});
            cm.addEvent(that.nodes['back'], 'click', that.closeHandler);
            cm.insertFirst(that.nodes['back'], that.nodes['title']);
        }
        // Buttons
        that.renderButtonsView();
        if(that.params['showButtons']){
            cm.appendChild(that.nodes['buttons'], that.nodes['inner']);
        }
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
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
        if(that.hasGetRequest || that.hasPostRequest){
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
                        that.constructCollector(that.nodes['contentHolder']);
                    })
                    .addEvent('onContentRenderEnd', function(){
                        cm.customEvent.trigger(that.nodes['contentHolder'], 'redraw', {
                            'type' : 'child',
                            'self' : false
                        });
                    });
            });
        }
        // Set Content
        !cm.isEmpty(that.params['title']) && that.setTitle(that.params['title']);
        !cm.isEmpty(that.params['content']) && that.setContent(that.params['content']);
        return that;
    };

    classProto.setAttributes = function(){
        var that = this;
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        // Type class
        cm.addClass(that.nodes['container'], ['app__panel', that.params['type']].join('--'));
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

    classProto.renderButtonsView = function(){
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
        return that;
    };

    classProto.windowKeydown = function(e){
        var that = this;
        if(cm.isKeyCode(e.keyCode, 'escape')){
            that.close();
        }
        return that;
    };

    classProto.transitionOpen = function(){
        var that = this;
        that.isOpen = true;
        that.triggerEvent('onOpen');
        that.triggerEvent('onOpenEnd');
        return that;
    };

    classProto.transitionClose = function(){
        var that = this;
        that.isOpen = false;
        that.destructOnClose && that.destruct();
        that.params['removeOnClose'] && cm.remove(that.nodes['container']);
        that.triggerEvent('onClose');
        that.triggerEvent('onCloseEnd');
        return that;
    };

    classProto.loadResponse = function(data){
        var that = this;
        that.isLoaded = true;
        that.setTitle(cm.objectSelector(that.params['responseTitleKey'], data['response']));
        that.setPreview(cm.objectSelector(that.params['responsePreviewKey'], data['response']));
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
            that.setPreview(cm.objectSelector(that.params['responsePreviewKey'], data['response']));
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