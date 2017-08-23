
$.ajax({
  type: "GET",
  url: "https://blogdataapplication.azurewebsites.net/api/TopPosts?code=xTpyXm4ZY85HEAdKefPJf3XksLpn61VtEGuV18efai/64hqqvyeyDw==",
  // url: "http://localhost:7071/api/TopPosts",
  dataType: 'json',
  success: function(data, textStatus, jqXHR) {
    var chart = c3.generate({
      bindto: '#visitorChart',
      data: {
        json: data,
        keys: {
          x: 'Page',
          value: ['UniqueVisitors']
        },
        type: 'bar'
      },
      axis: {
        x: {
          type: 'category'
        },
        rotated: true
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