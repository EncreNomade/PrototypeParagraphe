mse.coords = JSON.parse('{"cid0":800,"cid1":600,"cid2":0,"cid3":100,"cid4":350,"cid5":250,"cid6":20,"cid7":400,"cid8":200,"cid9":407.5,"cid10":45,"cid11":197.5,"cid12":108.75,"cid13":32.5,"cid14":218.75,"cid15":293.75,"cid16":246.25,"cid17":353.75,"cid18":291.25,"cid19":410,"cid20":370,"cid21":590,"cid22":220,"cid23":10,"cid24":22.5,"cid25":36.25,"cid26":462.5,"cid27":360,"cid28":315,"cid29":324,"cid30":441.72,"cid31":18,"cid32":441.75,"cid33":238.75,"cid34":492.5,"cid35":517.5,"cid36":300,"cid37":409,"cid38":-200,"cid39":1090,"cid40":33,"cid41":235,"cid42":109,"cid43":343,"cid44":41,"cid45":320,"cid46":248,"cid47":178,"cid48":61,"cid49":230,"cid50":-42,"cid51":135,"cid52":1000,"cid53":164,"cid54":106,"cid55":189,"cid56":114,"cid57":221,"cid58":238,"cid59":23,"cid60":143,"cid61":36,"cid62":83,"cid63":396,"cid64":116,"cid65":340,"cid66":30,"cid67":90,"cid68":266,"cid69":140,"cid70":210,"cid71":208,"cid72":170,"cid73":260,"cid74":290,"cid75":380,"cid76":440}');
initMseConfig();
window.pages={};
window.layers={};
window.objs={};
window.animes={};
window.games={};
window.wikis={};

