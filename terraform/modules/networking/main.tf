# Networking Module for VARAi Platform

# VPC Network
resource "google_compute_network" "varai_network" {
  name                    = "varai-network-${var.environment}"
  auto_create_subnetworks = false
  description             = "VPC Network for VARAi Platform - ${var.environment} environment"
}

# Subnets
resource "google_compute_subnetwork" "varai_subnet" {
  name          = "varai-subnet-${var.environment}"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.varai_network.id
  
  description = "Subnet for VARAi Platform - ${var.environment} environment"
  
  # Enable flow logs if specified
  dynamic "log_config" {
    for_each = var.enable_flow_logs ? [1] : []
    content {
      aggregation_interval = "INTERVAL_5_SEC"
      flow_sampling        = 0.5
      metadata             = "INCLUDE_ALL_METADATA"
    }
  }
  
  # Enable Private Google Access
  private_ip_google_access = true
}

# Cloud NAT for outbound internet access from private instances
resource "google_compute_router" "varai_router" {
  name    = "varai-router-${var.environment}"
  region  = var.region
  network = google_compute_network.varai_network.id
  
  description = "Router for VARAi Platform - ${var.environment} environment"
}

resource "google_compute_router_nat" "varai_nat" {
  name                               = "varai-nat-${var.environment}"
  router                             = google_compute_router.varai_router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
  
  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# Firewall Rules
resource "google_compute_firewall" "allow_internal" {
  name    = "varai-allow-internal-${var.environment}"
  network = google_compute_network.varai_network.id
  
  description = "Allow internal communication between VARAi services"
  
  allow {
    protocol = "tcp"
  }
  
  allow {
    protocol = "udp"
  }
  
  allow {
    protocol = "icmp"
  }
  
  source_ranges = [var.subnet_cidr]
}

resource "google_compute_firewall" "allow_health_checks" {
  name    = "varai-allow-health-checks-${var.environment}"
  network = google_compute_network.varai_network.id
  
  description = "Allow health checks from Google Cloud"
  
  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }
  
  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
}

resource "google_compute_firewall" "allow_ssh" {
  name    = "varai-allow-ssh-${var.environment}"
  network = google_compute_network.varai_network.id
  
  description = "Allow SSH from IAP"
  
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  
  source_ranges = ["35.235.240.0/20"] # IAP's IP range
}

# External Load Balancer
resource "google_compute_global_address" "varai_lb_ip" {
  name        = "varai-lb-ip-${var.environment}"
  description = "Global IP address for VARAi Load Balancer - ${var.environment} environment"
}

resource "google_compute_global_forwarding_rule" "varai_https" {
  name       = "varai-https-${var.environment}"
  target     = google_compute_target_https_proxy.varai_https_proxy.id
  port_range = "443"
  ip_address = google_compute_global_address.varai_lb_ip.address
}

resource "google_compute_global_forwarding_rule" "varai_http" {
  name       = "varai-http-${var.environment}"
  target     = google_compute_target_http_proxy.varai_http_proxy.id
  port_range = "80"
  ip_address = google_compute_global_address.varai_lb_ip.address
}

resource "google_compute_target_https_proxy" "varai_https_proxy" {
  name             = "varai-https-proxy-${var.environment}"
  url_map          = google_compute_url_map.varai_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.varai_cert.id]
}

resource "google_compute_target_http_proxy" "varai_http_proxy" {
  name    = "varai-http-proxy-${var.environment}"
  url_map = google_compute_url_map.varai_http_redirect.id
}

resource "google_compute_url_map" "varai_url_map" {
  name            = "varai-url-map-${var.environment}"
  default_service = google_compute_backend_service.varai_backend.id
  
  host_rule {
    hosts        = [var.domain_name]
    path_matcher = "allpaths"
  }
  
  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.varai_backend.id
    
    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.api_backend.id
    }
    
    path_rule {
      paths   = ["/auth/*"]
      service = google_compute_backend_service.auth_backend.id
    }
  }
}

resource "google_compute_url_map" "varai_http_redirect" {
  name = "varai-http-redirect-${var.environment}"
  
  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_managed_ssl_certificate" "varai_cert" {
  name = "varai-cert-${var.environment}"
  
  managed {
    domains = [var.domain_name]
  }
}

resource "google_compute_backend_service" "varai_backend" {
  name                  = "varai-backend-${var.environment}"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  load_balancing_scheme = "EXTERNAL"
  health_checks         = [google_compute_health_check.varai_health_check.id]
  
  backend {
    group = var.frontend_neg_id
  }
  
  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_backend_service" "api_backend" {
  name                  = "api-backend-${var.environment}"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  load_balancing_scheme = "EXTERNAL"
  health_checks         = [google_compute_health_check.varai_health_check.id]
  
  backend {
    group = var.api_neg_id
  }
  
  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_backend_service" "auth_backend" {
  name                  = "auth-backend-${var.environment}"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  load_balancing_scheme = "EXTERNAL"
  health_checks         = [google_compute_health_check.varai_health_check.id]
  
  backend {
    group = var.auth_neg_id
  }
  
  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_health_check" "varai_health_check" {
  name               = "varai-health-check-${var.environment}"
  check_interval_sec = 5
  timeout_sec        = 5
  
  http_health_check {
    port         = 80
    request_path = "/health"
  }
}

# Cloud DNS configuration
resource "google_dns_managed_zone" "varai_zone" {
  count       = var.create_dns_zone ? 1 : 0
  name        = "varai-zone-${var.environment}"
  dns_name    = "${var.domain_name}."
  description = "DNS zone for VARAi Platform - ${var.environment} environment"
}

resource "google_dns_record_set" "varai_a_record" {
  name         = "${var.domain_name}."
  managed_zone = var.create_dns_zone ? google_dns_managed_zone.varai_zone[0].name : var.dns_zone_name
  type         = "A"
  ttl          = 300
  
  rrdatas = [google_compute_global_address.varai_lb_ip.address]
}

# Cloud Armor security policy
resource "google_compute_security_policy" "varai_security_policy" {
  name        = "varai-security-policy-${var.environment}"
  description = "Security policy for VARAi Platform - ${var.environment} environment"
  
  # Default rule (deny all)
  rule {
    action   = "deny(403)"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default deny rule"
  }
  
  # Allow rule (allow specific countries)
  rule {
    action   = "allow"
    priority = "1000"
    match {
      expr {
        expression = "origin.region_code == 'US' || origin.region_code == 'CA'"
      }
    }
    description = "Allow traffic from US and Canada"
  }
  
  # Rate limiting rule
  rule {
    action   = "rate_based_ban"
    priority = "2000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      enforce_on_key = "IP"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
    }
    description = "Rate limiting rule"
  }
}