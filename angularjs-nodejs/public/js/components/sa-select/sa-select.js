import angular from 'angular';
import tmpl    from 'js/components/sa-select/sa-select.html!text';

export var saSelect = angular.module('sa.select', []);

saSelect.directive('saSelect', function() {
	return {
		restrict: 'E',
		scope: {},
		replace: true,
		template: tmpl
	}
});