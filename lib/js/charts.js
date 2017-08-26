
$.ajax({
  type: "GET",
  // url: "https://blogapplicationdata.azurewebsites.net/api/TopPosts?code=mgKWTL//kLJEb37mekOzHZdBd3TDXYxdWTAIL91hvIL8cbaXjNM8mA==",
  url: "http://localhost:7071/api/TopPosts",
  dataType: 'json',
  success: function(data, textStatus, jqXHR) {
    var html = "<table>";
    data.map(function(item) {
      html += "<tr>";
      html += "<td>";
      html += item.Page;
      html += "</td>";
      html += "<td>";
      html += item.UniqueVisitors;
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