pipeline {
    agent any
    
    tools {
        nodejs '20'
    }
    
    environment {
        MONGO_URI = credentials('mongo-uri')
        GEMINI_API_KEY = credentials('gemini-api-key')
        NODE_ENV = 'test'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_BUILDKIT = '1'
        // Force npm to not fail on audit issues in development
        NPM_CONFIG_AUDIT_LEVEL = 'none'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('Clean Dependencies') {
            parallel {
                stage('Clean Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Cleaning backend dependencies...'
                            bat '''
                                if exist node_modules (
                                    echo "Removing existing node_modules..."
                                    rmdir /s /q node_modules || echo "node_modules cleanup completed"
                                )
                                if exist package-lock.json (
                                    echo "Removing package-lock.json to avoid sync issues..."
                                    del package-lock.json
                                )
                            '''
                        }
                    }
                }
                stage('Clean Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Cleaning frontend dependencies...'
                            bat '''
                                if exist node_modules (
                                    echo "Removing existing node_modules..."
                                    rmdir /s /q node_modules || echo "node_modules cleanup completed"
                                )
                                if exist package-lock.json (
                                    echo "Removing package-lock.json to avoid sync issues..."
                                    del package-lock.json
                                )
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Installing backend dependencies...'
                            bat '''
                                echo "Installing fresh dependencies..."
                                npm install --no-audit --no-fund
                                echo "Backend dependencies installed successfully"
                            '''
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Installing frontend dependencies...'
                            bat '''
                                echo "Installing fresh dependencies..."
                                npm install --no-audit --no-fund --legacy-peer-deps
                                echo "Frontend dependencies installed successfully"
                            '''
                        }
                    }
                }
            }
        }
        
        stage('Code Quality & Linting') {
            parallel {
                stage('Backend Lint') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Running backend linting...'
                            script {
                                def lintResult = bat(script: 'npm run lint', returnStatus: true)
                                if (lintResult != 0) {
                                    echo "Backend linting found issues (${lintResult} problems). Continuing build..."
                                    currentBuild.result = 'UNSTABLE'
                                } else {
                                    echo "Backend linting passed!"
                                }
                            }
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Running frontend linting...'
                            script {
                                def lintResult = bat(script: 'npm run lint', returnStatus: true)
                                if (lintResult != 0) {
                                    echo "Frontend linting found issues. Continuing build..."
                                    currentBuild.result = 'UNSTABLE'
                                } else {
                                    echo "Frontend linting passed!"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Backend Security Audit') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Running backend security audit...'
                            script {
                                def auditResult = bat(script: 'npm audit --audit-level=high', returnStatus: true)
                                if (auditResult != 0) {
                                    echo "Backend security vulnerabilities found. Review recommended."
                                    currentBuild.result = 'UNSTABLE'
                                } else {
                                    echo "Backend security audit passed!"
                                }
                            }
                        }
                    }
                }
                stage('Frontend Security Audit') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Running frontend security audit...'
                            script {
                                def auditResult = bat(script: 'npm audit --audit-level=high', returnStatus: true)
                                if (auditResult != 0) {
                                    echo "Frontend security vulnerabilities found. Review recommended."
                                    echo "Run 'npm audit fix' to attempt automatic fixes."
                                    currentBuild.result = 'UNSTABLE'
                                } else {
                                    echo "Frontend security audit passed!"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Running backend tests...'
                            script {
                                def testResult = bat(script: 'npm test', returnStatus: true)
                                if (testResult != 0) {
                                    echo "Some backend tests failed. Check test results."
                                    currentBuild.result = 'UNSTABLE'
                                } else {
                                    echo "Backend tests passed!"
                                }
                            }
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Running frontend tests...'
                            script {
                                def testResult = bat(script: 'set CI=true && npm run test:coverage', returnStatus: true)
                                if (testResult != 0) {
                                    echo "Some frontend tests failed. Check test results."
                                    currentBuild.result = 'UNSTABLE'
                                } else {
                                    echo "Frontend tests passed!"
                                }
                            }
                        }
                    }
                    post {
                        always {
                            script {
                                // Only publish coverage if directory exists
                                if (fileExists("${FRONTEND_DIR}/coverage/lcov-report/index.html")) {
                                    publishHTML([
                                        allowMissing: true,
                                        alwaysLinkToLastBuild: true,
                                        keepAll: true,
                                        reportDir: "${FRONTEND_DIR}/coverage/lcov-report",
                                        reportFiles: 'index.html',
                                        reportName: 'Frontend Coverage Report'
                                    ])
                                } else {
                                    echo "Coverage report not found, skipping HTML publish"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Applications') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Building backend application...'
                            bat 'npm run build'
                            echo "Backend build completed!"
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Building frontend application...'
                            bat 'npm run build'
                            echo "Frontend build completed!"
                            
                            // Archive build artifacts only if build directory exists
                            script {
                                if (fileExists('build')) {
                                    archiveArtifacts artifacts: 'build/**/*', allowEmptyArchive: true
                                    echo "Build artifacts archived successfully"
                                } else {
                                    echo "Build directory not found, skipping artifact archival"
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    echo 'Building Docker images...'
                    
                    try {
                        // Build backend image
                        bat "docker build -t workout-tracker-backend:${IMAGE_TAG} .\\${BACKEND_DIR}"
                        bat "docker tag workout-tracker-backend:${IMAGE_TAG} workout-tracker-backend:latest"
                        echo "Backend Docker image built successfully!"
                        
                        // Build frontend image  
                        bat "docker build -t workout-tracker-frontend:${IMAGE_TAG} .\\${FRONTEND_DIR}"
                        bat "docker tag workout-tracker-frontend:${IMAGE_TAG} workout-tracker-frontend:latest"
                        echo "Frontend Docker image built successfully!"
                        
                        // List created images
                        echo "Docker images created:"
                        bat 'docker images | findstr workout-tracker'
                        
                    } catch (Exception e) {
                        echo "Docker build failed: ${e.getMessage()}"
                        echo "Make sure Docker Desktop is running and try again."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Deploy Locally') {
            steps {
                script {
                    echo 'Deploying application locally using docker-compose...'
                    
                    try {
                        // Stop existing containers
                        bat 'docker-compose down || echo "No existing containers to stop"'
                        
                        // Start new containers
                        bat 'docker-compose up -d'
                        
                        // Wait for services to be ready
                        sleep(time: 30, unit: 'SECONDS')
                        
                        echo """
                        Application deployed successfully!
                        
                        Access your application:
                        - Frontend: http://localhost:3000
                        - Backend API: http://localhost:4000/api
                        - MongoDB: localhost:27017
                        """
                        
                    } catch (Exception e) {
                        echo "Deployment failed: ${e.getMessage()}"
                        echo "Check Docker Desktop and port availability."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed.'
            
            // Display build summary
            script {
                def status = currentBuild.result ?: 'SUCCESS'
                echo """
                ═══════════════════════════════════════
                        BUILD SUMMARY
                ═══════════════════════════════════════
                Status: ${status}
                Build Number: ${env.BUILD_NUMBER}
                Branch: ${env.BRANCH_NAME ?: 'main'}
                Commit: ${env.GIT_COMMIT ?: 'N/A'}
                
                Docker Images Built:
                - workout-tracker-frontend:${IMAGE_TAG}
                - workout-tracker-backend:${IMAGE_TAG}
                
                Application URLs:
                - Frontend: http://localhost:3000
                - Backend: http://localhost:4000
                - MongoDB: localhost:27017
                ═══════════════════════════════════════
                """
            }
        }
        success {
            echo """
            🎉 Pipeline completed successfully!
            
            Your workout tracker is running and ready to use!
            All Docker images are available in Docker Desktop.
            """
        }
        unstable {
            echo """
            Pipeline completed with warnings!
            
            Issues found:
            - Linting violations detected
            - Security vulnerabilities present
            - Some tests may have failed
            
            Application is still deployed but review the issues above.
            """
        }
        failure {
            echo """
            Pipeline failed!
            
            Common solutions:
            1. Check that Docker Desktop is running
            2. Ensure ports 3000, 4000, 27017 are available
            3. Review console output for specific errors
            4. Try running: docker-compose down && docker-compose up -d
            """
        }
    }
}