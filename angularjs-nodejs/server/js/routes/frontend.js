import _        from 'lodash';
import passport from 'passport';
import request  from 'request';
import Promise  from 'promise';
import paths    from '../config/paths';
import auth     from '../utils/auth';
import settings from '../../node-config';
import dataCtrl from '../controllers/dataController';
import messages from '../utils/messages';

const config = settings[process.env.NODE_ENV];
//TODO: move apiUrls to some config file
const apiUrl = (process.env.NODE_ENV === 'dev') ? config.api.host + ':' + config.api.port : config.api.host;
const quotelioApiUrl = config.quotelioapi.host;

export default (app) => {

    app.get('/:var(dashboard|expense|income)', auth.isLoggedIn, (req, res) => {
        const user = JSON.parse(req.user).user;

        res.render('layouts/main', {
            assets: paths.assets.main,
            assetsCSS: paths.assets.css,
            config: {
                user: {
                    firstname: user.username.split(' ')[0]
                },
                messages: {
                    welcome: messages.getWelcome()
                }
            }
        });
    });

    app.get('/api/:type(expense|income)', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;
        const reqType = req.params.type;

        new Promise((resolve, reject) => {
            request.get(apiUrl + '/' + reqType + '?uid=' + uid, {
                'auth': {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                }
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
           });
        }).then((result) => {
            res.json({message: reqType, data: dataCtrl.getData(result.data)});
        });
    });

    app.get('/api/all/:year', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;

        new Promise((resolve, reject) => {
            request.get(apiUrl + '/all/' + req.params.year + '/' + uid, {
                'auth': {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                }
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
           });
        }).then((result) => {
            res.json(result);
        });
    });

    app.post('/api/:type(expense|income)', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;
        const reqType = req.params.type;

        new Promise((resolve, reject) => {
            const data = JSON.parse(req.body.data);

            request.post(apiUrl + '/' + reqType + '/' + data.type.toLowerCase() + '/' + uid,
                {
                'auth': {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                },
                body: data,
                json: true
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                console.log(body);
                resolve(body);
            }
           });
        }).then((result) => {
            res.json({'title': 'POST', 'status': 'OK', 'id': result.data.itemid});
        });
    });

    app.put('/api/:type(expense|income)', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;
        const reqType = req.params.type;

        new Promise((resolve, reject) => {
            request({
                method: 'PUT',
                url: apiUrl + '/' + reqType + '/' + req.body.type.toLowerCase() + '/' + req.body.itemid + '/' + uid,
                auth: {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                },
                body: JSON.parse(req.body.data),
                json: true
            }, (error, response, body) => {
            if (error)
                console.log('Error: ', error);

            if (!error && response.statusCode == 200) {
                console.log(body);
                resolve(body);
            }
           });
        }).then((result) => {
            res.json({'title': 'PUT', 'status': 'OK', 'id': req.params.id});
        });
    });

    app.delete('/api/:type(expense|income)', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;
        const reqType = req.params.type;

        new Promise((resolve, reject) => {
            request.del(apiUrl + '/' + reqType + '/' + req.body.type.toLowerCase() + '/' + req.body.itemid + '/' + uid,
                {
                'auth': {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                }
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
           });
        }).then((result) => {
            console.log('Delete from API: ', result);
            res.json({'title': 'DELETE', 'status': 'OK', 'id': req.params.id});
        });
    });

    // Savings
    app.get('/api/savings', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;

        new Promise((resolve, reject) => {
            request.get(apiUrl + '/savings?uid=' + uid, {
                'auth': {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                }
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
           });
        }).then((result) => {
            res.json({title: 'GET', status: 'OK', data: (result.data || {}).value});
        });
    });

    app.post('/api/savings', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;

        new Promise((resolve, reject) => {
            request.post(apiUrl + '/savings?uid=' + uid + '&value=' + req.body.value,
                {
                'auth': {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                }
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
           });
        }).then((result) => {
            res.json({'title': 'POST', 'status': 'OK', 'id': result.data});
        });
    });

    app.put('/api/savings', auth.isLoggedIn, (req, res) => {
        const uid = JSON.parse(req.user).user.userid;

        new Promise((resolve, reject) => {
            request({
                method: 'PUT',
                url: apiUrl + '/savings?uid=' + uid + '&value=' + req.body.value,
                auth: {
                    'user': config.api.apiKey,
                    'pass': config.api.apiSecret
                },
                json: true
            }, (error, response, body) => {
            if (error)
                console.log('Error: ', error);

            if (!error && response.statusCode == 200) {
                console.log(body);
                resolve(body);
            }
           });
        }).then((result) => {
            res.json({'title': 'PUT', 'status': 'OK', 'id': req.params.id});
        });
    });

    // Quotelio
    app.get('/api/quote', auth.isLoggedIn, (req, res) => {
        new Promise((resolve, reject) => {
            request.get(quotelioApiUrl + '/dailyquote', {
                'auth': {
                    'user': config.quotelioapi.apiKey,
                    'pass': config.quotelioapi.apiSecret
                }
            }, (error, response, body) => {
            if (error)
                console.log(error);

            if (!error && response.statusCode == 200) {
                const result = JSON.parse(body).data;

                if (!result
                    || typeof result === 'undefined' 
                    || typeof result.quote === 'undefined' 
                    || typeof result.author === 'undefined') {
                    resolve(null);
                } else {
                    resolve({
                        quote: result.quote.en,
                        author: result.author
                    });
                }
            }
           });
        }).then((result) => {
            res.json(result);
        });
    });

    // show the home page (will also have our login links)
    app.get('/', auth.isLoggedIn, (req, res) => {
        console.log('Route: homepage');
        res.redirect('/dashboard');
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
    
    app.get('/login', (req, res) => {
        res.render('content/index', {
            assets: paths.assets.main,
            assetsCSS: paths.assets.css
        });
    });
};