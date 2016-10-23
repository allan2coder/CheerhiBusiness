define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$state', 'CONSTANT', function($scope, $state, CONSTANT) {
		$scope.subs = ['boxsetting', 'ordersetting', 'expenplansetting', 'mealsetting', 'membersetting'];

		$scope.isTabActive = function(tabName) {
			// Check if there is sub-states
			var stateName = $state.current.name,
				subStatePos = stateName.indexOf('.');

			if (subStatePos > -1) {
				stateName = stateName.substring(subStatePos + 1, stateName.length + 1);
			}

			if (tabName === stateName.split('.')[0]) {
				return 'active';
			}
		};

		$scope.pageAuth = UTILITIES.sessionUtilities().getUserInfo().pageAuth.menus[4].sub;

		for (var i = 0; i < $scope.pageAuth.length; i++) {
			if ($scope.pageAuth[i].enable) {
				$state.transitionTo('setting.' + $scope.subs[i]);
				return;
			}
		}

	}];
});