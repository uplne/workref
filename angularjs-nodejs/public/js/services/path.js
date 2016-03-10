import angular from 'angular';

export var path = angular.module('sa.path', []);

path.service('PathService', ['$location', function($location) {
	function getPath() {
		return $location.path();
	}

	function getTitle() {
		const path = $location.path();
		return path.substr(1, path.length);
	}

	return {
		path: getPath,
		title: getTitle
	};
}]);