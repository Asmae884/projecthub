
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-${var.environment}-asp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

locals {
  acr_login_server   = azurerm_container_registry.main.login_server
  acr_admin_username = azurerm_container_registry.main.admin_username
  acr_admin_password = azurerm_container_registry.main.admin_password
}

locals {
  backend_name  = "${var.project_name}-${var.environment}-backend"
  frontend_name = "${var.project_name}-${var.environment}-frontend"
}


resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-${var.environment}-backend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  identity {
    type = "SystemAssigned"
  }



  site_config {
    application_stack {
      docker_image_name   = "backend:${var.backend_image_tag}"
      docker_registry_url = "https://${local.acr_login_server}"
      docker_registry_username = local.acr_admin_username
      docker_registry_password = local.acr_admin_password
    }

    health_check_path = "/api/health"
    always_on = true

    ip_restriction {
     virtual_network_subnet_id = azurerm_subnet.appgw.id      
      name       = "AllowAppGateway"
      priority   = 100
      action     = "Allow"
    }

    ip_restriction {
      ip_address = "0.0.0.0/0"
      name       = "DenyAll"
      priority   = 200
      action     = "Deny"
    }
  }

  app_settings = {
    APP_ENV         = var.environment
    APP_DEBUG       = "false"
    APP_URL         = "https://${local.backend_name}.azurewebsites.net"
    APP_KEY         = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.laravel_app_key.id})"

    RAG_SERVICE_URL = "http://rag.internal.azure.com:8001"

    DB_CONNECTION   = "mysql"
    DB_HOST         = azurerm_mysql_flexible_server.main.fqdn
    DB_PORT         = "3306"
    DB_DATABASE     = "projecthub"
    DB_USERNAME     = var.mysql_admin_username
    DB_PASSWORD     = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.mysql_password.id})"
    DB_SSL          = "false"

    CORS_ALLOWED_ORIGINS = "https://${azurerm_linux_web_app.frontend.name}.azurewebsites.net"
    
    SANCTUM_STATEFUL_DOMAINS = "${azurerm_linux_web_app.frontend.name}.azurewebsites.net"
    SESSION_DOMAIN          = "${azurerm_linux_web_app.frontend.name}.azurewebsites.net"

    LOG_CHANNEL     = "stderr"
    LOG_LEVEL       = "warning"
    CACHE_DRIVER    = "file"
    SESSION_DRIVER  = "file"
    QUEUE_CONNECTION     = "sync"

    AZURE_STORAGE_ACCOUNT            = azurerm_storage_account.documents.name
    AZURE_STORAGE_CONTAINER          = "documents"
    AZURE_STORAGE_CONNECTION_STRING  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.storage_connection_string.id})"

  }

  virtual_network_subnet_id = azurerm_subnet.backend.id

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Component   = "Backend"
  }

}


resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-${var.environment}-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      docker_image_name   = "frontend:${var.frontend_image_tag}"
      docker_registry_url = "https://${local.acr_login_server}"
      docker_registry_username = local.acr_admin_username
      docker_registry_password = local.acr_admin_password
    }

    health_check_path = "/"
    always_on = true

    ip_restriction {
      virtual_network_subnet_id = azurerm_subnet.appgw.id
      name       = "AllowAppGateway"
      priority   = 100
      action     = "Allow"
    }

    ip_restriction {
      ip_address = "0.0.0.0/0"
      name       = "DenyAll"
      priority   = 200
      action     = "Deny"
    }
  }

  app_settings = {
    #REACT_APP_API_URL = "/api"
    NODE_ENV          = var.environment
    PORT              = "80"
    HOST              = "0.0.0.0"
  }


  virtual_network_subnet_id = azurerm_subnet.frontend.id

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Component   = "Frontend"
  }
}


