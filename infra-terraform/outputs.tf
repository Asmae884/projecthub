
output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Nom du Resource Group"
}

output "app_gateway_public_ip" {
  value       = azurerm_public_ip.appgw.ip_address
  description = "Adresse IP publique de l'Application Gateway"
}

output "app_gateway_url" {
  value       = "http://${azurerm_public_ip.appgw.ip_address}"
  description = "URL d'accès à l'application via l'Application Gateway"
}

output "backend_app_service_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "URL du backend (appel direct - à éviter en prod)"
}

output "frontend_app_service_url" {
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
  description = "URL du frontend (appel direct - à éviter en prod)"
}

output "acr_login_server" {
  value       = azurerm_container_registry.main.login_server
  description = "Serveur de connexion ACR"
}

output "acr_admin_username" {
  value       = azurerm_container_registry.main.admin_username
  sensitive   = true
  description = "Nom d'utilisateur admin ACR"
}

output "mysql_fqdn" {
  value       = azurerm_mysql_flexible_server.main.fqdn
  description = "FQDN du serveur MySQL"
}

output "key_vault_uri" {
  value       = azurerm_key_vault.main.vault_uri
  description = "URI du Key Vault"
}



output "storage_account_name" {
  value = azurerm_storage_account.documents.name
}

output "openai_endpoint" {
  value = azurerm_cognitive_account.openai.endpoint
}

output "aci_private_ip" {
  value = azurerm_container_group.rag.ip_address
}



