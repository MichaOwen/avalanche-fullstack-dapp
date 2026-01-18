import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { createPublicClient, http, PublicClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './entities/blockchain.entity';


@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;
  
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
  ){
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
    });

    
    // GANTI dengan address hasil deploy Day 2
    this.contractAddress =
      '0x37669D47B8E42B60DB8907696990fFa5027423f6' as `0x${string}`;
  }

  // 🔹 Read latest value
  async getLatestValue() {
    try {
      const value: bigint = (await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE.abi,
        functionName: 'getValue',
      })) as bigint;

      return {
        success: true,
        data: {
          value: value.toString(),
        },
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events
  async getValueUpdatedEvents(fromBlock: number, toBlock: number, page = 1, limit = 10) {
    try {
      
      if (toBlock - fromBlock > 2000) {
        throw new BadRequestException(
          'Block range terlalu besar, maksimal 2000 block',
        );
      }

    const events = await this.client.getLogs({
      address: this.contractAddress,
      event: {
        type: 'event',
        name: 'ValueUpdated',
        inputs: [{ name: 'newValue', type: 'uint256', indexed: false }],
      },
      fromBlock: BigInt(fromBlock),
      toBlock: BigInt(toBlock),
    });


    const savedEvents = [];
    for (const event of events) {
      const exists = await this.eventRepo.findOne({ where: { txHash: event.transactionHash } });
      if (!exists) {
        await this.eventRepo.save(
          this.eventRepo.create({
            blockNumber: event.blockNumber?.toString(),
            value: event.args.newValue?.toString(),
            txHash: event.transactionHash,
          }),
        );
      }
    }

    const start = (page - 1) * limit;
    const [pagedEvents, total] = await this.eventRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

      return {
        success: true,
        meta: {
          total,
          page,
          limit,
        },
        data: events.map((event) => ({
          blockNumber: event.blockNumber?.toString(),
          value: event.args.newValue?.toString(),
          txHash: event.transactionHash,
        })),
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);

    console.log({ error: message });


    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Silakan coba beberapa saat lagi.',
      );
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed')
    ) {
      throw new ServiceUnavailableException(
        'Tidak dapat terhubung ke blockchain RPC.',
      );
    }

    throw new InternalServerErrorException(
      'Terjadi kesalahan saat membaca data blockchain.',
    );
  }
}