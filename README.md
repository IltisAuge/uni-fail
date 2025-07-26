## This project was created by Daniel Ziegler, Lisa Natterer and Leonie Reusch from DHBW Stuttgart.

# Techstack

Frontend:
- Angular 18
- TypeScript 5
- TailwindCSS 4
- FontAwesome

Backend:
- NodeJS
- TypeScript 5
- Express-Library (for API-Server)
- supertest, vitest (for Integration Tests)

Data storage:
- MongoDB via mongoose
- AWS S3 Bucket

# Additional information
This software has implemented CSRF-protection.<br>
For SEO (Search Engine Optimization) ``robots.txt`` and ``sitemap.xml`` files are provided in ``/frontend/public`` and server-side rendering (SSR) is used in this software.<br>
This software is hosted on a VPS (Virtual private server). It runs in a Docker-Compose project behind an NGINX reverse proxy.<br>
The frontend and API services use SSL certificates from LetsEncrypt to provide a secure connection.
Those SSL certificates are bound to my private domains <a href="https://uni-fail.iltisauge.de">uni-fail.iltisauge.de</a> and <a href="https://api.uni-fail.iltisauge.de">api.uni-fail.iltisauge.de</a>.<br>
You can find the presentation and design concept in the root directory of this repository.

# Documentation for Developers

## 1. Setup project for development

You need to add a few files and configurations to start the development services of this application.

### Pulling and first setup

Pull this repository by opening a new terminal. Navigate to the desired destination directory and run ``git pull https://github.com/IltisAuge/uni-fail.git``.

After pulling the project from GitHub, install all required Node packages.
To do this, open a terminal and navigate to `/frontend` in the project's directory. Then run `npm install --force`. --force is required because Angular 18 requires tailwindcss@"^2.0.0 || ^3.0.0" but this project uses TailwindCSS 4 as it is also compatible via Angular 18.

To set up the backend, navigate to ``/backend`` and run `npm install`.
In the ``/backend`` directory, create two new files: `.env` and `google_client.json`.
The ``google_client.json`` file is needed later.
The structure of the environment configuration file ```.env``` should be as followed:
```dotenv
PRODUCTION=false
SESSION_SECRET=PUT_RANDOM_STRING_HERE
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_AUTH_SOURCE=
AUTH_RETURN_URL=http://localhost:4200
HOST=http://localhost:5010
DOMAIN=localhost
API_BASE=http://localhost:5010
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_RETURN_URL=http://localhost:5010/login/microsoft-auth-return
MICROSOFT_SCOPE=openid%20offline_access%20https%3A%2F%2Fgraph.microsoft.com%2Fuser.read%20email%20profile
S3_REGION=
S3_BUCKET_NAME=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

### Setup Database
This project uses MongoDB as its database. You can host your own MongoDB service in Docker using the provided ``/docker/dev/docker-compose.yml`` file.
Update the required fields in ``.env``. The standard auth source is `admin`.

### Setup AWS S3
A S3 Bucket is used to store the available avatar image files. Create your own S3 Bucket on AWS (Amazon Web Services) and fill in the required information in ``.env``.<br>
It's recommended to create a new IAM user and add security credentials. Copy the AccessKey and SecretKey to ``.env``. WARNING: The SecretKey will only be shown ONCE when creating new credentials!

### Setup Microsoft & Google authentication
This project allows users to log in with their Microsoft or Google account.

#### Microsoft Entra
To get your Microsoft TenantId and ClientId, you need to create an application in Microsoft Entra.
Visit https://entra.microsoft.com and navigate to `Applications` > `App registrations` and click `New registration`.
Enter a name for your application (you may use "unifail").<br>
``Supported account types`` is your choice.<br>
Add a `Redirect URI`: `http://localhost:5010/login/microsoft-auth-return`<br>
Now click ``Register`` and your App will be created. You will now find the App in `App registrations`.<br>
Open the App Overview and you will find your ``Application (client) ID`` and ``Directory (tenant) ID``. Paste these two into your `.env` file.<br>
Now you have to add a Client Secret to your Entra application in ``Certificates & secrets``. Copy this secret and paste it into your `.env` file.

#### Google OAuth2
You need to create a Google Application in https://console.cloud.google.com/projectcreate.<br>
Then navigate to ``APIs and Services`` > `Credentials` and click `Create credentials` > `OAuth client ID`.<br>
`Application type`: `Web application`<br>
`Name`: Choose a name for this web client<br>
`Authorised JavaScript Origins`: Empty<br>
`Authorised redirect URIs`: `http://localhost:5010/login/google-auth-return`<br>
After creating your application, you can add a Client Secret und click on the download icon next to it.
This will download a file containing sensitive information to connect to your application. Paste the content of this file into ``google_client.json``.

