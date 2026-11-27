export function sanitizeHTML(html) {
  const allowedTags = ["STRONG", "B", "EM", "I", "BR", "P", "A", "SUP", "SUB"];

  const template = document.createElement("template");
  template.innerHTML = html;

  function sanitizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return document.createDocumentFragment();
    }

    const element = node;
    const fragment = document.createDocumentFragment();

    if (!allowedTags.includes(element.tagName)) {
      element.childNodes.forEach((child) => {
        fragment.appendChild(sanitizeNode(child));
      });

      return fragment;
    }

    const cleanElement = document.createElement(element.tagName.toLowerCase());

    if (element.tagName === "A") {
      const href = element.getAttribute("href");

      if (href) {
        try {
          const url = new URL(href, window.location.origin);

          if (["https:", "http:"].includes(url.protocol)) {
            cleanElement.href = url.href;
            cleanElement.target = "_blank";
            cleanElement.rel = "noopener noreferrer";
          }
        } catch {
          // Ignora endereços inválidos.
        }
      }
    }

    element.childNodes.forEach((child) => {
      cleanElement.appendChild(sanitizeNode(child));
    });

    fragment.appendChild(cleanElement);

    return fragment;
  }

  const result = document.createElement("div");

  template.content.childNodes.forEach((node) => {
    result.appendChild(sanitizeNode(node));
  });

  return result.innerHTML;
}
