class AggPanel {
	constructor	() {
        let aggRow = d3.select("#aggPanelRow");
        this.aggRow = aggRow;
        this.aggList = $('#aggPanelList').DataTable({paging:false, searching:false, info:false});
		this.svgBounds = aggRow.select("#aggPanelDiv").node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width;
        this.svgHeight = this.svgWidth/875*500;
        let aggSvg = aggRow.select("#aggPanel")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        this.panelWidth = this.svgWidth*0.8;
        this.panelHeight = this.svgHeight;
        this.panelMargin = 35;
        this.panel = aggSvg
        	.append("g")
        	.attr("id", "panel")
            .attr("transform", "translate(" + this.panelWidth*0.01 + ", 0)");
        this.legend = aggSvg
        	.append("g")
        	.attr("id", "legend")
            .attr("transform", "translate(" + (this.panelWidth*1.02-this.panelMargin) + ", 0)");
        this.selectedLine = null;
        this.selectedCountry = [];
        this.selectedwd = [];
        this.startYear = 0;
        this.endYear = 0;
        $("#yearRange").slider({ id: "yearSlider", min: 1960, max: 2016, range: true, value: [1960, 2016] });
        $("#yearRange").on("slide", function(event) {
            this.updateRange(event.value[0], event.value[1]);
        }.bind(this));
        this.updateRange(1960, 2016);
        this.currentSelectedCoutry = []; 
        this.clicked = [];
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();
	}

    updateRange(startYear, endYear) {
        this.startYear = startYear;
        this.endYear = endYear;
        this.aggRow.select("#yearRangeStartText").text(this.startYear);
        this.aggRow.select("#yearRangeEndText").text(this.endYear);
        this.aggList.rows().every( function (outerThis) {
            return function (rowIdx, tableLoop, rowLoop ) {
                let countryName = this.data()[0];
                let wd = window.wdmap[countryName];
                let datStart = queryData(window.dataset.pop, wd, outerThis.startYear, outerThis.startYear);
                datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
                let datEnd = queryData(window.dataset.pop, wd, outerThis.endYear, outerThis.endYear);
                datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
                let data = [countryName, datStart, datEnd];
                this.data(data);
            }
        }(this));
        let h1 = $(this.aggList.column(1).header());
        h1.html(startYear)
        let h2 = $(this.aggList.column(2).header());
        h2.html(endYear)
        this.aggList.draw();
    }

