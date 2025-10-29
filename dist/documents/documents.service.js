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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const document_schema_1 = require("./document.schema");
const document_tag_schema_1 = require("./document-tag.schema");
const tag_schema_1 = require("../tags/tag.schema");
let DocumentsService = class DocumentsService {
    constructor(docModel, docTagModel, tagModel) {
        this.docModel = docModel;
        this.docTagModel = docTagModel;
        this.tagModel = tagModel;
    }
    async upsertTag(ownerId, name) {
        const norm = name.trim().toLowerCase();
        const tag = await this.tagModel.findOneAndUpdate({ ownerId, name: norm }, { $setOnInsert: { ownerId, name: norm } }, { new: true, upsert: true }).lean();
        return new mongoose_2.Types.ObjectId(tag._id);
    }
    async create(ownerId, dto) {
        if (!dto.primaryTag)
            throw new common_1.BadRequestException('primaryTag is required');
        const owner = new mongoose_2.Types.ObjectId(ownerId);
        const doc = await this.docModel.create({
            ownerId: owner,
            filename: dto.filename,
            mime: dto.mime,
            textContent: dto.textContent,
        });
        const primaryTagId = await this.upsertTag(owner, dto.primaryTag);
        await this.docTagModel.create({ documentId: doc._id, tagId: primaryTagId, ownerId: owner, isPrimary: true });
        const secondary = dto.secondaryTags ?? [];
        for (const t of secondary) {
            const tagId = await this.upsertTag(owner, t);
            if (!tagId.equals(primaryTagId)) {
                await this.docTagModel.create({ documentId: doc._id, tagId, ownerId: owner, isPrimary: false });
            }
        }
        return doc;
    }
    async listByPrimaryTag(ownerId, tagName) {
        const owner = new mongoose_2.Types.ObjectId(ownerId);
        const tag = await this.tagModel.findOne({ ownerId: owner, name: tagName.trim().toLowerCase() }).lean();
        if (!tag)
            return [];
        const links = await this.docTagModel.find({ ownerId: owner, tagId: tag._id, isPrimary: true }).lean();
        const ids = links.map(l => l.documentId);
        return this.docModel.find({ _id: { $in: ids } }).lean();
    }
    async listFolders(ownerId) {
        const owner = new mongoose_2.Types.ObjectId(ownerId);
        const pipeline = [
            { $match: { ownerId: owner, isPrimary: true } },
            { $group: { _id: '$tagId', count: { $sum: 1 } } },
            { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tag' } },
            { $unwind: '$tag' },
            { $project: { name: '$tag.name', count: 1, _id: 0 } },
            { $sort: { name: 1 } },
        ];
        const result = await this.docTagModel.aggregate(pipeline);
        return result;
    }
    async search(ownerId, q, scope) {
        const owner = new mongoose_2.Types.ObjectId(ownerId);
        const filter = { ownerId: owner };
        if (q) {
            filter.$or = [
                { filename: { $regex: q, $options: 'i' } },
                { textContent: { $regex: q, $options: 'i' } },
            ];
        }
        if (scope) {
            if (scope.type === 'folder') {
                if (!scope.name)
                    throw new common_1.BadRequestException('folder scope requires name');
                const tag = await this.tagModel.findOne({ ownerId: owner, name: scope.name.trim().toLowerCase() }).lean();
                if (!tag)
                    return [];
                const primLinks = await this.docTagModel.find({ ownerId: owner, tagId: tag._id, isPrimary: true }).lean();
                const ids = primLinks.map(l => l.documentId);
                filter._id = { $in: ids };
            }
            else if (scope.type === 'files') {
                if (!scope.ids || scope.ids.length === 0)
                    throw new common_1.BadRequestException('files scope requires ids');
                const ids = scope.ids.map(id => new mongoose_2.Types.ObjectId(id));
                filter._id = { $in: ids };
            }
        }
        return this.docModel.find(filter).lean();
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __param(1, (0, mongoose_1.InjectModel)(document_tag_schema_1.DocumentTag.name)),
    __param(2, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map