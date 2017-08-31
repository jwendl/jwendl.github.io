// var baseUrl = "https://blogapplicationdata.azurewebsites.net";
var baseUrl = "http://localhost:7071";

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
    var chart = c3.generate({
      bindto: d3.select('#requestsChart'),
      data: {
          x: 'x',
          columns: [
            ['x', '2013-01-01', '2013-01-02', '2013-01-03', '2013-01-04', '2013-01-05', '2013-01-06'],
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 130, 340, 200, 500, 250, 350]
          ]
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%Y-%m-%d'
            }
          }
        }
      });
  },
  error: function(x,y,z) {
    console.log("***ERROR in visitorChart.js***");
    console.log(x);
    console.log(y);
    console.log(z);
  }
});