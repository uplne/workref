import angular from 'angular';
import _       from 'lodash';

export var datastore = angular.module('sa.datastore', []);

//TODO: don't use emit, create pub/sub
datastore.service('DataStore', [function() {	
	const api = {
		save: (data, fromServer, store, title) => {
			const month = new Date(data.created).getMonth();
			// We added new item
			data.itemid = fromServer.data.id;

			if (!store.all[data.type]) {
				store.all[data.type] = {};
			}

			if (data.type === 'variable') {
				if (!store.all[data.type][month]) {
					store.all[data.type][month] = {};
				}

				if (!store.all[data.type][month][title]) {
					store.all[data.type][month][title] = [];
				}

				store.all[data.type][month][title].push(data);
			} else {
				if (!store.all[data.type][title]) {
					store.all[data.type][title] = [];
				}

				store.all[data.type][title].push(data);
			}

			api.updateTotals(store);
		},

		edit: (data, store, original) => {
			// When we are stopping fixed property
			if (original && data.type === 'fixed') {
				original.to = data.to;
				original.state = data.state;
			}

			api.updateTotals(store);
		},

		remove: (data, store, title) => {
			const month = new Date().getMonth();
			const toRemove = (data.type === 'variable') ? store.all[data.type][month][title] : store.all[data.type][title];

			_.remove(toRemove, (item) => item === data);

			api.updateTotals(store);
		},

		processData: (data) => {
			return new Promise((resolve, reject) => {
				if (data.length === 0) {
					return [];
				}

				const sortedByMonth = api.populateVariableResults(data);
				const resultsByDate = {
					all:{
						variable: sortedByMonth,
						fixed: {
							expense: _.filter(data.expense, (item) => item.type === 'fixed'),
							income: _.filter(data.income, (item) => item.type === 'fixed')
						}
					},
					savings: data.savings
				};

				resultsByDate.totals = {
					yearly: api.totalYear(resultsByDate),
					monthly: api.totalMonth(resultsByDate)
				};

				resolve(resultsByDate);
			});
		},

		populateVariableResults: (data) => {
			const results = {};
			const types = ['expense', 'income'];

			_.forEach(types, (type) => {
				_.forEach(data[type], (item) => {
					const date = new Date(item.created).getMonth();

					if (!results[date]) {
						results[date] = {};
					}

					if (!results[date][type]) {
						results[date][type] = [];
					}

					if (item.type === 'variable') {
						results[date][type].push(item);
					}
				});
			});

			return results;
		},

		totalYear: (data) => {
			let results = {
				expense: {
					total: 0,
					fixed: 0,
					variable: 0
				},
				income: {
					total: 0,
					fixed: 0,
					variable: 0
				}
			};

			// Get yearly total
			if (data.all.variable) {
				_.forEach(data.all.variable, (item) => {
					if (item.expense) {
						_.forEach(item.expense, (expense) => {
							results.expense.total += parseFloat(expense.value);
							results.expense.variable += parseFloat(expense.value);
						});
					}
					if (item.income) {
						_.forEach(item.income, (income) => {
							results.income.total += parseFloat(income.value);
							results.income.variable += parseFloat(income.value);
						});
					}
				});
				
				const totalFixedExpenseYear = api.totalYearlyFixed(data.all.fixed.expense);
				results.expense.total += totalFixedExpenseYear;
				results.expense.fixed = totalFixedExpenseYear;

				const totalFixedIncomeYear = api.totalYearlyFixed(data.all.fixed.income);
				results.income.total += totalFixedIncomeYear;
				results.income.fixed = totalFixedIncomeYear;
			}

			return results;
		},

		totalMonth: (data) => {
			let results = {};

			// Go through all variable 
			if (data.all.variable) {
				_.forEach(data.all.variable, (month, key) => {
					// Make sure we have month object
					if (!results[key]) {
						results[key] = {};
					}

					if (month.expense) {
						// If there are no results, make sure that we create a new object
						if (month.expense.length === 0) {
							results[key].expense = {
								total: 0,
								variable: 0,
								fixed: 0
							};
						} else {
							_.forEach(month.expense, (item) => {
								if (!results[key]) {
									results[key] = {};
								}

								if (!results[key].expense) {
									results[key].expense = {
										total: 0,
										variable: 0,
										fixed: 0
									}
								}

								results[key].expense.total += parseFloat(item.value);
								results[key].expense.variable += parseFloat(item.value);
							});
						}
					}

					if (month.income) {
						// If there are no results, make sure that we create a new object
						if (month.income.length === 0) {
							results[key].income = {
								total: 0,
								variable: 0,
								fixed: 0
							};
						} else {
							_.forEach(month.income, (item) => {
								if (!results[key]) {
									results[key] = {};
								}

								if (!results[key].income) {
									results[key].income = {
										total: 0,
										variable: 0,
										fixed: 0
									};
								}

								results[key].income.total += parseFloat(item.value);
								results[key].income.variable += parseFloat(item.value);
							});
						}
					}
				});
			}

			// Go through all fixed
			if (data.all.fixed) {
				const date = new Date();
				const nowMonth = date.getMonth();

				// Expenses
				_.forEach(data.all.fixed.expense, (expense) => {
					// Check for what months it should be applied
					let startMonth = 0;
					let finalMonth = 0;
					const isThisYear = new Date(expense.created).getFullYear() === new Date().getFullYear();
					const createdIn = (isThisYear) ? expense.created : new Date(new Date(2015, 0)).getTime();

					// If different year and already stopped then return
					if (!isThisYear && expense.to) {
						return;
					}

					if (expense.to) {
						startMonth = new Date(createdIn).getMonth();
						finalMonth = new Date(expense.to).getMonth();
					} else {
						startMonth = new Date(createdIn).getMonth();
						finalMonth = nowMonth + 1; // Make sure that it will count at least once
					}

					for (let i = startMonth; i < finalMonth; i++) {
						if (!results[i]) {
							results[i] = {};
						}

						if (!results[i].expense) {
							results[i].expense = {
								total: 0,
								variable: 0,
								fixed: 0
							}
						}

						results[i].expense.total += parseFloat(expense.value);
						results[i].expense.fixed += parseFloat(expense.value);
					}
				});

				_.forEach(data.all.fixed.income, (income) => {
					// Check for what months it should be applied
					let startMonth = 0;
					let finalMonth = 0;
					const isThisYear = new Date(income.created).getFullYear() === new Date().getFullYear();
					const createdIn = (isThisYear) ? income.created : new Date(new Date(2015, 0)).getTime();

					// If different year and already stopped then return
					if (!isThisYear && income.to) {
						return;
					}

					if (income.to) {
						startMonth = new Date(createdIn).getMonth();
						finalMonth = new Date(income.to).getMonth();
					} else {
						startMonth = new Date(createdIn).getMonth();
						finalMonth = nowMonth + 1; // Make sure that it will count at least once
					}

					for (let i = startMonth; i < finalMonth; i++) {
						if (!results[i]) {
							results[i] = {};
						}

						if (!results[i].income) {
							results[i].income = {
								total: 0,
								variable: 0,
								fixed: 0
							}
						}

						results[i].income.total += parseFloat(income.value);
						results[i].income.fixed += parseFloat(income.value);
					}
				});
			}

			return results;
		},

		getTotals: (data) => {
			return {
				yearly: api.totalYear(data),
				monthly: api.totalMonth(data)
		    };
		},

		updateTotals: (store) => {
			store.totals = api.getTotals(store);
		},

		totalYearlyFixed: (data) => {
		    return _.chain(data)
		                .filter('iteration', 'monthly')
		                .reduce((total, item) => {
		                	let totaltime = 1;
		                	const isThisYear = new Date(item.created).getFullYear() === new Date().getFullYear();
		                	const createdIn = (isThisYear) ? item.created : new Date(new Date(2015, 0)).getTime();

		                	// If different year and already stopped then return
		                	if (!isThisYear && item.to) {
		                		return total;
		                	}

		                	if (item.to) {
		                		totaltime = new Date(item.to).getMonth() - new Date(createdIn).getMonth();
		                	} else {
							// Actual month minus month of creation +1 as it should be counted at least once
								totaltime = (new Date().getMonth() - new Date((item.to) ? item.to : createdIn).getMonth()) + 1;
							}

							return total + (parseFloat(item.value) * totaltime);
						}, 0)
						.floor(2)
						.value();
		}
	};

	return api;
}]);