define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$http', '$timeout', '$mdToast', 'CONSTANT', function($scope, $http, $timeout, $mdToast, CONSTANT) {
		$scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

		$scope.statuStore = {
			editingItem: {
				typeIndex: -1,
				weekdayIndex: -1
			}
		};

		$scope.remainCountObj = {
			shopId: $scope.userInfo.shopId,
			typeId: 0,
			day: '',
			markId: 0,
			count: 0
		}

		$scope.weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

		//进入编辑状态
		$scope.toggleUpdateRemain = function(boxTypeIndex, weekdayIndex) {
			$scope.statuStore.editingItem.typeIndex = boxTypeIndex;
			$scope.statuStore.editingItem.weekdayIndex = weekdayIndex;
			$scope.remainCountObj.count = $scope.boxTypeList[boxTypeIndex]['markCount' + weekdayIndex];
			$scope.focus = true;
		};

		//失去焦点保存
		$scope.saveUpdate = function(boxTypeIndex, weekdayIndex, e) {

			if ($scope.remainCountObj.count !== '') {
				$scope.remainCountObj.typeId = $scope.boxTypeList[boxTypeIndex].tableTypeId;
				$scope.remainCountObj.day = $scope.weekdays[weekdayIndex];
				$scope.remainCountObj.markId = $scope.boxTypeList[boxTypeIndex]['markId' + weekdayIndex];
				$scope.remainCountObj.count = parseInt($scope.remainCountObj.count);

				var _callback = function(e) {
					return function(data) {
						if (data.code === 0) {
							$scope.boxTypeList[boxTypeIndex]['markCount' + weekdayIndex] = $scope.remainCountObj.count;
							$scope.statuStore.editingItem = {
								typeIndex: -1,
								weekdayIndex: -1
							};
						} else {
							e.currentTarget.focus();
						}
						$mdToast.show(
							$mdToast.simple()
							.content(data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
					}
				};

				$http.post(CONSTANT.SERVICE.SETTING.ORDERSETTING.SAVE + UTILITIES.jsonToUrl($scope.remainCountObj)).success(_callback(e));
			} else {
				$scope.statuStore.editingItem = {
					typeIndex: -1,
					weekdayIndex: -1
				};
			}
		}

		$http.post(CONSTANT.SERVICE.SETTING.ORDERSETTING.LIST + '?shopId=' + $scope.userInfo.shopId).success(function(data) {
			if (data.code == 0)
				$scope.boxTypeList = data.data;
		});

	}];
});