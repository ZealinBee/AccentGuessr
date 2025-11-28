import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global exception filter to prevent server crashes
  app.useGlobalFilters(new AllExceptionsFilter());

  // Allow configuring allowed origins via env (comma-separated),
  // fall back to a small default list. In non-production (dev) we
  // allow all origins to avoid CORS issues while developing locally.
  const defaultAllowed = [
    'http://localhost:3000',
    'https://guesstheaccent.xyz',
  ];
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : defaultAllowed;

  if (process.env.NODE_ENV !== 'production') {
    // Permit all origins in development for convenience (reflects origin).
    app.enableCors({ origin: true, credentials: true } satisfies CorsOptions);
    console.log('CORS enabled for all origins (development)');
  } else {
    // Strict origin checking in production using the configured list.
    app.enableCors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    } satisfies CorsOptions);
    console.log('CORS allowed origins:', allowedOrigins);
  }

  console.log('HELOW');
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
