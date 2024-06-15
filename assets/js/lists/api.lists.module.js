import { config } from '../config.module.js';
import { getMetaCsrf } from '../utils.module.js';
import { FetchClass } from '../lib/FetchClass.js';

// * Les méthodes pour créer des listes et cartes sont très similaires, il faudrait envisager une ou plusieurs abstractions pour rester DRY

async function getListsFromAPI() {
    return await new FetchClass(`${config.base_url}/lists`).make().send();
}

async function createList(data) {
    const token = getMetaCsrf();

    return await new FetchClass(`${config.base_url}/lists`, token)
        .make('POST')
        .send(data);
}

async function updateList(id, data) {
    const token = getMetaCsrf();

    const url = `${config.base_url}/lists/${id}`;

    return await new FetchClass(url, token).make('PATCH').send(data);
}

async function deleteList(listId) {
    const token = getMetaCsrf();

    const url = `${config.base_url}/lists/${listId}`;

    return await new FetchClass(url, token).make('DELETE').send();
}

export { getListsFromAPI, createList, updateList, deleteList };
