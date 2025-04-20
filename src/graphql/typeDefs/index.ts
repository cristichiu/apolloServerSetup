import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const files = await fs.readdir(__dirname, { recursive: true });

const filteredFiles = files.filter(file => ['.graphql'].some(ext => file.endsWith(ext)));

export default await Promise.all(
  filteredFiles.map(async (file) =>
    await fs.readFile(path.join(__dirname, file), 'utf8')
  )
)
