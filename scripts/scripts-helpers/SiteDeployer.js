const fs = require("fs");
const path = require("path");
const { exec } = require('node:child_process');
const { promisify } = require('node:util');

const { NodeSSH } = require('node-ssh')
const tar = require('tar');

const chalk = require("chalk");

const GatsbyPrebuilder = require("./GatsbyPrebuilder");
const { spawn } = require("child_process");

class SiteDeployer extends GatsbyPrebuilder {
    constructor() {
        super();
        this.ssh;
        this.port;
        this.siteUrl;
        this.serverName;
        this.isSecure = false;
        this.tarPath;
    }

    async deploy() {
        try {
            await this.prebuild();
            await this.build();
            await this.setPrebuildVariables();
            await this.userConfirmation();
            await this.createSSHConnection();
            await this.findOpenPort();
            await this.parseNGINXSetupFile();
            await this.scpEnvFiles();
            await this.moveNGINXSetupFileToServer();
            if (!this.isSecure) await this.secureWithCertbot();
            else console.log(chalk.blue("info ") + "Site is already secure. Skipping certbot step.");
            await this.installBackendPackages();
            await this.createTarFile();
            await this.createSiteFolderInTheServer();
            await this.scpTarFile();
            await this.extractTarFile();
            await this.setServerPermissions();
            await this.startNodeServer();

            // Congratulate with the user with emojis
            console.log(chalk.green("success ") + `🎉🥳 Site deployed successfully to ${this.serverName} 🎉🥳`);
            // End process gently
        } catch (error) {
            console.log(chalk.red("error ") + "Error deploying site");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        } finally {
            if (this.ssh) this.ssh.dispose();
            // Close the node process gently
            process.exit(0);
        }
    }

