import { config } from '../config.module.js';
import { getMetaCsrf } from '../utils.module.js';
import { FetchClass } from '../lib/FetchClass.js';

async function createCard(data) {
    const token = getMetaCsrf();

    return await new FetchClass(`${config.base_url}/cards`, token)
        .make('POST')
        .send(data);
}

async function update(id, data) {
    const token = getMetaCsrf();

    delete data['card-id'];

    return await new FetchClass(`${config.base_url}/cards/${id}`, token)
        .make('PATCH')
        .send(data);
}

async function destroy(id) {
    const token = getMetaCsrf();

    return await new FetchClass(`${config.base_url}/cards/${id}`, token)
        .make('DELETE')
        .send();
}

export { createCard, update, destroy };
