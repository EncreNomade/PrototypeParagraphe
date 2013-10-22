$(document).ready(function () {

var photoDB;
localStorage && localStorage.photoDB && (photoDB = JSON.parse(localStorage.photoDB)) ? true : photoDB = [
    {"id": "ph_rue", "url": "./img/Rue.jpg"},
    {"id": "ph_simonRun", "url": "./img/simonRun.jpg"},
    {"id": "ph_pavillon", "url": "./img/Pavillon.jpg"},
    {"id": "ph_simonCache", "url": "./img/SimonCache.jpg"}
];

// Bag interactions
window.bag = (function() {

    var bag_container = $('#bag_container');
    var bagobj = bag_container.children('#bag');
    var bag_items = bag_container.children('li');
    
    var dark_btn = bag_container.children('#bag_dark');
    var map_btn = bag_container.children('#bag_map');
    var note_btn = bag_container.children('#bag_note');
    var camera_btn = bag_container.children('#bag_camera');
    var badgt_btn = bag_container.children('#bag_badgt');
    var sound_btn = bag_container.children('#bag_sound');
    
    var photo_anime = $('#ui_photo_animation');
    
    // Bag interaction
    bagobj.click(function() {
        if (bag.isOpen()) {
            bag.close();
        }
        else {
            bag.open();
        }
    });
    
    // Map model
    var mapw = $('#ui_map').width(), maph = $('#ui_map').height();
    var uw = mapw/500, uh = maph/428;
    var map = new (Backbone.Model.extend({
        "marks": ["montsouris"],
        "mark_pos":  {
            "montsouris": [300*uw, 320*uh]
        },
        
        "default": {
            "curr_mark": "montsouris"
        },
        
        moveTo: function(mark) {
            if (this.get("marks").indexOf(mark) != -1) {
                this.set("curr_mark", mark);
            }
        }
    }))();
    
    // Map View
    var mapView = new (Backbone.View.extend({
        tagName: "article",
        
        events: {
            "click .close": "close",
            "click .intro_link": "gotoIntro"
        },
    
        initialize: function() {
            this.listenTo(this.model, "change:curr_mark", this.render);
        },
        
        gotoIntro: function() {
            Notebook.showPanel("Intro");
        },
    
        render: function() {
            
        },
        
        open: function() {
            this.$el.removeClass("hidden").addClass("show");
        },
        
        close: function() {
            this.$el.removeClass("show").addClass("hidden");
        },
        
        isOpen: function() {
            return this.$el.hasClass("show");
        }
    
    }))({"model": map, "el": $("#ui_map")});
    
    
    // Photo model
    var PhotoModel = Backbone.Model.extend({
        "defaults": {
            "id": "",
            "url": "",
            "lock": true
        },
        
        initialize: function() {
            this.width = 0;
            this.height = 0;
        },
        
        updateSize: function() {
            var model = this;
            $('img[src="'+this.get("url")+'"]').load(function() {
                model.width = $(this).prop("naturalWidth");
                model.height = $(this).prop("naturalHeight");
            });
        },
        
        isLock: function() {
            return this.get("lock");
        },
        
        lock: function() {
            this.set("lock", true);
        },
        
        unlock: function() {
            this.set("lock", false);
        }
    });
    
    // Episode page
    var EpiPhotos = Backbone.Collection.extend({
        "model": PhotoModel
    });
    
    var photos = new EpiPhotos(photoDB);
    
    var photoShower = new (Backbone.View.extend({
        "tagName": "section",
        "template": _.template('<img src="<%= url %>"/>'),
        "close_btn": $('<div class="close topright"></div>'),
        "next_btn": $('<img src="./img/progbar/next.png" class="centerright next"/>'),
        "prev_btn": $('<img src="./img/progbar/previous.png" class="centerleft prev"/>'),
        "curr": 0,
        "maxWidth": 0.7 * $(window).width(),
        "maxHeight": 0.7 * $(window).height(),
        
        "events": {
            "click .close": "close",
            "click .next": "next",
            "click .prev": "prev"
        },
        
        appendBtns: function() {
            // Append close button
            this.$el.append(this.close_btn);
            if (this.curr < this.collection.length-1) {
                this.$el.append(this.next_btn);
            }
            if (this.curr > 0) {
                this.$el.append(this.prev_btn);
            }
        },
        
        renderWithModel: function(index) {
            // Set current 
            var model = this.collection.at(index);
            if (model && !model.isLock()) {
                var oiw = model.width, oih = model.height;
                if (oiw && oih) {
                    this.curr = index;
                    
                    // Append image
                    this.$el.html( this.template({"url": model.get("url")}) );
                
                    // Calcul shower size and position
                    var rw = this.maxWidth / oiw, rh = this.maxHeight / oih;
                    var r = rw > rh ? rh : rw;
                    var dw = oiw * r, dh = oih * r, dx = (this.$el.parent().width() - dw) / 2, dy = (this.$el.parent().height() - dh) / 2;
                    
                    var view = this;
                    this.$el.animateCSS({
                        'duration': '0.6s',
                        'timing-function': 'ease-out',
                        'queue': 'fx',
                        'css': {
                            'left': dx,
                            'top': dy,
                            'width': dw,
                            'height': dh
                        }
                    }).queue("fx", function(next) {
                        // Append close button
                        view.appendBtns();
                        next();
                    });
                }
            }
            
            return this;
        },
        
        renderWithView: function(fromView) {
            // Set current 
            this.curr = this.collection.indexOf(fromView.model);
            
            // Append image
            this.$el.html( this.template({"url": fromView.model.get("url")}) );
            
            var originImg = fromView.$el.find("img");
            
            // Calcul shower size and position
            var oiw = originImg.width(), oih = originImg.height();
            var rw = this.maxWidth / oiw, rh = this.maxHeight / oih;
            var r = rw > rh ? rh : rw;
            var dw = oiw * r, dh = oih * r, dx = (this.$el.parent().width() - dw) / 2, dy = (this.$el.parent().height() - dh) / 2;
            
            var view = this;
            this.$el.removeClass("hidden");
            this.$el.animateCSS({
                'duration': '0.0s',
                'timing-function': 'ease-out',
                'queue': 'fx',
                'css': {
                    'left': fromView.$el.position().left,
                    'top': fromView.$el.position().top + originImg.position().top,
                    'width': originImg.width(),
                    'height': originImg.height()
                }
            }).animateCSS({
                'duration': '0.6s',
                'timing-function': 'ease-out',
                'queue': 'fx',
                'css': {
                    'left': dx,
                    'top': dy,
                    'width': dw,
                    'height': dh
                }
            }).queue("fx", function(next) {
                // Append close button
                view.appendBtns();
                next();
            });
            
            return this;
        },
        
        next: function() {
            this.renderWithModel(this.curr+1);
        },
        
        prev: function() {
            this.renderWithModel(this.curr-1);
        },
        
        close: function() {
            this.$el.addClass("hidden");
            return this;
        }
        
    }))({collection: photos, el: $('#photo_shower')});
    
    // Photo View
    var PhotoView = Backbone.View.extend({
        "tagName": "div",
        "className": "frame",
        "template": _.template('<div class="crop"><img src="<%= url %>"/></div><img class="cadena" src="./img/ui/bdg_cadena.png"/>'),
        
        "events": {
            "click img": "openImg"
        },
        
        initialize: function() {
            this.listenTo(this.model, 'change:lock', this.lock);
        },
        
        lock: function() {
            if (this.model.isLock()) {
                this.$el.addClass("lock");
            }
            else this.$el.removeClass("lock");
        },
        
        openImg: function(e) {
            if (this.model.isLock()) {
                return;
            }
            else {
                e.stopPropagation();
                photoShower.model = this.model;
                photoShower.renderWithView(this);
            }
        },
        
        render: function() {
            this.$el.prop("id", this.model.get("id"));
            
            var background = "frame" + (randomInt(3) + 1);
            this.$el.addClass(background);
            
            if (this.model.isLock())
                this.$el.addClass("lock");
            
            this.$el.html( this.template({"url": this.model.get("url")}) );
            // Center image
            var container = this.$el.children('.crop');
            var img = container.children('img');
            img.load(function () {
                img.css( "top", (container.height() - img.height())/2 );
            });
            return this;
        }
    });
    
    // Photo collection View
    var EpisodeView = Backbone.View.extend({
        "tagName": "section",
        
        "events": {
            "click": "closeShower"
        },
        
        initialize: function() {
            this._frames = [];
            this.rendered = false;
            // add each photo to the view
            this.collection.each(this.add, this);
            
            // bind this view to the add and remove events of the collection!
            this.collection.bind('add', this.add);
            //this.collection.bind('remove', this.remove);
        },
        
        add: function(photo) {
            var frame = new PhotoView({"model": photo});
            this._frames.push(frame);
        },
        
        closeShower: function() {
            photoShower.close();
        },
        
        render: function() {
            this.$el.empty();
         
            // Render each frame View and append them.
            for (var i = 0; i < this._frames.length; i++) {
                this.$el.append(this._frames[i].render().el);
                this._frames[i].model.updateSize();
            }
            
            // We keep track of the rendered state of the view
            this.rendered = true;
        }
    
    });
    
    var album = $("#ui_photos");
    var episode1 = (new EpisodeView({"collection": photos, "el": $("#ph_ep1")})).render();
    
    album.children(".close").click(function() {
        photoShower.close();
        album.removeClass("show").addClass("hidden");
    });
    
    // Photo waiting for capturing
    var photoWaiting = null, photoWaitingObj = null;
    
    // Camera ready function
    function camera_ready() {
        if (!bag.isOpen()) {
            bagobj.addClass("light");
        }
        camera_btn.addClass("shine");
        camera_btn.children('#camera_ready').removeClass("hidden");
        camera_btn.children('#photo_ready').addClass("hidden");
    }
    function photo_ready() {
        bagobj.removeClass("light");
        camera_btn.removeClass("shine");
        camera_btn.children('#camera_ready').addClass("hidden");
        camera_btn.children('#photo_ready').removeClass("hidden");
    }
    
    // Animation for capture image
    function animateCaptureImage(obj) {
        var img = photo_anime.children('img');
        img.attr('src', obj.attr('src'));
        photo_anime.removeClass('hidden').clearQueue("fx");
        
        photo_anime.animateCSS({
            'duration': '0s',
            'timing-function': 'ease-in',
            'queue': 'fx',
            'css': {
                'left': obj.offset().left,
                'top': obj.offset().top,
                'width': obj.width(),
                'height': obj.height(),
                'opacity': 1
            }
        }).animateCSS({
            'duration': '0.6s',
            'timing-function': 'ease-in',
            'queue': 'fx',
            'css': {
                'left': bagobj.offset().left + bagobj.width()/2,
                'top': bagobj.offset().top + bagobj.height()/2,
                'width': 10,
                'height': 10,
                'opacity': 0.5
            }
        }).queue("fx", function(next) {
            // Append close button
            photo_anime.addClass('hidden');
            next();
        });
    }
    
    
    
    bagView = new (Backbone.View.extend({
        tagName: "ul",
        
        events: {
            "click #bag_map" : "mapClicked",
            "click #bag_note" : "noteClicked",
            "click #bag_camera" : "cameraClicked",
            "click #bag_badgt" : "badgeClicked",
            "click #bag_sound" : "soundClicked"
        },
        
        initialize: function() {
            this.dark_btn = bag_container.children('#bag_dark');
            this.map_btn = bag_container.children('#bag_map');
            this.note_btn = bag_container.children('#bag_note');
            this.camera_btn = bag_container.children('#bag_camera');
            this.badgt_btn = bag_container.children('#bag_badgt');
            this.sound_btn = bag_container.children('#bag_sound');
        },
        
        closeAll: function() {
            mapView.close();
            Notebook.hidePanel();
            Badge.hidePanel();
            
            photoShower.close();
            album.removeClass("show").addClass("hidden");
        },
        
        mapClicked: function() {
            if (mapView.isOpen()) {
                mapView.close();
                controller.doplay();
            }
            else {
                controller.dopause();
                this.closeAll();
                mapView.open();
            }
        },
        
        noteClicked: function() {
            if (Notebook.isPanelOpen()) {
                Notebook.hidePanel();
                controller.doplay();
            }
            else {
                controller.dopause();
                this.closeAll();
                Notebook.showPanel();
            }
        },
        
        cameraClicked: function() {
            // photo album button
            if (this.camera_btn.children('#camera_ready').hasClass('hidden')) {
                if (album.hasClass("show")) {
                    photoShower.close();
                    album.removeClass("show").addClass("hidden");
                    controller.doplay();
                }
                else {
                    controller.dopause();
                    this.closeAll();
                    album.removeClass("hidden").addClass("show");
                }
            }
            // Camera button
            else {
                if (photoWaiting) {
                    photoWaiting.unlock();
                    
                    var pid = photoWaiting.get("id");
                    Badge.pullUpFlag(pid);
                    Badge.pullUpFlag("CollectOnePhoto");
                    
                    this.trigger("PhotoCaptured", pid);
                    
                    // Update photo DB in localStorage
                    localStorage ? localStorage.photoDB = JSON.stringify(photos.toJSON()) : false;
                    
                    animateCaptureImage(photoWaitingObj);
                }
                photo_ready();
            }
        },
        
        badgeClicked: function() {
            if (Badge.isPanelOpen()) {
                Badge.hidePanel();
                controller.doplay();
            }
            else {
                controller.dopause();
                this.closeAll();
                Badge.showPanel();
            }
        },
        
        soundClicked: function() {
            if(soundManager.muted) {
                sound_btn.removeClass('mute');
                soundManager.unmute();
            }
            else {
                sound_btn.addClass('mute');
                soundManager.mute();
            }
        }
        
    }) )({el: bag_container});
    
    
    return {
        show: function() {
            bag_container.removeClass('hidden');
        },
        
        getView: function() {
            return bagView;
        },
        
        isPhotoLock: function(imgId) {
            var photo = photos.findWhere({"id": imgId});
            return photo.isLock();
        },
        
        photoReady: function(imgId, elem, timeout) {
            photoWaiting = photos.findWhere({"id": imgId});
            if (photoWaiting.isLock()) {
                photoWaitingObj = elem;
                camera_ready();
                if(timeout !== false)
                     setTimeout("window.bag.photoTimeout()", isNaN(timeout) ? 6000 : timeout);
            }
        },
        
        photoTimeout: function() {
            photo_ready();
            photoWaiting = null;
            photoWaitingObj = null;
        },
    
        isOpen: function() {
            if (bagobj.hasClass('open')) return true;
            else return false;
        },
    
        open: function() {
            bagobj.removeClass('light').addClass('open');
            bag_items.removeClass('hide').addClass('show');
        },
        
        close: function() {
            bagobj.removeClass('open');
            bag_items.removeClass('show').addClass('hide');
            
            // Close all widget
            bagView.closeAll();
        }
    }
    
})();

})