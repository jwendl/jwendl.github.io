---
layout: post
title:  "Azure Example with Modules for Terraform"
date:   2021-01-26 14:37:00
categories:
 - Terraform
tags:
 - terraform
 - azure
---
This is a multi-part series:
1. [Introduction to Terraform]({% post_url 2021-01-26-01-terraform-intro %})
1. [Azure Resource Provider]({% post_url 2021-01-26-02-azure-resource-provider %})
1. [Azure Example without Modules]({% post_url 2021-01-26-03-azure-example-without-modules %})
1. Azure Example with Modules
1. [Where to Store Terraform Variables]({% post_url 2021-01-26-05-where-to-store-terraform-variables %})
1. [Building a Custom Terraform Provider]({% post_url 2021-01-26-06-building-custom-terraform-provider %})

## Azure Example with Modules

When using Terraform modules, each part of your application can be isolated into an individual module. In our example, the following folder structure was used.

![Terraform Module Structure](/images/posts/TerraformModuleStructure.png)

So the individual sections of your application are split into sub folders and it makes it much more manageable to maintain.

In our case for the azure-monitor module, we have the following code.

modules/azure-monitor/main.tf

``` hcl
resource "azurerm_log_analytics_workspace" "monitor" {
    name                = var.monitor_name
    resource_group_name = var.mon_resource_group_name
    location            = var.mon_resource_group_location
    sku                 = "PerGB2018"
}

resource "azurerm_log_analytics_solution" "ci" {
    solution_name         = "ContainerInsights"
    resource_group_name   = azurerm_log_analytics_workspace.monitor.resource_group_name
    location              = azurerm_log_analytics_workspace.monitor.location
    workspace_resource_id = azurerm_log_analytics_workspace.monitor.id
    workspace_name        = azurerm_log_analytics_workspace.monitor.name

    plan {
        publisher = "Microsoft"
        product   = "OMSGallery/ContainerInsights"
    }
}

resource "azurerm_application_insights" "ai" {
    name                  = var.azurerm_application_insights_name
    resource_group_name   = azurerm_log_analytics_workspace.monitor.resource_group_name
    location              = azurerm_log_analytics_workspace.monitor.location
    application_type      = "web"
}

resource "azurerm_key_vault_secret" "akvsai" {
    name         = "ai-key"
    value        = azurerm_application_insights.ai.instrumentation_key
    key_vault_id = var.key_vault_id
}
```

And the section in our main.tf at the root level would look something like this.

main.tf

``` hcl
module "azure_monitor" {
    source                            = "./modules/azure-monitor"
    monitor_name                      = "${var.resource_prefix}amo${var.resource_postfix}"
    azurerm_application_insights_name = "${var.resource_prefix}aai${var.resource_postfix}"
    mon_resource_group_name           = module.resource_group.resource_group_name
    mon_resource_group_location       = module.resource_group.resource_group_location
    key_vault_id                      = module.key_vault.key_vault_id
}
```

Notice in our example here where we would previously reference the resource group name by using ``` azurerm_resource_group.rg.name ``` <https://github.com/jwendl/terraform-modules-example/blob/main/without/main.tf#L46>

We now have to reference it using ``` module.resource_group.resource_group_name ```.

This is enabled because in our resource-group folder we have a file called outputs.tf which contains the following code block.

modules/resource-group/outputs.tf

``` hcl
output "resource_group_name" {
    value = azurerm_resource_group.rg.name
}
```

## Handling Dependencies

When using modules with Terraform we have to be careful of how dependencies are being built. If something is referenced as a variable value it will not "wait" for that reference to exist in Azure. This is why it's strongly encouraged to use output variables for every module, so the consumer of your module can reference it and build the dependency graph.

There are situations - or bugs if you will - where Terraform doesn't automatically build out the dependency even though you are referencing the module output. It will give an error message about the resource not existing in the resource provider. 

If this happens then on the module object we can just add a depends_on property and point to the module itself and that usually resolves it in most cases. If it does not, then file a bug with the Azure Terraform provider.

Continue Reading: [Where to Store Terraform Variables]({% post_url 2021-01-26-05-where-to-store-terraform-variables %})

View Supporting GitHub Repository: <https://github.com/jwendl/terraform-modules-example/tree/main/with>
