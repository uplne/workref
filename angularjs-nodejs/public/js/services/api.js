import angular from 'angular';
import _       from 'lodash';
import transformrequest from '../helpers/transform-request';

export var api = angular.module('sa.api', []);

//TODO: don't use emit, create pub/sub
api.service('ApiService', ['$http', '$rootScope', 'PathService', 'DataStore', function($http, $rootScope, PathService, DataStore) {	
	var api = {
		getAllData: () => {
			const year = new Date().getFullYear();

			if (!api.dataStore) {
				return $http({
				    	method : 'GET',
				    	transformRequest: transformrequest,
				    	url : '/api/all/' + year 
					})
					.then((results) => DataStore.processData(results.data))
					.then((result) => {
						api.dataStore = result;
					});
			} else {
				return api.dataStore;
			}
		},

		saveData: (data) => {
			$http({
				method: 'POST',
				url:'/api' + PathService.path(),
				transformRequest: transformrequest,
				data: {
					data: JSON.stringify(data)
				},
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
		    .then((result) => {
		    	DataStore.save(data, result, api.dataStore, PathService.title());
		    	$rootScope.$emit('module:datastore:update');
		    });
		},

		editData: (data, original) => {
			$http({
				method: 'PUT',
				url: '/api' + PathService.path(),
				transformRequest: transformrequest,
				data: {
					itemid: data.itemid,
					type: data.type,
					data: JSON.stringify(data)
				},
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
			.then((result) => {
				DataStore.edit(data, api.dataStore, original);
				$rootScope.$emit('module:datastore:update');
			});
		},

		removeData: (data) => {
			$http({
				method: 'DELETE',
				url: '/api' + PathService.path(),
				transformRequest: transformrequest,
				data: {
					itemid: data.itemid,
					type: data.type
				},
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			})
			.then((result) => {
				DataStore.remove(data, api.dataStore, PathService.title());
				$rootScope.$emit('module:datastore:update');
			});
		},

		stopFixedData: (data) => {
			api.editData({
				itemid: data.itemid,
				type: data.type,
				to: new Date().getTime(),
				state: 'stopped'
			}, data);
		},

		getSavings: () => {
			return $http({
		    	method : 'GET',
		    	transformRequest: transformrequest,
		    	url : '/api/savings' 
			})
		    .then((result) => {
		    	return result.data.data;
		    }, (err) => {
		    	console.log('Error getting data: ', err);
		    });
		},

		saveSavings: (value) => {
			$http({
				method: 'POST',
				url:'/api/savings',
				transformRequest: transformrequest,
				data: { value: value },
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		},

		updateSavings: (value) => {
			$http({
				method: 'PUT',
				url:'/api/savings',
				transformRequest: transformrequest,
				data: { value: value },
				headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
		},

		dataStore: null
	};

	return api;
}]);