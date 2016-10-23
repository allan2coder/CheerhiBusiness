define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $http, $mdDialog, $mdToast, CONSTANT) {

		$scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

		$scope.statuStore = {
			mealCateIndex: 0
		};

		$scope.mealCateList = CONSTANT.MEALCATE;

		$scope.loadMealList = function(mealCateIndex) {
			var i;
			if (mealCateIndex === undefined) {
				i = $scope.statuStore.mealCateIndex;
			} else {
				i = mealCateIndex;
			}
			$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.LIST + '?shopId=' + $scope.userInfo.shopId + '&cateId=' + (i + 1)).success(function(data) {
				$scope.mealCateList[i].mealList = data.data.result;
			});
		};

		// 上/下架
		$scope.switchSell = function(ev, sellStatus, foodId) {
			var confirm = $mdDialog.confirm({
				textContent: '确定' + (sellStatus ? '下' : '上') + '架该餐点？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.SWTICH_SELL + '?foodId=' + foodId).success(function(data) {
					if (data.code == 0) {
						$scope.loadMealList($scope.statuStore.mealCateIndex);
						$mdToast.show(
							$mdToast.simple()
							.content(sellStatus ? '已下架' : '已上架')
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
					} else {
						$mdToast.show(
							$mdToast.simple()
							.content(data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
					}
				});
			}, function() {});
		};

		// 删除
		$scope.deleteItem = function(ev, fId, cateId) {
			var confirm = $mdDialog.confirm({
				textContent: '确定删除该餐点？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.DELETE + '?fId=' + fId + '&cateId=' + cateId).success(function(data) {
					if (data.data.code == 1) {
						$scope.loadMealList($scope.statuStore.mealCateIndex);
						$mdToast.show(
							$mdToast.simple()
							.content('删除成功')
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
					} else {
						$mdToast.show(
							$mdToast.simple()
							.content(data.data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
					}
				});
			}, function() {});
		};

		// 查看更多子餐点
		$scope.showMoreSubMeal = function(ev, mealList) {
			var title = '';
			for (var i = 0; i < mealList.length; i++) {
				title += mealList[i].singleName + '×' + mealList[i].tmNumber;
				if (i + 1 < mealList.length)
					title += ','
			}
			ev.currentTarget.title = title;
		}

		// 弹出新增窗口
		$scope.showAdd = function() {
			$scope.showEdit({
				data: null,
				renderObj: {
					// firstCreate: true,
					title: $scope.statuStore.mealCateIndex == 0 ? '新建套餐' : '新建餐点',
					mealCateIndex: $scope.statuStore.mealCateIndex,
					isAdd: true
				}
			});
		}

		// 弹出修改窗口
		$scope.showUpdate = function(meal) {
			var _meal = angular.copy(meal);
			var subMealList = _meal.foodMealList;
			delete _meal.foodMealList;
			_meal.foodMealListJson = subMealList;

			// 编辑套餐时,原来的餐点保持不变
			if ($scope.statuStore.mealCateIndex === 0) {
				for (var i = 0; i < _meal.foodMealListJson.length; i++) {
					_meal.foodMealListJson[i].keep = true;
				}
			}

			$scope.showEdit({
				data: _meal,
				renderObj: {
					title: $scope.statuStore.mealCateIndex == 0 ? '修改套餐' : '修改餐点',
					mealCateIndex: $scope.statuStore.mealCateIndex,
					isAdd: false
				}
			});
		}

		//弹出新增窗口
		$scope.showEdit = function(modalCache) {
			// 由新增按钮触发
			if (modalCache.data == null) {
				modalCache.data = {
					fId: 0,
					unitType: '份',
					fImg: '',
					fName: '',
					orderId: 0,
					cateId: modalCache.renderObj.mealCateIndex + 1,
					fpPrice: '',
					shopId: $scope.userInfo.shopId,
					isShow: 1,
					foodMealListJson: [],
					isSell: 1,
				}
			}

			if (modalCache.data.fImg.indexOf(CONSTANT.ALIYUNOSS_HOST) > -1) {
				modalCache.renderObj.img = modalCache.data.fImg;
				modalCache.data.fImg = modalCache.data.fImg.replace(CONSTANT.ALIYUNOSS_HOST, '');
			} else {
				modalCache.renderObj.img = CONSTANT.ALIYUNOSS_HOST + modalCache.data.fImg;
			}

			//弹窗TPL状态由modalCache渲染，二级弹窗式携带该参数以保存状态
			// $scope.modalCache = angular.copy(modalCache);

			// $scope.editDialog = $mdDialog;
			// 一级弹窗
			$mdDialog.show({
				controller: ['$scope', '$mdDialog', '$mdToast', 'Upload', 'CONSTANT', 'parentScope', 'modalCache', editController],
				templateUrl: 'tmpl/setting/editmeal.tmpl.html',
				parent: angular.element(document.body),
				locals: {
					parentScope: $scope,
					modalCache: angular.copy(modalCache)
				},
				clickOutsideToClose: true
			}).then(function() {}, function() {
				$scope.loadMealList();
			});
		};

		$scope.$watch(function() {
			return $scope.statuStore.mealCateIndex;
		}, function(a, b) {
			if (typeof($scope.mealCateList[a].mealList) === 'undefined') {
				$scope.loadMealList(a);
			}
		});

		/*CONTROLLERS*/
		// 编辑controller
		var editController = function($scope, $mdDialog, $mdToast, Upload, CONSTANT, parentScope, modalCache) {

			$scope.CONSTANT = CONSTANT;

			$scope.parentScope = parentScope;
			// $scope.retriveParentDialog = $scope.topScope.showEdit;
			$scope.modalCache = modalCache;

			$scope.upload = function(file) {
				if (file != null) {
					Upload.upload({
						url: CONSTANT.SERVICE.SETTING.MEALSETTING.UPLOAD_IMAGE,
						data: {
							file: file
						}
					}).then(function(resp) {
						console.log(resp);
						if (resp.data.success) {
							$scope.modalCache.data.fImg = resp.data.data.shortImgUrl;
							$scope.modalCache.renderObj.img = CONSTANT.ALIYUNOSS_HOST + resp.data.data.shortImgUrl;
						}
					}, function(resp) {
						console.log(resp);
					}, function(evt) {
						// var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
						// console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
					});
				}
			};

			$scope.addSubMeal = function() {
				$scope.modalCache.data.foodMealListJson.push({
					singleName: '',
					unitType: '份',
					tmId: 0,
					foodId: 0,
					singleId: 0,
					tmNumber: ''
				});
			};

			$scope.removeSubMeal = function(i, keep) {
				var meal = $scope.modalCache.data.foodMealListJson[i];
				if (keep) {
					$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.DELETE_SUB_MEAL + '?foodId=' + meal.foodId + '&tmId=' + meal.tmId).success(function(data) {
						if (data.data.code === 1) {
							$scope.modalCache.data.foodMealListJson.splice(i, 1);
						}
					});
				} else {
					$scope.modalCache.data.foodMealListJson.splice(i, 1);
				}
			}

			$scope.showSubMealPicker = function(i) {
				// 二级弹窗
				$mdDialog.show({
					controller: ['$scope', '$http', 'CONSTANT', 'modalCache', 'parentScope', 'mealIndex', 'title', function($scope, $http, CONSTANT, modalCache, parentScope, mealIndex, title) {

						$scope.title = title;

						$scope.parentScope = parentScope;

						$scope.mealCateIndex = 1;

						$scope.mealCateList = angular.copy(CONSTANT.MEALCATE);

						// 去掉套餐
						$scope.mealCateList.splice(0, 1);
						$scope.loadMealList = function(mealCateIndex) {
							$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.LIST + '?shopId=' + $scope.parentScope.userInfo.shopId + '&cateId=' + (mealCateIndex+1)).success(function(data) {
								$scope.mealCateList[mealCateIndex - 1].mealList = data.data.result;
							});
						};

						$scope.$watch(function() {
							return $scope.mealCateIndex;
						}, function(a, b) {
							if (typeof($scope.mealCateList[a - 1].mealList) === 'undefined') {
								$scope.loadMealList(a);
							}
						});

						// 选中子餐点
						$scope.selectSubMeal = function(meal) {
							modalCache.data.foodMealListJson[mealIndex].singleId = meal.fId;
							modalCache.data.foodMealListJson[mealIndex].singleName = meal.fName;
							$scope.parentScope.showEdit(modalCache);
						}
					}],
					templateUrl: 'tmpl/setting/submealpicker.tmpl.html',
					parent: angular.element(document.body),
					locals: {
						modalCache: $scope.modalCache,
						parentScope: $scope.parentScope,
						mealIndex: i,
						title: '添加子餐点'
					},
					clickOutsideToClose: true
				}).then(function() {
					// $scope.parentScope.showEdit($scope.modalCache);
				}, function() {
					$scope.parentScope.showEdit($scope.modalCache);
				});
			};

			$scope.saveMeal = function() {
				if (angular.equals({}, $scope.inputForm.$error)) {
					var _data = angular.copy($scope.modalCache.data);
					// delete _data.foodMealListJson;

					// var foodMealListJson = [];
					// if ($scope.modalCache.renderObj.mealCateIndex == 0) {
					// 	for (var i = 0; i < $scope.modalCache.data.foodMealListJson.length; i++) {
					// 		var food = $scope.modalCache.data.foodMealListJson[i];
					// 		if (!food.keep) {
					// 			foodMealListJson.push(food);
					// 		}
					// 	}
					// }

					var foodMealListJson = _data.foodMealListJson;
					delete _data.foodMealListJson;

					$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.SAVE + UTILITIES.jsonToUrl(_data) + ($scope.modalCache.renderObj.mealCateIndex == 0 ? ('&foodMealListJson=' + angular.toJson(foodMealListJson)) : '&foodMealListJson=[]')).success(function(response) {
						console.log(response);
						$mdToast.show(
							$mdToast.simple()
							.content(response.data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
						if (response.data.isSuccess) {
							$scope.parentScope.loadMealList();
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
	}];
});