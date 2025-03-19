pipeline {
    agent {
        docker {
            image 'node:22'
            reuseNode true
            args '-u 0:0'
        }
    }
    stages {
        stage('Install pnpm') {
            steps {
                sh 'npm i -g pnpm'
            }
        }
        stage('Install dependencies') {
            steps {
                sh 'pnpm i'
            }
        }
        stage('Build project') {
            steps {
                sh 'pnpm run build'
            }
        }
    }
}