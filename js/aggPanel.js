class AggPanel {
	constructor	() {
		this.svgBounds = d3.select("#aggPanelDiv").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgWidth/875*500;
        let aggSvg = d3.select("#aggPanel")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.panelWidth = this.svgWidth/2;
        this.panelHeight = this.svgHeight/2;
        this.panelMargin = 35;
        this.panel = d3.select("#aggPanel")
        	.append("svg")
        	.attr("id", "panel")
            .attr("width", this.panelWidth)
            .attr("height", this.panelHeight)
            .attr("x", (this.svgWidth - this.panelWidth)/2)
            .attr("y", (this.svgHeight - this.panelHeight)/2);
        this.legend = d3.select("#aggPanel")
        	.append("svg")
        	.attr("id", "legend")
            .attr("width", this.panelWidth/2)
            .attr("height", this.panelHeight)
            .attr("x", (this.svgWidth + this.panelWidth)/2)
            .attr("y", (this.svgHeight - this.panelHeight)/2);
        this.selectedLine = null;
	}

	updateAgg() {
		let dataset = {"pop1": [{"year": "1983", "stats": "1823211"}, {"year": "1960", "stats": "955508"}, {"year": "1971", "stats": "1317044"}, {"year": "1995", "stats": "2298063"}, {"year": "1969", "stats": "1242208"}, {"year": "1961", "stats": "982174"}],
		"pop2": [{"year": "1983", "stats": "1820000"}, {"year": "1960", "stats": "900000"}, {"year": "1971", "stats": "1300044"}, {"year": "1995", "stats": "2200063"}, {"year": "1969", "stats": "1200208"}, {"year": "1961", "stats": "900174"}]};
        let xScale = d3.scaleLinear()
            .domain(d3.extent(dataset["pop1"], d => +d.year))
            .range([this.panelMargin, this.panelWidth-this.panelMargin]);
        let popMin = d3.extent(dataset["pop1"], d => +d.stats)[0], 
        	popMax = d3.extent(dataset["pop1"], d => +d.stats)[1];
        let dataset_sorted = {}
        for (let i in dataset) {
        	let extent = d3.extent(dataset[i], d => +d.stats)
        	if (popMin > extent[0]) popMin = extent[0];
        	if (popMax < extent[1]) popMax = extent[1];
        	dataset_sorted[i] = dataset[i].sort((a, b) => parseInt(a.year) - parseInt(b.year));
        }
        console.log(popMax, popMin);
        let yScale = d3.scaleLinear()
            .domain([popMin, popMax])
            .range([this.panelHeight-this.panelMargin, this.panelMargin]);  
        let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
        let lineGenerator = d3.line()
            .x(d=>xScale(+d.year))
            .y(d=>yScale(+d.stats));
		this.panel.html("");
		let cnt = 0;
		let setStroke = function(id, legendSize, lineSize, lineOpacity, legendFontSize) {
			d3.select("#"+id)
				.style("stroke-width", lineSize)
				.style("opacity", lineOpacity);
    		d3.select("#"+id+"_legend")
    			.style("stroke-width", legendSize)
    			.style("font-size", legendFontSize);
		};
		let lineThick = 4.5, lineThin = 3, legendBig = 3, legendSmall = 2, legendFontBig = 20, legendFontSmall = 15;
		for (let i in dataset_sorted) {
			this.panel.append("path")
	        	.attr("d", lineGenerator(dataset_sorted[i]))
	        	.attr("id", i)
	        	.style("fill", "none")
	        	.style("stroke", colors[cnt])
	        	.style("stroke-width", "3px")
	        	.style("opacity", "0.5")
	        	.on("mouseover", function(){
	        		if (this.selectedLine == null)
	        			setStroke(d3.event.target.id, (legendSmall+0.5)+"px", (lineThin+0.5)+"px", "1", (legendFontSmall+2)+"px");
	        	}.bind(this))
	        	.on("mouseout", function(){
	        		if (this.selectedLine != d3.event.target.id) 
	        			setStroke(d3.event.target.id, legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
	        	}.bind(this))
	        	.on("click", function(){
	        		if (this.selectedLine == d3.event.target.id) {
	        			setStroke(d3.event.target.id, legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
		        		this.selectedLine = null;
	        		}
	        		else if (this.selectedLine == null) {
	        			setStroke(d3.event.target.id, legendBig+"px", lineThick+"px", "1", legendFontBig+"px");
		        		this.selectedLine = d3.event.target.id;
	        		}
	        	}.bind(this));
        	this.legend.append("g")
        		.attr("class", "legend")
        		.append("text")
        		.attr("id", i+"_legend")
        		.attr("x", 0)
        		.attr("y", legendFontBig*(cnt+1))
        		.text(i)
        		.style("stroke", colors[cnt])
        		.style("fill", colors[cnt])
        		.style("font-size", "15px")
	        	.on("mouseover", function(){
	        		let id = d3.event.target.id.split("_")[0];
	        		if (this.selectedLine == null)
	        			setStroke(id, (legendSmall+0.5)+"px", (lineThin+0.5)+"px", "1", (legendFontSmall+2)+"px");
	        	}.bind(this))
	        	.on("mouseout", function(){
	        		let id = d3.event.target.id.split("_")[0];
	        		if (this.selectedLine != id) 
	        			setStroke(id, legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
	        	}.bind(this))
        		.on("click", function(){
        			let id = d3.event.target.id.split("_")[0];
        			//console.log(id, this.selectedLine);
	        		if (this.selectedLine == id) {
	        			setStroke(id, legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
	        			this.selectedLine = null;
	        		}
	        		else if (this.selectedLine == null) {
	        			setStroke(id, legendBig+"px", lineThick+"px", "1", legendFontBig+"px");
		        		this.selectedLine = id;
	        		}
        		}.bind(this));
        	cnt+=1;
		};
        let xAxis = d3.axisBottom();
        xAxis.scale(xScale)
            .ticks(5)
            .tickFormat(d3.format("d"));
        let yAxis = d3.axisLeft();
        yAxis.scale(yScale)
            .ticks(5)
            .tickFormat(d3.format(".2s"));
        this.panel.append("g")
            .attr("transform", "translate(0, " + yScale.range()[0]+")")
            .style("fill", "none")
            .style("stroke", "black")
            .call(xAxis);
        this.panel.append("g")
        	.attr("transform", "translate(" + xScale.range()[0] +", 0)")
            .style("fill", "none")
            .style("stroke", "black")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.panelMargin)
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("pop");

	}
}