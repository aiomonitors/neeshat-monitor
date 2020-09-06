import { createLogger, format, transports } from 'winston';

const logger = createLogger({
	format: format.combine(
		format.timestamp(),
		format.cli(),
		format.simple(),
		format.errors({ stack: true }),
		format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`),
	),
	transports: [
		new transports.Console(),
	]
});

export default logger;