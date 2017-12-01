class RankView {
	constructor() {
		this.svgWidth = 800;
		this.svgHeight = 400;
		this.rankView = d3.select("#rankView")
							.attr("width", this.svgWidth)
							.attr("height", this.svgHeight);
		this.category = ["pop", "gdp", "cpi"];
        this.rankTip = d3.select("body").append("div")
        				.attr("class", "agg-tooltip")
        				.style("opacity", 0);
	}

	update(clikedCountry, wdMap, year) {
		let wd = clikedCountry, countryName = wdMap[wd];
		console.log(wd, countryName)
		console.log(year);
		let metaInfo = [];
		let barWidth = 8, barHeight = 120, chartPadding = 100, selectedNum = 41;
		this.category.forEach(function(category){
			let data = window.dataset[category][year];
			let metaG = []
			for (let i in data) {
				metaG.push({
					wd: i,
					stats: data[i],
					category: metaInfo.length
				})
			}
			metaInfo.push(metaG);
		})
		for (let i = 0; i < metaInfo.length-1; ++i) {
			metaInfo[i].sort(function(a, b) { return d3.descending(a.stats, b.stats); });
			metaInfo[i] = metaInfo[i].splice(0, selectedNum);
		};
		let thisRank = [];
		for (let i in metaInfo) {
			let flag = false;
			for (let j in metaInfo[i]) {
				if (metaInfo[i][j].wd === wd) {
					flag = true;
					thisRank.push(+j+1);
				}
				metaInfo[i][j].rank = +j+1;
			}
			if (!flag) thisRank.push(-1);
		}
		let maxData = [];
		for (let i in metaInfo) {
			if (metaInfo[i].length == 0) maxData.push(-1);
			else maxData.push(d3.max(metaInfo[i], d=>d.stats));
		}
		console.log(metaInfo, maxData, thisRank);

		let groups = this.rankView.selectAll("g")
									.data(metaInfo);

		groups = groups.enter().append("g").merge(groups);
		groups.attr("transform", (d,i)=>"translate("+i*(barHeight+chartPadding)+",10)");
		groups.html("");

		/*let tipShow = function(event) {
            this.rankTip.transition()
                .duration(200)
                .style("opacity", .9);
            let curRank = Math.floor(event.layerY/barWidth), start = curRank-3, end = curRank+3;
            if (start < 0) {
            	start = 0;
            	end = 6;
            }
            if (end > metaInfo.length-2){
            	end = metaInfo.length-2;
            	start = metaInfo.length-2-6;
            }
            let html = "";
            for (let i = start; i <= end; ++i) {
            	let star = "";
            	if (i == thisRank-1) 
            		star = "❤";
            	if (i == curRank) 
            		html += "<font size=\"4\"><b>#" + (i+1).toString() + " " + wdMap[metaInfo[i].wd] + " (" + d3.format(".2s")(metaInfo[i].stats) + ") " + star + "<br><\/b>" + "<\/font>";
            	else if (i == curRank-1 || i == curRank+1) 
            		html += "<font size=\"3\">#" + (i+1).toString() + " (" + wdMap[metaInfo[i].wd] + " " + d3.format(".2s")(metaInfo[i].stats) + ") " + star + "<br><\/font>";
            	else html += "<font size=\"2\">#" + (i+1).toString() + " (" + wdMap[metaInfo[i].wd] + " " + d3.format(".2s")(metaInfo[i].stats) + ") " + star + "<br><\/font>";
            }
            this.rankTip.html(html)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY-28) + "px");
		}.bind(this);

		let tipUnshow = function() {
            this.rankTip.transition()
                .duration(500)
                .style("opacity", 0);
		}.bind(this);*/

		groups.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", (d,i)=>barWidth*(selectedNum-1))
				.attr("width", (d,i)=>maxData[i]!=-1?barHeight:0)
				.style("fill", "AliceBlue")
				.on("mousemove", function(){
					//tipShow(d3.event);
				})
				.on("mouseout", function(){
					//tipUnshow();
				});

		let areaGenerator = d3.area(maxData)
								.x0(0)
								.x1(function(d, i){
									if (maxData[d.category] == -1) return 0;
									//console.log(d.stats, i, d.stats/maxData[d.category], maxData[d.category]);
									return d.stats/maxData[d.category]*barHeight;
								})
								.y(function(d, i){
									//console.log(i*barWidth, i);
									if (maxData[d.category] == -1) return 0;
									return i*barWidth;
								});

		groups.append("path")
				.style("fill", "CornflowerBlue")
				.attr("d", areaGenerator)
				.on("mousemove", function(){
					//tipShow(d3.event);
				})
				.on("mouseout", function(){
					//tipUnshow();
				});

		groups.append("circle")
				.attr("cx", (d, i)=>thisRank[i] !=-1? metaInfo[i][thisRank[i]-1].stats/maxData[i]*barHeight:0)
				.attr("cy", (d, i)=>thisRank[i] !=-1? (thisRank[i]-1)*barWidth:0)
				.attr("r", (d, i)=>thisRank[i] !=-1? 5:0)
				.style("fill", "yellow")
				.style("fill-opacity", 0.5)
				.style("stroke", "black")
				.on("mousemove", function(){
					//tipShow(d3.event);
				})
				.on("mouseout", function(){
					//tipUnshow();
				});

		/*groups.append("line")
				.attr("x1", 0)
				.attr("x2", metaInfo[thisRank-1].stats/maxData*barHeight-5)
				.attr("y1", (thisRank-1)*barWidth)
				.attr("y2", (thisRank-1)*barWidth)
				.style("stroke", "black")
				.style("stroke-width", "2px")
				.on("mousemove", function(){
					tipShow(d3.event);
				})
				.on("mouseout", function(){
					tipUnshow();
				});*/
	}
}
