import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
//import { ConfigService } from './config/config.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');

  const configOpenApi = new DocumentBuilder()
    .setTitle('NIEM API')
    .setDescription('NIEM API using Swagger')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, configOpenApi);
  SwaggerModule.setup('api', app, document);

  //app.setGlobalPrefix('api');
  const config = app.get(ConfigService);
  //console.log(`PORT: ${await config.getPortConfig()}`)
  console.log(`PORT: ${config.get('PORT')}`);
  await app.listen(config.get('PORT'));
}
bootstrap();
