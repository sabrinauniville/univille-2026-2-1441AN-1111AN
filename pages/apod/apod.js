import { Nasabervice} from "../../scripts/services/service.js";
import {
getCurrentMonthStart,
getLastAvailableDate,
parseDateValue,
validateDateRange,
formatDate,
showInitialCard,
enforceDateBounds,
createDataPageController,
sanitizeHTML,
escapeHTML,
extractMediaUrl,
getSafeMediaUrl,
} from "../../scripts/shared/index.js";

const dataPageController = createDataPageController({
  requestDataOutput,
  updateDataOutput,
  button: updateDataButton,
  resultsList: resultList,
  initialCard: mainResult,
  resultMessage: "Erro ao carregar APOD:"
});


dataPageController.updateStatus("");
