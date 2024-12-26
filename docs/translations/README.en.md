# CloudPic

<div align="center">

English | [简体中文](../../README.md) | [日本語](./README.ja.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAirlur%2FCloudPic)

</div>

A web application for connecting and managing multiple cloud storage services, supporting Backblaze B2, Cloudflare R2, and more.

## Features

- Multiple cloud storage services support (B2, R2, S3-compatible)
- File upload, delete, and preview
- Simple password authentication
- Dark/Light theme switching
- Multi-language support

## Quick Start

1. Install dependencies
```bash
npm install
```

2. Development
```bash
npm run dev
```

3. Build
```bash
npm run build
```

## Development Guide

- Check the [Design Document](../design.md) for detailed information
- Refer to the "Local Development" section in the design document

## Deployment

### Deploy with Vercel (One-Click)

1. Click the "Deploy with Vercel" button above
2. Create a Vercel account if you don't have one
3. Authorize GitHub and select repository
4. Configure environment variables:
   - `ACCESS_PASSWORD`: Access password
5. Click "Deploy" to start deployment

### Manual Deployment

1. Fork this repository
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Express
- Vercel 