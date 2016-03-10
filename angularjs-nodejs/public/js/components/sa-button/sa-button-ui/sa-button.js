import angular from 'angular';
import btnTmpl from 'js/components/sa-button/sa-button-ui/sa-button.html!text';

export var saButton = angular.module('sa.button', []);

saButton.controller('saButtonCtrl', ['$scope', '$rootScope', '$timeout', 'saExpensesFormService',
	function($scope, $rootScope, $timeout, saExpensesFormService) {

		const buttonActivate = $rootScope.$on('module:saButton:activate', () => this.setToActive());
		const buttonEdit = $rootScope.$on('module:saButton:edit', (event, expense) => this.openEditForm(expense));
		
		$scope.clickHandler = () => {
			// Toggle class to show ripple effect and remove class after 1000ms
			$scope.toggleClass = true;
			$timeout(() => $scope.toggleClass = false, 1000);

			// Trigger click event
			saExpensesFormService.open();
			$scope.isActive = false;
		};

		this.openEditForm = (expense) => {
			// Trigger click event
			saExpensesFormService.open('Edit', expense);			
			$scope.isActive = false;
		};

		this.setToActive = () => $scope.isActive = true;

		$scope.$on('$destroy', () => {
			buttonActivate();
			buttonEdit();
		});
}]);

saButton.directive('saButton', function() {
	return {
		restrict: 'E',
		scope: {
			viewbox: '@',
			title: '@'
		},
		replace: true,
		transclude: true,
		template: btnTmpl,
		controller: 'saButtonCtrl'
	}
});