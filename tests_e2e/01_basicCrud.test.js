const puppeteer = require("puppeteer");
const { userName, password, backEndUrl } = require('./additionalConfig');

let browser;
let page;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


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

async function login() {
  const userNameInput = await page.waitForXPath(
    `//input[@id='userNameInput']`,
    { visible: true }
  );
  await userNameInput.click();
  await page.keyboard.type(userName);

  const passwordInput = await page.waitForXPath(`//input[@id='passInput']`, {
    visible: true,
  });
  await passwordInput.click();
  await page.keyboard.type(password);

  const loginButton = await page.waitForXPath(`//a[@id='loginButton']`, {
    visible: true,
  });
  await sleep(500); // give the translations some time to load
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

async function getImage(element){
  const elementBounds = await element.boundingBox();
  return page.screenshot({
    clip: elementBounds,
  });
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

async function addRowToDetail(firstColumnValue) {
  const firstColumnEditorId = "editor_89be97a4-86e8-4036-b57a-36155e3f2322";

  await page.$eval("#dataView_b11ffa85-7507-475c-af50-ef08fd56072c .addRow", elem => elem.click())

  await page.waitForFunction(`document.activeElement == document.getElementById("${firstColumnEditorId}")`);
  const inputCol1 = await page.$("#" + firstColumnEditorId);
  await inputCol1.type(firstColumnValue)
}

async function refreshAndThrowChangesAway() {
  await page.$eval("#refreshButton", elem => elem.click())

  const dontSaveButton = await page.waitForXPath(
    `//button[@id='dontSaveButton']`,
    {visible: true}
  );
  await dontSaveButton.click();
}

describe("Html client", () => {
  it("Should perform basic CRUD", async () => {
    await login();
    await openMenuItem(
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_691f8dfa-606f-46f3-9078-6891642af76e",
        "menu_12bef472-a744-4f5a-98f8-17c163137e9f"
      ]);

    // Add three rows
    await page.waitForXPath(
      `//div[@id='dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508']//div[${xPathContainsClass("addRow")}]`,
      { visible: true }
    );
    await addRowToMaster("str11", "str12");
    await addRowToMaster("str21", "str22");
    await addRowToMaster("str31", "str32");

    // await page.$eval("#saveButton", elem => elem .click())
    // await page.waitForSelector('#saveButton :not(.isRed)');

    await sleep(500);
    const scroller = await page.$("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508  [class*='Table_cellAreaContainer']");
    const imageAfterAdding = await getImage(scroller)
    expect(imageAfterAdding).toMatchImageSnapshot();


    // remove the second row
    const tableArea = await page.$("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508  [class*='Table_cellAreaContainer']");
    const box = await tableArea.boundingBox();
    await page.mouse.click(
      box.x + 50,
      box.y + 45
    );
    const deleteRowButton = await page.waitForXPath(
      `//div[@id='dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508']//div[${xPathContainsClass("deleteRow")}]`,
      { visible: true }
    );
    await deleteRowButton.click();

    const yesRowButton = await page.waitForXPath(
      `//button[@id='yesButton']`,
      { visible: true }
    );
    await yesRowButton.click();

    // await page.$eval("#saveButton", elem => elem .click())
    // await page.waitForSelector('#saveButton :not(.isRed)');

    await sleep(500);
    const imageAfterDeleting = await getImage(scroller);
    expect(imageAfterDeleting).toMatchImageSnapshot();


    //duplicate first row
    await sleep(500);
    await page.mouse.click(
      box.x + 50,
      box.y + 15
    );

    const copyRowButton = await page.waitForXPath(
      `//div[@id='dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508']//div[${xPathContainsClass("copyRow")}]`,
      { visible: true }
    );
    await copyRowButton.click();

    await sleep(500);
    const imageAfterCopying = await getImage(scroller);
    expect(imageAfterCopying).toMatchImageSnapshot();

    // throw the changes away
    await refreshAndThrowChangesAway();
    await sleep(500);
    const imageAfterRefresh = await getImage(scroller);
    expect(imageAfterRefresh).toMatchImageSnapshot();

    //await sleep(120 * 1000);
  });
  it("Should perform basic master detail interaction", async () => {
    await login();
    await openMenuItem(
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_691f8dfa-606f-46f3-9078-6891642af76e",
        "menu_12bef472-a744-4f5a-98f8-17c163137e9f"
      ]);

    // Add rows to master
    await page.waitForXPath(
      `//div[@id='dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508']//div[${xPathContainsClass("addRow")}]`,
      { visible: true }
    );
    await addRowToMaster("str11", "str12");
    await addRowToMaster("str21", "str22");

    // Add a row to detail (second line in the master active)
    const detailTabHandle = await page.$('#tabHandle_823ea459-bca5-476f-ab6f-9cb07769923e');
    await detailTabHandle.click();

    const formPerspectiveButton = await page.$('#dataView_b11ffa85-7507-475c-af50-ef08fd56072c .formPerspectiveButton');
    await formPerspectiveButton.click();

    await page.$eval("#dataView_b11ffa85-7507-475c-af50-ef08fd56072c .addRow", elem => elem.click())

    let firstColumnEditorId = "editor_89be97a4-86e8-4036-b57a-36155e3f2322";
    await page.waitForFunction(`document.activeElement == document.getElementById("${firstColumnEditorId}")`);

    const inputCol1 = await page.$("#" + firstColumnEditorId);
    await inputCol1.type("detail2");

    await sleep(500);

    const tableArea = await page.$("#dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508  [class*='Table_cellAreaContainer']");
    const box = await tableArea.boundingBox();
    await page.mouse.click(
      box.x + 50,
      box.y + 15
    );

    let detailColumnValue = await page.evaluate(x => x.value, inputCol1);
    expect(detailColumnValue).toBe("");

    await sleep(500);
    await page.mouse.click(
      box.x + 50,
      box.y + 45
    );

    const inputCol11 = await page.$("#" + firstColumnEditorId);
    detailColumnValue = await page.evaluate(x => x.value, inputCol11);
    expect(detailColumnValue).toBe("detail2");

    // throw the changes away
    await refreshAndThrowChangesAway();

    await sleep(120 * 1000);
  });
});
