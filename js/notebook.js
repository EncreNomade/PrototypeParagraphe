var Notebook = (function() {

    // Panel view
    
    var NotebookPanel = Backbone.View.extend({
        tagName: "article",
        
        initialize: function(opts, parent, sectionId, menuItemId) {
            this.parent = parent;
            var sectionSel = '#'+sectionId;
            var menuItemSel = '#'+menuItemId;
            this.section = this.$(sectionSel);
            this.menuItem = this.$(menuItemSel);
            
            var activeEvent = "click "+menuItemSel;
            var events = {};
            events[activeEvent] = "active";
            this.delegateEvents(events);
        },
        
        active: function() {
            if (this.parent) {
                this.parent.desactiveAllPage();
            }
            this.menuItem.addClass("active");
            this.section.addClass("active");
            return this;
        }
    });


    // Roles model
    
    var Role = Backbone.Model.extend({
        defaults: {
            name: "",
            figureUrl: "",
            sections: []
        }
    });

    // Figure
    
    var FigureView = Backbone.View.extend({
        tagName: "div",
        className: "figure",
        tpl: _.template('<img class="full-size-content animate" src="<%= figureUrl %>"/><p><%= name %></p>'),
        
        events: {
            "click" : "showDetail"
        },
    
        render: function() {
            this.$el.html( this.tpl({figureUrl: this.model.get("figureUrl"), 
                                     name: this.model.get("name")}) );
            return this;
        },
        
        showDetail: function() {
            var detailView = new RoleDetailView({model: this.model}).render();
            window.Notebook.rolesPanel.showDetailPage(detailView);
            return this;
        }
    });
    
    // Roles panel
    
    var RolesPanel = NotebookPanel.extend({
        initialize: function() {
            NotebookPanel.prototype.initialize.apply(this, arguments);
            
            if (this.collection) {
                var section = this.section.empty();
                var count = 0;
                this.collection.each(function(model) {
                    var view = new FigureView({model: model}).render();
                    section.append(view.$el);
                    if (count >= 8) {
                        view.$el.addClass("page2item");
                    }
                    count ++;
                });
            }
            section.append("<div class='page2'></div>");
        },
        
        showDetailPage: function(view) {
            this.section.children(".page2").empty().append(view.$el);
            return this;
        }
    });
    
    var RoleDetailView = Backbone.View.extend({
        tagName: "article",
        className: "role_detail",
        tpl: _.template('<header><img class="figure" src="<%= figureUrl %>"/><h1><%= name %></h1></header><% _.each(sections, function(section) { %> <section><%= section %></section> <% }); %>'),
        
        render: function() {
            this.$el.html( this.tpl( this.model.toJSON() ) );
            return this;
        }
    });
    
    
    
    
    
    // Intro view
    
    var IntroPanel = NotebookPanel.extend({
        initialize: function() {
            NotebookPanel.prototype.initialize.apply(this, arguments);
        }
    });
    
    
    
    
    
    // Word Model
    
    var Word = Backbone.Model.extend({
        defaults: {
            word: "",
            category: "",
            genre: "",
            definitions: [],
            extraInfos: {},
            synonymes: [],
            links: {},
            lock: true
        }
    });
    
    // Word view
    
    var WordView = Backbone.View.extend({
        tagName: "p",
        className: "word",
        tpl: _.template('<%= word %>'),
        
        events: {
            "click" : "showDetail"
        },
        
        initialize: function() {
            this.listenTo(this.model, "change:lock", this.render);
        },
    
        render: function() {
            if (this.model.get("lock")) 
                this.$el.addClass("lock");
            else this.$el.removeClass("lock");
            this.$el.html( this.tpl({word: this.model.get("word")}) );
            return this;
        },
        
        showDetail: function() {
            if (!this.model.get("lock")) {
                var detailView = new WordDetailView({model: this.model}).render();
                window.Notebook.dictionaryPanel.showDetailPage(detailView);
            }
            
            return this;
        }
    });
    
    var WordDetailView = Backbone.View.extend({
        tagName: "article",
        className: "word_detail",
        tpl: _.template('<header><h1><%= word %></h1><h5><%= category %><% if(genre) print(", "+genre); %></h5></header><h2>Définitions</h2><section class="definitions"><% _.each(definitions, function(definition) { %> <p> - <%= definition %></p> <% }); %></section><% for(var key in extraInfos) { %> <section class="extraInfo"><h2><%= key %></h2><%= extraInfos[key] %></section> <% } %><% if(!_.isEmpty(links)) { %><h2>Liens externes</h2><section class="links"><% for(var key in links) { %> <p><a href="<%= links[key] %>" target="_blank"><%= key %></a></p> <% } %></section><% } %>'),
        
        render: function() {
            this.$el.html( this.tpl( this.model.toJSON() ) );
            return this;
        }
    });
    
    // Dictionary view
    
    var DictionaryPanel = NotebookPanel.extend({
        initialize: function() {
            NotebookPanel.prototype.initialize.apply(this, arguments);
            
            this.wordViews = {};
            
            var section = this.section.empty(), wordViews = this.wordViews;
            if (this.collection) {
                this.collection.comparator = this.comparator;
                this.collection.sort_key = "word";
                this.collection.sort();
                this.collection.each(function(model) {
                    var view = new WordView({model: model}).render();
                    wordViews[model.get("word")] = view;
                    section.append(view.$el);
                });
            }
            section.append("<div class='page2'></div>");
        },
        comparator: function(a, b) {
            // Assuming that the sort_key values can be compared with '>' and '<',
            // modifying this to account for extra processing on the sort_key model
            // attributes is fairly straight forward.
            a = a.get(this.sort_key);
            b = b.get(this.sort_key);
            return a > b ?  1
                 : a < b ? -1
                 :          0;
        },
        
        unlockWord: function(word) {
            var word_m = this.collection.findWhere({"word": word});
            if(word_m) 
                word_m.set("lock", false);
            return this;
        },
        
        showDefinition: function(word) {
            if (this.wordViews[word]) {
                this.wordViews[word].showDetail();
            }
            return this;
        },
        
        showDetailPage: function(view) {
            this.section.children(".page2").empty().append(view.$el);
            return this;
        }
    });
    
    
    
    
    
    // Credit view
    
    var CreditPanel = NotebookPanel.extend({
        initialize: function() {
            NotebookPanel.prototype.initialize.apply(this, arguments);
        }
    });
    
    
    // Root view
    
    var NotebookView = Backbone.View.extend({
        tagName: "article",
        
        events: {
            "click #nb_close": "hide",
            "click #nb_page_close": "hideDetail"
        },
        
        initialize: function() {
            this.menuItems = this.$("nav ul li");
            this.sections = this.$("#nb_pages section");
            this.detailPage = this.$("#nb_onepage");
        },
        
        desactiveAllPage: function() {
            this.menuItems.removeClass("active");
            this.sections.removeClass("active");
            
            return this;
        },
        
        showDetail: function(view) {
            this.detailPage.children("article").replaceWith(view.$el);
            this.detailPage.removeClass("hidden").addClass("show");
        },
        
        hideDetail: function() {
            this.detailPage.removeClass("show").addClass("hidden");
        },
        
        show: function() {
            this.$el.removeClass("hidden").addClass("show");
        },
        
        hide: function() {
            this.$el.removeClass("show").addClass("hidden");
            this.hideDetail();
        }
    });
    
    return {
        inited: false,
        
        initPanel: function(notebookJQ, roles, words) {
            this.book = new NotebookView({el: notebookJQ});
            
            this.introPanel = new IntroPanel({el: notebookJQ}, this.book, "nb_intro", "nb_intro_tab");
            
            var rolemodels = new Backbone.Collection(roles, {model: Role});
            var wordmodels = new Backbone.Collection(words, {model: Word});
            
            
            this.rolesPanel = new RolesPanel({
                                                el: notebookJQ,
                                                collection: rolemodels
                                             }, 
                                             this.book, 
                                             "nb_roles", 
                                             "nb_roles_tab");
                                             
            this.dictionaryPanel = new DictionaryPanel( {
                                                            el: notebookJQ,
                                                            collection: wordmodels
                                                        }, 
                                                        this.book, 
                                                        "nb_dictionary", 
                                                        "nb_dictionary_tab");
            
            this.creditPanel = new CreditPanel({el: notebookJQ}, this.book, "nb_credit", "nb_credit_tab");
            
            this.detailPage = new Backbone.View({tagName: "article", el: notebookJQ.children("nb_onepage")});
            
            this.rolesPanel.active();
            this.inited = true;
        },
        
        isPanelOpen: function() {
            if (this.inited) {
                if (this.book.$el.hasClass("show")) {
                    return true;
                }
            }
            return false;
        },
        
        showPanel: function(subPanel) {
            if (this.inited) {
                this.book.show();
                
                switch (subPanel) {
                case "Dictionary":
                    this.dictionaryPanel.active();
                    break;
                case "Credit":
                    this.creditPanel.active();
                    break;
                case "Intro":
                    this.introPanel.active();
                    break;
                case "Roles": default:
                    this.rolesPanel.active();
                    break;
                }
            }
        },
        
        hidePanel: function() {
            if (this.inited) {
                this.book.hide();
            }
        },
        
        unlockAndShowDefinition: function(word) {
            if (this.inited) {
                Badge.pullUpFlag("CollectOneWiki");
                this.dictionaryPanel.unlockWord(word).showDefinition(word);
                this.showPanel("Dictionary");
            }
        },
        
        showDetailPage: function(view) {
            if (this.inited) {
                this.book.showDetail(view);
            }
        }
    };
})();




