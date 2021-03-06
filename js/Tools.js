/*!
 * Tools
 * Encre Nomade
 *
 * Author: LING Huabin - lphuabin@gmail.com
 * Copyright, Encre Nomade
 */

function angleForLine(x1, y1, x2, y2) {
	var angle = 0;
	var dx = x2 - x1;
	var dy = y2 - y1;
	angle = Math.atan2(dy, dx);
	return angle;
};
function mseAngleForLine(x1, y1, x2, y2) {
	var angle = 0;
	var dx = x2 - x1;
	var dy = y2 - y1;
	angle = Math.atan2(dy, dx);
	return Math.round(180 * angle/(Math.PI));
};

function angleFor2Point(p1, p2) {
	var angle = 0;
	var dx = p2.x - p1.x;
	var dy = p2.y - p1.y;
	angle = Math.atan2(dy, dx);
	return Math.round(180 * angle/(Math.PI));
};

function ptRotated(x, y, ox, oy, a) {
    var dx = x-ox, dy = y-oy;
    var sina = Math.sin(a), cosa = Math.cos(a);
    var xp = dx*cosa + dy*sina;
    var yp = -dx*sina + dy*cosa;
    return {x:ox+xp, y:oy+yp};
};

function inRegion(tarx, tary, x, y, w, h, r) {
    if(!isNaN(r) && r != 0) {
        var res = ptRotated(tarx, tary, x, y, r);
        tarx = res.x;
        tary = res.y;
    }
    var ox = tarx - x, oy = tary - y;
    if(ox >= 0 && ox <= w && oy >= 0 && oy <= h)
        return true;
    else return false;
};

function distance2Pts(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1, 2));
};

function inrect(x, y, rect) {
    if(x >= rect[0] && x <= rect[0]+rect[2] && y >= rect[1] && y <= rect[1]+rect[3]) return true;
    else return false;
};

function imgBoundingInBox(img, width, height) {
    if(typeof(img) == 'string') img = mse.src.getSrc(img);
    if(!img || !(img instanceof Image)) return {pos:[0,0],size:[0,0]};
    var rx = width/img.width, ry = height/img.height;
    var r = (rx < ry) ? rx : ry;
    var iw = img.width * r;
    var ih = img.height * r;
    var ix = (width-iw)/2;
    var iy = (height-ih)/2;
    return {pos:[ix,iy],size:[iw,ih]};
};


function mseLog(name, msg) {
	var err = new Error();
	err.name = name;
	err.message = msg;
	throw(err); 
};

CanvasRenderingContext2D.prototype.fillRoundRect = function(x,y,width,height,radius){
	this.beginPath();
	this.moveTo(x,y+radius);
	this.lineTo(x,y+height-radius);
	this.quadraticCurveTo(x,y+height,x+radius,y+height);
	this.lineTo(x+width-radius,y+height);
	this.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
	this.lineTo(x+width,y+radius);
	this.quadraticCurveTo(x+width,y,x+width-radius,y);
	this.lineTo(x+radius,y);
	this.quadraticCurveTo(x,y,x,y+radius);
	this.fill();
};

CanvasRenderingContext2D.prototype.strokeRoundRect = function(x,y,width,height,radius){
	this.beginPath();
	this.moveTo(x,y+radius);
	this.lineTo(x,y+height-radius);
	this.quadraticCurveTo(x,y+height,x+radius,y+height);
	this.lineTo(x+width-radius,y+height);
	this.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
	this.lineTo(x+width,y+radius);
	this.quadraticCurveTo(x+width,y,x+width-radius,y);
	this.lineTo(x+radius,y);
	this.quadraticCurveTo(x,y,x,y+radius);
	this.stroke();
};

CanvasRenderingContext2D.prototype.fillTextWrapped = function(text, x, y, width, lineHeight){
    var lines = wrapTextWithWrapIndice(text, this, width);
    if(!lineHeight) lineHeight = checkFontSize(ctx.font)*1.2;
    for(var i = 0; i < lines.length; i++)
        this.fillText(lines[i], x, y+lineHeight*i);
    return lineHeight * lines.length;
};

function clipRect(ctx, x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(width, y);
    ctx.lineTo(width, height);
    ctx.lineTo(x,height);
    ctx.closePath();
    ctx.clip();
}

