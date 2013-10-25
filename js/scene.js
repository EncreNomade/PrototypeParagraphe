// initialize the sound manager 
soundManager.setup({
    url: './PxLoader/swf/',
    flashVersion: 9, // optional: shiny features (default = 8)
    flashLoadTimeout: 500,
    useHighPerformance: true,
    debugMode: false,
    // optional: ignore Flash where possible, use 100% HTML5 mode
    preferFlash: false,
    useHTML5Audio: true,
    onready: function() {
        // Ready to use; soundManager.createSound() etc. can now be called.
        scene.run();
    }
});

window.callbacks = {
    'showGrillage' : new Callback(function() {
        var back = $('#contentBack');
        var grillage = $('#grillage');
        grillage.css({
            'width' : back.width(),
            'height' : back.height(),
            'margin-left' : back.css('margin-left'),
            'margin-top' : back.css('margin-top'),
            'opacity' : 1
        });
        soundManager.play('piegeson');
    }, null)
};



// Views

var PageView = Backbone.View.extend({
    'tagName':  'article'
});

var SectionView = Backbone.View.extend({
    'tagName':  'section',
    'className': 'block'
});

var Bloc = Backbone.View.extend({
    
    'tagName':  'p',
    
    randomDropBlock: function() {
        var block = this.$el.parent('section');
        if (!block) {
            return;
        }
        
        var pageWidth = $(document).width();
        var pageHeight = $(document).height();
        
        if (block.position().left == 0) {
            block.css( 'left', pageWidth * 0.15 + randomInt(pageWidth * 0.7 - block.width()) );
        }
        if (block.position().top == 0) {
            var maxHeight = pageHeight * 0.6;
            var blocHeight = block.height();
            var range = maxHeight - blocHeight;
            
            // Correction of range
            if (range < 0) {
                block.css( 'top', (pageHeight-blocHeight)/2 );
            }
            else block.css( 'top', pageHeight * 0.15 + randomInt(range) );
        }
    },
    
    showPage: function() {
        // Show content page
        var page = this.$el.parents('.page');
        if (page && page.hasClass('hidden')) {
            page.removeClass('hidden').addClass('show');
        }
    },
    
    showSection: function() {
        var section = this.$el.parent('section');
        // Hide other section
        section.siblings('section.show').each(function(){
           $(this).children('p.show').removeClass('show').addClass('hidden');
           $(this).removeClass('show').addClass('hidden');
        });
        
        // Show this section
        if(section.hasClass('hidden')) {
            // Move the section
            this.randomDropBlock();
            section.removeClass('hidden').addClass('show');
        }
    },
    
    detectEvent: function() {
        // Detect events
        var event = this.$el.data('event');
        if(event) {
            var id = this.$el.data('target');
            var target = $('#'+id+'.background');
            //var target_ext = $('#'+id+'.background-ext');
        
            switch (event) {
            case "changeBackground":
                var img = this.$el.data('img');
                if(target.length > 0 && img) {
                    // Replace background
                    var obj = target.clone();
                    obj.attr('src', img);
                    target.after(obj.addClass('hidden'));
                    obj.load(function(){
                        // Center obj
                        $(this).css('margin-left', -$(this).width()/2);
                        $(this).css('margin-top', -$(this).height()/2);
                        // Show obj
                        obj.removeClass('hidden').addClass('show');
                        // Remove target
                        target.remove();
                    });
                    // Replace background extension
                    //target_ext.attr('src', img);
                }
            break;
            }
        }
    }
});

var TextBloc = Bloc.extend({

    'className': 'text',
    
    actionStarted: function() {
        this.showPage();
        this.showSection();
    
        // Show this paragraph
        this.$el.removeClass('hidden').addClass('show');
        
        this.detectEvent();
    },
    
    actionEnded: function() {
        //this.$el.removeClass('show').addClass('hidden');
    }
});

var AnimeBloc = Bloc.extend({

    'className': 'animation',
    
    actionStarted: function() {
        this.showPage();
    }
});

