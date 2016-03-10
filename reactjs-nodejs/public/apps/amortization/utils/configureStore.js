import createStore      from 'redux/lib/createStore';
import applyMiddleware  from 'redux/lib/applyMiddleware';
import thunkMiddleware  from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import rootReducer      from '../reducers/rootReducer';

const logger = loggerMiddleware();
const createStoreWithMiddleware = applyMiddleware(
	thunkMiddleware,
	logger
)(createStore);

export default function configureStore(initialState) {
	return createStoreWithMiddleware(rootReducer, initialState);
}