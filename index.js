import pmTask from './tasks/pm.js';
import abilityTask from './tasks/ability.js';

const main = async () => {
    await pmTask();
    await abilityTask();
}

main();