import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainModule } from './blockchain/blockchain.module';
import { EventEntity } from './blockchain/entities/blockchain.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'events.db',
      entities: [EventEntity],
      synchronize: true,
    }),
    BlockchainModule,
  ],
})
export class AppModule {}
