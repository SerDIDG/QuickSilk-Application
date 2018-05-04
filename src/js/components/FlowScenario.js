App.FlowScenario = [{
    'title' : 'Edit Header and Footer',
    'order' : 2,
    'type' : 'flow',
    /*'flow' : 'compliant'*/
    'flow' : 'forced',
    'data' : [{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Click on Layouts</h3>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'layouts',
        'topMenu' : false,
        'content' : '<h3>Click on Inner Page Layout</h3>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template/layout/content/',
        'content' : '<h3>You\'re in the right place!</h3><p>Your header and footer can be edited in "Inner Page Layout". These changes will be applied to all pages using this layout.</p>'
    }]
},{
    'title' : 'How to change or edit templates',
    'order' : 3,
    'type' : 'flow',
    'flow' : 'forced',
    'data' : [{
        'position' : 'topMenuItem:modules:container:right',
        'arrow' : 'top',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Hover over Modules > Create</h3>'
    },{
        'position' : 'topMenuItem:modules:dropdown:right',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'modules',
        'content' : '<h3>Click on Templates</h3>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template-library',
        'content' : '<h3>Here are your existing templates</h3><p>You can customize any of these</p>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Click Template Library</h3><p>To browse new templates</p>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Here you can download new templates</h3><p>By hovering over the template and clicking "Install"</p>'
    }]
},{
    'title' : 'How to edit styles',
    'order' : 4,
    'type' : 'flow',
    'flow' : 'forced',
    'data' : [{
        'position' : 'topMenuItem:modules:container:right',
        'arrow' : 'top',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Hover over Modules > Create</h3>'
    },{
        'position' : 'topMenuItem:modules:dropdown:right',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'modules',
        'content' : '<h3>Click on Templates</h3>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template-library',
        'content' : '<h3>Hover over any of your existing templates</h3><p>And select "Customize"</p>'
    },{
        'position' : 'template:top',
        'arrow' : 'bottom',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'transparent'
        },
        'sidebar' : false,
        'topMenu' : false,
        'url' : 'admin/template/editor/edit/',
        'content' : '<h3>Click on Template Default Styles</h3>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Select any text style</h3><p>To edit the font, colours, etc.</p>'
    }]
},{
    'title' : 'Help Tour',
    'order' : 1,
    'type' : 'tour',
    'data' : [{
        'position' : 'window:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>QuickSilk Online Tour!</h3><p>Welcome to QuickSilk! Use the buttons at the bottom of each help bubble to quickly discover how to navigate and use the QuickSilk software. This online tour automatically appears the first time you login. Anytime after this, simply click on the help tour menu item for a quick refresher.</p>'
    },{
        'position' : 'topMenuItem:user:dropdown:left',
        'arrow' : 'right',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'user',
        'content' : '<h3>User Menu</h3><p>Click on your name to view the admin panel (future), your profile, or to logout. The View Profile link provides the ability to manage your subscription and billing, password, forum settings, working groups and public profile.</p>'
    },{
        'position' : 'topMenuItem:modules:dropdown:right',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'modules',
        'content' : '<h3>Modules</h3><p>The Module manager allows you to work on your modules from the administration panel. Simply mouse over the Modules menu and then scroll down and click on the module you wish to work with. </p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Left Panel Slider</h3><p>The left slider widget provides you with quick access to the modules, pages, layouts and template features. Simply click on the icon for the tab you wish to use.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'template-manager',
        'topMenu' : false,
        'content' : '<h3>Installed Modules</h3><p>The modules tab provides quick access to the modules that you\'ve subscribed to. Once you\'ve opened a page or a template, open the modules tab to drag and drop the modules you wish to include.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'pages',
        'topMenu' : false,
        'content' : '<h3>Site Pages</h3><p>The site pages tab allows you to quickly open, modify and manage your website pages. Simply open the tab and click on the web page you wish to work on.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'layouts',
        'topMenu' : false,
        'content' : '<h3>Page Layouts</h3><p>Use the page layout tab to open, modify and manage the layouts of your various web page templates. A page layout will consist of the common elements you have on every page.</p>'
    },{
        'position' : 'template:left-top',
        'arrow' : 'left',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'transparent',
            'topMenu' : 'dark',
            'template' : 'dark'
        },
        'sidebar' : 'templates',
        'topMenu' : false,
        'content' : '<h3>Templates</h3><p>The templates tab displays the different custom or predesigned templates that you\'ve installed and are immediately available for use on your website. If you want to view or install other templates, you\'ll do so from the template gallery.</p>'
    },{
        'position' : 'template:center',
        'arrow' : false,
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'dark',
            'template' : 'light'
        },
        'sidebar' : false,
        'topMenu' : false,
        'content' : '<h3>Drop Area</h3><p>The drop area is where you drag and drop the modules. To move a module onto a page or template place your mouse on the desired module icon, hold down the left button on your mouse, and drag the module to the highlighted area of the page you wish to drop it, then let go of the mouse button.</p>'
    },{
        'position' : 'topMenuItem:support:container:right',
        'arrow' : 'top',
        'overlays' : {
            'main' : 'transparent',
            'sidebar' : 'dark',
            'topMenu' : 'transparent',
            'template' : 'dark'
        },
        'sidebar' : false,
        'topMenu' : 'support',
        'content' : '<h3>Need Help?</h3><p>Are you stuck, experiencing an issue, found a bug or have a suggestion? Simply click on this link and send us a message. FYI, to assist in the troubleshooting process we automatically collect information on the operating system, browser and browser version you are using. Our goal is to respond to your message within 1 business day.</p>'
    }]
}];