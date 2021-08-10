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

const masterDataViewId = "dataView_775fa5ea-fa75-40a7-8c39-7828f7cdf508";
const detailDataViewId = "dataView_b11ffa85-7507-475c-af50-ef08fd56072c";
const detailEditorId = "editor_89be97a4-86e8-4036-b57a-36155e3f2322";
const detailTabHandelId = "tabHandle_823ea459-bca5-476f-ab6f-9cb07769923e";


async function addRowToMaster(firstColumnValue, secondColumnValue) {
  const firstColumnEditorId = "editor_b2adeca9-7f20-410d-bbe5-fb78e29614c2";
  const secondColumnEditorId = "editor_8b796084-3347-4ad0-8380-00a373176bb0";

  await page.$eval(`#${masterDataViewId} .addRow`, elem => elem.click())

  await page.waitForFunction(`document.activeElement == document.getElementById("${firstColumnEditorId}")`);
  const inputCol1 = await page.$("#" + firstColumnEditorId);
  await inputCol1.type(firstColumnValue)

  await page.keyboard.press("Tab");

  await page.waitForFunction(`document.activeElement == document.getElementById("${secondColumnEditorId}")`);
  const inputCol2 = await page.$("#" + secondColumnEditorId);
  await inputCol2.type(secondColumnValue)
}

async function addRowToDetail(detailValue) {
  await page.$eval(`#${detailDataViewId} .addRow`, elem => elem.click())
  await page.waitForFunction(`document.activeElement == document.getElementById("${detailEditorId}")`);
  const inputCol1 = await page.$("#" + detailEditorId);
  await inputCol1.type(detailValue);
}

async function getRowCountData(dataViewId) {
  const rowCountElement = await page.$(`#${dataViewId} .rowCount`);
  let rowCountText = await page.evaluate(x => x.textContent, rowCountElement);
  const rowCountData = rowCountText
    .split("/")
    .map(x => x.trim())
    .filter(x=> x !== "");
  return {
    rowCount: rowCountData[1],
    selectedRow: rowCountData[0]};
}

async function refreshAndThrowChangesAway() {
  await page.$eval("#refreshButton", elem => elem.click())

  const dontSaveButton = await page.waitForXPath(
    `//button[@id='dontSaveButton']`,
    {visible: true}
  );
  await dontSaveButton.click();

  const detailTabHandle = await page.$(`#${detailTabHandelId}`);
  await detailTabHandle.click();

  await sleep(500);
  const detailRowCountData = await getRowCountData(detailDataViewId);
  expect(detailRowCountData.selectedRow).toBe("-");
  expect(detailRowCountData.rowCount).toBe("0");

  const masterRowCountData = await getRowCountData(masterDataViewId);
  expect(masterRowCountData.selectedRow).toBe("-");
  expect(masterRowCountData.rowCount).toBe("0");
}

async function selectMasterRow(rowIndex) {
  const rowHeight = 30;
  const tableArea = await page.$(`#${masterDataViewId}  [class*='Table_cellAreaContainer']`);
  const box = await tableArea.boundingBox();
  await page.mouse.click(
    box.x + 50,
    box.y + rowHeight / 2 + rowHeight * rowIndex
  );
}

describe("Html client", () => {
  it("Should perform basic CRUD", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_691f8dfa-606f-46f3-9078-6891642af76e",
        "menu_12bef472-a744-4f5a-98f8-17c163137e9f"
      ]);

    // Add three rows
    await page.waitForXPath(
      `//div[@id='${masterDataViewId}']//div[${xPathContainsClass("addRow")}]`,
      { visible: true }
    );
    await addRowToMaster("str11", "str12");
    await addRowToMaster("str21", "str22");
    await addRowToMaster("str31", "str32");

    // await page.$eval("#saveButton", elem => elem .click())
    // await page.waitForSelector('#saveButton :not(.isRed)');

    await sleep(500);
    const scroller = await page.$(`#${masterDataViewId}  [class*='Table_cellAreaContainer']`);
    const imageAfterAdding = await getImage(page, scroller)
    expect(imageAfterAdding).toMatchImageSnapshot();


    // remove the second row
    const tableArea = await page.$(`#${masterDataViewId}  [class*='Table_cellAreaContainer']`);
    const box = await tableArea.boundingBox();
    await page.mouse.click(
      box.x + 50,
      box.y + 45
    );
    const deleteRowButton = await page.waitForXPath(
      `//div[@id='${masterDataViewId}']//div[${xPathContainsClass("deleteRow")}]`,
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
    const imageAfterDeleting = await getImage(page, scroller);
    expect(imageAfterDeleting).toMatchImageSnapshot();


    //duplicate first row
    await sleep(500);
    await page.mouse.click(
      box.x + 50,
      box.y + 15
    );

    const copyRowButton = await page.waitForXPath(
      `//div[@id='${masterDataViewId}']//div[${xPathContainsClass("copyRow")}]`,
      { visible: true }
    );
    await copyRowButton.click();

    await sleep(500);
    const imageAfterCopying = await getImage(page, scroller);
    expect(imageAfterCopying).toMatchImageSnapshot();

    // throw the changes away
    await refreshAndThrowChangesAway();
    await sleep(500);
    const imageAfterRefresh = await getImage(page, scroller);
    expect(imageAfterRefresh).toMatchImageSnapshot();

    //await sleep(120 * 1000);
  });
  it("Should perform basic master detail interaction", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_691f8dfa-606f-46f3-9078-6891642af76e",
        "menu_12bef472-a744-4f5a-98f8-17c163137e9f"
      ]);
    // Add rows to master
    await page.waitForXPath(
      `//div[@id='${masterDataViewId}']//div[${xPathContainsClass("addRow")}]`,
      { visible: true }
    );
    await addRowToMaster("str11", "str12");
    await addRowToMaster("str21", "str22");

    // Add a row to detail (second line in the master active)
    const detailTabHandle = await page.$(`#${detailTabHandelId}`);
    await detailTabHandle.click();

    const formPerspectiveButton = await page.$(`#${detailDataViewId} .formPerspectiveButton`);
    await formPerspectiveButton.click();

    await addRowToDetail("detail2");

    await sleep(500);
    await selectMasterRow(0);

    const inputCol1 = await page.$("#" + detailEditorId);
    let detailColumnValue = await page.evaluate(x => x.value, inputCol1);
    expect(detailColumnValue).toBe("");

    await sleep(500);
    await selectMasterRow(1);

    const inputCol11 = await page.$("#" + detailEditorId);
    detailColumnValue = await page.evaluate(x => x.value, inputCol11);
    expect(detailColumnValue).toBe("detail2");

    // throw the changes away
    await refreshAndThrowChangesAway();

    await sleep(120 * 1000);
  });
});
