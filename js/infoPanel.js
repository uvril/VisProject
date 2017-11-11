class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
        d3.select("#humanIndex")
            .append("svg")
            .attr("id", "showIndex")
            .attr("width", this.svgBounds.width)
            .attr("height", 20);
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
            console.log(sparqlQuery);
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
            let array = []
            data.results.bindings.forEach(d=>array.push(d.name.value))
            d3.select("#continent")
                .text(array.join(", "));
        });

        domain = 35;
        $.ajax( endpointUrl, labelQuery(oneCountryInfo.wikidata, domain.toString()) ).then( function ( data ) {
            document.getElementById("headState").innerHTML = data.results.bindings[0].name.value;
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
            let xdomain = [0, 0.5, 1];
            let range = ['red', "yellow", 'green'];
            let colorScale = d3.scaleLinear()
                .domain(xdomain)
                .range(range);
            let xScale = d3.scaleBand()
                .domain(data.results.bindings.map(d=>+d.year.value).sort(d3.ascending))
                .range([0, d3.select("#showIndex").node().getBoundingClientRect().width-40])
                .paddingInner(0.01);
            d3.select("#showIndex")
                .html("");
            d3.select("#showIndex")
                .selectAll("rect")
                .data(data.results.bindings)
                .enter().append("rect")
                .attr("x", d=>xScale(d.year.value))
                .attr("y", 5)
                .attr("width", xScale.bandwidth())
                .attr("height", 10)
                .style("fill", d=>colorScale(d.stats.value));
        }); 

    }
}
