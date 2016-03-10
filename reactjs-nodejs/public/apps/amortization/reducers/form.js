import {
    REQUEST_FORM_UPDATE
} from '../actionCreators/form';

const initialState = {
    mortgageAmount: 250000,
    mortgageTerm: 25,
    mortgageTermType: 'years',
    interestRate: 4,
    startDate: 'March'
};

export default function form(state = initialState, action) {
  switch (action.type) {
    case REQUEST_FORM_UPDATE:
        return Object.assign({}, state, {
            [action.id]: action.value
        });

    default:
      return state
  }
}