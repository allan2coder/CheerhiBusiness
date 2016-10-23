define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
	'use strict';
	return ['$scope', '$state', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $state, $http, $mdDialog, $mdToast, CONSTANT) {
		
		// session中取的用户信息
        $scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

        // radio默认第一个被选中
        $scope.initState = {
            code: 1
        };
        // 	radio单选按钮
        $scope.manageStateArr = [{
            code: 1,
            dscp: '待处理退餐',
            url: CONSTANT.SERVICE.ORDER.REFUND.REFUNDING
            // checkType: 'waitDel'
        }, {
            code: 2,
            dscp: '已退餐',
            url: CONSTANT.SERVICE.ORDER.REFUND.REFUNDED
            // checkType: 'order'
        }, {
            code: 3,
            dscp: '退订',
            url: CONSTANT.SERVICE.ORDER.REFUND.REFUNDAPPLY
            // checkType: 'order'
        }];

        // 点击radio筛选
        // 重新掉一下订单详情的接口
        $scope.radioSwitch = function(code){
            console.log(code);
            $scope.refundList();
        }

        // 获取订单列表信息
        $scope.refundList = function() {
            $http.get($scope.manageStateArr[$scope.initState.code - 1].url + '?searchTime=' + moment($scope.myDate).format('YYYY-MM-DD') + '&shopId=' + $scope.userInfo.shopId)
                .success(function(data) {
                    console.log(data);
                    console.log("订单列表获取");
                    $scope.List = data.data;

                    $scope.manageStateArr[0].sum = $scope.List.notReadCount;
                    $scope.manageStateArr[1].sum = $scope.List.notReadCountOK;
                    $scope.manageStateArr[2].sum = $scope.List.countKTV;
                })
        };

        // 1.餐点关联订单 弹窗
        $scope.showTabDialog = function(ev, foodInfo) {
            // if(foodInfo)

            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'foodTabDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,

                    // ******* 引入参数到下面的controller *******//
                    locals:{
                        foodInfo: foodInfo

                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        //************************** 关联订单弹窗*****************************//
        function DialogController($scope, $mdDialog, foodInfo) {
            $scope.foodInfo = foodInfo;
        }
        //************************** END*****************************//

        // 2.订单关联订单 弹窗
        $scope.showTabDialogOrder = function(ev, orderInfo) {
            // if(foodInfo)

            $mdDialog.show({
                    controller: orderDialogController,
                    templateUrl: 'orderTabDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,

                    // ******* 引入参数到下面的controller *******//
                    locals:{
                        orderInfo: orderInfo

                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        //************************** 关联订单弹窗*****************************//
        function orderDialogController($scope, $mdDialog, orderInfo) {
            $scope.orderInfo = orderInfo;
        }
        //************************** END*****************************//

        // 3.退款
        $scope.refundTabDialog = function(ev, payCash, orderNum, tradeNo) {
            $mdDialog.show({
                    controller: refundDialogController,
                    templateUrl: 'refundTabDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals:{
                        orderNum: orderNum,
                        tradeNo: tradeNo,
                        payCash: payCash,
                        url: CONSTANT.SERVICE.ORDER.REFUND.AGREEREFUNDED,
                        parentScope: $scope
                    },
                    clickOutsideToClose: true
                })
                .then(function(answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function() {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        //************************** 弹窗*****************************//
        function refundDialogController($scope, $mdDialog, url, orderNum, tradeNo, payCash, parentScope) {
            $scope.payCash = payCash;
            // 取消
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            // 确定退款
            $scope.confirmRefund = function(){
                $http.get(url + '?tradeNo=' + tradeNo + '&orderNum=' + orderNum)
                .success(function(data) {
                    console.log(data);
                    $mdDialog.hide();

                    if(parentScope.$parent.flag)
                        parentScope.$parent.srh();
                    else
                        parentScope.refundList();
                })
            }
        }
        //************************** END*****************************//

        // 4.拒绝退款
        $scope.refuseRefundTabDialog = function(ev, orderNum) {
            $mdDialog.show({
                    controller: refuseRefundController,
                    templateUrl: 'refuseRefundTabDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    locals:{
                        orderNum: orderNum,
                        url: CONSTANT.SERVICE.ORDER.REFUND.REFUSEREFUNDED,
                        parentScope: $scope
                    },
                    clickOutsideToClose: true
                })
        };
    	//************************** 弹窗*****************************//
		function refuseRefundController($scope, $mdDialog, orderNum, url, parentScope) {
            // 确定退款
            $scope.myReasonSubmit = function(){

                $http.get(url + '?orderNum=' + orderNum + '&agMessage=' + $scope.myReason)
                .success(function(data) {
                    console.log(data);
                    alert(data.data.msg);
                    $mdDialog.hide();

                    if(parentScope.$parent.flag)
                        parentScope.$parent.srh();
                    else
                        parentScope.refundList();
                })
            }
        }
        //************************** END*****************************//

        // $scope.refundList();
        // 把加载订单列表方法传到父级（时间改变供父级调用,从父级来重加载）
        // $scope.$parent.initChild = $scope.refundList;
        $scope.$parent.initChild = function(){

            if($scope.$parent.flag){
                console.log($scope.$parent.srhResult);
                $scope.List = $scope.$parent.srhResult;
            }else{
                $scope.refundList();
            }
        }
        $scope.$parent.initChild();

	}];
});