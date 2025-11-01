import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OcrWebhookDto {
  @ApiProperty({ 
    example: 'scanner-01',
    description: 'Source identifier (scanner/device ID)'
  })
  @IsString()
  source!: string;

  @ApiProperty({ 
    example: 'img_123456',
    description: 'Image/document identifier'
  })
  @IsString()
  imageId!: string;

  @ApiProperty({ 
    example: 'LIMITED TIME SALE! Get 50% off today. unsubscribe: mailto:stop@brand.com',
    description: 'OCR extracted text content'
  })
  @IsString()
  text!: string;

  @ApiPropertyOptional({ 
    type: Object,
    example: { address: '123 Main St', zipCode: '12345' },
    description: 'Optional metadata associated with the scan'
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}

export class OcrWebhookResponseDto {
  @ApiProperty({ 
    example: true,
    description: 'Request processed successfully'
  })
  ok!: boolean;

  @ApiProperty({ 
    enum: ['official', 'ad', 'other'],
    example: 'ad',
    description: 'Content classification: official (financial/legal), ad (promotional), or other'
  })
  category!: 'official' | 'ad' | 'other';
}

