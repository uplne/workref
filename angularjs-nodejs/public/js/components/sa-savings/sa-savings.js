import angular from 'angular';
import tmpl    from 'js/components/sa-savings/sa-savings.html!text';

export var saSavings = angular.module('sa.savings', []);

saSavings.controller('SavingsCtrl', ['$scope', 'ApiService', function($scope, ApiService) {
	let haveSavings = false;

	ApiService.getSavings().then((freshData) => {
		$scope.savings = freshData || 0;

		haveSavings = !!freshData;
	});

	$scope.submit = () => {
		(haveSavings) ? ApiService.updateSavings($scope.savings) : ApiService.saveSavings($scope.savings);
	};
}]);

saSavings.directive('saSavings', function() {
	return {
		restrict: 'E',
		scope: {},
		replace: true,
		template: tmpl,
		controller: 'SavingsCtrl'
	}
});