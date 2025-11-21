# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally with Docker

This project is configured to run in a containerized environment using Docker and Docker Compose. This is the recommended way to run the application locally as it manages both the Next.js application and the MongoDB database.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Build and Run

1.  Open a terminal in the root directory of the project.
2.  Run the following command to build the Docker images and start the services:

    ```sh
    docker-compose up --build
    ```

This command will start the Next.js application and the MongoDB database. Your application will be available at `http://localhost:3000`.

### Stop the Application

To stop the running services, press `Ctrl + C` in the terminal where `docker-compose` is running.

To stop and remove the containers, run:

```sh
docker-compose down
```
