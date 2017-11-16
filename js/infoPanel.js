class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.statBounds = this.svgBounds;
        console.log(this.statBounds);
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
        this.humanIndex = d3.select("#humanIndex")
                            .attr("width", this.statBounds.width)
                            .attr("height", 80);
        this.popHeight = 260;
        this.population = d3.select("#population")
                            .attr("width", this.statBounds.width)
                            .attr("height", this.popHeight);
        this.infoTable = d3.select("#basicInfoTable");
        this.wikipage = d3.select("#wikipage");
        this.wikipage
        .attr("height", this.svgHeight)
        .attr("width", this.svgWidth);
        this.colorScale = d3.scaleLinear()
            .domain([0, 0.5, 1])
            .range(['red', "yellow", 'green']);
        this.lastSection = null;

    }

    updateInfo(oneCountryInfo, year) {
        console.log(oneCountryInfo);
        let wd = +oneCountryInfo.wikidata;
        console.log(wd);
        d3.selectAll(".countryNameLabel").text(oneCountryInfo.NAME);
        if (wd < 0) {
            d3.select("#countryInfo").style("visibility", "hidden");
            this.wikipage.attr("src", "");
            return;
        }
        else {
            d3.select("#countryInfo").style("visibility", "visible");
        }

        d3.json("data/stat/" + wd + ".json", function(err, data) { 
            this.wikipage.attr("src", data.wiki+"?printable=yes");
            this.infoTable.select("#table-capital").html(data.capital[0]);
            this.infoTable.select("#table-continent").html(data.continent.join(', '));
            this.infoTable.select("#table-hos").html(data.headState[0]);
            this.infoTable.select("#table-hog").html(data.headGov[0]);
            if (data.pop.length > 0) {
                let latestPopYear = d3.max(data.pop, d => +d.year);
                let latestPop = data.pop.filter(d => +d.year === latestPopYear)[0]
                this.infoTable.select("#table-population").html(latestPop.stats+" ("+latestPop.year+")");
            }
            else {
                this.infoTable.select("#table-population").html("");
            }
            if (data.hdi.length > 0) {
                let latestHDIYear = d3.max(data.hdi, d => +d.year);
                let latestHDI = data.hdi.filter(d => +d.year === latestHDIYear)[0]
                this.infoTable.select("#table-hdi").html(latestHDI.stats+" ("+latestHDI.year+")");
            }
            else {
                this.infoTable.select("#table-hdi").html("");
            }
          if (data.pop.length != 0) {
              let popTopMargin = 30;
              let popBotMargin = 30;
              let popRightMargin = 120;
              let popLeftMargin = 30;
              d3.select("#popShow").attr("transform", "translate(" + popLeftMargin + "," + popTopMargin + ")");
    //population

                d3.select("#population")
                    .style("display", null);
    //population scale
                let popxScale = d3.scaleLinear()
                    .domain([d3.min(data.pop, d => +d.year), d3.max(data.pop, d => +d.year)])
                    .range([0, this.svgWidth-popRightMargin-popLeftMargin]);
                let popyScale = d3.scaleLinear()
                    .domain([d3.min(data.pop, d => +d.stats), d3.max(data.pop, d => +d.stats)])
                    .range([this.popHeight-popTopMargin-popBotMargin, 0]);
    //population line
                let lineGenerator = d3.line()
                                        .x(d=>popxScale(+d.year))
                                        .y(d=>popyScale(+d.stats));
                d3.select("#popShow")
                    .html("");
                let pop_s = data.pop.sort((a, b) => parseInt(a.year) - parseInt(b.year));
                d3.select("#popShow")
                    .append("path")
                    .attr("d", lineGenerator(pop_s))
                    .style("fill", "none")
                    .style("stroke", "steelblue")
                    .style("stroke-width", "2px");
    //population axes
                let xAxis = d3.axisBottom();
                xAxis.scale(popxScale)
                    .ticks(Math.min(data.pop.length,7))
                    .tickFormat(d3.format("d"));
                let yAxis = d3.axisLeft();
                yAxis.scale(popyScale)
                    .ticks(3)
                    .tickFormat(d3.format(".2s"));
                d3.select("#popShow")
                    .append("g")
                    .attr("transform", "translate(0, " + popyScale.range()[0]+")")
                    .style("fill", "none")
                    .style("stroke", "black")
                    .call(xAxis);
                d3.select("#popShow")
                    .append("g")
                    .style("fill", "none")
                    .style("stroke", "black")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("Population");
    //population focus point
                let focus = d3.select("#popShow")
                                .append("g")
                                .attr("class", "focus")
                                .style("display", "none");
                focus.append("rect")
                    .attr("width", 2)
                    .attr("height", this.popHeight-30);
                focus.append("circle")
                    .attr("r", 4);
                focus.append("text")
                    .attr("id", "pop_year")
                    .attr("dy", ".35em");
                focus.append("text")
                    .attr("id", "pop_stats")
                    .attr("dy", "1.35em");
                d3.select("#population")
                    .append("rect")
                    .attr("class", "overlay")
                    .attr("x", popTopMargin)
                    .attr("y", popLeftMargin)
                    .attr("height", popyScale.range()[0])
                    .attr("width", popxScale.range()[1])
                    .on("mouseover", function() {focus.style("display", null);})
                    .on("mouseout", function() {focus.style("display", "none");})
                    .on("mousemove", mousemove);
                let bisectorDate = d3.bisector(function(d) { return d.year; }).left;
                function mousemove() {
                    let x0 = popxScale.invert(d3.mouse(this)[0] - popLeftMargin),
                        i = bisectorDate(pop_s, x0, 1),
                        d0 = pop_s[i-1],
                        d1 = pop_s[i],
                        d = d0;
                    if (i != pop_s.length)
                        d = x0 - d0.year > d1.year - x0? d1:d0;
                    focus.select("circle")
                        .attr("cx", popxScale(d.year))
                        .attr("cy", popyScale(d.stats))
                    focus.select("rect")
                        .attr("x", popxScale(d.year)-1)
                        .attr("y", 0);
                    focus.select("#pop_year")
                        .attr("x", popxScale(d.year)+10)
                        .attr("y", popyScale(d.stats))
                        .style("text-anchor", "start")
                        .text(d.year);
                    focus.select("#pop_stats")
                        .attr("x", popxScale(d.year)+10)
                        .attr("y", popyScale(d.stats))
                        .style("text-anchor", "start")
                        .text(d.stats);
                    focus.select("#pop_year")
                        .attr("y", popyScale(d.stats)-20);
                    focus.select("#pop_stats")
                        .attr("y", popyScale(d.stats)-20);
                }                
            }
            else {
                d3.select("#popTitle")
                    .html("");
                d3.select("#population")
                    .style("display", "none");
            }

            if (data.hdi.length != 0) {
                d3.select("#humanIndex")
                    .style("display", null);
    //humanIndex tip
               let hdiTip = d3.tip()
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
                    .range([20, this.svgWidth-20])
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
                    .call(hdiTip);
                d3.select("#indexShow")
                    .selectAll("rect")
                    .data(data.hdi)
                    .enter().append("rect")
                    .attr("x", d=>hdiXScale(+d.year))
                    .attr("y", 30)
                    .attr("width", hdiXScale.bandwidth())
                    .attr("height", 10)
                    .style("fill", d=>this.colorScale(+d.stats))
                    .on("mouseover", hdiTip.show)
                    .on("mouseout", hdiTip.hide);
            }
            else {
                d3.select("#indexTitle")
                    .html("");
                d3.select("#humanIndex")
                    .style("display", "none");
            }

            d3.select("#dropbox")
                .on("change", onchange.bind(this));

            function onchange(){
                console.log("!!!");
                let sect = document.getElementById("dropbox");
                let section = sect.options[sect.selectedIndex].value;
                d3.select("#"+section)
                .style("visibility", "visible");
                if (this.lastSection != null) {
                    d3.select("#"+this.lastSection)
                    .style("visibility", "hidden");
                }
                console.log(this.lastSection);
                this.lastSection = section;
            }
        }.bind(this));
    }
}
