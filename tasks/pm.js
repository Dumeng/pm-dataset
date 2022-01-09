import { getPageBlocks } from '../wiki.js';
import { saveCSV, httpLimit, saveList } from '../utils.js';

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
const pmTask = async () => {
    const names = await getAllPmNames();
    await saveList('pmlist', names);

    const pmInfo = await Promise.all(names.map((name) => httpLimit(getPmInfo, name)));
    await saveCSV('pm', pmInfo);
}
export default pmTask;
