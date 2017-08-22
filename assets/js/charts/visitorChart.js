if (d3) {
$.ajax({
  headers: {
    "x-api-key": "kvjqf3zff1nzu6u6i6flcd1rcaq0nurxslc8d4o7",
    Accept : "application/json; charset=utf-8",
    "Content-Type": "application/json; charset=utf-8"
  },
  type: "GET",
  url: "https://api.applicationinsights.io/beta/apps/ae3f4ad0-da1d-4562-9039-fcbeed89c343/query?query=requests%7C%20where%20timestamp%20%3E%3D%20ago(24h)%7C%20count",
  dataType: 'json',
  success: function(data, textStatus, jqXHR) {
    jsonData = data;
    registerEvent();
  },
  error: function(x,y,z) {
    console.log("***ERROR in visitorChart.js***");
    console.log(x);
    console.log(y);
    console.log(z);
    // x.responseText should have what's wrong
  }
});

var jsonData = [];

var x = d3.scale.linear()
    .domain([0, d3.max(jsonData)])
    .range([0, 420]);

d3.select(".visitorChart")
  .selectAll("div")
    .data(jsonData)
  .enter().append("div")
    .style("width", function(d) { return x(d) + "px"; })
    .text(function(d) { return d; });
}