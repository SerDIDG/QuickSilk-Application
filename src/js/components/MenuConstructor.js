cm.define('App.MenuConstructor', {
    'extend' : 'Com.AbstractController',
    'params' : {
        'node' : cm.node('div'),
        'embedStructure' : 'none',
        'collectorPriority' : 100,
        'namePrefix' : 'params'
    }
},
function(params){
    var that = this;
    that.items = {};
    // Call parent class construct
    Com.AbstractController.apply(that, arguments);
});

cm.getConstructor('App.MenuConstructor', function(classConstructor, className, classProto){
    var _inherit = classProto._inherit;

    classProto.construct = function(){
        var that = this;
        // Bind context to methods
        // Add events
        // Call parent method
        _inherit.prototype.construct.apply(that, arguments);
        return that;
    };

    classProto.renderView = function(){
        var that = this;
        return that;
    };

    classProto.renderViewModel = function(){
        var that = this;
        // Call parent method - render
        _inherit.prototype.renderViewModel.apply(that, arguments);
        // Find Components
        cm.forEach(App.MenuConstructorNames, function(name, variable){
            var item = {
                'variable' : variable,
                'name' : that.renameTableName(name)
            };
            cm.find('*', item['name'], that.nodes['container'], function(classObject){
                item['controller'] = classObject;
                item['controller'].addEvent('onChange', function(my, data){
                    cm.log(data);
                    item['value'] = data;
                    that.processPreview();
                });
                item['value'] = item['controller'].get();
            });
            that.items[item['variable']] = item;
        });
        // Find Preview
        new cm.Finder('App.MenuConstructorPreview', null, null, function(classObject){
            that.components['preview'] = classObject;
            that.processPreview();
        });
        return that;
    };

    classProto.renameTableName = function(name){
        var that = this;
        return that.params['namePrefix']
            + name
                .split('.')
                .map(function(value){
                    return '[' + value + ']';
                })
                .join('');
    };

    classProto.processPreview = function(){
        var that = this,
            data = {};
        cm.forEach(that.items, function(item){
            if(item['value'] !== undefined){
                switch(item['value']['_type']){
                    case 'file':
                        data[item['variable']] = !cm.isEmpty(item['value']['url']) ? 'url("' + item['value']['url'] + '")' : 'none';
                        break;
                    case 'font':
                        cm.forEach(App.MenuConstructorNamesFont, function(rule, name){
                            data[item['variable'] + name] = item['value'][rule];
                        });
                        break;
                    default:
                        data[item['variable']] = item['value'];
                        break;
                }
            }
        });
        that.components['preview'] && that.components['preview'].set(data);
    };
});

/* ******* NAMES ******* */

App.MenuConstructorNamesFont = {
    'LineHeight' : 'line-height',
    'Weight' : 'font-weight',
    'Style' : 'font-style',
    'Decoration' : 'text-decoration',
    'Family' : 'font-family',
    'Size' : 'font-size',
    'Color' : 'color'
};

