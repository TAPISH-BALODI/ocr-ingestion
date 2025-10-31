import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Document filename' })
  @IsString()
  filename!: string;

  @ApiProperty({ description: 'MIME type' })
  @IsString()
  mime!: string;

  @ApiProperty({ description: 'Text content of the document', required: false })
  @IsOptional()
  @IsString()
  textContent?: string;

  @ApiProperty({ description: 'Primary tag name (required)' })
  @IsString()
  primaryTag!: string;

  @ApiProperty({ description: 'Secondary tag names', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  secondaryTags?: string[];
}


