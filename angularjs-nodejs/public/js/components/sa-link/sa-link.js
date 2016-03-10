import angular from 'angular';
import btnTmpl from 'js/components/sa-link/sa-link.html!text';

export var saLink = angular.module('sa.link', []);

saLink.controller('saLinkCtrl', ['$scope', '$timeout',
	function($scope, $timeout) {
		$scope.clickHandler = () => {
			// Toggle class to show ripple effect and remove class after 1000ms
			$scope.toggleClass = true;
			$timeout(() => $scope.toggleClass = false, 1000);
		};
}]);

saLink.directive('saLink', function() {
	return {
		restrict: 'E',
		scope: {
			viewbox: '@',
			title: '@',
			sref: '@'
		},
		replace: true,
		transclude: true,
		template: btnTmpl,
		controller: 'saLinkCtrl'
	}
});