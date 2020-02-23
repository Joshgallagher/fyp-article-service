import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Article } from './article/article.entity';
import { ArticlesModule } from './article/articles.module';
import { ArticleSubscriber } from './article/article.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env'
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [Article],
        subscribers: [ArticleSubscriber],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ArticlesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
