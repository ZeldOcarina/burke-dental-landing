const dotenv = require("dotenv");
const GatsbyPrebuilder = require("./scripts-helpers/GatsbyPrebuilder");

dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
});

async function main() {
    await new GatsbyPrebuilder().prebuild();
}

main();
