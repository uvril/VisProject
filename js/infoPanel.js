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
            //$( 'body' ).append( ( $('<pre>').text( JSON.stringify( data) ) ) );
            //this.tmp = data.results.bindings[0].article.value;
            document.getElementById("wikipage").setAttribute("src", data.results.bindings[0].article.value+"?printable=yes");

        }.bind(this));

        //console.log(this.tmp);
        //document.getElementById("wikipage").innerHTML = "<iframe height=\"1000\" width=\"1000\" src="+this.tmp+"?printable=yes></iframe>";
    }
}
