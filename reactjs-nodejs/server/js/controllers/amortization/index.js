import React            from 'react';
import { Provider }     from 'react-redux';
import ReactDOMServer   from 'react-dom/server';
import paths            from '../../config/paths';

import configureStore   from '../../../../public/apps/amortization/utils/configureStore';
import {monthlyPayment} from '../../../../public/apps/amortization/utils/calculations';
import App              from '../../../../public/apps/amortization/components/App.react';

exports.amortizationCalculator = (req, res, next) => {
	const store = configureStore();
	const initState = store.getState();
	const monthPayment = monthlyPayment(initState.form.interestRate, initState.form.mortgageTerm, initState.form.mortgageAmount);

	store.dispatch({
        type:       'REQUEST_RESULT_UPDATE',
        id:         'mortgageMonthlyPayment',
        value:      monthPayment,
        receivedAt: Date.now()
    });

	const reactOutput = ReactDOMServer.renderToString(
        <Provider store={store}>
        	<App/>
        </Provider>
    );

    res.render('content/amortization/amortization-calculator', {
        assets: paths.assets.main,
        assetsCSS: paths.assets.css,
        reactOutput: reactOutput,
        initialState: JSON.stringify(store.getState())
    });
};