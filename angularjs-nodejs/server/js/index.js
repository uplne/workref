import express        from 'express';
import session        from 'express-session';
import methodOverride from 'method-override';
import cookieParser   from 'cookie-parser';
import bodyParser     from 'body-parser';
import favicon        from 'serve-favicon';
import errorHandler   from 'errorhandler';
import passport       from 'passport';
import path           from 'path';
import config         from '../node-config';
import routes         from './routes';
import paths          from './config/paths';
import flash          from 'connect-flash';
import logger         from './utils/logger'; 

const serverSettings = config[process.env.NODE_ENV];

var app;

function init() {
    app = express();

    setupServer();
}

function setupServer() {
    // Configure server
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: 'secret',
        saveUninitialized: true,
        resave: true
    }));
    app.use(favicon(path.join(paths.appRoot, 'public/images/favicon.ico')));
    app.use('/public', express.static(path.join(paths.appRoot, 'public')));
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(flash());

    // Session-persisted message middleware
    app.use((req, res, next) => {
        var err = req.session.error,
            msg = req.session.notice,
            success = req.session.success;

        delete req.session.error;
        delete req.session.success;
        delete req.session.notice;  

        if (err) res.locals.error = err;
        if (msg) res.locals.notice = msg;
        if (success) res.locals.success = success;  

        next();
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.set('views', paths.views);
    app.set('view engine', 'ejs');

    app.use(function logger(req, res, next) {
        console.log(new Date(), req.method, req.url);
        next();
    });

    // Start server
    app.listen(serverSettings.server.port, () => {
        console.log('Express server listening on port %d in %s mode', serverSettings.server.port, app.settings.env);
    });

    routes.frontend(app);
    routes.auth(app);
};

export default init;