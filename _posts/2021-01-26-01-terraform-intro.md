---
layout: post
title:  "An Introduction to Terraform for Azure"
date:   2021-01-26 12:37:00
categories:
 - Terraform
tags:
 - terraform
 - azure
---
This is a multi-part series:
1. Introduction to Terraform
1. [Azure Resource Provider]({% post_url 2021-01-26-02-azure-resource-provider %})
1. [Azure Example without Modules]({% post_url 2021-01-26-03-azure-example-without-modules %})
1. [Azure Example with Modules]({% post_url 2021-01-26-04-azure-example-with-modules %})
1. [Where to Store Terraform Variables]({% post_url 2021-01-26-05-where-to-store-terraform-variables %})
1. [Building a Custom Terraform Provider]({% post_url 2021-01-26-06-building-custom-terraform-provider %})

In the past several projects I've grown very fond of utilizing [Terraform](https://www.terraform.io/) to deploy Azure resources for the applications I've built. This is usually because Terraform does a good job of supporting [Infrastructure as Code](https://en.wikipedia.org/wiki/Infrastructure_as_code), being modular with [modules](https://www.terraform.io/docs/language/modules/develop/index.html) and the ability to be extensible by creating your own custom providers.

## Why Terraform and not ARM

Before two years ago, ARM (Azure Resource Manager) templates were my "goto". That is to say if I needed Azure resources, I would deploy them using these ARM templates and setup my environment with it. 

After deploying several projects with ARM templates I started to realize a trend and some shortcomings with ARM. For instance, no one wants to manage a 10,000 line json file that has no organization or structure to it. Yes you can do child templates, but you have to store those on a storage account for the Azure resource to get the child files (mainly because ARM was built to be 1 json deployment file and 1 parameters file).

Another difficulty for ARM templates is that the documentation is lacking for ARM templates. It's tough to tell what each of the properties require and what resources require which property for a specific version of a specific api for that resource. It's pretty low level - there's a reason why people don't build desktop applications using Assembler anymore. 

The third complexity with ARM templates is that there is no extensibility. If something isn't possible to set via ARM, then you have to resort to shell scripting to augment that functionality.

## Introduction to the HashiCorp Configuration Language

There are two basic files required for Terraform to function. The main.tf (or any *.tf) and the variables.tf. While these can all go inside 1 file definition if you wanted to (main.tf per say). The recommendation is to separate things out to individual files so that it's easier to maintain them. For instance, variables, outputs, providers and the actual terraform definition.

HashiCorp Configuration Language is a mix of json and declarative property statements. For instance, a variable can be defined similar to:

``` hcl
variable "resource_group_name" {
    description = "The resource group name"
}
```

The first part is what type of value it is, in this case it's a variable. The text inside the quotes is a unique identifier or variable name and what's inside the body of this variable is a set of properties (description in this case) that the variable supports.

A more complex example of this language is an example template here for Speech Services.

``` hcl
resource "azurerm_resource_group" "rg" {
    name     = var.resource_group_name
    location = var.resource_group_location
}

resource "azurerm_cognitive_account" "speech" {
    name                = var.custom_speech_account_name
    location            = azurerm_resource_group.rg.location
    resource_group_name = azurerm_resource_group.rg.name
    kind                = "SpeechServices"
    sku_name            = var.custom_speech_account_sku
}
```

Embedded properties can also be supported similar to the following.

``` hcl
resource "azurerm_key_vault" "kv" {
    name                        = var.key_vault_name
    resource_group_name         = var.key_vault_resource_group_name
    location                    = var.key_vault_location
    tenant_id                   = var.key_vault_tenant_id
    enabled_for_disk_encryption = true

    sku_name = var.sku_name

    network_acls {
        default_action = "Allow"
        bypass         = "AzureServices"
    }
}
```

Where the network_acls is a property of azurerm_key_vault and is an object type instead of a string.

Additionally, the resource objects have two string values, the first being the "provider module" you want to use, and the second is a unique variable name that you'd like to give that particular resource.

## Installing Terraform

This depends on the system, but here I will show using Windows with Ubuntu 20.04 on WSL

The following commands will install Terraform for your shell.

``` bash
wget https://releases.hashicorp.com/terraform/0.14.5/terraform_0.14.5_linux_amd64.zip -O terraform.zip
unzip terraform.zip
sudo cp terraform /usr/local/bin
terraform -version
```

This should show you the version of terraform you are running.

``` bash
❯ terraform -version
Terraform v0.14.5
```

Continue Reading: [Azure Resource Provider]({% post_url 2021-01-26-02-azure-resource-provider %})

View Supporting GitHub Repository: <https://github.com/jwendl/terraform-modules-example>
