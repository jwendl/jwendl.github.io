---
layout: post
title:  "Service Fabric with Windows Containers"
date:   2017-08-21 22:12:00
categories:
 - Docker
tags:
 - windows
 - containers
 - docker
 - service fabric
---
If you are interested in running service fabric with Windows containers there are a few things to consider while the functionality is in public preview.

First, when you spin up the service fabric cluster it needs some additional settings in order to build the Virtual Machine scale set properly.

When creating the cluster, we need to set the operating system to WindowsServer-2016-Datacenter-with-Containers. This enables the virtual machines in the virtual machine scale set to have the right operating system setup to allow support for containers inside a virtualized environment.

![Cluster Screen #001](/images/ClusterScreen-001.png)

The next two settings that need to be set are on step #2 where we are configuring the cluster configuration. Here we need to select "Show optional settings".

![Cluster Screen #002](/images/ClusterScreen-002.png)

Then on the optional settings screen, we need to ensure that "include DNS service" is selected and that the Fabric version is set to "Manual" and "255.255.5718.255 (preview). The first setting enables the ability for containers to see each other as Windows requires DNS services in order for host names to be assigned to them. Docker will not do this for a Windows container. The Fabric version is also required as it enables the orchistration needed to support composition of Docker containers.

![Cluster Screen #003](/images/ClusterScreen-003.png)

Setting up the cluster in this particular way will allow you to run Windows containers inside Service Fabric.
