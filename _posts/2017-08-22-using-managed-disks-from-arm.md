---
title:  "Creating Managed Disks from Template"
date:   2017-08-22 13:24:00
tags:
- azure
- arm
- template
---

Most of the templates on the [Azure Quick Start](https://github.com/Azure/azure-quickstart-templates) GitHub repository are using storage accounts rather than managed disks at the moment (including the Service Fabric cluster one). Here is what you would need to change in order to move over to managed disks instead of regular storage accounts.
&shy;

First, we would want to remove any references to the storage account(s) so that we can clean up properties that are not needed for Storage Accounts.

Secondly, we want to add / change the "osDisk" property of the VM Scale Set to the below, removing other properties in the "osDisk" property.
{% highlight json %}
            "osDisk": {
              "createOption": "FromImage",
              "managedDisk": { "storageAccountType": "Premium_LRS" }
            },
            "dataDisks": [
              {
                "lun": 1,
                "createOption": "Empty",
                "diskSizeGB": 512,
                "managedDisk": { "storageAccountType": "Premium_LRS" }
              }
            ]
          }
{% endhighlight %}

Additionally, we want to change the Api Version for the VM Scale Set to be 2016-03-30 or later. 

After the three above changes, the VM Scale Set should be configured properly to use Managed Disks.

References:

* [Migrating Azure VMs to Managed Disks in Azure](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/migrate-to-managed-disks)
* [Migrating ARM Template](https://github.com/Azure-Samples/resources-dotnet-deploy-virtual-machine-with-managed-disks-using-arm-template/tree/master/Asset)
