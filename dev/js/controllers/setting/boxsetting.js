define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $http, $mdDialog, $mdToast, CONSTANT) {
		$scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

		//INIT
		$scope.statuStore = {
			boxThemeAdd: false
		};
		$scope.boxThemeObj = {
			styleName: '',
			shopId: $scope.userInfo.shopId,
			id: 0
		};

		$scope.listBoxType = function() {
			$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTYPE.LIST + '?shopId=' + $scope.userInfo.shopId).success(function(response) {
				console.log(response);
				$scope.boxTypeList = response.data;
			});
		};

		$scope.listBoxTheme = function() {
			$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTHEME.LIST + '?shopId=' + $scope.userInfo.shopId).success(function(response) {
				console.log(response);
				$scope.boxThemeList = response.data;
			});
		};

		$scope.listBoxNumber = function() {
			$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXNUMBER.LIST + '?shopId=' + $scope.userInfo.shopId + '&typeId=0').success(function(response) {
				console.log(response);
				$scope.boxNumberList = response.data;
			});
		};

		//新增包厢类型
		$scope.addBoxType = function(ev) {
			$scope.editBoxType(ev, null);
		}

		// 修改包厢类型
		$scope.updateBoxType = function(ev, i) {
			var obj = $scope.boxTypeList[i];
			$scope.editBoxTypeUpdate(ev, {
				id: obj.id,
				type: obj.type,
				min: obj.min,
				max: obj.max,
				localTypeId: obj.localTypeId,
				shopId: $scope.userInfo.shopId
			});
		}

		// 新增包厢类型
		$scope.editBoxType = function(ev) {
			$scope.loadBaseBoxType(function() {
				$mdDialog.show({
					controller: function($scope, $mdDialog, parentScope, baseBoxTypeList, shopId) {
						$scope.baseBoxTypeList = baseBoxTypeList;
						$scope.boxTypeObj = {
							shopId: shopId,
							typeList: [{
								tableTypeName: '',
								min: '',
								max: '',
								localTypeId: $scope.baseBoxTypeList[0].id
							}]
						}

						$scope.addBoxType = function() {
							$scope.boxTypeObj.typeList.push({
								tableTypeName: '',
								min: '',
								max: '',
								localTypeId: $scope.baseBoxTypeList[0].id
							});
						}

						$scope.delBoxType = function(i) {
							$scope.boxTypeObj.typeList.splice(i, 1);
						}

						$scope.doSave = function() {
							if (angular.equals({}, $scope.inputForm.$error)) {
								for (var i = 0; i < $scope.boxTypeObj.typeList.length; i++) {
									var obj = $scope.boxTypeObj.typeList[i];
									if (parseInt(obj.min) > parseInt(obj.max) || parseInt(obj.min) === parseInt(obj.max)) {
										$mdToast.show(
											$mdToast.simple()
											.content('推荐的最大人数不能小于或等于最小人数')
											.position(UTILITIES.getToastPosition())
											.hideDelay(5000)
										);
										return;
									}
								}
								$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTYPE.SAVE_BATCH + '?typeCreateStr=' + JSON.stringify(angular.fromJson($scope.boxTypeObj))).success(function(data) {
									$mdToast.show(
										$mdToast.simple()
										.content(data.msg)
										.position(UTILITIES.getToastPosition())
										.hideDelay(5000)
									);
									if (data.code === 0) {
										parentScope.listBoxType();
										parentScope.listBoxNumber();
										$mdDialog.cancel();
									}
								});
							} else {
								angular.forEach($scope.inputForm.$error.required, function(field) {
									field.$setDirty();
								});
							}
						}
					},
					templateUrl: 'tmpl/setting/editboxtype.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					locals: {
						parentScope: $scope,
						baseBoxTypeList: $scope.baseBoxTypeList,
						shopId: $scope.userInfo.shopId
					},
					clickOutsideToClose: true
				}).then(function() {
					// $scope.status = 'You said the information was "' + answer + '".';
				}, function() {
					// $scope.status = 'You cancelled the dialog.';
				});
			});
		};

		// 修改包厢类型
		$scope.editBoxTypeUpdate = function(ev, obj) {
			$scope.loadBaseBoxType(function() {
				$mdDialog.show({
					controller: function($scope, $mdDialog, parentScope, baseBoxTypeList, boxTypeObj, shopId) {
						$scope.baseBoxTypeList = baseBoxTypeList;
						$scope.boxTypeObj = boxTypeObj;

						$scope.doSave = function() {
							if (angular.equals({}, $scope.inputForm.$error)) {
								if (parseInt(obj.min) > parseInt(obj.max) || parseInt(obj.min) === parseInt(obj.max)) {
									$mdToast.show(
										$mdToast.simple()
										.content('推荐的最大人数不能小于或等于最小人数')
										.position(UTILITIES.getToastPosition())
										.hideDelay(5000)
									);
									return;
								}

								$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTYPE.SAVE + UTILITIES.jsonToUrl($scope.boxTypeObj)).success(function(data) {
									$mdToast.show(
										$mdToast.simple()
										.content(data.data.msg)
										.position(UTILITIES.getToastPosition())
										.hideDelay(5000)
									);
									if (data.data.isSuccess) {
										parentScope.listBoxType();
										parentScope.listBoxNumber();
										$mdDialog.cancel();
									}
								});
							}
						}
					},
					templateUrl: 'tmpl/setting/updateboxtype.tmpl.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					locals: {
						parentScope: $scope,
						baseBoxTypeList: $scope.baseBoxTypeList,
						boxTypeObj: obj,
						shopId: $scope.userInfo.shopId
					},
					clickOutsideToClose: true
				}).then(function() {
					// $scope.status = 'You said the information was "' + answer + '".';
				}, function() {
					// $scope.status = 'You cancelled the dialog.';
				});
			});
		};

		//新增包厢主题
		$scope.addBoxTheme = function() {
			$scope.statuStore.boxThemeAdd = true;
		};

		//保存包厢主题
		$scope.saveBoxTheme = function(_id) {
			if (typeof(_id) == 'undefined') {
				//添加
				if ($scope.boxThemeObj.styleName.trim() === '') {
					$scope.statuStore.boxThemeAdd = false;
				} else {
					$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTHEME.SAVE + UTILITIES.jsonToUrl($scope.boxThemeObj)).success(function(response) {
						var data = response.data;
						$mdToast.show(
							$mdToast.simple()
							.content(data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
						if (data.isSuccess) {
							$scope.statuStore.boxThemeAdd = false;
							$scope.boxThemeObj.styleName = '';
							$scope.boxThemeObj.id = 0;
							$scope.listBoxTheme();
						}
					});
				}
			} else {
				//修改
				var obj = UTILITIES.findElement($scope.boxThemeList, 'id', _id);
				if (obj.styleName.trim() === '') {
					$mdToast.show(
						$mdToast.simple()
						.content('包厢主题不能为空，保存失败！')
						.position(UTILITIES.getToastPosition())
						.hideDelay(5000)
					);
					$scope.listBoxTheme();
				} else {
					$scope.boxThemeObj = obj;
					$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTHEME.SAVE + UTILITIES.jsonToUrl($scope.boxThemeObj)).success(function(response) {
						var data = response.data;
						$mdToast.show(
							$mdToast.simple()
							.content(data.msg)
							.position(UTILITIES.getToastPosition())
							.hideDelay(5000)
						);
						if (data.isSuccess) {
							$scope.boxThemeObj.styleName = '';
							$scope.boxThemeObj.id = 0;
							$scope.listBoxTheme();
						}
					});
				}
			}
		};

		//使某条包厢主题进入编辑修改状态
		$scope.updateToogle = function(_id) {
			angular.forEach($scope.boxThemeList, function(value, key) {
				delete value['edit'];
			});
			UTILITIES.findElement($scope.boxThemeList, 'id', _id).edit = true;
		};

		//新增包厢号
		$scope.addBoxNumber = function(ev, typeIndex) {
			var obj = $scope.boxTypeList[typeIndex];
			$scope.editBoxNumber(ev, {
				data: {
					id: 0,
					shopId: $scope.userInfo.shopId,
					styleId: 0,
					tName: '',
					typeId: obj.id
				},
				renderObj: {
					typeName: obj.type,
					isCreate: true
				}
			});
		}

		// 修改包厢号
		$scope.updateBoxNumber = function(ev, boxIndex) {
			var obj = $scope.boxNumberList[boxIndex];
			$scope.editBoxNumber(ev, {
				data: {
					id: obj.id,
					shopId: obj.shopId,
					styleId: obj.styleId,
					tName: obj.tName,
					typeId: obj.typeId
				},
				renderObj: {
					typeName: obj.tType,
					isCreate: false
				}
			});
		}

		$scope.editBoxNumber = function(ev, modalCache) {
			$mdDialog.show({
				controller: function($scope, $http, parentScope, boxThemeList, modalCache) {
					console.log(boxThemeList);
					$scope.boxThemeList = angular.copy(boxThemeList);
					$scope.boxThemeList.unshift({
						id: 0,
						shopId: 90,
						styleName: '无主题'
					});
					$scope.modalCache = modalCache;

					$scope.doSave = function() {
						if (angular.equals({}, $scope.inputForm.$error)) {
							$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BOXNUMBER.SAVE + UTILITIES.jsonToUrl($scope.modalCache.data)).success(function(data) {
								$mdToast.show(
									$mdToast.simple()
									.content(data.data.msg)
									.position(UTILITIES.getToastPosition())
									.hideDelay(5000)
								);
								if (data.data.isSuccess) {
									parentScope.listBoxNumber();
									$mdDialog.cancel();
								}
							});
						} else {
							angular.forEach($scope.inputForm.$error.required, function(field) {
								field.$setDirty();
							});
						}
					}
				},
				templateUrl: 'tmpl/setting/editboxnumber.tmpl.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				locals: {
					parentScope: $scope,
					boxThemeList: $scope.boxThemeList,
					modalCache: modalCache
				},
				clickOutsideToClose: true
			}).then(function() {}, function() {});
		};

		//删除
		$scope.deleteItem = function(ev, flag, id) {
			var URL = [CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTYPE.DEL, CONSTANT.SERVICE.SETTING.BOXSETTING.BOXTHEME.DEL, CONSTANT.SERVICE.SETTING.BOXSETTING.BOXNUMBER.DEL];
			var SUCCESS = [$scope.listBoxType, $scope.listBoxTheme, $scope.listBoxNumber];
			var confirm = $mdDialog.confirm({
				textContent: '确认删除？',
				targetEvent: ev,
				ok: '是',
				cancel: '否'
			});
			$mdDialog.show(confirm).then(function() {
				$http.post(URL[flag] + '?id=' + id).success(function(data) {
					if (data.data.isSuccess) {
						SUCCESS[flag]();
						if (flag == 0) {
							$scope.listBoxNumber();
						}
						$mdToast.show(
							$mdToast.simple()
							.content('删除成功！')
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

		$scope.loadBaseBoxType = function(callback) {
			if (typeof($scope.baseBoxTypeList) == 'undefined') {
				$http.post(CONSTANT.SERVICE.SETTING.BOXSETTING.BASEBOXTYPELIST).success(function(response) {
					console.log(response);
					$scope.baseBoxTypeList = response.data;
					callback();
				});
			} else {
				callback();
			}
		};

		$scope.listBoxType();
		$scope.listBoxTheme();
		$scope.listBoxNumber();
	}];
});