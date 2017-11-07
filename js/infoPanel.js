class InfoPanel {
    constructor() {
    	this.tmp = 0;
    }

    updateInfo(oneCountryInfo, year) {
        console.log(oneCountryInfo.wikidata);
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

        let labelPQuery = function (wikidata, domain) {
            let sparqlQuery = "SELECT ?name WHERE {\n" +
            "    wd:Q" + wikidata + " wdt:P" + domain +" ?link.\n" +
            "    ?link rdfs:label ?name.\n" +
            "    filter (lang(?name) = \"en\")\n" +
            "}";
            settings = {
                headers: { Accept: 'application/sparql-results+json' },
                data: { query: sparqlQuery }
            };
            return settings;
        }

        let domain = 36;
        $.ajax( endpointUrl, labelPQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            document.getElementById("capital").innerHTML = data.results.bindings[0].name.value;
        });

        domain = 30;
        $.ajax( endpointUrl, labelPQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            d3.select("#continent")
                .html("");
            d3.select("#continent")
                .append("ul")
                .selectAll("li")
                .data(data.results.bindings)
                .enter().append("li")
                .text(d=>d.name.value);
        });

        domain = 6;
        $.ajax( endpointUrl, labelPQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            document.getElementById("head").innerHTML = data.results.bindings[0].name.value;
        });

        sparqlQuery = "SELECT ?population ?date WHERE {\n" +
        "    wd:Q" + oneCountryInfo.wikidata + " p:P1082 ?poplink.\n" +
        "    ?poplink ps:P1082 ?population.\n" +
        "    ?poplink pq:P585 ?date\n" +
        "}\n" +
        "order by ?date\n",
        settings = {
            headers: { Accept: 'application/sparql-results+json' },
            data: { query: sparqlQuery }
        };
        console.log(sparqlQuery);
        $.ajax( endpointUrl, settings ).then( function ( data ) {
            d3.select("#population")
                .html("");
            d3.select("#population")
                .append("ul")
                .selectAll("li")
                .data(data.results.bindings)
                .enter().append("li")
                .text(d=>d.date.value+"  "+d.population.value);
        });
    }
}
