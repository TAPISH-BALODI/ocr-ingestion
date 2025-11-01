import * as jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface TokenPayload {
  sub: string;
  email: string;
  role: 'admin' | 'support' | 'moderator' | 'user';
}

// Helper to generate valid MongoDB ObjectId strings
function objectId(): string {
  return new Types.ObjectId().toString();
}

function generateToken(userId: string, email: string, role: TokenPayload['role'] = 'user'): string {
  return jwt.sign(
    { sub: userId, email, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Example tokens for different users and roles
console.log('\n=== Generated JWT Tokens ===\n');
console.log(`Using JWT_SECRET: ${JWT_SECRET === 'dev-secret-key' ? 'dev-secret-key (default)' : JWT_SECRET.substring(0, 10) + '...'}`);
console.log(`⚠️  Make sure your server is using the SAME JWT_SECRET!\n`);
console.log('Note: Using valid MongoDB ObjectIds as user IDs\n');

const user1Id = objectId();
const user2Id = objectId();
const adminId = objectId();
const supportId = objectId();

const tokens = {
  user1: generateToken(user1Id, 'user1@example.com', 'user'),
  user2: generateToken(user2Id, 'user2@example.com', 'user'),
  admin: generateToken(adminId, 'admin@example.com', 'admin'),
  support: generateToken(supportId, 'support@example.com', 'support'),
};

console.log('User 1 (user role):');
console.log(`User ID: ${user1Id}`);
console.log(`Token: ${tokens.user1}`);
console.log('\n---\n');

console.log('User 2 (user role):');
console.log(`User ID: ${user2Id}`);
console.log(`Token: ${tokens.user2}`);
console.log('\n---\n');

console.log('Admin (admin role):');
console.log(`User ID: ${adminId}`);
console.log(`Token: ${tokens.admin}`);
console.log('\n---\n');

console.log('Support (support role):');
console.log(`User ID: ${supportId}`);
console.log(`Token: ${tokens.support}`);
console.log('\n---\n');

console.log('\n=== Usage Examples ===\n');

console.log('# Health check (no auth):');
console.log('curl http://localhost:3031/v1/health\n');

console.log('# Upload document (user1) - FULL TOKEN:');
console.log(`curl -X POST http://localhost:3031/v1/docs \\`);
console.log(`  -H "Authorization: Bearer ${tokens.user1}" \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"filename":"test.txt","mime":"text/plain","primaryTag":"invoices","textContent":"test"}'`);
console.log('\n');

console.log('# Full admin token (for copy-paste):');
console.log(`Bearer ${tokens.admin}`);
console.log('\n');

console.log('# Full user token (for copy-paste):');
console.log(`Bearer ${tokens.user1}`);
console.log('\n');

console.log('⚠️  IMPORTANT: Make sure you include "Bearer " prefix before the token!');
console.log('   Format: Authorization: Bearer <token>\n');


