import express        from 'express';
import methodOverride from 'method-override';
import bodyParser     from 'body-parser';
import favicon        from 'serve-favicon';
import errorHandler   from 'errorhandler';
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
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    //app.use(favicon(path.join(paths.appRoot, 'public/images/favicon.ico')));
    app.use('/public', express.static(path.join(paths.appRoot, 'public')));
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
    app.use(flash());
    app.disable('x-powered-by');

    app.set('views', paths.views);
    app.set('view engine', 'ejs');

    // Start server
    app.listen(serverSettings.server.port, () => {
        console.log('Express server listening on port %d in %s mode', serverSettings.server.port, app.settings.env);
    });

    routes.front(app);
};

export default init;