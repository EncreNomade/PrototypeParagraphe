/* ***************************************************
 * Scenario and Action
 *****************************************************/
 
var MseScenario = function() {
    // Actions list
    this.actions = new Array();
    
    // Links of actions, actions can be linked non linearly
    this.links = {};
    
    // Current action
    this._progress = 0;
    
    // Register the history of actions
    this.history = new Array();
    
    // Length of actions with one default chain
    this.predictLength = 0;
    
    // Length valide or not, everytime action added or deleted, link added
    this.predictLengthValid = false;
    
    // Flag to indicate if the jump action is a rollback
    this.rollback = false;
    
    // Current max index of action
    this.maxProgress = 0;
}
MseScenario.prototype = {
    constructor: MseScenario,
    
    get progress() {
        return this._progress;
    },
    set progress(progress) {
        if(!isNaN(progress) && progress < this.actions.length && progress >= 0) {
            this._progress = progress;
        }
    },
    
    initLink: function() {
        for (var i = 0; i < this.actions.length; i++) {
            var action = this.actions[i];
            if (typeof action.initLink == "function") {
                action.initLink();
            }
        }
    },
    
    updateLinks: function(fromAction, toActionNames) {
        var fromIndex = this.actions.indexOf(fromAction);
        
        // Reinit links for fromAction
        var from = fromAction.get("name");
        this.links[from] = [];
        
        for (var i = 0; i < toActionNames.length; i++) {
            var toIndex = this.getActionIndex(toActionNames[i]);
            
            // Check existance and make sure fromIndex smaller than toIndex for avoiding circles
            if (fromIndex >= 0 && toIndex >= 0 && fromIndex < toIndex) {
                // Add link
                this.links[from].push(toActionNames[i]);
            }
        }
        
        this.predictLengthValid = false;
    },
    
    count: function() {
        if (!this.predictLengthValid) {
            // Calcul length
            var historyLength = this.history.length;
            var index = historyLength > 0 ? this.getActionIndex(this.history[historyLength-1]) : 0;
            var count = historyLength;
            
            while (index < this.actions.length) {
                // Get current action name
                var actionName = this.actions[index].get("name");
                // Default, increment index
                index ++;
                // Check for links
                if (this.links[actionName]) {
                    var next = this.getActionIndex(this.links[actionName][0]);
                    if (next >= 0) {
                        index = next;
                    }
                }
                count ++;
            }
            this.predictLength = count;
            this.predictLengthValid = true;
        }
        
        return this.predictLength;
    },
    
    reset: function() {
        for (var i in this.actions) {
            this.actions[i].reset();
        }
        
        this.progress = 0;
    },
    
    quit: function() {
        this.actions[this.progress].quit();
        //this.progress = 0;
    },
    
    directReachable: function(progress) {
        if (progress > this.maxProgress) {
            return false;
        }
        else return true;
    },
    
    run: function(progress) {
        // Scenario finished
        if(progress >= this.actions.length) {
            this.quit();
            return;
        }
        
        // Switch rollback flag
        if (this.rollback) {
            this.rollback = false;
        }
        // Otherwise push the current action
        else this.history.push( this.actions[this.progress].get("name") );
        this.progress = progress;
        // Register max progress
        if (this.progress > this.maxProgress) {
            this.maxProgress = this.progress;
        }
        
        var action = this.actions[this.progress];
        action.reset();
        
        var beginDelay = action.get("beginDelay");
        if(beginDelay) {
            setTimeout(function() {
                action.start();
            }, beginDelay);
        }
        else action.start();
    },
    
    jumpTo: function(progress) {
        if ( isNaN(progress) || progress >= this.actions.length || progress < 0 ) {
            return;
        }
        
        var name = this.actions[progress].get("name");
        var idHistory = this.history.indexOf(name);
        if (idHistory != -1) {
            for (var i = this.history.length-1; i > idHistory; i--) {
                this.history.pop();
            }
            
            this.rollback = true;
        }
        
        this.actions[this.progress].end(true);
        this.run(progress);
    },
    
    jumpToAction: function(name) {
        var progress = this.getActionIndex(name);
        if (progress == -1) {
            return;
        }
        
        this.actions[this.progress].end(true);
        this.run(progress);
    },
    
    passNext: function() {
        if(this.progress < this.actions.length) {
            var name = this.actions[this.progress].get("name");
            this.actions[this.progress].end();
        }
    },
    
    gotoPrev: function() {
        if(this.progress > 0) {
            this.actions[this.progress].end(true);
            // Goto registered previous
            var previous = this.history.pop();
            if (previous) {
                this.rollback = true;
                this.jumpToAction(previous);
            }
        }
    },
    
    actionEnded: function(action) {
        var id = this.actions.indexOf(action);
        
        if(id != -1) {
            var endDelay = action.get("endDelay");
            if(endDelay) {
                var scenario = this;
                setTimeout(function() {
                    scenario.run(id+1);
                }, endDelay);
            }
            else this.run(id+1);
        }
    },
    
    addActions: function(actions) {
        if($.isArray(actions)) {
            for (var i in actions) {
                this.addAction(actions[i]);
            }
        }
    },
    
    getAction: function(name) {
        for (var i in this.actions) {
            if(this.actions[i].get("name") == name)
                return this.actions[i];
        }
        return null;
    },
    
    getActionIndex: function(name) {
        for (var i in this.actions) {
            if(this.actions[i].get("name") == name)
                return i;
        }
        return -1;
    },
    
    addAction: function(action) {
        if(action instanceof MseAction) {
            this.actions.push(action);
            action.set("scenario", this);
            
            action.on('change:exit', this.actionExitChanged, this);
            action.on('change:exits', this.actionChoicesChanged, this);
            
            // Predicted length no longer valide
            if (this.predictLengthValid) {
                this.predictLengthValid = false;
            }
        }
    },
    
    insertActionAfter: function(action, target) {
        if(action instanceof MseAction) {
        
            if (target instanceof String) {
                target = this.getAction(target);
            }
        
            id = this.actions.indexOf(target);
            if(id >= 0) {
                this.actions.splice(id, 0, action);
                action.set("scenario", this);
                
                // Predicted length no longer valide
                if (this.predictLengthValid) {
                    this.predictLengthValid = false;
                }
            }
            
        }
    },
    
    actionExitChanged: function(model, newexit) {
        this.updateLinks( model, [newexit] );
    },
    
    actionChoicesChanged: function(model, newchoices) {
        this.updateLinks( model, newchoices );
    }
}


