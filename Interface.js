function onOpen() {
    SpreadsheetApp
        .getUi()
        .createMenu("Woocoomerce ⚙️")
        .addItem("Configurações Gerais", "showAdminSidebar")
        .addToUi();
}

function showAdminSidebar() {
    let widget = HtmlService.createHtmlOutputFromFile("AdminPage.html");
    SpreadsheetApp.getUi().showSidebar(widget);
}

function displayToast(consumer_secret, consumer_key) {
    SpreadsheetApp.getActive().toast("Hi " + consumer_secret + "!");
}