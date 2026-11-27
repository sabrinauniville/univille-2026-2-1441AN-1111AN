
import {
    validateName,
    validateEmail,
    validateSubject,
    validateMessage,
} from "../../scripts/shared/index.js";

const form = document.getElementById("contact-form");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const subjectField = document.getElementById("subject");
const messageField = document.getElementById("message");
const formStatus = document.getElementById("form-status");
const submitButton = document.getElementById("submit-contact");

const formFields = [
    { field: nameField, validator: validateName },
    { field: emailField, validator: validateEmail },
    { field: subjectField, validator: validateSubject },
    { field: messageField, validator: validateMessage },
];

function setFieldError(field, message) {
    const errorElement = document.getElementById(`${field.id}-error`);

    field.classList.add("input-error");
    field.setAttribute("aria-invalid", "true");

    errorElement.textContent = message;
}

function cleanFieldErrors() {
    formFields.forEach(({ field }) => {
        field.classList.remove("input-error");
        field.setAttribute("aria-invalid", "false");

        const errorElement = document.getElementById(`${field.id}-error`);
        errorElement.textContent = "";
    });
}

function validateForm() {
    cleanFieldErrors();

    let isValid = true;

    formFields.forEach(({ field, validator }) => {
        const result = validator(field.value);

        if (!result.valid) {
            setFieldError(field, result.message);
            isValid = false;
        }
    });

    return isValid;
}

function submitForm(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    // Organizar os dados preenchidos em um objeto
    const formData = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        subject: subjectField.value,
        message: messageField.value.trim(),
    };

    console.log("Dados do formulário:", formData);

    // Simular o envio com uma mensagem de sucesso
    form.reset();

    formStatus.textContent = "Mensagem enviada com sucesso!";
    formStatus.hidden = false;
}

function resetForm() {
    cleanFieldErrors();

    formStatus.textContent = "";
    formStatus.hidden = true;

    submitButton.disabled = true;
}

function updateSubmitButtonStatus() {
    const isValid = formFields.every(({ field, validator }) => {
        return validator(field.value).valid;
    });

    submitButton.disabled = !isValid;
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Js carregado");

    if (!form) {
        return;
    }

    // Registrar eventos
    form.addEventListener("submit", submitForm);
    form.addEventListener("reset", resetForm);

    // Verificar os campos enquanto o usuário digita
    formFields.forEach(({ field }) => {
        field.addEventListener("input", updateSubmitButtonStatus);
        field.addEventListener("change", updateSubmitButtonStatus);
    });
});
