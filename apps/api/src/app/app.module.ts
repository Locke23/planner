import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '../config/env';
import { AppConfigModule } from '../config/app-config.module';
import { SharedModule } from '../shared/shared.module';
import { IdentityModule } from '../modules/identity/identity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', validate: validateEnv }),
    AppConfigModule,
    SharedModule,
    IdentityModule,
  ],
})
export class AppModule {}
