App['AdvancedEditor'] = function(o){
    var that = this,
        config = cm.merge({
            'node' : cm.Node('div'),
            'nodes' : {}
        }, o),
        nodes = {
            'editor' : cm.Node('div'),
            'preview' : cm.Node('div'),
            'textarea' : cm.Node('textarea')
        },
        editor;

    var init = function(){
        // Collect nodes
        getNodes(config['node'], 'AppAdvancedEditor');
        nodes['editorButton'] = nodes['editor'].getElementsByTagName('dt')[0] || cm.Node('div');
        nodes['previewButton'] = nodes['preview'].getElementsByTagName('dt')[0] || cm.Node('div');
        // Render
        render();
    };

    var render = function(){
        if(cm.inDOM(nodes['textarea'])){
            // Codemirror
            if(typeof CodeMirror != 'undefined'){
                editor = CodeMirror.fromTextArea(nodes['textarea'], {
                    lineNumbers: true,
                    lineWrapping: true,
                    tabMode: 'indent',
                    tabSize : 4,
                    mode: "htmlmixed"
                });
                //reformatCode();
            }
            // Tabset
            if(typeof Com.GetTabset != 'undefined' && Com.GetTabset('app-wrapper-tabset')){
                Com.GetTabset('app-wrapper-tabset').setEvents({
                    'advanced' : {
                        'onShow' : function(){
                            editor && editor.refresh();
                        }
                    }
                });
            }
            // Events
            cm.addEvent(nodes['editorButton'], 'click', function(){
                if(cm.isClass(nodes['editor'], 'is-show')){
                    cm.removeClass(nodes['editor'], 'is-show is-show-full');
                    cm.addClass(nodes['preview'], 'is-show is-show-full');
                }else{
                    cm.addClass(nodes['editor'], 'is-show');
                    cm.removeClass(nodes['preview'], 'is-show-full');
                }
                setTimeout(function(){
                    editor && editor.refresh();
                }, 500);
            });
            cm.addEvent(nodes['previewButton'], 'click', function(){
                if(cm.isClass(nodes['preview'], 'is-show')){
                    cm.removeClass(nodes['preview'], 'is-show is-show-full');
                    cm.addClass(nodes['editor'], 'is-show is-show-full');
                }else{
                    cm.addClass(nodes['preview'], 'is-show');
                    cm.removeClass(nodes['editor'], 'is-show-full');
                }
                setTimeout(function(){
                    editor && editor.refresh();
                }, 500);
            });
        }
    };

    var reformatCode = function(){
        var totalLines = editor.lineCount();
        editor.autoFormatRange(
            {line: 0, ch: 0},
            {line: totalLines - 1, ch: editor.getLine(totalLines - 1).length}
        );
    };

    /* *** MISC FUNCTIONS *** */

    var getNodes = function(container, marker){
        if(container){
            var sourceNodes = {};
            if(marker){
                sourceNodes = cm.getNodes(container)[marker] || {};
            }else{
                sourceNodes = cm.getNodes(container);
            }
            nodes = cm.merge(nodes, sourceNodes);
        }
        nodes = cm.merge(nodes, config['nodes']);
    };

    /* ******* MAIN ******* */

    init();
};