	updateAgg(countryName, wd) {
		let index = this.selectedCountry.indexOf(countryName);
		if (index != -1) return;
		this.selectedCountry.push(countryName);
		this.currentSelectedCoutry = this.selectedCountry.slice();
		this.selectedwd.push(wd);
        window.wdmap[countryName] = wd;
		let dataset = {}, popMin = -1, popMax = -1, extent = 0;
		let datStart = queryData(window.dataset.pop, wd, this.startYear, this.startYear);
        datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
		let datEnd = queryData(window.dataset.pop, wd, this.endYear, this.endYear);
        datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
        this.aggList.row.add([countryName, datStart, datEnd]).draw(false);
		this.selectedCountry.forEach(function(country, i){
		    this.clicked.push(0);
			dataset[country] = queryData(window.dataset.pop, this.selectedwd[i], this.startYear, this.endYear);
			extent = d3.extent(dataset[country], d => +d.stats);
			if (i == 0) {
				popMin = extent[0];
				popMax = extent[1];
			}
			else {
				popMin = extent[0] < popMin? extent[0] : popMin;
				popMax = extent[1] > popMax? extent[1] : popMax;
			}
		}.bind(this));
		console.log(dataset);
        let xScale = d3.scaleLinear()
            .domain([this.startYear, this.endYear])
            .range([this.panelMargin, this.panelWidth-this.panelMargin]);
        let yScale = d3.scaleLinear()
            .domain([popMin, popMax])
            .range([this.panelHeight-this.panelMargin, this.panelMargin]); 
        let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
        let lineGenerator = d3.line()
            .x(d=>xScale(+d.year))
            .y(d=>yScale(+d.stats));
//initial setting
		this.panel.html("");
		this.legend.html("");
		this.selectedLine = null;
//add lines and legends
		let cnt = 0;
		let setStroke = function(id, legendSize, lineSize, lineOpacity, legendFontSize) {
			d3.select("#"+id)
				.style("stroke-width", lineSize)
				.style("opacity", lineOpacity);
    		d3.select("#"+id+"_legend")
    			.style("stroke-width", legendSize)
    			.style("font-size", legendFontSize);
		};
		let lineThick = 2, lineThin = 1, legendBig = 2, legendSmall = 1, legendFontBig = 10, legendFontSmall = 8;
		for (let i in dataset) {
			this.panel.append("path")
	        	.attr("d", lineGenerator(dataset[i]))
	        	.attr("id", i.replace(/[^a-zA-Z]/g, ""))
	        	.style("fill", "none")
	        	.style("stroke", colors[cnt])
	        	.style("stroke-width", lineThin)
	        	.style("opacity", "0.5")
	        	.on("mouseover", function(){
	        		setStroke(d3.event.target.id, (legendSmall+0.5)+"px", (lineThin+0.5)+"px", "1", legendFontBig+"px");
	        	}.bind(this))
	        	.on("mouseout", function(){
	        		setStroke(d3.event.target.id, legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
	        	}.bind(this));

	        this.panel.append("g")
	        	.attr("id", i.replace(/[^a-zA-Z]/g, "")+"_circles")
	        	.selectAll("circle")
	        	.data(dataset[i])
	        	.enter().append("circle")
	        	.attr("id", d=>i.replace(/[^a-zA-Z]/g, "")+"_"+(+d.year))
	        	.attr("cx", d=>xScale(+d.year))
	        	.attr("cy", d=>yScale(+d.stats))
	        	.attr("r", 2)
	        	.style("fill", colors[cnt])
	        	.on("mouseover", function(){
	        		d3.select("#"+d3.event.target.id)
						.transition()
						.duration(500)
						.attr("r", 4)
						.style("opacity", 0.5);
	        		setStroke(d3.event.target.id.split("_")[0], (legendSmall+0.5)+"px", (lineThin+0.5)+"px", "1", legendFontBig+"px");
	        	}.bind(this))
	        	.on("mouseout", function(){
	        		d3.select("#"+d3.event.target.id)
						.transition()
						.duration(500)
						.attr("r", 2)
						.style("opacity", 1);
	        		setStroke(d3.event.target.id.split("_")[0], legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
	        	}.bind(this));

        	this.legend.append("g")
        		.append("text")
        		.attr("id", i.replace(/[^a-zA-Z]/g, "")+"_legend")
        		.attr("x", 10)
        		.attr("y", legendFontBig*(cnt+1))
        		.text(i)
        		.style("stroke", colors[cnt])
        		.style("fill", colors[cnt])
        		.style("font-size", legendFontSmall)
        		.style("stroke-width", legendSmall)
	        	.on("mouseover", function(){
	        		let id = d3.event.target.id.split("_")[0];
	        		setStroke(id, (legendSmall+0.5)+"px", (lineThin+0.5)+"px", "1", (legendFontSmall+2)+"px");
	        	}.bind(this))
	        	.on("mouseout", function(){
	        		let id = d3.event.target.id.split("_")[0];
	        		setStroke(id, legendSmall+"px", lineThin+"px", "0.5", legendFontSmall+"px");
	        	}.bind(this));

			this.legend.append("g")
				.append('circle')
				.attr("id", i.replace(/[^a-zA-Z]/g, "")+"_legendcircle_"+cnt)
				.attr("cx", 3)
				.attr("cy", legendFontSmall*(cnt+1))
				.attr("r", 3)
        		.style("stroke", colors[cnt])
        		.style("fill", colors[cnt])
        		.on("click", function(){
        			let id  = d3.event.target.id.split("_")[0];
        			console.log(d3.event.target.id.split("_"), "!!!!");
        			d3.select("#"+d3.event.target.id)
        				.style("fill", 1 == 1-this.clicked[+d3.event.target.id.split("_")[2]]? "white":colors[d3.event.target.id.split("_")[2]]);
        			d3.select("#"+id)
        				.style("display", 1 == 1-this.clicked[+d3.event.target.id.split("_")[2]]? "none": null);
        			d3.select("#"+id+"_circles")
        				.style("display", 1 == 1-(this.clicked[+d3.event.target.id.split("_")[2]])? "none": null);
        			if (1 == 1-(this.clicked[+d3.event.target.id.split("_")[2]])) {
        				let lineNo = +d3.event.target.id.split("_")[2];
        				this.currentSelectedCoutry.splice(lineNo, lineNo+1);
        				this.updateCurrentLine(startYear, endYear);
        			}
        			this.clicked[d3.event.target.id.split("_")[2]] = 1-this.clicked[d3.event.target.id.split("_")[2]];
        		}.bind(this));
        	cnt+=1;
		};
		this.updateAxis(xScale, yScale);
	}

	updateCurrentLine(startYear, endYear) {
		let popMin = -1, popMax = -1, extent = 0;
		this.currentSelectedCoutry.forEach(function(country, i){
			extent = d3.extent(dataset[country], d => +d.stats);
			if (i == 0) {
				popMin = extent[0];
				popMax = extent[1];
			}
			else {
				popMin = extent[0] < popMin? extent[0] : popMin;
				popMax = extent[1] > popMax? extent[1] : popMax;
			}
		}.bind(this));
        let xScale = d3.scaleLinear()
            .domain([startYear, endYear])
            .range([this.panelMargin, this.panelWidth-this.panelMargin]);
        let yScale = d3.scaleLinear()
            .domain([popMin, popMax])
            .range([this.panelHeight-this.panelMargin, this.panelMargin]);
        this.updateAxis(xScale, yScale);
	}

	updateAxis(xScale, yScale) {
        this.xAxis.scale(xScale)
            .ticks(5)
            .tickFormat(d3.format("d"));
        this.yAxis.scale(yScale)
            .ticks(5)
            .tickFormat(d3.format(".2s"));
        this.panel.append("g")
            .attr("transform", "translate(0, " + yScale.range()[0]+")")
            .style("fill", "none")
            .style("stroke", "black")
            .call(this.xAxis);
        this.panel.append("g")
        	.attr("transform", "translate(" + xScale.range()[0] +", 0)")
            .style("fill", "none")
            .style("stroke", "black")
            .transition().duration(1500)
            .call(this.yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.panelMargin)
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("pop");
	}
}
