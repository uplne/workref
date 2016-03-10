import angular   from 'angular';
import Chart     from 'chart.js';
import _         from 'lodash';
import bonzo     from 'bonzo';
import qwery     from 'qwery';
import graphTmpl from 'js/components/sa-graphs/sa-graph-incomeexpense.html!text';

export var saGraphIncomeExpense = angular.module('sa.graph.incomeexpense', []);

saGraphIncomeExpense.directive('saGraphincomeexpense', ['DatesService', function(DatesService) {
	return {
		restrict: 'E',
		scope: {
			data: '=chartData',
			graphTitle: '@'
		},
		replace: true,
		template: graphTmpl,
		link: function(scope, elem, attrs) {
			const ctx = document.getElementById('incomeexpensegraph').getContext("2d");
			const actualMonth = new Date().getMonth() + 1;

			scope.$watch(() => scope.data, (data) => {
				scope.hasData = typeof data !== 'undefined' && Object.keys(data).length !== 0;

				const canvassize = parseInt(bonzo(qwery('.graph__element')[0]).css('width'));
				ctx.clearRect(0, 0, canvassize, canvassize);

				if (scope.hasData) {
					let chart = new Chart(ctx).Bar(computeData(data), {
						tooltipFontSize: 11,
						animationEasing: 'easeInSine',
						animationSteps: 30
					});
				}
			}, true);

			function computeData(data) {
				const dataToProcess = angular.copy(data);
				const actualMonth = new Date().getMonth();
				const monthsToShow = [];
				const dataIncome = [];
				const dataExpense = [];
				const dataSets = [];

				for (let i = actualMonth - 2; i <= actualMonth; i++) {
					if (dataToProcess[i]) {
						// Add month into the array even if totals are 0
						monthsToShow.push(DatesService.getMonthName(i));
						const len = monthsToShow.length - 1;
						dataIncome[len] = 0;
						dataExpense[len] = 0;

						if (dataToProcess[i].income) {
							dataIncome[len] = dataToProcess[i].income.total;
						}

						if (dataToProcess[i].expense) {
							dataExpense[len] = dataToProcess[i].expense.total;
						}
					}
				}

				if (dataIncome.length > 0) {
					dataSets.push({
			            label: "Income",
			            fillColor: "#95cd3d",
			            highlightFill: "#88be33",
			            data: dataIncome
			        });
				}

				if (dataExpense.length > 0) {
					dataSets.push({
			            label: "Expense",
			            fillColor: "#99d6eb",
			            highlightFill: "#29a0c9",
			            data: dataExpense
			        });
				}

				return {
				    labels: monthsToShow,
				    datasets: dataSets
				};

			}
       }
	}
}]);