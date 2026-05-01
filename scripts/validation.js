const settings = {
  formSelector: ".modal__form",
  inputSelector: ".modal__input",
  submitButtonSelector: ".modal__submit-btn",
  inactiveButtonClass: "modal__submit-btn_disabled",
  inputErrorClass: "modal__error",
  errorClass: "modal__error_visible"
}

const showInputError = (formEl, inputEl, errorMessage) => {
const errorMsgEl = document.querySelector(`#${inputEl.id}-error`);
errorMsgEl.textContent = errorMessage;
inputEl.classList.add("modal__input_type_error");
};

const hideInputError = (formEl, inputEl) => {
const errorMsgEl = document.querySelector(`#${inputEl.id}-error`);
errorMsgEl.textContent = "";
inputEl.classList.remove("modal__input_type_error");
};


const checkInputValidity = (formEl, inputEl) => {
  console.log(inputEl.validationMessage);
  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage);
  } else {
    hideInputError(formEl, inputEl);
  }
};

const hasInvalidInput = (inputList) => {
return inputList.some((inputElement) => {
  return !inputElement.validity.valid;
})
};

const toggleButtonState = (inputList, buttonEl) => {
  if (hasInvalidInput(inputList)) {
    buttonEl.disabled = true;
    buttonEl.classList.add("modal__submit-btn_disabled");
    //don't forget the CSS
  } else {
    buttonEl.disabled = false;
     buttonEl.classList.remove("modal__submit-btn_disabled");
  }
};

const disableButton = (buttonEl, config) => {
buttonEl.disabled = true;
};

const resetValidation = (formEl, inputList, config) => {
inputList.forEach((input) => {
  hideInputError(formEl, input);
});
};

//TODO: use the setting object in all functions instead of hard-coding strings.

const setEventListeners = (formEl, config) => {
const inputList = Array.from(formEl.querySelectorAll(config.inputSelector));
  const buttonElement = formEl.querySelector(config.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, config);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", function () {
      checkInputValidity(formEl, inputElement, config);
      toggleButtonState(inputList, buttonElement, config);
    });
  });
};

const enableValidation = (config) => {
const formList = (document.querySelectorAll(config.formSelector));
formList.forEach((formEl) => {
  setEventListeners(formEl, config);
});
};

enableValidation(settings);