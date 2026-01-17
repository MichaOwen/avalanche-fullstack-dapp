import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  blockNumber: string;

  @Column()
  value: string;

  @Column()
  txHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
