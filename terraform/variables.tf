variable "aws_region" {
  type        = string
  description = "AWS deployment region"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Application deployment environment"
  default     = "staging"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "db_name" {
  type        = string
  description = "RDS database name"
  default     = "codereview"
}

variable "db_username" {
  type        = string
  description = "RDS master username"
  default     = "dbadmin"
}

variable "db_password" {
  type        = string
  description = "RDS master password (injected via secret or env)"
  sensitive   = true
  default     = "ChangeMeInProduction123!"
}

variable "db_instance_class" {
  type        = string
  description = "RDS database instance tier"
  default     = "db.t4g.micro"
}

variable "app_port" {
  type        = number
  description = "Backend application port"
  default     = 5000
}
