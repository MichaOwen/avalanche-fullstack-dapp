import { Body, Controller, Get, Post, Query} from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";
import { getEventsDto } from "./dto/get-event.dto";

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value
  @Get("value")
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  @Post('events')
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