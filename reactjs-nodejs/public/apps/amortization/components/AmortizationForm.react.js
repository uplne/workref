import React       from 'react';
import connect     from 'react-redux/lib/components/connect';

import TextField   from './formElements/TextField.react';
import Button      from './formElements/Button.react';
import RadioButton from './formElements/RadioButton.react';
import Select      from './formElements/Select.react';

import {
    requestFormUpdate
} from '../actionCreators/form';

import {
	requestResultUpdate,
    requestResultsUpdate
} from '../actionCreators/results';

import {
	monthlyPayment,
	computeSchedule
} from '../utils/calculations';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = (function generateYears() {
	const min = new Date().getFullYear() - 20;
	const max = new Date().getFullYear() + 100;
	const years = [];

	for(let i = min; i <= max; i++) {
		years.push(i);
	}

	return {
		yearsList: years,
		id: 20
	};
}());

export default class AmortizationForm extends React.Component {
	constructor(props) {
		super(props);

		this.calculate = this.calculate.bind(this);
		this.handleChanges = this.handleChanges.bind(this);
	}

	componentDidMount() {
		this.getMonthlyPayment();
	}

	calculate() {
		const {dispatch, form, results} = this.props;
		const computedScheduleData = computeSchedule(form.mortgageAmount, form.interestRate, form.mortgageTerm, results.mortgageMonthlyPayment);
		
		dispatch(requestResultsUpdate(computedScheduleData));
	}

	handleChanges(id, value) {
		const {dispatch} = this.props;
		dispatch(requestFormUpdate(id, value));
	}

	getMonthlyPayment() {
		const {dispatch, form} = this.props;
		dispatch(requestResultUpdate('mortgageMonthlyPayment', monthlyPayment(form.interestRate, form.mortgageTerm, form.mortgageAmount)));
	}

	render() {
		const {form, results} = this.props;

		return (
			<form className="form box" action="post" method="/">
				<div className="form__row grid">
					<label className="form__label grid__item grid-quarter">Mortgage amount: </label>
					<TextField 
                        id="mortgageAmount"
                        classNames="input grid__item grid-quarter"
                        value={form.mortgageAmount}
                        onChange={this.handleChanges} />
				</div>
				<div className="form__row grid">
					<label className="form__label grid__item grid-quarter">Mortgage term: </label>
					<TextField
                        id="mortgageTerm"
                        classNames="input grid__item grid-quarter"
                        value={form.mortgageTerm}
                        onChange={this.handleChanges} />
                        <radiogroup className="grid__item grid-one-third radiogroup">
							<RadioButton
								id="termYears"
								name="mortgageTerm"
								classNames="radio"
								label="Years"
								defaultChecked="true" />
							<RadioButton
								id="termMonths"
								name="mortgageTerm"
								classNames="radio"
								label="Months" />
                        </radiogroup>
				</div>
				<div className="form__row grid">
					<label className="form__label grid__item grid-quarter">Interest rate per year %: </label>
					<TextField
                        id="interestRate"
                        classNames="input grid__item grid-quarter"
                        value={form.interestRate}
                        onChange={this.handleChanges} />
				</div>
				<div className="form__row grid">
					<label className="form__label grid__item grid-quarter">Start date: </label>
					<Select
						options={months}
						activeOption={new Date().getMonth()}
						classNames="select u-mr--half" />
					<Select
						options={years.yearsList}
						activeOption={years.id}
						classNames="select" />
				</div>
				<div className="form__row grid">
					<div className="grid__item grid-half form__rightalign">
						<Button
	                        title="Calculate"
	                        type="button"
	                        classNames="btn btn--primary"
	                        onClick={this.calculate} />
	                </div>
				</div>
				<p>Monthly amount: {results.mortgageMonthlyPayment}</p>
				<p>Pay-off Date: {results.payoffDate}</p>
				<p>Total Interest Paid: {results.totalInterestPaid}</p>
				<p>Total Paid: {results.totalPaid}</p>
				<table className="table table--full table--simpleborder">
            		<thead className="table__head">
            			<tr>
            				<td>Index</td>
            				<td>Principal</td>
            				<td>Interest</td>
            				<td>Balance</td>
            			</tr>
            		</thead>
            		<tbody>
	                    { results.schedule.map((item, i) => {
	                        return (
	                            <tr key={i}>
	                            	<td>{item.date}</td>
	                            	<td>{item.principal}</td>
	                            	<td>{item.interest}</td>
	                            	<td>{item.balance}</td>
	                            </tr>
	                        );
	                    })}
	                </tbody>
                </table>
			</form>
		);
	}
}

function mapStateToProps(state) {
    return {
        form: {
        	mortgageAmount: state.form.mortgageAmount,
		    mortgageTerm: state.form.mortgageTerm,
		    mortgageTermType: state.form.mortgageTermType,
		    interestRate: state.form.interestRate,
		    startDate: state.form.startDate
        },
        results: {
        	mortgageMonthlyPayment: state.results.mortgageMonthlyPayment,
        	schedule: state.results.schedule,
        	payoffDate: state.results.payoffDate,
		    totalInterestPaid: state.results.totalInterestPaid,
		    totalPaid: state.results.totalPaid
        }
    }
}

export default connect(mapStateToProps)(AmortizationForm);