var roles = [
    {
        name: "SIMON",
        figureUrl: "./img/simon.png",
        sections: ["<p>Il vient de s’échapper de son foyer.<br/>Il n’a qu’un seul ami, Dark Vador, son rat albinos.</p>", "<h2>Caractéristiques:</h2><p>Il ne se laisse pas faire.</p>"]
    },
    {
        name: "DARK VADOR",
        figureUrl: "./img/dark.png",
        sections: ["<p>Le seul ami de Simon</p>", "<h2>Caractéristiques:</h2><p>C’est un rat albinos<br/>Il attaque et mord sur ordre de Simon</p>"]
    },
    {
        name: "LA MEUTE",
        figureUrl: "./img/lameute.png",
        sections: ["<p>Quatre adolescents qui font régner leur loi au sein du foyer.</p>", "<h2>Caractéristiques:</h2><p>Ils passent à tabac ceux qui refusent de se soumettre.</p>"]
    },
    {
        name: "KEVIN",
        figureUrl: "./img/kevin.png",
        sections: ["<p>Le chef de la Meute</p>", "<h2>Caractéristiques:</h2><p>Sans pitié</p>"]
    },
    {
        name: "LA FOUINE",
        figureUrl: "./img/fouine.png",
        sections: ["<p>17 ans<br/>Il fait partie de la Meute</p>", "<h2>Caractéristiques:</h2><p>1m80, 75kg<br/>Violent</p>"]
    },
    {
        name: "OURS",
        figureUrl: "./img/ours.png",
        sections: ["<p>16 ans<br/>Il fait partie de la Meute</p>", "<h2>Caractéristiques:</h2><p>Le pas lourd<br/>Bête: il a un QI inversement proportionnel à son poids</p>"]
    },
    {
        name: "?",
        figureUrl: "./img/4th.png",
        sections: ["<p>Il fait partie de la Meute</p>"]
    },
    {
        name: "DIOGENE",
        figureUrl: "./img/diogene.png",
        sections: ["<p>Un SDF qui vit dans un amas de cartons</p>", "<h2>Caractéristiques:</h2><p>Ressemble au philosophe Diogène.<br/>Puissant<br/>Visage bienveillant<br/>Voix rassurante</p>"]
    }
];


