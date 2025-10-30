import mongoose, { Model } from 'mongoose';
import { User, UserSchema } from '../src/users/user.schema';
import { Tag, TagSchema } from '../src/tags/tag.schema';
import { Document as Doc, DocumentSchema } from '../src/documents/document.schema';
import { DocumentTag, DocumentTagSchema } from '../src/documents/document-tag.schema';

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ocr_ingestion';
  await mongoose.connect(uri);
  const UserModel: Model<any> = mongoose.model(User.name, UserSchema);
  const TagModel: Model<any> = mongoose.model(Tag.name, TagSchema);
  const DocModel: Model<any> = mongoose.model(Doc.name, DocumentSchema);
  const LinkModel: Model<any> = mongoose.model(DocumentTag.name, DocumentTagSchema);

  await Promise.all([
    UserModel.collection.createIndex({ email: 1 }, { unique: true }),
    TagModel.collection.createIndex({ ownerId: 1, name: 1 }, { unique: true }),
  ]);

  const users = [
    { email: 'alice@example.com' },
    { email: 'bob@example.com' },
  ];
  const [alice, bob] = await Promise.all(users.map(u => UserModel.findOneAndUpdate(u, { $setOnInsert: u }, { upsert: true, new: true })));

  async function seedUser(owner: any, prefix: string) {
    const invoices = await TagModel.findOneAndUpdate({ ownerId: owner._id, name: `${prefix}-invoices-2025` }, { $setOnInsert: { ownerId: owner._id, name: `${prefix}-invoices-2025` } }, { upsert: true, new: true });
    const receipts = await TagModel.findOneAndUpdate({ ownerId: owner._id, name: `${prefix}-receipts` }, { $setOnInsert: { ownerId: owner._id, name: `${prefix}-receipts` } }, { upsert: true, new: true });

    const d1 = await DocModel.create({ ownerId: owner._id, filename: `${prefix}-inv-001.txt`, mime: 'text/plain', textContent: 'Invoice 001 ACME total $1200. Payment due.' });
    const d2 = await DocModel.create({ ownerId: owner._id, filename: `${prefix}-inv-002.txt`, mime: 'text/plain', textContent: 'Invoice 002 Globex total $880. Contract terms apply.' });
    await LinkModel.create({ documentId: d1._id, tagId: invoices._id, ownerId: owner._id, isPrimary: true });
    await LinkModel.create({ documentId: d2._id, tagId: invoices._id, ownerId: owner._id, isPrimary: true });
    await LinkModel.create({ documentId: d2._id, tagId: receipts._id, ownerId: owner._id, isPrimary: false });
  }

  await seedUser(alice, 'alice');
  await seedUser(bob, 'bob');

  console.log('Seed complete');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });


