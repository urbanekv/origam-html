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

// for case when simple element.click() does not work
// e.g. "Error: Node is detached from document"
async function elementMouseUpDown(element){
  const box = await element.boundingBox();
  debugger;
  console.log(element);
  console.log(box);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await sleep(200);
  await page.mouse.down();
  await sleep(30);
  await page.mouse.up();
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
    const addRowButton = await page.waitForXPath(
      `//div[@id='dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508']//div[${xPathContainsClass("addRow")}]`,
      { visible: true }
    );
    await sleep(500);
    await addRowButton.click();
    // await elementMouseUpDown(addRowButton);
    await sleep(500);

    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement._remoteObject.className).toBe("HTMLInputElement");

    await focusedElement.type("bla1")
    await page.keyboard.press("Tab");

    const focusedElement2 = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement2._remoteObject.className).toBe("HTMLInputElement");
    expect(focusedElement2).not.toBe(focusedElement);

    await focusedElement2.type("ble1")
    console.log("Done.")

    // {
    //   const dropdownBody = await page.waitForXPath(
    //     `//div[@class='Dropdown_body']`,
    //     { visible: true }
    //   );
    //   const bb = await dropdownBody.boundingBox();
    //   const x = bb.x + bb.width / 2;
    //   const y = bb.y + 30;
    //   await page.mouse.move(x, y);
    //   await page.mouse.wheel({ deltaY: 1000 });
    //   await sleep(500);
    //   await page.mouse.down();
    //   await sleep(30);
    //   await page.mouse.up();
    // }
    //
    // const okButton = await page.waitForXPath(`//button[contains(., 'OK')]`, {
    //   visible: true,
    // });
    // await okButton.click();
    // await sleep(1000)
    // const objekteTab = await page.waitForXPath(
    //   `//div[@class='TabbedViewHandle_label' and contains(., 'Objekte')]`,
    //   { visible: true }
    // );
    // await objekteTab.click();
    // await sleep(1017)
    // const image = await page.screenshot();
    // expect(image).toMatchImageSnapshot();

    // await sleep(1000);
    await sleep(60 * 1000);
  });
});
