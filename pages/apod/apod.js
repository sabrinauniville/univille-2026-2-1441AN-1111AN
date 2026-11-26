const dataPageController = createDataPageController({
  requestDataOutput,
  updateDataOutput,
  button: updateDataButton,
  resultsList: resultList,
  initialCard: mainResult,
  resultMessage: "Erro ao carregar APOD:"
});


dataPageController.updateStatus("");
