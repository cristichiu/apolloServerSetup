import fs from 'fs/promises';
import path from 'path';

const srcDir = 'src/graphql/defTypes';

let entries = await fs.readdir(srcDir, { recursive: true, withFileTypes: true });
entries = entries.filter(file => ['.graphql'].some(ext => file.name.endsWith(ext)));
entries.forEach(async e => {
    let dst = e.parentPath.split("/")
    dst.shift(); dst.unshift("dist")
    dst = dst.join("/")
    let src = e.parentPath
    await fs.mkdir(dst, { recursive: true })
    await fs.copyFile(path.join(src, e.name), path.join(dst, e.name))
    console.log(`copied ✅ ${e.parentPath}/${e.name}`)
})