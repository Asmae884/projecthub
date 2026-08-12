resource "azurerm_storage_account" "documents" {
	name= "${var.project_name}${var.environment}docs"
	resource_group_name=azurerm_resource_group.main.name
	location=azurerm_resource_group.main.location
	account_tier="Standard"
	account_replication_type="LRS"
	min_tls_version="TLS1_2"
	shared_access_key_enabled=true
	identity{
		type="SystemAssigned"
}
	tags={
		Environment=var.environment
		Project=var.project_name
		Service="Documents"
	}
}

resource "azurerm_storage_container" "documents" {
	name="documents"
	storage_account_name=azurerm_storage_account.documents.name
	container_access_type="private"	

	}
#resource "azurerm_storage_account_network_rules" "documents" {
#	storage_account_id= azurerm_storage_account.documents.id
#	default_action="Deny"
#	virtual_network_subnet_ids=[
#		azurerm_subnet.backend.id,
#		azurerm_subnet.aci.id,
#		azurerm_subnet.private_endpoint.id,
#	]
#	bypass=["AzureServices"]
#}

data "azurerm_storage_account" "documents_data"{
	name=azurerm_storage_account.documents.name
	resource_group_name=azurerm_resource_group.main.name
}



