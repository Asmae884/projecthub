
resource "azurerm_public_ip" "appgw" {
  name                = "${var.project_name}-${var.environment}-appgw-pip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "azurerm_web_application_firewall_policy" "main" {
  name                = "${var.project_name}-${var.environment}-wafpolicy"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  policy_settings {
    enabled                     = true
    mode                        = "Prevention"
    request_body_check          = true
    file_upload_limit_in_mb     = 100
    max_request_body_size_in_kb = 128
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"

    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "azurerm_application_gateway" "main" {
  name                = "${var.project_name}-${var.environment}-appgw"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  sku {
    name     = var.appgw_sku
    tier     = var.appgw_tier
    capacity = 1
  }

  ssl_policy{
	policy_type= "Predefined"
	policy_name= "AppGwSslPolicy20220101S"
}

  gateway_ip_configuration {
    name      = "appgw-ipconfig"
    subnet_id = azurerm_subnet.appgw.id
  }

  frontend_ip_configuration {
    name                 = "appgw-frontend-ip"
    public_ip_address_id = azurerm_public_ip.appgw.id
  }

  frontend_port {
    name = "http-port"
    port = 80
  }

  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "appgw-frontend-ip"
    frontend_port_name             = "http-port"
    protocol                       = "Http"
  }

  probe {
    name                                      = "frontend-probe"
    protocol                                  = "Https"
    path                                      = "/"
    interval                                  = 30
    timeout                                   = 60
    unhealthy_threshold                       = 3
    pick_host_name_from_backend_http_settings = true
  }

  probe {
    name                                      = "backend-probe"
    protocol                                  = "Https"
    path                                      = "/api/health"
    interval                                  = 60
    timeout                                   = 120
    unhealthy_threshold                       = 5
    pick_host_name_from_backend_http_settings = true
   
  }

  backend_address_pool {
    name         = "frontend-pool"
    fqdns        = [azurerm_linux_web_app.frontend.default_hostname]
    ip_addresses = []
  }

  backend_address_pool {
    name         = "backend-pool"
    fqdns        = [azurerm_linux_web_app.backend.default_hostname]
    ip_addresses = []
  }

  backend_http_settings {
    name                                 = "frontend-http-settings"
    cookie_based_affinity               = "Disabled"
    port                                  = 443
    protocol                              = "Https"
    request_timeout                     = 60
    pick_host_name_from_backend_address = true
    probe_name                            = "frontend-probe"
  }

  backend_http_settings {
    name                                 = "backend-http-settings"
    cookie_based_affinity               = "Disabled"
    port                                  = 443
    protocol                              = "Https"
    request_timeout                     = 60
    pick_host_name_from_backend_address = true
    probe_name                            = "backend-probe"
  }

  url_path_map {
    name                               = "path-based-routing"
    default_backend_address_pool_name  = "frontend-pool"
    default_backend_http_settings_name = "frontend-http-settings"

    path_rule {
      name                       = "api-rule"
      paths                      = ["/api/*"]
      backend_address_pool_name  = "backend-pool"
      backend_http_settings_name = "backend-http-settings"
    }
  }

  request_routing_rule {
    name                = "http-rule"
    priority            = 100
    rule_type           = "PathBasedRouting"
    http_listener_name  = "http-listener"
    url_path_map_name   = "path-based-routing"
  }

  firewall_policy_id = azurerm_web_application_firewall_policy.main.id

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}
