import angular from 'angular';

export var path = angular.module('sa.dates', []);

path.service('DatesService', [function() {
	const months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function thisMonthName(id = new Date().getMonth()) {
		return months[id];
	}

	function thisYear() {
		return new Date().getFullYear();
	}

	return {
		getMonthName: thisMonthName,
		getActualYear: thisYear
	};
}]);