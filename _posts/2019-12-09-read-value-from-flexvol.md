---
layout: post
title:  "Read Value from Key Vault FlexVolume in AKS"
date:   2019-12-09 13:37:00
categories:
 - AKS
tags:
 - kubernetes
 - linux
 - aks
---
There are many ways to read and rotate secrets in the kubernetes world. One approach works pretty well with Azure Kubernetes Service called [Key Vault FlexVolume](https://github.com/Azure/kubernetes-keyvault-flexvol). The blog post here will describe the steps I took to read an environment variable using Azure Key Vault, Azure Kubernetes Service and an ASP.NET Core 3.0 Web Api.

Conceptually what this project does is mount a file system using tmpfs that points to the FlexVolume adapter. Inside this adapter, we will then call out to Azure Key Vault using the KeyVaultClient object from the GO sdk. Then once the value is fetched for those files in the file system, they will be made available to the container. The container though, is immutable - so this means that if the value changes inside Azure Key Vault, that the value will not change in the mounted file system until the container is reloaded.

> Note: this flex volume functionality will be built into kubernetes eventually via the [secrets-store-csi-driver-provider-azure](https://github.com/Azure/secrets-store-csi-driver-provider-azure) project.

The first thing we need to do is setup an AKS cluster in Azure. At the time of this blog post, we created an AKS cluster at version 1.13.12 with the default settings.

Once we have an AKS cluster we can install the Key Vault FlexVolume to the cluster by using the below command.

``` bash
kubectl create -f https://raw.githubusercontent.com/Azure/kubernetes-keyvault-flexvol/master/deployment/kv-flexvol-installer.yaml
```

Next we will want to enable system managed identities for our cluster (went this route as we have a brand new cluster).

First validate that our cluster has system managed identities installed by running the below command.

``` bash
az vmss identity show -g <resource group>  -n <vmss scalset name> -o yaml
```

The output should be ```type: SystemAssigned```

Next we will add our identity into Azure Key Vault using a policy via the Azure CLI.

``` bash
az keyvault set-policy --name $keyVaultName --key-permissions get --spn <YOUR AZURE MANAGED IDENTITY CLIENT ID>
az keyvault set-policy --name $keyVaultName --secret-permissions get --spn <YOUR AZURE MANAGED IDENTITY CLIENT ID>
az keyvault set-policy --name $keyVaultName --certificate-permissions get --spn <YOUR AZURE MANAGED IDENTITY CLIENT ID>
```

> Note: we obtain the property for the --spn by getting the object-id for our aks cluster system identity and pass it into the command ```az ad sp show --object-id <guid>```. Then from there we grab the service principal's appId property (using --query appId --output tsv if needed).

The next step will be to create a new Web Api project inside Visual Studio 2019.

We can create a new controller that looks something like:

``` csharp
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace FlexVolumeExample.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FetchValueController
        : ControllerBase
    {
        [HttpGet]
        public async Task<KeyVaultResultValue> Get()
        {
            var fileContents = await System.IO.File.ReadAllTextAsync("/mnt/keyvault/mysecret");

            return new KeyVaultResultValue()
            {
                Value = fileContents,
            };
        }
    }
}
```

We can also deploy this to kubernetes using the following yaml definition.

``` yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: flexvolumeexample
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: flexvol-kub-app
    spec:
      containers:
      - name: flexvolumeexample
        image: jwsecretregistry.azurecr.io/flexvolumeexample:v2
        ports:
        - containerPort: 80
        volumeMounts:
        - name: keyvault-secret
          mountPath: /mnt/keyvault
          readOnly: true
      volumes:
      - name: keyvault-secret
        flexVolume:
          driver: "azure/kv"
          options:
            usevmmanagedidentity: "true"
            resourcegroup: "SecretRotation"
            keyvaultname: "jwsecretvault"
            keyvaultobjectname: "mysecret"
            keyvaultobjecttype: secret
            subscriptionid: "<subscription-id>"
            tenantid: "<tenant-id>"
---
apiVersion: v1
kind: Service
metadata:
  name: flexvol-kub-app
spec:
  ports:
  - name: http-port
    port: 80
    targetPort: 80
  selector:
    app: flexvol-kub-app
  type: LoadBalancer
```

> Note: keyvaultobjectname and keyvaultobjecttype can contain multiple entries separated by ';'. So an example would be "mysecret;anothersecret".

Finally we can run the following command to deploy it to our kubernetes cluster.

``` bash
kubectl create -f deployment.yaml
```

If we want to change a value in Azure Key Vault and observe that change in our application, we will have to kill the old container instances and start up new ones. In production this would involve some form of blue / green deployment strategy [an example using Jenkins](https://docs.microsoft.com/en-us/azure/jenkins/jenkins-aks-blue-green-deployment)

In our case, we just want to see the value change in our container instances. We can do that by setting the replica set to 0 and then increasing it to be greater than 0.

``` bash
kubectl scale deployment flexvolumeexample --replicas=0
kubectl scale deployment flexvolumeexample --replicas=1
```
