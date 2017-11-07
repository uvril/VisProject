class InfoPanel {
    constructor() {
    	this.tmp = 0;
    }

    updateInfo(oneCountryInfo, year) {
        let endpointUrl = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql',
            sparqlQuery = "SELECT ?countryLabel ?article WHERE {\n" +
            "  \n" +
            "    ?article schema:about wd:Q" + oneCountryInfo.wikidata + " .\n" +
            "    ?article schema:isPartOf <https://en.wikipedia.org/>.\n" +
            "\n" +
            "}",
            settings = {
                headers: { Accept: 'application/sparql-results+json' },
                data: { query: sparqlQuery }
            };
        $.ajax( endpointUrl, settings ).then( function ( data ) {
            document.getElementById("wikipage").setAttribute("src", data.results.bindings[0].article.value+"?printable=yes");
        });

        sparqlQuery = "SELECT ?capital WHERE {\n" +
        "    wd:Q" + oneCountryInfo.wikidata + " wdt:P36 ?caplink.\n" +
        "    ?caplink rdfs:label ?capital.\n" +
        "    filter (lang(?capital) = \"en\")\n" +
        "}";
        settings = {
            headers: { Accept: 'application/sparql-results+json' },
            data: { query: sparqlQuery }
        };

        $.ajax( endpointUrl, settings ).then( function ( data ) {
            document.getElementById("capital").innerHTML = data.results.bindings[0].capital.value;
        });
    }
}
