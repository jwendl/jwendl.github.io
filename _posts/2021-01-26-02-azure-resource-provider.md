---
layout: post
title:  "Deeper into the Azure Resource Provider"
date:   2021-01-26 13:37:00
categories:
 - Terraform
tags:
 - terraform
 - azure
---
This is a multi-part series:
1. [Introduction to Terraform]({% post_url 2021-01-26-01-terraform-intro %})
1. Azure Resource Provider
1. [Azure Example without Modules]({% post_url 2021-01-26-03-azure-example-without-modules %})
1. [Azure Example with Modules]({% post_url 2021-01-26-04-azure-example-with-modules %})
1. [Where to Store Terraform Variables]({% post_url 2021-01-26-05-where-to-store-terraform-variables %})
1. [Building a Custom Terraform Provider]({% post_url 2021-01-26-06-building-custom-terraform-provider %})

## Azure Resource Provider

Deploying Terraform templates is done through the Terraform core module, but the core itself doesn't deploy to any of the clouds. Each cloud has it's own custom provider (for instance the [Azure Terraform Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)) which handles the actual commands to deploy resources to the cloud.

Each Azure provider is defined by a module name starting with azurerm. For instance azurerm_resource_group etc. So it's pretty easy to look for documentation because searching for azurerm_resource_group is unique enough to direct you to this page as the first result <https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/resource_group>.

If you want to know more about the provider checkout their [GitHub repository](https://github.com/terraform-providers/terraform-provider-azurerm)

## Relationship between Terraform and Azure CLI

The Azure Terraform provider utilizes the Azure CLI to handle the authentication locally of your terraform connection. So essentially, it grabs the same authentication metchanism that Azure CLI does (usually device code authentication). 

The Azure Terraform provider does not run it's commands through the Azure CLI. That is to say it doesn't "fork" out Azure CLI commands based on the HCL definitions. It instead uses the same SDK that the Azure CLI uses (the golang SDK - <https://github.com/Azure/azure-sdk-for-go>). So for the Azure Terraform provider to support functionality it has to be built into the go SDK first.

That doesn't mean you as a developer couldn't write your own custom module to call pure REST services - see the below section titled "" for more details.

## How to Run Terraform Templates

Once you have a main.tf, provider.tf and variables.tf defined, running Terraform can be broken down into 3 steps.

**Run terraform init**

``` bash
terraform init
```

**Run terraform plan**

> This step is useful so you can see the changes that terraform wants to perform and it gives you opportunity to make changes. This helps reduce the inner development loop as you don't have to wait for the deployment to happen to make a change.

``` bash
terraform plan -out tf.plan -var-file variables.tfvars
```

> The -out parameter helps set an output file so the terraform apply step doesn't have to re-run the plan step. The -var-file will be discussed in the section below named "Recommendations around TF VARS file vs. ENV

The output of a plan file will look something like the following.

``` bash
❯ terraform plan -out tf.plan -var-file variables.tfvars

An execution plan has been generated and is shown below.
Resource actions are indicated with the following symbols:
  + create

Terraform will perform the following actions:

  # azurecc_custom_commands_project.ccp will be created
  + resource "azurecc_custom_commands_project" "ccp" {
      + app_id                                = (known after apply)
      + custom_commands_speech_key            = (known after apply)
      + custom_commands_speech_luisa_id       = (known after apply)
      + custom_commands_speech_luisa_key      = (known after apply)
      + custom_commands_speech_luisa_location = "westus"
      + custom_commands_speech_luisp_id       = (known after apply)
      + custom_commands_speech_luisp_key      = (known after apply)
      + custom_commands_speech_luisp_location = "westus"
      + id                                    = (known after apply)
      + location                              = "westus2"
      + name                                  = "jwtestspeechccp"
    }

  # azurecc_custom_commands_publish.ccpub will be created
  + resource "azurecc_custom_commands_publish" "ccpub" {
      + custom_commands_speech_app_id = (known after apply)
      + custom_commands_speech_key    = (known after apply)
      + id                            = (known after apply)
      + location                      = "westus2"
      + skills_file_md5               = "d17c0b072de30e5661bbf0e0c73114fc"
    }

  # azurecc_custom_commands_skills.ccs will be created
  + resource "azurecc_custom_commands_skills" "ccs" {
      + custom_commands_speech_app_id = (known after apply)
      + custom_commands_speech_key    = (known after apply)
      + id                            = (known after apply)
      + location                      = "westus2"
      + skills_file_md5               = "d17c0b072de30e5661bbf0e0c73114fc"
      + skills_file_path              = "example.json"
    }

  # azurerm_cognitive_account.luis_authoring will be created
  + resource "azurerm_cognitive_account" "luis_authoring" {
      + endpoint             = (known after apply)
      + id                   = (known after apply)
      + kind                 = "LUIS.Authoring"
      + location             = "westus"
      + name                 = "jwluisa"
      + primary_access_key   = (sensitive value)
      + resource_group_name  = "TestGroup"
      + secondary_access_key = (sensitive value)
      + sku_name             = "F0"
    }

  # azurerm_cognitive_account.luis_prediction will be created
  + resource "azurerm_cognitive_account" "luis_prediction" {
      + endpoint             = (known after apply)
      + id                   = (known after apply)
      + kind                 = "LUIS"
      + location             = "westus"
      + name                 = "jwluisp"
      + primary_access_key   = (sensitive value)
      + resource_group_name  = "TestGroup"
      + secondary_access_key = (sensitive value)
      + sku_name             = "S0"
    }

  # azurerm_cognitive_account.speech will be created
  + resource "azurerm_cognitive_account" "speech" {
      + endpoint             = (known after apply)
      + id                   = (known after apply)
      + kind                 = "SpeechServices"
      + location             = "westus2"
      + name                 = "jwtestspeech"
      + primary_access_key   = (sensitive value)
      + resource_group_name  = "TestGroup"
      + secondary_access_key = (sensitive value)
      + sku_name             = "S0"
    }

  # azurerm_resource_group.rg will be created
  + resource "azurerm_resource_group" "rg" {
      + id       = (known after apply)
      + location = "westus2"
      + name     = "TestGroup"
    }

Plan: 7 to add, 0 to change, 0 to destroy.

------------------------------------------------------------------------

This plan was saved to: tf.plan

To perform exactly these actions, run the following command to apply:
    terraform apply "tf.plan"
```

This output is really helpful to understand what the Azure Terraform provider plans to do when you run apply. Notice all of the (known after apply) values because Terraform doesn't have that value in a state file (locally) and it doesn't exist in the cloud (Azure) so it knows it has to create that resource.

**Run terraform apply**

``` bash
terraform apply tf.plan
```

## Handling Dependencies

Terraform handles the dependency graph all on it's own. So in our example above here, everything depends on the Resource Group resource existing before it can be created (like the function app and sql etc). Because of this when we reference the resource group as a variable (azurerm_resource_group.rg) it builds that dependency for us and we don't have to manage which resource gets created first.

Continue Reading: [Azure Example without Modules]({% post_url 2021-01-26-03-azure-example-without-modules %})
