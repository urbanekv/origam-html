const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, xPathContainsClass, getImage, openMenuItem, login } = require('./testTools');

let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    //devtools: true,
    headless: false,
    defaultViewport: {
      width: 1024,
      height: 768,
    },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  page = await browser.newPage();
  await page.goto(backEndUrl);
  await page.evaluate(() => {
    localStorage.setItem("debugCloseAllForms", "1");
  });
});

afterEach(async () => {
  let pages = await browser.pages();
  await Promise.all(pages.map(page =>page.close()));
  await browser?.close();
  browser = undefined;
});

const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";

describe("Html client", () => {
  it("Should perform basic CRUD", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
      ]);

    const filterButton = await page.$(`#${dataViewId} [class*='test-filter-button']`);
    await filterButton.click();


    await sleep(120 * 1000);
  });
});
