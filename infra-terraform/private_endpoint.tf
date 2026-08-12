resource "azurerm_private_dns_zone" "storage"{
	name="privatelink.blob.core.windows.net"
	resource_group_name=azurerm_resource_group.main.name
}


resource "azurerm_private_dns_zone_virtual_network_link" "storage" {
	name="${var.project_name}-storage-dns-link"
	resource_group_name=azurerm_resource_group.main.name
	private_dns_zone_name=azurerm_private_dns_zone.storage.name
       virtual_network_id    = azurerm_virtual_network.main.id
	
	depends_on=[azurerm_private_dns_zone.storage]
}


resource "azurerm_private_endpoint" "storage" {
	name="${var.project_name}-${var.environment}-storage-pe"
	location=azurerm_resource_group.main.location
	resource_group_name=azurerm_resource_group.main.name
	subnet_id=azurerm_subnet.private_endpoint.id
	
	private_service_connection{
		name="storage-connection"
	        private_connection_resource_id=azurerm_storage_account.documents.id
		is_manual_connection=false
		subresource_names=["blob"]
		}
	private_dns_zone_group {
		name="storage-dns-zone-group"
	        private_dns_zone_ids=[azurerm_private_dns_zone.storage.id]
	}
}


resource "azurerm_private_endpoint" "openai" {
	name="${var.project_name}-${var.environment}-openai-pe"
	location=azurerm_resource_group.main.location
	resource_group_name=azurerm_resource_group.main.name
	subnet_id=azurerm_subnet.private_endpoint.id

	private_service_connection{
		name="openai-connection"
		private_connection_resource_id=azurerm_cognitive_account.openai.id
		is_manual_connection=false
		subresource_names=["account"]
}
	private_dns_zone_group {
		name="openai-dns-zone-group"
		private_dns_zone_ids=[azurerm_private_dns_zone.openai.id]
}
	depends_on=[azurerm_cognitive_account.openai]
}

resource "azurerm_private_dns_zone" "openai" {
	name="privatelink.openai.azure.com"
	resource_group_name=azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "openai"{
	name="${var.project_name}-openai-dns-link"
	resource_group_name=azurerm_resource_group.main.name
	private_dns_zone_name=azurerm_private_dns_zone.openai.name
	virtual_network_id=azurerm_virtual_network.main.id
}



resource "azurerm_private_dns_zone" "internal" {
  name                = "internal.azure.com"
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_a_record" "rag" {
  name                = "rag"
  zone_name           = azurerm_private_dns_zone.internal.name
  resource_group_name = azurerm_resource_group.main.name
  ttl                 = 300
  records             = [azurerm_container_group.rag.ip_address]
}

resource "azurerm_private_dns_zone_virtual_network_link" "internal" {
  name                  = "${var.project_name}-internal-dns-link"
  resource_group_name   = azurerm_resource_group.main.name
  private_dns_zone_name = azurerm_private_dns_zone.internal.name
  virtual_network_id    = azurerm_virtual_network.main.id
}