var MseAction = Backbone.Model.extend({
    
    defaults: {
        "state": "INIT",
        "scenario": null
    },
    
    initLink: function() {
        var exit = this.get("exit");
        var scenario = this.get("scenario");
        if (exit && scenario) {
            scenario.actionExitChanged(this, exit);
        }
    },
    
    validate: function(attrs, options) {
        if (typeof attrs.realStart != "function") {
            delete attrs["realStart"];
        }
        
        if (typeof attrs.realEnd != "function") {
            delete attrs["realEnd"];
        }
    },
    
    realStart: function() {},
    realEnd: function() {},
    
    reset: function() {
        this.set("state", "INIT");
    },
    
    quit: function() {
        this.realEnd();
        this.set("state", "END");
    },
    
    previousAction: function() {
        var scenario = this.get("scenario");
        if(scenario) {
            return scenario.getAction(scenario.previous);
        }
        else return null;
    },
    
    start: function() {
        if(this.get("state") != "INIT") return;
        this.set("state", "START");
        this.realStart();
        this.trigger("started");
    },
    
    end: function(stopScena, exit) {
        if(this.get("state") != "START") return;
        
        this.trigger("ended");
        try {
            this.realEnd();
        }
        catch (error) {
            
        }
        this.set("state", "END");
        
        var scenario = this.get("scenario");
        if(!stopScena && scenario) {
            // Exit given
            if (exit) {
                scenario.predictLengthValid = false;
                scenario.jumpToAction(exit);
            }
            // Defined exit
            else if (this.get("exit")) {
                scenario.predictLengthValid = false;
                scenario.jumpToAction(this.get("exit"));
            }
            // No defined exit
            else scenario.actionEnded(this);
        }
    }
});
