import angular from 'angular';
import _       from 'lodash';
import tmpl    from 'js/components/sa-calendar-picker/sa-calendar-picker.html!text';

export var saCalendarPicker = angular.module('sa.calendar.picker', []);

const i18n = {
    months       : ['January','February','March','April','May','June','July','August','September','October','November','December'],
    weekdaysShort: ['M','T','W','T','F','S','S']
};

saCalendarPicker.directive('saCalendarpicker', ['$document', function($document) {
	return {
		restrict: 'E',
		replace: true,
		template: tmpl,
		link: (scope, element) => {
			const showNumberOfDays = 42;
			const date = new Date();
			const today = date.getDate();
			const actualMonth = date.getMonth();
			const actualYear  = date.getFullYear();
			const firstDayIndex = getDayIndexInWeek(actualYear, actualMonth, 1) || 7;
			const lastDayIndex = getDayIndexInWeek(actualYear, actualMonth + 1, 0) || 7;
			const daysThisMonth = getDayInMonth(actualYear, actualMonth + 1, 0);
			const lastDayPrevMonth = getDayInMonth(actualYear, actualMonth, 0);
			const mondayDay = lastDayPrevMonth + 2 - firstDayIndex;

			scope.weekDays = i18n.weekdaysShort;
			scope.month = i18n.months[actualMonth];
			scope.weeks = _.chain(buildMonth())
					.chunk(7)
					.map(function(week) {
						return {
							days: week
						}
					})
					.value();

			function getDayInMonth(year, month, index) {
			  return new Date(year, month, index).getDate();
			}

			function getDayIndexInWeek(year, month, index) {
			  return new Date(year, month, index).getDay();
			}

			function buildMonth() {
			  let month = [];
			  
			  if (firstDayIndex > 1) {
			    const daysToEndOfMonth = lastDayPrevMonth - mondayDay;

			    for (var i = 0; i <= daysToEndOfMonth; i++) {
			      month.push({
			      	number: mondayDay + i,
			      	month: actualMonth - 1,
			      	isCurrentMonth: false
			      });
			    }
			  }
			  
			  for (var j = 1; j <= daysThisMonth; j++) {
			    month.push({
			    	number: j,
			    	month: actualMonth,
			    	isCurrentMonth: true,
			    	isToday: today === j
			    });
			  }
			  
			  const len = month.length;
			  for (var k = 1; k <= showNumberOfDays - len; k++) {
			    month.push({
			    	number: k,
			    	month: actualMonth + 1,
			    	isCurrentMonth: false
			    });
			  }
			 
			  return month;
			}
		}		
    };
}]);