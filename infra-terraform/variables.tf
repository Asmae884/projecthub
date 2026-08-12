
variable "project_name" {
  description = "Nom du projet"
  type        = string
  default     = "projecthub"
}

variable "environment" {
  description = "Environnement de déploiement (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Région Azure pour le déploiement"
  type        = string
  default     =  "swedencentral"
}

variable "vnet_address_space" {
  description = "Espace d'adressage du VNet"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_frontend_cidr" {
  description = "CIDR du sous-réseau pour les App Services (délégation Microsoft.Web/serverFarms)"
  type        = string
  default     = "10.0.1.0/24"
}

variable "subnet_backend_cidr" {
  description = "CIDR du sous-réseau pour les App Services (délégation Microsoft.Web/serverFarms)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "subnet_mysql_cidr" {
  description = "CIDR du sous-réseau pour MySQL Flexible Server (délégation Microsoft.DBforMySQL/flexibleServers)"
  type        = string
  default     = "10.0.3.0/24"
}

variable "subnet_appgw_cidr" {
  description = "CIDR du sous-réseau pour l'Application Gateway (sans délégation)"
  type        = string
  default     = "10.0.4.0/24"
}

# === Variables Application Gateway ===
variable "appgw_sku" {
  description = "SKU de l'Application Gateway"
  type        = string
  default     = "WAF_v2"
}

variable "appgw_tier" {
  description = "Tier de l'Application Gateway"
  type        = string
  default     = "WAF_v2"
}

# === Variables App Service ===
variable "app_service_plan_sku" {
  description = "SKU du plan App Service"
  type        = string
  default     = "B1"
}

variable "app_service_plan_tier" {
  description = "Tier du plan App Service"
  type        = string
  default     = "Basic"
}

# === Variables ACR ===
variable "acr_sku" {
  description = "SKU de l'Azure Container Registry"
  type        = string
  default     = "Basic"
}

# === Variables MySQL ===
variable "mysql_server_name" {
  description = "Nom du serveur MySQL Flexible"
  type        = string
  default     = "projecthub-mysql"
}

variable "mysql_admin_username" {
  description = "Nom d'utilisateur admin MySQL"
  type        = string
  default     = "projecthubadmin"
}

variable "mysql_admin_password" {
  description = "Mot de passe admin MySQL"
  type        = string
  sensitive   = true
}

variable "mysql_sku_name" {
  description = "SKU du serveur MySQL Flexible"
  type        = string
  default     =  "B_Standard_B1ms"
}

variable "mysql_storage_size" {
  description = "Taille du stockage MySQL en Go"
  type        = number
  default     = 32
}

# === Variables Key Vault ===
variable "key_vault_soft_delete_retention_days" {
  description = "Nombre de jours de rétention pour la suppression soft du Key Vault"
  type        = number
  default     = 7
}

# === Variables images Docker ===
variable "backend_image_tag" {
  description = "Tag de l'image Docker du backend"
  type        = string
  default     = "latest"
}

variable "frontend_image_tag" {
  description = "Tag de l'image Docker du frontend"
  type        = string
  default     = "latest"
}

# === Variables Laravel ===
variable "laravel_app_key" {
  description = "Clé de l'application Laravel (APP_KEY)"
  type        = string
  sensitive   = true
}

# === Variables Azure (pour l'authentification) ===
variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
  sensitive   = true
}

variable "client_id" {
  description = "Azure Client ID (Service Principal)"
  type        = string
  sensitive   = true
}

variable "client_secret" {
  description = "Azure Client Secret"
  type        = string
  sensitive   = true
}

variable "tenant_id" {
  description = "Azure Tenant ID"
  type        = string
  sensitive   = true
}

variable "sentinel_retention_days"{
   type        = number
   default     = 30
}



variable "rag_image_tag" {
  description = "Tag de l'image Docker du microservice RAG"
  type        = string
  default     = "latest"
}

variable "azure_openai_sku" {
  description = "SKU pour Azure OpenAI"
  type        = string
  default     = "S0"
}

variable "azure_openai_deployment_name" {
  description = "Nom du déploiement GPT"
  type        = string
  default     = "gpt-5-mini"
}



