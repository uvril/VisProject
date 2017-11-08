class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
    }

    updateInfo(oneCountryInfo, year) {
        document.getElementById("country").innerHTML = oneCountryInfo.NAME;

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
            document.getElementById("wikipage").setAttribute("height", this.svgHeight/2);
            document.getElementById("wikipage").setAttribute("width", this.svgWidth);
        }.bind(this));

        let labelQuery = function (wikidata, domain) {
            let sparqlQuery = "SELECT ?name WHERE {\n" +
            "    wd:Q" + wikidata + " wdt:P" + domain +" ?link.\n" +
            "    ?link rdfs:label ?name.\n" +
            "    filter (lang(?name) = \"en\")\n" +
            "}";
            let settings = {
                headers: { Accept: 'application/sparql-results+json' },
                data: { query: sparqlQuery }
            };
            return settings;
        }

        let domain = 36;
        $.ajax( endpointUrl, labelQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            document.getElementById("capital").innerHTML = data.results.bindings[0].name.value;
        });

        domain = 30;
        $.ajax( endpointUrl, labelQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            d3.select("#continent")
                .html("");
            d3.select("#continent")
                .append("ul")
                .selectAll("li")
                .data(data.results.bindings)
                .enter().append("li")
                .text(d=>d.name.value);
        });

        domain = 35;
        $.ajax( endpointUrl, labelQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            document.getElementById("headState").innerHTML = data.results.bindings[0].name.value;
        });

        domain = 1081;
        $.ajax( endpointUrl, labelQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            document.getElementById("humanIndex").innerHTML = data.results.bindings[0].name.value;
        });

        let statsQuery = function(wikidata, domain) {
            let sparqlQuery = "SELECT ?stats ?year WHERE {\n" +
            "    wd:Q" + wikidata + " p:P" + domain + " ?poplink.\n" +
            "    ?poplink ps:P" + domain +" ?stats.\n" +
            "    ?poplink pq:P585 ?date.\n" +
            "    bind (year(?date) as ?year).\n" +
            "}\n" +
            "order by ?year\n";
            let settings = {
                headers: { Accept: 'application/sparql-results+json' },
                data: { query: sparqlQuery }
            };
            return settings;
        }

        domain = 1082;
        $.ajax( endpointUrl, statsQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            d3.select("#population")
                .html("");
            d3.select("#population")
                .append("ul")
                .selectAll("li")
                .data(data.results.bindings)
                .enter().append("li")
                .text(d=>d.year.value+"  "+d.stats.value);
        });

        domain = 1081;
        $.ajax( endpointUrl, statsQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            d3.select("#humanIndex")
                .html("");
            d3.select("#humanIndex")
                .append("ul")
                .selectAll("li")
                .data(data.results.bindings)
                .enter().append("li")
                .text(d=>d.year.value+"  "+d.stats.value);
        });
    }
}
