import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {

  const logger = new Logger('Payments-ms')

  const app = await NestFactory.create(AppModule, {
    rawBody: true //manda el body como un buffer para validar el webhook de stripe
  });


  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      })
  );
  

  
  

  await app.listen(envs.port ?? 3006);
  logger.log(`Payments Microservice is running on port ${envs.port}`);
}
bootstrap();
