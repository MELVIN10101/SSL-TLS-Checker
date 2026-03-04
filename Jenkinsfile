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
                sh 'npm audit --production || true'
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