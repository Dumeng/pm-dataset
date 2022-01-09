import cheerio from 'cheerio';

import { getPageBlocks, getPageHtml } from '../wiki.js';
import { saveCSV, httpLimit, saveList } from '../utils.js';

const getAllNames = async () => {
    const html = await getPageHtml('招式列表');
    const $ = cheerio.load(html);
    const names = $('table.hvlist tbody tr td:nth-child(2)>a:last-child')
        .toArray()
        .map(i => i.attribs.title);
    return names;
};
const getMoveInfo = async (name) => {
    const blockTypes = ['招式信息框'];
    const blocks = await getPageBlocks(name);
    const infoBlock = blocks.find((i) => blockTypes.includes(i[0]));
    if (!infoBlock) { console.log(name); return {} }
    const infoObj = infoBlock.slice(1).reduce((r, i) => {
        const [k, v] = i.split('=');
        r[k.trimLeft().trimRight().toLowerCase()] = v;
        return r;
    }, {});
    return infoObj;
};
const task = async () => {
    const names = await getAllNames();

    const mvInfo = await Promise.all(names.map((name) => httpLimit(getMoveInfo, name)));
    await saveCSV('move', mvInfo);
}
export default task;
