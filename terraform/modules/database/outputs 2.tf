# Outputs for Database Module

output "mongodb_connection_string" {
  description = "MongoDB Atlas connection string"
  value       = mongodbatlas_cluster.varai_cluster.connection_strings[0].standard
  sensitive   = true
}

output "mongodb_srv_connection_string" {
  description = "MongoDB Atlas SRV connection string"
  value       = mongodbatlas_cluster.varai_cluster.connection_strings[0].standard_srv
  sensitive   = true
}

output "mongodb_cluster_id" {
  description = "MongoDB Atlas cluster ID"
  value       = mongodbatlas_cluster.varai_cluster.cluster_id
}

output "mongodb_cluster_name" {
  description = "MongoDB Atlas cluster name"
  value       = mongodbatlas_cluster.varai_cluster.name
}

output "mongodb_project_id" {
  description = "MongoDB Atlas project ID"
  value       = mongodbatlas_project.varai_project.id
}

output "mongodb_project_name" {
  description = "MongoDB Atlas project name"
  value       = mongodbatlas_project.varai_project.name
}

output "mongodb_database_name" {
  description = "MongoDB database name"
  value       = var.mongodb_database_name
}

output "mongodb_username" {
  description = "MongoDB username"
  value       = mongodbatlas_database_user.varai_user.username
}

output "mongodb_connection_url" {
  description = "MongoDB connection URL with authentication"
  value       = "mongodb+srv://${mongodbatlas_database_user.varai_user.username}:${var.mongodb_password}@${mongodbatlas_cluster.varai_cluster.name}.mongodb.net/${var.mongodb_database_name}?retryWrites=true&w=majority"
  sensitive   = true
}

output "redis_host" {
  description = "Redis host"
  value       = google_redis_instance.varai_redis.host
}

output "redis_port" {
  description = "Redis port"
  value       = google_redis_instance.varai_redis.port
}

output "redis_instance_id" {
  description = "Redis instance ID"
  value       = google_redis_instance.varai_redis.id
}

output "redis_instance_name" {
  description = "Redis instance name"
  value       = google_redis_instance.varai_redis.name
}

output "redis_memory_size_gb" {
  description = "Redis memory size in GB"
  value       = google_redis_instance.varai_redis.memory_size_gb
}

output "redis_version" {
  description = "Redis version"
  value       = google_redis_instance.varai_redis.redis_version
}

output "redis_connection_string" {
  description = "Redis connection string"
  value       = "${google_redis_instance.varai_redis.host}:${google_redis_instance.varai_redis.port}"
}