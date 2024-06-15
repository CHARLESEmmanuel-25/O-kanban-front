import { config } from '../config.module.js';
import { getMetaCsrf } from '../utils.module.js';
import { FetchClass } from '../lib/FetchClass.js';

async function getTags() {
    return await new FetchClass(`${config.base_url}/tags`).make().send();
}

async function createTag(formData) {
    const token = getMetaCsrf();

    return await new FetchClass(`${config.base_url}/tags`, token)
        .make('POST')
        .send(formData);
}

async function associate(formData) {
    const url = `cards/${formData.card_id}/tags/${formData.tag_id}`;

    const token = getMetaCsrf();

    return await new FetchClass(`${config.base_url}/${url}`, token)
        .make('PATCH')
        .send(formData);
}

async function disassociate(cardId, tagId) {
    const token = getMetaCsrf();

    return await new FetchClass(
        `${config.base_url}/cards/${cardId}/tags/${tagId}`,
        token
    )
        .make('DELETE')
        .send();
}

async function destroyTag(tagId) {
    const token = getMetaCsrf();

    return await new FetchClass(`${config.base_url}/tags/${tagId}`, token)
        .make('DELETE')
        .send();
}

export { getTags, associate, disassociate, createTag, destroyTag };
