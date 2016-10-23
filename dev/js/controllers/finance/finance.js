define(['../../app', '../../common/utilities', 'moment'], function(app, UTILITIES, moment) {
    'use strict';
    return ['$scope', '$state', 'CONSTANT', function($scope, $state, CONSTANT) {


        // 时间改变
        // 刷新子view
        // $scope.dateChange = function() {
        //     console.log($scope.myDate);
            
        //     if ($scope.initChild !== undefined)
        //         $scope.initChild();
        // }



        // 设置默认页面
        $state.transitionTo('finance.financeDetails');

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

        $scope.pageAuth = UTILITIES.sessionUtilities().getUserInfo().pageAuth.menus[2].sub;

    }];
})