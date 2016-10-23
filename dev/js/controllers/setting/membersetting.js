define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $http, $mdDialog, $mdToast, CONSTANT) {
		$scope.statuStore = {
			currShopIndex: 0,
			finish: false
		};

		//账户列表
		$scope.memberList = [];

		// 角色列表
		// $scope.roleList = CONSTANT.ROLES;

		$scope.loadList = function() {
			$scope.statuStore.finish = false;
			$http.post(CONSTANT.SERVICE.SETTING.MEMBERSETTING.LIST).success(function(data) {
				$scope.memberList = data.data;
				$scope.shopList[0].memberList = data.data;
				$scope.statuStore.finish = true;
			});
		}

		//按门店过滤
		$scope.filterList = function() {
			var currShopId = $scope.shopList[$scope.statuStore.currShopIndex].shopId;
			// if ($scope.statuStore.currShopIndex == 0) {
			// 	if ($scope.shopList[0].memberList == undefined || $scope.shopList[0].memberList == []) {
			// 		$scope.shopList[0].memberList = $scope.memberList;
			// 	}
			// } else {
			if ($scope.shopList[$scope.statuStore.currShopIndex].memberList == undefined) {
				var list = [];
				for (var i = 0; i < $scope.memberList.length; i++) {
					var member = $scope.memberList[i];
					for (var j = 0; j < member.shopList.length; j++) {
						if (member.shopList[j].shopId == currShopId) {
							list.push(member);
							continue;
						}
					}
				}
				$scope.shopList[$scope.statuStore.currShopIndex].memberList = list;
			}
			// }
		}

		$scope.deleteMember = function(ev, sellerId) {
			var confirm = $mdDialog.confirm({
				textContent: '确定删除该成员？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.SETTING.MEMBERSETTING.DELETE + '?sellerId=' + sellerId).success(function(data) {
					console.log(data);
					$mdToast.show(
						$mdToast.simple()
						.content(data.data.msg)
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
					if (data.data.isSuccess == 1) {
						$scope.loadList();
					}
				});
			}, function() {});
		}

		$scope.showAdd = function() {
			var shopList = angular.copy($scope.shopList);
			shopList.splice(0, 1);
			for (var i = 0; i < shopList.length; i++) {
				shopList[i].checked = 0;
			}
			$scope.showEdit(null, shopList);
		}

		$scope.showUpdate = function(i) {
			var member = $scope.shopList[$scope.statuStore.currShopIndex].memberList[i];

			// 选中店铺列表
			var allShopList = angular.copy($scope.shopList);
			allShopList.splice(0, 1);
			for (var i = 0; i < allShopList.length; i++) {
				allShopList[i].checked = 0;
				for (var j = 0; j < member.shopList.length; j++) {
					if (allShopList[i].shopId == member.shopList[j].shopId) {
						allShopList[i].checked = 1;
						break;
					}
				}
			}

			$scope.showEdit({
				data: {
					sellerId: member.sellerId,
					name: member.name,
					phoneNum: member.tel,
					sgId: member.sgId,
					shopIds: '',
					state: member.state
				}
			}, allShopList);
		}

		// 创建新成员
		$scope.showEdit = function(modalCache, shopList) {
			$mdDialog.show({
				controller: ['$scope', '$mdToast', 'modalCache', 'shopList', 'topScope', editController],
				templateUrl: 'tmpl/setting/editmember.tmpl.html',
				parent: angular.element(document.body),
				locals: {
					modalCache: modalCache,
					shopList: shopList,
					topScope: $scope
				},
				clickOutsideToClose: true
			}).then(function() {

			}, function() {
				$scope.loadList();
			});
		}

		var editController = function($scope, $mdToast, modalCache, shopList, topScope) {
			// 店铺列表
			// var shopList = angular.copy(topScope.shopList);
			// shopList.splice(0, 1);
			// for (var i = 0; i < shopList.length; i++) {
			// 	shopList[i].checked = 0;
			// }
			$scope.shopList = shopList;
			// 角色列表
			var roleList = angular.copy(CONSTANT.ROLES);
			roleList.splice(0, 1);
			$scope.roleList = roleList;

			if (modalCache == null) {
				// 新增
				$scope.modalCache = {
					data: {
						name: '',
						phoneNum: '',
						password: '',
						sgId: $scope.roleList[0].sgId,
						shopIds: '',
						state: 0
					}
				};
				$scope.isCreate = true;
			} else {
				// 修改
				$scope.modalCache = modalCache;
				$scope.isCreate = false;
			}

			$scope.saveMember = function() {
				if (angular.equals({}, $scope.inputForm.$error)) {
					var shopId = '';
					for (var i = 0; i < $scope.shopList.length; i++) {
						if ($scope.shopList[i].checked) {
							if (shopId === '') {
								shopId += $scope.shopList[i].shopId;
							} else {
								shopId += (',' + $scope.shopList[i].shopId);
							}
						}
					}
					$scope.modalCache.data.shopIds = shopId;
					$http.post(($scope.isCreate ? CONSTANT.SERVICE.SETTING.MEMBERSETTING.CREATE : CONSTANT.SERVICE.SETTING.MEMBERSETTING.UPDATE) + UTILITIES.jsonToUrl($scope.modalCache.data)).success(function(data) {
						$mdToast.show(
							$mdToast.simple()
							.content(data.data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
						if (data.data.isSuccess) {
							$mdDialog.cancel();
						}
					});
				} else {
					angular.forEach($scope.inputForm.$error.required, function(field) {
						field.$setDirty();
					});
				}
			}
		}

		//店铺列表
		$http.post(CONSTANT.SERVICE.COMMON.SHOP_LIST).success(function(data) {
			var shopList = data.data;
			shopList.unshift({
				shopId: 0,
				shopName: '全部门店'
			});
			$scope.shopList = shopList;

			$scope.loadList();

			$scope.$watch(function() {
				return $scope.statuStore.currShopIndex;
			}, function(a, b) {
				$scope.filterList();
			});
		});
	}];
});