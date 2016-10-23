define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
    'use strict';
    return ['$scope', '$state', '$http', '$mdDialog', '$mdToast', 'CONSTANT', function($scope, $state, $http, $mdDialog, $mdToast, CONSTANT) {

        // session中取的用户信息
        $scope.userInfo = UTILITIES.sessionUtilities().getUserInfo();

        // radio默认第一个被选中
        $scope.initState = {
            code: 2
        };

        // 	radio单选按钮
        $scope.financeStateArr = [{
            code: 2,
            dscp: '已付款',
            info: '当天客人已完成付款的订单'
        }, {
            code: 5,
            dscp: '待现场付',
            info: '当天需商户手动确认收款的预约订单'
        }, {
            code: 4,
            dscp: '退款',
            info: '当天所有预定及点餐退款订单，包含退订、退餐订单'
        }, {
            code: 7,
            dscp: '红包减免',
            info: '当天在线付款并使用红包减免的订单'
        }, {
            code: 6,
            dscp: '已现场付',
            info: '当天商家确认现场收款的预约订单'
        }, {
            code: 0,
            dscp: '总计',
            info: '该项列出的是当天产生的所有订单'
        }];


        // 加载列表
        $scope.loadList = function(){
            $http.get(CONSTANT.SERVICE.FINANCE.DETAILS.LIST + '?orderDate=' + moment($scope.myDate).format('YYYY-MM-DD') + '&cashState=' + $scope.initState.code + '&shopId=' + $scope.userInfo.shopId)
            .success(function(data){
                console.log(data);
                $scope.orderList = data.data.orderList;
                $scope.total = data.data.totalCash;
            })
        };

        $scope.loadList();

        //菜单点击切换
        $scope.switchStatus = function(cashState){
            console.log(cashState);
            $scope.initState.code = cashState;
            $scope.loadList();
            $scope.loadBill();
        }

        // 点击时间切换
        $scope.dateChange = function(){
            console.log($scope.myData);
            $scope.loadList();
            $scope.loadBill();
        }        

        $scope.loadBill = function(){
            $http.get(CONSTANT.SERVICE.FINANCE.DETAILS.BILLLIST + '?orderDate=' + moment($scope.myDate).format('YYYY-MM-DD') + '&shopId=' + $scope.userInfo.shopId)
            .success(function(data){
                console.log(data);
                $scope.billList = data;
                $scope.financeStateArr[0].cash = data.data.payValueTotal;
                $scope.financeStateArr[1].cash = data.data.localWaitPayValueTotal;
                $scope.financeStateArr[2].cash = data.data.refundValueTotal;
                $scope.financeStateArr[3].cash = data.data.couponValueTotal;
                $scope.financeStateArr[4].cash = data.data.cashPayValueTotal;
                $scope.financeStateArr[5].cash = data.data.totalCash;

                $scope.financeStateArr[0].count = data.data.payCount;
                $scope.financeStateArr[1].count = data.data.localWaitPayCount;
                $scope.financeStateArr[2].count = data.data.refundCount;
                $scope.financeStateArr[3].count = data.data.couponCount;
                $scope.financeStateArr[4].count = data.data.cashPayCount;
                // $scope.financeStateArr[5].count = data.data.;
            })
        };

        $scope.loadBill();
    }];
});