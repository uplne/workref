import angular from 'angular';
import tmpl from 'js/components/sa-button/sa-button-ui-small/sa-button-ui-small.html!text';

export var saButtonUISmall = angular.module('sa.button.ui.small', []);

saButtonUISmall.directive('saButtonuismall', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			action: '&',
			title: '@',
			classes: '@'
		},
		template: tmpl
	}
});