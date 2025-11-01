import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ 
    description: 'Document filename',
    example: 'invoice-001.pdf'
  })
  @IsString()
  filename!: string;

  @ApiProperty({ 
    description: 'MIME type',
    example: 'application/pdf',
    examples: ['application/pdf', 'text/plain', 'image/png', 'application/msword']
  })
  @IsString()
  mime!: string;

  @ApiProperty({ 
    description: 'Text content of the document (extracted from OCR or file)',
    required: false,
    example: 'Invoice total $1200. Payment due by December 31, 2025.'
  })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ 
    description: 'Primary tag name (required). This becomes the folder name.',
    example: 'invoices-2025'
  })
  @IsString()
  primaryTag!: string;

  @ApiProperty({ 
    description: 'Secondary tag names (optional)',
    type: [String], 
    required: false,
    example: ['financial', 'urgent', 'pending'],
    default: []
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryTags?: string[];
}


