import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import pLimit from 'p-limit';

export const httpLimit = pLimit(10);

export const saveCSV = async (name, data) => {
    const headersSet = new Set();
    data.forEach((pm) => Object.keys(pm).forEach((i) => headersSet.add(i.includes(',') ? `"${i}"` : i)));
    const headers = [...headersSet];
    const filename = `./dataset/${name}.csv`;
    const csvFile = createWriteStream(filename, { flags: 'w' });
    csvFile.write(headers.join() + '\n');
    data.map((item) => csvFile.write(
        headers.map((i) => {
            const value = (item[i] || '').toString().trim();
            return (value.includes(',') || value.includes('\n')) ? `"${value}"` : value
        }).join() + '\n'
    ));
    csvFile.end();
};

export const saveList = async (name, data) => {
    await writeFile(`dataset/${name}.txt`, data.join('\n'));
}

export const fieldCount = (data) => {
    const counter = {};
    data.forEach(row => Object.keys(row).forEach(key => counter[key] = (counter[key] || 0) + 1));
    return Object.entries(counter).sort((a, b) => b[1] - a[1]);
}