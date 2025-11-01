import { IsObject, IsArray, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ScopeFolderDto {
  @ApiProperty({ 
    enum: ['folder'],
    example: 'folder',
    description: 'Scope type'
  })
  @IsEnum(['folder'])
  type!: 'folder';

  @ApiProperty({ 
    example: 'invoices-2025',
    description: 'Folder name (primary tag)'
  })
  @IsString()
  name!: string;
}

export class ScopeFilesDto {
  @ApiProperty({ 
    enum: ['files'],
    example: 'files',
    description: 'Scope type'
  })
  @IsEnum(['files'])
  type!: 'files';

  @ApiProperty({ 
    type: [String],
    example: ['672abc123def456', '672abc789ghi012'],
    description: 'Array of document IDs'
  })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

export class MessageDto {
  @ApiProperty({ 
    enum: ['user', 'system', 'assistant'],
    example: 'user',
    description: 'Message role'
  })
  @IsEnum(['user', 'system', 'assistant'])
  role!: string;

  @ApiProperty({ 
    example: 'make a CSV of vendor totals from all invoices',
    description: 'Message content'
  })
  @IsString()
  content!: string;
}

export class RunActionDto {
  @ApiProperty({ 
    description: 'Scope of documents to process. Must be either folder OR files, not both.',
    examples: [
      {
        type: 'folder',
        name: 'invoices-2025'
      },
      {
        type: 'files',
        ids: ['672abc123def456', '672abc789ghi012']
      }
    ]
  })
  @IsObject()
  scope!: ScopeFolderDto | ScopeFilesDto;

  @ApiProperty({ 
    type: [MessageDto],
    description: 'Messages for the processor (e.g., instructions)',
    example: [
      {
        role: 'user',
        content: 'make a CSV of vendor totals'
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages!: MessageDto[];

  @ApiProperty({ 
    type: [String],
    enum: ['make_document', 'make_csv'],
    example: ['make_document', 'make_csv'],
    description: 'Actions to perform. Can include make_document, make_csv, or both.'
  })
  @IsArray()
  @IsEnum(['make_document', 'make_csv'], { each: true })
  actions!: ('make_document' | 'make_csv')[];
}

