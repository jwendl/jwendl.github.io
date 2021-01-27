---
layout: post
title:  "Where to Store Terraform Variables"
date:   2021-01-26 15:37:00
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
1. [Azure Example with Modules]({% post_url 2021-01-26-04-azure-example-with-modules %})
1. Where to Store Terraform Variables
1. [Building a Custom Terraform Provider]({% post_url 2021-01-26-06-building-custom-terraform-provider %})

## Where to Store Terraform Variables

There are honestly too many ways to hold variables in Terraform. One can store variables using tfvars files. One can also set an environment variable with the prefix TF_VAR_ and it will also be picked up. Additionally, we can pass it into the terraform command line using the -var argument.

One recommendation I have on previous experience is to auto generate as much as possible variable wise. 

So that is to say, instead of passing in "name" for every single resource, using a prefix + abbreviation + postfix instead. So that way instead of one variable per resource you have 2 variables.

Another thing to do, instead of passing in subscription id or tenant id, those can be accessed using a data resource tag like the following two examples.

``` hcl
data "azurerm_subscription" "current" {
}
```

> This one gets the current subscription information like tenant id and subscription id.

``` hcl
data "azurerm_client_config" "current" {
}
```

> This one gets the current account (similar to az account show) information.

## Number of Variables

Make it a goal to have as few of variables as absolutely needed. This will definitely help with managing several different environments and keeps things consistent inside your repositories and deployment pipelines.

## Handling Dev / QA / Prod

One method we found very successful was creating a tfvars file per environment inside source control. It gives the added benefits of requiring a pull request and review of any changes and allows for you to just set a variable called "environment" in terraform.

For instance, we could have environment.dev.tfvars, environment.qa.tfvars and enviornment.prod.tfvars in source control. Do not put secrets here obviously those should be in Azure Key Vault. But then running a specific environment is really just choosing which tfvars file to use with the -var-file flag.

Inside Azure Pipelines we can also select which environment we are running rather than filling in every single variable and providing an opportunity for input errors during deployment.

``` yaml
parameters:
  - name: Environment
    displayName: "Environment variables file to use"
    type: string
    default: "dev"
    values: 
      - "dev"
      - "test"
      - "non-prod"
```

## Managing Secrets

Never put a secret in a flat file!

In fact try to auto generate secrets as much as possible and put them into Azure KeyVault using Terraform. Similar to this example below.

``` hcl
resource "random_password" "admin_password" {
    length = 16
    special = true
    override_special = "_%@"
}

resource "azurerm_key_vault_secret" "akvs" {
    name         = "sql-admin-password"
    value        = random_password.admin_password.result
    key_vault_id = var.key_vault_id
}

resource "azurerm_sql_server" "sql_server" {
...
    administrator_login_password = azurerm_key_vault_secret.akvs.value
}
```

Continue Reading: [Building a Custom Terraform Provider]({% post_url 2021-01-26-06-building-custom-terraform-provider %})
