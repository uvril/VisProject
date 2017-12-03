class RankView {
	constructor() {
		this.svgWidth = 350;
		this.svgHeight = 450;
		this.rankView = d3.select("#rankView")
							.attr("width", this.svgWidth)
							.attr("height", this.svgHeight);
		this.category = ["pop", "gdp"];
        this.rankTip = d3.select("body").append("div")
        				.attr("class", "agg-tooltip")
						.style("z-index", 1000)
        				.style("opacity", 0);
	}

	update(clikedCountry, wdMap, year) {
		let wd = clikedCountry, countryName = wdMap[wd];
		console.log(wd, countryName)
		console.log(year);
		let metaInfo = [];
		let barWidth = 8, barHeight = 120, chartPadding = 100, selectedNum = 51, textPos = 15;
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
		for (let i = 0; i < metaInfo.length; ++i) {
			metaInfo[i].sort(function(a, b) { return d3.descending(+a.stats, +b.stats); });
			metaInfo[i] = metaInfo[i].splice(0, selectedNum);
		};
		console.log(metaInfo);
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
		groups.attr("transform", (d,i)=>"translate("+i*(barHeight+chartPadding)+","+ (textPos*2) +")");
		groups.html("");

		let tipShow = function(mouseevent, category) {
			console.log(mouseevent);
            this.rankTip.transition()
                .duration(200)
                .style("opacity", .9);
            let curRank = Math.floor(mouseevent[1]/barWidth), start = curRank-3, end = curRank+3;
            if (start < 0) {
            	start = 0;
            	end = 6;
            }
            //console.log(category);
            if (end > metaInfo[category].length-2){
            	end = metaInfo[category].length-2;
            	start = metaInfo[category].length-2-6;
            }
            let html = "";
            for (let i = start; i <= end; ++i) {
            	let star = "";
            	if (i == thisRank[category]-1) 
            		star = "❤";
            	if (i == curRank) 
            		html += "<font size=\"4\"><b>#" + (i+1).toString() + " " + wdMap[metaInfo[category][i].wd] + " (" + d3.format(".2s")(metaInfo[category][i].stats) + ") " + star + "<br><\/b>" + "<\/font>";
            	else if (i == curRank-1 || i == curRank+1) 
            		html += "<font size=\"3\">#" + (i+1).toString() + " " + wdMap[metaInfo[category][i].wd] + " (" + d3.format(".2s")(metaInfo[category][i].stats) + ") " + star + "<br><\/font>";
            	else html += "<font size=\"2\">#" + (i+1).toString() + " " + wdMap[metaInfo[category][i].wd] + " (" + d3.format(".2s")(metaInfo[category][i].stats) + ") " + star + "<br><\/font>";
            }
            this.rankTip.html(html)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY-60) + "px");
		}.bind(this);

		let tipUnshow = function() {
            this.rankTip.transition()
                .duration(500)
                .style("opacity", 0);
		}.bind(this);

		groups.append("rect")
				.attr("id", "testrectrect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("height", (d,i)=>barWidth*(selectedNum-1))
				.attr("width", (d,i)=>maxData[i]!=-1?barHeight:0)
				.style("fill", "AliceBlue")
				.on("mousemove", function(d, i){
					tipShow(d3.mouse(this), i);
				})
				.on("mouseout", function(){
					tipUnshow();
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
				.on("mousemove", function(d, i){
					tipShow(d3.mouse(this), i);
				})
				.on("mouseout", function(){
					tipUnshow();
				});

		groups.append("circle")
				.attr("cx", (d, i)=>thisRank[i] !=-1? metaInfo[i][thisRank[i]-1].stats/maxData[i]*barHeight:0)
				.attr("cy", (d, i)=>thisRank[i] !=-1? (thisRank[i]-1)*barWidth:0)
				.attr("r", (d, i)=>thisRank[i] !=-1? 5:0)
				.style("fill", "yellow")
				.style("fill-opacity", 0.5)
				.style("stroke", "black")
				.on("mousemove", function(d, i){
					tipShow(d3.mouse(this), i);
				})
				.on("mouseout", function(){
					tipUnshow();
				});

		groups.append("line")
				.attr("x1", 0)
				.attr("x2", (d, i)=>thisRank[i] !=-1? metaInfo[i][thisRank[i]-1].stats/maxData[i]*barHeight-5:0)
				.attr("y1", (d, i)=>thisRank[i] !=-1? (thisRank[i]-1)*barWidth:0)
				.attr("y2", (d, i)=>thisRank[i] !=-1? (thisRank[i]-1)*barWidth:0)
				.style("stroke", "black")
				.style("stroke-width", "2px")
				.on("mousemove", function(d, i){
					tipShow(d3.mouse(this), i);
				})
				.on("mouseout", function(){
					tipUnshow();
				});

		let textG = this.rankView.selectAll("text")
					.data(this.category);
		textG = textG.enter().append("text").merge(textG);
		textG.attr("x", (d,i)=>maxData[i]!=-1?i*(barHeight+chartPadding)+barHeight/2:0)
			.attr("y", textPos)
			.text(function(d, i){
				if (maxData[i]!=-1) return this.category[i];
				return "";
			}.bind(this))
			.style("text-anchor", "middle")
	}
}