var words = [
    {
        word: "Cyclope",
        category: "Nom",
        genre: "masculin",
        definitions: ["Les cyclopes sont des créatures fantastiques de la mythologie grecque. Ce sont des géants qui ne possèdent qu’un seul œil au milieu du front. Ils étaient soit forgerons, bâtisseurs ou pasteurs."],
        extraInfos: {
            "Polyphème": "<img src='./img/src8.png'/><p class='caption'>Polyphème, fils de Poséïdon</p>",
            "Un Cyclope chez les X-Men": "<p>Cyclope est aussi un super-héros créé par J. Kirby et S. Lee en 1963. C’est  un mutant qui génère des rayons extrêmement puissants avec ses yeux mais il évite au maximum d’utiliser la violence.</p><img src='./img/src9.jpeg'/><p class='caption'>Cyclope, super-héros des X-Men</p>"
        },
        synonymes: [],
        links: {
            "Wikipédia X-Men": "http://fr.wikipedia.org/wiki/Cyclope_%28comics%29"
        }
    },
    {
        word: "Hallali",
        category: "Nom",
        genre: "masculin",
        definitions: ["Sonnerie de chasse à courre qui annonce la prise imminente de l’animal, d’où l’expression : Sonner l’hallali : annoncer la défaite de quelqu’un.", "Moment où l’animal est pris.", "Par extension : débâcle, défaite"],
        extraInfos: {
            "Interjection": "Cri du chasseur qui attrape du gibier lors d’une chasse à courre.",
            "L'hallali du cerf": "<img src='./img/src22.jpeg'/><p class='caption'>Peint par Courbet en 1867</p>"
        },
        links: {"Wikipédia Cyclope": "http://fr.wikipedia.org/wiki/Cyclope"}
    },
    {
        word: "La Petite Ceinture",
        category: "Lieu",
        definitions: ["C’est une ancienne ligne de chemin de fer longue de 32 km qui faisait le tour de Paris."],
        extraInfos: {
            "Vue depuis la place Wagram": "<img src='./img/src32.jpeg'/><p class='caption'>Photographie de marsupilami92</p>",
            "Biodiversité": "Elle est considérée comme une réserve de biodiversité. On peut y observer de nombreuses variétés d’arbres, de plantes et la plus grande colonie de chauve-souris de l’espèce pipistrelle d’Ile de France.<br/>La ville de Paris y aménage des parcours pédagogiques, proposant ainsi un nouveau type de promenade nature à Paris.",
            "La Petite Ceinture traverse le Parc Montsouris": "<img src='./img/src33.jpeg'/><p class='caption'>Photo de Thomas Claveirole</p>"
        },
        links: {
            "Lien Wikipédia": "http://fr.wikipedia.org/wiki/Ligne_de_Petite_Ceinture",
            "Lien Mairie de Paris": "http://www.paris.fr/loisirs/se-promener-a-paris/balades-au-vert/decouvrir-les-richesses-de-la-petite-ceinture/rub_9660_stand_53584_port_23803"
        }
    },
    {
        word: "Albinos",
        category: "Adjectif",
        genre: "invariable",
        definitions: ["Qui est affecté d'albinisme."],
        extraInfos: {
            "Albinisme": "Nom, Masculin<br/>Maladie génétique qui se caractérise par une absence du pigment destiné à colorer la peau, les poils, les cheveux ainsi que par des yeux rouges. Elle affecte les humains ou les animaux.",
            "Rat albinos": "<img src='./img/src30.jpeg'/><p class='caption'>Photographie de Tambako</p>",
            "Les albinos célèbres": "Il existe des albinos célèbres parmi lesquels Salif Keïta, chanteur et musicien malien. Il a obtenu une Victoire de la musique en 2010 pour son album « La Différence »<img src='./img/src31.jpeg'/><p class='caption'>Salif Keïta par Jeff Attaway</p>"
        },
        links: {
            "Wikipédia albinos": "http://fr.wikipedia.org/wiki/Albinisme",
            "Site officiel de Salif Keïta": "http://salif-keita.artiste.universalmusic.fr/"
        }
    },
    {
        word: "Frondaison",
        category: "Nom",
        genre: "féminin",
        definitions: ["Les feuilles et les branches d’un arbre.", "Epoque où les feuilles commencent à pousser."],
        extraInfos: {
            "Photo de la frondaison": "<img src='./img/src29.jpeg'/><p class='caption'>Photo réalisée par Panoramas</p>"
        },
        synonymes: ["Feuillage", "Ramure", "Branchage"]
    },
    {
        word: "Noctambule",
        category: "Nom",
        genre: "masculin ou féminin",
        definitions: ["Personne ou animal qui a l’habitude de se promener la nuit.", "Personne qui aime faire la fête la nuit.", "Par extension : personne qui est en activité la nuit."],
        extraInfos: {
            "A moins d’inventer": " - Nyctambule : qui recherche les fétards égarés la nuit<br/> - Noctalope : qui travaille la nuit sans avoir besoin de lumière",
            "Nyctalope": "A ne pas confondre avec nyctalope : un adjectif qui désigne celui qui a la faculté de voir dans la pénombre, comme les chats"
        },
        synonymes: ["Feuillage", "Ramure", "Branchage"]
    }
];


// Initialization

$(document).ready(function() {

    Notebook.initPanel($("#ui_notebook"), roles, words);
});