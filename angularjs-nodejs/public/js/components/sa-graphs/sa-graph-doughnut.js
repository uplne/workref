import angular   from 'angular';
import Chart     from 'chart.js';
import _         from 'lodash';
import bonzo     from 'bonzo';
import qwery     from 'qwery';
import {categoriesExpense} from 'js/settings/categories';
import graphTmpl from 'js/components/sa-graphs/sa-graph-doughnut.html!text';

export var saGraphDoughnut = angular.module('sa.graph.doughnut', []);

saGraphDoughnut.directive('saGraphdoughnut', function() {
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
			const ctx = document.getElementById("monthlygraph").getContext("2d");
			const actualMonth = new Date().getMonth();

			scope.$watch(() => scope.data, (data) => {
				scope.hasData = scope.totals && Number(scope.totals.total) > 0;

				const canvassize = parseInt(bonzo(qwery('.graph__element')[0]).css('width'));
				angular.element(elem[0].getElementsByClassName('js-legend')).remove();
				ctx.clearRect(0, 0, canvassize, canvassize);

				if (scope.hasData) {
					let chart = new Chart(ctx).Doughnut(computeData(data), {
						legendTemplate : "<ul class=\"graph__legend list-ui js-legend\"><% for (var i=0; i<segments.length; i++){%><li class=\"graph__list\"><span class=\"graph__colorindicator\" style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%> (<b><%=parseFloat(segments[i].value).toFixed(2)%></b>)<%}%></li><%}%></ul>",
						tooltipFontSize: 11,
						animationEasing: 'easeInSine',
						animationSteps: 30
					});

					angular.element(elem[0].getElementsByClassName('js-graph')).append(angular.element(chart.generateLegend()));
				}
			}, true);

			function computeData(data) {
				const dataToProcess = angular.copy(data);
				const fixed = _.chain(dataToProcess.fixed)
					                .filter((item) => item.state !== 'stopped' || new Date(item.to).getMonth() === actualMonth)
					                .value();
				const variable = _(dataToProcess.variable)
									.chain()
									.filter((item) => new Date(item.created).getMonth() === actualMonth)
									.value();

				return _.chain(variable)
						.concat(fixed)
						.reduce((result, n) => {
						    if (result[n.category]) {
						      	result[n.category].value += n.value;
						    } else {
						    	let item = _.chain(categoriesExpense).find({value: n.category}).value();
						      	result[n.category] = {
						      		label: item.name,
						      		value: n.value,
						      		color: item.color
						      	};
						    }

						    return result;
						}, {})
						.forEach((item) => item.value = parseFloat(item.value).toFixed(2))
						.values()
						.value();
			}
       }
	}
});