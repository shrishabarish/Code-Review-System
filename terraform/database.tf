resource "aws_db_subnet_group" "db_subnets" {
  name       = "${var.environment}-db-subnet-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "${var.environment}-code-review-db"
  allocated_storage      = 20
  max_allocated_storage  = 50
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  db_name                = var.db_name
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnets.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
  deletion_protection    = false

  tags = {
    Name = "${var.environment}-postgres-rds"
  }
}
