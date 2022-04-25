function setProperties(consumer_key, consumer_secret, store_url) {
    // Guardando minhas variáveis
    let documentProperties = PropertiesService.getDocumentProperties();

    documentProperties.setProperties({
        'consumer_key': consumer_key,
        'consumer_secret': consumer_secret,
        'store_url': store_url,
    });

    SpreadsheetApp.getActive().toast("Configurações Salvas");

}

function setPage(page) {
    let documentProperties = PropertiesService.getDocumentProperties();
    documentProperties.setProperty('actual_page', page);
}