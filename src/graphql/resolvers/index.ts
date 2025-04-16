import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { mergeResolvers } from '@graphql-tools/merge'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const files = await fs.readdir(__dirname, { recursive: true });

const filteredFiles = files.filter(file => { 
    if(file == "index.js") return 0
    return ['.js'].some(ext => file.endsWith(ext))
});

const resolvers = await Promise.all(
  filteredFiles.map(async (file) => {
      const filePath = path.join(__dirname, file);
      const module = await import(`file://${filePath}`);
      return module.default;
  })
);

export default mergeResolvers(resolvers)