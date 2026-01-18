import { Body, Controller, Get, Post, Query} from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";
import { getEventsDto } from "./dto/get-event.dto";
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('simple-storage')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value
  @Get("value")
  @ApiOperation({ summary: 'Get latest value from smart contract' })
  @ApiResponse({ status: 200, description: 'Value retrieved successfully' })
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  @Post('events')
  @ApiOperation({ summary: 'Get ValueUpdated events' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getEvents(
    @Body() body: getEventsDto,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.blockchainService.getValueUpdatedEvents(
      body.fromBlock,
      body.toBlock,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

}