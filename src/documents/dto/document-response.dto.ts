import { ApiProperty } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({ 
    example: '672abc123def456',
    description: 'Document ID'
  })
  _id!: string;

  @ApiProperty({ 
    example: 'user123',
    description: 'Owner user ID'
  })
  ownerId!: string;

  @ApiProperty({ 
    example: 'invoice-001.pdf',
    description: 'Document filename'
  })
  filename!: string;

  @ApiProperty({ 
    example: 'application/pdf',
    description: 'MIME type'
  })
  mime!: string;

  @ApiProperty({ 
    example: 'Invoice total $1200. Payment due.',
    description: 'Text content',
    required: false
  })
  textContent?: string;

  @ApiProperty({ 
    example: '2025-10-30T12:00:00.000Z',
    description: 'Creation timestamp'
  })
  createdAt!: Date;
}

export class FolderDto {
  @ApiProperty({ 
    example: 'invoices-2025',
    description: 'Folder name (primary tag)'
  })
  name!: string;

  @ApiProperty({ 
    example: 5,
    description: 'Number of documents in folder'
  })
  count!: number;
}

