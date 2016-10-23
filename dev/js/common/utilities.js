define(['js/common/constant.js', 'socket.io'], function(CONSTANT, io) {
	return {
		getToastPosition: function() {
			var last = {
				bottom: false,
				top: true,
				left: false,
				right: true
			};
			var toastPosition = angular.extend({}, last);

			var current = toastPosition;
			if (current.bottom && last.top) current.top = false;
			if (current.top && last.bottom) current.bottom = false;
			if (current.right && last.left) current.left = false;
			if (current.left && last.right) current.right = false;
			last = angular.extend({}, current);

			return Object.keys(toastPosition)
				.filter(function(pos) {
					return toastPosition[pos];
				})
				.join(' ');
		},
		jsonToUrl: function(json) {
			return '?' + Object.keys(json).map(function(key) {
				return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
			}).join('&');
		},
		findElement: function(arr, propName, propValue) {
			for (var i = 0; i < arr.length; i++)
				if (arr[i][propName] == propValue)
					return arr[i];
		},
		//根据属性值获取当前对象在数组中的下标
		findIndex: function(list, propName, propVal) {
			return list.map(function(obj, index) {
				if (obj[propName] == propVal) {
					return index;
				}
			}).filter(isFinite)[0];
		},

		// 当前获取用户信息
		// getUserInfo: function() {
		// 	var userInfoStr = sessionStorage.getItem('userInfo');
		// 	if (userInfoStr == null) {
		// 		location.href = 'login.html';
		// 	} else {
		// 		return JSON.parse(userInfoStr);
		// 	}
		// },
		// 获取店铺列表
		// getShopList: function() {
		// 	var shopListStr = sessionStorage.getItem('shopList');
		// 	if (shopListStr == null || JSON.parse(shopListStr).length == 0) {
		// 		$.ajax({
		// 			url: CONSTANT.SERVICE.COMMON.SHOP_LIST,
		// 			async: false,
		// 			success: function(data) {
		// 				sessionStorage.setItem('shopList', JSON.stringify(data.data));
		// 				return data.data;
		// 			}
		// 		});
		// 	} else {
		// 		return JSON.parse(shopListStr);
		// 	}
		// }

		// SESSION相关操作
		sessionUtilities: function() {
			return {
				setUserInfo: function(userInfo) {
					if (typeof(userInfo) === 'object')
						sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
				},
				getUserInfo: function() {
					var userInfoStr = sessionStorage.getItem('userInfo');
					if (userInfoStr === null) {
						location.href = 'login.html';
					} else {
						return JSON.parse(userInfoStr);
					}
				},
				clearUserInfo: function() {
					sessionStorage.removeItem('userInfo');
				},
				setShopList: function(shopArr) {
					if (typeof(shopArr) === 'object')
						sessionStorage.setItem('shopList', JSON.stringify(shopArr));
				},
				getShopList: function() {
					var shopListStr = sessionStorage.getItem('shopList');
					if (shopListStr !== null) {
						return JSON.parse(shopListStr);
					}
				}
			}
		},
		getSocket: function() {
			return io(CONSTANT.SOCKET_PUSH_SERVER_HOST);
		}
	}
});