const express = require("express");
const cors = require("cors");
const path = require("path");

const {
    createLink,
    getLink,
    increaseClicks,
    getAllLinks,
    deleteLink,
    getAnalytics
} = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================
// MIDDLEWARE
// ==========================

app.use(cors());

app.use(express.json());


// ==========================
// FRONTEND SERVE
// ==========================

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ==========================
// GENERATE SHORT CODE
// ==========================

function generateCode(length = 6) {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let code = "";

    for (let i = 0; i < length; i++) {

        code += characters.charAt(
            Math.floor(
                Math.random() * characters.length
            )
        );

    }

    return code;
}


// ==========================
// URL VALIDATION
// ==========================

function isValidURL(url) {

    try {

        new URL(url);

        return true;

    } catch {

        return false;

    }

}

// ==========================
// CREATE SHORT URL
// ==========================

app.post("/api/shorten", (req, res) => {

    try {

        const {
            originalUrl,
            customAlias,
            expiry
        } = req.body;


        // URL required

        if (!originalUrl) {

            return res.status(400).json({

                error:
                    "Original URL is required"

            });

        }

        // Validate URL

        if (!isValidURL(originalUrl)) {

            return res.status(400).json({

                error:
                    "Please enter a valid URL"

            });

        }


        let code;


        // ==========================
        // CUSTOM ALIAS
        // ==========================

        if (customAlias) {

            code =
                customAlias.trim();


            // Only letters, numbers, - and _

            if (
                !/^[a-zA-Z0-9_-]+$/.test(code)
            ) {

                return res.status(400).json({

                    error:
                        "Alias can contain only letters, numbers, - and _"

                });

            }


            // Check duplicate

            if (getLink(code)) {

                return res.status(409).json({

                    error:
                        "This custom alias already exists"

                });

            }

        }

        // ==========================
        // RANDOM CODE
        // ==========================

        else {

            do {

                code =
                    generateCode();

            } while (
                getLink(code)
            );

        }


        // ==========================
        // EXPIRY
        // ==========================

        let expiresAt = null;


        if (
            expiry &&
            expiry !== "never"
        ) {

            const days =
                Number(expiry);


            if (
                !isNaN(days) &&
                days > 0
            ) {

                expiresAt =
                    new Date(
                        Date.now() +
                        days *
                        24 *
                        60 *
                        60 *
                        1000
                    ).toISOString();

            }

        }


        // ==========================
        // SAVE LINK
        // ==========================

        createLink(
            code,
            originalUrl,
            expiresAt
        );


        // ==========================
        // CREATE SHORT URL
        // ==========================

        const shortUrl =
            `${req.protocol}://${req.get("host")}/${code}`;


        res.json({

            success: true,

            shortUrl: shortUrl,

            code: code,

            originalUrl: originalUrl,

            expiresAt: expiresAt

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Internal server error"

        });

    }

});


// ==========================
// REDIRECT SHORT URL
// ==========================

app.get("/:code", (req, res) => {

    try {

        const code =
            req.params.code;


        const link =
            getLink(code);


        // Link not found

        if (!link) {

            return res.status(404).send(`

                <h1>404 - Link Not Found</h1>

                <p>This short URL does not exist.</p>

                <a href="/">Go Home</a>

            `);

        }


        // ==========================
        // CHECK EXPIRY
        // ==========================

        if (
            link.expires_at &&
            new Date(link.expires_at) < new Date()
        ) {

            return res.status(410).send(`

                <h1>Link Expired</h1>

                <p>This short URL has expired.</p>

                <a href="/">Go Home</a>

            `);

        }


        // ==========================
        // COUNT CLICK
        // ==========================

        increaseClicks(code);


        // ==========================
        // REDIRECT
        // ==========================

        res.redirect(
            link.original_url
        );


    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Server error"
        );

    }

});

// ==========================
// ANALYTICS
// ==========================

// ==========================
// ANALYTICS
// ==========================

app.get("/api/analytics", (req, res) => {

    try {

        const analytics =
            getAnalytics();


        res.json(
            analytics
        );


    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Unable to fetch analytics"

        });

    }

});
// ==========================
// GET ALL LINKS
// ==========================

app.get("/api/links", (req, res) => {

    try {

        const links =
            getAllLinks();

        res.json(links);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            error:
                "Unable to fetch links"

        });

    }

});

// ==========================
// DELETE LINK
// ==========================

app.delete(
    "/api/links/:id",
    (req, res) => {

        try {

            const id =
                Number(req.params.id);


            deleteLink(id);


            res.json({

                success: true

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                error:
                    "Unable to delete link"

            });

        }

    }
);


// ==========================
// START SERVER
// ==========================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log("================================");
        console.log("🚀 Linkify3D Server Started");
        console.log("================================");
        console.log(
            `🌐 http://localhost:${PORT}`
        );
        console.log("");
        console.log(
            "Press CTRL + C to stop server"
        );
        console.log("");

    }
);
