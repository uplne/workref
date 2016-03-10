import angular   from 'angular';
import Chart     from 'chart.js';
import _         from 'lodash';
import bonzo     from 'bonzo';
import qwery     from 'qwery';
import graphTmpl from 'js/components/sa-graphs/sa-graph-recent.html!text';

export var saGraphRecent = angular.module('sa.graph.recent', []);

saGraphRecent.directive('saGraphrecent', ['DatesService', function(DatesService) {
	return {
		restrict: 'E',
		scope: {
			data: '=chartData',
			totals: '=chartTotals',
			graphTitle: '@'
		},
		replace: true,
		template: graphTmpl,
		link: function(scope, elem, attrs) {
			let chart;
			const ctx = document.getElementById("recentgraph").getContext("2d");
			const actualMonth = new Date().getMonth() + 1;

			scope.graphId = 'recentgraph';
			scope.$watch(() => scope.data, (data) => {
				scope.hasData = shouldRenderGraph(data);

				const canvassize = parseInt(bonzo(qwery('#recentgraph')[0]).css('width'));
				ctx.clearRect(0, 0, canvassize, canvassize);

				if (scope.hasData) {
					chart = new Chart(ctx).Bar(computeData(data), {
						tooltipFontSize: 11,
						animationEasing: 'easeInSine',
						animationSteps: 30
					});
				}
			}, true);

			function shouldRenderGraph(data) {
				return !!_.chain(data).valuesIn().find((item) => _.has(item, 'expense')).value() && Number(scope.totals) > 0;
			}

			function computeData(data) {
				const dataToProcess = angular.copy(data);
				const actualMonth = new Date().getMonth();
				const monthsToShow = [];
				const dataToShow = [];

				for (let i = actualMonth - 2; i <= actualMonth; i++) {
					if (dataToProcess[i] && dataToProcess[i].expense) {
						monthsToShow.push(DatesService.getMonthName(i));
						dataToShow.push(parseFloat(dataToProcess[i].expense.total).toFixed(2));
					}
				}

				return {
				    labels: monthsToShow,
				    datasets: [
				        {
				            label: "Expense",
				            fillColor: "#99d6eb",
				            highlightFill: "#29a0c9",
				            data: dataToShow
				        }
				    ]
				};

			}
       }
	}
}]);