import Sortable from 'sortablejs';
import { hideModals } from '../utils.module.js';
import { createCard, update, destroy } from './api.cards.module.js';
import { makeTagInDOM, showAssociateTagModal } from '../tags/tag.module.js';

function showAddCardModal(event) {
    document.getElementById('addCardModal').classList.add('is-active');

    const listContainer = event.target.closest('.panel');
    // * On récupère l'attribut data-list-id d'une liste pour l'ajouter au formulaire de création de carte
    // console.log(listContainer.getAttribute('data-list-id'));
    const listId = listContainer.dataset.listId;

    const addCardForm = document.querySelector('#addCardModal form');

    addCardForm.querySelector('input[type=hidden]').value = listId;
}

function handleAddCardForm() {
    const addListForm = document.querySelector('#addCardModal form');

    addListForm.addEventListener('submit', async event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.target));
        try {
            const card = await createCard(data);

            makeCardInDOM(card);
            event.target.reset();
        } catch (e) {
            console.log(e);
        }
    });
}

function makeCardInDOM(data) {
    const cardTemplate = document.getElementById('card-template');
    // ! On précise true pour obtenir tout ce qui est contenu dans le template
    const clone = document.importNode(cardTemplate.content, true);

    clone.querySelector('[slot=card-title]').textContent = data.content;
    clone.querySelector('[slot=card-title]').style.backgroundColor = data.color;
    const card = clone.querySelector('.box');
    card.setAttribute('data-card-id', data.id);

    const cardForm = card.querySelector('form.js-card-form');
    cardForm.addEventListener('submit', updateCard);

    const links = card.querySelectorAll('a');
    // * QuerySelectorAll retourne un nodelist : on prend le premier pour éditer et le second pour effacer
    const editBtn = links[0];
    editBtn.addEventListener('click', editCard);
    const deleteBtn = links[1];
    deleteBtn.addEventListener('click', deleteCard);
    const tagBtn = links[2];

    tagBtn.addEventListener('click', showAssociateTagModal);

    /* On doit sélectionne la liste correcte pour ajouter notre carte sur la DOM */
    // On a l'info data.listId qui correspond à une liste sur le DOM
    const theGoodList = document.querySelector(
        `[data-list-id="${data.list_id}"]`
    );

    // On doit ajouter un event listener après avoir créer la carte
    theGoodList.querySelector('.panel-block').appendChild(clone);

    // Si la carte est associée
    if (data.tags?.length) {
        for (const tag of data.tags) {
            makeTagInDOM(tag);
        }
    }

    hideModals();
}

function editCard(event) {
    const btn = event.target;
    const card = btn.closest('.box');
    const cardText = card.querySelector('.column');
    const cardform = card.querySelector('form');
    cardform.querySelector('input[type=hidden]').value =
        card.getAttribute('data-card-id');
    cardText.classList.add('is-hidden');
    cardform.classList.remove('is-hidden');
}

async function updateCard(event) {
    event.preventDefault();

    const form = event.target;

    const data = Object.fromEntries(new FormData(form));

    const updatedCard = await update(data['card-id'], data);

    form.classList.add('is-hidden');
    const contentElem = form.previousElementSibling;
    contentElem.textContent = updatedCard.content;
    contentElem.classList.remove('is-hidden');
    form.reset();
}

async function deleteCard(event) {
    if (confirm('Etes vous sûr de vouloir effacer cette carte ?')) {
        const btn = event.target;
        const card = btn.closest('.box');
        const cardId = card.getAttribute('data-card-id');
        await destroy(cardId);

        card.remove();
    }

    return false;
}

function dragNDropCard() {
    // * On doit sélectionner les conteneurs des cartes

    const cardsContainerPourCraner =
        document.getElementsByClassName('panel-block');
    // cardsContainer.call.forEach(cardsContainer, (container) => {
    //     console.log(container);
    // });

    Array.prototype.forEach.call(cardsContainerPourCraner, container => {
        Sortable.create(container, {
            group: 'cards',
            onEnd: async event => {
                // * On récupère l'ID de la carte
                const cardId = event.item.getAttribute('data-card-id');
                // * On doit récupérer l'ID de la liste à laquelle appartient la carte
                const cardContainer = event.to.parentElement;
                const listId = cardContainer.getAttribute('data-list-id');

                await update(cardId, { list_id: listId });

                // Mise à jour des positions
                const cards = cardContainer.querySelectorAll('.box');
                cards.forEach(async (card, index) => {
                    const cardId = card.getAttribute('data-card-id');
                    const newPosition = index + 1;

                    await update(cardId, { position: newPosition });
                });
            },
        });
    });

    // const cardsContainer = document.querySelectorAll('.panel-block');

    // cardsContainer.forEach((container) => {
    //     Sortable.create(container, {
    //         group: 'cards',
    //         onEnd: async (event) => {
    //             // * On récupère l'ID de la carte
    //             const cardId = event.item.getAttribute('data-card-id');
    //             // * On doit récupérer l'ID de la liste à laquelle appartient la carte
    //             const cardContainer = event.to.parentElement;
    //             const listId = cardContainer.getAttribute('data-list-id');

    //             await update(cardId, { list_id: listId });

    //             // Mise à jour des positions
    //             const cards = cardContainer.querySelectorAll('.box');
    //             cards.forEach(async (card, index) => {
    //                 const cardId = card.getAttribute('data-card-id');
    //                 const newPosition = index + 1;

    //                 await update(cardId, { position: newPosition });
    //             });
    //         },
    //     });
    // });

    // Sortable.create(listsContainer, {
    //     animation: 1000,
    //     onEnd: () => {
    //         // * Quand on termine la drag n drop, on doit mettre à jour la position des listes : pour chaque liste, on doit faire une requête

    //         const lists = document.querySelectorAll('#lists-container .panel');

    //         // * index est fourni automatiquement par forEach : c'est l'index de la donnée sur laquelle on fait la boucle
    //         lists.forEach(async (list, index) => {
    //             const listId = list.getAttribute('data-list-id');
    //             // * L'index est la position de l'élément sur le DOM, la base de données n'accepte pas le 0, on ajoute donc 1 à chque index pour répondre aux exigences de la BDD
    //             const position = index + 1;
    //             await updateList(listId, {
    //                 position: position,
    //             });
    //         });
    //     },
    // });
}

function removeCardFromDom(cardId) {
    document.querySelector(cardId).remove();
}

export {
    showAddCardModal,
    makeCardInDOM,
    handleAddCardForm,
    dragNDropCard,
    removeCardFromDom,
};
