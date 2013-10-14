if(!window.gui) gui = {};

gui.Gallery = function(jqObj, title, cssconfig, pages) {
    if( !(jqObj instanceof jQuery) ) 
        return;
    
    this.jqObj = jqObj;
    this.title = title ? title : "";
    
    // Add dialog class
    if( !this.jqObj.hasClass('dialog') ) 
        this.jqObj.addClass('dialog');
    // Add gallery class
    this.jqObj.addClass('gallery');
    
    // Extend config
    if($.isArray(cssconfig)) 
        $.extend(this.cssconfig, cssconfig);
    // Apply css config
    this.jqObj.css(this.cssconfig);
    
    // Extract all sub dom object
    var header = this.jqObj.children('header');
    if(header.length <= 0)
        header = $('<header><div class="close right"></div><h1></h1><div class="sep_line"></div></header>').appendTo(this.jqObj);
    
    this.nav = this.jqObj.children('nav');
    if(this.nav.length <= 0)
        this.nav = $('<nav></nav>').appendTo(this.jqObj);
    
    this.h1 = header.children('h1');
    if(this.h1.length <= 0)
        $('<h1></h1>').appendTo(this.jqObj);
    this.h1.text(this.title);
    
    this.body = this.jqObj.children('article');
    if(this.body.length <= 0)
        $('<article><button id="gallery_next"></button><button id="gallery_prev"></button></article>').appendTo(this.jqObj);
    
    this.nextBtn = this.body.children('#gallery_next');
    if(this.nextBtn.length <= 0)
        $('<button id="gallery_next"></button>').appendTo(this.body);
    this.prevBtn = this.body.children('#gallery_prev');
    if(this.prevBtn.length <= 0)
        $('<button id="gallery_prev"></button>').appendTo(this.body);
    
    // Remove pages
    this.body.children('section').remove();
    this.nav.html('<ul></ul>');
    this.nbpages = this.body.children('section').length;
    
    // Add pages
    if($.isArray(pages)) {
        for(var i in pages) {
            this.addPage(pages[i]);
        }
    }
    
    // Add nav event listener
    this.nav.children('ul').on("click", "li", {'gallery': this}, function(e){
        if( !$(this).hasClass('active') ) {
            var index = $(this).prevAll().length;
            e.data.gallery.activePage(index);
        }
    });
    
    // Add next and prev listener
    this.nextBtn.unbind('click');
    this.nextBtn.bind('click', {'gallery': this}, function(e) {
        e.data.gallery.nextPage();
    });
    this.prevBtn.unbind('click');
    this.prevBtn.bind('click', {'gallery': this}, function(e) {
        e.data.gallery.prevPage();
    });
}
gui.Gallery.prototype = {
    constructor: gui.Gallery,
    cssconfig: {
        //'width' : 400,
        //'height' : 320,
    },
    
    hide: function() {
        this.jqObj.removeClass('show');
    },
    show: function() {
        if(!this.jqObj.hasClass('show')) {
            this.jqObj.addClass('show');
        }
    },
    
    getCurrentPage: function() {
        return this.nav.children('ul').children('li.active').prevAll().length;
    },
    activePage: function(i) {
        this.nav.find('li').removeClass('active').eq(i).addClass('active');
        
        var page = this.body.children('section').eq(i);
        page.removeClass().addClass('active');
        page.prevAll('section').removeClass().addClass('previous');
        page.nextAll('section').removeClass().addClass('next');
    },
    nextPage: function() {
        var current = this.nav.children('ul').children('li.active');
        var i = current.prevAll().length;
        var next = current.next();
        if(next.length <= 0) {
            next = 0;
        }
        else {
            next = i + 1;
        }
        this.activePage(next);
    },
    prevPage: function() {
        var current = this.nav.children('ul').children('li.active');
        var i = current.prevAll().length;
        var prev = current.prev();
        if(prev.length <= 0) {
            prev = this.nav.children('ul').children('li').length - 1;
        }
        else {
            prev = i - 1;
        }
        this.activePage(prev);
    },
    
    getPage: function(i) {
        return this.body.children('section').eq(i);
    },
    resetPage: function(i, content) {
        this.body.children('section').eq(i).html(content);
    },
    addPage: function(content) {
        // Append a page
        var newpage = $('<section></section>');
        newpage.append(content);
        this.body.append(newpage);
        
        this.nbpages++;
        
        // Append a nav li
        var li = $('<li>'+this.nbpages+'</li>').appendTo( this.nav.children('ul') );
        
        // Active the first page
        if(this.nbpages == 1)
            this.activePage(0);
        else
            newpage.addClass('next');
    },
    removePage: function(i) {
        this.body.children('section').eq(i).remove();
        this.nbpages--;
        this.nav.children('ul').children('li').last().remove();
    }
}