
class YearChart {

    constructor (mapChart) {
		
		this.mapChart = mapChart;

var width = 500;

var x = d3.scaleLinear()
    .domain([1, 100])
    .range([0, width])
    .clamp(true);

var dispatch = d3.dispatch("sliderChange");

var slider = d3.select(".slider")
    .style("width", width + "px");

var sliderTray = slider.append("div")
    .attr("class", "slider-tray");

this.sliderHandle = slider.append("div")
    .attr("class", "slider-handle");

this.sliderHandle.append("div")
    .attr("class", "slider-handle-icon")

slider.call(d3.drag()
    .on("end", function() {
		this.sliderHandle.style("left", d3.event.x+"px");
		d3.select("#currentYear").text(d3.event.x+1945);
		this.mapChart.drawMap(d3.event.x+1945);
    }.bind(this)));


    };


};
