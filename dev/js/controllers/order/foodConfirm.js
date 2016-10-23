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
            dscp: '未出餐'
        }, {
            code: 2,
            dscp: '已出餐'
        }];

        $scope.radioSwitch = function(code) {
            console.log(code);
            // $scope.loadBookList();
        }

        // 获取订单列表信息
        $scope.loadBookList = function() {
            $http.get(CONSTANT.SERVICE.ORDER.FOODCONRIRM.LIST + '?searchTime=' + moment($scope.myDate).format('YYYY-MM-DD') + '&shopId=' + $scope.userInfo.shopId + '&Type=' + 0)
                .success(function(data) {
                    console.log(data);

                    $scope.foodList = data.data;
                    $scope.manageStateArr[0].sum = 0;
                    $scope.manageStateArr[1].sum = 0;

                    // 遍历一下，arrive为0的为未出餐，1为已出餐
                    for (var i = 0; i < $scope.foodList.orderfoodlist.length; i++) {
                        if ($scope.foodList.orderfoodlist[i].arrive == 0) {
                            $scope.manageStateArr[0].sum++;
                        } else {
                            $scope.manageStateArr[1].sum++;
                        }
                    }
                })
        };

        // 出餐
        $scope.foodOut = function(ev, foodInfo) {
            var confirm = $mdDialog.confirm({
                textContent: '确定出餐？',
                targetEvent: ev,
                ok: '是',
                cancel: '否'
            });

            $mdDialog.show(confirm).then(function() {
                $http.get(CONSTANT.SERVICE.ORDER.FOODCONRIRM.FOODOUT + '?shopId=' + $scope.userInfo.shopId + '&orderNum=' + foodInfo.orderNum)
                    .success(function(data) {
                        console.log(data);
                        if (data.data.code == 1)
                            foodInfo.arrive = 1;

                        $mdToast.show(
                            $mdToast.simple()
                            .content(data.data.msg)
                            .position(UTILITIES.getToastPosition())
                            .hideDelay(5000)
                        );
                        // console.log("出餐咯~");
                        $scope.loadBookList();
                    })
            }, function() {

            });
        };

        // 关联订单 弹窗
        $scope.showTabDialog = function(ev, foodInfo) {
            $mdDialog.show({
                    controller: DialogController,
                    templateUrl: 'foodTabDialog.tmpl.html',
                    // templateUrl: 'tabDialog.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,

                    // ******* 引入参数到下面的controller *******//
                    locals: {
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

            $scope.loadTableList = function() {
                console.log($scope.foodInfo.orderNum);
                $http.get(CONSTANT.SERVICE.ORDER.FOODCONRIRM.TABLEDETAIL + '?orderNum=' + $scope.foodInfo.ktvOrderNum)
                    .success(function(data) {
                        console.log(data);
                        $scope.foodInfo = data.data;
                        console.log($scope.foodInfo);
                    })
            };


            $scope.loadTableList();


        }
        //************************** END*****************************//

        // $scope.loadBookList();
        // 把加载订单列表方法传到父级（时间改变供父级调用,从父级来重加载）
        // $scope.$parent.initChild = $scope.loadBookList;
        $scope.$parent.initChild = function() {

            if ($scope.$parent.flag) {
                console.log($scope.$parent.srhResult);
                $scope.foodList = $scope.$parent.srhResult;
            } else {
                $scope.loadBookList();
            }
        }

        $scope.$parent.initChild();


    }];
});