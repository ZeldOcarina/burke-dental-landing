const EXCLUDED_PATHS = []

module.exports = {
    siteMetadata: {
        siteUrl: "https://burke-dental-landing.monarchy.io",
    },
    "plugins": [
        {
            "resolve": "@zeldocarina/gatsby-theme-dgp-landing",
            "options": {
                airtableApiKey: process.env.AIRTABLE_API_KEY,
            }
        },
        {
            resolve: "gatsby-plugin-robots-txt",
            options: {
                policy: [
                    { userAgent: "Googlebot", allow: "*", disallow: EXCLUDED_PATHS },
                    {
                        userAgent: "msnbot|BingBot",
                        allow: "/",
                        disallow: EXCLUDED_PATHS,
                    },
                    {
                        userAgent: "DuckDuckBot",
                        allow: "/",
                        disallow: EXCLUDED_PATHS,
                    },
                    {
                        userAgent: "*",
                        disallow: "*",
                    },
                ],
            },
        },
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                excludes: EXCLUDED_PATHS,
            },
        },
    ]
}
