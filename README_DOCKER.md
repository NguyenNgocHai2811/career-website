# Docker Setup for Career Website

This project is containerized using Docker and Docker Compose.

## Prerequisites
- Docker installed
- Docker Compose installed

## Getting Started

1.  **Environment Variables**:
    Ensure you have `.env` files in both `backend` and `client` directories.
    - `backend/.env` should contain your Neo4j, JWT, Cloudinary, and AI configurations.
    - `client/.env` should contain `VITE_API_URL=http://localhost:3000`.

2.  **Build and Run**:
    From the root directory, run:
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application**:
    - Client: [http://localhost:5173](http://localhost:5173)
    - Backend: [http://localhost:3000](http://localhost:3000)

## Project Structure
- `backend/Dockerfile`: Node.js 20 environment.
- `client/Dockerfile`: Multi-stage build with Nginx for serving React/Vite.
- `docker-compose.yml`: Orchestrates both services.

## Common Commands
- **Stop services**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Rebuild**: `docker-compose up --build`
