import cheerio from 'cheerio';

import { getPageBlocks, getPageHtml, getPageSource } from '../wiki.js';
import { saveCSV, httpLimit, saveList } from '../utils.js';

const getAllNames = async () => {
    const html = await getPageHtml('属性');
    const $ = cheerio.load(html);
    const names = $('table:first').find('a')
        .toArray()
        .slice(1, -1)
        .map(i => i.attribs.title);
    return names;
};
const getTypeInfo = async (name) => {
    const source = await getPageSource(name);
    const segment = source.split('==属性相克==')[1].split(/^==[^=]*?==$/m)[0];
    const blocks = [
        ...segment.matchAll(/===\{\{gen\|(\d)\}\}.*?===.*?\{\{(属性相克.*?)\}\}/sg),
        ...segment.matchAll(/===第(.)世代.*?===.*?\{\{(属性相克.*?)\}\}/sg),
        ...segment.matchAll(/^(\s*?)\{\{(属性相克.*?)\}\}/sg),
    ];
    return blocks.map((block) => block[2].split('\|').slice(1).reduce((r, i) => {
        const [k, v] = i.split('=');

        if (k !== 'type') {
            const key = k.match(/\D*/)[0].trim();
            r[key] = r[key] ? r[key] + '/' + v.trim() : v.trim();
        } else {
            r.type = v.trim();
            if (v.trim() === '妖精') {
                r.gen = 6;
            }
        }

        return r;
    }, { gen: ('一二三四五六七八'.indexOf(block[1]) + 1) || block[1].trim() }));
};
const typeTask = async () => {
    const names = await getAllNames();

    const typeInfo = await Promise.all(names.map((name) => httpLimit(getTypeInfo, name)));
    await saveCSV('type', typeInfo.flat());
}
export default typeTask;