// Object.keys not supported solution
if (!Object.keys) {  
  Object.keys = (function () {  
    var hasOwnProperty = Object.prototype.hasOwnProperty,  
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),  
        dontEnums = [  
          'toString',  
          'toLocaleString',  
          'valueOf',  
          'hasOwnProperty',  
          'isPrototypeOf',  
          'propertyIsEnumerable',  
          'constructor'  
        ],  
        dontEnumsLength = dontEnums.length  
  
    return function (obj) {  
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object')  
  
      var result = []  
  
      for (var prop in obj) {  
        if (hasOwnProperty.call(obj, prop)) result.push(prop)  
      }  
  
      if (hasDontEnumBug) {  
        for (var i=0; i < dontEnumsLength; i++) {  
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])  
        }  
      }  
      return result  
    }  
  })()  
};

// Random integer generator, result between [0,max[, max exclus
function randomInt(max) {
	return Math.floor(Math.random()*max);
};

// Get the font size from the string of font definition
function checkFontSize(str) {
    var match = /\s*([\d\.]*)px/.exec(str);
    return match[1];
};



function checkNextLine(ctx, text, maxM, width){
	// Next line is the whole text remaining
	if(maxM >= text.length) return text.length;
	// Forward check
	var prevId;
	var nextId = maxM;
	do {
		prevId = nextId;
		// Find next space
		var index = text.substr(prevId).search(/[\s\n\r\-\/\\\:]/);
		index = (index == -1) ? -1 : prevId+index;
		// No space after
		if(index == -1) {
			if(ctx.measureText(text).width <= width)
				prevId = text.length;
			break;
		}
		// Text length
		var l = ctx.measureText(text.substr(0, index));
		nextId = index+1;
	} while(l.width < width);
	// Forward check success
	if(prevId != maxM) {
		return prevId;
	}
	// Backward check when forward check failed
	else {// Find last space
		var lastsp = text.lastIndexOf(' ', maxM);
		if(lastsp == -1) return maxM;
		else return (lastsp+1);
	}
};
function wrapText(text, ctx, width, font) {
    if(width <= 0) return [text];
    var lines = new Alert();
    if(font) {
        var temp = ctx.font;
        ctx.font = font;
    }
    var maxA = Math.floor( width/ctx.measureText('A').width );
    
    for(var j = 0; j < text.length;) {
    	// Find the index of next line
    	var next = checkNextLine(ctx, text.substr(j), maxA, width);
    	lines.push(text.substr(j, next));
    	j += next;
    }
    if(font) ctx.font = temp;
    return lines;
};
function wrapTextWithWrapIndice(text, ctx, width, font) {
    var lines = text.split("\n");
    if(lines.length == 1) lines = text.split("\\n");
    var res = new Array();
    for(var i in lines) {
        var append = wrapText(lines[i], ctx, width, font);
        res = res.concat(append);
    }
    return res;
};



// Class extend utilitie function
function extend(Child, Parent) {
    var F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
};



