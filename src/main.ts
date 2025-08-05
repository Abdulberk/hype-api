import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV === 'development',
      maxParamLength: 5000, // For large geospatial queries
    }),
  );

  // Register compression plugin for response optimization
  const fastifyInstance = app.getHttpAdapter().getInstance();
  const compress = await import('@fastify/compress');
  await fastifyInstance.register(compress.default, {
    global: true,
    encodings: ['gzip', 'deflate', 'br'], // brotli, gzip, deflate
    threshold: 15360, // Only compress responses > 15KB (15KB * 1024 = 15360 bytes)
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend integration
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API running on port ${port} with compression enabled`);
}
bootstrap();
