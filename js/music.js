
var myPlayer = {
	//listId : 0,
	playList : {},//播放列表
	playMusic : {},//歌曲
	mIndex:0,//当前歌曲在列表的位置
	totalTime : 0,//音乐总时间
	musicLrc : "",

	isInit : false,//是否初始化过
	isDrag : false,//是否拖拽进度条
	timer : null,//背景切换定时器

	playMode : 0,//播放模式/顺序/随机/单曲
	SEQUENCE : 0,
	RANDOM : 1,
	SINGLE : 2,
	status : 0,//播放状态/暂停/播放
	PAUSED : 0,
	PLAYING : 1,
	//初始化
	init : function(obj){
		obj.hasOwnProperty('isInit') && (this.isInit = obj.isInit);
		if(!this.isInit){
			this.isInit = true;
			this.mIndex = obj.mIndex;
			this.playList = obj.playList;
			obj.hasOwnProperty('playMode') && (this.playMode = obj.playMode);
			obj.hasOwnProperty('playTime') && (this.$('myMusic').currentTime = obj.playTime);
		}else{
			this.setTotalTime();
		}
		this.getMusic();//设置路径/标题/歌手
		this.addHandler(this.$('myMusic'),'canplay',function(){
			this.totalTime = this.$('myMusic').duration;
			this.setTotalTime();
		}.bind(this));//加载总时间和开始时间
		this.$('playBtn') && (this.$('playBtn').innerHTML = this.status === this.PLAYING ? '&#xe607;' : '&#xe6bc;');
		this.$('playMode') && (this.$('playMode').innerHTML = this.playMode === this.SEQUENCE ? '&#xe618;' : this.playMode === this.RANDOM ? '&#xe606;' : '&#xe617;') ;
		this.$('mainLrc') && this.setLrc();

		//事件处理
		this.$('playBtn') && this.addHandler(this.$('playBtn'),'click',function(){
			this.status===this.PLAYING ? this.pause() : this.play();
		}.bind(this));//播放/暂停
		this.$('nextBtn') && this.addHandler(this.$('nextBtn'),'click',this.changeMusic.bind(this,1));//下一曲/判断是否存在
		this.$('prevBtn') && this.addHandler(this.$('prevBtn'),'click',this.changeMusic.bind(this,-1));//上一曲/判断是否存在
		this.$('showList') && this.addHandler(this.$('showList'),'click',this.showList.bind(this));//播放列表按钮/判断是否存在
		this.$('playMode') && this.addHandler(this.$('playMode'),'click',this.changeMode.bind(this));//播放模式/判断
		this.addHandler(this.$('myMusic'),'ended',this.changeMusic.bind(this,1));//播放完自动切换下一曲

		//进度条事件
		if(this.$('timeLine')){
			this.addHandler(this.$('timeLine'),'click',function(event){
				var e = event || window.event;
				e.target.nodeName !== "EM" && this.changeTime(e);
			}.bind(this));//点击或拖拽进度条切换时间内
			this.drag = this.$("curTime");
			this._x = 0;
			this._moveDrag = this.bind(this, this.moveDrag);
			this._stopDrag = this.bind(this, this.stopDrag);
			this.handle = this.drag.getElementsByTagName('em')[0];
			this.maxLeft = parseInt(getComputedStyle(this.drag.parentNode).width);
			this.maxLeft = this.$("timeLine").previousElementSibling ? this.maxLeft * 0.7 : this.maxLeft + 15;

			//PC端的处理
			this.addHandler(this.drag,'mousedown',this.startDrag.bind(this));
			//移动端的处理
			this.addHandler(this.drag,'touchstart',this.startDrag.bind(this));
		}
	},

	getMusic : function(){
		this.playMusic = this.playList[this.mIndex];
		//设置页面
		this.$('myMusic').getAttribute('src') !== this.playMusic.audio && (this.$('myMusic').src = this.playMusic.audio);
		this.$('musicName') && (this.$('musicName').innerHTML = this.playMusic.name);
		var singer = this.playMusic.artists[0].name;
		if(this.playMusic.artists.length > 1){
			$.each(this.playMusic.artists,function(i,v){
				i!==0 && (singer += '+'+v.name);
			});
		}
		this.$('musicSinger') && (this.$('musicSinger').innerHTML =  singer);
		this.$('musicImg') && (this.$('musicImg').src = this.playMusic.album.picUrl || this.playMusic.artists[0].picUrl || 'img/i/skin_kg_playing_bar_default_avatar.png');//加载音乐图片
		this.$('mainLrc') && this.getLrc();//歌词处理/判断是否有歌词显示
	},
	play : function(){
		this.$('myMusic').play();
		this.status = this.PLAYING;
		this.$('playBtn') && (this.$('playBtn').innerHTML="&#xe607;");
		this.addHandler(this.$('myMusic'),"timeupdate",this.animationStart.bind(this));
	},
	pause : function(){
		this.$('myMusic').pause();
		this.status = this.PAUSED;
		this.$('playBtn') && (this.$('playBtn').innerHTML="&#xe6bc;");
	},
	changeMode : function(){
		switch (this.playMode){
			case this.SEQUENCE:
				this.$('playMode').innerHTML = '&#xe606;';
				this.playMode = this.RANDOM;
				break;
			case this.RANDOM :
				this.$('playMode').innerHTML = '&#xe617;';
				this.playMode = this.SINGLE;
				break;
			default :
				this.$('playMode').innerHTML = '&#xe618;';
				this.playMode = this.SEQUENCE;
		}
	},
	changeMusic : function(r){//切换歌曲
		this.pause();
		this.$('mainLrc') && (this.$('mainLrc').style.top = 0);
		clearTimeout(this.timer);
		this.timer = null;
		if(this.playMode === this.SEQUENCE){
			this.mIndex+=1*r;
			this.mIndex = this.mIndex === this.playList.length ? 0 : this.mIndex === -1 ? this.playList.length-1 : this.mIndex;
			this.getMusic();
		}else if(this.playMode === this.RANDOM){
			this.mIndex = parseInt(Math.random() * this.playList.length);
			this.getMusic();
		}else if(this.playMode === this.SINGLE){
			this.$('myMusic').currentTime = 0;
		}
		this.play();
	},
	showList :function(){},
	setTotalTime : function(){
		if(this.$("timeLine") && this.$("timeLine").nextElementSibling){
			this.$("timeLine").nextElementSibling.innerHTML = this.formatTime(this.totalTime);
		}
		this.$("timeLine") && this.setPlayTime();//获取并设置当前播放时间和预加载时间
	},
	setPlayTime : function(){
		var t = this.totalTime;
		var c = this.$('myMusic').currentTime;
		//this.$('myMusic').buffered.start(0);
		var p = this.$('myMusic').buffered.end(0);
		var moved=(c/t*100).toFixed(2)+"%";//计算进度
		this.$("curTime").style.left = moved;
		this.$("overTime").style.width = moved;
		this.$("preTime").style.width = (p/t*100).toFixed(2)+'%';
		if(this.$("timeLine") && this.$("timeLine").previousElementSibling){
			this.$("timeLine").previousElementSibling.innerHTML = this.formatTime(c);
		}
	},
	formatTime : function(t){
		var m=parseInt(t/60);
		var s=parseInt(t%60);
		return (m+":"+(s<10?"0"+s:s));
	},
	getLrc : function(){
		var url = this.playMusic.audio;
		this.$('mainLrc').innerHTML = '<li>正在匹配歌词..</li>';
		var musicName = url.slice(url.lastIndexOf('/')+1,url.lastIndexOf('.'));
		$.ajax({type:'get',url:"music/lrc/"+musicName+".lrc",dataType:'text',success:function(data){
			//var mainLrc= data; //替换标签内的html
			function getInfo(val,def){
			 var starti=data.indexOf(val);
			 return starti!==-1 ? data.slice(starti+val.length,data.indexOf("]",starti)) : def;
			 }
			 /* this.musicName = getInfo('ti:',this.curMusic);
			 this.musicSinger = getInfo('ar:',"Unknown");
			 this.musicAl = getInfo('al:',"Unknown");*/
			 var lrcOffset = getInfo('offset:',0);

			//切割歌词
			var musicLrc=data.split("\n");
			for(var i=musicLrc.length-1,reg=/.*\][\s]$|.*\]$/; i>=0; i--){
				if(musicLrc[i]===""||reg.test(musicLrc[i])){
					musicLrc.splice(i,1);
					continue;
				}
				musicLrc[i]=musicLrc[i].split("]");
				while(musicLrc[i].length>2){
					var arr=musicLrc[i].splice(0,1).concat(musicLrc[i][musicLrc[i].length-1]);
					musicLrc.splice(i+1,0,arr);
				}
			}
			//console.dir(musicLrc);
			//00:00 转为秒数
			for(var i=0;i<musicLrc.length;i++){
				musicLrc[i][0]=musicLrc[i][0].slice(1,musicLrc[i][0].length);
				var times=musicLrc[i][0].split(":");
				musicLrc[i][0]=Math.floor(times[0]*60+times[1]*1+(times[2]||0)/100+lrcOffset/1000);
				musicLrc[i][1]=musicLrc[i][1].trim();
			}
			this.musicLrc = musicLrc.sort(function(a,b){return a[0]-b[0];});//歌词排序
			//console.log(this.musicLrc);
			//更新页面
			var lrcHtml = "";
			$.each(this.musicLrc,function(i,v){ lrcHtml+='<li id="'+v[0]+'">'+v[1]+'</li>' });
			this.$('mainLrc').innerHTML = lrcHtml;
		}.bind(this),error:function(){
			this.musicLrc = "";
			this.$('mainLrc').innerHTML = '<li>没有找到匹配歌词..</li>';
		}.bind(this),async:false});
		//this.setLrc();
		this.getBg();//获取歌手壁纸;
	},
	setLrc : function(){
		var curt = this.$('myMusic').currentTime;
		for(var i=this.musicLrc.length-1; i>=0; i--){
			if(curt > this.musicLrc[i][0]){
				var elem="#"+this.musicLrc[i][0];
				$(elem).addClass("active").siblings().removeClass("active");
				$(elem).prev().length !==0 && $(this.$(elem)).prev().addClass("before").siblings().removeClass("before");
				$(elem).prev().prev().length !==0 && $(this.$(elem)).prev().prev().addClass("before2").siblings().removeClass("before2");
				var mTop="-" + $(elem).position().top+"px";
				$("#mainLrc").animate({top : mTop},200);
				break;
			}
		}
	},
	lrcMove : function() {
		var elem = ''+Math.floor(this.$('myMusic').currentTime);
		if (this.$(elem)) {
			elem = '#'+ elem;
			$(elem).addClass("active").siblings().removeClass("active");
			$(elem).prev().length !== 0 && $(elem).prev().addClass("before").siblings().removeClass("before");
			$(elem).prev().prev().length !== 0 && $(elem).prev().prev().addClass("before2").siblings().removeClass("before2");
			var mTop = "-" + $(elem).position().top + "px";
			$("#mainLrc").animate({top: mTop}, 200);
		}
	},
	animationStart : function(){
		(this.$("timeLine") && !this.isDrag) && this.setPlayTime();
		this.$('mainLrc') && this.lrcMove();
	},
	getBg : function(){
		var bgList = [];
		$.each(this.playMusic.artists,function(i,v){
			bgList = bgList.concat(v.bgUrl);
		});
		if(bgList.length!==0){
			var html = bgList.join(')"></li><li style="background-image: url(');
			this.$('mark').innerHTML = '<ul><li style="background-image: url('+ html + ')"></li></ul>';
			var liIndex = 0;
			var img=new Image();
			img.src=bgList[0];
			img.onload = changeBg.bind(this);
			function changeBg(){
				$('#mark>ul>li:eq('+liIndex+')').addClass("active").siblings().removeClass("active");
				liIndex++;
				liIndex === $('#mark>ul>li').length && (liIndex = 0);

				$("#overTime, .foot-btn a").css({background:randomColor()});
				// $("#overTime, .foot-btn a").stop().animate({opacity:0.5},500,function(){
				// 	$("#overTime, .foot-btn a").css({background:myColor()});
				// 	$("#overTime, .foot-btn a").stop().animate({opacity:1},500);
				// });
				this.timer = setTimeout(changeBg,6000);
			}
			img = null;
		}else{
			this.$('mark').innerHTML = '';
		}
		function randomColor(){
			var r=parseInt(Math.random()*186)+30;
			var g=parseInt(Math.random()*186)+30;
			var b=parseInt(Math.random()*186)+30;
			return "rgb("+r+","+g+","+b+")";
		}
	},
	changeTime : function(e){
		var x = e.offsetX;
		var pt = x/parseInt(getComputedStyle(this.$('timeLine')).width) * this.totalTime;
		this.$("myMusic").currentTime = pt;
		//this.setPlayTime();
		this.$("#mainLrc") && this.setLrc();
	},
	startDrag : function (event){
		this.isDrag = true;
		var event = event || window.event;
		this._x = (event.clientX || event.changedTouches[0].clientX) - this.drag.offsetLeft;
		//console.log(event.clientX||event.changedTouches[0].clientX,this.drag.offsetLeft,this._x);
		this.addHandler(document, "mousemove", this._moveDrag);
		this.addHandler(document, "mouseup", this._stopDrag);
		this.addHandler(document,'touchmove',this._moveDrag);
		this.addHandler(document,'touchend',this._stopDrag);
		event.preventDefault && event.preventDefault();
		this.handle.setCapture && this.handle.setCapture();
		var t = parseInt(this.drag.offsetLeft/this.maxLeft * this.totalTime);
		this.drag.getElementsByTagName('span')[0].innerHTML = this.formatTime(t);
	},
	moveDrag : function (event){
		var event = event || window.event;
		var iLeft = (event.clientX || event.changedTouches[0].clientX) - this._x;

		iLeft < 0 && (iLeft = 0);
		iLeft > this.maxLeft && (iLeft = this.maxLeft);
		this.drag.style.left = (iLeft/this.maxLeft * 100).toFixed(2) + "%";
		event.preventDefault && event.preventDefault();
		var t = parseInt(this.drag.offsetLeft/this.maxLeft * this.totalTime);
		this.drag.getElementsByTagName('span')[0].innerHTML = this.formatTime(t);
	},
	stopDrag : function (){
		//event.preventDefault();
		this.removeHandler(document, "mousemove", this._moveDrag);
		this.removeHandler(document, "mouseup", this._stopDrag);
		this.removeHandler(document,'touchmove',this._moveDrag);
		this.removeHandler(document,'touchend',this._stopDrag);
		this.handle.releaseCapture && this.handle.releaseCapture();
		this.$('myMusic').currentTime = parseInt(this.drag.offsetLeft/this.maxLeft * this.totalTime);
		//this.setPlayTime();
		this.$("mainLrc") && this.setLrc();
		this.isDrag = false;
	},

	//获取id
	$ : function (id)
	{
		return typeof id === "string" ? document.getElementById(id) : id
	},
	//添加绑定事件
	addHandler : function (oElement, sEventType, fnHandler)
	{
		return oElement.addEventListener ? oElement.addEventListener(sEventType, fnHandler, false) : oElement.attachEvent("on" + sEventType, fnHandler)
	},
	//删除绑定事件
	removeHandler : function (oElement, sEventType, fnHandler)
	{
		return oElement.removeEventListener ? oElement.removeEventListener(sEventType, fnHandler, false) : oElement.detachEvent("on" + sEventType, fnHandler)
	},
	//绑定事件到对象
	bind : function (object, fnHandler)
	{
		return function ()
		{
			return fnHandler.apply(object, arguments)
		}
	}
};