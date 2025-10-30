export class CreateDocumentDto {
  filename!: string;
  mime!: string;
  textContent?: string;
  primaryTag!: string; // tag name
  secondaryTags?: string[]; // tag names
}


