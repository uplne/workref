import path   from 'path';
import config from '../../node-config';

const appRoot = path.resolve(__dirname, '../../../');
const serverSettings = config[process.env.NODE_ENV];

export default {
    'appRoot': appRoot,
    'config' : path.join(appRoot, 'node-config.js'),
    'assets' : {
    	main: '/public',
    	css: serverSettings.assets.css
    },
    'views'  : path.join(appRoot, 'server/views')
};