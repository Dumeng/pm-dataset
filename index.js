import { getPageSource, getPageBlocks } from './wiki.js';
import pLimit from 'p-limit';
import { writeFile, appendFile } from 'fs/promises';

const limit = pLimit(5);

const getAllPmNames = async () => {
    const templates = {
        'rdexn': 3, 'rdexn/2': 4, 'Rdexn/K': 5
    };
    const headers = [...Object.keys(templates)];

    const blocks = await getPageBlocks('宝可梦列表（按全国图鉴编号）');
    const pms = blocks.filter((i) => headers.includes(i[0]));
    const names = pms.map((i) => i[templates[i[0]]]);
    return names;
};
const getPmInfo = async (name) => {
    const blocks = await getPageBlocks(name);
    const infoBlock = blocks.find((i) => i[0] === '寶可夢信息框');
    const infoObj = infoBlock.slice(1).reduce((r, i) => {
        const [k, v] = i.split('=');
        r[k] = v;
        return r;
    }, {});
    return infoObj;
};
const saveCSV = async (name, data) => {
    const headersSet = new Set();
    data.forEach((pm) => Object.keys(pm).forEach((i) => headersSet.add(i)));
    const headers = [...headersSet];
    const filename = `./dataset/${name}.csv`;
    await writeFile(filename, headers.join() + '\n');
    await Promise.all(data.map((item) => appendFile(filename,
        headers.map((i) => item[i]).join() + '\n'
    )));
};
const main = async () => {
    const names = await getAllPmNames();
    const pmInfo = await Promise.all(names.map((name) => limit(getPmInfo, name)));

    await saveCSV('pm', pmInfo);
}

main();