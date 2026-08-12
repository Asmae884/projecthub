
resource "azurerm_key_vault" "main" {
  name                       = "${var.project_name}-${var.environment}-kv"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = var.key_vault_soft_delete_retention_days


  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "azurerm_key_vault_secret" "mysql_password" {
  name         = "mysql-password"
  value        = var.mysql_admin_password
  key_vault_id = azurerm_key_vault.main.id
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "azurerm_key_vault_secret" "laravel_app_key" {
  name         = "laravel-app-key"
  value        = var.laravel_app_key
  key_vault_id = azurerm_key_vault.main.id
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}


resource "azurerm_key_vault_access_policy" "backend_access" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.backend.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_key_vault_access_policy" "terraform_deployer" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id
  secret_permissions = [
    "Get", "List", "Set", "Delete", "Recover", "Restore"
  ]
}


resource "null_resource" "restart_backend_after_kv_policy" {
  triggers = {
    backend_identity = azurerm_linux_web_app.backend.identity[0].principal_id
    policy_id         = azurerm_key_vault_access_policy.backend_access.id
  }

  depends_on = [
    azurerm_linux_web_app.backend,
    azurerm_key_vault_access_policy.backend_access
  ]

  provisioner "local-exec" {
    command = "az webapp restart --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_linux_web_app.backend.name}"
  }
}



resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.documents.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "azurerm_key_vault_secret" "storage_key" {
  name         = "storage-key"
  value        = azurerm_storage_account.documents.primary_access_key
  key_vault_id = azurerm_key_vault.main.id
}

#  Secrets pour Azure OpenAI
resource "azurerm_key_vault_secret" "openai_key" {
  name         = "openai-key"
  value        = azurerm_cognitive_account.openai.primary_access_key
  key_vault_id = azurerm_key_vault.main.id

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "azurerm_key_vault_secret" "openai_endpoint" {
  name         = "openai-endpoint"
  value        = azurerm_cognitive_account.openai.endpoint
  key_vault_id = azurerm_key_vault.main.id
}