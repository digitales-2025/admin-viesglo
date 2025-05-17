pipeline {
    agent any
    environment {
        //
        // Build config
        //
        PROJECT_NAME = "msm"
        PROJECT_SERVICE = "frontend"
        PROJECT_STAGE = "develop"
        PROJECT_TRIPLET = "${PROJECT_NAME}-${PROJECT_SERVICE}-${PROJECT_STAGE}"

        //
        // VPS setup
        //
        REMOTE_USER = "docker_admin"
        REMOTE_IP = "116.203.105.37"
        REMOTE_FOLDER = "/opt/docker/compose/projects/${PROJECT_NAME}-${PROJECT_STAGE}"

        //
        // Docker registry setup
        //
        REGISTRY_CREDENTIALS = "dockerhub-digitalesacide-credentials"
        REGISTRY_URL = "docker.io"
        REGISTRY_USER = "digitalesacide"
        REGISTRY_REPO = "${PROJECT_TRIPLET}"
        FULL_REGISTRY_URL = "${REGISTRY_URL}/${REGISTRY_USER}/${REGISTRY_REPO}"
        ESCAPED_REGISTRY_URL = "${REGISTRY_URL}\\/${REGISTRY_USER}\\/${REGISTRY_REPO}"

        // SSH command
        SSH_COM = "ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP}"
        SSH_CRED = "ssh-id_docker_admin"
    }
    stages {
        stage("Build & push image") {
            steps {
                script {
                    withDockerRegistry(credentialsId: "${REGISTRY_CREDENTIALS}") {
                        def image = docker.build("${FULL_REGISTRY_URL}:${BUILD_NUMBER}", "-f deploy/Dockerfile.dev .")
                        image.push()
                        image.push("latest")
                    }
                }
            }
        }
        stage("Restart backend service") {
            steps {
                script {
                    def config = readYaml file: 'deploy/env.yaml'
                    def env = config.develop.frontend

                    def nonSensitiveVars = env.nonsensitive.collect { k, v -> "${k}=${v}" }
                    def sensitiveVars = env.sensitive

                    def credentialsList = sensitiveVars.collect { 
                        string(credentialsId: it, variable: it)
                    }

                    withCredentials(credentialsList) {
                        sshagent([SSH_CRED]) {
                            // Create a temporary script that will create the .env file
                            // This enables us to use shell variables to properly handle 
                            // the credentials without using binding.getVariable()
                            sh """
                                cat > ${WORKSPACE}/create_env.sh << 'EOL'
#!/bin/bash
cat << EOF
# Non-sensitive variables
MSM_FRONTEND_VERSION=${BUILD_NUMBER}
${nonSensitiveVars.join('\n')}
# Sensitive variables
${sensitiveVars.collect { varName -> "${varName}=\${${varName}}" }.join('\n')}
EOF
EOL
                                chmod +x ${WORKSPACE}/create_env.sh
                            """

                            // Execute the script to generate env content and send it to remote
                            sh """
                                ${WORKSPACE}/create_env.sh | ${SSH_COM} 'umask 077 && cat > ${REMOTE_FOLDER}/.env.frontend'
                            """

                            // populate & restart
                            sh """
                                ${SSH_COM} 'cd ${REMOTE_FOLDER} && \
                                docker pull ${FULL_REGISTRY_URL}:${BUILD_NUMBER} && \
                                (rm .env || true) && \
                                touch .env.base && \
                                touch .env.backend && \
                                touch .env.frontend && \
                                cat .env.base >> .env && \
                                cat .env.backend >> .env && \
                                cat .env.frontend >> .env && \
                                docker compose up -d'
                            """
                        }
                    }
                }
            }
        }
    }
}




pipeline {
    agent any
    environment {
        // Credentials for jenkins to access private github repos
        GITHUB_CREDENTIALS = "8d51209e-434f-4761-bb3d-1f9e3974d0b1"

        //
        // Build config
        //
        // prefix of the image to build, config triplet
        //  <project>-<service>-<stage>
        PROJECT_NAME = "msm"
        PROJECT_SERVICE = "frontend"
        PROJECT_STAGE = "develop"
        PROJECT_TRIPLET = "${PROJECT_NAME}-${PROJECT_SERVICE}-${PROJECT_STAGE}"

        //
        // VPS setup
        //
        REMOTE_USER = "ansible"
        REMOTE_IP = credentials("acide-elastika-01")
        // Folder where docker-compose and .env files are placed
        REMOTE_FOLDER = "/home/${REMOTE_USER}/docker/${PROJECT_NAME}-${PROJECT_STAGE}/"

        //
        // Docker registry setup
        //
        REGISTRY_CREDENTIALS = "dockerhub-digitalesacide-credentials"
        REGISTRY_URL = "docker.io"
        REGISTRY_USER = "digitalesacide"
        REGISTRY_REPO = "${PROJECT_TRIPLET}"
        FULL_REGISTRY_URL = "${REGISTRY_URL}/${REGISTRY_USER}/${REGISTRY_REPO}"
        ESCAPED_REGISTRY_URL = "${REGISTRY_URL}\\/${REGISTRY_USER}\\/${REGISTRY_REPO}"

        // SSH command
        SSH_COM = "ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${REMOTE_IP}"
    }

    stages {
        stage("Build & push image") {
            steps {
                sh "cp deploy/Dockerfile.dev ./Dockerfile"
                script {
                    withDockerRegistry(credentialsId: "${REGISTRY_CREDENTIALS}") {
                        def image = docker.build("${FULL_REGISTRY_URL}:${BUILD_NUMBER}")
                        image.push()
                    }
                }
                sh "rm Dockerfile || true"
            }
        }
        stage("Restart backend service") {
            steps {
                sshagent(['ssh-deploy']) {
                    // Replace docker image version
                    sh "${SSH_COM} 'cd ${REMOTE_FOLDER} && sed -i -E \"s/image: ${ESCAPED_REGISTRY_URL}:.+\$/image: ${ESCAPED_REGISTRY_URL}:${BUILD_NUMBER}/\" docker-compose.yml'"
                    sh "${SSH_COM} 'cd ${REMOTE_FOLDER} && docker compose up -d --no-deps ${PROJECT_TRIPLET}'"
                }
            }
        }
    }
}
