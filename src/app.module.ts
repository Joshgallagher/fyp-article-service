import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === 'test'
        ? '.env.test'
        : '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<String>('HOST'),
        port: configService.get<Number>('PORT'),
        username: configService.get<String>('USERNAME'),
        password: configService.get<String>('PASSWORD'),
        database: configService.get<String>('DATABASE'),
        // entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      } as TypeOrmModuleOptions),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
