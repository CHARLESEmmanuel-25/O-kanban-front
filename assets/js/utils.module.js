import {
    handleAddListForm,
    showAddListModal,
    showEditListForm,
    editList,
} from './lists/list.module.js';
import { handleAddCardForm } from './cards/card.module.js';
import {
    handleAssociateTagForm,
    showAddTagModal,
    handleAddTagForm,
} from './tags/tag.module.js';

// * peut-être bouger cette function ailleurs
function addListenerToActions() {
    // AJOUT DE LISTES
    const addListBtn = document.getElementById('addListButton');
    addListBtn.addEventListener('click', showAddListModal);

    // AJOUT DE TAG
    const addTagBtn = document.getElementById('addTagButton');
    addTagBtn.addEventListener('click', showAddTagModal);

    const closeListModalBtns = document.querySelectorAll('.close');
    closeListModalBtns.forEach((btn) => {
        btn.addEventListener('click', hideModals);
    });

    // AJOUT DE CARTES
    addEventsToList();
    handleAddListForm();
    handleAddCardForm();
    handleAddTagForm();
    handleAssociateTagForm();
}

// * On pourrait mettre le contenu de cette fonction dans le makeListInDom
// * Continuer la réflexion : est-ce que cette fonction ne devrait pas être refactoriser
function addEventsToList() {
    const titles = document.querySelectorAll('.panel h2');
    for (const listTitle of titles) {
        // * Avec cette syntaxe, l'event est fourni directement par JS, on passe par référence, on ne met pas les parenthèses
        // * Warning : je suis pas sur du terme référence
        listTitle.addEventListener('dblclick', showEditListForm);
    }
    const editListForms = document.querySelectorAll('.panel form.js-list-form');
    for (const form of editListForms) {
        form.addEventListener('submit', editList);
    }
}

// gérer avec un event.target
function hideModals() {
    document.getElementById('addListModal').classList.remove('is-active');
    document.getElementById('addCardModal').classList.remove('is-active');
    document.getElementById('associateTagModal').classList.remove('is-active');
    document.getElementById('addTagModal').classList.remove('is-active');
}

function getMetaCsrf() {
    return document.head.querySelector('meta[name=csrf-token]').content;
}

export { addListenerToActions, hideModals, addEventsToList, getMetaCsrf };
