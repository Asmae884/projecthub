resource "azurerm_role_assignment" "backend_storage" {
	principal_id=azurerm_linux_web_app.backend.identity[0].principal_id
	role_definition_name="Storage Blob Data Contributor"
	scope=azurerm_storage_account.documents.id
}

resource "azurerm_role_assignment" "aci_storage" {
	principal_id=azurerm_container_group.rag.identity[0].principal_id
	role_definition_name="Storage Blob Data Reader"
	scope=azurerm_storage_account.documents.id
}

