import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env'
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
