define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
    'use strict';
    return ['$scope', '$state', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $state, $http, $mdDialog, $mdToast, CONSTANT) {

        // session中取的用户信息
        $scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

        // radio默认第一个被选中
        $scope.initState = {
            code: 1
        };
        //  radio单选按钮
        $scope.manageStateArr = [{
            code: 1,
            dscp: '接待作业',
            checkType: 'waitDel'
        }, {
            code: 2,
            dscp: '预订',
            checkType: 'order'
        }, {
            code: 3,
            dscp: '待付款',
            checkType: 'waitPay'
        }, {
            code: 4,
            dscp: '已完成订单',
            checkType: 'complete'
        }];

        // 点击radio筛选
        // 重新掉一下订单详情的接口
        $scope.radioSwitch = function() {
            // 获取当前第几个
            console.log($scope.initState.code);
            $scope.confirmList();
        }

        //点击时间选择
        // 重新调一下订单详情的接口
        $scope.reLoadList = function() {
            $scope.confirmList();
        }

        // 加载订单信息
        $scope.confirmList = function() {
            $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.LIST + '?date=' + moment($scope.$parent.myDate).format('YYYY-MM-DD') + '&shopId=' + $scope.userInfo.shopId + '&checkType=' + $scope.manageStateArr[$scope.initState.code - 1].checkType)
                .success(function(data) {
                    console.log(data);
                    $scope.orderList = data.data;

                    $scope.manageStateArr[0].sum = $scope.orderList.waitDelCount;
                    $scope.manageStateArr[1].sum = $scope.orderList.orderCount;
                    $scope.manageStateArr[2].sum = $scope.orderList.waitPayCount;
                    $scope.manageStateArr[3].sum = $scope.orderList.completeCount;
                })
        };

        // 点击消费码按钮
        $scope.typeSwitch = function(index) {
            // 搜索前后codeStatus不一样
            if ($scope.$parent.flag == false) {
                $scope.orderList.orderList[index].codeStatus = 0;
            } else {
                $scope.orderList.data[index].codeStatus = 0;
            }
        };
        // 点击输入金额按钮
        $scope.typeSwitch2 = function(index) {
            // 搜索前后codeStatus不一样
            if ($scope.$parent.flag == false) {
                $scope.orderList.orderList[index].codeStatus = 5;
            } else {
                $scope.orderList.data[index].codeStatus = 5;
            }
        };

        // blur失去焦点
        $scope.submitPrice = function(index, e) {
            if ($scope.$parent.flag == false)
                var obj = $scope.orderList.orderList[index];
            else
                var obj = $scope.orderList.data[index];

            $scope.consumeCode = e.currentTarget.value;

            if (e.currentTarget.value == '') {
                // delete obj.codeStatus;
                // 采用上面方法会页面会跳一下，暂时采用下面办法，整个刷新下，数据多的时候会影响页面加载
                $scope.confirmList();
            } else {
                $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.SUBMIT_CONSUMECODE + '?sign=' + $scope.consumeCode + '&shopId=' + $scope.userInfo.shopId + '&orderNum=' + obj.orderNum)
                    .success(function(data) {
                        console.log(data);
                        // $scope.getInfo = data.data;
                        // 1、消费码输入正确  2、消费码输入错误
                        if (data.data.isSuccess) {
                            // obj.codeStatus = 1;
                            $scope.$parent.initChild();
                        } else {
                            obj.codeStatus = 2;
                            alert(data.data.msg);
                        }
                    })
            }
        }

        // 点击确认到达
        $scope.arrived = function(ev, index, orderNum) {
            var confirm = $mdDialog.confirm({
                textContent: '客人是否已到?',
                targetEvent: ev,
                ok: '是',
                cancel: '否'
            });
            $mdDialog.show(confirm).then(function() {
                $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.SUBMIT_CONSUMECODE + '?sign=' + '&shopId=' + $scope.userInfo.shopId + '&orderNum=' + orderNum)
                    .success(function(data) {
                        console.log(data);
                        console.log(data.data.msg);

                        if (!data.data.isSuccess) {

                            $mdToast.show(
                                $mdToast.simple()
                                .content(data.data.msg)
                                .position(UTILITIES.getToastPosition())
                                .hideDelay(5000)
                            );

                        } else {

                            // 搜索前后codeStatus不一样
                            if ($scope.$parent.flag == false) {
                                $scope.orderList.orderList[index].codeStatus = 5;
                            } else {
                                $scope.orderList.data[index].codeStatus = 5;
                            }

                            $scope.confirmList();

                            $mdToast.show(
                                $mdToast.simple()
                                .content("客人已到达！")
                                .position(UTILITIES.getToastPosition())
                                .hideDelay(5000)
                            );

                        }

                    })
            }, function() {

            });
        }

        // 点击现场收款弹窗（到现场付）
        $scope.localPaied = function(ev, index, orderNum, price) {
            var confirm = $mdDialog.confirm({
                textContent: '确认已经收款?',
                targetEvent: ev,
                ok: '是',
                cancel: '否'
            });
            $mdDialog.show(confirm).then(function() {
                $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.LOCALPAY + '?orderNum=' + orderNum + '&cashValue=' + price)
                    .success(function(data) {
                        console.log(data);
                        console.log(data.data.msg);
                        console.log(price);

                        if (!data.data.isSuccess) {

                            $mdToast.show(
                                $mdToast.simple()
                                .content(data.data.msg)
                                .position(UTILITIES.getToastPosition())
                                .hideDelay(5000)
                            );

                        } else {

                            // 搜索前后codeStatus不一样
                            if ($scope.$parent.flag == false) {
                                delete $scope.orderList.orderList[index].codeStatus;
                            } else {
                                delete $scope.orderList.data[index].codeStatus;
                            }

                            $scope.confirmList();

                            // $mdToast.show(
                            //     $mdToast.simple()
                            //     .content("客人已到达！")
                            //     .position(UTILITIES.getToastPosition())
                            //     .hideDelay(5000)
                            // );

                        }

                    })
            }, function() {

            });
        }

        // 现场收款
        // 点击现场收款按钮
        $scope.localPay = function(cash, orderNum, index, e) {
            if ($scope.$parent.flag == false)
                var obj = $scope.orderList.orderList[index];
            else
                var obj = $scope.orderList.data[index];

            if (e.currentTarget.value == '') {
                delete obj.codeStatus;
            } else {
                $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.LOCALPAY + '?orderNum=' + orderNum + '&cashValue=' + cash)
                    .success(function(data) {
                        console.log(data);

                        if (data.data.isSuccess)
                            obj.codeStatus = 6;
                        else {
                            obj.codeStatus = 5;
                            alert(data.data.msg);
                        }
                    })
            }
        }

        // 选包厢 弹窗
        $scope.showTabDialog = function(ev, orderInfo) {
            $mdDialog.show({
                controller: boxPickController,
                templateUrl: 'boxPickDialog.tmpl.html',
                // templateUrl: 'tabDialog.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                // 引入参数到下面的controller
                locals: {
                    orderInfo: orderInfo,
                    shopId: $scope.userInfo.shopId,
                    parentScope: $scope
                },
                clickOutsideToClose: true
            });
        };
        //  ************************选包厢弹窗的 controller************************//
        function boxPickController($scope, $mdDialog, orderInfo, shopId, parentScope) {
            $scope.newTableId = orderInfo.tableId;
            // 确定
            $scope.answer = function(answer) {
                $mdDialog.hide(answer);
            };

            // 加载包厢列表 
            $scope.loadBoxList = function() {
                $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.BOXLIST + '?date=' + moment($scope.myDate).format('YYYY-MM-DD') + '&shopId=' + shopId + '&tableTypeCode=' + orderInfo.tableTypeCode + '&orderNum=' + orderInfo.orderNum)
                    .success(function(data) {
                        console.log(data);
                        $scope.boxList = data.data;
                    })
            };

            // 选择包厢
            $scope.pickBox = function(newTableId) {
                // 选中当前变色
                $scope.newTableId = newTableId;
            }

            // 选好包厢
            $scope.boxSubmit = function() {
                $http.get(CONSTANT.SERVICE.ORDER.BOOKCONFIRM.BOXAPPOINT + '?date=' + moment($scope.myDate).format('YYYY-MM-DD') + '&shopId=' + shopId + '&tableId=' + $scope.newTableId + '&orderNum=' + orderInfo.orderNum)
                    .success(function(data) {

                        console.log(data);
                        orderInfo.tableId = $scope.newTableId;

                        if (data.data.isSuccess) {
                            // alert(data.data.msg);
                            // 右上角提示窗口
                            $mdToast.show(
                                $mdToast.simple()
                                .content(data.data.msg)
                                .position(UTILITIES.getToastPosition())
                                .hideDelay(5000)
                            );
                            // 弹窗关闭
                            $mdDialog.hide();

                            if (parentScope.$parent.flag)
                                parentScope.$parent.srh();
                            else
                                parentScope.confirmList();
                        } else {
                            // alert(data.data.msg);
                            $mdToast.show(
                                $mdToast.simple()
                                .content(data.data.msg)
                                .position(UTILITIES.getToastPosition())
                                .hideDelay(5000)
                            );

                        }
                    })
            }
            $scope.loadBoxList();
        }
        //  ************************ END ****************************************//


        // 把加载订单列表方法传到父级（时间改变供父级调用,从父级来重加载）
        $scope.$parent.initChild = function() {
            // console.log('>>>>>'+$scope.$parent.flag);
            if ($scope.$parent.flag) {
                console.log($scope.$parent.srhResult);
                $scope.orderList = $scope.$parent.srhResult;
            } else {
                $scope.confirmList();
            }
        }

        $scope.$parent.initChild();

    }];
});