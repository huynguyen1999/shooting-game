import { Module } from '@nestjs/common';
import { GatewayModule } from './modules';
@Module({
  imports: [GatewayModule],
})
export class AppModule {}
