$.ajax({headers:{"x-api-key":"kvjqf3zff1nzu6u6i6flcd1rcaq0nurxslc8d4o7"},type:"GET",url:"https://api.applicationinsights.io/beta/apps/ae3f4ad0-da1d-4562-9039-fcbeed89c343/events/browserTimings",dataType:"json",success:function(a,o,e){a.value,c3.generate({bindto:"#visitorChart",data:{columns:[["data1",30,200,100,400,150,250],["data2",50,20,10,40,15,25]]}})},error:function(a,o,e){console.log("***ERROR in visitorChart.js***"),console.log(a),console.log(o),console.log(e)}});