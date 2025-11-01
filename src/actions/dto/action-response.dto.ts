import { ApiProperty } from '@nestjs/swagger';

export class CreatedDocumentDto {
  @ApiProperty({ 
    example: '672abc789def012',
    description: 'Document ID'
  })
  id!: string;

  @ApiProperty({ 
    example: 'generated.txt',
    description: 'Generated filename'
  })
  filename!: string;
}

export class RunActionResponseDto {
  @ApiProperty({ 
    type: [CreatedDocumentDto],
    description: 'List of created documents',
    example: [
      { id: '672abc789', filename: 'generated.txt' },
      { id: '672abc790', filename: 'generated.csv' }
    ]
  })
  created!: CreatedDocumentDto[];

  @ApiProperty({ 
    example: 5,
    description: 'Credits consumed (always 5 per action)'
  })
  credits!: number;
}

export class UsageResponseDto {
  @ApiProperty({ 
    example: 25,
    description: 'Total credits consumed this month'
  })
  credits!: number;
}

