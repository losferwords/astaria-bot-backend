import express from 'express';
import cookieParser from 'cookie-parser';
import log4js from 'log4js';
import { corsRules } from './middleware/cors';
import { httpErrorHandler } from './middleware/httpError';
import { errorHandler } from './middleware/errorHandler';
import { BattleController } from './controllers/battle.controller';
import { Server } from 'typescript-rest';

const app = express();

const logger = log4js.getLogger('server');
logger.level = 'debug';

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(corsRules);

Server.ignoreNextMiddlewares(true);
Server.buildServices(app, BattleController);

app.use(httpErrorHandler);
app.use(errorHandler);

app.listen(+process.env.PORT, () => {
  logger.info('Server is listening on port ' + process.env.PORT);
});
