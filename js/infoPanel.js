class InfoPanel {
    constructor(aggPanel) {
        this.contentObj = d3.select("#details");
        this.infoTable = this.contentObj.select("#basicInfoTable");
        this.aggPanel = aggPanel;
        this.donut = d3.select("#donut")
                        .attr("height", 200)
                        .attr("width", 200);
    }

    updateInfo(oneCountryInfo, year) {
        let wd = +oneCountryInfo.wikidata;
        this.contentObj.selectAll("#countryNameLabel").text(oneCountryInfo.NAME);
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
                            .value(d=>d.tot)
                let color = ["#1f77b4","#aec7e8","#ff7f0e","#ffbb78","#2ca02c","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf"];
                this.donut.html("");
                let group = this.donut.append("g")
                            .attr("transform", "translate(100, 100)")
                            .data([donutData]);
                let paths = group.selectAll("path")
                            .data(function(d){
                                return pie(d);
                            });
                            
                let arc = d3.arc()
                            .innerRadius(100)
                            .outerRadius(80);
                paths = paths.enter().append("path").merge(paths)
                            .filter(d=>d.data.tot != 0)
                            .attr("id", d=>d.data.religion+d.data.pct)
                            .style("fill", (d, i)=>color[i]);
                paths.attr("d", arc);



                d3.select("#add-button")
                    .on("click", function(){
                        this.aggPanel.insertCountry(oneCountryInfo.NAME, wd);
                    }.bind(this));
            }.bind(this))
        }.bind(this));

    }
}
