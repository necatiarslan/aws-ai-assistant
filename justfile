package:
    vsce package
    mv *.vsix ./vsix/

build:
    vsce package
    mv *.vsix ./vsix/

publish:
    vsce publish

npm-doctor:
    npm doctor # check dependencies
    npm prune # remove unused dependencies
    npx depcheck # check dependencies
    npm-check # check dependencies

npm-outdated:
    npm outdated
    npx npm-check-updates

npm-update:
    npm update

npm-install:
    rm -rf node_modules package-lock.json
    npm install
    npx tsc --noEmit

localstack_start:
    localstack start

localstack_stop:
    localstack stop

localstack_status:
    localstack status

localstack_logs:
    localstack logs

localstack_help:
    localstack --help 

localstack_update:
    localstack update

create_bucket:
    aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

list_buckets:
    aws --endpoint-url=http://localhost:4566 s3 ls

list_bucket_content:
    aws --endpoint-url=http://localhost:4566 s3 ls s3://my-bucket

upload_file:
    aws --endpoint-url=http://localhost:4566 s3 cp README.md s3://my-bucket