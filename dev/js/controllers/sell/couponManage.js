define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
	'use strict';
	return ['$scope', '$state', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $state, $http, $mdDialog, $mdToast, CONSTANT) {
		$scope.moment = moment;
		$scope.findElement = UTILITIES.findElement;

		$scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

		$scope.statuStore = {
			couponStatusIndex: 1,
			constants: {
				range: [{
					code: 1,
					name: '预订+点餐'
				}, {
					code: 2,
					name: '仅预订'
				}, {
					code: 3,
					name: '仅点餐'
				}],
				sendState: [{
					code: 1,
					name: '待发放'
				}, {
					code: 2,
					name: '发放中'
				}, {
					code: 3,
					name: '发放中止'
				}, {
					code: 4,
					name: '发放结束'
				}],
				triggerType: [{
					code: 1,
					name: '消费',
					icon: '&#xe61b;'
				}, {
					code: 2,
					name: '分享',
					icon: '&#xe618;'
				}, {
					code: 3,
					name: '新人',
					icon: '&#xe619;'
				}, {
					code: 4,
					name: '活动',
					icon: '&#xe61a;'
				}]
			}
		};

		$scope.loadCouponList = function() {
			$http.post(CONSTANT.SERVICE.SELL.COUPONMANAGE.LIST + '?searchType=' + $scope.statuStore.couponStatusIndex).success(function(response) {
				$scope.couponList = response.data.couponList;
				$scope.couponDetailList = response.data.couponDetailList;
			});
		}

		// 弹窗-新增红包
		$scope.showAdd = function(modalCache) {

			$mdDialog.show({
				controller: editController,
				templateUrl: 'tmpl/sell/addCoupon.tmpl.html',
				parent: angular.element(document.body),
				locals: {
					parentScope: $scope,
					// boxTypeList: $scope.boxTypeList,
					modalCache: modalCache
				},
				clickOutsideToClose: true
			}).then(function() {}, function() {});

		}

		// 启用&禁用
		$scope.switchEnable = function(coupon, ev) {
			var confirm = $mdDialog.confirm({
				textContent: '确定' + (coupon.state == 2 ? '启用' : '停用') + '该红包？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(CONSTANT.SERVICE.SELL.COUPONMANAGE.ENABLE_SWITCH + '?couponId=' + coupon.id + '&sendState=' + (coupon.sendState == 3 ? 2 : 3)).success(function(data) {
					if (data.code == 0) {
						$scope.loadCouponList();
					}
					$mdToast.show(
						$mdToast.simple()
						.content(data.msg)
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
				});
			}, function() {});
		}

		// 红包详情
		$scope.couponDetail = function(i) {
			var coupon = $scope.couponList[i];
			var couponDetail = $scope.couponDetailList[i];
			$http.post(CONSTANT.SERVICE.SELL.COUPONMANAGE.DETAIL + '?couponId=' + coupon.id).success(function(data) {
				var data = data.data;
				data.sendCount = couponDetail.sendCount;
				data.getCount = couponDetail.getCount;
				data.useCount = couponDetail.useCount;
				data.state = coupon.state;

				console.log(data);

				var modalCache = {
					data: data,
					renderObj: {
						// 1新建时预览，2列表点击预览
						previewStatus: 0
					}
				}

				// 预览
				$mdDialog.show({
					controller: ['$scope', 'modalCache', 'constants', 'parentScope', function($scope, modalCache, constants, parentScope) {
						$scope.modalCache = modalCache;
						$scope.constants = constants;
						// 计算抵价红包总价格
						$scope.calcTotalPrice = function(arr) {
							var price = 0;
							for (var i = 0; i < arr.length; i++) {
								price += (arr[i].ticketValue * arr[i].ticketCount);
							}
							return price;
						}

						// 计算兑换红包总价格
						$scope.calcTotalPriceExchange = function(arr) {
							var price = 0;
							for (var i = 0; i < arr.length; i++) {
								// price += arr[i].foodPrice;
								price = +(price + arr[i].foodPrice).toFixed(12)
							}
							return price;
						}

						$scope.replaceAll = function(str, sptr, sptr1) {
							while (str.indexOf(sptr) >= 0) {
								str = str.replace(sptr, sptr1);
							}
							return str;
						}

						$scope.copyToClipboard = function(str) {
							window.prompt("按Ctrl+C复制", str);
						}
					}],
					templateUrl: 'tmpl/sell/previewCoupon.tmpl.html',
					parent: angular.element(document.body),
					locals: {
						modalCache: modalCache,
						constants: $scope.statuStore.constants,
						parentScope: $scope.parentScope
					},
					clickOutsideToClose: true
				}).then(function() {}, function() {});
			});
		}

		var editController = function($scope, $rootScope, $mdDialog, $mdToast, CONSTANT, parentScope, modalCache) {
			$scope.findElement = UTILITIES.findElement;
			$scope.parentScope = parentScope;

			$scope.today = new Date();
			$scope.yesterday = moment($scope.today).add(-1, 'days').toDate();
			$scope.nextMonth = moment($scope.today).add(30, 'days').toDate();

			// $scope.shopList = UTILITIES.sessionUtilities().getShopList();

			if (modalCache == null) {
				$scope.modalCache = {
					data: {
						//新增红包字段结构体
						cName: '',
						cType: 1,
						sendShopIdList: [],
						useShopIdList: [],
						sendRange: 2,
						useRange: 2,
						triggerType: 1,
						sendTimeStart: '',
						sendTimeEnd: '',
						useTimeStart: '',
						useTimeEnd: '',
						// ticketType: 1,
						isRepeatGet: 1,
						getExceedValue: 0,
						brandName: '',
						publicName: '',
						message: '',
						shareCount: 1,
						couponDetailList: [{
							ticketValue: 0,
							ticketCount: 0,
							useExceedValue: 0
						}],
						couponFoodList: []
					},
					renderObj: {
						stepIndex: 1,
						shopList: UTILITIES.sessionUtilities().getShopList(),
						// 1新建时预览，2列表点击预览
						previewStatus: 1,
					},
					helperObj: {
						sendTimeStart: $scope.today,
						sendTimeEnd: $scope.nextMonth,
						useTimeStart: $scope.today,
						useTimeEnd: $scope.nextMonth,
						sendRangeArr: [2],
						useRangeArr: [2],
						sendShopNameList: [],
						useShopNameList: [],
						// 抵价券总个数
						couponPriceCount: 0,
						couponPriceTotal: 0,
						// 抵价券
						couponDetailList1: [{
							ticketValue: '',
							ticketCount: '',
							useExceedValue: ''
						}],
						// 兑换券
						couponDetailList2: [{
							ticketValue: 0,
							ticketCount: 0,
							useExceedValue: 0
						}]
					}
				}

				$scope.modalCache.helperObj.useShopNameList.push($scope.modalCache.renderObj.shopList[0].shopName);

				$scope.modalCache.data.sendShopIdList.push($scope.modalCache.renderObj.shopList[0].shopId);
				$scope.modalCache.helperObj.sendShopNameList.push($scope.modalCache.renderObj.shopList[0].shopName);

				$scope.modalCache.data.useShopIdList.push($scope.modalCache.renderObj.shopList[0].shopId);
				$scope.modalCache.data.couponFoodList.push({
					shopId: $scope.modalCache.renderObj.shopList[0].shopId,
					cateId: 0,
					foodId: 0,
					foodName: '',
					foodPrice: 0
				});

			} else {
				$scope.modalCache = modalCache;
			}

			$scope.toStepFst = function() {
				$scope.modalCache.renderObj.stepIndex = 1;
			}
			$scope.toStepSec = function() {
				if (angular.equals({}, $scope.inputForm1.$error)) {
					$scope.modalCache.renderObj.stepIndex = 2;
				} else {
					angular.forEach($scope.inputForm1.$error.required, function(field) {
						field.$setDirty();
					});
				}
			}
			$scope.toStepThi = function() {
				if (angular.equals({}, $scope.inputForm1.$error)) {
					if (angular.equals({}, $scope.inputForm2.$error)) {
						$scope.modalCache.renderObj.stepIndex = 3;
					} else {
						angular.forEach($scope.inputForm2.$error.required, function(field) {
							field.$setDirty();
						});
					}
				} else {
					angular.forEach($scope.inputForm1.$error.required, function(field) {
						field.$setDirty();
					});
				}
			}
			$scope.toStepFor = function() {
				if (angular.equals({}, $scope.inputForm1.$error)) {
					if (angular.equals({}, $scope.inputForm2.$error)) {
						if (angular.equals({}, $scope.inputForm3.$error)) {
							$scope.modalCache.renderObj.stepIndex = 4;
						} else {
							angular.forEach($scope.inputForm2.$error.required, function(field) {
								field.$setDirty();
							});
						}
					} else {
						angular.forEach($scope.inputForm2.$error.required, function(field) {
							field.$setDirty();
						});
					}
				} else {
					angular.forEach($scope.inputForm1.$error.required, function(field) {
						field.$setDirty();
					});
				}
			}

			// 下一步
			$scope.toNext = function() {
				if ($scope.modalCache.renderObj.stepIndex === 1) {
					$scope.toStepSec();
				} else if ($scope.modalCache.renderObj.stepIndex === 2) {
					$scope.toStepThi();
				} else if ($scope.modalCache.renderObj.stepIndex === 3) {
					$scope.toStepFor();
				} else {
					if (angular.equals({}, $scope.inputForm4.$error)) {
						console.log(JSON.stringify($scope.modalCache));
						var modalCache = angular.copy($scope.modalCache);
						modalCache.data.couponDetailList = modalCache.helperObj['couponDetailList' + modalCache.data.cType];
						// 预览
						$mdDialog.show({
							controller: ['$scope', 'modalCacheBack', 'modalCache', 'constants', 'parentScope', function($scope, modalCacheBack, modalCache, constants, parentScope) {
								$scope.modalCache = modalCache;
								$scope.constants = constants;
								// 计算抵价红包总价格
								$scope.calcTotalPrice = function(arr) {
									var price = 0;
									for (var i = 0; i < arr.length; i++) {
										price += (arr[i].ticketValue * arr[i].ticketCount);
									}
									return price;
								}

								// 计算兑换红包总价格
								$scope.calcTotalPriceExchange = function(arr) {
									var price = 0;
									for (var i = 0; i < arr.length; i++) {
										// price += arr[i].foodPrice;
										price = +(price + arr[i].foodPrice).toFixed(12)
									}
									return price;
								}

								$scope.backToEdit = function() {
									console.log(JSON.stringify(modalCacheBack));
									parentScope.showAdd(modalCacheBack);
								}

								$scope.saveCoupon = function() {
									$scope.modalCache.renderObj.submitted = true;

									var saveJson = angular.copy($scope.modalCache.data);
									saveJson.sendTimeStart = saveJson.sendTimeStart + ' 00:00:00';
									saveJson.sendTimeEnd = saveJson.sendTimeEnd + ' 23:59:59';
									saveJson.useTimeStart = saveJson.useTimeStart + ' 00:00:00';
									saveJson.useTimeEnd = saveJson.useTimeEnd + ' 23:59:59';
									$http.post(CONSTANT.SERVICE.SELL.COUPONMANAGE.SAVE + '?params=' + JSON.stringify(angular.fromJson(saveJson))).success(function(data) {
										console.log(data);
										if (data.code === 0) {
											$mdDialog.show({
												controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
													$scope.complete = function() {
														$mdDialog.cancel();
													}
												}],
												templateUrl: 'tmpl/sell/addCouponSuccess.tmpl.html',
												parent: angular.element(document.body),
												clickOutsideToClose: true
											}).then(function() {
												parentScope.loadCouponList();
											}, function() {
												parentScope.loadCouponList();
											});
										} else {
											$scope.modalCache.renderObj.submitted = false;
											$mdToast.show(
												$mdToast.simple()
												.content(data.msg)
												.position(UTILITIES.getToastPosition())
												.hideDelay(5000)
											);
										}
									});
								}

								$scope.replaceAll = function(str, sptr, sptr1) {
									while (str.indexOf(sptr) >= 0) {
										str = str.replace(sptr, sptr1);
									}
									return str;
								}
							}],
							templateUrl: 'tmpl/sell/previewCoupon.tmpl.html',
							parent: angular.element(document.body),
							locals: {
								modalCacheBack: $scope.modalCache,
								modalCache: modalCache,
								constants: parentScope.statuStore.constants,
								parentScope: $scope.parentScope
							},
							clickOutsideToClose: true
						}).then(function() {}, function() {});
					} else {
						angular.forEach($scope.inputForm4.$error.required, function(field) {
							field.$setDirty();
						});
					}
				}
			}

			/*STEP2 添加发放条件*/
			// 监听发放/使用时间
			$scope.$watch('[modalCache.helperObj.sendTimeStart,modalCache.helperObj.sendTimeEnd,modalCache.helperObj.useTimeStart,modalCache.helperObj.useTimeEnd]', function(a, b) {
				console.log(a, b);
				$scope.modalCache.data.sendTimeStart = moment(a[0]).format('YYYY-MM-DD');
				$scope.modalCache.data.sendTimeEnd = moment(a[1]).format('YYYY-MM-DD');
				$scope.modalCache.data.useTimeStart = moment(a[2]).format('YYYY-MM-DD');
				$scope.modalCache.data.useTimeEnd = moment(a[3]).format('YYYY-MM-DD');
			}, true);

			// 通过md-checkbox选店铺时判断当前是否选中
			$scope.isShopSelected = function(selectedIdArr, shopId) {
				var i = selectedIdArr.indexOf(shopId);
				return !(i === -1);
			}

			// 勾选店铺处理选中逻辑
			$scope.toogleSendShopSelection = function(selectedIdArr, shopId, shopName) {
				var i = selectedIdArr.indexOf(shopId);
				if (i === -1) {
					selectedIdArr.push(shopId);
					$scope.modalCache.helperObj.sendShopNameList.push(shopName);
				} else {
					selectedIdArr.splice(i, 1);
					$scope.modalCache.helperObj.sendShopNameList.splice(i, 1);
				}
			}
			$scope.toogleUseShopSelection = function(selectedIdArr, shopId, shopName) {
				var i = selectedIdArr.indexOf(shopId);
				$scope.modalCache.helperObj.useShopNameList.push(shopName);
				if (i === -1) {
					selectedIdArr.push(shopId);
					$scope.modalCache.data.couponFoodList.push({
						shopId: shopId,
						cateId: 0,
						foodId: 0,
						foodName: '',
						foodPrice: 0
					});
				} else {
					selectedIdArr.splice(i, 1);
					$scope.modalCache.helperObj.useShopNameList.splice(i, 1);
					$scope.modalCache.data.couponFoodList.splice(i, 1);
				}
			}

			// 发放/使用范围[checkbox - array]转换成[radio - flag]
			$scope.checkRange = function(flag, val) {
				var helperArr, realValName;
				if (!flag) {
					helperArr = $scope.modalCache.helperObj.sendRangeArr;
					realValName = 'sendRange';
				} else {
					helperArr = $scope.modalCache.helperObj.useRangeArr;
					realValName = 'useRange';
				}

				var i = helperArr.indexOf(val);
				if (i === -1) {
					helperArr.push(val);
				} else {
					helperArr.splice(i, 1);
				}

				if (helperArr.length === 1) {
					$scope.modalCache.data[realValName] = helperArr[0];
				} else if (helperArr.length === 2) {
					$scope.modalCache.data[realValName] = 1;
				} else {
					$scope.modalCache.data[realValName] = 0;
				}
			}

			/*STEP4添加红包*/
			$scope.calc = function() {

			}

			$scope.addCoupon = function() {
				$scope.modalCache.helperObj.couponDetailList1.push({
					ticketValue: '',
					ticketCount: '',
					useExceedValue: ''
				});
			}

			$scope.removeCoupon = function(i) {
				$scope.modalCache.helperObj.couponDetailList1.splice(i, 1);
			}

			// 选择餐点model
			$scope.showMealPicker = function(i) {
				$mdDialog.show({
					controller: ['$scope', '$http', 'CONSTANT', 'parentScope', 'couponShopIndex', 'title', function($scope, $http, CONSTANT, parentScope, couponShopIndex, title) {

						$scope.title = title;

						$scope.topScope = parentScope.parentScope;

						$scope.mealCateIndex = 0;

						$scope.mealCateList = angular.copy(CONSTANT.MEALCATE);

						// 去掉套餐
						// $scope.mealCateList.splice(0, 1);
						$scope.loadMealList = function(mealCateIndex) {
							$http.post(CONSTANT.SERVICE.SETTING.MEALSETTING.LIST + '?shopId=' + $scope.topScope.userInfo.shopId + '&cateId=' + (mealCateIndex + 1)).success(function(data) {
								$scope.mealCateList[mealCateIndex].mealList = data.data.result;
							});
						};

						$scope.$watch(function() {
							return $scope.mealCateIndex;
						}, function(a, b) {
							if (typeof($scope.mealCateList[a].mealList) === 'undefined') {
								$scope.loadMealList(a);
							}
						});

						// 选中子餐点
						$scope.selectSubMeal = function(meal) {
							parentScope.modalCache.data.couponFoodList[couponShopIndex].foodId = meal.fId;
							parentScope.modalCache.data.couponFoodList[couponShopIndex].cateId = meal.cateId;
							parentScope.modalCache.data.couponFoodList[couponShopIndex].foodName = meal.fName;
							parentScope.modalCache.data.couponFoodList[couponShopIndex].foodPrice = meal.fpPrice;
							$scope.topScope.showAdd(parentScope.modalCache);
						}
					}],
					templateUrl: 'tmpl/sell/mealpicker.tmpl.html',
					parent: angular.element(document.body),
					locals: {
						parentScope: $scope,
						couponShopIndex: i,
						title: '添加餐点'
					},
					clickOutsideToClose: true
				});
			}

			$scope.$watch(function() {
				return $scope.modalCache.helperObj.couponDetailList1
			}, function(a, b) {
				var price = 0,
					count = 0;
				for (var i = 0; i < a.length; i++) {
					count += parseInt(a[i].ticketCount);
					price += parseInt(a[i].ticketValue) * parseInt(a[i].ticketCount);
				}
				$scope.modalCache.helperObj.couponPriceCount = isNaN(count) ? 0 : count;
				$scope.modalCache.helperObj.couponPriceTotal = isNaN(price) ? 0 : price;
			}, true);
		}

		$scope.$watch('statuStore.couponStatusIndex', function(a, b) {
			$scope.loadCouponList();
		});

		$scope.replaceAll = function(str, sptr, sptr1) {
			while (str.indexOf(sptr) >= 0) {
				str = str.replace(sptr, sptr1);
			}
			return str;
		}

		$scope.loadCouponList();

	}];
});