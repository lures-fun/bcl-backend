import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  // NOTE: export ALLOWED_CORS_ORIGINS=http://localhost:3001,http://example.com
  const allowedOrigins = process.env.ALLOWED_CORS_ORIGINS?.split(',') || [
    'http://localhost:18080',
    'http://localhost:3000',
  ];
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.NODE_ENV === 'dev') {
    SwaggerModule.setup(
      'api',
      app,
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder()
          .setTitle('BCL')
          .setDescription('develop in local')
          .setVersion('1.0')
          .addBearerAuth()
          .addServer('http://localhost:3000')
          .addServer('http://localhost:3001')
          .addServer('http://localhost:3002')
          .build(),
        {
          operationIdFactory: (_: string, methodKey: string) => methodKey,
        },
      ),
    );
  }
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  app.disable('x-powered-by');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS. origin: ' + origin));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  app.use(helmet());
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
