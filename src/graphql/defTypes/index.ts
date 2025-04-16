import fs from 'fs/promises';
const files = await fs.readdir("./src/graphql/defTypes", { recursive: true });
const filteredFiles = files.filter(file => ['.graphql'].some(ext => file.endsWith(ext)));
export default await Promise.all(
  filteredFiles.map(async (file) =>
    await fs.readFile(`./src/graphql/defTypes/${file}`, 'utf8')
  )
)
