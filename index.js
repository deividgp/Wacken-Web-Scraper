import puppeteer from "puppeteer";
import * as dotenv from 'dotenv';
import twilio from "twilio";
dotenv.config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTHTOKEN);
const startUrl = "https://ticketcenter.wacken.com/tickets/market";
let page;
let firstContent = null;
let different = false;

async function main() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox"]
    });
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
    else {
        setTimeout(timeout, 2000);
    }
}

async function timeout() {
    if (page.url() == startUrl) {
        const content = await page.content();

        if (firstContent == null) {
            firstContent = content;
        } else {
            if (firstContent == content) {
                console.log("SAME");
                different = false;
            }
            else if (firstContent != content && !different) {
                console.log("DIFFERENT");
                twilioClient.messages
                    .create({
                        body: "TICKET AVAILABLE",
                        messagingServiceSid: process.env.TWILIO_MESSAGINGSID,
                        to: process.env.TWILIO_TO
                    })
                    .done();
                different = true;
            }
        }
    }

    await page.reload();
    await recursive();
}

main();