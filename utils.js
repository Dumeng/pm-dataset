import { writeFile, appendFile } from 'fs/promises';
import pLimit from 'p-limit';

export const httpLimit = pLimit(10);

export const saveCSV = async (name, data) => {
    const headersSet = new Set();
    data.forEach((pm) => Object.keys(pm).forEach((i) => headersSet.add(i)));
    const headers = [...headersSet];
    const filename = `./dataset/${name}.csv`;
    await writeFile(filename, headers.join() + '\n');
    await Promise.all(data.map((item) => appendFile(filename,
        headers.map((i) => item[i]).join() + '\n'
    )));
};

export const saveList = async (name, data) => {
    await writeFile(`dataset/${name}.txt`, data.join('\n'));
}