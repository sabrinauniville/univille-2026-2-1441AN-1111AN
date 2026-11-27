import {
  validateName,
  validateEmail,
  validateSubject,
  validateMessage,
} from "../../scripts/shared/index.js";

const form = document.getElementById("contact-form");
const submitButton = document.getElementById("submit-contact");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const subjectInput = document.getElementById("subject");
const messageInput = document.getElementById("message");
const formStatus = document.getElementById("form-status");

const fieldOrder = [nameInput, emailInput, subjectInput, messageInput];

function hideStatus() {
  if (!formStatus) {
    return;
  }

  formStatus.textContent = "";
  formStatus.className = "status-banner";
  formStatus.hidden = true;
}

function setStatus(message, type = "info") {
  if (!formStatus) {
    return;
  }

  if (!message || !message.trim()) {
    hideStatus();
    return;
  }

  formStatus.textContent = message;
  formStatus.className = "status-banner";
  formStatus.hidden = false;

  if (type === "success") {
    formStatus.classList.add("status-success");
  }

  if (type === "error") {
    formStatus.classList.add("status-error");
  }

  if (type === "info") {
    formStatus.classList.add("status-info");
  }
}

function clearErrors() {
  fieldOrder.forEach((field) => {
    if (!field) {
      return;
    }

    field.classList.remove("input-error");
    field.setAttribute("aria-invalid", "false");
  });

  ["name-error", "email-error", "subject-error", "message-error"].forEach(
    (id) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = "";
      }
    },
  );
}

function setFieldError(field, message) {
  if (!field) {
    return;
  }

  const errorElement = document.getElementById(`${field.id}-error`);
  field.classList.add("input-error");
  field.setAttribute("aria-invalid", "true");

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function isFormValid() {
  return [
    { field: nameInput, validator: validateName },
    { field: emailInput, validator: validateEmail },
    { field: subjectInput, validator: validateSubject },
    { field: messageInput, validator: validateMessage },
  ].every(({ field, validator }) => validator(field.value).valid);
}

function validateForm() {
  clearErrors();

  let valid = true;

  [
    { field: nameInput, validator: validateName },
    { field: emailInput, validator: validateEmail },
    { field: subjectInput, validator: validateSubject },
    { field: messageInput, validator: validateMessage },
  ].forEach(({ field, validator }) => {
    const result = validator(field.value);

    if (!result.valid) {
      valid = false;
      setFieldError(field, result.message);
    }
  });

  return valid;
}

function updateSubmitState() {
  if (!submitButton) {
    return;
  }

  const valid = isFormValid();
  submitButton.disabled = !valid;
  submitButton.setAttribute("aria-disabled", String(!valid));
}

function submitContact(event) {
  event.preventDefault();

  if (!validateForm()) {
    alert("Corrija os campos destacados antes de enviar.");
    updateSubmitState();
    return;
  }

  const contactData = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    subject: subjectInput.value.trim(),
    message: messageInput.value.trim(),
  };

  console.log("Mensagem enviada:", contactData);
  form.reset();
  clearErrors();
  updateSubmitState();
  setStatus("Mensagem enviada com sucesso!", "success");
}

function handleReset() {
  clearErrors();
  hideStatus();
  updateSubmitState();
}

document.addEventListener("DOMContentLoaded", () => {
  if (!form) {
    return;
  }

  hideStatus();
  updateSubmitState();

  fieldOrder.forEach((field) => {
    if (!field) {
      return;
    }

    field.addEventListener("input", updateSubmitState);
    field.addEventListener("change", updateSubmitState);
  });

  form.addEventListener("submit", submitContact);
  form.addEventListener("reset", handleReset);
});
