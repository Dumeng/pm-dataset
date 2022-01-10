import { writeFile, appendFile } from 'fs/promises';
import pLimit from 'p-limit';

export const httpLimit = pLimit(10);

export const saveCSV = async (name, data) => {
    const headersSet = new Set();
    data.forEach((pm) => Object.keys(pm).forEach((i) => headersSet.add(i.includes(',') ? `"${i}"` : i)));
    const headers = [...headersSet];
    const filename = `./dataset/${name}.csv`;
    await writeFile(filename, headers.join() + '\n');
    await Promise.all(data.map((item) => appendFile(filename,
        headers.map((i) => {
            const value = item[i] || '';
            return (value.includes(',') || value.includes('\n')) ? `"${value}"` : value
        }).join() + '\n'
    )));
};

export const saveList = async (name, data) => {
    await writeFile(`dataset/${name}.txt`, data.join('\n'));
}

export const fieldCount = (data) => {
    const counter = {};
    data.forEach(row => Object.keys(row).forEach(key => counter[key] = (counter[key] || 0) + 1));
    return Object.entries(counter).sort((a, b) => b[1] - a[1]);
}