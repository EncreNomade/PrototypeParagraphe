var RatGame = function() {
	mse.Game.call(this, {fillback:false});
	
	this.width = MseConfig.pageWidth; this.height = MseConfig.pageHeight;
	
	mse.src.addSource('ratAud', 'audios/rat', 'aud');
	
	mse.src.addSource('ratBackground', 'games/ratGame_back.png', 'img');
	var background = new mse.Image(this, {pos:[0,0], size:[this.width,this.height]}, 'ratBackground');
	mse.src.addSource('ratImg', 'games/dark.png', 'img');
	var ratSit = new mse.Sprite(this,{pos:[250,this.height-200]}, 'ratImg', 102,142, 0,142,1428,142);
	var ratChut = new mse.Sprite(this,{pos:[200,this.height-200]}, 'ratImg', 102,142, 0,0,2244,142);
	var ratHang = new mse.Sprite(this, {pos:[45,this.height-80]}, 'ratImg', 50,142, 0,284,500,142);
	mse.src.addSource('sacImg', 'games/bag.png', 'img');
	var sac = new mse.Image(this, {pos:[this.width-400,80], size:[124,160], insideRec:[24,57,94,88]}, 'sacImg');
	var pochet = new mse.Sprite(this, {pos:[this.width-357,190], size:[81,50]}, 'sacImg', 143,87, 75,195,143,87);
	
	var sitSeq = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
	var sitAnim = new mse.FrameAnimation(ratSit, sitSeq, 0, 2);
	var hangSeq = [0,1,2,3,4,5,6,7,8,9];
	var hangAnim = new mse.FrameAnimation(ratHang, hangSeq, 0, 2);
	var chutSeq = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
	var chutAnim = new mse.FrameAnimation(ratChut, chutSeq, 1, 2);
	
	var ratHangPos = {x: 25, y: 25};
	var ratSacPos = {x: 57, y: 111};
	
	this.dragStart = function(e) {
		if(ratSit.inObj(e.offsetX, e.offsetY)){
			this.sit = false;
			this.chuting = false;
			ratHang.offx = e.offsetX-20;
			ratHang.offy = e.offsetY-14;
			
			sitAnim.stop();
			hangAnim.start();
			mse.src.getSrc('ratAud').play();
		}
	};
	this.dragMove = function(e) {
		ratHang.offx = e.offsetX - ratHangPos.x;
		ratHang.offy = e.offsetY - ratHangPos.y;
	};
	this.dragEnd = function(e) {
		var x = e.offsetX;
		var y = e.offsetY;
		if(this.sit || this.chuting) return;
		if(sac.inObj(e.offsetX, e.offsetY)) {
			var drop = new mse.KeyFrameAnimation(ratHang, {
					frame	: [0, 25, 35],
					pos		: [[x-ratHangPos.x, y-ratHangPos.y], 
					           [sac.offx+ratSacPos.x,sac.offy+ratSacPos.y], 
					           [sac.offx+ratSacPos.x,sac.offy+ratSacPos.y]]
				}, 1);
			drop.evtDeleg.addListener('end', new mse.Callback(this.end, this));
			drop.start();
			this.droped = true;
			this.getEvtProxy().removeListener('gestureStart', cbStart);
			this.getEvtProxy().removeListener('gestureUpdate', cbMove);
			this.getEvtProxy().removeListener('gestureEnd', cbEnd);
		}
		else {
			this.chuting = true;
			hangAnim.stop();
			chutAnim.start();
			var chut = new mse.KeyFrameAnimation(ratChut, {
					frame	: [0, 16, 44],
					pos		: [[x-ratChut.width/2, y-ratHangPos.y], 
					           [x-ratChut.width/2, this.height-200],
					           [x-ratChut.width/2, this.height-200]]
				}, 1);
			chut.start();
			chut.evtDeleg.addListener('end', new mse.Callback(this.endChut, this));
		}
	};
	
	this.endChut = function() {
	    this.chuting = false;
	    chutAnim.stop();
	    
	    ratSit.setPos(ratChut.offx, ratChut.offy);
	    this.sit = true;
	    sitAnim.start();
	};
	
	var cbStart = new mse.Callback(this.dragStart, this);
	var cbMove = new mse.Callback(this.dragMove, this);
	var cbEnd = new mse.Callback(this.dragEnd, this);
	
	this.init = function() {
		this.getEvtProxy().addListener('gestureStart', cbStart, true);
		this.getEvtProxy().addListener('gestureUpdate', cbMove, true);
		this.getEvtProxy().addListener('gestureEnd', cbEnd, true);
		
		this.sit = true;
		this.chuting = false;
		this.droped = false;
		ratSit.setPos(250, this.height-200);
		ratHang.height = ratHang.fh = 142;
		sitAnim.start();
	};
	
	this.logic = function(delta) {
		if(this.droped) {
			var d = pochet.offy - ratHang.offy - 142;
			ratHang.height = ratHang.fh = d < 0 ? 142+d : 142;
		}
	};
    
	this.draw = function(ctx) {
	    background.draw(ctx);
	    
		sac.draw(ctx);
		if(this.sit) {
			ratSit.draw(ctx);
			// Draw text
			ctx.save();
			// Draw bull
			ctx.fillStyle = "#FFF";
			ctx.translate(ratSit.getX()+ratSit.width*0.9, ratSit.getY());
			ctx.beginPath();
			ctx.moveTo(-10,30);
			ctx.lineTo(0,30-15);
			ctx.lineTo(10,30);
			ctx.lineTo(-10,30);
			ctx.fill();
			ctx.fillRoundRect(0, 0, 210, 30, 10);
			ctx.fillStyle = "#000";
			ctx.font = "20px DejaVu Sans";
			ctx.textBaseline = 'top';
			ctx.fillText("Aide Simon, vite!", 10, 4);
			ctx.restore();
		}
		else if (this.chuting) {
		    ratChut.draw(ctx);
		}
		else ratHang.draw(ctx);
		if(this.droped) pochet.draw(ctx);
	};
};
extend(RatGame, mse.Game);



