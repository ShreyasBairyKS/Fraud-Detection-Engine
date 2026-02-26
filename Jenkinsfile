// ─────────────────────────────────────────────────
// Fraud Detection Engine — Jenkins Pipeline
// ─────────────────────────────────────────────────
// Stages: Checkout → Lint → Test → Build → Push → Deploy
// Phase 1 delivers: Checkout + Lint + Test (skeleton)
// Phase 4 adds:     Build + Push + Deploy + Notifications
// ─────────────────────────────────────────────────

pipeline {
    agent any

    environment {
        NODE_VERSION    = '20'
        DOCKERHUB_CREDS = credentials('dockerhub-credentials')
        SLACK_CHANNEL   = '#fraud-detection-alerts'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "✅ Code checked out from ${env.BRANCH_NAME ?: 'unknown'}"
            }
        }

        // ── Stage 2: Install Dependencies ──────────────
        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm ci'
                echo '✅ Dependencies installed'
            }
        }

        // ── Stage 3: Lint ──────────────────────────────
        stage('Lint') {
            steps {
                sh 'npm run lint'
                echo '✅ Linting passed'
            }
        }

        // ── Stage 4: Unit Tests ────────────────────────
        stage('Test') {
            parallel {
                stage('Auth Service Tests') {
                    steps {
                        sh 'npm run test --workspace=services/auth-service'
                    }
                }
                stage('API Gateway Tests') {
                    steps {
                        sh 'npm run test --workspace=services/api-gateway'
                    }
                }
                stage('Transaction Service Tests') {
                    steps {
                        sh 'npm run test --workspace=services/transaction-service'
                    }
                }
                stage('Graph Sync Tests') {
                    steps {
                        sh 'npm run test --workspace=services/graph-sync-service'
                    }
                }
                stage('Detection Worker Tests') {
                    steps {
                        sh 'npm run test --workspace=services/detection-worker'
                    }
                }
                stage('Alert Service Tests') {
                    steps {
                        sh 'npm run test --workspace=services/alert-service'
                    }
                }
            }
        }

        // ── Stage 5: Docker Build (Phase 4) ────────────
        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    docker build -t $DOCKERHUB_CREDS_USR/fraud-api-gateway:latest     services/api-gateway
                    docker build -t $DOCKERHUB_CREDS_USR/fraud-auth-service:latest     services/auth-service
                    docker build -t $DOCKERHUB_CREDS_USR/fraud-transaction-svc:latest  services/transaction-service
                    docker build -t $DOCKERHUB_CREDS_USR/fraud-graph-sync:latest       services/graph-sync-service
                    docker build -t $DOCKERHUB_CREDS_USR/fraud-detection-worker:latest services/detection-worker
                    docker build -t $DOCKERHUB_CREDS_USR/fraud-alert-service:latest    services/alert-service
                '''
                echo '✅ Docker images built'
            }
        }

        // ── Stage 6: Docker Push (Phase 4) ─────────────
        stage('Docker Push') {
            when {
                branch 'main'
            }
            steps {
                sh '''
                    echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin
                    docker push $DOCKERHUB_CREDS_USR/fraud-api-gateway:latest
                    docker push $DOCKERHUB_CREDS_USR/fraud-auth-service:latest
                    docker push $DOCKERHUB_CREDS_USR/fraud-transaction-svc:latest
                    docker push $DOCKERHUB_CREDS_USR/fraud-graph-sync:latest
                    docker push $DOCKERHUB_CREDS_USR/fraud-detection-worker:latest
                    docker push $DOCKERHUB_CREDS_USR/fraud-alert-service:latest
                '''
                echo '✅ Docker images pushed to DockerHub'
            }
        }

        // ── Stage 7: Deploy (Phase 4) ──────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Deploying to production...'
                // TODO: Phase 4 — SSH deploy to VPS
                // sshagent(['vps-ssh-key']) {
                //     sh '''
                //         ssh $VPS_USER@$VPS_HOST "cd /opt/fraud-detection && docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
                //     '''
                // }
                echo '✅ Deployment complete (placeholder for Phase 4)'
            }
        }
    }

    post {
        success {
            echo '🎉 Pipeline completed successfully!'
            // TODO: Phase 4 — Slack notification
            // slackSend(channel: SLACK_CHANNEL, color: 'good', message: "✅ Build #${BUILD_NUMBER} passed on ${BRANCH_NAME}")
        }
        failure {
            echo '❌ Pipeline failed!'
            // TODO: Phase 4 — Slack notification
            // slackSend(channel: SLACK_CHANNEL, color: 'danger', message: "❌ Build #${BUILD_NUMBER} failed on ${BRANCH_NAME}")
        }
        always {
            cleanWs()
        }
    }
}
