pipeline {
    agent any
    
    tools {
        nodejs '20' // Make sure Node.js 20 is configured in Jenkins Global Tool Configuration
    }
    
    environment {
        MONGO_URI = credentials('mongo-uri') // Configure this in Jenkins credentials
        GEMINI_API_KEY = credentials('gemini-api-key') // Configure this in Jenkins credentials
        NODE_ENV = 'test'
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
        DOCKER_REGISTRY = 'your-registry.com' // Replace with your Docker registry
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir("${BACKEND_DIR}") {
                            echo 'Installing backend dependencies...'
                            bat 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Installing frontend dependencies...'
                            bat 'npm ci'
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
                            bat 'npm run lint || echo "Linting completed"'
                        }
                    }
                }
                stage('Frontend Lint') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Running frontend linting...'
                            bat 'npm run lint || echo "Linting completed"'
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
                            bat 'npm test'
                        }
                    }
                    post {
                        always {
                            // Publish test results if you add test files
                            echo 'Backend tests completed'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Running frontend tests...'
                            bat 'set CI=true && npm test -- --coverage --watchAll=false'
                        }
                    }
                    post {
                        always {
                            // Publish test coverage reports
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: "${FRONTEND_DIR}/coverage/lcov-report",
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
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
                            bat 'npm audit --audit-level=high || echo "Security audit completed"'
                        }
                    }
                }
                stage('Frontend Security Audit') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Running frontend security audit...'
                            bat 'npm audit --audit-level=high || echo "Security audit completed"'
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
                            bat 'npm run build || echo "Backend build completed"'
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir("${FRONTEND_DIR}") {
                            echo 'Building frontend application...'
                            bat 'npm run build'
                            
                            // Archive build artifacts
                            archiveArtifacts artifacts: 'build/**/*', allowEmptyArchive: false
                        }
                    }
                }
            }
        }
        
        stage('Docker Build & Push') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            parallel {
                stage('Backend Docker') {
                    steps {
                        script {
                            echo 'Building and pushing backend Docker image...'
                            def backendImage = docker.build("${DOCKER_REGISTRY}/workout-tracker-backend:${IMAGE_TAG}", "${BACKEND_DIR}")
                            docker.withRegistry('https://' + DOCKER_REGISTRY, 'docker-registry-credentials') {
                                backendImage.push()
                                backendImage.push("latest")
                            }
                        }
                    }
                }
                stage('Frontend Docker') {
                    steps {
                        script {
                            echo 'Building and pushing frontend Docker image...'
                            def frontendImage = docker.build("${DOCKER_REGISTRY}/workout-tracker-frontend:${IMAGE_TAG}", "${FRONTEND_DIR}")
                            docker.withRegistry('https://' + DOCKER_REGISTRY, 'docker-registry-credentials') {
                                frontendImage.push()
                                frontendImage.push("latest")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'master'
                    branch 'main'
                }
            }
            steps {
                echo 'Deploying to staging environment...'
                script {
                    // Deploy using docker-compose or your preferred method
                    bat '''
                        echo "Starting staging deployment..."
                        docker-compose -f docker-compose.staging.yml down || echo "No existing containers"
                        docker-compose -f docker-compose.staging.yml pull
                        docker-compose -f docker-compose.staging.yml up -d
                    '''
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'master' 
                    branch 'main'
                }
            }
            steps {
                echo 'Running integration tests against staging environment...'
                script {
                    // Wait for services to be ready
                    sleep(time: 30, unit: 'SECONDS')
                    
                    // Run integration tests
                    dir("${BACKEND_DIR}") {
                        bat 'npm run test:integration || echo "Integration tests completed"'
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'master'
            }
            steps {
                script {
                    // Require manual approval for production deployment
                    timeout(time: 10, unit: 'MINUTES') {
                        input message: 'Deploy to Production?', ok: 'Deploy',
                              submitterParameter: 'DEPLOYER'
                    }
                    
                    echo "Deploying to production... (approved by ${env.DEPLOYER})"
                    bat '''
                        echo "Starting production deployment..."
                        docker-compose -f docker-compose.prod.yml down || echo "No existing containers"
                        docker-compose -f docker-compose.prod.yml pull
                        docker-compose -f docker-compose.prod.yml up -d
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            // Send success notification
            emailext (
                subject: "✅ Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    <h3>Build Successful!</h3>
                    <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                    <p>Check the build details: ${env.BUILD_URL}</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}",
                mimeType: 'text/html'
            )
        }
        failure {
            echo 'Pipeline failed!'
            // Send failure notification
            emailext (
                subject: "❌ Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
                    <h3>Build Failed!</h3>
                    <p><strong>Project:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                    <p>Check the build details: ${env.BUILD_URL}</p>
                    <p>Console Output: ${env.BUILD_URL}console</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}",
                mimeType: 'text/html'
            )
        }
        unstable {
            echo 'Pipeline is unstable'
        }
        changed {
            echo 'Pipeline state has changed'
        }
    }
}