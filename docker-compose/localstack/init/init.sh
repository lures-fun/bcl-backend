#!/bin/bash
echo "======================== [/etc/localstack/init/ready.d/init.sh] start ========================"
awslocal s3 mb s3://
echo "======================== [/etc/localstack/init/ready.d/init.sh] end   ========================"
