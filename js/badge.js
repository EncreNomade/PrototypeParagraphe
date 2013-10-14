var Badge = (function() {

    // MODELS SECTION

    Flag = Backbone.Model.extend({
        defaults: {
            "id": null,
            "name": "",
            "pulled": false
        }
    });
    
    Flags = Backbone.Collection.extend({"model": Flag});
    
    Badge = Backbone.Model.extend({
        defaults: {
            "name": "",
            "imgUrl": "",
            "flagids": [],
            "info": "",
            "lock": true
        },
        
        initFlags: function(flagDB) {
            var flagids = this.get("flagids");
            this.flags = {};
            for (var i = 0; i < flagids.length; i++) {
                this.listenTo(flagDB.get(flagids[i]), "change:pulled", this.flagPulled);
                this.flags[flagids[i]] = false;
            }
        },
        
        flagPulled: function(flag) {
            this.flags[flag.id] = flag.get("pulled");
            
            var canUnlock = true;
            for (var i in this.flags) {
                if (!this.flags[i]) {
                    canUnlock = false;
                    break;
                }
            }
            
            if (canUnlock) {
                this.unlock();
            }
            
            return this;
        },
        
        unlock: function() {
            this.set("lock", false);
        }
    });
    
    BadgeList = Backbone.Collection.extend({
        "model": Badge,
        
        initialize: function() {
            this.listenTo(this, "add", this.badgeAdded);
        },
        
        badgeAdded: function(badge) {
            badge.initFlags(this.flagDB);
        }
    });
    
    
    
    
    
    
    // VIEW SECTION
    
    BadgeView = Backbone.View.extend({
        "tagName": "li",
        "tpl": _.template('<img class="badgeimg" src="<%= imgUrl %>"/><img class="cadena" src="./img/ui/bdg_cadena.png"/><%= info %>'),
        
        initialize: function() {
            if (this.model) {
                this.listenTo(this.model, "change:lock", this.checkLock);
            }
        },
        
        render: function() {
            if (this.model.get("lock")) {
                this.$el.addClass("lock");
            }
            else {
                this.$el.removeClass("lock");
            }
            
            this.$el.html( this.tpl({"imgUrl": this.model.get("imgUrl"),
                                     "info": this.model.get("info")}) );
            
            return this;
        },
        
        checkLock: function() {
            if (this.model.get("lock")) {
                this.$el.addClass("lock");
            }
            else {
                this.$el.removeClass("lock");
            }
            return this;
        }
    });
    
    BadgeListView = Backbone.View.extend({
        "tagName": "section",
        "className": "layer",
        
        render: function() {
            this.$el.html( '<ul></ul>' );
            
            var listView = this.$("ul");
            if (this.collection) {
                this.collection.each(function(badge) {
                    var badgeView = new BadgeView({"model": badge});
                    listView.append(badgeView.render().$el);
                });
            }
            
            return this;
        }
    });
    
    BadgeMenuItem = Backbone.View.extend({
        "tagName": "li",
        
        "events": {
            "click": "active"
        },
        
        initialize: function(opts, name, page, panel) {
            this.name = name ? name : "";
            this.page = page;
            this.panel = panel;
        },
        
        active: function() {
            this.panel.activePage(this.name);
            return this;
        },
        
        render: function() {
            this.$el.text(this.name);
            return this;
        }
    });
    
    
    BadgePanel = Backbone.View.extend({
        "tagName": "article",
        
        "events": {
            "click .close": "hide"
        },
        
        initialize: function() {
            this.menu = this.$("#bdg_menu ul");
            this.listSection = this.$("#bdg_list");
            this.pages = {};
        },
        
        addPage: function(name, badgeList) {
            var page = new BadgeListView({"collection": badgeList});
            var menuItem = new BadgeMenuItem({}, name, page, this);
            
            this.menu.append(menuItem.render().$el);
            this.listSection.append(page.render().$el);
            
            this.pages[name] = menuItem;
            return this;
        },
        
        activePage: function(name) {
            if (this.pages[name]) {
                for (var i in this.pages) {
                    if (i != name) {
                        this.pages[i].$el.removeClass("active");
                        this.pages[i].page.$el.removeClass("active");
                    }
                    else {
                        this.pages[i].$el.addClass("active");
                        this.pages[i].page.$el.addClass("active");
                    }
                }
            }
            return this;
        },
        
        show: function() {
            this.$el.removeClass("hidden").addClass("show");
        },
        
        hide: function() {
            this.$el.removeClass("show").addClass("hidden");
        }
    });
    
    
    
    NotificationView = Backbone.View.extend({
        "tagName": "div",
        "tpl": _.template('<div><img src="<%= imgUrl %>"/></div>'),
        
        initialize: function() {
        },
        
        render: function() {
            if (this.model) {
                this.$el.html( this.tpl({"imgUrl": this.model.get("imgUrl")}) );
            }
            return this;
        },
        
        notifyGET: function(model) {
            if (!model.get("lock")) {
                this.model = model;
                this.render().$el.removeClass("hidden").addClass("show");
                this.$el.addClass("get");
                _.delay(function(view) {
                    view.$el.removeClass("show get").addClass("hidden");
                }, 2000, this);
            }
        }
    });
    

    return {
        "flagDB": new Flags(),
        "panel": null,
        "notifView": null,
        
        initFlagDB: function(data) {
            if (_.isArray(data)) {
                this.flagDB.add(data);
            }
        },
        
        initBadges: function(badgeLists, badgePanelJQ, notificationJQ) {
            this.panel = new BadgePanel({"el": badgePanelJQ});
            this.notifView = new NotificationView({"el": notificationJQ});
            
            var flagDB = this.flagDB;
            for (var name in badgeLists) {
                var badgeList = new BadgeList(badgeLists[name]);
                
                badgeList.each(function(model) {
                    model.initFlags(flagDB);
                });
                
                this.notifView.listenTo(badgeList, "change:lock", this.notifView.notifyGET);
                this.panel.addPage(name, badgeList);
            }
        },
    
        pullUpFlag: function(name) {
            this.flagDB.findWhere({"name": name}).set("pulled", true);
        },
        
        isPanelOpen: function() {
            return this.panel.$el.hasClass("show");
        },
        
        showPanel: function() {
            this.panel.show();
        },
        
        hidePanel: function() {
            this.panel.hide();
        }
    };

})();





