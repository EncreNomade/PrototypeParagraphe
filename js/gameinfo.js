
var GameInfo = (function() {
    var GameInfo = {}, exports = GameInfo;
    var lastRegistredGame;

    exports.register = function(game) {
        if(!game.className)
            return false;

        lastRegistredGame = game;
        game.evtDeleg.addListener( 'end', new Callback(saveScore, this, game) );
        getScore(game);
    };

    // public access to the game result
    // exports.__defineGetter__('result', function(){ return lastRegistredGame.result ; });

    function getScore(game) {
        $.ajax({
            url: config.base_url + 'user/data/gameInfo',
            type: 'GET',
            data: { 'className': game.className },
            dataType: 'json',
            success: function(gameInfo) {
                if(gameInfo && gameInfo.high_score)
                    game.setHighScore(gameInfo.high_score);
            },
            error: ajaxError
        });
    }

    function saveScore(game) {
        if(window.userData)
            userData.save();
        $.ajax({
            url: config.base_url + 'user/data/gameInfo',
            type: 'POST',
            data: {
                'className': game.className,
                'score': game.result.score
            },
            error: ajaxError
        });
    };


    function ajaxError(jqXhr) {
        if(config.readerMode != 'debug')
            return;
        var newWindow = window.open('_blank');
        newWindow.document.open();
        newWindow.document.write(jqXhr.responseText);
        newWindow.document.close();
    }

    return exports;
})();

