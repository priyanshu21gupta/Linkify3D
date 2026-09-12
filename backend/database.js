const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "data.json");


// ==========================================
// DATABASE CREATE
// ==========================================

if (!fs.existsSync(dbFile)) {

    fs.writeFileSync(
        dbFile,
        "[]"
    );

}


// ==========================================
// READ DATABASE
// ==========================================

function readDatabase() {

    const data =
        fs.readFileSync(
            dbFile,
            "utf8"
        );

    return JSON.parse(data);

}


// ==========================================
// WRITE DATABASE
// ==========================================

function writeDatabase(data) {

    fs.writeFileSync(
        dbFile,
        JSON.stringify(
            data,
            null,
            2
        )
    );

}


// ==========================================
// CREATE LINK
// ==========================================

function createLink(
    code,
    originalUrl,
    expiresAt
) {

    const links =
        readDatabase();


    const newLink = {

        id: Date.now(),

        code: code,

        original_url:
            originalUrl,

        clicks: 0,

        created_at:
            new Date().toISOString(),

        expires_at:
            expiresAt,

        // Click history
        click_history: []

    };


    links.push(newLink);


    writeDatabase(
        links
    );


    return newLink;

}


// ==========================================
// GET LINK
// ==========================================

function getLink(code) {

    const links =
        readDatabase();


    return links.find(
        link =>
            link.code === code
    );

}


// ==========================================
// INCREASE CLICKS
// ==========================================

function increaseClicks(code) {

    const links =
        readDatabase();


    const link =
        links.find(
            link =>
                link.code === code
        );


    if (link) {

        // Existing old links
        // ke liye safety

        if (
            !Array.isArray(
                link.click_history
            )
        ) {

            link.click_history = [];

        }


        link.clicks =
            Number(link.clicks || 0) + 1;


        // Click ka exact time save karo

        link.click_history.push({

            timestamp:
                new Date().toISOString()

        });

    }


    writeDatabase(
        links
    );

}


// ==========================================
// GET ALL LINKS
// ==========================================

function getAllLinks() {

    const links = readDatabase();

    return links;

}


// ==========================================
// DELETE LINK
// ==========================================

function deleteLink(id) {

    const links =
        readDatabase();


    const filtered =
        links.filter(
            link =>
                link.id !== Number(id)
        );


    writeDatabase(
        filtered
    );

}


// ==========================================
// ANALYTICS
// ==========================================

function getAnalytics() {

    const links = readDatabase();

    const userLinks = links;

    let totalLinks = userLinks.length;

    let totalClicks = 0;

    let todayLinks = 0;

    const today =
        new Date().toDateString();


    userLinks.forEach(link => {

        totalClicks +=
            Number(link.clicks || 0);


        if (
            link.created_at &&
            new Date(link.created_at).toDateString() === today
        ) {

            todayLinks++;

        }

    });


    const averageClicks =
        totalLinks > 0
            ? Number(
                (
                    totalClicks /
                    totalLinks
                ).toFixed(1)
            )
            : 0;


    // ==================================
    // CLICK GRAPH - LAST 7 DAYS
    // ==================================

    const clickStats = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date = new Date();

        date.setDate(
            date.getDate() - i
        );


        const dateString =
            date.toISOString()
                .split("T")[0];


        let clicks = 0;


        userLinks.forEach(link => {

            if (
                !Array.isArray(
                    link.click_history
                )
            ) {

                return;

            }


            link.click_history.forEach(click => {

                const clickDate =
                    click.timestamp
                        .split("T")[0];


                if (
                    clickDate === dateString
                ) {

                    clicks++;

                }

            });

        });


        clickStats.push({

            date: dateString,

            clicks: clicks

        });

    }


    return {

        totalLinks,

        totalClicks,

        todayLinks,

        averageClicks,

        clickStats

    };

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    createLink,

    getLink,

    increaseClicks,

    getAllLinks,

    deleteLink,

    getAnalytics

};
