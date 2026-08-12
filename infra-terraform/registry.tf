
resource "azurerm_container_registry" "main" {
  name                = "${var.project_name}${var.environment}acr2026"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}