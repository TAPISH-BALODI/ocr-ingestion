"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateDocumentDto {
}
exports.CreateDocumentDto = CreateDocumentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Document filename',
        example: 'invoice-001.pdf'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'MIME type',
        example: 'application/pdf',
        examples: ['application/pdf', 'text/plain', 'image/png', 'application/msword']
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "mime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Text content of the document (extracted from OCR or file)',
        required: false,
        example: 'Invoice total $1200. Payment due by December 31, 2025.'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "textContent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Primary tag name (required). This becomes the folder name.',
        example: 'invoices-2025'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDocumentDto.prototype, "primaryTag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Secondary tag names (optional)',
        type: [String],
        required: false,
        example: ['financial', 'urgent', 'pending'],
        default: []
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDocumentDto.prototype, "secondaryTags", void 0);
//# sourceMappingURL=create-document.dto.js.map