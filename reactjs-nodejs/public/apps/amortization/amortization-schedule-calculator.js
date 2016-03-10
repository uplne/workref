import React          from 'react';
import { render }     from 'react-dom';
import Provider       from 'react-redux/lib/components/Provider';
import configureStore from './utils/configureStore';

import App            from './components/App.react';

// make react available to dev tool
if (!window.React) {
    window.React = React;
}

const store = configureStore(window._initialState);

render(
	<Provider store={store}> 
	 	<App />
	</Provider>,
	document.getElementById('amortization-calculator')
);