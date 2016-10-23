define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
    'use strict';
    return ['$scope', '$http', '$state', 'CONSTANT', function($scope, $http, $state, CONSTANT) {

        $scope.flag = false; /*搜索的标记*/

        // 时间改变
        // 刷新子view
        $scope.myDate = new Date();
        // $scope.dateChange = function() {
        //     console.log($scope.myDate);
        //     if ($scope.initChild !== undefined)
        //         $scope.initChild();
        // }

        $scope.$watch('myDate', function(a, b) {
            // console.log(a);
            if ($scope.initChild !== undefined)
                $scope.initChild();
        });

        // 设置默认页面
        $state.transitionTo('order.bookConfirm');

        // 选项卡
        $scope.isTabActive = function(tabName) {
            // Check if there is sub-states
            var stateName = $state.current.name,
                subStatePos = stateName.indexOf('.');

            if (subStatePos > -1) {
                stateName = stateName.substring(subStatePos + 1, stateName.length + 1);
            }

            if (tabName === stateName) {
                return 'active';
            }
        };

        $scope.pageAuth = UTILITIES.sessionUtilities().getUserInfo().pageAuth.menus[0].sub;

        // 点击回车搜索
        $scope.enter = function(ev) {
            if(ev.keyCode !== 13)
                return;
            // 输入框为空刷新列表
            if ($scope.num == '') {
                // location.href = '/#/order/book-confirm';
                $scope.flag = false;
                $scope.initChild();
            } else {
                $http.get(CONSTANT.SERVICE.ORDER.SRH + '?shopId=' + $scope.userInfo.shopId + '&phone=' + $scope.num)
                    .success(function(data) {
                        // console.log(data);

                        $scope.flag = true;
                        $scope.srhResult = data;

                        $scope.initChild(); /*子页面东西再走一遍*/
                    })
            }
        };
        // 按放大镜按钮搜索
        $scope.srh = function(){
            if ($scope.num == '') {
                // location.href = '/#/order/book-confirm';
                $scope.flag = false;
                $scope.initChild();
            } else {
                $http.get(CONSTANT.SERVICE.ORDER.SRH + '?shopId=' + $scope.userInfo.shopId + '&phone=' + $scope.num)
                    .success(function(data) {
                        // console.log(data);

                        $scope.flag = true;
                        $scope.srhResult = data;

                        $scope.initChild(); /*子页面东西再走一遍*/
                    })
            }
        }

    }];
})