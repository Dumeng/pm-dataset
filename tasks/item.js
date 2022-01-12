import cheerio from 'cheerio';

import { getPageBlocks, getPageHtml } from '../wiki.js';
import { saveCSV, httpLimit } from '../utils.js';

const getAllNames = async () => {
    const html = await getPageHtml('道具列表');
    const $ = cheerio.load(html);
    const nameSet = new Set($('table.hvlist tbody tr td:nth-child(2)>a:last-child')
        .toArray()
        .map(i => i.attribs.title));
    ['极巨结晶', '秘传学习器', '招式记录', '招式学习器', '数据卡'].forEach(i => nameSet.delete(i));
    return [...nameSet];
};

const getItemDesc = async (name) => {
    const html = await getPageHtml(name);
    const $ = cheerio.load(html);
    const h2 = $('h2').filter((i, e) => ['效果', '使用效果', '游戏中', '道具效果'].includes($(e).text()));
    if (!h2.length) {
        console.warn(`Desc of ${name} is not found.`);
        return '';
    }
    let element = h2.next();
    let desc = '';
    while (element.get(0).tagName !== 'h2') {
        if (element.get(0).tagName === 'h3') {
            desc += '\n>> ';
        }
        desc += $(element).text();
        element = element.next();
    }
    return desc;
}

const getItemBlock = async (name) => {
    const blockTypes = ['道具信息框', '树果/信息框'];
    const blocks = await getPageBlocks(name);
    const infoBlock = blocks.find((i) => blockTypes.includes(i[0]));
    if (!infoBlock) { return null }
    const infoObj = infoBlock.slice(1).reduce((r, i) => {
        const [k, v] = i.split('=');
        r[k.trimLeft().trimRight().toLowerCase()] = v;
        return r;
    }, {});
    return infoObj;
};

const itemTask = async () => {
    const names = await getAllNames();

    const itemInfo = await Promise.all(names.map(async (name) => {
        const descRes = await httpLimit(getItemDesc, name);
        const blockRes = await httpLimit(getItemBlock, name);
        if (!blockRes) {
            console.warn(`${name} is skipped`);
            return {};
        }
        blockRes.effect = descRes;
        if (blockRes.info?.startsWith('-{'))
            blockRes.info = blockRes.info.slice(2, -2).split(';')
                .map(i => i.split(':'))
                .find(i => i[0] === 'zh-hans')[1];
        return blockRes;
    }));
    await saveCSV('item', itemInfo);
}
export default itemTask;
