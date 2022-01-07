import { getPageSource, getPageBlocks } from './wiki.js';
import pLimit from 'p-limit';
import { writeFile, appendFile } from 'fs/promises';

const limit = pLimit(10);

const getAllPmNames = async () => {
    const blocks = await getPageBlocks('宝可梦列表（按全国图鉴编号）/简单版');
    const pms = blocks.filter((i) => i[0] === 'Rdexe');
    const names = pms.map((i) => i[2]);
    return names;
};
const getPmInfo = async (name) => {
    const blockTypes = ['寶可夢信息框', '寶可夢信息框/形態', '寶可夢信息框/形态'];
    const blocks = await getPageBlocks(name);
    const infoBlock = blocks.find((i) => blockTypes.includes(i[0]));
    if (!infoBlock) { console.log(name); return {} }
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
    writeFile('dataset/pmlist.txt', names.join('\n'));
    const pmInfo = await Promise.all(names.map((name) => limit(getPmInfo, name)));

    await saveCSV('pm', pmInfo);
}

main();