// Data

flagDB = [
    {
        "id": 1,
        "name": "DeadBlock",
        "pulled": false
    },
    {
        "id": 2,
        "name": "FinishEP1",
        "pulled": false
    },
    {
        "id": 3,
        "name": "CollectOnePhoto",
        "pulled": false
    },
    {
        "id": 4,
        "name": "DoOneChoice",
        "pulled": false
    },
    {
        "id": 5,
        "name": "WinParcMontsouris",
        "pulled": false
    },
    {
        "id": 6,
        "name": "CollectBack1",
        "pulled": false
    },
    {
        "id": 7,
        "name": "CollectBack2",
        "pulled": false
    },
    {
        "id": 8,
        "name": "CollectIllu1",
        "pulled": false
    },
    {
        "id": 9,
        "name": "CollectIllu2",
        "pulled": false
    },
    {
        "id": 10,
        "name": "CollectOneWiki",
        "pulled": false
    },
    {
        "id": 11,
        "name": "CollectOneWiki",
        "pulled": false
    }
];

badgeLists = {
    "Communs" : [
        {
            "name": "OneEpisode",
            "imgUrl": "./img/ui/bdg_1Epi.png",
            "flagids": [2],
            "info": "Avoir terminé un épisode entier",
            "lock": true
        },
        {
            "name": "AllEpisode",
            "imgUrl": "./img/ui/bdg_allEpi.png",
            "flagids": [1],
            "info": "Avoir terminé tous les épisodes",
            "lock": true
        },
        {
            "name": "TheFirsts",
            "imgUrl": "./img/ui/bdg_1photo1wiki.png",
            "flagids": [3, 10],
            "info": "Avoir obtenu ta première photo",
            "lock": true
        },
        {
            "name": "AllCollection",
            "imgUrl": "./img/ui/bdg_allPhotoAllWiki.png",
            "flagids": [1],
            "info": "Avoir obtenu toutes les photos et toutes les définitions",
            "lock": true
        },
        {
            "name": "100%",
            "imgUrl": "./img/ui/bdg_100.png",
            "flagids": [1],
            "info": "Avoir exploré cent pour cent du jeu",
            "lock": true
        }
    ],
    "Episode 1" : [
        {
            "name": "Ep1_OneChoice",
            "imgUrl": "./img/ui/bdg_1choice.png",
            "flagids": [4],
            "info": "Avoir fait un choix",
            "lock": true
        },
        {
            "name": "Ep1_AllChoice",
            "imgUrl": "./img/ui/bdg_allChoice.png",
            "flagids": [1],
            "info": "Avoir fait tous les choix dans l'episode 1",
            "lock": true
        },
        {
            "name": "Ep1_Game",
            "imgUrl": "./img/ui/bdg_game.png",
            "flagids": [5],
            "info": "Avoir fini le mini jeu",
            "lock": true
        },
        {
            "name": "Ep1_Definitions",
            "imgUrl": "./img/ui/bdg_allWiki.png",
            "flagids": [11],
            "info": "Avoir collecte toutes les définitions dans l'episode 1",
            "lock": true
        },
        {
            "name": "Ep1_Photos",
            "imgUrl": "./img/ui/bdg_allPhoto.png",
            "flagids": [6, 7, 8, 9],
            "info": "Avoir collecte toutes les photos dans l'episode 1",
            "lock": true
        },
        {
            "name": "Ep1_Finish",
            "imgUrl": "./img/ui/bdg_finiEpi.png",
            "flagids": [2],
            "info": "Avoir fini l'episode 1",
            "lock": true
        }
    ]
};


// Initialization

$(document).ready(function() {

    Badge.initFlagDB(flagDB);
    Badge.initBadges(badgeLists, $("#ui_badge"), $("#ui_bdg_notification"));
    Badge.panel.activePage("Episode 1");

});