import cheerio from 'cheerio';
import { getPageBlocks, getCategoryMembers, getPageHtml } from '../wiki.js';
import { httpLimit, saveCSV } from '../utils.js';

const genNames = ['第三世代特性', '第四世代特性', '第五世代特性', '第六世代特性', '第七世代特性', '第八世代特性',];

const getAllNames = async () => {
    const names = await Promise.all(genNames.map((i) => httpLimit(getCategoryMembers, i), {}));
    return names;
};

const getAbilityDesc = async (name) => {
    const html = await getPageHtml(name);
    const $ = cheerio.load(html);
    const h2 = $('h2').filter((i, e) => $(e).text() === '特性效果');
    let element = h2.next();
    let segment = '';
    const desc = {};
    while (element.get(0).tagName !== 'h2') {
        if (element.get(0).tagName === 'h3') {
            segment = $(element).text();
        } else {
            desc[segment] = (desc[segment] || '') + $(element).text();
        }
        element = element.next();
    }
    return desc;
}

const getAbilityBlock = async (name) => {
    const blockTypes = ['特性信息框'];
    const blocks = await getPageBlocks(name);
    const infoBlock = blocks.find((i) => blockTypes.includes(i[0]));
    if (!infoBlock) { console.log(name); return {} }
    const infoObj = infoBlock.slice(1).reduce((r, i) => {
        const [k, v] = i.split('=');
        r[k] = v;
        return r;
    }, {});
    return infoObj;
}

const task = async () => {
    const names = await getAllNames();
    const abInfo = (await Promise.all(
        names.map((ab, i) => Promise.all(
            ab.map(async (name) => {
                const descRes = await httpLimit(getAbilityDesc, name);
                const blockRes = await httpLimit(getAbilityBlock, name);
                blockRes.gen = i + 3;
                blockRes.对战外 = `"${descRes['对战外']}"`;
                blockRes.对战中 = `"${descRes['对战中'] || descRes['對戰中']}"`;
                blockRes.text = blockRes.text.slice(2, -2).split(';')
                    .map(i => i.split(':'))
                    .find(i => i[0] === 'zh-hans')[1];
                return blockRes;
            }))
        )
    )).flat();

    await saveCSV('ability', abInfo);
}

export default task;
