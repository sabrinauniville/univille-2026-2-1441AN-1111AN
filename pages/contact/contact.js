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
