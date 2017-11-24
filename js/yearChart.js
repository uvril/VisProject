
class YearChart {

    constructor (mapChart) {

        this.mapChart = mapChart;

        this.content= d3.select("#yearChart");

        this.yearText = this.content.select("#yearText");

        this.curYear = 2015;

        this.update(this.curYear);

        this.content.select("#yearPrev")
            .on("click", function() {
                this.update(lYear(this.curYear));
            }.bind(this));
        this.content.select("#yearNext")
            .on("click", function() {
                this.update(rYear(this.curYear));
            }.bind(this));
        this.content.select("#yearText")
            .on("keyup", function() {
                if (d3.event.key === "Enter") {
                    let curVal = parseInt($("#yearText").val());
                    if (isNaN(curVal)) {
                        alert("Invalid Year!");
                        $("#yearText").val(this.curYear);
                    }
                    else {
                        this.update(curVal);
                    }
                }
            }.bind(this));
    }

    update (year) {
        this.curYear = year;
        this.content.select("#yearPrev")
        .classed("disabled", year === window.dataset.years[0]);
        this.content.select("#yearNext")
        .classed("disabled", year === window.dataset.years[window.dataset.years.length - 1]);
        this.yearText.attr("value", getYearText(year));
        this.mapChart.drawMap(year);
    }


};
