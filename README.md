---
name: Vercel Cron Job Example
slug: vercel-cron
description: A Next.js app that uses Vercel Cron Jobs to update data at different intervals.
framework: Next.js
useCase:
  - Cron
  - Functions
css: Tailwind
database: Vercel KV
deployUrl: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fsolutions%2Fcron&project-name=cron&repository-name=cron&demo-title=Vercel%20Cron%20Job%20Example&demo-description=A%20Next.js%20app%20that%20uses%20Vercel%20Cron%20Jobs%20to%20update%20data%20at%20different%20intervals.&demo-url=https%3A%2F%2Fcron-template.vercel.app%2F&demo-image=https%3A%2F%2Fcron-template.vercel.app%2Fthumbnail.png&stores=%5B%7B"type"%3A"kv"%7D%5D
demoUrl: https://cron-template.vercel.app/
relatedTemplates:
  - hacker-news-slack-bot
  - cron-og
---

# Vercel Cron Job Example

A Next.js app that uses [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) to update data at different intervals.

## Demo

https://cron-template.vercel.app/

## How to Use

You can choose from one of the following two methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=examples-repo):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fsolutions%2Fcron&project-name=cron&repository-name=cron&demo-title=Vercel%20Cron%20Job%20Example&demo-description=A%20Next.js%20app%20that%20uses%20Vercel%20Cron%20Jobs%20to%20update%20data%20at%20different%20intervals.&demo-url=https%3A%2F%2Fcron-template.vercel.app%2F&demo-image=https%3A%2F%2Fcron-template.vercel.app%2Fthumbnail.png&stores=%5B%7B"type"%3A"kv"%7D%5D)

Don't forget to set the required environment variables that you got from the previous step.

### Clone and Deploy

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [pnpm](https://pnpm.io/installation) to bootstrap the example:

```bash
pnpm create next-app --example https://github.com/vercel/examples/tree/main/solutions/cron cron
```

Next, run Next.js in development mode:

```bash
pnpm dev
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=examples-repo) ([Documentation](https://nextjs.org/docs/deployment)).

# Job Information Aggregator

This application aggregates job listings from major tech companies like Google, Amazon, and Aliyun. The data is scraped using Firecrawl Node SDK and stored using Vercel KV.

## Features

- Scrapes job listings from Google, Amazon, and Aliyun
- Displays job statistics by company
- Shows recent job listings with details
- Allows manual triggering of job scraping

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Data Scraping**: Firecrawl Node SDK
- **Data Storage**: Vercel KV (Redis)

## Getting Started

### Prerequisites

- Node.js 14+ and npm/pnpm
- A Firecrawl API key (get one from [firecrawl.dev](https://firecrawl.dev))
- Vercel KV (Redis) instance

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd job-aggregator
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firecrawl API key and Vercel KV credentials.

### Running the Application

1. Start the development server:

```bash
npm run dev
# or
pnpm dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Click the "Scrape Jobs Now" button to trigger the job scraping process.

## API Routes

- `GET /api/data/1d` - Get job listings and company statistics
- `GET /api/jobs/[company]` - Get jobs for a specific company
- `POST /api/scrape` - Trigger job scraping (all companies or a specific company)

## Project Structure

```
├── components/         # React components
│   ├── CompanyStats.tsx  # Company statistics component
│   └── JobCard.tsx       # Job listing card component
├── lib/                # Library code
│   ├── db.ts           # Database utilities
│   ├── scraper.ts      # Main scraper controller
│   ├── types.ts        # TypeScript type definitions
│   └── scrapers/       # Individual scrapers
│       ├── google.ts   # Google jobs scraper
│       ├── amazon.ts   # Amazon jobs scraper
│       └── aliyun.ts   # Aliyun jobs scraper
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── cron/       # Cron job API routes
│   │   ├── data/       # Data API routes
│   │   ├── jobs/       # Jobs API routes
│   │   └── scrape.ts   # Scrape API route
│   └── index.tsx       # Main page
└── public/             # Static assets
```

## License

MIT
