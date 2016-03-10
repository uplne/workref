import paths from '../config/paths';
import {
	amortizationCalculator
} from '../controllers/amortization';

export default (app) => {
    app.get('/', (req, res) => {
        res.render('content/index', {
            assets: paths.assets.main,
            assetsCSS: paths.assets.css
        });
    });

    app.get('/amortization/amortization-calculator', amortizationCalculator);
};