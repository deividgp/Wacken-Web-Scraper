import fs from "fs";
import puppeteer from "puppeteer";
import * as dotenv from 'dotenv';
dotenv.config();

const startUrl = "https://ticketcenter.wacken.com/tickets/market";
let page;
let lastContent;

async function main() {
    const browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(startUrl);
    await recursive();
}

async function recursive() {
    if (page.url() != startUrl) {
        page.waitForSelector("#username", {
            timeout: 2000
        })
            .then(async () => {
                await page.type('#username', process.env.WACKEN_USERNAME);
                await page.type('#password', process.env.WACKEN_PASSWORD);
                await page.click("button[type='submit']");
                setTimeout(timeout, 2000);
            })
            .catch(async () => {
                await page.reload();
                await recursive();
            });
    }
    else
    {
        setTimeout(timeout, 2000);
    }
}

async function timeout() {
    const content = await page.content();
    if (content == lastContent) {
        console.log("SAME");
    } else {
        if (lastContent != undefined) {
            console.log("DIFERENT");
        }
        lastContent = content;
    }

    await page.reload();
    await recursive();
}

main();