var Base64 = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	decode : function(input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while(i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);

			if(enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if(enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}
		output = Base64._utf8_decode(output);

		return output;

	},
	_utf8_decode : function(utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while(i < utftext.length) {
			c = utftext.charCodeAt(i);

			if(c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	},
	decodeBase64As : function(input, bytes) {
		bytes = bytes || 1;

		var dec = Base64.decode(input), ar = [], i, j, len;

		for (i = 0, len = dec.length / bytes; i < len; i++) {
			ar[i] = 0;
			for (j = bytes - 1; j >= 0; --j) {
				ar[i] += dec.charCodeAt((i * bytes) + j) << (j << 3);
			}
		}
		return ar;
	}
};





/* ***************************************************
 * Callback class
 *****************************************************/
var Callback = function(func, caller) {
    if(typeof func != "function") {
        console.error('Fail to initialize a Callback object: except first parameter to be a function');
        return;
    }
    
	this.func = func;
	this.caller = caller;
	this.args = null;
	
	// Arguments to be passed in the function when the callback is invoked
	if(arguments.length > 2) {
		this.args = new Array();
		for(var i = 2; i < arguments.length; i++)
			this.args.push(arguments[i]);
	}
	
	// Init futur possible variables
	// Linked Callbacks list
	this.linked = null;
};
Callback.prototype = {
    // Any other callback can be linked to one callback, they will be called after its invokation
    link: function(cb) {
        // Accept only callback type object
        if(!(cb instanceof Callback)) return;
        
        // Lazy initialize of linked 
    	if(!this.linked) this.linked = new Array();
    	
    	this.linked.push(cb);
    },
    invoke: function() {
        // Arguments 
    	var arr = null;
    	
    	// Additional arguments passed in invokation will be add to the end of original arguments 
    	if(this.args) arr = (arguments.length>0 ? this.args.concat(Array.prototype.slice.call(arguments)) : this.args);
    	// No original arguments, then take directly the arguments in invokation
    	else if(!this.args && arguments.length>0) var arr = arguments;
    	
    	// Call function of callback
    	this.func.apply(this.caller, arr);
    	
    	// Invoke linked callback
    	if(this.linked) {
    		for(var i in this.linked) this.linked[i].invoke();
    	}
    }
};





/* ***************************************************
 * Object Pool
 *****************************************************/
var ObjectPool = function(constructor, capacity, activeList){
    this.capacity = capacity;
    this.objCons = constructor;
    if(activeList) this.activeList = activeList;
    this.pool = [];
    
    this.NewObjCons = function(args) {
        var instance = constructor.apply(this, args);
        // Init the reference count to 1
        this._refCount = 1;
        return instance;
    }
    this.NewObjCons.prototype = constructor.prototype;
};
ObjectPool.prototype = {
    constructor: ObjectPool,
    initInstance: function() {
        var args = Array.prototype.slice.call(arguments);
        // Find a totally released (reference count equals to 0) to reinitialize with the arguments
        for(var i in this.pool) {
            if(this.pool[i]._refCount === 0) {
                this.objCons.apply(this.pool[i], args);
                // Reset the reference count to 1
                this.pool[i]._refCount = 1;
                // Add a reference to active objects list
                if(this.activeList) this.activeList.push(this.pool[i]);
                return this.pool[i];
            }
        }
        // No available instance, push one into the object pool
        var instance = new this.NewObjCons(args);
        this.pool.push(instance);
        // Add a reference to active objects list
        if(this.activeList) this.activeList.push(instance);
        return instance;
    },
    retain: function(obj) {
        // Ignore obj out of the pool
        var id = this.pool.indexOf(obj);
        if(id == -1) return;
        // Increase the reference count by 1
        if(isNaN(obj._refCount)) obj._refCount = 1;
        else obj._refCount++;
    },
    release: function(obj) {
        // Ignore obj out of the pool
        var id = this.pool.indexOf(obj);
        if(id == -1) return;
        // Reduce the referece count by 1, if it's bigger than 0
        if(isNaN(obj._refCount)) obj._refCount = 0;
        else if(obj._refCount > 0) obj._refCount--;
        // Remove from the active objects list
        if(obj._refCount == 0 && this.activeList) {
            var id = this.activeList.indexOf(obj);
            if(id != -1) this.activeList.splice(id, 1);
        }
    },
    clear: function() {
        for(var i in this.pool) {
            if(this.pool[i]._refCount >= 0)
                // Reset the reference count to 0
                this.pool[i]._refCount = 0;
        }
        if(this.activeList) {
            // Clear active objects list
            this.activeList.splice(0, this.activeList.length);
        }
    }
};





/**
 * @class
 * @param {jQuery} target
 * @param {String|jQuery|HTMLElement} message
 * @param {Object} [config] available property : width{Number} | height{Number} | position{String} | animate{bool}
 * @param {Number} [config.width]
 * @param {Number} [config.height]
 * @param {String} [config.position] ('left', 'right', 'bottom', 'top', 'auto')
 * @param {bool} [config.animate] true will animate the target
 */
var MseTutoMsg = function(target, message, config) {
    this._box = $('<div class="tutoBox"></div>');
    this._boxText = $('<h5 class="msg"></h5>');
    this._boxClose = $('<span>x</span>');
    this._boxIndicator = $('<div class="img"></div>');

    this._box.append(this._boxText)
             //.append(this._boxClose)
             .append(this._boxIndicator);
    
    var msg = this;         
    this._boxClose.click(function() {
        msg.hide();
    });

    this.reinit(target, message, config);
};
MseTutoMsg.prototype = {
    constructor: MseTutoMsg,
    boxIndicatorSize: 10,
    get target() { return this._target; },
    set target(t) {
        this._target = t;
        this.position = 'auto';
        this.reposition();
        if(this._visible)
            this.animateTarget();
    },
    get message() { return this._message; },
    set message(m) {
        this._message = m;
        this._boxText.html(m);
        this.reposition();
    },
    /** Reset all property with same property of the contructor */
    reinit: function (target, message, config) {
        this._target = target;
        this._message = message;
        this.position = "auto";
        this.animate = false;
        this._boxText.html(message);
        if(config) {
            if(config.closeBtn) {
                if(this._boxClose.parent().length == 0) 
                    this._boxText.after(this._boxClose);
            }
            else {
                this._boxClose.detach();
            }
        
            if(config.width) this._box.width(config.width);
            if(config.height) this._box.height(config.height);
            if(config.position) this.position = config.position;
            if(config.offset) {
                this.position = "fixed";
                var pos = this._target.offset();
                pos.top += config.offset.top;
                pos.left += config.offset.left;
                pos.top -= this.boxIndicatorSize;
                
                this._box.offset(pos);
            }
            if(config.animate) this.animate = config.animate;
        }
        this.hide();

        return this;
    },
    /** Set the position of the box */
    reposition: function() {
        this._boxIndicator.removeClass('top bottom left right');
        this._boxIndicator.css('left', 'initial');
        var box = {
            width: this._box.width(),
            height: this._box.height()
        };
        var brwsr = {
            width: $(window).width(),
            height: $(window).height()
        };
        var newPos = this._target.offset();

        //        
        switch (this.position) {
            case "fixed":
                return;
            case "left":
                newPos.left -= ( box.width + this.boxIndicatorSize );
                this._boxIndicator.addClass('right');
                break;
            case "right":
                newPos.left += this._target.width() + this.boxIndicatorSize;
                this._boxIndicator.addClass('left');
                this._boxIndicator.css('left', '-8px');
                break;
            case "bottom":
                newPos.top += this._target.height() + this.boxIndicatorSize;
                this._boxIndicator.addClass('top');
                break;
            case "top":
                newPos.top -= ( box.height + this.boxIndicatorSize );
                this._boxIndicator.addClass('bottom');
                break;
            case "center":
                newPos.top += this._target.height()/2 - (box.height + this.boxIndicatorSize);
                newPos.left += this._target.width()/2 - box.width/2;
                this._boxIndicator.addClass('center');
                break;
            default:
                newPos.top -= ( box.height + this.boxIndicatorSize );
                // auto mode : correct position
                if(newPos.left <= 0)
                    newPos.left = 0;
                else if(newPos.left + box.width > brwsr.width)
                    newPos.left = brwsr.width - box.width;
                if(newPos.top <= 0) {
                    newPos.top = this._target.height() + this.boxIndicatorSize;
                    this._boxIndicator.addClass('top');
                }
                else if(newPos.top + box.height > brwsr.height)
                    newPos.top = brwsr.height - box.height;
                // positionnig the indicator
                var tarCenter = this._target.width() / 2;
                var indicWidth = this.boxIndicatorSize;
                var indicPos = tarCenter - indicWidth/2;
                // reposition if indicator is out of the box
                if(indicPos > box.width)
                    indicPos = box.width - indicWidth;
                else if (indicPos < 0)
                    indicPos = 0;
                this._boxIndicator.css('left', indicPos+'px');
        }

        this._box.offset(newPos);
    },
    show: function() {
        this._box.appendTo('body');       
        this.reposition();
        this.animateTarget();
        this._visible = true;
    },
    hide: function() {
        this._box.detach();
        this._visible = false;
    },
    animateTarget: function() {
        if(!this.animate)
            return;
        var original = { "opacity": this._target.css('opacity') };
        var min = { "opacity": 0.4 };
        var max = { "opacity": 1 };

        this._target.animate( min )
                    .animate( max )
                    .animate( min )
                    .animate( max )
                    .animate( min )
                    .animate( max )
                    .animate( original );
    }
};