    async build() {
        try {
            console.log(chalk.blue("info ") + "Building site ...");
            console.log(chalk.blue("info ") + "Please wait ...");

            const buildPromise = new Promise((resolve, reject) => {
                const buildProcess = spawn("gatsby", ["build"], { cwd: process.cwd() });
                // Log the output of the build command
                buildProcess.stdout.on("data", (data) => {
                    console.log(data.toString());
                });
                buildProcess.on("exit", (code) => {
                    if (code === 0) resolve();
                    else reject(new Error("Build failed"));
                });
            });

            await buildPromise;
            console.log(chalk.green("success ") + "Site built successfully");
        } catch (error) {
            console.log(chalk.red("error ") + "Error building site");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async createSSHConnection() {
        try {
            const privateKey = fs.readFileSync(process.env.SSH_KEY_PATH, "utf8");
            this.ssh = new NodeSSH();

            await this.ssh.connect({
                host: "server.monarchy.io",
                username: "root",
                privateKey,
            });
        } catch (error) {
            console.log(chalk.red("error ") + "Error creating SSH connection");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async userConfirmation() {
        try {
            console.log(chalk.blue("info ") + "Please confirm the following information:");
            console.log(chalk.blue("info ") + `Site URL: ${this.siteUrl}`);
            console.log(chalk.blue("info ") + `Programmatic Business Name: ${this.programmaticBusinessName}`);
            const isOkToContinue = await this.constructor.askQuestion("Are you sure you want to deploy the site? (y/n) ");
            if (isOkToContinue.toLowerCase() !== "y") {
                console.log(chalk.blue("info ") + "Site deployment cancelled");
                process.exit(0);
            }
            console.log(chalk.blue("success ") + `User approval registered. Beginning ${this.siteUrl} deployment ...`);
        } catch (error) {
            console.log(chalk.red("error ") + "Error asking user confirmation");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async findOpenPort() {
        try {
            // Find open port in the server
            const openPort = await this.ssh.execCommand("/root/.nvm/versions/node/v18.6.0/bin/open-port-finder", { cwd: "/etc/nginx/sites-available" });
            this.port = parseInt(openPort.stdout.trim());

            if (!this.port) throw new Error("Could not find open port");
            // Check if port is a number and is valid
            if (isNaN(this.port) || this.port < 3000 || this.port > 4000) throw new Error("Invalid port number");

            console.log(chalk.green("success ") + `Assigned open port: ${this.port}`);
        } catch (error) {
            console.log(chalk.red("error ") + "Error finding open port");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async parseNGINXSetupFile() {
        let newNginxConfigFileContent;
        const currentNginxConfFile = fs.readFileSync(path.join(process.cwd(), "config", "nginx.conf"), "utf8");
        // Make a new server_name by stripping the protocol, the www., the / and any path name from this.siteUrl
        this.serverName = this.siteUrl.replace(/(^\w+:|^)\/\//, "").replace("www.", "").replace(/\/.*/, "");

        console.log(chalk.blue("info ") + `New server_name: ${this.serverName}`);

        // Replace the server_name line in the nginx.conf file with the new server_name
        newNginxConfigFileContent = currentNginxConfFile.replace(/server_name.*;/, `server_name ${this.serverName};`);

        // Replace the root line with the new root line by changing the business name
        newNginxConfigFileContent = newNginxConfigFileContent.replace(/root.*;/, `root /var/www/html/${this.programmaticBusinessName}/public;`);

        // Replace the access log line access_log /var/log/nginx/{{ SITE_URL }}.access.log; with the new access log line by changing the site url
        newNginxConfigFileContent = newNginxConfigFileContent.replace(/access_log.*;/, `access_log /var/log/nginx/${this.serverName}.access.log;`);

        // Replace the error log line error_log /var/log/nginx/{{ SITE_URL }}.error.log; with the new error log line by changing the site url
        newNginxConfigFileContent = newNginxConfigFileContent.replace(/error_log.*;/, `error_log /var/log/nginx/${this.serverName}.error.log;`);

        // Replace the proxy_pass line with the new proxy_pass line by changing the port
        // Check if file already exists on the server and change port number if not, so that the port number is always the same
        const fileExists = await this.ssh.execCommand(`test -f /etc/nginx/sites-available/${this.serverName} && echo "exists" || echo "does not exist"`, { cwd: "/etc/nginx/sites-available" });
        if (fileExists.stdout.trim() === "does not exist") {
            newNginxConfigFileContent = newNginxConfigFileContent.replace(/proxy_pass.*;/, `proxy_pass "http://localhost:${this.port}";`);
        }

        // Change backend PORT in backend/.env file
        const backendEnvFile = fs.readFileSync(path.join(process.cwd(), "backend", ".env"), "utf8");
        const newBackendEnvFile = backendEnvFile.replace(/PORT=.*/, `PORT=${this.port}`);
        fs.writeFileSync(path.join(process.cwd(), "backend", ".env"), newBackendEnvFile);

        console.log(chalk.green("success ") + "Changed .env file port value");

        console.log(chalk.green("success ") + "Basic configuration file without SSL parsed");
        console.log(chalk.blue("info ") + "Checking if domain is already secured");

        // Check if this.serverName is already secure
        const isSecure = await this.ssh.execCommand(`certbot certificates | grep ${this.serverName}`, { cwd: "/etc/nginx/sites-available" });

        this.isSecure = isSecure.stdout.trim() !== "";

        if (!this.isSecure) {
            console.log(chalk.blue("info ") + "Domain is not secure. Skipping SSL configuration for now.");

            // Write the new nginx.conf file
            fs.writeFileSync(path.join(process.cwd(), "config", `${this.serverName}.conf`), newNginxConfigFileContent, "utf8");
            return;
        }

        console.log(chalk.blue("info ") + `Site is already secure`);
        console.log(chalk.blue("info ") + `Applying SSL configuration to new NGINX config file`);

        // Replace listen 80 with listen 443 ssl;
        newNginxConfigFileContent = newNginxConfigFileContent.replace(/listen 80;/, `listen 443 ssl;`);
        // Add new lines with the ssl_certificate line, the ssl_certificate_key line, the include line and the ssl_dhparam line
        newNginxConfigFileContent = newNginxConfigFileContent.replace(/listen 443 ssl;/, `
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/${this.serverName}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${this.serverName}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;`);

        // Add a new server block for the http to https redirect and to check if the host name = server_name
        newNginxConfigFileContent += `

server {
    if ($host = ${this.serverName}) {
        return 301 https://$host$request_uri;
    } # Managed by Monarchy Automation

    listen 80;
    server_name ${this.serverName};
    return 404; # managed by Monarchy Automation
}
        `;

        // Write the new nginx.conf file
        fs.writeFileSync(path.join(process.cwd(), "config", `${this.serverName}.conf`), newNginxConfigFileContent, "utf8");

        console.log(chalk.green("success ") + `New NGINX config file created`);
    }

    async moveNGINXSetupFileToServer() {
        try {
            // Move the new nginx.conf file to the server and overwrite the old one
            await this.ssh.putFile(path.join(process.cwd(), "config", `${this.serverName}.conf`), `/etc/nginx/sites-available/${this.serverName}.conf`);

            // Remove the old nginx.conf file in the local system if it exists
            if (fs.existsSync(path.join(process.cwd(), "config", `${this.serverName}.conf`))) {
                fs.unlinkSync(path.join(process.cwd(), "config", `${this.serverName}.conf`));
            }

            // Remove the old `${this.serverName}.conf` symlink in sites-enabled in the server if it exists
            await this.ssh.execCommand(`rm -f /etc/nginx/sites-enabled/${this.serverName}.conf`, { cwd: "/etc/nginx/sites-enabled" });

            // Create a symlink to the nginx.conf file in the sites-enabled folder
            await this.ssh.execCommand(`ln -s /etc/nginx/sites-available/${this.serverName}.conf /etc/nginx/sites-enabled/${this.serverName}.conf`, { cwd: "/etc/nginx/sites-available" });

            // Make sure nginx -t passes
            const nginxTest = await this.ssh.execCommand("nginx -t", { cwd: "/etc/nginx/sites-available" });
            // Check if stderr ends in "test is successful"
            console.log(chalk.blue("info ") + nginxTest.stderr);
            if (!nginxTest.stderr.trim().endsWith("test is successful")) throw new Error("Nginx test failed");

            // Restart nginx
            await this.ssh.execCommand("systemctl restart nginx", { cwd: "/etc/nginx/sites-available" });

            console.log(chalk.green("success ") + `Successfully deployed NGINX config to ${this.serverName}`);
        } catch (error) {
            console.log(chalk.red("error ") + "Error moving nginx.conf file to server");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async secureWithCertbot() {
        try {
            console.log(chalk.blue("info ") + "Securing with Certbot...");

            // Run certbot
            const certbotResponse = await this.ssh.execCommand(`certbot --nginx -d ${this.serverName} --non-interactive --agree-tos`, { cwd: "/etc/nginx" });

            console.info(chalk.blue("info ") + certbotResponse.stdout);
            console.info(chalk.blue("info ") + certbotResponse.stderr);

            // Check if command was successful
            if (!certbotResponse.stdout.includes("Congratulations!") && !certbotResponse.stderr.includes("Congratulations!")) {
                throw new Error("Certbot command failed");
            }

            // Restart nginx
            //await this.ssh.execCommand("systemctl restart nginx", { cwd: "/etc/nginx/sites-available" });
            console.log(chalk.green("success ") + `Successfully secured ${this.serverName} with certbot`);
        } catch (error) {
            console.log(chalk.red("error ") + "Error securing server with certbot");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async installBackendPackages() {
        try {
            console.log(chalk.blue("info ") + "Installing backend packages...");

            // Promisify the exec function
            const promisedExec = promisify(exec);

            // Run yarn install in the backend folder
            const { stdout, stderr } = await promisedExec("yarn install", { cwd: path.join(process.cwd(), "backend") });

            console.log(chalk.blue("info stdout:") + stdout);
            console.log(chalk.blue("info stderr:") + stderr);
        } catch (error) {
            console.log(chalk.red("error ") + "Error installing backend packages");
            console.error(error.message);
            console.error(error.stack);
            process.exit(1);
        }
    }

    async createTarFile() {
        try {
            console.log(chalk.blue("info ") + "creating a tar file...");
            this.tarPath = path.join(process.cwd(), "build.tar.gz");
            // Remove the tar file if it exists
            if (fs.existsSync(this.tarPath)) {
                fs.unlinkSync(this.tarPath);
            }
            // Create the tar file
            await tar.create({
                gzip: true,
                file: this.tarPath,
                portable: true
            },
                ["public", "backend"]
            );

            let total = 0;
            // This takes a few seconds, but lets us show the progress
            tar.t({
                sync: true,
                file: this.tarPath,
                onentry() {
                    total += 1;
                },
            });

            // log the total
            console.log(chalk.green("success ") + `Total files placed in the tar archive: ${total}`);
        } catch (err) {
            console.log(chalk.red("error ") + "Error moving build to server");
            console.log(chalk.red("error ") + err.message);
            console.log(err.stack);
            process.exit(1);
        }
    }

    async createSiteFolderInTheServer() {
        try {
            console.log(chalk.blue("info ") + "folder name to be created: " + this.programmaticBusinessName);
            console.log(chalk.blue("info ") + "Checking if the site folder already exists in the server...");

            // Check if the site folder exists already at /var/www/html/${this.programmaticBusinessName}
            const siteFolderExists = await this.ssh.execCommand(`test -d /var/www/html/${this.programmaticBusinessName} && echo "exists"`, { cwd: "/var/www/html" });

            // If the site folder exists, delete it
            if (siteFolderExists.stdout.includes("exists")) {
                console.log(chalk.blue("info ") + "Site folder exists already. Deleting it...");
                await this.ssh.execCommand(`rm -rf /var/www/html/${this.programmaticBusinessName}`, { cwd: "/var/www/html" });

                // Check if the site folder was deleted successfully
                const siteFolderExistsAfterDeletion = await this.ssh.execCommand(`test -d /var/www/html/${this.programmaticBusinessName} && echo "exists"`, { cwd: "/var/www/html" });
                if (siteFolderExistsAfterDeletion.stdout.includes("exists")) throw new Error("Could not delete site folder");
                console.log(chalk.green("success ") + "Site folder deleted successfully");
            }

            // Create the site folder
            await this.ssh.execCommand(`mkdir /var/www/html/${this.programmaticBusinessName}`, { cwd: "/var/www/html" });

            // Check if folder was created successfully
            const siteFolderExists2 = await this.ssh.execCommand(`test -d /var/www/html/${this.programmaticBusinessName} && echo "exists"`, { cwd: "/var/www/html" });
            if (!siteFolderExists2.stdout.includes("exists")) throw new Error("Site folder was not created successfully");

            console.log(chalk.green("success ") + `Successfully created site folder in the server`);
        } catch (error) {
            console.log(chalk.red("error ") + "Error creating site folder in the server");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async scpTarFile() {
        try {
            // Check if the tar file exists and delete it if it does
            const tarFileExists = await this.ssh.execCommand(`test -f /var/www/html/${this.programmaticBusinessName}/build.tar.gz && echo "exists"`, { cwd: "/var/www/html" });
            if (tarFileExists.stdout.includes("exists")) {
                console.log(chalk.blue("info ") + "Tar file exists already in the server. Deleting it ...");
                await this.ssh.execCommand(`rm /var/www/html/${this.programmaticBusinessName}/build.tar.gz`, { cwd: "/var/www/html" });

                // Check if the tar file was deleted successfully
                const tarFileExistsAfterDeletion = await this.ssh.execCommand(`test -f /var/www/html/${this.programmaticBusinessName}/build.tar.gz && echo "exists"`, { cwd: "/var/www/html" });
                if (tarFileExistsAfterDeletion.stdout.includes("exists")) throw new Error("Could not delete tar file");
                console.log(chalk.green("success ") + "Tar file deleted successfully");
            }

            console.log(chalk.blue("info ") + "Copying tar file to the server ...");

            await this.ssh.putFile(`${process.cwd()}/build.tar.gz`, `/var/www/html/${this.programmaticBusinessName}/build.tar.gz`, null, {
                step: (total_transferred, _, total) => {
                    // Show a progress bar
                    process.stdout.write("[" + "#".repeat(Math.round((total_transferred / total) * 20)) + " ".repeat(20 - Math.round((total_transferred / total) * 20)) + "] " + Math.round((total_transferred / total) * 100) + "%\r");
                }
            });

            // Check if the tar file was copied successfully
            const tarFileExists2 = await this.ssh.execCommand(`test -f /var/www/html/${this.programmaticBusinessName}/build.tar.gz && echo "exists"`, { cwd: "/var/www/html" });
            if (!tarFileExists2.stdout.includes("exists")) throw new Error("Tar file was not copied successfully");
            console.log(chalk.green("success ") + "Tar file copied successfully");
        } catch (error) {
            console.log(chalk.red("error ") + "Error copying tar file to the server");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async extractTarFile() {
        try {
            console.log(chalk.blue("info ") + "Extracting tar file ...");

            await this.ssh.execCommand(`tar -xzf /var/www/html/${this.programmaticBusinessName}/build.tar.gz -C /var/www/html/${this.programmaticBusinessName}`, { cwd: "/var/www/html" });

            console.log(chalk.green("success ") + "Tar file extracted successfully");

            // List files in the site folder
            const files = await this.ssh.execCommand(`ls -lsa /var/www/html/${this.programmaticBusinessName}`, { cwd: "/var/www/html" });

            console.log(chalk.green("info ") + "Current remote directory contents:");
            console.log(files.stdout);

            // Delete the tar file
            await this.ssh.execCommand(`rm /var/www/html/${this.programmaticBusinessName}/build.tar.gz`, { cwd: "/var/www/html" });

            // Check if the tar file was deleted successfully
            const tarFileExistsAfterDeletion = await this.ssh.execCommand(`test -f /var/www/html/${this.programmaticBusinessName}/build.tar.gz && echo "exists"`, { cwd: "/var/www/html" });
            if (tarFileExistsAfterDeletion.stdout.includes("exists")) throw new Error("Could not delete tar file");
            console.log(chalk.green("success ") + "Tar file artifact deleted successfully");

            // Unlink local tar file
            if (fs.existsSync(this.tarPath)) {
                fs.unlinkSync(this.tarPath);
            }
            // Check if the tar file was deleted successfully
            if (fs.existsSync(this.tarPath)) throw new Error("Could not delete local tar file");
            console.log(chalk.green("success ") + "Local tar file artifact deleted successfully");
        } catch (error) {
            console.log(chalk.red("error ") + "Error extracting tar file");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async setServerPermissions() {
        try {
            console.log(chalk.blue("info ") + "Setting server permissions ...");

            await this.ssh.execCommand(`chown -R mattiarasulo:www-data /var/www/html/${this.programmaticBusinessName}`, { cwd: "/var/www/html" });
            await this.ssh.execCommand(`chown -R mattiarasulo:www-data /var/www/html/${this.programmaticBusinessName}/*`, { cwd: "/var/www/html" });
            await this.ssh.execCommand(`chmod -R 776 /var/www/html/${this.programmaticBusinessName}`, { cwd: "/var/www/html" });
            await this.ssh.execCommand(`chmod -R 776 /var/www/html/${this.programmaticBusinessName}/*`, { cwd: "/var/www/html" });

            console.log(chalk.green("success ") + "Server permissions set successfully");
        } catch (error) {
            console.log(chalk.red("error ") + "Error setting server permissions");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }

    async startNodeServer() {
        try {
            // Create a logs folder if it doesn't exist in the server
            await this.ssh.execCommand(`mkdir -p /var/www/html/${this.programmaticBusinessName}/backend/logs`, { cwd: "/var/www/html" });

            // Change the permissions of the logs folder
            await this.ssh.execCommand(`chown -R mattiarasulo:www-data /var/www/html/${this.programmaticBusinessName}/backend/logs`, { cwd: "/var/www/html" });
            await this.ssh.execCommand(`chmod -R 776 /var/www/html/${this.programmaticBusinessName}/backend/logs`, { cwd: "/var/www/html" });

            console.log(chalk.blue("info ") + "Starting node server ...");
            const result = await this.ssh.execCommand(`sudo -u mattiarasulo /home/mattiarasulo/.nvm/versions/node/v18.6.0/bin/pm2 start /var/www/html/${this.programmaticBusinessName}/backend/ecosystem.config.js`, { cwd: `/var/www/html/${this.programmaticBusinessName}/backend` });

            console.log(result);

            console.log(chalk.green("success ") + "Node server started successfully");
        } catch (error) {
            console.log(chalk.red("error ") + "Error starting node server");
            console.log(chalk.red("error ") + error.message);
            console.log(error.stack);
            process.exit(1);
        }
    }
}

module.exports = SiteDeployer;