var GameBloc = Bloc.extend({

    'className': 'game',
    
    'result_tpl': _.template('<div class="game_result"><h2><% if(win) { %>Bravo ! <span><%= score %></span> points !<% } else { %>Perdu !<% } %></h2><h5>Améliore ton score !<br/><button class="game_restart">REJOUER</button></h5></div>'),
    
    initialize: function() {
        this.eventInited = false;
    },
    
    actionStarted: function() {
        this.showPage();
        this.showSection();
        
        // Normal game start by click
        gametype = this.model.get("gameType");
        inited = this.model.get("inited");
        game = window.games[this.model.get("gameName")];
        if(game && gametype != "interaction") {
            this.$el.removeClass('hidden').addClass('show');
            
            if (!this.eventInited) {
                this.$el.click(function () {
                    game.start();
                    $('#game_container').removeClass('hidden').addClass('show')
                                        .children('.close').removeClass('hidden').addClass('show');
                });
                
                this.eventInited = true;
            }
        }
        
        // Start directly for interactions
        if(game && gametype == "interaction") {
            $('#game_container').removeClass('hidden').addClass('show')
                                .children('.close').removeClass('show').addClass('hidden'); // Remove close button
        }
    },
    
    actionEnded: function() {
        $('#game_container').removeClass('show').addClass('hidden');
        
        if (this.model.onceEnded) {
            var playbtn = this.$('.btn_play');
            if (playbtn.length > 0) {
                game = window.games[this.model.get("gameName")];
                playbtn.replaceWith( this.result_tpl({"win": game.result.win, "score": game.result.score}) );
            }
        }
    }
});

var KeyGameBloc = Bloc.extend({

    'className': 'keygame',
    
    initialize: function() {
    },
    
    actionStarted: function() {
        this.showPage();
        this.showSection();
        
        if (!this.model.onceEnded) {
            game = window.games[this.model.get("gameName")];
            if(game) {
                this.$el.click(function () {
                    game.startGame();
                });
            }
        }
        
        this.$el.removeClass('hidden').addClass('show');
    },
    
    actionEnded: function() {
        this.$el.unbind("click");
        if (this.model.onceEnded) {
            this.$('.btn_play').remove();
        }
    }
});

var ParoleBloc = Bloc.extend({

    'className': 'parole'
});

var IlluBloc = Bloc.extend({

    'className': 'illu',
    
    actionStarted: function() {
        this.showPage();
        this.showSection();
    
        // Show this paragraph
        this.$el.removeClass('hidden').addClass('show');
        
        this.detectEvent();
        
        window.bag.photoReady( this.$el.prop('id'), this.$el.children('img') );
    },
});

var ChoiceBloc = Bloc.extend({

    'tagName':  'ul',
    'className': 'choice',
    
    'events': {
        'click li': 'optionClicked'
    },
    
    optionClicked: function(e) {
        if (!this.model.get("exit")) {
            var option = $(e.currentTarget);
            var exit = option.data('goto');
            if (exit) {
                this.model.set("exit", exit);
                option.addClass("chosen");
            }
            
            this.model.end();
        }
    },
    
    actionStarted: function() {
        this.showPage();
        this.showSection();
    
        // Show this paragraph
        this.$el.removeClass('hidden').addClass('show');
        
        this.detectEvent();
    }
});



// Models

var TextAction = MseAction.extend({

    realStart: function() {
    
        // Start controller timer
        window.controller.start(this.get("duration"));
        
        // Play sound
        var sound = this.get("sound");
        if(sound) {
            soundManager.stopAll();
            soundManager.play(sound);
        }
    }
});

var GameAction = MseAction.extend({

    initialize: function() {
        this.onceEnded = false;
    },

    gameEnded: function() {
        var game = window.games[this.get("gameName")];
        if( game.result.win ) {
            this.set("exit", this.get("winexit"));
            
            if(this.get("gameType") != "interaction") {
                Badge.pullUpFlag("WinParcMontsouris");
            }
        }
        else {
            this.set("exit", this.get("loseexit"));
        }
        
        this.onceEnded = true;
        this.end();
    },
    
    realStart: function() {
    
        // Stop all sound
        soundManager.stopAll();
        
        var game = window.games[this.get("gameName")];
        var gametype = this.get("gameType");
        
        // Normal game start by click
        if(gametype != "interaction" && game) {
            if (this.onceEnded) {
                // Start controller timer
                window.controller.start(this.get("duration"));
            }
            else {
                window.controller.lock();
            }
            game.evtDeleg.addListener('end', new Callback(this.gameEnded, this));
        }
        
        // Start directly for interactions
        if(gametype == "interaction" && game) {
            window.controller.lock();
            game.evtDeleg.addListener('end', new Callback(this.gameEnded, this));
            game.start();
        }
        
        if (!game) {
            // Start controller timer
            window.controller.start(this.get("duration"));
        }
    },
    
    realEnd: function() {
        // Stop all sound
        soundManager.stopAll();
        window.controller.unlock();
    }
});

