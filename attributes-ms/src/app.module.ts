import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttributesModule } from './attributes/attributes.module';

@Module({
  imports: [AttributesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
