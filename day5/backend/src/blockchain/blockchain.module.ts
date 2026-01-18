import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { EventEntity } from './entities/blockchain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  controllers: [BlockchainController],
  providers: [BlockchainService],
})
export class BlockchainModule {}
