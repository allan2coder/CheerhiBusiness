define(['../js/common/common', '../js/common/constant', '../js/common/utilities', 'moment', 'socket.io'], function(angularAMD, CONSTANT, UTILITIES, moment, io) {
	'use strict';
	var app = angular.module('CheerHiBusiness', ['ui.router', 'ngResource', 'ngMaterial', 'ngFileUpload', 'angular-loading-bar', 'btford.socket-io', 'ngMessages', 'ngAnimate', 'ngSanitize']).constant('CONSTANT', CONSTANT);

	app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$mdThemingProvider', 'cfpLoadingBarProvider', '$mdDateLocaleProvider', function($httpProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, cfpLoadingBarProvider, $mdDateLocaleProvider) {

		// THEME
		$mdThemingProvider.theme('default').primaryPalette('light-blue');

		$stateProvider.state('order', angularAMD.route({
				//订单管理
				url: '/order',
				templateUrl: 'views/order/order.html',
				controllerUrl: '../js/controllers/order/order'
			}))
			.state('order.bookConfirm', angularAMD.route({
				//预订确认
				url: '/book-confirm',
				/*地址栏上显示的地址*/
				templateUrl: 'views/order/book-confirm.html',
				controllerUrl: '../js/controllers/order/bookConfirm'
			}))
			.state('order.foodConfirm', angularAMD.route({
				//点餐确认
				url: '/food-confirm',
				/*地址栏上显示的地址*/
				templateUrl: 'views/order/food-confirm.html',
				controllerUrl: '../js/controllers/order/foodConfirm'
			}))
			.state('order.refund', angularAMD.route({
				//退款退订
				url: '/refund',
				/*地址栏上显示的地址*/
				templateUrl: 'views/order/refund.html',
				controllerUrl: '../js/controllers/order/refund'
			}))
			.state('order.bookState', angularAMD.route({
				//包房预订状态
				url: '/book-state',
				/*地址栏上显示的地址*/
				templateUrl: 'views/order/book-state.html',
				controllerUrl: '../js/controllers/order/bookState'
			}))



		//营销管理
		.state('sell', angularAMD.route({
			url: '/sell',
			templateUrl: 'views/sell/sell.html',
			controllerUrl: '../js/controllers/sell/sell'
		})).state('sell.couponManage', angularAMD.route({
			//红包管理
			url: '/couponManage',
			templateUrl: 'views/sell/couponManage.html',
			controllerUrl: '../js/controllers/sell/couponManage'
		})).state('sell.couponReport', angularAMD.route({
			//红包报表
			url: '/couponReport',
			templateUrl: 'views/sell/couponReport.html',
			controllerUrl: '../js/controllers/sell/couponReport'
		})).state('sell.memberManage', angularAMD.route({
			//会员管理
			url: '/memberManage',
			templateUrl: 'views/sell/memberManage.html',
			controllerUrl: '../js/controllers/sell/memberManage'
		})).state('sell.memberCardManage', angularAMD.route({
			//会员卡管理
			url: '/memberCardManage',
			templateUrl: 'views/sell/memberCardManage.html',
			controllerUrl: '../js/controllers/sell/memberCardManage'
		}))

		// 财务
		.state('finance', angularAMD.route({
				url: '/finance',
				/*地址栏上显示的地址*/
				templateUrl: 'views/finance/finance.html',
				controllerUrl: '../js/controllers/finance/finance'
			}))
			.state('finance.financeDetails', angularAMD.route({
				url: '/finance-details',
				templateUrl: 'views/finance/finance-details.html',
				controllerUrl: '../js/controllers/finance/financeDetails'
			}))
			.state('finance.financeCheck', angularAMD.route({
				url: '/finance-check',
				templateUrl: 'views/finance/finance-check.html',
				controllerUrl: '../js/controllers/finance/financeCheck'
			}))


		.state('report', angularAMD.route({
			//营运报表
			url: '/report',
			templateUrl: 'views/report.html',
			controllerUrl: '../js/controllers/report'
		}))

		.state('setting', angularAMD.route({
				//经营设置
				url: '/setting',
				templateUrl: 'views/setting/setting.html',
				controllerUrl: '../js/controllers/setting/setting'
			})).state('setting.boxsetting', angularAMD.route({
				//包厢设置
				url: '/boxsetting',
				templateUrl: 'views/setting/boxsetting.html',
				controllerUrl: '../js/controllers/setting/boxsetting'
			})).state('setting.ordersetting', angularAMD.route({
				//预约设置
				url: '/ordersetting',
				templateUrl: 'views/setting/ordersetting.html',
				controllerUrl: '../js/controllers/setting/ordersetting'
			}))
			//计费方案设置
			.state('setting.expenplansetting', angularAMD.route({
				url: '/expenplansetting',
				templateUrl: 'views/setting/expenplansetting.html',
				controllerUrl: '../js/controllers/setting/expenplansetting'
			}))
			// 计费方案设置-平日
			.state('setting.expenplansetting.usually', angularAMD.route({
				url: '/usually',
				templateUrl: 'views/setting/expenplansetting-usually.html',
				controllerUrl: '../js/controllers/setting/expenplansetting-usually'
			}))
			// 计费方案设置-特殊日
			.state('setting.expenplansetting.spec', angularAMD.route({
				url: '/spec',
				templateUrl: 'views/setting/expenplansetting-spec.html',
				controllerUrl: '../js/controllers/setting/expenplansetting-spec'
			}))
			//餐点设置
			.state('setting.mealsetting', angularAMD.route({
				url: '/mealsetting',
				templateUrl: 'views/setting/mealsetting.html',
				controllerUrl: '../js/controllers/setting/mealsetting'
			}))
			//成员设置
			.state('setting.membersetting', angularAMD.route({
				url: '/membersetting',
				templateUrl: 'views/setting/membersetting.html',
				controllerUrl: '../js/controllers/setting/membersetting'
			}))
			/*.state('login', {
						url: '/login',
						templateUrl: 'login.html'
					})*/

		.state('mail', angularAMD.route({
			//站内信
			url: '/mail',
			templateUrl: 'views/mail/mail.html',
			controllerUrl: '../js/controllers/mail/mail'
		})).state('mail.maillist', angularAMD.route({
			//站内信列表
			url: '/maillist',
			templateUrl: 'views/mail/maillist.html',
			controllerUrl: '../js/controllers/mail/maillist'
		}));

		//『经营设置』默认子页面
		// $urlRouterProvider.when('/setting', '/setting/boxsetting');
		// Otherwise
		$urlRouterProvider.otherwise('/order');

		$httpProvider.interceptors.push(function(cfpLoadingBar) {
			return {
				'request': function(config) {
					cfpLoadingBar.start();
					return config;
				},
				'response': function(response) {
					cfpLoadingBar.complete();

					var logout = function() {
						UTILITIES.sessionUtilities().clearUserInfo();
						location.href = CONSTANT.LOGIN_PAGE;
					}

					if (response.data !== undefined) {
						if (response.data.isUserLogin !== undefined) {
							if (!response.data.isUserLogin) {
								logout();
							} else {
								return response;
							}
						} else if (response.data.code !== undefined) {
							if (response.data.code == -3) {
								logout();
							} else {
								return response;
							}
						} else {
							return response;
						}
					}

					// if (response.data.isUserLogin != undefined) {
					// 	if (!response.data.isUserLogin) {
					// 		logout();
					// 	} else {
					// 		return response;
					// 	}
					// } else {
					// 	if (response.data.code == -3) {
					// 		logout();
					// 	} else {
					// 		return response;
					// 	}
					// }
					// return response;
				}
			};
		});

		// 日期格式化md-datepicker
		$mdDateLocaleProvider.shortDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
		$mdDateLocaleProvider.shortMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
		$mdDateLocaleProvider.formatDate = function(date) {
			return moment(date).format('YYYY-MM-DD');
		};

	}]);

	// app.factory('mySocket', function(socketFactory) {
	// 	return socketFactory();
	// });

	/**********************SERVICES********************/
	app.service('MsgUnread', function() {
		return {};
	})

	/**********************DIRECTIVES**************************/
	app.directive('focusMe', function($timeout, $parse) {
		return {
			link: function(scope, element, attrs) {
				var model = $parse(attrs.focusMe);
				scope.$watch(model, function(value) {
					if (value === true) {
						$timeout(function() {
							element[0].focus();
						});
					}
				});
				element.bind('blur', function() {
					// scope.$apply(model.assign(scope, false));
				});
			}
		};
	});

	app.directive('onEnter', function() {
		return function(scope, element, attrs) {
			element.bind("keydown keypress", function(event) {
				if (event.which === 13) {
					scope.$apply(function() {
						scope.$eval(attrs.myEnter);
					});

					event.preventDefault();
				}
			});
		};
	});

	app.directive('onlyDigits', function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, element, attrs, modelCtrl) {
				modelCtrl.$parsers.push(function(inputValue) {
					if (inputValue == undefined) return '';
					var transformedInput = inputValue.replace(/[^0-9]/g, '');
					if (transformedInput !== inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}
					return transformedInput;
				});
			}
		};
	});

	app.directive('onlyPrice', function() {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function(scope, element, attrs, modelCtrl) {
				modelCtrl.$parsers.push(function(inputValue) {
					if (inputValue == undefined) return '';
					var transformedInput = inputValue.replace(/[^0-9\.]/g, '');
					if (transformedInput !== inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}
					return transformedInput;
				});
			}
		};
	});

	app.directive('ngModel', function() {
		return {
			require: 'ngModel',
			link: function(scope, elem, attr, ngModel) {
				elem.on('blur', function() {
					ngModel.$dirty = true;
					scope.$apply();
				});

				ngModel.$viewChangeListeners.push(function() {
					ngModel.$dirty = false;
				});

				scope.$on('$destroy', function() {
					elem.off('blur');
				});
			}
		}
	});

	app.directive('mealprice', function() {
		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {
				ctrl.$validators.mealprice = function(modelValue, viewValue) {
					console.log(modelValue);
					return !(parseFloat(modelValue) < 0.01);
				};
			}
		};
	});

	app.directive('forbidzero', function() {
		return {
			require: 'ngModel',
			link: function(scope, elm, attrs, ctrl) {
				ctrl.$validators.forbidzero = function(modelValue, viewValue) {
					console.log(modelValue);
					return !(parseFloat(modelValue) === 0);
				};
			}
		};
	});

	return angularAMD.bootstrap(app);
});

// test