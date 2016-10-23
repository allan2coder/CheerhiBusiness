define(['angularAMD', '../common/utilities.js', 'socket.io'], function(angularAMD, UTILITIES, io) {
	'use strict';
	angularAMD.controller('navMenuController', ['$scope', '$state', function($scope, $state) {

		$scope.isTabActive = function(tabName) {
			// Check if there is sub-states
			var stateName = $state.current.name,
				subStatePos = stateName.indexOf('.');

			if (subStatePos > -1) {
				stateName = stateName.substring(0, subStatePos);
			}

			if (tabName === stateName) {
				return 'active';
			}
		};

		$scope.switchRootMenu = function(tabName) {
			var stateName = $state.current.name,
				subStatePos = stateName.indexOf('.');

			if (subStatePos > -1) {
				stateName = stateName.substring(0, subStatePos);
			}

			if (stateName !== tabName) {
				$state.transitionTo(tabName);
			}
		}

		$scope.pageAuth = UTILITIES.sessionUtilities().getUserInfo().pageAuth.menus;
		console.log($scope.pageAuth);

	}]);

	angularAMD.controller('headerController', ['$scope', '$state', '$http', 'CONSTANT', 'MsgUnread', function($scope, $state, $http, CONSTANT,MsgUnread) {

		$scope.msgUnread = MsgUnread;
		$scope.msgUnread.flag = false;

		//从session中获取用户信息
		$scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

		$http.post(CONSTANT.SERVICE.COMMON.SHOP_LIST).success(function(data) {
			console.log(data);
			$scope.shopArr = data.data;
			//获取店铺列表并存入session
			UTILITIES.sessionUtilities().setShopList($scope.shopArr);
			$scope.shopIndex = UTILITIES.findIndex($scope.shopArr, 'shopId', $scope.userInfo.shopId);
		});

		$scope.$watch(function() {
			return $scope.shopIndex;
		}, function(a, b) {
			if (a != undefined && $scope.shopArr[a].shopId != $scope.userInfo.shopId) {
				var shop = $scope.shopArr[a];
				$http.post(CONSTANT.SERVICE.COMMON.SHOP_SWITCH + '?shopId=' + shop.shopId).success(function(data) {
					console.log(data);
					if (data.data.isSuccess) {
						$scope.userInfo.shopId = shop.shopId;
						$scope.userInfo.shopName = shop.shopName;
						UTILITIES.sessionUtilities().setUserInfo($scope.userInfo);
						location.reload();
					}
				});
			}
		});

		// 头像点击菜单选择
		$scope.$watch('rightMenuFlag', function(a, b) {
			if (a === 'logout') {
				// 登出
				$http.post(CONSTANT.SERVICE.COMMON.LOGOUT).success(function(data) {
					if (data.isSuccess) {
						UTILITIES.sessionUtilities().clearUserInfo();
						location.href = CONSTANT.LOGIN_PAGE;
					}
				});
			} else if (a === 'test') {
				$state.transitionTo('order.foodConfirm');
			}
		});

		// 查看站内信阅读状态
		$scope.scanMsg = function(){
			$http.post(CONSTANT.SERVICE.MAIL.READSTATUS).success(function(data) {
				$scope.msgUnread.flag = (data.data.notred > 0);
			});
		}

		// 阅读站内信
		$scope.readMail = function() {
			$state.transitionTo('mail.maillist');
		}

		// 消息推送
		var socket = UTILITIES.getSocket();
		//声音提醒
		var audio1 = new Audio('audio/new1.m4a');
		var audio2 = new Audio('audio/new2.m4a');
		var audio3 = new Audio('audio/new3.m4a');

		socket.on('pushclient-' + $scope.userInfo.sellerId, function(response) {
			notifyMe(response);
		});

		document.addEventListener('DOMContentLoaded', function() {
			if (Notification.permission !== "granted")
				Notification.requestPermission();
		});

		function notifyMe(pushObj) {
			if (!Notification) {
				console.log('浏览器不支持消息提醒功能，请使用chromium内核浏览器');
				return;
			}
			if (Notification.permission !== "granted")
				Notification.requestPermission();
			else {
				if (pushObj.pushType === 1) {
					// pushType=1 新订单推送
					//更新菜单未读状态，并改变cookie
					updateUnreadStatus(pushObj.data.type);

					var notification = new Notification('去嗨', {
						icon: 'img/icon.png',
						body: pushObj.data.msg,
					});

					notification.onclick = function() {
						if (pushObj.data.type == 1)
							location.href = '#/order/book-confirm';
						else if (pushObj.data.type == 2)
							location.href = '#/order/food-confirm';
						else
							location.href = '#/order/refund';
						window.focus();
					};
				} else if (pushObj.pushType === 2) {
					// $scope.msgUnread = true;
					// pushType=2 站内信推送
					var notification = new Notification('去嗨', {
						icon: 'img/icon.png',
						body: pushObj.data.msg,
					});

					notification.onclick = function() {
						location.href = '#/mail/maillist';
						window.focus();
					};

					$scope.scanMsg();
				}

			}
		}

		function updateUnreadStatus(type) {
			if (type == 1) {
				audio1.play();
			} else if (type == 2) {
				audio2.play();
			} else {
				audio3.play();
			}
		}

		$scope.scanMsg();

	}]);

	angularAMD.directive('navMenu', function() {
		return {
			restrict: 'A',
			controller: 'navMenuController',
			templateUrl: 'views/common/nav.html'
		};
	});

	angularAMD.directive('headerView', function() {
		return {
			restrict: 'A',
			controller: 'headerController',
			templateUrl: 'views/common/header.html'
		};
	});

});