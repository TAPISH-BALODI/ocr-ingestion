import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

interface TokenPayload {
  sub: string;
  email: string;
  role: 'admin' | 'support' | 'moderator' | 'user';
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

const tokens = {
  user1: generateToken('user1', 'user1@example.com', 'user'),
  user2: generateToken('user2', 'user2@example.com', 'user'),
  admin: generateToken('admin1', 'admin@example.com', 'admin'),
  support: generateToken('support1', 'support@example.com', 'support'),
};

console.log('User 1 (user role):');
console.log(tokens.user1);
console.log('\n---\n');

console.log('User 2 (user role):');
console.log(tokens.user2);
console.log('\n---\n');

console.log('Admin (admin role):');
console.log(tokens.admin);
console.log('\n---\n');

console.log('Support (support role):');
console.log(tokens.support);
console.log('\n---\n');

console.log('\n=== Usage Examples ===\n');

console.log('# Health check (no auth):');
console.log('curl http://localhost:3031/v1/health\n');

console.log('# Upload document (user1):');
console.log(`curl -X POST http://localhost:3031/v1/docs \\`);
console.log(`  -H "Authorization: Bearer ${tokens.user1.substring(0, 50)}..." \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"filename":"test.txt","mime":"text/plain","primaryTag":"invoices","textContent":"test"}'`);
console.log('\n');

console.log('# List folders (any authenticated user):');
console.log(`curl http://localhost:3031/v1/folders \\`);
console.log(`  -H "Authorization: Bearer ${tokens.user1.substring(0, 50)}..."`);
console.log('\n');


