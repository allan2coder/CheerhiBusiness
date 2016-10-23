define(['../../app', '../../common/utilities'], function(app, UTILITIES) {
	'use strict';
	return ['$scope', '$state', 'CONSTANT', function($scope, $state, CONSTANT) {

		$state.transitionTo('mail.maillist');

	}];
});