variable "instance_name" {
  description = "Value of the Name tag for the EC2 instance"
  type        = string
  default     = "TestInstance"
}

variable "myregion" {
  description = "Region"
  type        = string
  default     = "us-west-2"
}
