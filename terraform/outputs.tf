output "rds_endpoint" {
  description = "PostgreSQL RDS connection endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "PostgreSQL RDS host address"
  value       = aws_db_instance.postgres.address
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group ingesting structured JSON logs"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
