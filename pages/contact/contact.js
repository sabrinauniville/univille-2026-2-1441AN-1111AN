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
