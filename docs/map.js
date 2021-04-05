const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80"

// --------------- Event handler ---------------
const zoom = d3
  .zoom()
  .scaleExtent(ZOOM_THRESHOLD)
  .on("zoom", zoomHandler);

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function mouseOverHandler(d, i) {
  d3.select(this).attr("fill", HOVER_COLOR)
}

function mouseOutHandler(d, i) {
  d3.select(this).attr("fill", color(d.total))
}

function clickHandler(d, i) {
    d3.select("#map__text").text(`You've selected Precinct ${d.properties.Precinct} `)
    d3.select("#map__desc").text(`Total cases reported in the Precinct: ${data1.get(parseInt(d.properties.Precinct))} `)
    d3.select("#graphic").select('svg').remove();
    var svg_bar = d3.select("#graphic").append("svg")
            .attr("width", width1 + margin.left + margin.right)
            .attr("height", height1 + margin.top + margin.bottom)
            .append("g")
            .style("margin-top", "10px")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var newArray = d.data2.filter(function (i,el) {
        // console.log(d.properties.Precinct, parseInt(i.precinct))\
          return parseInt(i.precinct) === d.properties.Precinct ;
        });
    newArray = newArray.sort(function (a, b) {
            return d3.ascending(parseInt(a.count), parseInt(b.count));
        })
    var x = d3.scaleLinear()
            .range([0, width1])
            .domain([0, d3.max(newArray, function (d) {
                return parseInt(d.count);
            })]);

    var y = d3.scaleBand()
        .range([height1, 0])
        .padding([.2])
        .domain(newArray.map(function (d) {
            return d.complainant_ethnicity;
        }));

    //make y axis to show bar names
    var yAxis = d3.axisLeft(y)
        //no tick marks
        .tickSize(0);

    var gy = svg_bar.append("g")
        .attr("class", "y axis")
        .call(yAxis)

    var bars = svg_bar.selectAll(".bar")
        .data(newArray)
        .enter()
        .append("g")

    //append rects
    bars.append("rect")
        .attr("class", "bar")
        .attr("y", function (d) {
            return y(d.complainant_ethnicity);
        })

        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", function (d) {
            return x(parseInt(d.count));
        });

    //add a value label to the right of each bar
    bars.append("text")
        .attr("class", "label")
        //y position of the label is halfway down the bar
        .attr("y", function (d) {
            return y(d.complainant_ethnicity) + y.bandwidth() / 2 + 4;
        })
        //x position is 3 pixels to the right of the bar
        .attr("x", function (d) {
            return x(parseInt(d.count)) + 3;
        })
        .text(function (d) {
            return d.count;
        });
}

function clickToZoom(zoomStep) {
  svg
    .transition()
    .duration(ZOOM_DURATION)
    .call(zoom.scaleBy, zoomStep);
}

d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));

//  --------------- Step 1 ---------------
// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.
const svg = d3
  .select("#map__container")
  .append("svg")
  .attr("width", "70%")
  .attr("height", "90%");

const g = svg.call(zoom).append("g");

g
  .append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

// --------------- Step 2 ---------------
// Project GeoJSON from 3D to 2D plane, and set
// projection config.
const projection = d3
  .geoMercator()
  .center([-74.0438790753783, 40.690195926820898])
  .scale(50000)
  .translate([WIDTH / 4, HEIGHT / 2]);

// --------------- Step 3 ---------------
// Prepare SVG path and color, import the
// effect from above projection.
const length = 1500
const width = 300
const path = d3.geoPath().projection(projection);
// const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));

const color = d3.scaleThreshold()
    .domain([150, 300, 450, 600, 750, 900, 1050, 1200])
    .range(d3.schemeBlues[9])
// --------------- Step 4 ---------------
// 1. Plot the map from data source `hongkong`
// 2. Place the district name in the map
var data1 = d3.map();
// const store = {};

var rowConverter = function (d) {
  return {
    precinct: d.precinct,
    complainant_ethnicity: +d.complainant_ethnicity,
    count: +d.count,
    }
};
// renderMap();

d3.csv()

d3.queue()
  .defer(d3.csv, "https://raw.githubusercontent.com/smarthxg/group24-EDAV-Project/main/data/complaints.csv", function(d) { data1.set(d.precinct, +d.count); })
  .defer(d3.csv, "https://raw.githubusercontent.com/smarthxg/group24-EDAV-Project/main/data/barchart.csv")
  .await(renderMap);


function renderMap(error, data, data2) {
    // Draw districts and register event listeners
    // Legend
    g
        .append("g")
        .attr("class", "legendThreshold")
        .attr("transform", "translate(80,60)");
    g   .append("text")
        .attr("class", "caption")
        .attr("x", 80)
        .attr("y", 40)
        .text("Students");
    var labels = ['0-150', '150-300', '300-450', '450-600', '600-750', '750-900', '900-1050', "1050-1200", ">1200"];
    var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(color);
    svg.select(".legendThreshold")
        .call(legend);

    g
        .append("g")
        .selectAll("path")
        .data(nyc.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", function (d) {
            d.total = data1.get(parseInt(d.properties.Precinct));
            d.data2 = data2
            return color(d.total);
          })
        .attr("stroke", "#FFF")
        .attr("stroke-width", 0.5)
        .on("mouseover", mouseOverHandler)
        .on("mouseout", mouseOutHandler)
        .on("click", clickHandler);

    // Place name labels in the middle of a district
    // Introduce some offset (dy, dx) to adjust the position
    g
        .append("g")
        .selectAll("text")
        .data(nyc.features)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${path.centroid(d)})`)
        .attr("text-anchor", "middle")
        .attr("font-size", 10)
        .attr("dx", d => _.get(d, "offset[0]", null))
        .attr("dy", d => _.get(d, "offset[1]", null))

}


var data = [{
                "name": "Apples",
                "value": 20,
        },
            {
                "name": "Bananas",
                "value": 12,
        },
            {
                "name": "Grapes",
                "value": 19,
        },
            {
                "name": "Lemons",
                "value": 5,
        },
            {
                "name": "Limes",
                "value": 16,
        },
            {
                "name": "Oranges",
                "value": 26,
        },
            {
                "name": "Pears",
                "value": 30,
        }];

        //sort bars based on value
        data = data.sort(function (a, b) {
            return d3.ascending(a.value, b.value);
        })

var margin = {
            top: 15,
            right: 40,
            bottom: 15,
            left: 100
        };

var width1 = 300 - margin.left - margin.right,
    height1 = 300 - margin.top - margin.bottom;

var svg_bar = d3.select("#graphic").append("svg")
            .attr("width", width1 + margin.left + margin.right)
            .attr("height", height1 + margin.top + margin.bottom)
            .append("g")
            .style("margin-top", "10px")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/**
 * Reference:
 *   http://www.ourd3js.com/wordpress/296/
 *   https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45
 *   https://stackoverflow.com/questions/35443768/how-do-i-fix-zooming-and-panning-in-my-cluster-bundle-graph
 *   https://groups.google.com/forum/#!topic/d3-js/OAJgdKtn1TE
 *   https://groups.google.com/forum/#!topic/d3-js/sg4pnuzWZUU
 */

