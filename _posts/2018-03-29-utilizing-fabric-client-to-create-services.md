---
layout: post
title:  "Utilizing FabricClient to Create Services"
date:   2018-03-29 12:18:00
categories:
 - Service Fabric
tags:
 - service fabric
 - c#
---
One lesser known feature of Service Fabric is the ability to create applications and services at runtime. This can be powerful for instance if the application is multi-tenant or you want to spin up background worker tasks.

To get started, we can first create a new Service Fabric project. In this project we will have to application types which will create instances of stateless services. In order to create a new instance of the fabric client we can simple call the following code below.

``` csharp
using System.Fabric;

// Further down in our constructor.
var fabricClient = new FabricClient();
```

The application definitions essentially setup application details like the application path (for example fabric:/DeviceSimulation/Devices), the application type name, the version and any additional properties we want to add to the applicaiton. We keep track of these values inside an ApplicationDescription instance object. To create a new instance of the application from the fabric client we will call the following code.

``` csharp
var applicationDescription = new ApplicationDescription(new Uri($"fabric:/DeviceSimulation/Devices"), "DeviceSimulationType", "1.0.0", new NameValueCollection());
await fabricClient.ApplicationManager.CreateApplicationAsync(applicationDescription);
```

Then we move on to creating instances of our stateless service. This has a StatelessServiceDescription class (similar to ApplicationDescription above) that has more properties, but describes the stateless service definition.

``` csharp
serviceDescriptions = new List<StatelessServiceDescription>();
var statelessServiceDescription = new StatelessServiceDescription()
{
    ApplicationName = new Uri($"fabric:/DeviceSimulation/Devices"),
    ServiceName = new Uri($"fabric:/DeviceSimulation/Devices/{serviceName}"),
    ServiceTypeName = "DeviceSimulatorType",
    PartitionSchemeDescription = new SingletonPartitionSchemeDescription(),
    InitializationData = Encoding.ASCII.GetBytes(json),
    InstanceCount = 1,
};
serviceDescriptions.Add(serviceName, statelessServiceDescription);

// Further below we create the instances of the service.
foreach (var serivceDescription in serviceDescriptions)
{
    await fabricClient.ServiceManager.CreateServiceAsync(serivceDescription);
}
```

So for every item in the serviceDescriptions list we will instantiate a new service that has those details passed along to it (inside InitializationData).

There are a lot of advantages here because services can scale out more than applications or containers. One major disadvantage though, is that we would need to attach to a process in order to debug the child stateless service as Visual Studio loses track of processes that are instantiated at run time.