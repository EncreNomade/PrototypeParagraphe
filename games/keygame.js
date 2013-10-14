$(document).ready(function () {


var KeyView = Backbone.View.extend({
    "tagName": "div",
    "className": "key",
    
    initialize: function(options, key, keycode, keyborder) {
        this.key = key;
        this.keycode = keycode;
        this.keyborder = keyborder;
        this.active = false;
        this.actioned = false;
        this.success = false;
        this.parent = null
    },
    
    startCount: function(key) {
        if (key.get("name") == this.key && this.keyborder) {
            this.keyborder.startCount();
        }
    },
    
    activate: function(key) {
        if (key.get("name") == this.key) {
            this.active = true;
            this.keyborder.$el.addClass("active");
        }
    },
    
    desactive: function(key) {
        if (key.get("name") == this.key) {
            this.active = false;
            this.keyborder.$el.removeClass("active");
            
            // Update model if succeed
            if (this.success) {
                key.set("succeed", true);
                
                this.success = false;
            }
            else {
                key.set("succeed", false);
            }
            
            // Update key view if miss
            if (!this.actioned) {
                this.$el.queue(function(next) {
                    $(this).removeClass("hit miss").addClass("error");
                    next();
                }).delay(200).queue(function(next) {
                    $(this).removeClass("error");
                    next();
                });
                
                this.parent ? this.parent.keyMiss() : 0;
            }
            
            this.actioned = false;
        }
    },
    
    matchKey: function(keycode) {
        return keycode == this.keycode;
    },
    
    keydown: function() {
        var arrow = this.$(".arrow");
        if (this.active) {
            this.$el.queue(function(next) {
                $(this).removeClass("error miss").addClass("hit");
                next();
            }).delay(200).queue(function(next) {
                $(this).removeClass("hit");
                next();
            });
            
            this.success = true;
        }
        else {
            this.$el.queue(function(next) {
                $(this).removeClass("hit miss").addClass("error");
                next();
            }).delay(200).queue(function(next) {
                $(this).removeClass("error");
                next();
            });
            
            this.parent ? this.parent.keyMiss() : 0;
        }
        
        this.actioned = true;
        return this.success;
    }
});


var KeyBorderView = Backbone.View.extend({
    "tagName": "div",
    "className": "key_border",
    
    startCount: function(key) {
        var border = this.$el;
        
        border.addClass('reduce');
        _.delay(function() {
            border.removeClass('reduce');
        }, 1500);
    }
});


var leftkeyborder = new KeyBorderView({'el': $(".leftkey.key_border")});
var rightkeyborder = new KeyBorderView({'el': $(".rightkey.key_border")});
var topkeyborder = new KeyBorderView({'el': $(".topkey.key_border")});
var bottomkeyborder = new KeyBorderView({'el': $(".bottomkey.key_border")});

var leftkey = new KeyView({'el': $(".leftkey.key")}, "left", 37, leftkeyborder);
var rightkey = new KeyView({'el': $(".rightkey.key")}, "right", 39, rightkeyborder);
var topkey = new KeyView({'el': $(".topkey.key")}, "up", 38, topkeyborder);
var bottomkey = new KeyView({'el': $(".bottomkey.key")}, "down", 40, bottomkeyborder);
var keys = [leftkey, rightkey, topkey, bottomkey];

var ScoreView = Backbone.View.extend({
    "tagName": "li",
    
    updateScore: function(key) {
        var mark = this.$el;
        if (key.get("succeed") === true) {
            mark.removeClass("lost").addClass("succeed");
        }
        else {
            mark.removeClass("succeed").addClass("lost");
        }
    }
});

var keygame = new (Backbone.View.extend({
    "tagName": "div",
    
    "events": {
        "keydown": "keydown"
    },
    
    initialize: function(options, keys) {
        this.timer_left = this.$('#timer_left');
        this.timer_right = this.$('#timer_right');
        this.score = this.$('#keygame_score');
        
        this.keys = keys;
        for (var i = 0; i < keys.length; i++) {
            keys[i].parent = this;
        }
    },
    
    show: function() {
        if( !this.$el.hasClass("show") ) {
            this.$el.removeClass("hidden").addClass("show");
        }
        
        if (this.collection) {
            this.initScore();
        
            var time = 2000;
            this.collection.each(function(key) {
                time += key.get("interval");
            });
            
            var timer = this.$('#key_timer');
            // Delay for adding urgent class to timer
            _.delay(function(timer) {
                timer.addClass("urgent");
            }, time*0.8, timer);
            
            // Millesecond to second
            time = time / 1000;
            
            // Start count down
            this.timer_left.css("width", 400);
            this.timer_left.animateCSS({'duration': time+'s',
                                        'timing_function': 'linear',
                                        'css': {'width': 0}});
            this.timer_right.css("width", 400);
            this.timer_right.animateCSS({'duration': time+'s',
                                         'timing_function': 'linear',
                                         'css': {'width': 0}});
        }
        
        $('body').bind('keydown', {'gameview': this}, this.keydown);
    },
    
    hide: function() {
        if( this.$el.hasClass("show") ) {
            this.$el.removeClass("show").addClass("hidden");
        }
        this.$('#key_timer').removeClass("urgent");
        
        $('body').unbind('keydown', this.keydown);
    },
    
    keyMiss: function() {
        //this.score.append('<li class="lost"></li>');
        this.collection.miss();
    },
    
    keydown: function(e) {
        var gameview = e.data.gameview;
        
        for (var i = 0; i < gameview.keys.length; i++) {
            var key = gameview.keys[i];
            if (key.matchKey(e.which)) {
                key.keydown();
                break;
            }
        }
    },
    
    initScore: function() {
        this.score.empty();
        /*for (var i = 0; i < this.collection.length; i++) {
            var view = new ScoreView();
            this.score.append(view.$el);
            
            view.listenTo(this.collection.at(i), 'change:succeed', view.updateScore);
        }*/
    }
}))({'el': $("#keygame")}, keys);



var Key = Backbone.Model.extend({
    defaults: {
        name: "",
        interval: 3000,
        succeed: null
    },
    
    activateDelay: 825,
    desactiveDelay: 225
});

var KeyChain = Backbone.Collection.extend({
    "model": Key,
    
    startGame: function() {
        this.trigger("start");
        this.current = 0;
        this.result = {"win": true, "missCount": 0};
        
        var chain = this;
        _.delay(function() {
            chain.chainKey();
        }, 2000);
    },
    
    endGame: function() {
        // End delay
        _.delay(function(chain) {
            chain.trigger("end");
        }, 2000, this);
    },
    
    miss: function() {
        this.result.missCount ++;
        if (this.result.missCount > 5) {
            this.result.win = false;
            this.endGame();
        }
    },
    
    chainKey: function() {
        var currentkey = this.at(this.current),
            chain = this;
            
        this.current++;
        
        if (currentkey) {
            var log = _.bind(console.log, console);
            
            chain.trigger("startCount", currentkey);
            _.delay(function() {
                chain.trigger("activate", currentkey);
                
                _.delay(function() {
                    chain.trigger("desactive", currentkey);
                }, currentkey.desactiveDelay);
            }, currentkey.activateDelay);
            
            var next = _.bind(this.chainKey, this);
            _.delay(next, currentkey.get("interval"));
        }
        else {
            this.endGame();
        }
    }
});


window.initKeyGame = function(arr) {
    var chain = new KeyChain([]);
    for (var i = 0; i < arr.length; i++) {
        chain.push({"name": arr[i][0], "interval": arr[i][1]});
    }
    
    keygame.collection = chain;
    keygame.listenTo(chain, 'start', keygame.show);
    keygame.listenTo(chain, 'end', keygame.hide);
    
    for (var i = 0; i < keys.length; i++) {
        var keyview = keys[i];
        keyview.collection = chain;
        keyview.listenTo(chain, 'startCount', keyview.startCount);
        keyview.listenTo(chain, 'activate', keyview.activate);
        keyview.listenTo(chain, 'desactive', keyview.desactive);
    }
    
    return chain;
};

});