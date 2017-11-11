class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
        this.humanIndex = d3.select("#humanIndex")
                            .attr("width", this.svgBounds.width)
                            .attr("height", 30);
        this.humanIndex = d3.select("#population")
                            .attr("width", this.svgBounds.width)
                            .attr("height", 250);
        this.remain = null;
    }

    updateInfo(oneCountryInfo, year) {
        console.log(oneCountryInfo);
        if (oneCountryInfo.wikidata < 0) {
            this.remain = document.getElementById("details").innerHTML;
            document.getElementById("details").innerHTML = "<h1 id=\"country\"></h1>";
            document.getElementById("country").innerHTML = oneCountryInfo.NAME;
            return;
        }
        else if (this.remain != null) {
             document.getElementById("details").innerHTML = this.remain;
             this.remain = null;
        }

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
            let xScale = d3.scaleLinear()
                .domain([d3.min(data.results.bindings, d=>+d.year.value), d3.max(data.results.bindings, d=>+d.year.value)])
                .range([80, d3.select("#population").node().getBoundingClientRect().width-30]);
            let yScale = d3.scaleLinear()
                .domain([d3.min(data.results.bindings, d=>+d.stats.value), d3.max(data.results.bindings, d=>+d.stats.value)])
                .range([d3.select("#population").node().getBoundingClientRect().height-20, 0]);
            let lineGenerator = d3.line()
                                    .x(function(d) {
                                        console.log(d.year.value, xScale(d.year.value));
                                        return xScale(d.year.value);
                                    })
                                    .y(function(d){
                                        console.log(d.stats.value, yScale(d.stats.value));
                                        return yScale(d.stats.value);
                                    });

            d3.select("#popShow")
                .html("");

            d3.select("#popShow")
                .append("path")
                .attr("d", lineGenerator(data.results.bindings))
                .style("fill", "none")
                .style("stroke", "black");

            let xAxis = d3.axisBottom();
            xAxis.scale(xScale)
                .ticks(data.results.bindings.length > 10? 10 : data.results.bindings.length);

            let yAxis = d3.axisLeft();
            yAxis.scale(yScale)
                .ticks(5);

            d3.select("#popShow")
                .append("g")
                .attr("transform", "translate(0, 230)")
                .style("fill", "none")
                .style("stroke", "black")
                .call(xAxis);

            d3.select("#popShow")
                .append("g")
                .attr("transform", "translate(80, 0)")
                .style("fill", "none")
                .style("stroke", "black")
                .call(yAxis);
            /*d3.select("#population")
                .html("");
            d3.select("#population")
                .append("ul")
                .selectAll("li")
                .data(data.results.bindings)
                .enter().append("li")
                .text(d=>d.year.value+"  "+d.stats.value);*/
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
                .range([20, d3.select("#humanIndex").node().getBoundingClientRect().width-20])
                .paddingInner(0.01);
            d3.select("#humanIndex")
                .html("");
            d3.select("#humanIndex")
                .selectAll("rect")
                .data(data.results.bindings)
                .enter().append("rect")
                .attr("x", d=>xScale(d.year.value))
                .attr("y", 5)
                .attr("width", xScale.bandwidth())
                .attr("height", 10)
                .style("fill", d=>colorScale(d.stats.value));
            let textArray = [data.results.bindings[0], data.results.bindings[data.results.bindings.length-1]]
            d3.select("#humanIndex")
                .selectAll("text")
                .data(textArray)
                .enter().append("text")
                .attr("x", d=>xScale(d.year.value) + xScale.bandwidth()/2)
                .attr("y", 30) 
                .attr("text-anchor", "middle")
                .text(d=>d.year.value);
        }); 
    }
}
