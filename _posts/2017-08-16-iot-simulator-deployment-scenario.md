---
layout: post
title:  "IoT Simulator Deployment Scenario"
date:   2017-08-16 13:39:00
categories:
 - IoT
tags:
 - iot
 - simulator
---

The goal of this Azure Resource Manager template is to build a place where anyone who is interested in simulating load on Azure IoT Hubs utilizing their own data is possible. This is done by creating an environment where containers that have the application specific code can be replicated at scale and allow semi-realistic data to flow through the IoT Hub and eventually on to any endpoints specified in the IoT Hub.
&shy;

This Azure Resource Manager template builds out an Azure Service Fabric cluster with an accompanying Azure IoT Hub that has example hubs and routes. The Azure Service Fabric cluster has a Virtual Machine Scale Set with Windows server hosts that can support Windows Containers (2016-Datacenter-with-containers image sku). 

To get the fully combined template, please go to this [GitHub Repository](https://github.com/Azure/azure-quickstart-templates)

## Service Fabric with Windows Containers

To enable Azure Service Fabric with Windows Containers, there are three properties in our Azure Resource Manager template that we need to ensure that we have enabled. 
{% highlight json %}
    "vmImageSku": {
      "type": "string",
      "defaultValue": "2016-Datacenter-with-Containers",
      "metadata": {
        "description": "VM image SKU"
      }
    },

    ...

    "properties": {
        "clusterCodeVersion": "255.255.5718.255",

        ...

        "addonFeatures": [
          "DnsService"
        ],
    }

    ...
{% endhighlight %}

The full example is available at [GitHub](https://github.com/Azure/azure-quickstart-templates)

## IoT Hubs with Endpoints and Routes.

To build out an IoT Hub with endpoints and routes, there are two properties that need to be filled out. 
{% highlight json %}
        "routing": {
          "endpoints": {
            "serviceBusQueues": [],
            "serviceBusTopics": [],
            "eventHubs": [
{% endhighlight %}

and

{% highlight json %}
        "routing": {
          "routes": [
            {
{% endhighlight %}

The full example is available at [GitHub](https://github.com/Azure/azure-quickstart-templates)

**Note**: if you have multiple properties (for instance "routing":) in your Azure Resource Manager template, it will use the last property declared as what is deployed out to Azure.

