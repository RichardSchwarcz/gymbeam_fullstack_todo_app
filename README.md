# GymBeam To-do App

This is a to-do list web app created as part of the GymBeam interview process for a software developer role. It is optimized for mobile devices and supports both dark and light modes. Users can manage multiple to-do lists, specify advanced properties such as due dates, tags and priorities.

## Features

- Mobile optimized interface
- Dark mode and light mode support
- Manage multiple to-do lists
- Add due dates and tags to tasks
- Set task priorities

## Technologies Used

- Next.js
- Prisma
- Tailwind CSS
- tRPC

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

Make sure you have Node.js installed.

### Installation

1. Clone the repo:

```
git clone https://github.com/RichardSchwarcz/gymbeam_fullstack_todo_app.git
cd gymbeam-todo-app
```

2. Install NPM packages:

```
npm install
```

3. Set up the PostgreSQL database:

Run the following script to set up the PostgreSQL database:

```
./start-database.sh
```

4. Seed the PostgreSQL database with data:

```
npx tsx ./prisma/seed.ts
```

### Running the App

To start the development server, run:

```
npm run dev
```

Open http://localhost:3000 to view it in the browser.

## Deployment

The app is already deployed and can be accessed at https://gymbeam-todo-app.vercel.app/.

## API Development

Due to the limitations of [mockapi.io's](https://mockapi.io/) free plan, which only allows creating 2 "resources", I decided to build my own API using tRPC, Prisma, and a PostgreSQL database. This allowed me to implement functionality for tags, tasks, and lists.
