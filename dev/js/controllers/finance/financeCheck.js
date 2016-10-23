define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
    'use strict';
    return ['$scope', '$state', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $state, $http, $mdDialog, $mdToast, CONSTANT) {

        // session中取的用户信息
        $scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

        // radio默认第一个被选中
        $scope.initState = {
            code: 0
        };
        //  radio单选按钮
        $scope.financeStateArr = [{
            code: 0,
            dscp: '已出账',
            info: '经系统汇总并可进行提现操作的每日账目金额'
        }, {
            code: 1,
            dscp: '已提现',
            info: '已完成提现申请的出账内容，若显示提现成功请核对您的银行账户'
        }, {
            code: 2,
            dscp: '未提现',
            info: '没有申请提现的出账信息，可点击“提现”申请提取进行提款'
        }];

        // 加载列表
        $scope.loadList = function() {
            $http.get(CONSTANT.SERVICE.FINANCE.CHECK.LIST + '?month=' + $scope.newDate + '&shopId=' + $scope.userInfo.shopId)
                .success(function(data) {
                    $scope.orderList = data;

                    $scope.financeStateArr[0].count = $scope.orderList.data.total;
                    $scope.financeStateArr[0].cash = $scope.orderList.data.totalCount;

                    $scope.financeStateArr[1].count = $scope.orderList.data.apply;
                    $scope.financeStateArr[1].cash = $scope.orderList.data.applyCount;

                    $scope.financeStateArr[2].count = $scope.orderList.data.noApply;
                    $scope.financeStateArr[2].cash = $scope.orderList.data.noApplyCount;
                })
        };

        // $scope.loadList();

        // 筛选
        $scope.switchStatus = function(applyState) {
            console.log(applyState);
            $scope.initState.code = applyState;
            // $scope.loadList();            
        }

        // 点击时间切换
        $scope.dateChange = function() {
            $scope.loadList();
        }

        // 提现
        $scope.transfer = function(id) {
            $http.post(CONSTANT.SERVICE.FINANCE.CHECK.TRANSFER + '?id=' + id)
                .success(function(data) {
                    console.log(data);
                    $scope.loadList();

                    // 右上角提示
                    $mdToast.show(
                        $mdToast.simple()
                        .content(data.data.msg)
                        .position(UTILITIES.getToastPosition())
                        .hideDelay(5000)
                    );
                })
        }

        // 判断当月的1号2号
        // if (new Date().getDate() === 1 || new Date().getDate() === 2) {
        //     $scope.isShow = false;
        // } else {
        //     $scope.isShow = true;
        // }

        // 日期选择
        $scope.years = [2015, 2016];
        $scope.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        $scope.currentYear = new Date().getUTCFullYear();
        $scope.currentMonth = new Date().getMonth()+1;
        // 日期监听
        $scope.$watch('[currentYear,currentMonth]', function(a, b) {
            var Y = parseInt(a[0]);
            var M = parseInt(a[1]);
            if(parseInt(M.toString().length) == 1)
                M = '0' + M.toString();
            $scope.newDate = Y + '-' + M;
            // 刷新列表
            $scope.loadList();
        });

    }];
});