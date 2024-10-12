#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PasskeyAuthStack } from '../lib/passkey-auth-stack';

const app = new cdk.App();
new PasskeyAuthStack(app, 'PasskeyAuthStack', {
  rpId: "localhost",
  region: "eu-north-1"
});