var KeyGameAction = MseAction.extend({

    gameEnded: function() {
        var game = window.games[this.get("gameName")];
        if( game.result.win ) {
            this.set("exit", this.get("winexit"));
        }
        else {
            this.set("exit", this.get("loseexit"));
        }
        
        Badge.pullUpFlag("DoOneChoice");
        this.onceEnded = true;
        this.end();
    },
    
    realStart: function() {
        if (!this.onceEnded) {
            window.controller.lock();
            
            // Stop all sound
            soundManager.stopAll();
            
            var game = window.games[this.get("gameName")];
            this.listenTo(game, 'end', this.gameEnded);
        }
        else {
            // Start controller timer
            window.controller.start(this.get("duration"));
        }
    },
    
    realEnd: function() {
        // Stop all sound
        soundManager.stopAll();
        window.controller.unlock();
    }
});

var AnimeAction = MseAction.extend({

    realStart: function() {
    
        // Show animation root canvas
        $('#root').removeClass('hidden').addClass('show');
    
        // Start controller timer
        var animation = window.animes[this.get("animeName")];
        var duration = this.get("duration");
        if (!duration) {
            this.set( "duration", mse.root.interval * animation.duration / 1000 );
        }
        window.controller.start(duration);
        // Start animation
        animation.start();
    },
    
    realEnd: function() {
        // Hide animation root canvas
        $('#root').removeClass('show').addClass('hidden');
    }
});

var CSSAnimeAction = MseAction.extend({

    realStart: function() {
        var target = this.get("target");
        var endStyle = target.data('endstyle');
        target.attr('style', endStyle);
        // Start controller timer
        window.controller.start(this.get("duration"));
    }
});

var CallbackAction = MseAction.extend({

    realStart: function() {
        var callback = this.get("callback");
        if(callback) {
            callback.invoke();
        }
        // Start controller timer
        window.controller.start(this.get("duration"));
    }
});

var ChoiceAction = MseAction.extend({

    initLink: function() {
        var exits = this.get("exits");
        var scenario = this.get("scenario");
        if (exits && scenario) {
            scenario.actionChoicesChanged(this, exits);
        }
    },
    
    realStart: function() {
        if (!this.get("exit")) {
            // Lock the controller if exit not chosen
            window.controller.lock();
        }
        else {
            // Start controller timer if exit already chosen
            window.controller.start(this.get("duration"));
        }
        
        // Play sound
        var sound = this.get("sound");
        if(sound) {
            soundManager.stopAll();
            soundManager.play(sound);
        }
    },
    
    realEnd: function() {
        window.controller.unlock();
    }
});



