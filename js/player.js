var app = angular.module('player',['ng','ngRoute']);

app.controller('iphoneCtrl',['$scope','$rootScope','$http','$location',function($scope,$rootScope,$http,$location){
	$rootScope.uid = localStorage.getItem('uid') || 0;//获取当前用户
	$scope.playMode = parseInt(localStorage.getItem('playMode')) || 0;//获取播放器的播放模式
	$scope.playTime = parseInt(localStorage.getItem('playTime')) || 0;//已播放时间
	$scope.list = angular.fromJson(localStorage.getItem('playList'));//获取播放的列表
	$scope.mid = parseInt(localStorage.getItem('mid')) || 0;//获取播放的mid
	$rootScope.historys = [];//搜索记录列表
	$rootScope.isEmptyObject = function(obj){
		for( var name in obj ){
			return false;
		}
		return true;
	};
	$rootScope.getList = function(){
		if(!$scope.list || $rootScope.isEmptyObject($scope.list)){
			$scope.listName = '默认列表';
			$http.get('data/getlist.php?list='+$scope.listName+'&uid='+$rootScope.uid).success(function(data){
				$rootScope.num = data.result.songCount;
				$scope.list = data.result.songs;
				$scope.initPlayer();
			});
		}else{
			$scope.initPlayer();
		}

	};
	$rootScope.getSinger = function(arr){
		var singer = "";
		for(var i=0;i<arr.length;i++){
			singer += arr[i].name + " ";
		}
		return singer;
	};
	$scope.initPlayer = function(){
		if($scope.mid === 0){
			$scope.mIndex = 0;
		}else{
			for(var i=0;i<$scope.list.length;i++){
				if($scope.list[i].id == $scope.mid){
					$scope.mIndex = i;
					break
				}
			}
		}
		myPlayer.init({
			playMode : $scope.playMode,
			playTime : $scope.playTime,
			playList : $scope.list,
			mIndex : $scope.mIndex
		});
	};
	$scope.jump = function(toUrl){
		$location.path(toUrl);
	};
	$scope.back = function(){
		history.back();
	};
	$scope.settingClose = function($event){
		var isOpen = $('#content').hasClass('active');
		var elem = $event.target;
		if (isOpen && elem.nodeName === "DIV"){
			$('#content').removeClass('active');
			$('#setting').fadeOut(300);
		}
	};
}]);

app.controller('indexCtrl',['$scope','$rootScope','$http','$location',function($scope,$rootScope,$http,$location){
	$scope.linkTo = function($event){
		var elem =$event.target;
		if(elem.nodeName !== "A" && elem.nodeName !== "EM" && elem.className !== "music-time"){
			$location.path('/music');
		}
	};
	$scope.setting = function(){
		$('#setting').fadeIn(300);
		$('#content').addClass('active');
	};
	if(!$rootScope.num){
		$http.get('data/getNum.php').success(function(data){
			$rootScope.num = data.num || 0; //首页默认列表的本地音乐数量
		});
	};
	$rootScope.getList();

}]);

app.controller('searchCtrl',['$scope','$http','$rootScope','$timeout',function($scope,$http,$rootScope,$timeout){
	$scope.isSearch = false;
	$scope.isListEnd = false;
	$scope.def = "孙燕姿 遇见";
	$scope.hotList = ['明天你好','陈奕迅','孙燕姿','南瓜车','一定要幸福','蔡依林','孙燕姿-遇见','一丝不挂-陈奕迅','幻城'];

	$scope.searchList = [];
	$scope.searchMusic = function(keyword){
		var info = keyword || $scope.def;
		$scope.keyword = info;
		$scope.isSearch = true;
		var i = $rootScope.historys.indexOf(info);
		i !== -1 && $rootScope.historys.splice(i,1);
		$rootScope.historys.unshift(info);
		/*
		 网易云音乐api
		 获取方式：GET
		 参数：
		 src: lofter //可为空
		 type: 1
		 filterDj: true|false //可为空
		 s: //关键词
		 limit: 10 //限制返回结果数
		 offset: 0 //偏移
		 callback: //为空时返回json，反之返回jsonp callback
		 */
		$http.jsonp('http://s.music.163.com/search/get/?callback=JSON_CALLBACK',{params:{
			'type': 1,
			's': info,
			'limit': 20,
			'offset' : 0 //偏移
		}}).success(function(data){
      $scope.songCount = data.result.songCount;
			$scope.searchList = $scope.searchList.concat(data.result.songs);
			$scope.cgMusic = function(index,event){
				var elem = event.target;
				if(elem.nodeName === 'BUTTON'){
					$scope.showMore();
				}else if(elem.nodeName === 'A'){
					$scope.addDefList();
				}else{
					elem.nodeName !== 'LI' && (elem = elem.parentNode);
					if($(elem).hasClass('active')){
						$(elem).removeClass("active");
						myPlayer.pause();
					}else{
						$(elem).addClass("active").siblings().removeClass("active");
						myPlayer.init({
							playList : $scope.searchList,
							mIndex : index,
							playTime : 0,
							isInit : false
						});
						myPlayer.play();
					}

				}

			};
    });
		$scope.isShowMore = false;
		$scope.showMore = function(){
			$scope.isShowMore = true;
		};
		$scope.hideMore = function(e){
			var elem = e.target;
			elem.id==='more' && ($scope.isShowMore = false);
		};
		$scope.isAlert = false;
		$scope.addDefList = function (id){
			var listName = "默认列表";
			if($rootScope.uid === 0){
				$scope.isAlert = true;
				$scope.alertCon = '请先登录';
				$timeout(function(){
					$scope.isAlert = false;
				},2000)
			}
		}
	};

}]);

