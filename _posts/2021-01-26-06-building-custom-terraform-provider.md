---
layout: post
title:  "Building a Custom Terraform Provider"
date:   2021-01-26 16:37:00
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
1. [Where to Store Terraform Variables]({% post_url 2021-01-26-05-where-to-store-terraform-variables %})
1. Building a Custom Terraform Provider

## Building a Custom Terraform Provider

One bit of functionality I absolutely love about Terraform, especially when compared to ARM templates, is the capability to create custom providers and have it all use the same state file.

A lot of Azure functionality exists between a management plane and data plane. Essentially, the management plane is where you actually create the resource and set certain properties of that resource. The data plane is the actual service itself. For instance, with SQL Azure the server resource is managed via the management plane. The actual database tables and schema definition could be considered the data plane.

## Building Custom Providers

To build a custom terraform provider it requires the use of go and the go compiler. I personally used the Windows Subsystem for Linux to build my go application as it was easier to install go on Ubuntu in my perspective.

To install go and it's compiler I did it from source. Essentially I went to the golang download page <https://golang.org/dl/> grabbed the linux tar gz.

Then ran the following bash command

``` bash
wget https://golang.org/dl/go1.15.7.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.15.7.linux-amd64.tar.gz
```

I then added the following to my startup script

``` bash
export PATH=$PATH:/usr/local/go/bin
```

## Example Terraform Provider

We were working on a project that required the use of the [Custom Commands speech](https://speech.microsoft.com/customcommands) service. Inside the custom commands speech service they don't really have functionality in the [azure-sdk-for-go](https://github.com/Azure/azure-sdk-for-go) library yet.

So we built a custom provider that essentially would use the REST APIs for the custom commands service to build the custom commands model and publish it.

## This Provider will Deploy the Following

``` hcl
data "azurerm_subscription" "current" {
}

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

resource "azurerm_cognitive_account" "luis_prediction" {
    name                = var.luis_prediction_name
    location            = var.luis_prediction_location
    resource_group_name = azurerm_resource_group.rg.name
    kind                = "LUIS"
    sku_name            = var.luis_prediction_sku
}

resource "azurerm_cognitive_account" "luis_authoring" {
    name                = var.luis_authoring_name
    location            = var.luis_authoring_location
    resource_group_name = azurerm_resource_group.rg.name
    kind                = "LUIS.Authoring"
    sku_name            = var.luis_authoring_sku
}

resource "azurecc_custom_commands_project" "ccp" {
    name                                  = var.custom_commands_project_name
    location                              = azurerm_resource_group.rg.location
    custom_commands_speech_key            = azurerm_cognitive_account.speech.primary_access_key
    custom_commands_speech_luisa_id       = azurerm_cognitive_account.luis_authoring.id
    custom_commands_speech_luisa_key      = azurerm_cognitive_account.luis_authoring.primary_access_key
    custom_commands_speech_luisa_location = azurerm_cognitive_account.luis_authoring.location
    custom_commands_speech_luisp_id       = azurerm_cognitive_account.luis_prediction.id
    custom_commands_speech_luisp_key      = azurerm_cognitive_account.luis_prediction.primary_access_key
    custom_commands_speech_luisp_location = azurerm_cognitive_account.luis_prediction.location
}

resource "azurecc_custom_commands_skills" "ccs" {
    location                      = azurecc_custom_commands_project.ccp.location
    custom_commands_speech_key    = azurerm_cognitive_account.speech.primary_access_key
    custom_commands_speech_app_id = azurecc_custom_commands_project.ccp.app_id
    skills_file_path              = var.custom_commands_skills_file_path
    skills_file_md5               = filemd5(var.custom_commands_skills_file_path)
}

resource "azurecc_custom_commands_publish" "ccpub" {
    location                      = azurecc_custom_commands_skills.ccs.location
    custom_commands_speech_key    = azurerm_cognitive_account.speech.primary_access_key
    custom_commands_speech_app_id = azurecc_custom_commands_project.ccp.app_id
    skills_file_md5               = filemd5(var.custom_commands_skills_file_path)
}
```

> Notice the skills_file_md5, this is how Terraform knows that there's a change or not in the file contents is based on if the md5sum of the file changes.

## Anatomy of a Custom Provider

- main.go: Adds plugin service
- provider.go: Registers classes and resource maps (think commands like azurecc_custom_commands_project)
- web_service.go: A class to handle common web service calls
- custom_commands_project.go: Handles creating a custom commands project
- custom_commands_skills.go: Handles creating the skils file
- custom_commands_publish_skills.go: Handles publishing the custom commands skills

main.go - <https://github.com/jwendl/custom-commands-terraform-provider/blob/main/main.go>

``` go
package main

import (
	"github.com/hashicorp/terraform/plugin"
	"github.com/hashicorp/terraform/terraform"
)

func main() {
	plugin.Serve(&plugin.ServeOpts{
		ProviderFunc: func() terraform.ResourceProvider {
			return Provider()
		},
	})
}
```

> Notice here how it's pretty much just passing the options to the provider. In our case we didn't need those options so I left it out.

provider.go - <https://github.com/jwendl/custom-commands-terraform-provider/blob/main/provider.go>

``` go
package main

import (
	"github.com/hashicorp/terraform/helper/schema"
)

// Provider the main provider
func Provider() *schema.Provider {
	return &schema.Provider{
		ResourcesMap: map[string]*schema.Resource{
			"azurecc_custom_commands_project": customCommandsProject(),
			"azurecc_custom_commands_skills":  customCommandsSkills(),
			"azurecc_custom_commands_publish": customCommandsPublishSkills(),
		},
	}
}
```

> This registers the Terraform command "azurecc_custom_commands_project" with the class called customCommandsProjecT() which is located in the file custom_commands_project.go

## Calling a Web Service Protected by an Azure AD Token

The important section to look at here is how to obtain an Azure AD token from the Azure CLI. Remember earlier that I said that Terraform essentially only uses the Azure CLI to authenticate into Azure. Well if we need to call an Azure AD protected endpoint from go we can do the same inside Terraform. The important block of code is located below.

web_service.go - <https://github.com/jwendl/custom-commands-terraform-provider/blob/main/web_service.go>

``` go
	credentialOptions := azidentity.DefaultAzureCLICredentialOptions()
	tokenProvider, errorMessage := azidentity.NewAzureCLICredential(&credentialOptions)
	if errorMessage != nil {
		return emptyResponse, fmt.Errorf("An error happened getting instance of NewAzureCLICredential: %+v", errorMessage)
	}

	tokenRequestOptions := azcore.TokenRequestOptions{Scopes: []string{"https://management.core.windows.net/"}}
	accessToken, errorMessage := tokenProvider.GetToken(context.TODO(), tokenRequestOptions)
	if errorMessage != nil {
		return emptyResponse, fmt.Errorf("An error happened fetching access token: %+v", errorMessage)
	}

	request, errorMessage := http.NewRequest(method, basePath, bytes.NewBuffer(data))
	if errorMessage != nil {
		return emptyResponse, fmt.Errorf("An error happened with http.NewRequest: %+v", errorMessage)
	}
```

Essentially we are grabbing a token from the DefaultAzureCLICredentialOptions class and passing it to the NewAzureCLICredential call. Once we have that token then we can call out to the custom commands speech service and basically post the json files needed etc.

View Supporting GitHub Repository: <https://github.com/jwendl/custom-commands-terraform-provider>
