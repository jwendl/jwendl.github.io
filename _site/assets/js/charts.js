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
    var xColumns = data.map(function(item) {
      return new Date(item.Timestamp);
    });

    xColumns.unshift('x');

    var yValues = data.map(function(item) {
      return item.UniqueHits;
    });

    yValues.unshift('Requests');

    var chart = c3.generate({
      bindto: d3.select('#requestsChart'),
      data: {
          x: 'x',
          columns: [
            xColumns,
            yValues
          ]
        },
        axis: {
          x: {
            type: 'timeseries',
            tick: {
              format: '%m/%d %H:%M'
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