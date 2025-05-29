## This project was created by Daniel Ziegler, Lisa Natterer and Leonie Reusch from DHBW Stuttgart.

# Documentation for Developers

## 1. Setup Frontend & Backend Services in a production environment

First, you need to build both the frontend and backend services.

#### Building the Frontend

Open a new terminal and navigate to `/frontend`. Run `npm run build:prod` to start the build process.

When the task finishes, you will find the compiled files in the `/frontend/dist` directory.

#### Building the Backend

Navigate to ``/backend`` in your terminal. Run `npm run build` to compile all TypeScript files to executable JavaScript.

All compiled backend files will be placed in ``/backend/dist``.

#### Setup Docker

To run this software in production, you need to install Docker on your production environment.
To start the Docker containers, you'll find a docker-compose file in `/docker/prod`.
You can copy this file to your production server and make changes like the location of your SSL certificates and domain names or use an existing NGINX service.
