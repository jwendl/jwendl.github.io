---
title:  "Configuring Docker Inside a Service Fabric VM"
date:   2017-08-19 22:12:00
tags:
- windows
- containers
- docker
- service fabric
---

If there are ever any settings that need to be changed inside the Docker service that is running inside a Virtual Machine under Service Fabric the only way to accomplish this is through an Azure Resource Manager Virtual Machine Extension.
&shy;

{% highlight json %}
        "virtualMachineProfile": {
          "extensionProfile": {
            "extensions": [
              {
                "properties": {
                  "publisher": "Microsoft.Compute",
                  "type": "CustomScriptExtension",
                  "typeHandlerVersion": "1.7",
                  "autoUpgradeMinorVersion": false,
                  "settings": {
                    "fileUris": [ "https://iotdata.blob.core.windows.net/deployment/configdocker.ps1" ],
                    "commandToExecute": "powershell -ExecutionPolicy Unrestricted -File dockerpull.ps1"
                  },
                  "forceUpdateTag": "[parameters('vmExtensionVersion')]"
                },
                "name": "CustomScriptExtensionDockerPull"
              }
            ]
          },
{% endhighlight %}

We can put the following code into the configdocker.ps1 file.

{% highlight powershell %}
New-Item -Path "F:\Docker" -Type Directory
Set-Content "C:\ProgramData\docker\config\daemon.json" '{"graph": "F:\\Docker"}'
Stop-Process -ProcessName dockerd -Force
Start-Sleep -s 1
Remove-Item -Path "C:\ProgramData\docker\docker.pid"
Start-Sleep -s 1
Start-Service -DisplayName "Docker"
Start-Sleep -s 1
{% endhighlight %}

Essentially, we are going to tell it to use the F:\ data disk drive for docker images rather than the C:\ drive (this might be for performance or other reasons). 

The first line creates a new docker folder. 

The Set-Content line creates a new file with the json configuration in it per the [Docker website](https://docs.docker.com/engine/admin/systemd/#runtime-directory-and-storage-driver).

We then stop the process, sleep, remove the .pid and then start the process after that. The sleep statements were unfortunately needed because of the timing that it might take for the Docker service to actually stop.