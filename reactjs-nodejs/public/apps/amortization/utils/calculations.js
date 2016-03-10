import Dater from './date';

export function monthlyPayment(interestRateYearly, mortgageTerm, mortgageAmount) {
	const interestRateMonthly = (interestRateYearly / 100) / 12;
	const mortgageTermMonths = mortgageTerm * 12;
	const pow = Math.pow(1 + interestRateMonthly, mortgageTermMonths);
	
	return (((mortgageAmount * interestRateMonthly) * pow) / (pow - 1)).toFixed(2);
};

export function computeSchedule(mortgageAmount, interestRateYearly, mortgageTerm, monthlyPayment) {
    let schedule = [];
    let remaining = mortgageAmount;
    let totalInterest = 0;
    const numberOfPayments = 12 * mortgageTerm;

    for (let i = 0; i <= numberOfPayments; i++) {
    	const interestRateMonthly = (interestRateYearly / 100) / 12;
        const interest = remaining * interestRateMonthly;
        const principle = monthlyPayment - interest;
        let dater = new Dater(new Date());

        dater.addMonths(i);
        remaining -= principle;
        totalInterest += interest;
        
        const row = [
        	dater.formatted(),
        	principle > 0 ? (principle < monthlyPayment ? principle : monthlyPayment) : 0,
        	interest > 0 ? interest : 0,
        	Math.round(remaining) > 1 ? remaining : 0
        ];

        if (remaining > 0) {
            schedule.push(row);
        }
    }

    return {
    	schedule: schedule.map((n) => { 
        	return {
                date: n[0],
                principal: Math.round(n[1]),
                interest: Math.round(n[2]),
                balance: Math.round(n[3])
            };
    	}),
    	payoffDate: getPayoffDate(mortgageTerm),
		totalInterestPaid: Math.round(totalInterest),
		totalPaid: Math.round(mortgageAmount + totalInterest)
    };
};

export function getPayoffDate(mortgageTerm) {
	let date = new Dater(new Date());
	date.addMonths(mortgageTerm * 12);

	return date.formatted();
};