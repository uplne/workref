import angular from 'angular';
import _       from 'lodash';

export var data = angular.module('sa.data', []);

data.controller('DataController', ['$scope', '$rootScope', 'ApiService', 'PathService', 'DatesService', 'ModalService',
	function($scope, $rootScope, ApiService, PathService, DatesService, ModalService) {
		const date = new Date();
		const month = date.getMonth();

		$scope.actualMonth = (item) => new Date(item.created).getMonth() == month;
		$scope.items = dataForViews();
		$scope.editData = (data) => $rootScope.$emit('module:saButton:edit', data);
		$scope.removeData = (data, index) => {
			ModalService.showModal().then(() => ApiService.removeData(data));
		};
		$scope.stopFixedData = (data) => ApiService.stopFixedData(data);
		// To pass actual section name for titles, eg. 'Edit expenses/income'
		$scope.stateTitle = $rootScope.$state.current.name;
		$scope.date = DatesService.getMonthName() + ' ' + DatesService.getActualYear();
		$scope.monthlyTotals = ApiService.dataStore.totals.monthly;
		$scope.savings = ApiService.dataStore;

		//TODO: study events
		const dataUpdate = $rootScope.$on('module:datastore:update', (event, data, serverResponse) => {
			$scope.items = dataForViews();
			$scope.monthlyTotals = ApiService.dataStore.totals.monthly;
			$scope.savings = ApiService.dataStore;
		});
		$scope.$on('$destroy', dataUpdate);

		function dataForViews() {
			const items = ApiService.dataStore;
			const path = PathService.title();
			const results = {
				all: {
					variable: (items.all.variable[month] || {})[path],
					fixed: items.all.fixed[path]
				},
				totals: {
					monthly: _.mapValues((items.totals.monthly[month] || {})[path], (item) => parseFloat(item).toFixed(2)),
					yearly: _.mapValues(items.totals.yearly[path], (item) => parseFloat(item).toFixed(2)),
					savings: items.savings
				}
			}

			return results;
		}
	}
]);