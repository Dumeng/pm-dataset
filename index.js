import tasks from "./tasks/index.js";

const main = async () => {
    for (const task of tasks) {
        try {
            await task();
        } catch (error) {
            console.warn(`${task.name} Failed.`);
        }
    }
}

main();