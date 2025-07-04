# Outputs for Networking Module

output "network_id" {
  description = "The ID of the VPC network"
  value       = google_compute_network.varai_network.id
}

output "network_name" {
  description = "The name of the VPC network"
  value       = google_compute_network.varai_network.name
}

output "subnet_id" {
  description = "The ID of the subnet"
  value       = google_compute_subnetwork.varai_subnet.id
}

output "subnet_name" {
  description = "The name of the subnet"
  value       = google_compute_subnetwork.varai_subnet.name
}

output "subnet_cidr" {
  description = "The CIDR range of the subnet"
  value       = google_compute_subnetwork.varai_subnet.ip_cidr_range
}

output "load_balancer_ip" {
  description = "The IP address of the load balancer"
  value       = google_compute_global_address.varai_lb_ip.address
}

output "dns_zone_name" {
  description = "The name of the DNS zone"
  value       = var.create_dns_zone ? google_dns_managed_zone.varai_zone[0].name : var.dns_zone_name
}

output "dns_zone_name_servers" {
  description = "The name servers for the DNS zone"
  value       = var.create_dns_zone ? google_dns_managed_zone.varai_zone[0].name_servers : []
}

output "security_policy_id" {
  description = "The ID of the Cloud Armor security policy"
  value       = google_compute_security_policy.varai_security_policy.id
}

output "security_policy_name" {
  description = "The name of the Cloud Armor security policy"
  value       = google_compute_security_policy.varai_security_policy.name
}

output "https_proxy_id" {
  description = "The ID of the HTTPS proxy"
  value       = google_compute_target_https_proxy.varai_https_proxy.id
}

output "http_proxy_id" {
  description = "The ID of the HTTP proxy"
  value       = google_compute_target_http_proxy.varai_http_proxy.id
}

output "url_map_id" {
  description = "The ID of the URL map"
  value       = google_compute_url_map.varai_url_map.id
}

output "ssl_certificate_id" {
  description = "The ID of the SSL certificate"
  value       = google_compute_managed_ssl_certificate.varai_cert.id
}

output "health_check_id" {
  description = "The ID of the health check"
  value       = google_compute_health_check.varai_health_check.id
}

output "nat_router_name" {
  description = "The name of the Cloud NAT router"
  value       = google_compute_router.varai_router.name
}

output "nat_name" {
  description = "The name of the Cloud NAT"
  value       = google_compute_router_nat.varai_nat.name
}