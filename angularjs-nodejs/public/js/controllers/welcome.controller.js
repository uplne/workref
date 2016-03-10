import angular from 'angular';

export var welcome = angular.module('sa.welcome', []);

welcome.controller('WelcomeCtrl', ['$scope', 'ApiService', function($scope, ApiService) {
	const config = window.config;

	$scope.welcomeMessage = config.msgs.welcome + ', ' + config.user.firstname;	
}]);