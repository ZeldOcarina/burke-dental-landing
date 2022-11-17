const dotenv = require("dotenv");
const SiteDeployer = require("./scripts-helpers/SiteDeployer");

dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
});

async function main() {
    await new SiteDeployer().deploy();
}

main();
