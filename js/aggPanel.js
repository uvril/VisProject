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
        this.selectedLine = null;
        this.selectedCountry = [];
        this.selectedwd = [];
		this.dataset = [];
        this.startYear = 1960;
        this.endYear = 2016;						
        this.panelWidth = this.svgWidth*0.8;
        this.panelHeight = this.svgHeight;
        this.panelMargin = 35;
        this.panel = aggSvg
        	.append("g")
        	.attr("id", "panel")
            .attr("transform", "translate(" + this.panelWidth*0.01 + ", 0)");
        this.xScale = d3.scaleLinear()
            .domain([this.startYear, this.endYear])
            .range([this.panelMargin, this.panelWidth-this.panelMargin]);
        this.yScale = d3.scaleLinear()
            .domain([0, 1000])
            .range([this.panelHeight-this.panelMargin, this.panelMargin]).nice(); 				
		this.xAxisG = this.panel.append("g")
		            .attr("transform", "translate(0, " + this.yScale.range()[0]+")")
					.style("fill", "none")
					.style("stroke", "black");
		this.yAxisG = this.panel.append("g")
		        	.attr("transform", "translate(" + this.xScale.range()[0] +", 0)")
					.style("fill", "none")
					.style("stroke", "black");
		this.pathG = this.panel.append("g");
		this.circleG = this.panel.append("g");			
        this.legend = aggSvg
        	.append("g")
        	.attr("id", "legend")
            .attr("transform", "translate(" + (this.panelWidth*1.02-this.panelMargin) + ", 0)");
        $("#yearRange").slider({ id: "yearSlider", min: 1960, max: 2016, range: true, value: [1960, 2016] });
        $("#yearRange").on("slide", function(event) {
            this.updateRange(event.value[0], event.value[1]);
        }.bind(this));
        this.trans = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);
        this.updateRange(1960, 2016);
        this.currentSelectedCoutry = []; 
        this.clicked = [];	
        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisRight();
        this.xAxis.scale(this.xScale)
            .ticks(5)
            .tickFormat(d3.format("d"));
        this.yAxis.scale(this.yScale)
			.tickSize(this.svgWidth)
            .ticks(5)
            .tickFormat(d3.format(".2s"));		


	}

    updateRange(startYear, endYear) {
        this.startYear = startYear;
        this.endYear = endYear;
        this.xScale.domain([startYear, endYear]);
        this.aggRow.select("#yearRangeStartText").text(this.startYear);
        this.aggRow.select("#yearRangeEndText").text(this.endYear);
        this.dataset = [];
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
			    outerThis.dataset.push(queryData(window.dataset.pop, wd, outerThis.startYear, outerThis.endYear));
            }
        }(this));
        let h1 = $(this.aggList.column(1).header());
        h1.html(startYear)
        let h2 = $(this.aggList.column(2).header());
        h2.html(endYear)
        this.aggList.draw();
		this.update();
    }

	insertCountry(countryName, wd) {
		let index = this.selectedCountry.indexOf(countryName);
		if (index != -1) return;
		this.selectedCountry.push(countryName);
		this.currentSelectedCoutry = this.selectedCountry.slice();
		this.selectedwd.push(wd);
        window.wdmap[countryName] = wd;
		this.dataset = []
		let popMin = 99999999999, popMax = -1, extent = 0;
		let datStart = queryData(window.dataset.pop, wd, this.startYear, this.startYear);
        datStart = (datStart.length == 0 ? "N/A" : datStart[0].stats);
		let datEnd = queryData(window.dataset.pop, wd, this.endYear, this.endYear);
        datEnd = (datEnd.length == 0 ? "N/A" : datEnd[0].stats);
        this.aggList.row.add([countryName, datStart, datEnd]).draw();
		this.selectedCountry.forEach(function(country, i){
		    this.clicked.push(0);
			let data = queryData(window.dataset.pop, this.selectedwd[i], this.startYear, this.endYear);
			this.dataset.push(data);
			extent = d3.extent(data, d => +d.stats);
			popMin = extent[0] < popMin? extent[0] : popMin;
			popMax = extent[1] > popMax? extent[1] : popMax;
		}.bind(this));
		console.log(this.dataset);
        this.yScale.domain([popMin, popMax]).nice(); 
		this.update();
	}
	
	update() {
        if (this.dataset.length == 0) {
            return;
        }
        let colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
        let lineGenerator = d3.line()
            .x(d=>this.xScale(+d.year))
            .y(d=>this.yScale(+d.stats));
//initial setting
		this.selectedLine = null;
//add lines and legends
		let cnt = 0;
		let setStroke = function(id, lineSize, lineOpacity, legendFontSize) {
			d3.select("#"+id.toString())
				.style("stroke-width", lineSize)
				.style("opacity", lineOpacity);
    		d3.select("#l" + id.toString())
    			.select("text")
    			.style("font-size", legendFontSize);
		};
		let lineThick = 2, lineThin = 1, legendFontBig = 10, legendFontSmall = 8;

		let pathSel = this.pathG.selectAll("path").data(this.dataset);
		pathSel.exit().remove();
		pathSel = pathSel.enter().append("path").merge(pathSel);
			pathSel.transition(this.trans)
            .attr("d", d => lineGenerator(d))
			.style("fill", "none")
			.style("stroke", (d, i) => colors[i])
			.style("stroke-width", lineThin)
			.style("opacity", "0.5");
        pathSel
			.attr("id", (d, i) => "path"+i.toString())
			.on("mouseover", function(){
				setStroke(d3.event.target.id, (lineThin+0.5)+"px", "1", legendFontBig+"px");
			}.bind(this))
			.on("mouseout", function(){
				setStroke(d3.event.target.id, lineThin+"px", "0.5", legendFontSmall+"px");
			}.bind(this));
        
			
		let cirGSel = this.circleG.selectAll("g").data(this.dataset);
		cirGSel.exit().remove();
		cirGSel = cirGSel.enter().append("g").merge(cirGSel);
	    cirGSel.attr("id", (d, i) => "cpath"+i.toString())
                .attr("data-cnt", (d, i) => i);
		let cirSel = cirGSel.selectAll("circle").data(d => d);
        cirSel.exit().remove();
		cirSel = cirSel.enter().append("circle").merge(cirSel);
	    cirSel.transition(this.trans).attr("cx", d=>this.xScale(+d.year))
	        	.attr("cy", d=>this.yScale(+d.stats))
	        	.attr("r", 2)
                .style("fill", function (d, i) {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return colors[cnt];
                });
        cirSel
	        	.on("mouseover", function(setStroke, trans){
					return function() {
						let pathid = this.parentNode.id.slice(1);
						d3.select(this)
							.transition(trans)
							.attr("r", 4)
							.style("opacity", 0.5);
						setStroke(pathid, (lineThin+0.5)+"px", "1", legendFontBig+"px");
					}
	        	}(setStroke, this.trans))
	        	.on("mouseout", function(setStroke, trans){
					return function() {
						let pathid = this.parentNode.id.slice(1);
						d3.select(this)
							.transition(trans)
							.attr("r", 2)
							.style("opacity", 1);
						setStroke(pathid, lineThin+"px", "0.5", legendFontSmall+"px");	
					}
	        	}(setStroke, this.trans));			
		
		let legendGSel = this.legend.selectAll("g").data(this.selectedCountry)
		legendGSel.exit().remove();
		legendGSel = legendGSel.enter().append("g").merge(legendGSel);
		legendGSel.attr("id", (d, i) => "lpath" + i.toString())
					.attr("data-cnt", (d,i) => i);

		let lTextSel = legendGSel.selectAll("text").data(d => [d]);
		lTextSel.exit().remove();
		lTextSel = lTextSel.enter().append("text").merge(lTextSel);
		lTextSel.transition(this.trans)
				.attr("x", 10)
				.attr("y", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return legendFontBig*(parseInt(cnt)+1);
				})
				.text(d=>d)
				.style("stroke", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return colors[cnt];
				})
				.style("fill", "none")
        		.style("font-size", legendFontSmall);
	    lTextSel.on("mouseover", function(){
	        		let pathid = this.parentNode.id.slice(1);
	        		setStroke(pathid, (lineThin+0.5)+"px", "1", (legendFontSmall+2)+"px");
	        	})
	        	.on("mouseout", function(){
	        		let pathid = this.parentNode.id.slice(1);
	        		setStroke(pathid, lineThin+"px", "0.5", legendFontSmall+"px");
	        	});

	    let lCirSel = legendGSel.selectAll("circle").data(d => [d]);
	    lCirSel.exit().remove();
	    lCirSel = lCirSel.enter().append("circle").merge(lCirSel);
	    lCirSel.transition(this.trans)
				.attr("cx", 3)
				.attr("cy", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return legendFontBig*(parseInt(cnt)+1);
				})
				.attr("r", 3)
				.style("stroke", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return colors[cnt];
				})
				.style("fill", function() {
                    let cnt = this.parentNode.getAttribute("data-cnt");
                    return colors[cnt];
				});

        lCirSel.on("click", function(){
        			if (this.style.fill == "white") {
        				let cnt = this.parentNode.getAttribute("data-cnt");
        				this.style.fill = colors[cnt];
        			}
        			else {
        				this.style.fill = "white"
        			}
        		});

	        	
		/*
		for (let i in this.dataset) {


	     

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
        			this.aggRow.select("#"+d3.event.target.id)
        				.style("fill", 1 == 1-this.clicked[+d3.event.target.id.split("_")[2]]? "white":colors[d3.event.target.id.split("_")[2]]);
        			this.aggRow.select("#"+id)
        				.style("display", 1 == 1-this.clicked[+d3.event.target.id.split("_")[2]]? "none": null);
        			this.aggRow.select("#"+id+"_circles")
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
		*/
		this.updateAxis();
	}

	updateCurrentLine(startYear, endYear) {
		let popMin = -1, popMax = -1, extent = 0;
		this.currentSelectedCoutry.forEach(function(country, i){
			extent = d3.extent(this.dataset[country], d => +d.stats);
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

	updateAxis() {
        this.xAxisG
            .call(function (g) {
			  g.call(this.xAxis);
			  g.select(".domain").remove();
			}.bind(this));
        this.yAxisG
            .transition(this.trans)
            .call(function (g) {
			  var s = g.selection ? g.selection() : g;
			  g.call(this.yAxis);
			  s.select(".domain").remove();
			  s.selectAll(".tick line").filter(Number).attr("stroke", "#777").attr("stroke-dasharray", "2,2");
			  s.selectAll(".tick text").attr("x", 4).attr("dy", -4);
			  if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
			}.bind(this));
	}
}
