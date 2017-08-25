
$.ajax({
  type: "GET",
  url: "https://blogdataapplication.azurewebsites.net/api/TopPosts?code=xTpyXm4ZY85HEAdKefPJf3XksLpn61VtEGuV18efai/64hqqvyeyDw==",
  // url: "http://localhost:7071/api/TopPosts",
  dataType: 'json',
  success: function(data, textStatus, jqXHR) {
    var max = d3.max(data.map(function(d) {
      return d.UniqueVisitors;
    }));

    var x = d3.scale.linear()
      .domain([0, max])
      .range([0, 1000]);

    d3.select("#visitorChart")
      .selectAll("div")
        .data(data)
      .enter().append("div")
        .style("width", function(d) { return x(d.UniqueVisitors) + "px"; })
        .text(function(d) { return d.Page + " - (" + d.UniqueVisitors + ")"; })
  },
  error: function(x,y,z) {
    console.log("***ERROR in visitorChart.js***");
    console.log(x);
    console.log(y);
    console.log(z);
  }
});