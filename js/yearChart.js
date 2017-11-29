
class YearChart {

    constructor (mapChart) {

        this.mapChart = mapChart;

        this.content= d3.select("#yearChart");

        this.yearText = $("#yearText");

        this.curYear = 2016;

        this.update(this.curYear);

        this.content.select("#yearPrev")
            .on("click", function() {
                this.curYear -= 1;
                this.update();
            }.bind(this));
        this.content.select("#yearNext")
            .on("click", function() {
                this.curYear += 1;
                this.update();
            }.bind(this));
        this.content.select("#yearText")
            .on("keyup", function() {
                if (d3.event.key === "Enter") {
                    let curVal = parseInt(this.yearText.val());
                    if (isNaN(curVal)) {
                        alert("Invalid Year!");
                        this.yearText.val(this.curYear);
						this.yearText.blur();
                    }
                    else {
                        this.curYear = curVal;
                        this.yearText.blur();
                        this.update();
                    }
                }
            }.bind(this));
    }

    update () {
        let year = this.curYear;
        this.content.select("#yearPrev")
        .classed("disabled", year <= 1960);//window.dataset.years[0]);
        this.content.select("#yearNext")
        .classed("disabled", year >= 2016);//window.dataset.years[window.dataset.years.length - 1]);
        this.yearText.val(getYearText(year));
        this.mapChart.drawMap(fYear(year));
    }


};
