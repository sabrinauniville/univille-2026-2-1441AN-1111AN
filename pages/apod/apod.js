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

/**
 * Formata uma data no padrão YYYY-MM-DD (formato aceito pelo input type="date").
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Retorna o primeiro dia do mês atual.
 */
function getCurrentMonthStart() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return formatDate(firstDay);
}

/**
 * Retorna a última data disponível (ontem).
 */
function getLastAvailableDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Configura os limites e os valores iniciais dos campos de data.
 *
 * Data mínima: definida pelo helper getCurrentMonthStart().
 * Data máxima: ontem, definida pelo helper getLastAvailableDate().
 * Valores iniciais: último dia disponível.
 */
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

// Inicializa o formulário quando a página carregar
setDefaultDateRange();