App.MenuConstructorNames = {

    /* *** PRIMARY ITEM *** */

    'Primary-Item-Padding' : 'primary_items.inner-padding',
    'Primary-Item-Indent' : 'primary_items.inner-between',

    'Primary-Default-BackgroundColor' : 'primary_items.default.background-color',
    'Primary-Default-BackgroundImage' : 'primary_items.default.background-image',
    'Primary-Default-BackgroundRepeat' : 'primary_items.default.background-repeat',
    'Primary-Default-BackgroundPosition' : 'primary_items.default.background-position',
    'Primary-Default-BackgroundScaling' : 'primary_items.default.background-scaling',
    'Primary-Default-BorderSize' : 'primary_items.default.border-size',
    'Primary-Default-BorderStyle' : 'primary_items.default.border-style',
    'Primary-Default-BorderColor' : 'primary_items.default.border-color',
    'Primary-Default-BorderRadius' : 'primary_items.default.border-radius',
    'Primary-Default-FontLineHeight' : 'primary_items.default.font.line-height',
    'Primary-Default-FontWeight' : 'primary_items.default.font.font-weight',
    'Primary-Default-FontStyle' : 'primary_items.default.font.font-style',
    'Primary-Default-FontDecoration' : 'primary_items.default.font.text-decoration',
    'Primary-Default-FontFamily' : 'primary_items.default.font.font-family',
    'Primary-Default-FontSize' : 'primary_items.default.font.font-size',
    'Primary-Default-FontColor' : 'primary_items.default.font.color',
    'Primary-Default-Font' : 'primary_items.default.font',

    'Primary-Hover-BackgroundColor' : 'primary_items.hover.background-color',
    'Primary-Hover-BackgroundImage' : 'primary_items.hover.background-image',
    'Primary-Hover-BackgroundRepeat' : 'primary_items.hover.background-repeat',
    'Primary-Hover-BackgroundPosition' : 'primary_items.hover.background-position',
    'Primary-Hover-BackgroundScaling' : 'primary_items.hover.background-scaling',
    'Primary-Hover-BorderSize' : 'primary_items.hover.border-size',
    'Primary-Hover-BorderStyle' : 'primary_items.hover.border-style',
    'Primary-Hover-BorderColor' : 'primary_items.hover.border-color',
    'Primary-Hover-BorderRadius' : 'primary_items.hover.border-radius',
    'Primary-Hover-FontLineHeight' : 'primary_items.hover.font.line-height',
    'Primary-Hover-FontWeight' : 'primary_items.hover.font.font-weight',
    'Primary-Hover-FontStyle' : 'primary_items.hover.font.font-style',
    'Primary-Hover-FontDecoration' : 'primary_items.hover.font.text-decoration',
    'Primary-Hover-FontFamily' : 'primary_items.hover.font.font-family',
    'Primary-Hover-FontSize' : 'primary_items.hover.font.font-size',
    'Primary-Hover-FontColor' : 'primary_items.hover.font.color',
    'Primary-Hover-Font' : 'primary_items.hover.font',

    'Primary-Active-BackgroundColor' : 'primary_items.active.background-color',
    'Primary-Active-BackgroundImage' : 'primary_items.active.background-image',
    'Primary-Active-BackgroundRepeat' : 'primary_items.active.background-repeat',
    'Primary-Active-BackgroundPosition' : 'primary_items.active.background-position',
    'Primary-Active-BackgroundScaling' : 'primary_items.active.background-scaling',
    'Primary-Active-BorderSize' : 'primary_items.active.border-size',
    'Primary-Active-BorderStyle' : 'primary_items.active.border-style',
    'Primary-Active-BorderColor' : 'primary_items.active.border-color',
    'Primary-Active-BorderRadius' : 'primary_items.active.border-radius',
    'Primary-Active-FontLineHeight' : 'primary_items.active.font.line-height',
    'Primary-Active-FontWeight' : 'primary_items.active.font.font-weight',
    'Primary-Active-FontStyle' : 'primary_items.active.font.font-style',
    'Primary-Active-FontDecoration' : 'primary_items.active.font.text-decoration',
    'Primary-Active-FontFamily' : 'primary_items.active.font.font-family',
    'Primary-Active-FontSize' : 'primary_items.active.font.font-size',
    'Primary-Active-FontColor' : 'primary_items.active.font.color',
    'Primary-Active-Font' : 'primary_items.active.font',

    /* *** PRIMARY CONTAINER *** */

    'Primary-Container-Padding' : 'primary_container.inner-padding',
    'Primary-Container-BackgroundColor' : 'primary_container.background-color',
    'Primary-Container-BackgroundImage' : 'primary_container.background-image',
    'Primary-Container-BackgroundRepeat' : 'primary_container.background-repeat',
    'Primary-Container-BackgroundPosition' : 'primary_container.background-position',
    'Primary-Container-BackgroundScaling' : 'primary_container.background-scaling',
    'Primary-Container-BorderSize' : 'primary_container.border-size',
    'Primary-Container-BorderStyle' : 'primary_container.border-style',
    'Primary-Container-BorderColor' : 'primary_container.border-color',
    'Primary-Container-BorderRadius' : 'primary_container.border-radius',

    /* *** SECONDARY ITEM *** */

    'Secondary-Item-Padding' : 'secondary_items.inner-padding',
    'Secondary-Item-Indent' : 'secondary_items.inner-between',

    'Secondary-Default-BackgroundColor' : 'secondary_items.default.background-color',
    'Secondary-Default-BackgroundImage' : 'secondary_items.default.background-image',
    'Secondary-Default-BackgroundRepeat' : 'secondary_items.default.background-repeat',
    'Secondary-Default-BackgroundPosition' : 'secondary_items.default.background-position',
    'Secondary-Default-BackgroundScaling' : 'secondary_items.default.background-scaling',
    'Secondary-Default-BorderSize' : 'secondary_items.default.border-size',
    'Secondary-Default-BorderStyle' : 'secondary_items.default.border-style',
    'Secondary-Default-BorderColor' : 'secondary_items.default.border-color',
    'Secondary-Default-BorderRadius' : 'secondary_items.default.border-radius',
    'Secondary-Default-FontLineHeight' : 'secondary_items.default.font.line-height',
    'Secondary-Default-FontWeight' : 'secondary_items.default.font.font-weight',
    'Secondary-Default-FontStyle' : 'secondary_items.default.font.font-style',
    'Secondary-Default-FontDecoration' : 'secondary_items.default.font.text-decoration',
    'Secondary-Default-FontFamily' : 'secondary_items.default.font.font-family',
    'Secondary-Default-FontSize' : 'secondary_items.default.font.font-size',
    'Secondary-Default-FontColor' : 'secondary_items.default.font.color',
    'Secondary-Default-Font' : 'secondary_items.default.font',

    'Secondary-Hover-BackgroundColor' : 'secondary_items.hover.background-color',
    'Secondary-Hover-BackgroundImage' : 'secondary_items.hover.background-image',
    'Secondary-Hover-BackgroundRepeat' : 'secondary_items.hover.background-repeat',
    'Secondary-Hover-BackgroundPosition' : 'secondary_items.hover.background-position',
    'Secondary-Hover-BackgroundScaling' : 'secondary_items.hover.background-scaling',
    'Secondary-Hover-BorderSize' : 'secondary_items.hover.border-size',
    'Secondary-Hover-BorderStyle' : 'secondary_items.hover.border-style',
    'Secondary-Hover-BorderColor' : 'secondary_items.hover.border-color',
    'Secondary-Hover-BorderRadius' : 'secondary_items.hover.border-radius',
    'Secondary-Hover-FontLineHeight' : 'secondary_items.hover.font.line-height',
    'Secondary-Hover-FontWeight' : 'secondary_items.hover.font.font-weight',
    'Secondary-Hover-FontStyle' : 'secondary_items.hover.font.font-style',
    'Secondary-Hover-FontDecoration' : 'secondary_items.hover.font.text-decoration',
    'Secondary-Hover-FontFamily' : 'secondary_items.hover.font.font-family',
    'Secondary-Hover-FontSize' : 'secondary_items.hover.font.font-size',
    'Secondary-Hover-FontColor' : 'secondary_items.hover.font.color',
    'Secondary-Hover-Font' : 'secondary_items.hover.font',

    'Secondary-Active-BackgroundColor' : 'secondary_items.active.background-color',
    'Secondary-Active-BackgroundImage' : 'secondary_items.active.background-image',
    'Secondary-Active-BackgroundRepeat' : 'secondary_items.active.background-repeat',
    'Secondary-Active-BackgroundPosition' : 'secondary_items.active.background-position',
    'Secondary-Active-BackgroundScaling' : 'secondary_items.active.background-scaling',
    'Secondary-Active-BorderSize' : 'secondary_items.active.border-size',
    'Secondary-Active-BorderStyle' : 'secondary_items.active.border-style',
    'Secondary-Active-BorderColor' : 'secondary_items.active.border-color',
    'Secondary-Active-BorderRadius' : 'secondary_items.active.border-radius',
    'Secondary-Active-FontLineHeight' : 'secondary_items.active.font.line-height',
    'Secondary-Active-FontWeight' : 'secondary_items.active.font.font-weight',
    'Secondary-Active-FontStyle' : 'secondary_items.active.font.font-style',
    'Secondary-Active-FontDecoration' : 'secondary_items.active.font.text-decoration',
    'Secondary-Active-FontFamily' : 'secondary_items.active.font.font-family',
    'Secondary-Active-FontSize' : 'secondary_items.active.font.font-size',
    'Secondary-Active-FontColor' : 'secondary_items.active.font.color',
    'Secondary-Active-Font' : 'secondary_items.active.font',

    'Secondary-Container-Padding' : 'secondary_container.inner-padding',
    'Secondary-Container-BackgroundColor' : 'secondary_container.background-color',
    'Secondary-Container-BackgroundImage' : 'secondary_container.background-image',
    'Secondary-Container-BackgroundRepeat' : 'secondary_container.background-repeat',
    'Secondary-Container-BackgroundScaling' : 'secondary_container.background-scaling',
    'Secondary-Container-BackgroundPosition' : 'secondary_container.background-position',
    'Secondary-Container-BorderSize' : 'secondary_container.border-size',
    'Secondary-Container-BorderStyle' : 'secondary_container.border-style',
    'Secondary-Container-BorderColor' : 'secondary_container.border-color',
    'Secondary-Container-BorderRadius' : 'secondary_container.border-radius',

    /* *** MOBILE *** */

    'Mobile-Padding' : 'mobile.inner-padding',
    'Mobile-BackgroundColor' : 'mobile.background-color',
    'Mobile-BackgroundImage' : 'mobile.menu-icon',
    'Mobile-BorderSize' : 'mobile.border-size',
    'Mobile-BorderStyle' : 'mobile.border-style',
    'Mobile-BorderColor' : 'mobile.border-color',
    'Mobile-BorderRadius' : 'mobile.border-radius',
    'Mobile-FontLineHeight' : 'mobile.font.line-height',
    'Mobile-FontWeight' : 'mobile.font.font-weight',
    'Mobile-FontStyle' : 'mobile.font.font-style',
    'Mobile-FontDecoration' : 'mobile.font.font-style',
    'Mobile-FontFamily' : 'mobile.font.font-family',
    'Mobile-FontSize' : 'mobile.font.font-size',
    'Mobile-FontColor' : 'mobile.font.font-color',
    'Mobile-Font' : 'mobile.font'
};