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
    const source = (await getPageSource(page))
        // remove possible template nesting
        .replaceAll(/<!--.*?-->/g, '')
        .replaceAll(/{{JP\|(.*?)\|.*?}}/g, '$1')
        .replaceAll(/{{a\|(.*?)\|.*?}}/g, '$1')
        .replaceAll(/{{s\|.*?}}/g, '')
        .replaceAll(/{{game\|.*?}}/g, '')
        .replaceAll(/{{game2\|.*?}}/g, '')
        .replaceAll(/{{type\|.*?}}/g, '')
        .replaceAll(/{{tt\|.*?}}/ig, '')
        .replaceAll(/\[\[(.*?)\|?.*?\]\]/g, '');
    const blocks = [...source.matchAll(/{{(.*?)}}/sg)]
        .map(i => i[1]
            .replaceAll('\n', '')
            .split('|')
            .filter(t => t));
    return blocks;
}

export const findPageBlockByName = async (page) => {
    const removedTag = ['a', 's', 'game', 'game2', 'tt', 'type'];
    removedTag.map(t => new RegExp('{{s\|.*?}}', 'ig'));
    const source = await getPageSource(page)
        .then(text =>
            // remove possible template nesting
            removedTag.map(t => new RegExp('{{s\|.*?}}', 'ig'))
                .reduce((t, re) => t.replaceAll(re, ''), text)
                .replaceAll(/{{JP\|(.*?)\|.*?}}/g, '$1')
        );

    const blocks = [...source.matchAll(/{{(.*?)}}/sg)]
        .map(i => i[1]
            .replaceAll('\n', '')
            .split('|')
            .filter(t => t));
    return blocks;
}

export const getCategoryMembers = async (categroy, next) => {
    const res = await apiClient.request({
        method: 'get',
        params: {
            action: 'query',
            list: 'categorymembers',
            cmtitle: `Category:${categroy}`,
            cmtype: 'page',
            cmlimit: 500,
            cmcontinue: next,
        }
    });
    const list = res.data.query.categorymembers.map((i) => i.title);
    if (res.data.continue?.cmcontinue) {
        list.push(...await getCategoryMembers(categroy, res.data.continue.cmcontinue));
    }
    return list;
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