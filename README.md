# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally

This project is configured to run locally using `npm` and can connect to an external MongoDB database.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A MongoDB database and its connection string (URI).

### 1. Install Dependencies

Open a terminal in the root directory of the project and run:

```sh
npm install
```

### 2. Configure Database Connection

Create a new file named `.env.local` in the root of your project and add your MongoDB connection string:

```
MONGODB_URI="your-mongodb-connection-string-goes-here"
```

Replace `your-mongodb-connection-string-goes-here` with your actual database URI.

### 3. Run the Development Server

Start the Next.js development server with the following command:

```sh
npm run dev
```

Your application will be available at `http://localhost:9002`.
