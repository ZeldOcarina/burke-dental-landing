// Declare a variable business_name
def business_name = "burke-dental-landing"

pipeline {
    agent any
    parameters{
        booleanParam(name: 'CLEAN_DEPLOYMENT', defaultValue: false, description: 'Do you want to run a clean deployment?')
    }
    stages {
        stage("Check Environment"){
            steps {
                script {
                    echo "Currently built business is ${business_name}"
                    echo "PATH is: ${env.PATH}"
                    echo "current environment is located at ${env.WORKSPACE}"
                    sh "node -v"
                    sh "yarn -v"
                    sh "npm -v"
                    sh "whoami"
                    sh "ls -lsa"
                }
            }
        }
        stage("Clean Up"){
            steps {
                script {
                    if (params.CLEAN_DEPLOYMENT == true) {
                        sh "rm -rf node_modules yarn.lock"

                        dir("backend") {
                            sh "rm -rf node_modules yarn.lock"
                        }
                        echo "Directories fully cleaned up"
                    }
                }
            }
        }
        stage("Install Dependencies"){
            environment {
                NPM_TOKEN = credentials('NPM_TOKEN')
            }
            steps {
                sh 'export NPM_TOKEN=${NPM_TOKEN}'
                script {
                    if(params.CLEAN_DEPLOYMENT != true) {
                        // Upgrade all packages
                        sh "yarn install"
                        sh "yarn upgrade"
                    } else {
                        sh "yarn install"
                    }
                }
                dir("backend") {
                    sh "yarn install"
                }                    
            }
        }
        stage("Build"){
            environment {
                NPM_TOKEN = credentials('NPM_TOKEN')
            }
            steps {
                script {
                    sh 'export NPM_TOKEN=${NPM_TOKEN}'
                    sh "cp /var/lib/jenkins/workspace/secrets/${business_name}/.env.production ."
                    dir("backend") {
                        sh "sudo cp /var/lib/jenkins/workspace/secrets/${business_name}/.env ."
                    }
                    dir("${env.WORKSPACE}") {
                        if (params.CLEAN_DEPLOYMENT == true) {
                            sh "yarn clean"
                        }
                    sh "yarn build"
                    }                
                }
            }
        }
        stage("Move Assets"){
            steps {   
                script {
                sh """
                    sudo rm -rf /var/www/html/${business_name}/*
                    sudo cp -r public /var/www/html/${business_name}/
                    sudo cp -r backend /var/www/html/${business_name}/
                    sudo mkdir /var/www/html/${business_name}/backend/logs
                    sudo chown -R mattiarasulo:www-data /var/www/html/${business_name}/
                    sudo chown -R mattiarasulo:www-data /var/www/html/${business_name}/*
                    sudo chmod -R 776 /var/www/html/${business_name}/
                    sudo chmod -R 776 /var/www/html/${business_name}/*
                    sudo -u mattiarasulo /home/mattiarasulo/.nvm/versions/node/v18.6.0/bin/pm2 reload /var/www/html/${business_name}/backend/ecosystem.config.js
                """                        
                }
                
            }
        }
    }
}
