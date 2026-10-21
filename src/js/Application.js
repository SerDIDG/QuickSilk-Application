
// /* ************************************************ */
// /* ******* QUICKSILK: COMMON ******* */
// /* ************************************************ */

var App = {
    '_version' : '@@VERSION',
    '_assetsUrl' : [window.location.protocol, window.location.hostname].join('//'),
    'Elements': {},
    'Nodes' : {},
    'Test' : []
};

var Module = {};

/* ******* COMMON ******* */

// Add variables

cm._variables['%AppVersion%'] = 'App._version';
cm._variables['%AppAssetsUrl%'] = 'App._assetsUrl';

/* ******* COMPONENTS ******* */

cm.setParams('Com.InputPassword', {
    iconVisible: ['icon', 'medium', 'linked', 'background-size--field-half', 'svg__eye-border'],
    iconHidden: ['icon', 'medium', 'linked', 'background-size--field-half', 'svg__eye-off-border'],
});