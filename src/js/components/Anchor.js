App['Anchor'] = function(o){
    var that = this,
        config = cm.merge({
            'link' : cm.Node('a'),
            'href' : null,
            'target' : cm.Node('div'),
            'scroll' : document.body,
            'indentY' : 0,
            'duration' : 800,
            'setURL' : true
        }, o),
        anims = {};

    var init = function(){
        var y, styles;
        // Init scroll animation
        anims['scroll'] = new cm.Animation(config['scroll']);
        // Add click event
        cm.addEvent(config['link'], 'click', function(e){
            e = cm.getEvent(e);
            cm.preventDefault(e);
            // Set url
            if(config['setURL'] && cm.isHistoryAPI && config['href']){
                window.history.pushState(false, false, config['href']);
            }
            // Get target position and animate to it
            y = config['target'].offsetTop + config['indent'];
            if(config['scroll'] == document.body){
                styles = {'docScrollTop' : y};
            }else{
                styles = {'scrollTop' : y};
            }
            anims['scroll'].go({'style' : styles, 'anim' : 'smooth', 'duration' : config['duration']});
        }, true, true);
    };

    /* ******* MAIN ******* */

    that.setIndent = function(indent){
        if(!isNaN(indent)){
            config['indent'] = indent
        }
        return that;
    };

    init();

};