---
layout: post
title:  "Duplicate Properties in Arm Templates"
date:   2017-09-05 16:27:00
categories:
 - Azure
tags:
 - azure
 - arm template
---

When troubleshooting an Azure Resource Manager template, be sure to validate that there are not duplicate properties that exist in the parameters.json file.
&shy;

We were building an IoT Hub template for quick deployment in multiple regions on Azure. In the template, we wanted to add a "routing" property to the json to create endpoints and routes for the IoT Hub. 

The resource provider for the IoT Hub did not reply with any error messages, only a success message and the end results being that our endpoints and routes did not exist in the Azure portal.

An example of our json to create these endpoints.
{% highlight json %}
        "routing": {
          "endpoints": {
            "serviceBusQueues": [],
            "serviceBusTopics": [],
            "eventHubs": [
              {
                "connectionString": "[concat('Endpoint=sb://', parameters('iotHubServiceBusName'), '.servicebus.windows.net:5671/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=', parameters('iotHubServiceBusKey'), ';EntityPath=hubdata')]",
                "name": "Hub",
                "subscriptionId": "...",
                "resourceGroup": "iotdata"
              }
            ]
          },
          "routes": [
            {
              "name": "Route",
              "source": "DeviceMessages",
              "condition": "payloadType = \"Data\"",
              "endpointNames": [
                "Energy"
              ],
              "isEnabled": true
            }
          ]
        },
{% endhighlight %}

The problem is that in our Azure Resource Manager template, further down in the json we had another "routing" property that looked like the following code.
{% highlight json %}
        "routing": {
        }
{% endhighlight %}

Because of this our IoT Hub instance in the Azure portal was taking the second definition and not deploying any endpoints or routes to the IoT Hub instance.

In a future post, we will walk through utilizing the [azure-arm-validator](https://github.com/Azure/azure-arm-validator) on GitHub to ensure that the json is valid.