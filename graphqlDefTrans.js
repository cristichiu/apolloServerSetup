import fs from 'fs/promises';
import path from 'path';

const srcDir = 'src/graphql/typeDefs';
const dstDir = 'dist/graphql/typeDefs'

let deleteDst = await fs.readdir(dstDir, { recursive: true })
deleteDst = deleteDst.filter(file => ['.graphql'].some(ext => file.endsWith(ext)));
deleteDst.forEach(async d => { await fs.unlink(`${dstDir}/${d}`) })

let entries = await fs.readdir(srcDir, { recursive: true, withFileTypes: true });
entries = entries.filter(file => ['.graphql'].some(ext => file.name.endsWith(ext)));
entries.forEach(async e => {
    let dst = e.parentPath.replace(srcDir, dstDir)
    let src = e.parentPath
    await fs.mkdir(dst, { recursive: true })
    await fs.copyFile(path.join(src, e.name), path.join(dst, e.name))
    console.log(`copied ✅ ${src}/${e.name} => ${dst}/${e.name}`)
})