import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ALLOWED_ORIGINS, PORT } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ALLOWED_ORIGINS,
  });
  await app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
}
bootstrap();
