# Webauthn/passkey example

Simple example using webauthn/passkeys as a signin option for aws cognito.

## install dependencies
Install dependencies in all lambda functions in ./lambda and for angular frontend example.

## deploy cdk
sign in to your aws account and create an iam user with administrator access
use aws cli to create a profile
`aws configure --profile default`

run cdk bootstrap
run cdk deploy

## Angualar frontend example
Install @angular/cli globally
install dependencies
ng serve  to test

## Passkey rpId
Passkey rpId's are set to localhost, you need to change this to your domain if you don't want to test locally.

## cleanup
cdk destroy
delete your created iam user or change its access rights (when no longer needed)
