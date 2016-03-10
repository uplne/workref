import angular from 'angular';
import tmpl from 'js/components/sa-table/sa-table-variable/sa-table-variable.html!text';

export var saTableVariable = angular.module('sa.table.variable', []);

saTableVariable.directive('saTablevariable', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: tmpl
	}
});