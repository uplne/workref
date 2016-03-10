import angular from 'angular';
import transformrequest from '../../helpers/transform-request';
import tmpl from 'js/components/sa-quotelio/sa-quotelio.html!text';

export var saQuotelio = angular.module('sa.quotelio', []);

saQuotelio.service('QuotelioService', ['$http', function($http) {	
	return {
		getQuote: () => {
			return $http({
		    	method : 'GET',
		    	transformRequest: transformrequest,
		    	url : '/api/quote'
			})
		    .then((result) => {
		    	return result.data;
		    }, (err) => {
		    	console.log('Error getting data: ', err);
		    });
		}
	}
}]);

saQuotelio.controller('QuotelioController', ['$scope', 'QuotelioService',  function($scope, QuotelioService) {
	QuotelioService.getQuote().then((quote) => {
		if (!quote || typeof quote === 'undefined') {
			return;
		}

		$scope.quotelioQuote = '"' + quote.quote + '"';
		$scope.quotelioAuthor = quote.author;
	});
}]);

saQuotelio.directive('saQuotelio', function() {
	return {
		restrict: 'E',
		replace: true,
		template: tmpl,
		controller: 'QuotelioController'
	}
});