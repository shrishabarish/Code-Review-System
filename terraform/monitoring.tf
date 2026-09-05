resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/code-review-system/${var.environment}"
  retention_in_days = 7

  tags = {
    Name = "${var.environment}-cloudwatch-logs"
  }
}

resource "aws_cloudwatch_log_metric_filter" "db_errors" {
  name           = "${var.environment}-db-connection-errors"
  pattern        = "{ $.event = \"DATABASE_CONNECTION_ERROR\" }"
  log_group_name = aws_cloudwatch_log_group.app_logs.name

  metric_transformation {
    name      = "DatabaseConnectionErrors"
    namespace = "CodeReviewApp/RCA"
    value     = "1"
  }
}

resource "aws_cloudwatch_log_metric_filter" "fault_injections" {
  name           = "${var.environment}-fault-injections"
  pattern        = "{ $.is_fault_injected = true }"
  log_group_name = aws_cloudwatch_log_group.app_logs.name

  metric_transformation {
    name      = "InjectedFaultEvents"
    namespace = "CodeReviewApp/RCA"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "db_error_alarm" {
  alarm_name          = "${var.environment}-database-failure-alarm"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "DatabaseConnectionErrors"
  namespace           = "CodeReviewApp/RCA"
  period              = 60
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "Triggered when DB connection errors exceed threshold (RCA incident detection)"
}
