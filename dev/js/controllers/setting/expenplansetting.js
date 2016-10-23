define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$state', 'CONSTANT', function($scope, $state, CONSTANT) {

		$state.transitionTo('setting.expenplansetting.usually');

		$scope.statuStore = {
			expenplanTypeIndex: 0
		};

		$scope.$watch(function() {
			return $scope.statuStore.expenplanTypeIndex;
		}, function(a, b) {
			if (a) {
				$state.transitionTo('setting.expenplansetting.spec');
			} else {
				$state.transitionTo('setting.expenplansetting.usually');
			}
		});
	}];
});