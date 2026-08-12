
locals {
	rag_image_name="${azurerm_container_registry.main.login_server}/rag:${var.rag_image_tag}"
}
resource "azurerm_container_group" "rag" {
	name="${var.project_name}-${var.environment}-rag"
	location=azurerm_resource_group.main.location
	resource_group_name=azurerm_resource_group.main.name
	os_type="Linux"
	subnet_ids=[azurerm_subnet.aci.id]
	ip_address_type="Private"
	
	depends_on=[azurerm_subnet.aci]
	image_registry_credential {
    	 server   = azurerm_container_registry.main.login_server
         username = azurerm_container_registry.main.admin_username
         password = azurerm_container_registry.main.admin_password
  }


	container{
		name= "rag"
		image=local.rag_image_name
		cpu="2.0"
		memory="4.0"
	ports {
		port=8001
		protocol="TCP"
	}
	environment_variables ={
	 AZURE_OPENAI_ENDPOINT=azurerm_cognitive_account.openai.endpoint
	 AZURE_OPENAI_API_VERSION="2024-02-15-preview"
	 AZURE_OPENAI_DEPLOYMENT=var.azure_openai_deployment_name
	 AZURE_OPENAI_EMBEDDING_DEPLOYMENT="text-embedding-ada-002"
	 CHROMA_PERSIST_DIR="/app/chroma_db"
	 STORAGE_ACCOUNT_NAME=azurerm_storage_account.documents.name
	 STORAGE_CONTAINER_NAME=azurerm_storage_container.documents.name
}
	secure_environment_variables={
	AZURE_OPENAI_KEY=azurerm_key_vault_secret.openai_key.value
	STORAGE_ACCOUNT_KEY=azurerm_key_vault_secret.storage_key.value
        STORAGE_CONNECTION_STRING = azurerm_key_vault_secret.storage_connection_string.value

}
}
	restart_policy="Never"
	identity {
		type="SystemAssigned"
	}
	tags={
		Environment=var.environment
		Project=var.project_name
		Service="RAG"
	}
}

resource "azurerm_key_vault_access_policy" "aci"{
	key_vault_id=azurerm_key_vault.main.id
	tenant_id=data.azurerm_client_config.current.tenant_id
	object_id=azurerm_container_group.rag.identity[0].principal_id
	
	secret_permissions=[
		"Get",
		"List"
	]
	}

