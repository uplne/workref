import angular from 'angular';

export var saDot = angular.module('sa.dot', []);

saDot.directive('saDot', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attr, ngModel) {
			element.on('change', (e) => {
                ngModel.$setViewValue(element.val().replace(",", "."));
				ngModel.$render();
			});
		}
	}
});