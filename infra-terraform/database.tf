
resource "azurerm_mysql_flexible_server" "main" {
  name                   = "${var.project_name}-${var.environment}-mysql"
  location               = azurerm_resource_group.main.location
  resource_group_name    = azurerm_resource_group.main.name

  administrator_login    = var.mysql_admin_username
  administrator_password = var.mysql_admin_password
  #administrator_password = "Azerty123456..0"

  sku_name   = var.mysql_sku_name
  storage {
    size_gb = var.mysql_storage_size
  }

  version = "8.0.21"

  delegated_subnet_id = azurerm_subnet.mysql.id
  private_dns_zone_id = azurerm_private_dns_zone.mysql.id

  depends_on = [
    azurerm_private_dns_zone_virtual_network_link.mysql
  ]

  backup_retention_days = 7
  geo_redundant_backup_enabled = false

  lifecycle {
    ignore_changes = [maintenance_window , zone]
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }


}

resource "azurerm_mysql_flexible_server_configuration" "require_secure_transport" {
  name                = "require_secure_transport"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  value               = "OFF"  
}


resource "azurerm_mysql_flexible_database" "app" {
  name                = "projecthub"
  resource_group_name = azurerm_resource_group.main.name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8mb4"
  collation           = "utf8mb4_unicode_ci"
}