const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.name = 'ocr-ingestion';
pkg.type = 'module';
pkg.scripts = {
  dev: 'cross-env NODE_ENV=development ts-node-dev --respawn --transpile-only src/main.ts',
  build: 'rimraf dist && tsc -p tsconfig.json',
  start: 'node dist/main.js',
  lint: 'eslint  src/**/*.ts',
  test: 'cross-env NODE_ENV=test jest --runInBand'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
