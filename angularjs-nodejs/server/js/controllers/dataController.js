import _ from 'lodash';
// DEPRECATED
// We are now processing data on the client side. We are probably not going to handle that many data
// so it should be safe to do it in client. But this strategy can change in the future if we will experience
// performance issues.
const api = {
	getData: (data) => {
		if (data.length === 0) {
			return [];
		}

		const result = {
			expense: {},
			income: {},
			savings: {}
		};

		// Prepare expenses
		result.expense.all = _.groupBy(data.expense, (item) => item.type);
		result.expense.total = api.getTotals(result.expense.all);

		// Prepare income
		result.income.all = _.groupBy(data.income, (item) => item.type);
		result.income.total = api.getTotals(result.income.all);

		// Prepare savings
		result.savings.all = _.groupBy(data.savings, (item) => item.type);

		return result;
	},

	getTotals: (data) => {
		return {
			yearly: {
	            total: api.totalYearly(data).toFixed(2),
	            variable: api.totalYearlyVariable(data),
	            fixed: api.totalYearlyFixed(data)
	        },
	        monthly: {
	            total: api.totalMonthly(data).toFixed(2),
	            variable: api.totalMonthlyVariable(data),
	            fixed: api.totalMonthlyFixed(data)
	        }
	    };
	},

	totalYearly: (data) => {
		return api.totalYearlyVariable(data) + api.totalYearlyFixed(data);
	},

	totalMonthly: (data) => {
	    return api.totalMonthlyVariable(data) + api.totalMonthlyFixed(data);
	},

	totalMonthlyVariable: (data) => {
	    return _.chain(data.variable)
	                .filter((item) => new Date(item.created).getMonth() === new Date().getMonth())
	                .reduce((total, item) => total + item.value, 0)
	                .floor(2)
	                .value();
	},

	totalMonthlyFixed: (data) => {
	    return _.chain(data.fixed)
	                .filter('iteration', 'monthly')
	                .reduce((total, item) => {
	                	if (item.to && new Date(item.to).getMonth() <= new Date().getMonth()) {
	                		return total;
	                	} else {
							return total + item.value;
						}
	                }, 0)
	                .floor(2)
	                .value();
	},

	totalYearlyVariable: (data) => {
	    return _.chain(data.variable)
	                .reduce((total, item) => total + item.value, 0)
	                .floor(2)
	                .value();
	},

	totalYearlyFixed: (data) => {
	    return _.chain(data.fixed)
	                .filter('iteration', 'monthly')
	                .reduce((total, item) => {
	                	let totaltime = 1;

	                	if (item.to) {
	                		totaltime = new Date(item.to).getMonth() - new Date(item.created).getMonth();
	                	} else {
						// Actual month minus month of creation + 1 as it should be counted at least once
							totaltime = new Date().getMonth() - new Date((item.to) ? item.to : item.created).getMonth() + 1;
						}

						return total + (item.value * totaltime);
					}, 0)
					.floor(2)
					.value();
	}
};

export default api;