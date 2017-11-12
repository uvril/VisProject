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
                            .attr("height", 260);
        this.remain = document.getElementById("details").innerHTML;
    }

    updateInfo(oneCountryInfo, year) {
        console.log(oneCountryInfo);
        let wd = oneCountryInfo.wikidata;
        if (wd < 0) {
            document.getElementById("details").innerHTML = "<h1 id=\"country\"></h1>";
            document.getElementById("country").innerHTML = oneCountryInfo.NAME;
            return;
        }
        else {
             document.getElementById("details").innerHTML = this.remain;
        }

        document.getElementById("country").innerHTML = oneCountryInfo.NAME;

		



		
        d3.json("data/stat/" + wd + ".json", function(err, data) {
            document.getElementById("wikipage").setAttribute("src", data.wiki+"?printable=yes");
            document.getElementById("wikipage").setAttribute("height", this.svgHeight/2);
            document.getElementById("wikipage").setAttribute("width", this.svgWidth);			
            document.getElementById("capital").innerHTML = data.capital[0];
            document.getElementById("headState").innerHTML = data.headState[0];
            document.getElementById("headGov").innerHTML = data.headGov[0];
            d3.select("#continent").text(data.continent.join(", "));
            let xScale = d3.scaleLinear()
                .domain([d3.min(data.pop, d => +d.year), d3.max(data.pop, d => +d.year)])
                .range([80, d3.select("#population").node().getBoundingClientRect().width-30]);
            let yScale = d3.scaleLinear()
                .domain([d3.min(data.pop, d => +d.stats), d3.max(data.pop, d => +d.stats)])
                .range([d3.select("#population").node().getBoundingClientRect().height-30, 0]);
            let lineGenerator = d3.line()
                                    .x(function(d) {
                                        return xScale(+d.year);
                                    })
                                    .y(function(d){
                                        return yScale(+d.stats);
                                    });

            d3.select("#popShow")
                .html("");

            let pop_s = data.pop.sort((a, b) => parseInt(a.year) - parseInt(b.year));

            d3.select("#popShow")
                .append("path")
                .attr("d", lineGenerator(pop_s))
                .style("fill", "none")
                .style("stroke", "black");

            let xAxis = d3.axisBottom();
            xAxis.scale(xScale)
                .ticks(data.pop.length > 10? 10 : data.pop.length);

            let yAxis = d3.axisLeft();
            yAxis.scale(yScale)
                .ticks(3);

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

            let xdomain = [0, 0.5, 1];
            let range = ['red', "yellow", 'green'];
            let colorScale = d3.scaleLinear()
                .domain(xdomain)
                .range(range);
            let hdiXScale = d3.scaleBand()
                .domain(data.hdi.map(d=>+d.year).sort(d3.ascending))
                .range([20, d3.select("#humanIndex").node().getBoundingClientRect().width-20])
                .paddingInner(0.01);
            d3.select("#humanIndex")
                .html("");
            d3.select("#humanIndex")
                .selectAll("rect")
                .data(data.hdi)
                .enter().append("rect")
                .attr("x", d=>hdiXScale(+d.year))
                .attr("y", 5)
                .attr("width", hdiXScale.bandwidth())
                .attr("height", 10)
                .style("fill", d=>colorScale(+d.stats));
            let textArray = [d3.min(data.hdi, d=>+d.year), d3.max(data.hdi, d=>+d.year)];
            d3.select("#humanIndex")
                .selectAll("text")
                .data(textArray)
                .enter().append("text")
                .attr("x", d=>hdiXScale(d) + hdiXScale.bandwidth()/2)
                .attr("y", 30) 
                .attr("text-anchor", "middle")
                .text(d=>d);
        }.bind(this));

    }
}
