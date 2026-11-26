/**
 * Escapa caracteres especiais para evitar interpretação de HTML.
 * Utilizada em textos e atributos HTML.
 */
export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}
