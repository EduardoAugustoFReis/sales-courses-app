import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HashingService } from 'src/common/Hash/hash.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, HashingService],
})
export class UsersModule {}