function createbook(){
	if(config.publishMode == 'debug') mse.configs.srcPath='';
	window.root = mse.root;
	var temp = {};
	mse.src.addSource('src0','./img/src0.png','img',true);
	mse.src.addSource('src8','./img/src8.png','img',true);
	mse.src.addSource('src9','./img/src9.jpeg','img',true);
	mse.src.addSource('src22','./img/src22.jpeg','img',true);
	mse.src.addSource('src29','./img/src29.jpeg','img',true);
	mse.src.addSource('src30','./img/src30.jpeg','img',true);
	mse.src.addSource('src31','./img/src31.jpeg','img',true);
	mse.src.addSource('src32','./img/src32.jpeg','img',true);
	mse.src.addSource('src33','./img/src33.jpeg','img',true);
    
    // Fouine animation
	animes.fouine=new mse.Animation(28,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.fouine.block=true;
    
    //temp.obj=new mse.Mask(null,{'pos':[mse.coor('cid2'),mse.coor('cid2')],'size':[mse.coor('cid0'),mse.coor('cid1')],'fillStyle':'rgb(255, 255, 255)'});
	//animes.fouine.addObj('obj567',temp.obj);
	temp.obj=new mse.Image(null,{'pos':[mse.coor('cid5'),mse.coor('cid3')],'size':[mse.coor('cid36'),mse.coor('cid37')]},'src0');
	animes.fouine.addObj('src0',temp.obj);
	//animes.fouine.addAnimation('obj567',{'frame':JSON.parse('[0,1,5,20,27,28]'),'opacity':JSON.parse('[1,0,1,1,0,0]')});
	animes.fouine.addAnimation('src0',{'frame':JSON.parse('[0,1,5,20,27,28]'),'opacity':JSON.parse('[1,0,1,1,0,0]'),'pos':[[mse.coor('cid5'),mse.coor('cid3')],[mse.coor('cid5'),mse.coor('cid3')],[mse.coor('cid5'),mse.coor('cid3')],[mse.coor('cid5'),mse.coor('cid3')],[mse.coor('cid2'),mse.coor('cid38')],[mse.coor('cid2'),mse.coor('cid38')]],'size':[[mse.coor('cid36'),mse.coor('cid37')],[mse.coor('cid36'),mse.coor('cid37')],[mse.coor('cid36'),mse.coor('cid37')],[mse.coor('cid36'),mse.coor('cid37')],[mse.coor('cid0'),mse.coor('cid39')],[mse.coor('cid0'),mse.coor('cid39')]]});
    
    // Simon cours
	mse.src.addSource('src65','./img/src65.png','img',true);
	animes.simcour2=new mse.Animation(45,1,true,null,{'size':[mse.coor('cid0'),mse.coor('cid1')]});
	animes.simcour2.block=true;
    
    temp.obj=new mse.Sprite(null,{'pos':[mse.coor('cid69'),mse.coor('cid7')],'size':[mse.coor('cid70'),mse.coor('cid71')]},'src65',420,414, 0,0,1260,828);
    animes.simcour2.addObj('src65',temp.obj);
	animes.simcour2.addAnimation('src65',{'frame':JSON.parse('[0,4,8,12,16,20,24,28,32,36,40,44,45]'),'spriteSeq':JSON.parse('[3,4,0,1,2,3,4,0,1,2,3,3,3]'),'pos':[[mse.coor('cid69'),mse.coor('cid7')],[mse.coor('cid72'),mse.coor('cid7')],[mse.coor('cid8'),mse.coor('cid7')],[mse.coor('cid49'),mse.coor('cid7')],[mse.coor('cid73'),mse.coor('cid7')],[mse.coor('cid74'),mse.coor('cid7')],[mse.coor('cid45'),mse.coor('cid7')],[mse.coor('cid4'),mse.coor('cid7')],[mse.coor('cid75'),mse.coor('cid7')],[mse.coor('cid19'),mse.coor('cid7')],[mse.coor('cid76'),mse.coor('cid7')],[mse.coor('cid76'),mse.coor('cid7')],[mse.coor('cid76'),mse.coor('cid7')]],'opacity':JSON.parse('[1,1,1,1,1,1,1,1,1,1,0.5,0,0]')});
	
	// Couteau
	mse.src.addSource('cran', './img/cran.png', 'img', false);
	mse.src.addSource('audCran', 'audios/cran', 'aud', false);
	
	var manw = 61, manh = 282, totalh = 522, lamw = 35, lamh = 254, lamx = 17, lamy = 240, optx = 38, opty = 21;
	var mx = (mse.coor('cid0')-manw)/2, my = (mse.coor('cid1')-totalh)/2+lamy;
	var manche = new mse.Sprite(null, {}, 'cran', manw,manh, 0,0,82,376);
	var lame = new mse.Sprite(null, {pos:[-lamx,-lamy]}, 'cran', lamw,lamh, 82,0,46,339);
	var couteau = new mse.UIObject(null, {});
	couteau.count = 0; couteau.angle = -180;
	couteau.draw = function(ctx){
	    if(this.count == 10) mse.src.getSrc('audCran').play();
	    if(this.count >= 10 && this.count <= 14)
	    	this.angle = -180 + (this.count-10) * 180/4;
	    this.count++;
	    
		ctx.save();
		ctx.globalAlpha = this.globalAlpha;
		// Origin of rotation: point on the top of manche
		ctx.translate(mx+optx,my+opty);
		// Rotation of the lame
		ctx.rotate(this.angle * Math.PI / 180);
		lame.draw(ctx);
		// Draw Manche
		ctx.rotate(-this.angle * Math.PI / 180);
		ctx.translate(-optx,-opty);
		manche.draw(ctx);
		ctx.restore();
	};
	
	animes.couteau=new mse.Animation(36,1,true);
	animes.couteau.block=true;
	animes.couteau.addObj('couteau',couteau);
	animes.couteau.addAnimation('couteau', {
			frame	: [0, 6, 30, 36],
			opacity	: [0, 1, 1,  0]
		});
    
    
    // Game
    games.RatGame = new RatGame();
	games.FindSimon = new FindSimon();
	games.calmdown = initKeyGame([["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200], ["up", 1200], ["down", 1200]]);
	games.ForestExit = new ForestExit();
    
    mse.currTimeline.start();
};
$(document).ready(function(){
    mse.autoFitToWindow(function(){
        mse.init(null, 'Voodoo_Ch1',mse.coor('cid0'),mse.coor('cid1'),'portrait');
        $(document).ready(createbook);
    });
});