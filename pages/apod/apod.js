const dataPageController = createDataPageController({
  requestDataOutput,
  updateDataOutput,
  button: updateDataButton,
  resultsList: resultList,
  initialCard: mainResult,
  resultMessage: "Erro ao carregar APOD:"
});

dataPageController.updateStatus("");


// =========================================
// Inicialização do formulário de datas
// Define o intervalo permitido e os valores padrão ao carregar a página
// =========================================

const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMonthStart() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return formatDate(firstDay);
}

function getLastAvailableDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

function setDefaultDateRange() {
  const minDate = getCurrentMonthStart();
  const maxDate = getLastAvailableDate();

  startDateInput.min = minDate;
  startDateInput.max = maxDate;
  endDateInput.min = minDate;
  endDateInput.max = maxDate;

  startDateInput.value = maxDate;
  endDateInput.value = maxDate;
}

setDefaultDateRange();



// =========================================
// Renderização dos resultados do APOD
// Exibe na página os dados retornados pelo serviço
//

function renderData(items) {
  const collection = Array.isArray(items) ? items : [items];
  if (!collection.length) {
    throw new Error("Nenhum dado encontrado para o período informado.");
  }

  resultsList.classList.remove("hidden");
  resultsList.innerHTML = collection
    .map(
      (item) => `
        <article class="card">
          <div class="text-block">
            <h3>${escapeHTML(item.title || "Sem título")}</h3>

            <p class="date">
              ${escapeHTML(formatDate(item.date || ""))}
            </p>

            <div class="description">
              ${sanitizeHTML(item.explanation || "Sem descrição disponível.")}
            </div>
          </div>

          ${renderMedia(item)}
        </article>
      `,
    )
    .join("");

  resultsList.focus();
}
