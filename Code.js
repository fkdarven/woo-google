function createRequests() {
    const docProperties = PropertiesService.getDocumentProperties();
    const consumer_key = docProperties.getProperty('consumer_key');
    const consumer_secret = docProperties.getProperty('consumer_secret');
    const store_url = docProperties.getProperty('store_url');
    //Precisamos fazer um request pra descobrir o número de páginas da requisição
    let request = store_url + "?per_page=100&page=1&consumer_key=" + consumer_key + "&consumer_secret=" + consumer_secret;
    let requests = [];
    let response = UrlFetchApp.fetch(request);
    let requestsResponse = [];
    const pages = response.getHeaders()['x-wp-totalpages'];
    docProperties.setProperty('actual_page', pages);
    for (let i = 1; i <= pages; i++) {
        request = store_url + "?per_page=100&page=" + i + "&consumer_key=" + consumer_key + "&consumer_secret=" + consumer_secret;
        requests.push(request)
    }
    let initindex = 0;
    let finalIndex = 5;
    for (let initialPage = 1; initialPage < pages; initialPage += 5) {
        try {
            requestsResponse.push(UrlFetchApp.fetchAll(requests.slice(initindex, finalIndex)));
        } catch (exception) {
            requestsResponse.push(UrlFetchApp.fetchAll(requests.slice(pages % 5)));
        }
        initindex += 5;
        finalIndex += 5;
    }
    handleData(requestsResponse);
}
//Aqui precisamos separar nossa coleção de dados em pedaços de pedaços, pra conseguirmos extrair informações de produtos e cupons. Lembrando, cada pedaço tem 5 requisições, e cada requisição possui 100 pedidos
function handleData(chunkData) {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Data Studio Teste').clear();
    const generalSpreadSheet = SpreadsheetApp.getActive().getSheetByName('Data Studio Teste');
    const productsSpreadSheet = SpreadsheetApp.getActive().getSheetByName('Produtos');
    productsSpreadSheet.clear();
    let pieceDataFormated = [];
    let products = [];
    let productsDataFormated = [];
    let index = 0;
    chunkData.forEach(function(pieceData) {
        pieceData.forEach(function(rowData) {
            pieceDataFormated = [];
            productsDataFormated = [];
            row = [];
            products = [];
            let lastRowG = generalSpreadSheet.getLastRow();
            let lastRowP = productsSpreadSheet.getLastRow();
            let rowsData = JSON.parse(rowData.getContentText());
            for (index = 0; index < 100; index++) {
                let row = Object.values(rowsData[index]);

                Object.values(rowsData[index].billing).forEach(function(info) {
                    row.push(info);
                })
                if (rowsData[index].coupon_lines.length > 0) {
                    Object.values(rowsData[index].coupon_lines[0]).forEach(function(couponLine) {
                        row.push(couponLine);
                    })
                } else {
                    //Isso é adicionado pra não termos inconsistências no número de colunas
                    row.push('0');
                    row.push('Sem cupom');
                    row.push('Sem valor');
                    row.push('Sem metadata');
                    row.push('Sem extra');
                }
                products = [];
                Object.values(rowsData[index].line_items).forEach(function(itemLine) {
                    products.push(rowsData[index].id);
                    Object.values(itemLine).forEach(function(item) {
                        products.push(item);
                    })
                    productsDataFormated.push(products);
                    products = [];
                })
                pieceDataFormated.push(row);
                rows = [];
                products = [];
            }
            let responseG = pieceDataFormated.map(el => Object.values(el));
            let responseP = productsDataFormated.map(el => Object.values(el));
            generalSpreadSheet.getRange(lastRowG + 1, 1, 100, 71).setValues(responseG);
            productsSpreadSheet.getRange(lastRowP + 1, 1, productsDataFormated.length, productsDataFormated[0].length).setValues(responseP);
        })
    })



}