import axios from 'axios';
axios.defaults.baseURL = 'https://wiki.52poke.com/rest.php/v1';

export const getPageSource = async (page) => {
    const res = await axios.get(`/page/${encodeURIComponent(page)}`);
    const source = res.data.source;
    return source;
}

export const getPageBlocks = async (page) => {
    const source = await getPageSource(page);
    const blocks = [...source.matchAll(/{{(.*?)}}/sg)]
        .map(i => i[1].replaceAll('\n', '').split('|'));
    return blocks;
}