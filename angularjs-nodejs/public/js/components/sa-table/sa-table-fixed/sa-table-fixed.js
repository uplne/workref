import angular from 'angular';
import tmpl from 'js/components/sa-table/sa-table-fixed/sa-table-fixed.html!text';

export var saTableFixed = angular.module('sa.table.fixed', []);

saTableFixed.directive('saTablefixed', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: tmpl
	}
});