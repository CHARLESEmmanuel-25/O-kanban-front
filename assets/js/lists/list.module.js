import Sortable from 'sortablejs';
import { addEventsToList, hideModals } from '../utils.module.js';
import {
    createList,
    deleteList,
    getListsFromAPI,
    updateList,
} from './api.lists.module.js';
import { makeCardInDOM, showAddCardModal } from '../cards/card.module.js';

async function getLists() {
    try {
        const data = await getListsFromAPI();

        for (const list of data) {
            makeListInDOM(list);

            for (const card of list.cards) {
                makeCardInDOM(card);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

function handleAddListForm() {
    const addListForm = document.querySelector('#addListModal form');

    addListForm.addEventListener('submit', async event => {
        event.preventDefault();
        // On doit créer une liste ici, la requête doit nous retourner une liste

        const data = Object.fromEntries(new FormData(event.target));
        try {
            const list = await createList(data);

            makeListInDOM(list);

            event.target.reset();
        } catch (e) {
            console.log(e);
        }
    });
}

function showAddListModal() {
    document.getElementById('addListModal').classList.add('is-active');
}

function makeListInDOM(data) {
    const listTemplate = document.getElementById('list-template');
    // ! On précise true pour obtenir tout ce qui est contenu dans le template
    const clone = document.importNode(listTemplate.content, true);

    clone.querySelector('[slot="title"]').textContent = data.title;

    // ! ajoute un attribut data-list-id sur la liste, ce qui nous permet d'identifier une liste avec l'information contenue dans une carte (list_id)
    clone.querySelector('.panel').setAttribute('data-list-id', data.id);

    const deleteBtn = clone.querySelector('.panel a');
    deleteBtn.addEventListener('click', destroyList);

    const addCardBtn = clone.querySelector('.panel a.is-pulled-right');
    addCardBtn.addEventListener('click', showAddCardModal);

    document.querySelector('.card-lists').appendChild(clone);
    // ! On doit ajouter un event listener après avoir créer la liste
    addEventsToList();
    hideModals();
}

function showEditListForm(event) {
    // * On doit masquer le titre
    // * Quand on utilise les events, l'élément qui a déclenché l'event est : event.target ou event.currentTarget
    const titleElement = event.target;

    // Dans l'énoncé, on nous demande de cacher le titre
    // * titleElement.classList.add('is-hidden');
    // * On doit afficher le form
    const form = titleElement.nextElementSibling;
    form.classList.remove('is-hidden');
    // * On doit assigner au formulaire l'ID de la liste
    form.querySelector('input[type=hidden]').value = titleElement
        .closest('.panel')
        .getAttribute('data-list-id');
}

async function editList(event) {
    // * on empêche le formulaire de recharger la page
    event.preventDefault();
    // * On récupère le formulaire
    const form = event.target;
    // * On crée un formData avec le form, on pourrait sélectionner les inputs à la main
    const data = new FormData(form);
    // * On fabrique un objet que notre API comprendra

    const dataObj = {
        // * la méthode .get est issue de l'objet formData, elle permet de récupérer les valeurs des entrées de formData
        title: data.get('title'),
    };

    // * On attend la réponse de la BDD
    try {
        const newList = await updateList(data.get('list-id'), dataObj);

        // * On récupère le h2 qui est l'élément qui précède la form sur le DOM
        const titleElement = form.previousElementSibling;
        // * On met le à jour le texte du titre
        titleElement.textContent = newList.title;
        // * on réaffiche le titre
        titleElement.classList.remove('is-hidden');
        // * On cache le form et on vide les inputs
        form.classList.add('is-hidden');
        form.reset();
    } catch (e) {
        console.log(e);
    }
}

async function destroyList(event) {
    if (confirm('Etes vous sûr de vouloir effacer cette liste ?')) {
        event.preventDefault();

        const listId = event.target
            .closest('.panel')
            .getAttribute('data-list-id');

        try {
            const res = await deleteList(listId);
            if (res.message) {
                event.target.closest('.panel').remove();
            }
        } catch (e) {
            console.log(e);
        }
    }
}

function dragNDropList() {
    // * On doit sélectionner le conteneur des listes, et le donner à Sortable qui fera tout automatiquement pour déplacer les listes
    const listsContainer = document.querySelector('#lists-container');

    Sortable.create(listsContainer, {
        animation: 1000,
        onEnd: () => {
            // * Quand on termine le drag n drop, on doit mettre à jour la position des listes : pour chaque liste, on doit faire une requête

            const lists = document.querySelectorAll('#lists-container .panel');

            // * index est fourni automatiquement par forEach : c'est l'index de la donnée sur laquelle on fait la boucle
            lists.forEach(async (list, index) => {
                const listId = list.getAttribute('data-list-id');
                // * L'index est la position de l'élément sur le DOM, la base de données n'accepte pas le 0, on ajoute donc 1 à chque index pour répondre aux exigences de la BDD
                const position = index + 1;
                try {
                    await updateList(listId, {
                        position: position,
                    });
                } catch (e) {
                    console.log(e);
                }
            });
        },
    });
}

export {
    handleAddListForm,
    showAddListModal,
    showEditListForm,
    editList,
    getLists,
    dragNDropList,
};
