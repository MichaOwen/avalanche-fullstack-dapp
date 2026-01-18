import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Simple Strorage dApp API')
    .setDescription('The simple storage dApp API description \n\nNama : Owen Adriansyah \n NIM : 251011401279')
    .setVersion('1.0')
    .addTag('simple-storage')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => { 
  console.error('Error during app bootstrap:', err);
  process.exit(1);
});
