import angular from 'angular';
import tmpl from 'js/components/sa-total/sa-total.html!text';

export var saTotal = angular.module('sa.total', []);

saTotal.controller('TotalController', ['$scope', 'ApiService', function($scope, ApiService) {
	$scope.$watch(() => $scope.data, (data) => {
		if (data) {
			$scope.total = data;
		}
	});
}]);

saTotal.directive('saTotal', function() {
	return {
		restrict: 'E',
		scope: {
			type: '@',
			data: '='
		},
		replace: true,
		transclude: true,
		template: tmpl,
		controller: 'TotalController'
	}
});