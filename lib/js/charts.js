var baseUrl = "https://blogapplicationdata.azurewebsites.net";
// var baseUrl = "http://localhost:7071";

$.ajax({
  type: "GET",
  url: baseUrl + "/api/TopPosts?code=mgKWTL//kLJEb37mekOzHZdBd3TDXYxdWTAIL91hvIL8cbaXjNM8mA==",
  dataType: 'json',
  success: function(data, textStatus, jqXHR) {
    var html = "<table>";
    data.map(function(item) {
      html += "<tr>";
      html += "<td>";
      html += item.Page;
      html += "</td>";
      html += "<td>";
      html += item.UniqueHits;
      html += "</td>";
      html += "</tr>";
    });
    html += "</table>";
    $("#visitorChart").append(html);
  },
  error: function(x,y,z) {
    console.log("***ERROR in visitorChart.js***");
    console.log(x);
    console.log(y);
    console.log(z);
  }
});


$.ajax({
  type: "GET",
  url: baseUrl + "/api/RequestsPerHour?code=SZEsJz3b4tXzwN2Tnr/TTem4yqZlxKn6TuOVmm1DLOfdua1RwZaccA==",
  dataType: 'json',
  success: function(data, textStatus, jqXHR) {
    // Set the dimensions of the canvas / graph
    var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

    // Parse the date / time
    var parseDate = d3.time.format("%d-%b-%y").parse;

    // Set the ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);

    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
      .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis().scale(y)
      .orient("left").ticks(5);

    // Define the line
    var valueline = d3.svg.line()
      .x(function(d) { return x(Date.parse(d.Timestamp)); })
      .y(function(d) { return y(d.UniqueHits); });

    // Adds the svg canvas
    var svg = d3.select("#requestsChart")
      .data(data)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return Date.parse(d.Timestamp); }));
    y.domain([0, d3.max(data, function(d) { return d.UniqueHits; })]);

    // Add the valueline path.
    svg.append("path")
      .attr("class", "line")
      .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the Y Axis
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  },
  error: function(x,y,z) {
    console.log("***ERROR in visitorChart.js***");
    console.log(x);
    console.log(y);
    console.log(z);
  }
});