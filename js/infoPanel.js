class InfoPanel {
    constructor(aggPanel) {
        this.contentObj = d3.select("#details");
        this.infoTable = this.contentObj.select("#basicInfoTable");
        this.aggPanel = aggPanel;
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
            d3.select("#add-button")
                .on("click", function(){
                    this.aggPanel.insertCountry(oneCountryInfo.NAME, wd);
                }.bind(this));
        }.bind(this));

    }
}
