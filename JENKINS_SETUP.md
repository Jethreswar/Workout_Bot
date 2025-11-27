# Jenkins CI/CD Setup for Workout Tracker

This document provides step-by-step instructions to set up Jenkins CI/CD pipeline for the Workout Tracker MERN stack application running on `http://localhost:8081/`.

## Prerequisites

- Jenkins server running at `http://localhost:8081/`
- Docker installed on Jenkins server
- Node.js plugin installed in Jenkins
- Git repository access
- MongoDB instance (local or cloud)

## Quick Setup Guide

### 1. Jenkins Plugin Installation

Install the following plugins in Jenkins (Manage Jenkins → Manage Plugins):

**Required Plugins:**

- NodeJS Plugin
- Docker Pipeline Plugin
- Git Plugin
- Pipeline Plugin
- HTML Publisher Plugin
- Email Extension Plugin
- Credentials Plugin
- Blue Ocean (recommended for better UI)

### 2. Global Tool Configuration

Navigate to **Manage Jenkins → Global Tool Configuration**:

#### Node.js Configuration:

- Name: `20`
- Version: `NodeJS 20.x.x`
- Install automatically

#### Docker Configuration:

- Name: `docker`
- Install automatically

### 3. Credentials Setup

Go to **Manage Jenkins → Manage Credentials → (global)**:

#### Required Credentials:

1. **mongo-uri** (Secret text)
   - ID: `mongo-uri`
   - Secret: Your MongoDB connection string
2. **gemini-api-key** (Secret text)

   - ID: `gemini-api-key`
   - Secret: Your Gemini API key

3. **docker-registry-credentials** (Username/Password)

   - ID: `docker-registry-credentials`
   - Username: Your Docker registry username
   - Password: Your Docker registry password

4. **github-token** (Secret text) - If using private repo
   - ID: `github-token`
   - Secret: Your GitHub personal access token

### 4. Create Jenkins Pipeline Job

1. **New Item** → **Pipeline** → Enter name: `workout-tracker-pipeline`

2. **Pipeline Configuration:**

   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/Jethreswar/Workout_Bot.git`
   - Branch: `*/master`
   - Script Path: `Jenkinsfile`

3. **Build Triggers:**

   - GitHub hook trigger for GITScm polling
   - Poll SCM: `H/5 * * * *` (every 5 minutes)

4. **Pipeline Syntax:**
   - Use Groovy Sandbox

### 5. Environment Variables Setup

In your Jenkins pipeline job configuration, add these environment variables:

```bash
DOCKER_REGISTRY=your-registry.com
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key
```

## Local Development Setup

### Prerequisites

1. Install Docker and Docker Compose
2. Install Node.js 18+
3. Install MongoDB (or use Docker)

### Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/Jethreswar/Workout_Bot.git
cd Workout_Bot

# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

#### Backend Setup:

```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup:

```bash
cd frontend
npm install
npm start
```

## 📊 Pipeline Stages Explanation

### 1. **Checkout**

- Pulls latest code from Git repository
- Verifies branch and commit information

### 2. **Install Dependencies**

- Runs `npm ci` for both frontend and backend
- Uses cache for faster builds
- Parallel execution for efficiency

### 3. **Code Quality & Linting**

- ESLint for code quality checks
- Prettier for code formatting
- Parallel execution for frontend and backend

### 4. **Run Tests**

- Backend: Jest unit tests with coverage
- Frontend: React Testing Library tests with coverage
- Generates coverage reports

### 5. **Security Scan**

- `npm audit` for dependency vulnerabilities
- Fails build if high-severity issues found
- Parallel security checks

### 6. **Build Applications**

- Backend: Prepares production build
- Frontend: Creates optimized React build
- Archives build artifacts

### 7. **Docker Build & Push**

- Only on main/master/develop branches
- Builds Docker images for both services
- Pushes to Docker registry with version tags

### 8. **Deploy to Staging**

- Automatic deployment to staging environment
- Uses docker-compose for orchestration
- Health checks after deployment

### 9. **Integration Tests**

- End-to-end tests against staging environment
- API endpoint validation
- Database connectivity tests

### 10. **Deploy to Production**

- Manual approval required (only on master branch)
- Blue-green deployment strategy
- Rollback capability

## 🐳 Docker Commands

### Build Images Locally:

```bash
# Backend
docker build -t workout-tracker-backend ./backend

# Frontend
docker build -t workout-tracker-frontend ./frontend
```

### Run Services:

```bash
# Development
docker-compose up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Monitoring & Logs

### View Application Logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks:

- Backend: `http://localhost:4000/api/workouts`
- Frontend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## 🚨 Troubleshooting

### Common Issues:

#### 1. **Build Fails - Dependencies**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. **Docker Build Issues**

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### 3. **Port Conflicts**

```bash
# Check running processes
netstat -tulpn | grep :4000
netstat -tulpn | grep :3000

# Kill processes
kill -9 <PID>
```

#### 4. **MongoDB Connection Issues**

```bash
# Check MongoDB status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Jenkins Pipeline Debugging:

#### 1. **View Build Logs**

- Go to Jenkins job → Build History → Console Output

#### 2. **Pipeline Visualization**

- Use Blue Ocean for visual pipeline representation

#### 3. **Workspace Inspection**

```bash
# Access Jenkins workspace
docker exec -it jenkins /bin/bash
cd /var/jenkins_home/workspace/workout-tracker-pipeline
```

## 📈 Performance Optimization

### Build Optimization:

1. **Docker Layer Caching**

   - Order Dockerfile commands by change frequency
   - Use `.dockerignore` files

2. **Parallel Execution**

   - Run frontend and backend operations in parallel
   - Utilize Jenkins parallel stages

3. **Dependency Caching**
   - Use `npm ci` instead of `npm install`
   - Cache node_modules between builds

### Deployment Optimization:

1. **Blue-Green Deployment**

   - Zero-downtime deployments
   - Quick rollback capability

2. **Health Checks**
   - Container health monitoring
   - Automatic restart on failures

## 🔒 Security Best Practices

### 1. **Secrets Management**

- Use Jenkins Credentials Plugin
- Never hardcode sensitive data
- Rotate secrets regularly

### 2. **Container Security**

- Use non-root users in containers
- Scan images for vulnerabilities
- Keep base images updated

### 3. **Network Security**

- Use Docker networks for service communication
- Implement proper CORS policies
- Use HTTPS in production

## 📚 Additional Resources

- [Jenkins Official Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Support

For issues related to this setup:

1. Check Jenkins build logs
2. Review Docker container logs
3. Verify environment variables
4. Check network connectivity
5. Validate credentials configuration

---

**Happy Building! 🚀**
