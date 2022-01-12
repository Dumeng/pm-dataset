import cheerio from 'cheerio';
import { getPageBlocks, getCategoryMembers, getPageHtml } from '../wiki.js';
import { httpLimit, saveCSV } from '../utils.js';

const genNames = ['第一世代', '第五世代', '第六世代', '第七世代', '第八世代',];
const fields = ['name', 'hp', 'atk', 'def', 'sp.atk', 'sp.def', 'spd', 'sum', 'avg'];
const fieldsGen1 = ['name', 'hp', 'atk', 'def', 'sp', 'spd', 'sum', 'avg'];

const getSpecTable = async (gen) => {
    const fieldsList = gen === '第一世代' ? fieldsGen1 : fields;
    const html = await getPageHtml(`种族值列表（${gen}）`);
    const $ = cheerio.load(html);
    const data = $('table.sortable tbody tr')
        .toArray()
        .slice(1, -1)
        .map(i => {
            const cells = i.childNodes.filter(it => it.type === 'tag');
            const r = { id: $(cells[0]).text().trimEnd(), gen };
            fieldsList.forEach((field, idx) => r[field] = $(cells[idx + 2]).text().trimEnd());
            return r;
        });
    console.log(gen, data.length);
    return data;
};
const specTask = async () => {
    const specData = (await Promise.all(genNames.map(
        (gen) => httpLimit(getSpecTable, gen)))).flat();

    await saveCSV('spec', specData);
}

export default specTask;