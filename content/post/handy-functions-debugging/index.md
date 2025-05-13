---
title: Handy Functions Debugging
slug: handy-functions-debugging
date: 2025-05-13 11:17:14-08:00
comments: true

categories:
- Azure
- Functions

tags:
- azure
- functions
- debugging
- development
---

Found a little handy way of debugging TimerTrigger Azure functions locally. If you don't want to wait for minutes for your TimerTrigger to execute, you can use the ["/admin" apis](https://learn.microsoft.com/en-us/azure/azure-functions/functions-manually-run-non-http?tabs=azure-portal#define-the-request-location) for Azure Functions. 

When you run this locally while locally debugging in Visual Studio or Visual Studio Code, it will trigger the function immediately instead of waiting for the time to elapse. 

Here's an example I used:

``` PowerShell
curl -v -X POST http://localhost:7247/admin/functions/MyTimerTriggerFunction -H "Content-Type: application/json" -d "{}"
```

The reply should be something like:

``` PowerShell
* Host localhost:7247 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:7247...
*   Trying 127.0.0.1:7247...
* Connected to localhost (127.0.0.1) port 7247
* using HTTP/1.x
> POST /admin/functions/MyTimerTriggerFunction HTTP/1.1
> Host: localhost:7247
> User-Agent: curl/8.12.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 2
>
* upload completely sent off: 2 bytes
< HTTP/1.1 202 Accepted
< Content-Length: 0
< Date: Tue, 13 May 2025 18:12:24 GMT
< Server: Kestrel
<
* Connection #0 to host localhost left intact
```

Then if you look at the console logs of your Functions application you will see that your function with the TimerTrigger executed. 
