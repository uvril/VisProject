class InfoPanel {
    constructor(aggPanel) {
        this.contentObj = d3.select("#details");
        this.infoTable = this.contentObj.select("#basicInfoTable");
        this.aggPanel = aggPanel;
        this.donutH = 250;
        this.donutW = 220;
        this.donut = d3.select("#donut")
                        .attr("height", this.donutH)
                        .attr("width", this.donutW);
        this.legendH = 250;
        this.legendW = 120;
        this.legend = d3.select("#donut-legend")
                        .attr("height", this.legendH)
                        .attr("width", this.legendW);
    }

    updateInfo(oneCountryInfo, year) {
        let wd = +oneCountryInfo.wikidata;
        this.contentObj.selectAll("#countryNameLabel")
            .text(oneCountryInfo.NAME);
        this.contentObj.select("#countryIcon").attr("src", "icons/" + wd + ".png");
        if (wd < 0) {
            this.contentObj.select("#countryInfo").style("visibility", "hidden");
            return;
        }
        else {
            this.contentObj.select("#countryInfo").style("visibility", "visible");
        }
        d3.json("data/stat/" + wd + ".json", function(err, data) { 
            d3.json("data/religion.json", function(err, rdata){
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

                console.log(rdata);
                let donutData = [], seletedNum = 5, others = 0, sum=0;

                for (let i in rdata[wd]) {
                    if (+rdata[wd][i].pct < 0.01)
                        others += +rdata[wd][i].tot;
                    else donutData.push(rdata[wd][i]);
                    sum += +rdata[wd][i].tot;
                }
                if (others != 0) donutData.push({"religion": "Others", "tot": others, "pct":others/sum});
                console.log(donutData);
                let pie = d3.pie()
                            .value(d=>d.tot);
                let arc = d3.arc()
                            .innerRadius(100)
                            .outerRadius(80);
                let color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
                this.donut.html("");
                let groupP = this.donut.append("g")
                            .attr("transform", "translate(" + this.donutW/2 +", " + this.donutH/2 + ")")
                            .data([donutData]);
                let paths = groupP.selectAll("path")
                            .data(function(d){
                                console.log(d);
                                return pie(d);
                            });
                paths = paths.enter().append("path").merge(paths)
                            .filter(d=>d.data.tot != 0)
                            .attr("id", d=>d.data.religion+d.data.pct)
                            .style("fill", (d, i)=>color[i]);
                paths.attr("d", arc);

                this.legend.html("");
                let rectH = 10, rectW = 10, rectPadding = 10, rectX = 0, textPadding = 5;
                let legendSize = (donutData.length-1)*(rectH+rectPadding)+rectH;
                console.log(legendSize, this.donutH/2+100);
                let groupL = this.legend.append("g")
                                .attr("transform", "translate(0," + (this.donutH/2-legendSize/2) + ")")
                                .data([donutData]);
                let legendsR = groupL.selectAll("rect")
                                    .data(d=>d);
                legendsR = legendsR.enter().append("rect").merge(legendsR)
                                    .attr("x", rectX)
                                    .attr("y", (d, i)=>i*(rectH+rectPadding))
                                    .attr("height", rectH)
                                    .attr("width", rectW)
                                    .style("fill", (d, i)=>color[i]);
                let legendsT = groupL.selectAll("text")
                                        .data(d=>d);
                legendsT = legendsT.enter().append("text").merge(legendsT)
                                    .attr("x", rectX+textPadding+rectW)
                                    .attr("y", (d, i)=>i*(rectH+rectPadding)+rectH)
                                    .text(d=>d.religion)
                                    .style("text-archor", "middle")
                                    .style("font-size", "11px");

                d3.select("#add-button")
                    .on("click", function(){
                        this.aggPanel.insertCountry(oneCountryInfo.NAME, wd);
                    }.bind(this));
            }.bind(this))
        }.bind(this));

    }
}
