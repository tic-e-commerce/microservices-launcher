import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';

@Module({
  imports: [UserPreferencesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
