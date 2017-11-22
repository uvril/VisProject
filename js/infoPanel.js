class InfoPanel {
    constructor() {
        this.svgBounds = d3.select("#details").node().getBoundingClientRect();
        this.statBounds = this.svgBounds;
        console.log(this.statBounds);
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgBounds.width;
        this.hdiHeight = 200;
        this.hdiLeftMargin = 20;
        this.humanIndex = d3.select("#humanIndex")
                            .attr("width", this.statBounds.width)
                            .attr("height", this.hdiHeight);
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

    lineChartGenerator(selectPart, dataset, chartWidth, chartHeight, color, TopMargin, LeftMargin, yAxisText) {
        console.log(dataset);
    	selectPart.attr("transform", "translate(" + LeftMargin + "," + TopMargin + ")");
        let xScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => +d.year))
            .range([0, chartWidth]);
        let yScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => +d.stats))
            .range([chartHeight, 0]);    	
        let lineGenerator = d3.line()
            .x(d=>xScale(+d.year))
            .y(d=>yScale(+d.stats));
		let dataset_sorted = dataset.sort((a, b) => parseInt(a.year) - parseInt(b.year));
		selectPart.html("");
		selectPart.append("path")
        	.attr("d", lineGenerator(dataset_sorted))
        	.style("fill", "none")
        	.style("stroke", color)
        	.style("stroke-width", "2px");
        let xAxis = d3.axisBottom();
        xAxis.scale(xScale)
            .ticks(Math.min(dataset.length,7))
            .tickFormat(d3.format("d"));
        let yAxis = d3.axisLeft();
        yAxis.scale(yScale)
            .ticks(3)
            .tickFormat(d3.format(".2s"));
        selectPart.append("g")
            .attr("transform", "translate(0, " + yScale.range()[0]+")")
            .style("fill", "none")
            .style("stroke", "black")
            .call(xAxis);
        selectPart.append("g")
            .style("fill", "none")
            .style("stroke", "black")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(yAxisText);
        let focus = selectPart.append("g")
                        .attr("class", "focus")
                        .style("display", "none");
        let rectWidth = 2;
        let textInterval = 10;
        focus.append("rect")
            .attr("width", rectWidth)
            .attr("height", chartHeight);
        focus.append("circle")
            .attr("r", 4);
        focus.append("text")
            .attr("id", "year")
            .attr("dy", ".35em");
        focus.append("text")
            .attr("id", "stats")
            .attr("dy", "1.35em");
        selectPart.append("rect")
        	.attr("class", "overlay")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", yScale.range()[0])
            .attr("width", xScale.range()[1])
            .on("mouseover", function() {focus.style("display", null);})
            .on("mouseout", function() {focus.style("display", "none");})
            .on("mousemove", mousemove);
        let bisectorDate = d3.bisector(function(d) { return d.year; }).left;
        function mousemove() {
            let x0 = xScale.invert(d3.mouse(this)[0] - LeftMargin),
                i = bisectorDate(dataset_sorted, x0, 1),
                d0 = dataset_sorted[i-1],
                d1 = dataset_sorted[i],
                d = d0;
            if (i != dataset_sorted.length)
                d = x0 - d0.year > d1.year - x0? d1:d0;
            focus.select("circle")
                .attr("cx", xScale(d.year))
                .attr("cy", yScale(d.stats))
            focus.select("rect")
                .attr("x", xScale(d.year)-rectWidth/2)
                .attr("y", 0);
            focus.select("#year")
                .attr("x", xScale(d.year)+textInterval)
                .attr("y", yScale(d.stats))
                .style("text-anchor", "start")
                .text(d.year)
                .style("fill", "black");
            focus.select("#stats")
                .attr("x", xScale(d.year)+textInterval)
                .attr("y", yScale(d.stats))
                .style("text-anchor", "start")
                .text(d.stats)
                .style("fill", "black");
        } 
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
                let pop_s = data.pop.sort((a, b) => parseInt(a.year) - parseInt(b.year));
                this.lineChartGenerator(d3.select("#popShow"), queryData(window.dataset.pop, wd, 1960, 2015), this.svgWidth-popRightMargin-popLeftMargin, 
                	this.popHeight-popTopMargin-popBotMargin, "steelblue", popTopMargin, popLeftMargin, "population");

    //population focus point               
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
                    .range([this.hdiLeftMargin, this.svgWidth-this.hdiLeftMargin])
                    .paddingInner(0.01);

                d3.select("#humanIndex")
                    .html("");
    //humanIndex Title
                let hdiInterval = 100;
                let hdilegendX = 10;
                let hdilegendY = 10;
                d3.select("#humanIndex")
                    .selectAll("text")
                    .data(d3.extent(data.hdi, d=>+d.year))
                    .enter().append("text")
                    .attr("x", d=>hdiXScale(d) + hdiXScale.bandwidth()/2)
                    .attr("y", hdiInterval-10) 
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
                    .attr("y", hdiInterval)
                    .attr("width", hdiXScale.bandwidth())
                    .attr("height", hdiXScale.bandwidth())
                    .style("fill", d=>this.colorScale(+d.stats))
                    .on("mouseover", hdiTip.show)
                    .on("mouseout", hdiTip.hide);
                d3.select("#humanIndex")
                    .append("g")
                    .attr("id", "scaleShow");
                let scaleshow = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
                d3.select("#scaleShow")
                    .selectAll("rect")
                    .data(scaleshow)
                    .enter().append("rect")
                    .attr("x", d=>d*500+hdilegendX)
                    .attr("y", hdilegendY)
                    .attr("width", 50)
                    .attr("height", 10)
                    .style("fill", d=>this.colorScale(d));   
                d3.select("#scaleShow")
                    .selectAll("text")
                    .data(scaleshow)
                    .enter().append("text")
                    .attr("x", d=>d*500+hdilegendX+25)
                    .attr("y", hdilegendY+hdiInterval/3)
                    .text(d=>d)
                    .attr("text-anchor", "middle");                  
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
