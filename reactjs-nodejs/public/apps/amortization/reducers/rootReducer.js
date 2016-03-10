import combineReducers from 'redux/lib/combineReducers';

import form from './form';
import results from './results';

const rootReducer = combineReducers({
	form,
	results
});

export default rootReducer;