import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog } from './audit.schema';

@Injectable()
export class AuditService {
  constructor(@InjectModel(AuditLog.name) private readonly auditModel: Model<AuditLog>) {}

  async log(params: {
    userId?: string | Types.ObjectId;
    action: string;
    entityType: string;
    entityId?: string | Types.ObjectId;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const { userId, action, entityType, entityId, metadata } = params;
    await this.auditModel.create({
      userId: userId ? new Types.ObjectId(userId) : undefined,
      action,
      entityType,
      entityId: entityId ? new Types.ObjectId(entityId) : undefined,
      metadata,
    });
  }
}


