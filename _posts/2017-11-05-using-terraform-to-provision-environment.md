---
layout: post
title: Using Terraform to Provision your Azure Environment
date: 2017-11-05T14:09:00.000Z
categories:
  - Azure
tags:
  - azure
  - terraform
comments:
  - author:
      type: full
      displayName: jwendl
      url: 'https://github.com/jwendl'
      picture: 'https://avatars1.githubusercontent.com/u/1068431?v=4&s=73'
    content: Test
    date: 2017-11-16T22:46:33.341Z

---
Terraform provides a nice interface from the command line through the [Azure GO SDK](https://github.com/Azure/azure-sdk-for-go) to Azure itself. In order to accomplish this, we need to utilize the [AzureRM](https://github.com/jwendl/terraform-provider-azurerm) provider for Terraform. When you have a main.tf file that uses an AzureRM configuration, Terraform will automatically download the AzureRM provider when calling terraform init (see below).

One important difference between Azure Resource Management templates (ARM Templates) and Terraform is that the "state" of your environment is held locally in the same directory as the main.tf file. One other unique difference is that ARM Templates utilize a "CreateOrUpdate" method of creating azure resources, while Terraform utilizes a "merge" model to ensure that what you have locally is deployed out in Azure (or rather in sync).

To install Terraform using the Windows Subsystem for Linux just use the following commands.

``` bash
wget https://releases.hashicorp.com/terraform/0.10.8/terraform_0.10.8_linux_amd64.zip -O terraform.zip
unzip terraform.zip
chmod 700 terraform
sudo mv terraform /usr/local/bin/terraform
```

Terraform uses a language called Hashicorp Configuration Language - [HCL](https://github.com/hashicorp/hcl). This language has it's own configuration but allows for variables and conditionals.

For instance, if we wanted to create an Azure Container Instance service, we could place the following code inside a file named main.tf

``` json
resource "azurerm_resource_group" "aci-rg" {
  name     = "aci-test"
  location = "west us"
}

resource "azurerm_storage_account" "aci-sa" {
  name                = "acistorageacct"
  resource_group_name = "${azurerm_resource_group.aci-rg.name}"
  location            = "${azurerm_resource_group.aci-rg.location}"
  account_type        = "Standard_LRS"
}

resource "azurerm_storage_share" "aci-share" {
  name = "aci-test-share"

  resource_group_name  = "${azurerm_resource_group.aci-rg.name}"
  storage_account_name = "${azurerm_storage_account.aci-sa.name}"

  quota = 50
}

resource "azurerm_container_group" "aci-helloworld" {
  name                = "aci-hw"
  location            = "${azurerm_resource_group.aci-rg.location}"
  resource_group_name = "${azurerm_resource_group.aci-rg.name}"
  ip_address_type     = "public"
  os_type             = "linux"

  container {
    name = "hw"
    image = "seanmckenna/aci-hellofiles"
    cpu ="0.5"
    memory =  "1.5"
    port = "80"

    environment_variables {
        "NODE_ENV"="testing"
    }

    command = "/bin/bash -c '/path to/myscript.sh'"

    volume {
      name = "logs"
      mount_path = "/aci/logs"
      read_only = false
      share_name = "${azurerm_storage_share.aci-share.name}"
      storage_account_name = "${azurerm_storage_account.aci-sa.name}"
      storage_account_key = "${azurerm_storage_account.aci-sa.primary_access_key}"
    }
  }

  container {
    name   = "sidecar"
    image  = "microsoft/aci-tutorial-sidecar"
    cpu    = "0.5"
    memory = "1.5"
  }

  tags {
    environment = "testing"
  }
}
```

__Example Credit__: [https://www.terraform.io/docs/providers/azurerm/r/container_group.html](https://www.terraform.io/docs/providers/azurerm/r/container_group.html)

Then in that same directory, we would run the following commands.

``` bash
terraform init
terraform plan
terraform apply
```

The init command downloads the required files and providers to needed for terraform to work. The plan command compiles the main.tf file and shows any errors in validating the script(s). The apply command executes the main.tf script against Azure.

Once we run apply on any of the [example scripts](https://www.terraform.io/docs/providers/azurerm/index.html) we should be able to go to the Azure Portal and see our resource group with resources in it.

The real magic comes in after you run apply once. Now any changes to the main.tf file will add and delete resources as needed to bring Azure up to sync with the main.tf file.
