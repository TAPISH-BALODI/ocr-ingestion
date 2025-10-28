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
exports.DocumentTagSchema = exports.DocumentTag = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DocumentTag = class DocumentTag {
};
exports.DocumentTag = DocumentTag;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Document', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentTag.prototype, "documentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Tag', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentTag.prototype, "tagId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentTag.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: false }),
    __metadata("design:type", Boolean)
], DocumentTag.prototype, "isPrimary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], DocumentTag.prototype, "createdAt", void 0);
exports.DocumentTag = DocumentTag = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
], DocumentTag);
exports.DocumentTagSchema = mongoose_1.SchemaFactory.createForClass(DocumentTag);
exports.DocumentTagSchema.index({ documentId: 1, ownerId: 1, isPrimary: 1 }, { unique: true, partialFilterExpression: { isPrimary: true } });
exports.DocumentTagSchema.index({ documentId: 1, tagId: 1, ownerId: 1 }, { unique: true });
//# sourceMappingURL=document-tag.schema.js.map