## 2. Setup Frontend & Backend services in a production environment

First, you need to build both the frontend and backend services.

### Building the Frontend

Open a new terminal and navigate to `/frontend`. Run `npm run build:prod` to start the production build process.<br>
When the task finishes, you will find the compiled files in the `/frontend/dist` directory.

### Building the Backend

Navigate to ``/backend`` in your terminal. Run `npm run build` to compile all TypeScript files to executable JavaScript.<br>
All compiled backend files will be placed in ``/backend/dist``.

### Setup production .env file
You have to upload a copy of the ``.env`` file to your production environment and make a few changes to this file.<br>
1. PRODUCTION=true
2. Adjust your MongoDB connection credentials
3. Change AUTH_RETURN_URL to point to your frontend Angular application (Important: No tailing "/"!)
4. Change HOST and DOMAIN to reflect your domain name 
5. Change API_BASE to point to your backend API service (Important: No tailing "/"!)

### Setup Microsoft and Google authentication for production
If you have not yet created applications in Microsoft Entra and Google Cloud, see ``1. > Setup Microsoft & Google authentication``.<br>
To use your production server and domain, you have to add redirect URIs to these two applications.<br>
Add the following redirect URI to Microsoft: ``https://your-api-domain.toplvl/login/microsoft-auth-return``<br>
Add the following redirect URI to Google: ``https://your-api-domain.toplvl/login/google-auth-return``<br>
If you're not using HTTPS, use http://....<br>
You also have to enter these URIs in your production server's ``.env`` and ``google_client.json`` files!

### Setup Docker
To run this software in production, you need to install Docker on your production environment.
To start the Docker containers, you can use `/docker/prod/docker-compose.yml` with the provided Dockerfiles for frontend and backend.<br>
If you want to use ``NGINX`` as a reverse proxy, you can use `/docker/prod/nginx.conf` as a configuration template.
You may need to change the location of your SSL certificates and domain names in nginx.conf.<br>
When using the provided docker-compose file please <b>update the MongoDB password</b> as well as in your production `.env` file!

### Uploading the required files
If you are using the provided Docker configuration, you have to pay attention to the folder structure on your production machine.<br>
```text
/unifail
│
├── /backend
│   ├── /dist
│   │   ├── server.js
│   ├── /uploads
│   ├── Dockerfile
│   ├── .env
│   ├── google_client.json
│   └── package.json
│
├── /frontend
│   ├── /dist
│   │   └── /frontend
│   │       ├── /browser
│   │       └── /server
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```
After building the frontend and backend, upload the two ``dist``-folders in their respective directories on the production machine.<br>
Upload the Dockerfiles and package.json for both frontend and backend.<br>
Upload the ``.env`` and ``google_client.json`` files in the backend directory.<br>
Upload the ``docker-compose.yml`` to the ``/unifail`` directory.<br>

Now you can navigate to the ``/unifail`` directory in your production server and run ``docker compose up -d`` to start all services.<br>
Docker will build the frontend and backend Docker Images on the first compose-execution. If you want to rebuild these Images, run ``docker compose up --build -d``.

If you are using NGINX, start this service as well.

Run ``docker ps`` in your production server's terminal and you should see four containers running:
1. uni-fail_angular on port 4200:4200
2. uni-fail_api-server on port 5010:5010
3. uni-fail_mongodb on port 27017:27017
4. nginx on port 80:80, 443:443

### GitHub Action for building and deployment

You can find a workflow for GitHub Actions in ``.github/workflows/code-analysis-build-deploy.yml``:

This action script is triggered by any push or pull-request to any branch.<br>
The first job is to run code analysis for TypeScript, HTML and CSS files and run ``npm test`` on the backend to perform the implemented integration tests.<br>
If the target branch is "master" and if code analysis and other tests complete successfully, the build and deploy job is triggered.<br>
It automatically builds the frontend and backend services for production, deploys all required files to the production server and restarts the Docker containers.<br>
To access the production server via SSH (Secure Shell) via GitHub you have to add a Secret in ``Repository settings`` > ``Secrets and variables`` > ``Actions``.<br>
This secret contains a private SSH key in .pem format. The corresponding public key is stored on your production server.

## Credits:
Avatars used in this software: https://github.com/alohe/avatars
