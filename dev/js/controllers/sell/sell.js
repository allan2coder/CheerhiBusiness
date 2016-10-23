define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$state', 'CONSTANT', function($scope, $state, CONSTANT) {

		$state.transitionTo('sell.couponManage');

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

		$scope.pageAuth = UTILITIES.sessionUtilities().getUserInfo().pageAuth.menus[1].sub;
	}];
});