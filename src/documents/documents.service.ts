import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Document as Doc } from './document.schema';
import { DocumentTag } from './document-tag.schema';
import { Tag } from '../tags/tag.schema';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Doc.name) private readonly docModel: Model<Doc>,
    @InjectModel(DocumentTag.name) private readonly docTagModel: Model<DocumentTag>,
    @InjectModel(Tag.name) private readonly tagModel: Model<Tag>,
  ) {}

  private async upsertTag(ownerId: Types.ObjectId, name: string): Promise<Types.ObjectId> {
    const norm = name.trim().toLowerCase();
    const tag = await this.tagModel.findOneAndUpdate(
      { ownerId, name: norm },
      { $setOnInsert: { ownerId, name: norm } },
      { new: true, upsert: true }
    ).lean();
    return new Types.ObjectId(tag!._id);
  }

  async create(ownerId: string, dto: CreateDocumentDto) {
    if (!dto.primaryTag) throw new BadRequestException('primaryTag is required');
    const owner = new Types.ObjectId(ownerId);

    const doc = await this.docModel.create({
      ownerId: owner,
      filename: dto.filename,
      mime: dto.mime,
      textContent: dto.textContent,
    });

    // Primary tag
    const primaryTagId = await this.upsertTag(owner, dto.primaryTag);
    await this.docTagModel.create({ documentId: doc._id, tagId: primaryTagId, ownerId: owner, isPrimary: true });

    // Secondary tags
    const secondary = dto.secondaryTags ?? [];
    for (const t of secondary) {
      const tagId = await this.upsertTag(owner, t);
      if (!tagId.equals(primaryTagId)) {
        await this.docTagModel.create({ documentId: doc._id, tagId, ownerId: owner, isPrimary: false });
      }
    }

    return doc;
  }

  async listByPrimaryTag(ownerId: string, tagName: string) {
    const owner = new Types.ObjectId(ownerId);
    const tag = await this.tagModel.findOne({ ownerId: owner, name: tagName.trim().toLowerCase() }).lean();
    if (!tag) return [];
    const links = await this.docTagModel.find({ ownerId: owner, tagId: tag._id, isPrimary: true }).lean();
    const ids = links.map(l => l.documentId);
    return this.docModel.find({ _id: { $in: ids } }).lean();
  }

  async listFolders(ownerId: string) {
    const owner = new Types.ObjectId(ownerId);
    const pipeline = [
      { $match: { ownerId: owner, isPrimary: true } },
      { $group: { _id: '$tagId', count: { $sum: 1 } } },
      { $lookup: { from: 'tags', localField: '_id', foreignField: '_id', as: 'tag' } },
      { $unwind: '$tag' },
      { $project: { name: '$tag.name', count: 1, _id: 0 } },
      { $sort: { name: 1 } },
    ];
    // @ts-ignore
    const result = await this.docTagModel.aggregate(pipeline);
    return result;
  }

  async search(ownerId: string, q: string, scope?: { type: 'folder'|'files'; ids?: string[]; name?: string }) {
    const owner = new Types.ObjectId(ownerId);
    const filter: any = { ownerId: owner };
    if (q) {
      filter.$or = [
        { filename: { $regex: q, $options: 'i' } },
        { textContent: { $regex: q, $options: 'i' } },
      ];
    }

    if (scope) {
      if (scope.type === 'folder') {
        if (!scope.name) throw new BadRequestException('folder scope requires name');
        const tag = await this.tagModel.findOne({ ownerId: owner, name: scope.name.trim().toLowerCase() }).lean();
        if (!tag) return [];
        const primLinks = await this.docTagModel.find({ ownerId: owner, tagId: tag._id, isPrimary: true }).lean();
        const ids = primLinks.map(l => l.documentId);
        filter._id = { $in: ids };
      } else if (scope.type === 'files') {
        if (!scope.ids || scope.ids.length === 0) throw new BadRequestException('files scope requires ids');
        const ids = scope.ids.map(id => new Types.ObjectId(id));
        filter._id = { $in: ids };
      }
    }

    return this.docModel.find(filter).lean();
  }
}


