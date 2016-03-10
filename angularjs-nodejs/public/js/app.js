import angular from 'angular';
import 'angular-ui-router';

import './services/api';
import './services/path';
import './services/datastore';
import './services/dates';

import './controllers/data.controller';
import './controllers/welcome.controller';

import './components/sa-button/sa-button-ui/sa-button';
import './components/sa-button/sa-button-ui-small/sa-button-ui-small';
import './components/sa-expenses-form/sa-expenses-form';
import './components/sa-total/sa-total';
import './components/sa-link/sa-link';
import './components/sa-graphs/sa-graph-doughnut';
import './components/sa-graphs/sa-graph-recent';
import './components/sa-graphs/sa-graph-incomeexpense';
import './components/sa-graphs/sa-graph-savings';
import './components/sa-select/sa-select';
import './components/sa-savings/sa-savings';
import './components/sa-table/sa-table-variable/sa-table-variable';
import './components/sa-table/sa-table-fixed/sa-table-fixed';
import './components/sa-quotelio/sa-quotelio';
import './components/sa-calendar-picker/sa-calendar-picker';
import './components/sa-modal/sa-modal';

import './components/sa-utils/sa-dot';

var savelio = angular.module('savelio', [
    'ui.router',

    'sa.api',
    'sa.path',
    'sa.datastore',
    'sa.dates',

    'sa.data',
    'sa.welcome',

    'sa.button',
    'sa.button.ui.small',
    'sa.expenses.form',
    'sa.total',
    'sa.graph.doughnut',
    'sa.graph.recent',
    'sa.graph.incomeexpense',
    'sa.graph.savings',
    'sa.link',
    'sa.select',
    'sa.savings',
    'sa.table.variable',
    'sa.table.fixed',
    'sa.quotelio',
    'sa.calendar.picker',
    'sa.modal',

    'sa.dot'
]);

savelio.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider
        .state('dashboard', {
            url: '/dashboard',
            templateUrl: 'public/js/routes/dashboard.html',
            controller: 'DataController',
            resolve: {
                'WaitToLoad': function(ApiService) {
                    return ApiService.getAllData();
                }
            }
        })
        .state('expense', {
        	url: '/expense',
        	templateUrl: 'public/js/routes/expense.html',
            controller: 'DataController',
            resolve: {
                'WaitToLoad': function(ApiService) {
                    return ApiService.getAllData();
                }
            }
        })
        .state('income', {
            url: '/income',
            templateUrl: 'public/js/routes/income.html',
            controller: 'DataController',
            resolve: {
                'WaitToLoad': function(ApiService) {
                    return ApiService.getAllData();
                }
            }
        });
}]);

savelio.config(['$locationProvider', function($locationProvider) {
    // Use real URLs (with History API) instead of hashbangs
    $locationProvider.html5Mode({enabled: true, requireBase: false});
}]);

// Expose state
savelio.run(['$state', '$rootScope', function ($state, $rootScope) {
    $rootScope.$state = $state;
}]);

angular.bootstrap(document, ['savelio']);