define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
	'use strict';
	return ['$scope', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $http, $mdDialog, $mdToast, CONSTANT) {

		$scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

		$scope.statuStore = {
			currSpecExpenplanDateIndex: 0
		};

		// 加载特殊日计费方案-日期列表
		$scope.loadActiveDateList = function() {
			$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.LIST_SPEC_DATE + '?shopId=' + $scope.userInfo.shopId).success(function(data) {
				$scope.activeDateList = data.data;
				$scope.loadSpecList(0);
			});
		}

		// 加载特殊日计费方案
		$scope.loadSpecList = function(i) {
			$scope.statuStore.currSpecExpenplanDateIndex = i;
			if ($scope.activeDateList != undefined) {
				$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.LIST_SPEC + '?shopId=' + $scope.userInfo.shopId + '&date=' + $scope.activeDateList[i]).success(function(data) {
					console.log(data);
					$scope.specList = data.data;
					for (var h = 0; h < data.data.length; h++) {
						for (var i = 0; i < data.data[h].timepart.length; i++) {
							for (var j = 0; j < data.data[h].timepart[i].tableType.length; j++) {
								var tablePrice = data.data[h].timepart[i].tableType[j].dateTablePrice;
								// angular.forEach(tablePrice, function(value, key) {
								// 	if (key.indexOf('priceId') < 0)
								// 		tablePrice[key] = (value == 0 ? '-' : value);
								// });
								tablePrice.price = ((typeof tablePrice.price == 'undefined' || tablePrice.price == 0) ? '-' : tablePrice.price);
							}
						}
					}
				});
			}
		}

		//活动详细开关
		$scope.toogleActiveDetail = function(timepart) {
			timepart.isopen = !timepart.isopen;
		}

		// 切换特殊日期
		$scope.switchSpecDate = function(i) {
			$scope.statuStore.currSpecExpenplanDateIndex = i;
		}

		// 弹窗-新增平日计费方案
		$scope.showAdd = function(modalCache) {
			$scope.getBoxTypeList(function() {
				if (!$scope.statuStore.expenplanTypeIndex) {
					// 平日计费方案
					$mdDialog.show({
						controller: ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'CONSTANT', 'parentScope', 'boxTypeList', 'modalCache', editController],
						templateUrl: 'tmpl/setting/addExpenplanSpec.tmpl.html',
						parent: angular.element(document.body),
						locals: {
							parentScope: $scope,
							boxTypeList: $scope.boxTypeList,
							modalCache: modalCache
						},
						clickOutsideToClose: true
					}).then(function() {}, function() {});
				} else {
					// 特殊日计费方案
				}
			});
		}

		var editController = function($scope, $rootScope, $mdDialog, $mdToast, CONSTANT, parentScope, boxTypeList, modalCache) {
			var hoursArr = [];
			for (var i = 0; i < 24; i++) {
				if (i < 10) {
					hoursArr.push('0' + i);
				} else {
					hoursArr.push(i.toString());
				}
			}

			$scope.numberPattern = /^\d+$/;
			if (modalCache == null) {
				$scope.modalCache = {
					data: {
						shopId: $rootScope.userInfo.shopId,
						activeCreate: {
							activeName: '',
							activeInfo: '',
							activeDetail: '',
							activeType: 'date'
						},
						timePartCreate: {
							timeStart: '',
							timeEnd: '',
							timeEndFact: '',
							count: ''
						},
						priceList: []
					},
					renderObj: {
						stepIndex: 1,
						weekdays: ['一', '二', '三', '四', '五', '六', '日'],
						dates: [],
						hours: hoursArr
					},
					helperObj: {
						timeStartH: '00',
						timeStartM: '00',
						timeEndH: '00',
						timeEndM: '00',
						timeEndFactH: '00',
						timeEndFactM: '00'
					}
				}
			} else {
				$scope.modalCache = modalCache;
			}

			$scope.boxTypeList = boxTypeList;
			// 第一次弹出（区别于选择餐点完毕后返回）弹窗
			if ($scope.modalCache.data.priceList.length === 0) {
				for (var i = 0; i < boxTypeList.length; i++) {
					$scope.modalCache.data.priceList.push({
						tableTypeId: boxTypeList[i].id,
						foodList: [],
						priceDetailList: []
					});
				}
			}

			// $scope.boxTypeList = boxTypeList;

			$scope.toStepFst = function() {
				$scope.modalCache.renderObj.stepIndex = 1;
			}
			$scope.toStepSec = function() {
				if (angular.equals({}, $scope.inputForm.$error)) {
					$scope.modalCache.renderObj.stepIndex = 2;
				} else {
					angular.forEach($scope.inputForm.$error.required, function(field) {
						field.$setDirty();
					});
				}
			}
			$scope.toStepThi = function() {
				if (angular.equals({}, $scope.inputForm.$error)) {
					if ($scope.modalCache.renderObj.dates.length > 0)
						$scope.modalCache.renderObj.stepIndex = 3;
				} else {
					angular.forEach($scope.inputForm.$error.required, function(field) {
						field.$setDirty();
					});
				}
			}

			$scope.toNextStep = function() {
				if ($scope.modalCache.renderObj.stepIndex == 1)
					$scope.toStepSec();
				else if ($scope.modalCache.renderObj.stepIndex == 2)
					$scope.toStepThi();
			}

			// 添加特殊日期
			$scope.addDate = function() {
				$scope.modalCache.renderObj.dates.push({
					date: moment().toDate(),
					dateStr: moment().format('MM.DD')
				});
				var priceList = $scope.modalCache.data.priceList;
				for (var i = 0; i < priceList.length; i++) {
					priceList[i].priceDetailList.push({
						day: moment().format('YYYY-MM-DD'),
						price: ''
					});
				}
			}

			// 删除特殊日期
			$scope.deleteDate = function(index) {
				$scope.modalCache.renderObj.dates.splice(index, 1);
				var priceList = $scope.modalCache.data.priceList;
				for (var i = 0; i < priceList.length; i++) {
					priceList[i].priceDetailList.splice(index, 1);
				}
			}

			// 修改日期
			$scope.changeDate = function(index) {
				var date = $scope.modalCache.renderObj.dates[index].date;
				$scope.modalCache.renderObj.dates[index].dateStr = moment(date).format('MM.DD')
				var priceList = $scope.modalCache.data.priceList;
				for (var i = 0; i < priceList.length; i++) {
					priceList[i].priceDetailList[index].day = moment(date).format('YYYY-MM-DD');
				}
			}

			// 餐点选择弹窗
			$scope.addMeal = function(i) {
				var modalCache = null;
				var priceObj = $scope.modalCache.data.priceList[i];

				// 如果满足条件，则当前操作为修改餐点
				if (priceObj.foodList.length > 0) {
					modalCache = {
						data: {
							tableTypeId: priceObj.tableTypeId,
							foodList: priceObj.foodList
						},
						renderObj: {
							mealCateIndex: 0,
							// 餐点选择弹窗下方，已选中餐点列表中餐点的name
							selectedMealNameList: priceObj.selectedMealNameList
						}
					}
				}

				$mdDialog.show({
					controller: ['$scope', '$rootScope', '$mdDialog', '$mdToast', 'CONSTANT', 'tableTypeId', 'prevModalCache', 'parentScope', 'modalCache', mealPickerController],
					templateUrl: 'tmpl/setting/expenplan-mealPicker.tmpl.html',
					parent: angular.element(document.body),
					locals: {
						tableTypeId: $scope.boxTypeList[i].id,
						prevModalCache: angular.copy($scope.modalCache),
						parentScope: parentScope,
						modalCache: modalCache
					},
					clickOutsideToClose: true
				}).then(function() {}, function() {
					parentScope.showAdd($scope.modalCache);
				});
			}

			// 保存计费方案
			$scope.save = function() {
				var req = angular.copy($scope.modalCache.data);
				for (var i = 0; i < req.priceList.length; i++) {
					delete req.priceList[i].foodStr;;
					delete req.priceList[i].selectedMealNameList;
					for (var j = 0; j < req.priceList[i].priceDetailList.length; j++) {
						var obj = req.priceList[i].priceDetailList[j];
						if (obj.price === '')
							obj.price = 0;
					}
				}
				var reqStr = JSON.stringify(angular.fromJson(req));
				$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.SAVE_SPEC + '?actCreateStr=' + reqStr).success(function(data) {
					if (data.code === 0) {
						parentScope.showSuccess();
					} else {
						$mdToast.show(
							$mdToast.simple()
							.content(data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
					}
				});
			}

			// 餐点选择弹窗Controller
			var mealPickerController = function($scope, $rootScope, $mdDialog, $mdToast, CONSTANT, tableTypeId, prevModalCache, parentScope, modalCache) {
				$scope.mealCateList = angular.copy(CONSTANT.MEALCATE);
				if (modalCache == null) {
					$scope.modalCache = {
						data: {
							tableTypeId: tableTypeId,
							foodList: []
						},
						renderObj: {
							mealCateIndex: 0,
							// 餐点选择弹窗下方，已选中餐点列表中餐点的name
							selectedMealNameList: []
						}
					}
				} else {
					$scope.modalCache = modalCache;
				}

				$scope.loadMealList = function() {
					if ($scope.mealCateList[$scope.modalCache.renderObj.mealCateIndex].mealList === undefined) {
						$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.LIST + '?shopId=' + $rootScope.userInfo.shopId + '&cateId=' + ($scope.modalCache.renderObj.mealCateIndex + 1)).success(function(data) {
							var list = data.data.result;
							for (var i = 0; i < $scope.modalCache.data.foodList.length; i++) {
								for (var j = 0; j < list.length; j++) {
									var meal = list[j];
									if (meal.fId == $scope.modalCache.data.foodList[i].foodId) {
										meal.checked = true;
										// $scope.modalCache.renderObj.selectedMealNameList.push(meal.fName);
										break;
									}
								}
							}
							$scope.mealCateList[$scope.modalCache.renderObj.mealCateIndex].mealList = list;
						});
					}
				};

				$scope.selectMeal = function(meal) {
					if (meal.checked === undefined || !meal.checked) {
						meal.checked = true;
						$scope.modalCache.data.foodList.push({
							foodId: meal.fId,
							count: 1
						});
						$scope.modalCache.renderObj.selectedMealNameList.push(meal.fName);
					} else {
						var i = UTILITIES.findIndex($scope.modalCache.data.foodList, 'foodId', meal.fId);
						delete meal.checked;
						// $scope.modalCache.data.foodList = $scope.modalCache.data.foodList.filter(function(obj) {
						// 	return obj.fId !== meal.foodId;
						// });
						$scope.modalCache.data.foodList.splice(i, 1);
						$scope.modalCache.renderObj.selectedMealNameList.splice(i, 1);
					}
				}

				$scope.increaseCount = function(meal) {
					meal.count++;
				}

				$scope.decreaseCount = function(meal, i) {
					if (meal.count > 1)
						meal.count--;
				}

				// 保存选择餐点，并关闭餐点弹窗
				$scope.saveSelectedMeals = function() {
					// 餐点名称，描述性字符串
					var foodStr = '';
					for (var i = 0; i < $scope.modalCache.data.foodList.length; i++) {
						if (i == 0) {
							foodStr += ($scope.modalCache.renderObj.selectedMealNameList[i]) + '×' + $scope.modalCache.data.foodList[i].count;
						} else {
							foodStr += '、' + $scope.modalCache.renderObj.selectedMealNameList[i] + '×' + $scope.modalCache.data.foodList[i].count;
						}
					}

					var priceObject = UTILITIES.findElement(prevModalCache.data.priceList, 'tableTypeId', tableTypeId);
					priceObject.foodList = $scope.modalCache.data.foodList;
					if ($scope.modalCache.data.foodList.length === 0)
						delete priceObject.foodStr;
					else {
						priceObject.foodStr = foodStr;
						priceObject.selectedMealNameList = $scope.modalCache.renderObj.selectedMealNameList;
					}

					parentScope.showAdd(prevModalCache);
				}

				$scope.loadMealList();

				$scope.$watch(function() {
					return $scope.modalCache.renderObj.mealCateIndex;
				}, function(a, b) {
					$scope.loadMealList();
				});
			}

			// 时间输入框监听
			$scope.$watch(function() {
				return $scope.modalCache.helperObj;
			}, function(a, b) {
				$scope.modalCache.data.timePartCreate.timeStart = (a.timeStartH != undefined && a.timeStartM != undefined && a.timeStartH != '' && a.timeStartM != '') ? (a.timeStartH + ':' + a.timeStartM) : '';
				$scope.modalCache.data.timePartCreate.timeEnd = (a.timeEndH != undefined && a.timeEndM != undefined && a.timeEndH != '' && a.timeEndM != '') ? (a.timeEndH + ':' + a.timeEndM) : '';
				$scope.modalCache.data.timePartCreate.timeEndFact = (a.timeEndFactH != undefined && a.timeEndFactM != undefined && a.timeEndFactH != '' && a.timeEndFactM != '') ? (a.timeEndFactH + ':' + a.timeEndFactM) : '';
			}, true);
		}

		// 创建成功dialog
		$scope.showSuccess = function() {
			$mdDialog.show({
				controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
					$scope.complete = function() {
						$mdDialog.cancel();
					}
				}],
				templateUrl: 'tmpl/setting/addExpenplanSuccess.tmpl.html',
				parent: angular.element(document.body),
				clickOutsideToClose: true
			}).then(function() {
				$scope.loadActiveDateList();
			}, function() {
				$scope.loadActiveDateList();
			});
		}

		// 获取包厢类型，请求成功后回调
		$scope.getBoxTypeList = function(callback) {
			if (typeof($scope.boxTypeList) == 'undefined') {
				$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTYPE.LIST + '?shopId=' + $scope.userInfo.shopId).success(function(response) {
					console.log(response);
					$scope.boxTypeList = response.data;
					callback();
				});
			} else {
				callback();
			}
		};

		// 删除
		$scope.deleteItem = function(ev, id) {
			var confirm = $mdDialog.confirm({
				textContent: '确认删除？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.DELETE + '?activeId=' + id + '&shopId=' + $scope.userInfo.shopId + '&date=' + $scope.activeDateList[$scope.statuStore.currSpecExpenplanDateIndex]).success(function(data) {
					if (data.data.isSuccess) {
						$scope.loadActiveDateList();
					}
					$mdToast.show(
						$mdToast.simple()
						.content(data.data.msg)
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
				});
			}, function() {});
		}

		// 启用/禁用
		$scope.switchEnable = function(ev, obj) {
			var state = obj.disable ? {
				type: 2,
				content: '确认启用？'
			} : {
				type: 1,
				content: '确认禁用？'
			};
			var confirm = $mdDialog.confirm({
				textContent: state.content,
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.ENABLE_SWITCH + '?activeId=' + obj.activeId + '&shopId=' + $scope.userInfo.shopId + '&type=' + state.type).success(function(data) {
					$mdToast.show(
						$mdToast.simple()
						.content(data.msg)
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
					if (data.code == 0) {
						obj.disable = !obj.disable;
					}
				});
			}, function() {});
		}

		$scope.focusPrice = function(e, obj) {
			e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
			if (!obj.priceId) {
				$mdToast.show(
					$mdToast.simple()
					.content('旧版数据不兼容咯，想修改价格请重建活动。')
					.position(UTILITIES.getToastPosition())
					.hideDelay(5000)
				);
			} else {
				if (obj.price === '-') {
					obj.price = '';
				}
			}
		}

		// 保存单价
		$scope.savePrice = function(priceId, e, obj) {
			var val = e.currentTarget.value.trim();

			if (val === '' || val == '0' || val === '-') {
				val = 0;
			}
			// if (val !== '-') {
			if ((!isNaN(parseFloat(val)) && isFinite(val)) || val === '') {
				$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.UPDATE_PRICE + '?priceId=' + priceId + '&priceValue=' + val + '&shopId=' + $scope.userInfo.shopId).success(function(data) {
					if (!data.code) {
						if (val === '' || val == '0' || val === '-') {
							obj.price = '-';
							// e.currentTarget.value = '-';
						}
					} else {
						e.currentTarget.focus();
					}
					$mdToast.show(
						$mdToast.simple()
						.content(data.msg)
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
				});
			} else {
				$mdToast.show(
					$mdToast.simple()
					.content('请输入正确的价格')
					.position(UTILITIES.getToastPosition())
					.hideDelay(5000)
				);
				e.currentTarget.focus();
			}
		}

		$scope.$watch(function() {
			return $scope.statuStore.currSpecExpenplanDateIndex
		}, function(a, b) {
			$scope.loadSpecList(a);
		});

		// 在列表中选择餐点
		$scope.updateMeal = function(activeId, tableTypeId) {

			$mdDialog.show({
				controller: ['$scope', '$mdDialog', '$mdToast', 'CONSTANT', 'activeId', 'tableTypeId', 'parentScope', function($scope, $mdDialog, $mdToast, CONSTANT, activeId, tableTypeId, parentScope) {
					$scope.mealCateList = angular.copy(CONSTANT.MEALCATE);
					$scope.modalCache = {
						data: {
							shopId: parentScope.userInfo.shopId,
							activeId: activeId,
							tableTypeId: tableTypeId,
							foodList: []
						},
						renderObj: {
							mealCateIndex: 0,
							// 餐点选择弹窗下方，已选中餐点列表中餐点的name
							selectedMealNameList: []
						}
					}

					$scope.loadMealList = function() {
						if ($scope.mealCateList[$scope.modalCache.renderObj.mealCateIndex].mealList === undefined) {
							$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.LIST + '?shopId=' + parentScope.userInfo.shopId + '&cateId=' + ($scope.modalCache.renderObj.mealCateIndex + 1)).success(function(data) {
								var list = data.data.result;
								for (var i = 0; i < $scope.modalCache.data.foodList.length; i++) {
									for (var j = 0; j < list.length; j++) {
										var meal = list[j];
										if (meal.fId == $scope.modalCache.data.foodList[i].foodId) {
											meal.checked = true;
											break;
										}
									}
								}
								$scope.mealCateList[$scope.modalCache.renderObj.mealCateIndex].mealList = list;
							});
						}
					};

					$scope.selectMeal = function(meal) {
						if (meal.checked === undefined || !meal.checked) {
							meal.checked = true;
							$scope.modalCache.data.foodList.push({
								foodId: meal.fId,
								count: 1
							});
							$scope.modalCache.renderObj.selectedMealNameList.push(meal.fName);
						} else {
							var i = UTILITIES.findIndex($scope.modalCache.data.foodList, 'foodId', meal.fId);
							delete meal.checked;
							$scope.modalCache.data.foodList.splice(i, 1);
							$scope.modalCache.renderObj.selectedMealNameList.splice(i, 1);
						}
					}

					$scope.increaseCount = function(meal) {
						meal.count++;
					}

					$scope.decreaseCount = function(meal, i) {
						if (meal.count > 1)
							meal.count--;
					}

					// 保存选择餐点，并关闭餐点弹窗
					$scope.saveSelectedMeals = function() {
						$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.UPDATE_MEAL + '?updateStr=' + JSON.stringify(angular.fromJson($scope.modalCache.data))).success(function(data) {
							$mdToast.show(
								$mdToast.simple()
								.content(data.msg)
								.position(UTILITIES.getToastPosition())
								.hideDelay(5000)
							);
							if (data.code === 0) {
								parentScope.loadSpecList(parentScope.statuStore.currSpecExpenplanDateIndex);
								$mdDialog.cancel();
							}
						});
					}

					$scope.loadMealList();

					$scope.$watch(function() {
						return $scope.modalCache.renderObj.mealCateIndex;
					}, function(a, b) {
						$scope.loadMealList();
					});
				}],
				templateUrl: 'tmpl/setting/expenplan-mealPicker.tmpl.html',
				parent: angular.element(document.body),
				locals: {
					activeId: activeId,
					tableTypeId: tableTypeId,
					parentScope: $scope
				},
				clickOutsideToClose: true
			}).then(function() {}, function() {});
		}

		// 开始编辑计费方案基本信息
		$scope.toogleUpdateBaseInfo = function(propName, planObj) {
			planObj[propName + 'Edit'] = true;
		}

		// 修改计费方案基本信息
		$scope.updateBaseInfo = function(e, propName, planObj) {
			var val = e.currentTarget.value;
			$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.UPDATE_BASE_INFO + '?modifyType=' + propName + '&value=' + val + '&activeId=' + planObj.activeId + '&shopId=' + $scope.userInfo.shopId).success(function(data) {
				console.log(data);
				$mdToast.show(
					$mdToast.simple()
					.content(data.msg)
					.position(UTILITIES.getToastPosition())
					.hideDelay(5000)
				);
				if (data.code === 0) {
					planObj[propName] = val;
				}
				delete planObj[propName + 'Edit'];
			});
		}

		// 修改时间段
		$scope.toggleUpdateTimepart = function(timepart) {
			timepart.timepartEdit = true;
		}

		$scope.updateTimepart = function(e, propName, timepart, activeId) {
			var val = e.currentTarget.value;
			$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.UPDATE_TIME_PART + '?modifyType=' + propName + '&value=' + val + '&activeId=' + activeId + '&timepartId=' + timepart.timepartId + '&shopId=' + $scope.userInfo.shopId).success(function(data) {
				console.log(data);
				$mdToast.show(
					$mdToast.simple()
					.content(data.msg)
					.position(UTILITIES.getToastPosition())
					.hideDelay(5000)
				);
				if (data.code === 0) {
					if (propName === 'timeStart') {
						timepart.timepart = val + '-' + timepart.timepart.split('-')[1];
					} else {
						timepart.timepart = timepart.timepart.split('-')[0] + '-' + val;
					}
				}
				if (propName === 'timeStart') {
					delete timepart.timepartEditS;
				} else {
					delete timepart.timepartEditE;
				}
			});
		}

		// 修改时间
		$scope.toggleUpdateTime = function(propName, timepart) {
			timepart[propName + 'Edit'] = true;
		}

		$scope.updateTime = function(e, propName, timepart, activeId, realName) {
			var val = e.currentTarget.value;
			$http.post(CONSTANT.SERVICE.SETTING.EXPENPLANSETTING.UPDATE_TIME_PART + '?modifyType=' + (realName != undefined ? realName : propName) + '&value=' + val + '&activeId=' + activeId + '&timepartId=' + timepart.timepartId + '&shopId=' + $scope.userInfo.shopId).success(function(data) {
				console.log(data);
				$mdToast.show(
					$mdToast.simple()
					.content(data.msg)
					.position(UTILITIES.getToastPosition())
					.hideDelay(5000)
				);
				if (data.code === 0) {
					timepart[propName] = val;
				}
				delete timepart[propName + 'Edit'];
			});
		}

		$scope.parseInt = parseInt;

		$scope.loadActiveDateList();
	}];
});