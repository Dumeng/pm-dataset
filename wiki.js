import axios from 'axios';
axios.create
const restClient = axios.create({
    baseURL: 'https://wiki.52poke.com/rest.php/v1'
});
const apiClient = axios.create({
    baseURL: 'https://wiki.52poke.com/api.php',
    params: {
        format: 'json',
    },
});

export const getPageSource = async (page) => {
    const res = await restClient.get(`/page/${encodeURIComponent(page)}`);
    const source = res.data.source;
    return source;
}

export const getPageBlocks = async (page) => {
    const source = await getPageSource(page);
    const blocks = [...source.matchAll(/{{(.*?)}}/sg)]
        .map(i => i[1].replaceAll('\n', '').split('|'));
    return blocks;
}

export const getCategoryMembers = async (categroy) => {
    const res = await apiClient.request({
        method: 'get',
        params: {
            action: 'query',
            list: 'categorymembers',
            cmtitle: `Category:${categroy}`,
        }
    });
    return res.data.query.categorymembers.map((i) => i.title);
}

export const getPageHtml = async (title) => {
    const res = await apiClient.request({
        method: 'get',
        params: {
            action: 'parse',
            prop: 'text',
            page: title,
            disableeditsection: true,
            format: 'json',
        }
    });
    const html = res.data.parse.text['*'];
    return html;
}