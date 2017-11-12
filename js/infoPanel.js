class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
        this.humanIndex = d3.select("#humanIndex")
                            .attr("width", this.svgBounds.width)
                            .attr("height", 80);
        this.humanIndex = d3.select("#population")
                            .attr("width", this.svgBounds.width)
                            .attr("height", 260);
        this.remain = document.getElementById("details").innerHTML;
        this.colorScale = d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(['red', "yellow", 'green']);
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
        console.log(wd);
        d3.json("data/stat/" + wd + ".json", function(err, data) { 
            document.getElementById("wikipage").setAttribute("src", data.wiki+"?printable=yes");
            document.getElementById("wikipage").setAttribute("height", this.svgHeight/2);
            document.getElementById("wikipage").setAttribute("width", this.svgWidth);			
//basicInfo
            let basicInfo = [{"title":"Capital", "value":data.capital[0]}, {"title":"Continet", "value":data.continent.join(", ")}, {"title":"Head of State", "value":data.headState[0]}, {"title":"Head of Gov", "value":data.headGov[0]}];
            d3.select("#basicInfo")
                .append("tbody")
                .html("");
            d3.select("tbody")
                .selectAll("tr")
                .data(basicInfo)
                .enter().append("tr")
                .append("th")
                .text(d=>d.title)
                .style("font-size", "25px")
                .style("font-weight", "bold");
            d3.selectAll("tr")
                .append("td")
                .text(d=>d.value)
                .style("font-size", "20px")
                .style("font-weight", "normal");

//polulation
            d3.select("#popTitle")
                .text("Population")
                .style("font-size", "25px")
                .style("font-weight", "bold");
            let xScale = d3.scaleLinear()
                .domain([d3.min(data.pop, d => +d.year), d3.max(data.pop, d => +d.year)])
                .range([80, d3.select("#population").node().getBoundingClientRect().width-30]);
            let yScale = d3.scaleLinear()
                .domain([d3.min(data.pop, d => +d.stats), d3.max(data.pop, d => +d.stats)])
                .range([d3.select("#population").node().getBoundingClientRect().height-30, 0]);
            let lineGenerator = d3.line()
                                    .x(d=>xScale(+d.year))
                                    .y(d=>yScale(+d.stats));
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
                .ticks(Math.min(data.pop.length,10));

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

//humanIndex
            d3.select("#indexTitle")
                .text("Human Development Index")
                .style("font-size", "25px")
                .style("font-weight", "bold");
//humanIndex tip
           let tip = d3.tip()
                .attr('class', 'd3-tip')
                .direction('s')
                .offset(function() {
                    return [0,0];
                })
                .html(function(d){
                    let tooltip_data = {"result":[{"year": d.year,"stats": d.stats}]};
                    return "<text>Year: "+d.year+"<br>HDI: "+d.stats+"</text>";
                });
//humanIndex scale
            let hdiXScale = d3.scaleBand()
                .domain(data.hdi.map(d=>+d.year).sort(d3.ascending))
                .range([20, d3.select("#humanIndex").node().getBoundingClientRect().width-20])
                .paddingInner(0.01);

            d3.select("#humanIndex")
                .html("");
//humanIndex Title
            let textArray = [d3.min(data.hdi, d=>+d.year), d3.max(data.hdi, d=>+d.year)];
            d3.select("#humanIndex")
                .selectAll("text")
                .data(textArray)
                .enter().append("text")
                .attr("x", d=>hdiXScale(d) + hdiXScale.bandwidth()/2)
                .attr("y", 20) 
                .attr("text-anchor", "middle")
                .text(d=>d);
//humanIndex Visualization
            d3.select("#humanIndex")
                .append("g")
                .attr("id", "indexShow")
                .call(tip);
            d3.select("#indexShow")
                .selectAll("rect")
                .data(data.hdi)
                .enter().append("rect")
                .attr("x", d=>hdiXScale(+d.year))
                .attr("y", 30)
                .attr("width", hdiXScale.bandwidth())
                .attr("height", 10)
                .style("fill", d=>this.colorScale(+d.stats))
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide);

//wikiPage Title
            d3.select("#wikiTitle")
                .text("Description from Wiki")
                .style("font-size", "25px")
                .style("font-weight", "bold");
        }.bind(this));
    }
}
