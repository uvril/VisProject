
class YearChart {

    constructor (mapChart) {

        this.mapChart = mapChart;

        this.svg = d3.select("#yearChart")
            .append("svg")
            .attr("height", 100)
            .attr("width", 1000);

        let margin = {right:50, left:50};
        let width = this.svg.attr("width") - margin.left - margin.right;

        this.x = d3.scaleLinear()
            .domain([-2001, 2017])
            .range([0, width])
            .clamp(true);

        this.yearText = this.svg.append("text")
            .attr("x", 20)
            .attr("y", 20)
            .text(this.x.domain()[1]);



        var slider = this.svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(" + margin.left + "," + this.svg.attr("height") / 2 + ")");

        slider.append("line")
            .attr("class", "track")
            .attr("x1", this.x.range()[0])
            .attr("x2", this.x.range()[1])
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function() { slider.interrupt(); })
                .on("start drag", function() { this.changeYear(this.x.invert(d3.event.x)); }.bind(this)));

        slider.insert("g", ".track-overlay")
            .attr("class", "ticks")
            .attr("transform", "translate(0," + 18 + ")")
            .selectAll("text")
            .data(this.x.ticks(30))
            .enter().append("text")
            .attr("x", d => this.x(d))
            .attr("text-anchor", "middle")
            .text(d => d);

        this.handle = slider.insert("circle", ".track-overlay")
            .attr("class", "handle")
            .attr("cx", this.x.range()[1])
            .attr("r", 9);

    };

    changeYear(h) {
        this.handle.attr("cx", this.x(h));
        let year = Math.round(h);
        this.yearText.text(year);
        this.mapChart.drawMap(year);
    };


};
