terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstatestorageproj"  
    container_name       = "tfstate"
    key                  = "projecthub-prod.tfstate"
  }
}