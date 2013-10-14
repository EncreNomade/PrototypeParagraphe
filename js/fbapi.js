fbapi = {};
fbapi.user = null; // initiated in fbapi.connect or init
fbapi.connect = function(callback){
    fbapi.callback = callback;
    
    if(fbapi.user) {
        if(typeof fbapi.callback == 'function')
            fbapi.callback.call(window, {'status': 'connected'});
        fbapi.callback = false;
        return;
    }
    
    FB.login(function(response) {
        if (response.status == 'connected') {
            fbapi.token = response.authResponse.accessToken;
            FB.api('/me', function(user) {
                fbapi.user = user;

                if(typeof fbapi.callback == 'function')
                    fbapi.callback.call(window, response);
                fbapi.callback = false;
            });
        } 
        else if (response.status === 'not_authorized'){
            alert('Ton compte Facebook ne te permet pas de rejoindre notre site, modifie tes paramètres.');
            fbapi.callback = false;
        }
        else { // fail
            alert('Désolé, facebook n\'a pas établi la connexion, recharger la page et réessaye dans quelques minutes');
            fbapi.callback = false;
        }
    }, {scope:'publish_stream,read_stream,email,user_birthday,user_photos,photo_upload'});
}
fbapi.checkConnect = function(callback, willconnect){
    FB.getLoginStatus(function(response){ // test login
      if (response.status === 'connected') {
          var uid = response.authResponse.userID;
          fbapi.token = response.authResponse.accessToken;
          FB.api('/me',function(u){
              fbapi.user = u;
          });
          if(callback) callback.call(this, response);
      } 
      else if (response.status === 'not_authorized') {//the user is logged in to Facebook, but has not authenticated your app
          fbapi.user = false;
          fbapi.token = '';
          if(callback) callback.call(window, response);
      } 
      else { // the user isn't logged in to Facebook.
          fbapi.user = false;
          fbapi.token = '';
          if(willconnect !== false) fbapi.connect(callback);
      }
    });
};
fbapi.like = function(){
    FB.getLoginStatus(function(response){
        if (response.status === 'connected') { // do only if connected
            FB.api('/me/og.likes', 'post', { object: document.URL }, function(res) {
                if (!res || res.error) {
                    if(res.error.code == 3501) { // already like it !
                        if(window.msgCenter) msgCenter.send('Tu aimes déjà cette page');
                        else alert('Tu aimes déjà cette page');
                        return;
                    }
                    // console.error(res);
                    if(confirm("Une erreur s'est produite lors de l'envoi. Tu veux réessayer ? (Code d'erreur: "+res.error.code+")"))
                        fbapi.connect(fbapi.like);
                } 
                else {
                    var msg = $('<p>Tu as aimé cette page sur Facebook. </p>');
                    if(fbapi.user)
                        msg.append('<a href="'+fbapi.user.link+'" target="_blank">Voir.</a>');
                    if(window.msgCenter) msgCenter.send(msg);
                    else alert('Tu as aimé cette page sur Facebook.');
                }
            });
        }
        else if(confirm("Il faut être connecté à Facebook pour poster un like. Tu veux te connecter?")){
            // not connected and
            fbapi.connect(fbapi.like);
        }
    });
}
fbapi.post = function(imgUrl, msg, position, successCB, failCB){
    if(imgUrl){
        if(!msg) msg = "";
        var postData = {'url': imgUrl, 'message': msg};
        
        FB.api('me/photos', 'POST', postData, function(res){ // post the img to fb
            if(!res.id) return failCB(res);
            FB.api(res.id, function(fbImgObj){ // get the img url
                if(!fbImgObj.source) return failCB(fbImgObj);
                var postData = {
                    'imgUrl': fbImgObj.source, 
                    'message': msg, 
                    'fbID': fbImgObj.id, 
                    'position': position, 
                    'ep': mse.configs.epid,
                    'fbUserID': fbImgObj.from.id
                };
                $.post(config.base_url+'13comments/comment', postData, successCB, 'json');
            });
        });
    }
    else if(msg){
        FB.api('/me/feed', 'POST', {'message': msg}, function(obj){
            if(!obj.id) return failCB(obj);
            var postData = {
                'imgUrl': '', 
                'message': msg, 
                'fbID':obj.id, 
                'position': position, 
                'ep': mse.configs.epid,
                'fbUserID': obj.id.split('_')[0]  // obj.id = "<fbuserID>_<postID>"
            }; 
            $.post(config.base_url+'13comments/comment', postData, successCB, 'json');
        });
    }
};

fbapi.postGame = function(game){
    fbapi.connect(function () {
        if(game){
            var msg = "J'ai " + (game.result.win ? "gagné" : "perdu") + " le jeu " + game.config.title + " en regardant Voodoo Connection, episode " + mse.configs.epid + ". Mon score est de " + game.result.score + "! Peux-tu me battre?";
            var picUrl = config.episode.gameExpos ? config.episode.gameExpos[game.className] : null;
            if(!picUrl) picUrl = config.episode.image;
    
            var data = {
                'message': msg,
                'picture': picUrl,
                'name': game.config.title,
                'link': game.className ? config.base_url+'games/'+game.className : document.URL
            };
            FB.api('/me/feed', 'POST', data, function(obj){
                if(!obj.id) {
                    if(obj.error) {
                        switch (obj.error.code) {
                        case 506:
                            msgCenter.send('T\'as déjà posté ton score.');
                            break;
                        default:
                            msgCenter.send('Une erreur est survenue lors de l\'envoie du message. ('+obj.error.code+')');
                            break;
                        }
                    }
                    else msgCenter.send('Une erreur est survenue lors de l\'envoie du message.');
                }
                else {
                    msgCenter.send('<p>Ton resultat de jeu a été bien publié sur Facebook. <a href="'+fbapi.user.link+'" target="_blank">Voir.</a></p>');
                }
            });
        }
    });
};

fbapi.commentInit = function() {
    if(!fbapi.user) return;
    $('.comment_fblike').each(function() {
        var btn = $(this);
        var postid = btn.data('postid');
        // Query: SELECT user_id FROM like WHERE object_id=postid AND user_id=fbapi.user.id
        var query = 'SELECT%20user_id%20FROM%20like%20WHERE%20object_id%3D'+postid+'%20AND%20user_id%3D'+fbapi.user.id;
        var url = '/fql?q='+query;
        FB.api(url, 'get', function(result) {
            if (!result || !result.data) {
                return;
            } else if (result.data.length > 0) {
                btn.text('J\'aime plus');
            } else if (result.error) {
                console.log('Error: '+result.error.message+'');
            }
        });
    });
}
fbapi.commentLike = function() {
    if( !fbapi.user ) return;
    var btn = $(this);
    var postid = btn.data('postid');
    //var like = (btn.text() != "J\'aime plus");
    // Like post
    //if(like) {
        FB.api('/'+postid+'/likes', 'post', function(result) {
            if (result === true) {
                if(window.msgCenter) msgCenter.send('You like the post: '+postid);//btn.text('J\'aime plus');
            } else if (result.error) {
                console.log('Error: '+result.error.message+'');
            }
        });
    /*}
    else {
        FB.api('/'+postid+'/likes', 'DELETE', function(result) {
            if (result === true) {
                btn.text('J\'aime');
            } else if (result.error) {
                console.log('Error: '+result.error.message+'');
            }
        });
    }*/
}