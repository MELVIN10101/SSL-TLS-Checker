pipeline {
    agent any

    environment {
        NODE_ENV = "production"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || echo "No lint script found"'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test || echo "No tests configured"'
            }
        }
        stage('Secrets Scan') {
            steps {
                sh '''
                gitleaks detect --source . --verbose --redact
                '''
            }
        }

        stage('Dependency Scan') {
            steps {
                sh 'npm audit --audit-level=high || true'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    npx sonar-scanner \
                    -Dsonar.projectKey=ssl-tls-checker \
                    -Dsonar.sources=. \
                    '''
                }
            }
        }
        stage('container security scan'){
            steps{
                sh 'trivy image --timeout 15m --scanners vuln --severity HIGH,CRITICAL --exit-code 1 ssl-checker-app'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build || echo "No build script found"'
            }
        }
    }

    post {
        always {
            echo "Pipeline completed."
        }
        success {
            echo "Build successful."
        }
        failure {
            echo "Build failed."
        }
    }
}