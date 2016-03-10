import angular   from 'angular';
import Chart     from 'chart.js';
import _         from 'lodash';
import bonzo     from 'bonzo';
import qwery     from 'qwery';
import graphTmpl from 'js/components/sa-graphs/sa-graph-savings.html!text';

export var saGraphSavings = angular.module('sa.graph.savings', []);

saGraphSavings.directive('saGraphsavings', ['DatesService', function(DatesService) {
	return {
		restrict: 'E',
		scope: {
			data: '=chartData',
			graphTitle: '@'
		},
		replace: true,
		template: graphTmpl,
		link: function(scope, elem, attrs) {
			const ctx = document.getElementById('savingsgraph').getContext("2d");
			const actualMonth = new Date().getMonth() + 1;

			scope.$watch(() => scope.data, (data) => {
				scope.hasData = shouldRenderGraph(data);

				const canvassize = parseInt(bonzo(qwery('.graph__element')[0]).css('width'));
				ctx.clearRect(0, 0, canvassize, canvassize);

				if (scope.hasData) {
					let chart = new Chart(ctx).Line(computeData(data), {
						tooltipFontSize: 11,
						animationEasing: 'easeInSine',
						animationSteps: 30
					});
				}
			}, true);

			function shouldRenderGraph(data) {
				return Object.keys(data.totals.monthly).length > 0;
			}

			function computeData(data) {
				const dataToProcess = angular.copy(data);
				const totals = dataToProcess.totals.monthly;
				const actualMonth = new Date().getMonth();
				const monthsToShow = [];
				const dataToShow = [];

				for (let i = actualMonth - 2; i <= actualMonth; i++) {
					if (totals[i]) {
						// Add month into the array even if totals are 0
						monthsToShow.push(DatesService.getMonthName(i));
						dataToShow.push(0);
						const len = dataToShow.length - 1;
						
						if (totals[i].income) {
							dataToShow[len] += totals[i].income.total;
						}

						if (totals[i].expense) {
							dataToShow[len] -= totals[i].expense.total;
						}
					}
				}

				return {
				    labels: monthsToShow,
				    datasets: [
				    	{
				            label: "Savings",
				            strokeColor: "#95cd3d",
				            pointColor: "#95cd3d",
				            fillColor: "rgba(149,205,60,.3)",
				            data: dataToShow
				        }
				    ]
				};

			}
       }
	}
}]);