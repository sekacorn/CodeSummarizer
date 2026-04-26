# Privacy Notes

## Overview

Code Summarizer is built around a simple privacy goal: help developers understand code without sending that code to internet-hosted AI services.

This document explains what data the application handles, where that data goes, and what users should still consider when working with sensitive material.

## What the Application Processes

The application can process:

- Code snippets pasted by the user
- The selected language
- The selected local model name
- The selected analysis mode
- Secret scan findings derived from the pasted snippet
- Model output returned by the local Ollama instance

## Where Data Goes

Under normal operation:

- The pasted code stays on the local machine
- The app sends the snippet only to a locally running Ollama service at `http://127.0.0.1:11434`
- The app does not intentionally send snippets to external internet services

## What Is Not Collected by Default

The application code is designed without:

- Cloud telemetry
- Hosted analytics
- External AI API calls
- Account sign-in
- Built-in remote storage

## Secret Redaction

Before sending a snippet to the local model, the app can scan for likely secrets and redact detected values.

Important limitations:

- Secret scanning is regex-based and best-effort
- It may miss some secrets
- Users should still avoid pasting unnecessary sensitive data

## Local Model Responsibility

Privacy also depends on the local model environment:

- Users are responsible for how Ollama is installed and configured
- Users are responsible for which models are installed locally
- Organizations should verify that both Ollama and the selected model artifacts are approved for use

## Recommended Privacy Practices

- Keep secret masking enabled by default
- Use Sensitive Mode for higher-risk work
- Paste only the minimum code required for analysis
- Avoid including production credentials, tokens, or full datasets
- Use organization-approved local models only
- Review local endpoint, host monitoring, and workstation policy requirements

## Sensitive Environment Guidance

For government, regulated, or otherwise restricted environments:

- Review source code before deployment
- Build from source in a trusted environment where required
- Verify no unapproved outbound network access exists
- Confirm host logging and clipboard policies
- Validate the local model runtime separately from the app

## Summary

Code Summarizer is privacy-first by design, but privacy depends on the full local environment, including the workstation, the Ollama installation, the selected model, and local operating procedures.
