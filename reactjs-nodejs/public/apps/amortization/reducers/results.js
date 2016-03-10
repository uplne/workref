import {
    REQUEST_RESULT_UPDATE,
    REQUEST_RESULTS_UPDATE
} from '../actionCreators/results';

const initialState = {
    mortgageMonthlyPayment: 0,
    schedule: [],
    payoffDate: 0,
    totalInterestPaid: 0,
    totalPaid: 0
};

export default function results(state = initialState, action) {
  switch (action.type) {
    case REQUEST_RESULT_UPDATE:
        return Object.assign({}, state, {
            [action.id]: action.value
        });

    case REQUEST_RESULTS_UPDATE:
        return Object.assign({}, state, action.obj);

    default:
        return state
  }
}