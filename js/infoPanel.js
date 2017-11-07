class InfoPanel {
    constructor() {
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
            $( 'body' ).append( ( $('<pre>').text( JSON.stringify( data) ) ) );
            console.log( data.results.bindings[0].article.value );
        } );


    }
}
