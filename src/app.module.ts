import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaceModule } from './modules/place.module';
import { TradeAreaModule } from './modules/trade-area.module';
import { HomeZipcodesModule } from './modules/home-zipcodes.module';
import { CompetitorModule } from './modules/competitor.module';
import { ZipcodeModule } from './modules/zipcode.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
        maxPoolSize: parseInt(configService.get('DB_MAX_POOL_SIZE', '50')),
        serverSelectionTimeoutMS: parseInt(
          configService.get('DB_SERVER_SELECTION_TIMEOUT', '5000'),
        ),
        socketTimeoutMS: parseInt(
          configService.get('DB_SOCKET_TIMEOUT', '45000'),
        ),
      }),
      inject: [ConfigService],
    }),
    PlaceModule,
    TradeAreaModule,
    HomeZipcodesModule,
    CompetitorModule,
    ZipcodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
