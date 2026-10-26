import "./index.css";
import {
  enableValidation,
  validationConfig,
  resetValidation,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "93cdf119-e2f9-4f98-b9b4-71c509b131d2",
    "Content-Type": "application/json",
  },
});

// --- Profile elements ---
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileForm = document.querySelector("#edit-profile-form");
const profileNameInput = editProfileForm.querySelector("#profile-name-input");
const profileDescriptionInput = editProfileForm.querySelector(
  "#profile-description-input",
);
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");

// --- New post elements ---
const addNewPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostForm = document.querySelector("#card-form");
const cardLinkInput = newPostForm.querySelector("#card-link-input");
const cardNameInput = newPostForm.querySelector("#card-name-input");

// --- Preview modal elements ---
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(
  ".modal__close-btn_type_preview",
);
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaption = previewModal.querySelector(".modal__caption");

// --- Cards ---
const cardListEl = document.querySelector(".cards__list");
const cardTemplate = document.querySelector("#card-template").content;

// --- Avatar Form Elements ---
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarModal = document.querySelector("#avatar-modal");
const avatarCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarForm = document.querySelector("#avatar-form");
const avatarInput = avatarForm.querySelector("#profile-avatar-input");

// --- Delete Form Elements ---
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");
const deleteModalCloseBtn = deleteModal.querySelector(".modal__close-btn");
const deleteModalCancelBtn = deleteForm.querySelector(".modal__cancel-btn");
const deleteSubmitBtn = deleteForm.querySelector('button[type="submit"]');

let cardIdToDelete = null;
let cardElementToDelete = null;

// ============================
// Modal open/close helpers
// ============================
function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscClose);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === evt.currentTarget) {
      closeModal(modal);
    }
  });
});

// ============================
// Render helpers
// ============================
function renderLoading(isLoading, button, loadingText = "Saving...") {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

// ============================
// Profile Edit
// ============================
function openEditProfileModal() {
  profileNameInput.value = profileNameEl.textContent;
  profileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(editProfileForm, validationConfig);
  openModal(editProfileModal);
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = editProfileForm.querySelector(".modal__submit-btn");
  renderLoading(true, submitBtn);

  api
    .editUserInfo({
      name: profileNameInput.value,
      about: profileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch((err) => console.error(err))
    .finally(() => renderLoading(false, submitBtn));
}

editProfileBtn.addEventListener("click", openEditProfileModal);
editProfileCloseBtn.addEventListener("click", () =>
  closeModal(editProfileModal),
);
editProfileForm.addEventListener("submit", handleEditProfileSubmit);

// ============================
// Avatar Edit
// ============================
function openAvatarModal() {
  avatarInput.value = "";
  resetValidation(avatarForm, validationConfig);
  openModal(avatarModal);
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".modal__submit-btn");
  renderLoading(true, submitBtn);

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch((err) => console.error(err))
    .finally(() => renderLoading(false, submitBtn));
}

avatarModalBtn.addEventListener("click", openAvatarModal);
avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));
avatarForm.addEventListener("submit", handleAvatarSubmit);

// ============================
// Preview Modal
// ============================
function openPreviewModal(data) {
  previewImageEl.src = data.link;
  previewImageEl.alt = data.name;
  previewCaption.textContent = data.name;
  openModal(previewModal);
}

previewModalCloseBtn.addEventListener("click", () => closeModal(previewModal));

// ============================
// Delete Modal
// ============================
function openDeleteModal(cardId, cardElement) {
  cardIdToDelete = cardId;
  cardElementToDelete = cardElement;
  openModal(deleteModal);
}

function closeDeleteModal() {
  cardIdToDelete = null;
  cardElementToDelete = null;
  closeModal(deleteModal);
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  renderLoading(true, deleteSubmitBtn, "Deleting...");

  api
    .deleteCard(cardIdToDelete)
    .then(() => {
      cardElementToDelete.remove();
      closeDeleteModal();
    })
    .catch((err) => console.error(err))
    .finally(() => renderLoading(false, deleteSubmitBtn));
}

deleteForm.addEventListener("submit", handleDeleteSubmit);
deleteModalCloseBtn.addEventListener("click", closeDeleteModal);
deleteModalCancelBtn.addEventListener("click", closeDeleteModal);

// ============================
// Cards: create + render
// ============================
function getCardElement(data, userId) {
  const cardElement = cardTemplate.cloneNode(true).querySelector(".card");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-button");
  const cardLikeBtn = cardElement.querySelector(".card__like-button");

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  const isLiked =
    data.isLiked ||
    (data.likes && userId
      ? data.likes.some((like) => like._id === userId)
      : false);
  if (isLiked) {
    cardLikeBtn.classList.add("card__like-button_active");
  }

  cardDeleteBtn.addEventListener("click", () => {
    openDeleteModal(data._id, cardElement);
  });

  cardLikeBtn.addEventListener("click", () => {
    const currentlyLiked = cardLikeBtn.classList.contains(
      "card__like-button_active",
    );

    api
      .changeLikeCardStatus(data._id, currentlyLiked)
      .then((updatedCard) => {
        cardLikeBtn.classList.toggle(
          "card__like-button_active",
          updatedCard.isLiked,
        );
      })
      .catch((err) => console.error(err));
  });

  cardImageEl.addEventListener("click", () => {
    openPreviewModal(data);
  });

  return cardElement;
}

function renderCard(data, userId, method = "prepend") {
  const cardElement = getCardElement(data, userId);
  cardListEl[method](cardElement);
}

// ============================
// New Post
// ============================
function openNewPostModal() {
  newPostForm.reset();
  resetValidation(newPostForm, validationConfig);
  openModal(newPostModal);
}

function handleNewPostSubmit(evt) {
  evt.preventDefault();
  const submitBtn = newPostForm.querySelector(".modal__submit-btn");
  renderLoading(true, submitBtn);

  api
    .addCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    })
    .then((data) => {
      renderCard(data, data.owner._id, "prepend");
      closeModal(newPostModal);
      newPostForm.reset();
    })
    .catch((err) => console.error(err))
    .finally(() => renderLoading(false, submitBtn));
}

addNewPostBtn.addEventListener("click", openNewPostModal);
newPostCloseBtn.addEventListener("click", () => closeModal(newPostModal));
newPostForm.addEventListener("submit", handleNewPostSubmit);

// ============================
// Initial data load
// ============================
let currentUserId = null;

api
  .getAppInfo()
  .then(([userData, cards]) => {
    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    profileAvatarEl.src = userData.avatar;
    currentUserId = userData._id;

    cards.forEach((cardData) => {
      renderCard(cardData, currentUserId, "append");
    });
  })
  .catch((err) => console.error(err));

// ============================
// Validation
// ============================
enableValidation(validationConfig);

