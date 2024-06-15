import { makeCardInDOM, removeCardFromDom } from '../cards/card.module.js';
import {
    associate,
    disassociate,
    getTags,
    createTag,
    destroyTag,
} from './api.tags.module.js';

/**
 * ajoute un tag sur une carte
 * @param {object} tag
 */
function makeTagInDOM(tag) {
    const newTag = document.createElement('div');
    newTag.classList.add('tag');
    newTag.style.backgroundColor = tag.color;
    newTag.style.color = 'white';
    newTag.style.fontWeight = 'bold';
    newTag.textContent = tag.name;
    newTag.setAttribute('data-tag-id', tag.id);

    newTag.setAttribute('data-card-id', tag.card_has_tag.card_id);
    const card = document.querySelector(
        `[data-card-id="${tag.card_has_tag.card_id}"]`
    );

    card.appendChild(newTag);
    newTag.addEventListener('click', removeTag);
}

/**
 * ajoute les tags existant en haut à droite sur le DOM
 *
 */
async function addExisitingTagToDom() {
    const tags = await getTags();

    tags.forEach(tag => addTag(tag));
}

function addTag(tag) {
    const tagsContainer = document.querySelector('.tags');
    const tagTemplate = document.getElementById('tag-template');

    const clone = document.importNode(tagTemplate.content, true);

    const div = clone.querySelector('div');
    div.textContent = tag.name;
    div.style.backgroundColor = tag.color;
    div.style.color = 'white';

    div.setAttribute('data-tag-id', tag.id);

    div.addEventListener('click', deleteTag);

    tagsContainer.appendChild(clone);
}

async function deleteTag(event) {
    if (confirm('Etes vous sur de vouloir effacer ce tag ?')) {
        const tagId = event.target.getAttribute('data-tag-id');

        const res = await destroyTag(tagId);

        if (res !== '') {
            return alert(JSON.parse(res).error);
        }

        document.querySelectorAll('.tags .tag').forEach(elem => {
            elem.remove();
        });

        await addExisitingTagToDom();

        return true;
    }

    return false;
}

async function showAssociateTagModal(event) {
    const modal = document.querySelector('#associateTagModal');
    const card = event.target.closest('.box');
    const cardId = card.getAttribute('data-card-id');
    const form = modal.querySelector('form');
    const select = form.querySelector('select');
    select.innerHTML = '';
    const inputHidden = form.querySelector('[type=hidden]');

    inputHidden.value = cardId;

    // * On va récupérer les tags et les attribuer au select
    let tags = await getTags();

    // * Si le tag est déjà associé à la carte, on l'élimine
    const exisitingTags = card.querySelectorAll('.tag');

    // * Si tous les tags sont associés on arrête tout
    if (exisitingTags.length === tags.length) {
        form.reset();
        // * Une belle notification serait mieux
        // TODO : une classe Notification
        return alert('tous les tags sont associés');
    }

    const existingTagsName = [];
    for (const tag of exisitingTags) {
        existingTagsName.push(tag.textContent);
    }

    tags.forEach(tag => {
        // * Si on ne trouve pas le nom du tag dans le tableau, le tag n'est pas associé à la carte et on peut le proposer dans le formulaire
        if (!existingTagsName.includes(tag.name)) {
            const optionElem = document.createElement('option');
            optionElem.value = tag.id;
            optionElem.textContent = tag.name;

            select.appendChild(optionElem);
        }
    });

    modal.classList.add('is-active');
}

function handleAssociateTagForm() {
    const modal = document.querySelector('#associateTagModal');
    const form = modal.querySelector('form');
    form.addEventListener('submit', async event => {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(event.target));
        try {
            const card = await associate(data);

            // *
            removeCardFromDom(`[data-card-id="${card.id}"]`);
            makeCardInDOM(card);

            event.target.querySelector('select').innerHTML = '';
            event.target.reset();

            modal.classList.remove('is-active');
        } catch (e) {
            console.log(e);
        }
    });
}

async function removeTag(event) {
    if (confirm('Etes vous sur de vouloir enlever le tag ?')) {
        const tagId = event.target.getAttribute('data-tag-id');
        const cardId = event.target.getAttribute('data-card-id');

        const card = await disassociate(cardId, tagId);

        removeCardFromDom(`[data-card-id="${card.id}"]`);

        makeCardInDOM(card);
    }

    return false;
}

function handleAddTagForm() {
    const addTagForm = document.querySelector('#addTagModal form');

    addTagForm.addEventListener('submit', async event => {
        event.preventDefault();
        // On doit créer une liste ici, la requête doit nous retourner une liste
        const formData = new FormData(event.target);
        //formData.append('color', '#000000');
        const data = Object.fromEntries(formData);
        try {
            const tag = await createTag(data);
            if (tag) {
                return addTag(tag);
            }
            throw new Error('Le tag existe deja');
        } catch (e) {
            alert(e.message);
        } finally {
            event.target.reset();

            document
                .getElementById('addTagModal')
                .classList.remove('is-active');
        }
    });
}

function showAddTagModal() {
    document.getElementById('addTagModal').classList.add('is-active');
}

export {
    makeTagInDOM,
    handleAssociateTagForm,
    addExisitingTagToDom,
    showAssociateTagModal,
    showAddTagModal,
    handleAddTagForm,
};