$(document).ready(function () {
    var docw = $(window).width(), doch = $(window).height();
    $('body').css({'width': docw, 'height': doch});
    // Place all background centered
    $('img.background').each(function() {
        $(this).addClass("hidden");
        $(this).load(function(){
            $(this).css('margin-left', -$(this).width() / 2)
                   .css('margin-top', -$(this).height() / 2)
                   .removeClass('hidden');
        });
    });
    
    // Set all portrait illustration
    $('.illu img').each(function() {
        $(this).load(function(){
            if ($(this).width() < $(this).height()) {
                // Portrait
                $(this).css({'width': 'auto', 'height': 0.55 * $(window).height()});
                $(this).parent().css({'width': 'auto', 'height': 'auto'});
            }
        });
    });

    window.scene = new MseScenario();
    window.loader = new PxLoader();
    
    var endfunction = function(e) {
        e.data.action.end();
    }
    
    var actions = [
        new (MseAction.extend({
        
            "soundNames": ['accelera', 'cran', 'findsimon', 'heart', 'heartbeat', 'ilestla', 'intro', 'kevinSpeak', 'klaxon', 'onletien', 'pasAppro', 'paslourd', 'piegeson', 'rat', 'rer', 'restartrun', 'runsound', 'vent', 'villenuit', 'woosh'],
            
            // Start
            realStart: function () {
                var i, len, url, soundNames = this.soundNames; 
                 
                // queue each sound for loading 
                for(i=0, len = soundNames.length; i < len; i++) {
                 
                    // see if the browser can play m4a 
                    url = './audios/' + soundNames[i] + '.mp3';
                    
                    if (!soundManager.canPlayURL(url)) { 
                 
                        // ok, what about ogg? 
                        url = './audios/' + soundNames[i] + '.ogg'; 
                        if (!soundManager.canPlayURL(url)) { 
                            continue; // can't be played 
                        }
                    }
                 
                    // queue the sound using the name as the SM2 id 
                    loader.addSound(soundNames[i], url); 
                }

                var progress = $('#preloader progress'), 
                    action = this, 
                    isMobile = BrowserDetect.OS.indexOf("Mobile") != -1;
                
                if (isMobile) {
                    //$('#preloader').addClass('hidden');
                    //this.end();
                    $('#preloader').delay(10000).queue(function(next) {
                        $('#preloader').addClass('hidden');
                        action.end();
                        next();
                    });
                }
                else {
                    // listen to load events 
                    loader.addProgressListener(function(e) {
                        var progression = 100 * e.completedCount / e.totalCount;
                        progress.attr('value', progression);
                        
                        if(e.completedCount == e.totalCount) {
                            $('#preloader').addClass('hidden');
                            action.end();
                        }
                    });
                }
                
                loader.start();
            }
        }))({"name": 'Preload', "scenario": window.scene}),
    
        new (MseAction.extend({
            
            initialize: function() {
                var view = new (Backbone.View.extend({
                                events: {'click': 'endAction'},
                                          
                                endAction: function() {
                                    this.model.end();
                                },
                                
                                actionStarted: function() {
                                    $('.page.show').removeClass('show').addClass('hidden');
                                    this.$el.removeClass('hidden').addClass('show');
                                },
                                
                                actionEnded: function() {
                                    this.$el.removeClass('show').addClass('hidden');
                                } }))({'el': $('#couv'), 'model': this});
                                
                view.listenTo(this, 'started', view.actionStarted);
                view.listenTo(this, 'ended', view.actionEnded);
            },
            
            // Start
            realStart: function() {
                // Start intro music
                soundManager.stop('intro');
                soundManager.play('intro');
                //soundManager.mute();
            },
            
            // End
            realEnd: function() {
                // Show controller
                window.controller.show();
                window.bag.show();
            }
        }))({"name": 'Couverture', "scenario": window.scene}),
        
        new (MseAction.extend({
            
            initialize: function() {
                var view = new (Backbone.View.extend({
                                actionStarted: function() {
                                    $('.page.show').removeClass('show').addClass('hidden');
                                    this.$el.removeClass('hidden').addClass('show');
                                },
                                
                                actionEnded: function() {
                                    this.$el.removeClass('show').addClass('hidden');
                                } }))({'el': $('#titre'), 'model': this});
                                          
                view.listenTo(this, 'started', view.actionStarted);
                view.listenTo(this, 'ended', view.actionEnded);
                
                this.set("duration", view.$el.data('duration') ? view.$el.data('duration') : 3);
            },
            
            // Start
            realStart: function() {
                // Show controller
                window.controller.show();
                // Show bag
                window.bag.show();
                // Background 1 available
                //window.bag.photoReady("ph_rue", $('#contentBack'));
                // Start counter
                window.controller.start(this.get("duration"));
            }
        }))({"name": 'Titre', "scenario": window.scene})
    ];
    
    window.controller = (function(scene){
        var ctrl_prev = $('#ctrl_prev');
        var ctrl_next = $('#ctrl_next');
        var progressbar = $('#ctrl_progressbar');
        var progress = $('#ctrl_progressbar #progress');
        var progress_pt = $('#ctrl_progressbar #progress_pt');
        var timer = $('#progress_pt #timer');
        var btn_playpause = $('#progress_pt #btn_playpause');

        var lock = false, i = 0, j = 0, count = 0, countForPi = 30, interval = 100, step = 6, dragstart = false, dragfrozen = 3;
        
        function updateProgressBar() {
            var curr_prog = Math.round( progressbar.width() * scene.history.length / scene.count() );
            progress.css('width', curr_prog);
            progress_pt.css('left', curr_prog);
        }
        
        if(!MseConfig.mobile) {
            timer.hover(function() {
                timer.addClass("hover");
                if(!timer.hasClass('hidden'))
                    controller.pause = true;
            }, function() {
                timer.removeClass("hover");
                if(!timer.hasClass('hidden'))
                    controller.pause = false;
            });
        }
        
        ctrl_prev.click(function() {
            scene.gotoPrev();
            updateProgressBar();
            if(lock) lock = false;
        });
        ctrl_next.click(function() {
            if(!lock) {
                scene.passNext();
                updateProgressBar();
            }
        });
        
        // Init progress bar
        progress.css('width', 0);
        progress_pt.css('left', 0);
        // Progress bar control
        progress_pt.mousedown(function() {
            dragstart = true;
        });
        progressbar.mousemove(function(e) {
            if (dragstart) {
                var x = Math.round( e.pageX - progressbar.offset().left );
                if(x >= 0 && x <= progressbar.width()) {
                    progress.css('width', x);
                    progress_pt.css('left', x);
                }
                
                if (dragfrozen > 0) dragfrozen--;
            }
        });
        progressbar.mouseup(function(e) {
            if (dragstart) {
                if (!dragfrozen) {
                    // Progress bar pointer moved
                    var prog = Math.round( scene.count() * progress.width() / progressbar.width() );
                    if ( scene.directReachable(prog) ) {
                        scene.jumpTo( prog );
                    }
                    else {
                        updateProgressBar();
                    }
                }
                else {
                    // Click detected
                    // Playing
                    if(btn_playpause.hasClass('pause')) {
                        controller.dopause();
                    }
                    // Pausing
                    else {
                        controller.doplay();
                    }
                }
                
                dragstart = false;
                dragfrozen = 3;
            }
        });
        progressbar.mouseleave(function(e) {
            if (dragstart) {
                updateProgressBar();
                dragstart = false;
                dragfrozen = 3;
            }
        });
        
        return {
            pause : false,
            js_timer : 0,
            
            show: function() {
                $('#controller').removeClass('hidden').addClass('show');
            },
            
            doplay: function() {
                if (this.pause) {
                    btn_playpause.removeClass('play').addClass('pause');
                    timer.removeClass('hidden');
                    controller.pause = false;
                }
            },
            
            dopause: function() {
                btn_playpause.removeClass('pause').addClass('play');
                timer.addClass('hidden');
                controller.pause = true;
            },
            
            countdown1 : function() {
                if(this.pause) return;
                i = i + step;
                count = count + 1;
                if(count >= countForPi){
                    count = 0;
                    clearInterval(this.js_timer);
                    this.js_timer = setInterval("window.controller.countdown2()", interval);
                };
                $(".pie1").css("-o-transform","rotate(" + i + "deg)");
                $(".pie1").css("-moz-transform","rotate(" + i + "deg)");
                $(".pie1").css("-webkit-transform","rotate(" + i + "deg)");
            },
            
            countdown2 : function() {
                if(this.pause) return;
                j = j + step;
                count = count + 1;
                if(count >= countForPi){
                    count = 0;
                    clearInterval(this.js_timer);
                    this.finished();
                };
                $(".pie2").css("-o-transform","rotate(" + j + "deg)");
                $(".pie2").css("-moz-transform","rotate(" + j + "deg)");
                $(".pie2").css("-webkit-transform","rotate(" + j + "deg)");
            },
            
            start : function(duration) {
                if(lock || isNaN(duration)) return;
                count = 0;
                i = 0;
                j = 0;
                countForPi = duration * 1000 / interval;
                step = 180 / countForPi;
                if(this.js_timer) clearInterval(this.js_timer);
                this.js_timer = setInterval("window.controller.countdown1()", interval);
                
                $(".pie1").css("-o-transform","rotate(0deg)");
                $(".pie1").css("-moz-transform","rotate(0deg)");
                $(".pie1").css("-webkit-transform","rotate(0deg)");
                $(".pie2").css("-o-transform","rotate(0deg)");
                $(".pie2").css("-moz-transform","rotate(0deg)");
                $(".pie2").css("-webkit-transform","rotate(0deg)");
            },
            
            lock : function() {
                lock = true;
                if(this.js_timer) clearInterval(this.js_timer);
                $(".pie1").css("-o-transform","rotate(180deg)");
                $(".pie1").css("-moz-transform","rotate(180deg)");
                $(".pie1").css("-webkit-transform","rotate(180deg)");
                $(".pie2").css("-o-transform","rotate(180deg)");
                $(".pie2").css("-moz-transform","rotate(180deg)");
                $(".pie2").css("-webkit-transform","rotate(180deg)");
            },
            
            unlock : function() {
                lock = false;
            },
            
            finished : function() {
                if(!lock) {
                    scene.passNext();
                    updateProgressBar();
                }
            }
        };
    }(scene));
    
    
    
    
    var pid = 0;
    
    // Generate actions for paragraphes, games, animations ...
    $('#content section').each(function () {
        var section = $(this);
        
        section.children('p, ul, div').each(function () {
            var p = $(this);
            var duration = p.data('duration');
            var name = p.prop('id');
            var exit = p.data('goto');
            var sound = p.data('sound');
            
            var anime = p.data("animation");
            var action = null;
            
            // Create key game action
            if(p.hasClass('keygame')) {
                var gamename = p.data("gamename");
                if(!gamename) return;
                
                action = new KeyGameAction({
                    "scenario": scene,
                    "name": name ? name : 'paragraph' + pid,
                    'sound': sound,
                    'gameName': gamename,
                    'winexit': p.data("winexit"),
                    "loseexit": p.data("loseexit")
                });
                
                var bloc = new KeyGameBloc({ 'el': p, 'model': action});
                bloc.listenTo(action, 'started', bloc.actionStarted);
                bloc.listenTo(action, 'ended', bloc.actionEnded);
            }
            // Create game action
            else if(p.hasClass('game')) {
                var gamename = p.data("gamename");
                var gametype = p.data("gametype") ? p.data("gametype") : "normal";
                if(!gamename) return;
                
                action = new GameAction({
                    "scenario": scene,
                    "name": name ? name : 'paragraph' + pid,
                    'sound': sound,
                    'gameName': gamename,
                    'gameType': gametype,
                    'winexit': p.data("winexit"),
                    "loseexit": p.data("loseexit")
                });
                
                var bloc = new GameBloc({ 'el': p, 'model': action});
                bloc.listenTo(action, 'started', bloc.actionStarted);
                bloc.listenTo(action, 'ended', bloc.actionEnded);
            }
            // Create Animation action
            else if(anime) {
                action = new AnimeAction({
                    "scenario": scene,
                    "name": name ? name : 'paragraph' + pid,
                    'sound': sound,
                    'animeName': anime,
                    'duration': isNaN(duration) ? 3 : duration,
                    
                    // Chained next action
                    "exit": exit
                });
                
                var bloc = new AnimeBloc({ 'el': p, 'model': action});
                bloc.listenTo(action, 'started', bloc.actionStarted);
            }
            // Create css animation action
            else if (p.hasClass('cssanimation')) {
                // Found target for apply css animation
                var target = $( '#' + p.data('target') );
                if (target.length > 0 && target.data('endstyle')) {
                    action = new CSSAnimeAction({
                        "scenario": scene,
                        "name": name ? name : 'paragraph' + pid,
                        'sound': sound,
                        'target': target,
                        'duration': isNaN(duration) ? 3 : duration,
                        
                        // Chained next action
                        "exit": exit
                    });
                    
                    var bloc = new AnimeBloc({ 'el': p, 'model': action});
                    bloc.listenTo(action, 'started', bloc.actionStarted);
                }
            }
            // Create callback action
            else if (p.hasClass('callback')) {
                // Found target for apply css animation
                var target = p.data('target');
                if (target && window.callbacks[target]) {
                    action = new CallbackAction({
                        "scenario": scene,
                        "name": name ? name : 'paragraph' + pid,
                        'sound': sound,
                        'callback': window.callbacks[target],
                        'duration': isNaN(duration) ? 3 : duration,
                        
                        // Chained next action
                        "exit": exit
                    });
                }
            }
            else if (p.hasClass('choice')) {
                // Find all exits
                var exits = new Array();
                p.children('li').each(function() {
                    var exit = $(this).data('goto');
                    if (exit) {
                        exits.push(exit);
                    }
                });
                
                action = new ChoiceAction({
                    "scenario": scene,
                    "name": name ? name : 'paragraph' + pid,
                    'sound': sound,
                    'duration': 3,
                    
                    // Chained next action
                    "exits": exits
                });
                
                var bloc = new ChoiceBloc({ 'el': p, 'model': action});
                bloc.listenTo(action, 'started', bloc.actionStarted);
                bloc.listenTo(action, 'ended', bloc.actionEnded);
            }
            // Create illu action
            else if (p.hasClass('illu')){
                action = new TextAction({
                    "scenario": scene,
                    "name": name ? name : 'paragraph' + pid,
                    'sound': sound,
                    'duration': isNaN(duration) ? p.text().length * 0.015 + 0.8 : duration,
                    
                    // Chained next action
                    "exit": exit
                });
                
                var bloc = new IlluBloc({ 'el': p, 'model': action});
                bloc.listenTo(action, 'started', bloc.actionStarted);
                bloc.listenTo(action, 'ended', bloc.actionEnded);
            }
            // Create normal action
            else {
                action = new TextAction({
                    "scenario": scene,
                    "name": name ? name : 'paragraph' + pid,
                    'sound': sound,
                    'duration': isNaN(duration) ? p.text().length * 0.015 + 0.8 : duration,
                    
                    // Chained next action
                    "exit": exit
                });
                
                var bloc = new TextBloc({ 'el': p, 'model': action});
                bloc.listenTo(action, 'started', bloc.actionStarted);
                bloc.listenTo(action, 'ended', bloc.actionEnded);
            }
            
            if (action) {
                actions.push(action);
            }
            
            pid++;
        });
    });
    
    // Init mse for animations, wikis, and games
    $('span.wiki').click(function() {
        var name = $(this).data('wikiname');
        if(!name) return;
        else {
            controller.dopause();
            Notebook.unlockAndShowDefinition(name);
        }
    });
    
    scene.addActions(actions);
    
    scene.initLink();
    
    
    
    
    // CSS animations
    // Heart beat effect
    function heartBeat() {
        if ($(this).data('beating')) {
            $(this).animateCSS({
                  'duration': '0.2s',
                  'timing_function': 'ease-in',
                  'css': {'transform': "scale(1.1, 1.1)"}
              }).animateCSS({
                  'duration': '0.5s',
                  'timing_function': 'ease-out',
                  'css': {'transform': "scale(1, 1)"}
              }).queue(function(next) {
                  heartBeat.call(this);
                  next();
              });
        }
    }
    function stopHeart() {
        $(this).data('beating', false);
    }
    /*
    for (var i = 1; i <= 4; i++) {
        var name = "heart"+i;
        var action = scene.getAction(name);
        var parag = $('#'+name);
        parag.data('beating', true);
        
        // Bind heart effect
        action.once('started', heartBeat, parag);
        action.once('ended', stopHeart, parag);
    }
    */
    // Quarante Trente
    function zoominout() {
        $(this).animateCSS({
              'duration': '0.4s',
              'timing_function': 'ease-out',
              'css': {'transform': "scale(3.2, 3.2)"}
          }).animateCSS({
              'duration': '0.5s',
              'timing_function': 'ease-in',
              'css': {'transform': "scale(1, 1)"}
          });
    }
    scene.getAction('quarante').once('started', zoominout, $('#quarante'));
    scene.getAction('trente').once('started', zoominout, $('#trente'));
    
    // Tuto and capture for background 1
    scene.getAction('phototuto').once('started', function() {
        if( bag.isPhotoLock("ph_rue") ) {
            window.controller.lock();
            window.bag.photoReady("ph_rue", $('#contentBack'), false);
        
            var tutodone = function(pid) {
                var action = scene.getAction('phototuto');
                if (pid == "ph_rue" && action.get("state") == "START") {
                    window.controller.unlock();
                    action.end();
                    bag.getView().off("PhotoCaptured", tutodone);
                }
            }
        
            bag.getView().on("PhotoCaptured", tutodone);
        }
    });
    
    // Capture for background 2
    scene.getAction('background2').on('started', function() {
        window.bag.photoReady('ph_pavillon', $('#contentBack'));
    });
    
    
    // FLAGS
    scene.getAction("9").once("started", function() {
        Badge.pullUpFlag("FinishEP1");
    });

});