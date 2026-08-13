## ProjectHub

It's a project and task management platform with AI-assisted task generation: upload a requirements document (PDF/Word) and get suggested tasks automatically, powered by a RAG (Retrieval-Augmented Generation) pipeline on Azure OpenAI.

## Features

- Create and manage projects, tasks, and team members
- Upload a requirements document and get AI-generated task suggestions
- Review and approve/reject suggested tasks
- Token-based authentication (Laravel Sanctum)

## Logical Architecture

### Decomposition of the platform

ProjectHub is organized into four functional layers:

- **Access Layer**: Handles authentication for users accessing the platform
  - Token-based auth via Laravel Sanctum

- **Presentation Layer**: The interface users interact with
  - React single-page application (frontend), served by Nginx

- **Services Layer**: Business logic and processing
  - Laravel API - projects, tasks, members, CRUD operations
  - RAG microservice (FastAPI) - document parsing, chunking, embedding generation, and AI-based task generation

- **Data Layer**: Persistent storage
  - MySQL - application data (projects, tasks, users)
  - Azure Storage - uploaded requirement documents
  - Azure OpenAI - `gpt-5-mini` (task generation) and `text-embedding-ada-002` (embeddings), consumed by the Services Layer

### Deployment environment

Everything runs on **Microsoft Azure**, provisioned via **Terraform**. Only the Application Gateway is publicly exposed; every other resource (App Services, MySQL, RAG container, Storage, Azure OpenAI, Key Vault) sits inside a private virtual network, isolated by subnet with dedicated Network Security Groups. Secrets (DB password, app key, API keys) are stored in Azure Key Vault.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, served by Nginx |
| Backend | Laravel (PHP 8.2-FPM) |
| RAG microservice | FastAPI (Python 3.12) |
| Database | MySQL 8.0 |
| Vector store | ChromaDB |
| AI | Azure OpenAI |
| Infrastructure | Terraform on Azure |



Each service is a standalone Docker image — there is no `docker-compose.yml`; services are built and run independently (see below), and connect to each other via their configured URLs/hosts.

## Getting started

### Prerequisites

Docker. (For running services outside Docker: PHP 8.2+, Composer, Node.js 20+, Python 3.12+, and a MySQL 8.0 instance.)

### Backend

```bash
cd projecthub-backend
cp .env.example .env
# fill in APP_KEY, DB_*, RAG_SERVICE_URL, etc.
docker build -t projecthub-backend .
docker run -p 8000:8000 --env-file .env projecthub-backend
```

On startup, the container automatically waits for the database, clears Laravel's cache, runs migrations, and runs seeders (see `entrypoint.sh`).

### Frontend

```bash
cd projecthub-frontend
docker build --build-arg REACT_APP_API_URL=/api -t projecthub-frontend .
docker run -p 80:80 projecthub-frontend
```

`REACT_APP_API_URL` is baked in at build time (React env vars are compiled into the static bundle, not read at runtime).

### RAG microservice

 Requires a real Azure OpenAI resource (endpoint + API key) — there is no offline/local substitute for the AI calls, even in development. 
 

```bash
cd projecthub-rag
cp .env.example .env
# fill in AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY with your own Azure OpenAI resource
pip install -r requirements.txt --break-system-packages
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Or with Docker (pass variables explicitly, since `.env` files aren't read automatically inside a container unless mounted):

```bash
docker build -t projecthub-rag .
docker run -p 8001:8001 --env-file .env projecthub-rag
```


## Deployment

Infrastructure is defined as code in `infra-terraform/` using Terraform (VNet, Application Gateway + WAF, App Services, RAG container, MySQL, Key Vault, Azure OpenAI, Container Registry).

```bash
cd infra-terraform
terraform init
terraform plan
terraform apply
```