var ForestExit = function() {
    mse.Game.call(this, {fillback:true});
    
    this.width = MseConfig.pageWidth; this.height = MseConfig.pageHeight;
    
    mse.src.addSource('forestBg', 'img/Pavillon.jpg', 'img');
    mse.src.addSource('forestTree1', 'games/forest_tree1.png', 'img');
    mse.src.addSource('forestTree2', 'games/forest_tree2.png', 'img');
    mse.src.addSource('forestTree3', 'games/forest_tree3.png', 'img');
    mse.src.addSource('forestTree4', 'games/forest_tree4.png', 'img');
    mse.src.addSource('forestTree5', 'games/forest_tree5.png', 'img');
    mse.src.addSource('forestTree6', 'games/forest_tree6.png', 'img');
    mse.src.addSource('forestTree7', 'games/forest_tree7.png', 'img');
    mse.src.addSource('forestArrow1', 'games/forest_arrow1.png', 'img');
    mse.src.addSource('forestArrow2', 'games/forest_arrow2.png', 'img');
    
    var naturalW = 1400, naturalH = 788, r = this.width / naturalW;
    var height = r * naturalH, y = (this.height - height) / 2;
    var background = new mse.Image(this, {pos:[0, y], size:[this.width, height]}, 'forestBg');
    var trees = [
        new mse.Image(this, {pos:[r*560, y+r*510], size:[r*430, r*478]}, 'forestTree1'),
        new mse.Image(this, {pos:[r*1033, y+r*525], size:[r*367, r*263]}, 'forestTree2'),
        new mse.Image(this, {pos:[r*220, y+r*575], size:[r*450, r*214]}, 'forestTree3'),
        new mse.Image(this, {pos:[0, y+r*575], size:[r*327, r*214]}, 'forestTree4'),
        new mse.Image(this, {pos:[r*158, y], size:[r*505, r*788]}, 'forestTree5'),
        new mse.Image(this, {pos:[r*610, y], size:[r*423, r*788]}, 'forestTree6'),
        new mse.Image(this, {pos:[0, y], size:[r*316, r*788]}, 'forestTree7')
    ];
    var exit1 = new mse.Image(this, {pos:[r*1224, y+r*630], size:[r*140, r*40]}, 'forestArrow1');
    var exit2 = new mse.Image(this, {pos:[r*100, y+r*270], size:[r*42, r*140]}, 'forestArrow2');
    
    
    var game = this;
    function exitClicked(e) {
        if (exit1 == this) {
            game.result.win = false;
        }
        else {
            game.result.win = true;
        }
        game.end();
    }
    
    exit1.evtDeleg.addListener('click', new Callback(exitClicked, exit1), true);
    exit2.evtDeleg.addListener('click', new Callback(exitClicked, exit2), true);
    
    function dragStarted(e) {
        this.dragging = true;
    }
    function dragMoved(e) {
        if (this.dragging) {
            this.offx = e.offsetX - this.width/2;
            this.offy = e.offsetY - this.height/2;
        }
    }
    function dragEnded(e) {
        this.dragging = false;
    }
    
    for (var i in trees) {
        trees[i].evtDeleg.addListener('gestureStart', new Callback(dragStarted, trees[i]), true);
        trees[i].evtDeleg.addListener('gestureUpdate', new Callback(dragMoved, trees[i]), true);
        trees[i].evtDeleg.addListener('gestureEnd', new Callback(dragEnded, trees[i]), true);
    }
    
    this.draw = function(ctx) {
        background.draw(ctx);
        
        exit1.draw(ctx);
        exit2.draw(ctx);
        
        for (var i in trees) {
            trees[i].draw(ctx);
        }
        
        // Draw text
        ctx.save();
        // Draw bull
        ctx.translate(this.width/2-280, 100);
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 0.65;
        ctx.fillRoundRect(0, 0, 560, 80, 10);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1;
        ctx.strokeRoundRect(0, 0, 560, 80, 10);
        ctx.fillStyle = "#000";
        ctx.font = "20px DejaVu Sans";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillText("Découvre les chemins que Simon peut emprunter", 280, 10);
        ctx.fillText("en déplaçant les arbres avec ta souris !", 280, 50);
        ctx.restore();
    };
};
extend(ForestExit, mse.Game);