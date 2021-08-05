const puppeteer = require("puppeteer");

let browser;
let page;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//const BACKEND_URL = "https://server-https:3000";
const BACKEND_URL = "https://192.168.56.1:44356";

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
  await page.goto(BACKEND_URL);
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

async function login() {
  const userNameInput = await page.waitForXPath(
    `//input[@id='userNameInput']`,
    { visible: true }
  );
  await userNameInput.click();
  await page.keyboard.type("washi");

  const passwordInput = await page.waitForXPath(`//input[@id='passInput']`, {
    visible: true,
  });
  await passwordInput.click();
  await page.keyboard.type("blabla");

  const loginButton = await page.waitForXPath(`//a[@id='loginButton']`, {
    visible: true,
  });
  await loginButton.click();
}

async function openMenuItem(menuItemIdList) {
  for (const menuItemId of menuItemIdList) {
    const menuItem = await page.waitForXPath(
      `//div[@id='${menuItemId}']`,
      {visible: true}
    );
    await menuItem.click();
  }
}

function xPathContainsClass(className){
  return `contains(concat(' ',normalize-space(@class),' '),' ${className} ')`
}

async function addRowToMaster(firstColumnValue, secondColumnValue) {
  const firstColumnEditorId = "editor_b2adeca9-7f20-410d-bbe5-fb78e29614c2";
  const secondColumnEditorId = "editor_8b796084-3347-4ad0-8380-00a373176bb0";

  await page.$eval("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508 .addRow", elem => elem.click())

  await page.waitForFunction(`document.activeElement == document.getElementById("${firstColumnEditorId}")`);
  const inputCol1 = await page.$("#" + firstColumnEditorId);
  await inputCol1.type(firstColumnValue)

  await page.keyboard.press("Tab");

  await page.waitForFunction(`document.activeElement == document.getElementById("${secondColumnEditorId}")`);
  const inputCol2 = await page.$("#" + secondColumnEditorId);
  await inputCol2.type(secondColumnValue)

}

describe("Html client", () => {
  it("Should display a screen", async () => {
    await login();
    await openMenuItem(
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_691f8dfa-606f-46f3-9078-6891642af76e",
        "menu_12bef472-a744-4f5a-98f8-17c163137e9f"
      ]);

    // Add three rows
    const addRowButton = await page.waitForXPath(
      `//div[@id='dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508']//div[${xPathContainsClass("addRow")}]`,
      { visible: true }
    );
    await addRowToMaster("str11", "str12");
    await addRowToMaster("str21", "str22");
    await addRowToMaster("str31", "str32");

    await page.$eval("#saveButton", elem => elem .click())
    await page.waitForSelector('#saveButton :not(.isRed)');

    // const scroller = await page.$("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508  [class*='Table_cellAreaContainer']");
    // const scrollerImage = scroller.screenshot();
    // expect(scrollerImage).toMatchImageSnapshot();

    // const image = await page.screenshot();
    // expect(image).toMatchImageSnapshot();


    // remove the second row
    const tableArea = await page.$("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508  [class*='Table_cellAreaContainer']");
    const box = await tableArea.boundingBox();
    const x = box.x + 50;
    const y = box.y + 45;
    await page.mouse.click(x, y)
    await sleep(100)
    await page.$eval("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508 .deleteRow", elem => elem.click())

    console.log("Done.")

    await sleep(120 * 1000);
  });
});
