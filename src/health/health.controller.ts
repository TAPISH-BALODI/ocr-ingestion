import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Public endpoint to check if the API is running. No authentication required.'
  })
  @ApiResponse({ 
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        ok: {
          type: 'boolean',
          example: true
        }
      }
    }
  })
  get() { return { ok: true }; }
}