app.controller('listCtrl',['$scope','$rootScope','$http','$timeout',function($scope,$rootScope,$http,$timeout){
	$scope.curlist = '默认列表';
	$http.get('data/getlist.php?list='+$scope.curlist+'&uid='+$rootScope.uid).success(function(data){
		$scope.list = data.result.songs;
		$scope.cgMusic = function(index,event){
			var elem = event.target;
			if(elem.nodeName === 'BUTTON'){
				$scope.showMore();
			}else{
				elem.nodeName !== 'LI' && (elem = elem.parentNode);
				if($(elem).hasClass('active')){
					$(elem).removeClass("active");
					myPlayer.pause();
				}else{
					$(elem).addClass("active").siblings().removeClass("active");
					myPlayer.init({
						playList : $scope.list,
						mIndex : index,
						playTime : 0,
						isInit : false
					});
					myPlayer.play();
				}

			}

		};
		var isPlayAll = false;
		$scope.playAll = function(event){
			var elem = event.target;
			if(!isPlayAll){
				myPlayer.init({
					playList : $scope.list,
					mIndex : 0,
					playTime : 0,
					isInit : false
				});
				elem.firstElementChild.innerHTML = '&#xe607;';
				myPlayer.play();
				isPlayAll = true;
			}else {
				elem.firstElementChild.innerHTML = '&#xe601;';
				myPlayer.pause();
				isPlayAll = false;
			}
		};
		$scope.isPlaying = function(i){

			var url = $scope.list[i].audio;
			var curUrl = document.getElementById('myMusic').getAttribute('src');
				if(url === curUrl && myPlayer.status === 1){
					return true;
				}else{
				return false;
			}
		}
	});
	$scope.isShowMore = false;
	$scope.showMore = function(){
		$scope.isShowMore = true;
	};
	$scope.hideMore = function(e){
		var elem = e.target;
		elem.id==='more' && ($scope.isShowMore = false);
	};
	$scope.isAlert = false;
	$scope.removeMusic = function (id){
		var listName = "默认列表";
		if($rootScope.uid === 0){
			$scope.isAlert = true;
			$scope.alertCon = '请先登录';
			$timeout(function(){
				$scope.isAlert = false;
			},2000);
		}
	}
}]);

app.controller('musicCtrl',['$scope','$rootScope',function($scope,$rootScope){
	$rootScope.getList();
}]);

//路由词典
app.config(function($routeProvider){
	$routeProvider.when('/index',{
		templateUrl:'tpl/index.html',
		controller:'indexCtrl'
	}).when('/list',{
		templateUrl:'tpl/list.html',
		controller:'listCtrl'
	}).when('/search',{
		templateUrl:'tpl/search.html',
		controller:'searchCtrl'
	}).when('/result',{
		templateUrl:'tpl/result.html',
		controller:'resultCtrl'
	}).when('/music',{
		templateUrl:'tpl/music.html',
		controller:'musicCtrl'
	}).otherwise({
		redirectTo:'/index'
	})

});

//关闭时存储数据
window.onbeforeunload = function() {
	localStorage.setItem('mid', myPlayer.playMusic.id);
	localStorage.setItem('playTime', document.getElementById('myMusic').currentTime);
	localStorage.setItem('playMode', myPlayer.playMode);
	localStorage.setItem('playList', angular.toJson(myPlayer.playList,true));
};
//欢迎页面
$(document).ready(function(){
	$('#hello').removeClass('active');
});
