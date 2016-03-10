import angular  from 'angular';
import bonzo    from 'bonzo';
import qwery    from 'qwery';
import {categoriesExpense, categoriesIncome} from 'js/settings/categories';
import formTmpl from 'js/components/sa-expenses-form/sa-expenses-form.html!text';

var saExpensesForm = angular.module('sa.expenses.form', []);

saExpensesForm.factory('saExpensesFormService', ['$document', '$compile', '$rootScope', function($document, $compile, $rootScope) {
	var scope,
		template,
		data;

	function open(type = 'Add', formData) {
		data = formData;
		scope = $rootScope.$new();
		template = angular.element('<sa:ExpensesForm heading="' + type + '"></sa:ExpensesForm>');

		$compile(template)(scope);
        $document.find('body').append(template);
        $rootScope.bodyClasses = 'u-noscroll';
	}

	function destroy() {
		$rootScope.bodyClasses = '';
		scope.$destroy();
        scope = null;
        template.remove();
        template = null;
	}

	function getData() {
		return data;
	}

	return {
		open: open,
		destroy: destroy,
		getData: getData
	};
}]);

saExpensesForm.controller('SaveDataController', ['$scope', '$compile', '$document', '$rootScope', 'ApiService', 'PathService', 'saExpensesFormService',
	function($scope, $compile, $document, $rootScope, ApiService, PathService, saExpensesFormService) {

	this.isEditing = $scope.heading === 'Edit';
	this.title = PathService.title();

	const defaultOptionsExpense = 'food';
	const defaultOptionsIncome = 'cashback';

	let datePicker;
	let isDatePickerOpen = false;

	if (this.isEditing) {
		this.data = saExpensesFormService.getData();
	}

	this.options = (this.title === 'expense') ? categoriesExpense : categoriesIncome;

	this.setInitialValues = () => {
		const defaultCategoryOption = (this.title === 'expense') ? defaultOptionsExpense : defaultOptionsIncome;

		this.data = this.data || {};
		this.data.type = this.data.type || 'variable';
		this.data.iteration = this.data.iteration || 'monthly';
		this.data.category = this.data.category || defaultCategoryOption;
		this.data.created = this.data.created || new Date().getTime();
	};

	this.setInitialValues();

	this.submit = () => {
		const newData = this.processData();

		this.isEditing ? ApiService.editData(newData) : ApiService.saveData(newData);
		saExpensesFormService.destroy();
		// Inform that button module needs to be activated
		$rootScope.$emit('module:saButton:activate');
	};

	this.processData = () => {
		let data = {
			itemid: this.data.itemid || '',
			title: this.data.title,
			value: parseFloat(this.data.value),
			type: this.data.type,
			category: this.data.category,
			created: this.data.created,
			iteration: '',
			note: this.data.note || ''
		};

		if (this.data.type === 'fixed') {
			data.iteration = this.data.iteration;
		}

		return data;
	};

	$scope.updateDate = (day) => {
		this.data.created = new Date(2015, day.month, day.number).getTime();
		this.closeCalendar();
	};

	this.openCalendar = () => {
		let _self = this;

		if (!isDatePickerOpen) {
			datePicker = $compile("<sa:Calendarpicker></sa:Calendarpicker>")($scope);
			bonzo(qwery('.js-datepicker')[0]).append(datePicker);
			isDatePickerOpen = true;
			angular.element($document[0].body).on('click', (e) => {
				this.closeCalendar();
			});
		}
	};

	this.closeCalendar = () => {
		angular.element($document[0].body).off('click');
		datePicker.remove();
		datePicker = null;
		isDatePickerOpen = false;
	};

	this.closeForm = () => {
		saExpensesFormService.destroy();

		// Inform that button module needs to be activated
		$rootScope.$emit('module:saButton:activate');
	};
}]);

saExpensesForm.directive('saExpensesform', function() {
	return {
		restrict: 'E',
		scope: {
			heading: '@'
		},
		replace: true,
		template: formTmpl,
		controller: 'SaveDataController as saveCtrl'
	}
});