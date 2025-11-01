import { ApiProperty } from '@nestjs/swagger';

export class MetricsResponseDto {
  @ApiProperty({ 
    example: 123,
    description: 'Total number of documents'
  })
  docs_total!: number;

  @ApiProperty({ 
    example: 7,
    description: 'Total number of folders (primary tags)'
  })
  folders_total!: number;

  @ApiProperty({ 
    example: 42,
    description: 'Number of actions run this month'
  })
  actions_month!: number;

  @ApiProperty({ 
    example: 5,
    description: 'Number of tasks created today'
  })
  tasks_today!: number;
}

