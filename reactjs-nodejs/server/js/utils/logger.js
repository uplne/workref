import winston from 'winston';
import path    from 'path';
import paths   from '../config/paths';

// winston.add(winston.transports.DailyRotateFile, {
// 	datePattern: '.yyyy-MM-dd',
// 	filename: path.join(paths.appRoot, "log_file.log")
// });
winston.info('Test winston');

export default winston;