const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, openMenuItem, login, waitForRowCount, waitForRowCountData, clickAndWaitForSelector, clickAndWaitForXPath,
  catchRequests, waitForRowSelected
} = require('./testTools');
const {setDateFilter, setTwoFieldDateFilter, setFilter, setTwoFieldFilter, setComboFilter, openFilters} = require("./filterTestTools");
const {installMouseHelper} = require('./instalMouseHelper_');
const {widgetsMenuItemId, allDataTypesMenuId, allDataTypesLazyMenuItemsId} = require("./modelIds");

let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    //devtools: true,
    headless: false,
    defaultViewport: {
      width: 1024,
      height: 1000,
    },
    // slowMo: 50,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  page = await browser.newPage();
  await installMouseHelper(page);
  await page.goto(backEndUrl);
  await page.evaluate(() => {
    localStorage.setItem("debugCloseAllForms", "1");
  });
});

afterEach(async () => {
  let pages = await browser.pages();
  await Promise.all(pages.map(page =>page.close()));
  await sleep(200);
  await browser?.close();
  browser = undefined;
});


const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";
const text1PropertyId = "cb584956-8f34-4d95-852e-eff4680a2673";
const integer1PropertyId = "3f3f6be7-6e87-48d7-9ac1-89ac30dc43ce";
const boolean1PropertyId ="d63fbdbb-3bbc-43c9-a9f2-a8585c42bbae";
const date1PropertyId ="c8e93248-81c0-4274-9ff1-1b7688944877";
const comboPropertyId ="14be2199-ad7f-43c3-83bf-a27c1fa66f7c";
const tagPropertyId ="3c685902-b55b-45cb-807c-01e8386bb313";

async function setGrouping() {
  const threeDotMenuButton = await page.waitForSelector(
    `#${dataViewId} .threeDotMenu`,
    {visible: true}
  )

  const configMenuItem = await clickAndWaitForSelector({
    page: page,
    clickable: threeDotMenuButton,
    selector: "#columnConfigItem"
  });

  const columnConfigOk = await clickAndWaitForSelector({
    page: page,
    clickable: configMenuItem,
    selector: "#columnConfigOk"
  });

  const groupByText1CheckBox = await page.waitForSelector(
    `#group_by_${text1PropertyId}`,
    {visible: true}
  )
  await clickAndWaitForXPath({
    page: page,
    clickable: groupByText1CheckBox,
    xPath: `//span[@id='group_index_${text1PropertyId}' and text()='1']`
  });

  const groupByInt1CheckBox = await page.waitForSelector(
    `#group_by_${integer1PropertyId}`,
    {visible: true}
  );
  await clickAndWaitForXPath({
    page: page,
    clickable: groupByInt1CheckBox,
    xPath: `//span[@id='group_index_${integer1PropertyId}' and text()='2']`
  });

  columnConfigOk.click();
}

async function clearGrouping() {
  const threeDotMenuButton = await page.waitForSelector(
    `#${dataViewId} .threeDotMenu`,
    {visible: true}
  )

  const configMenuItem = await clickAndWaitForSelector({
    page: page,
    clickable: threeDotMenuButton,
    selector: "#columnConfigItem"
  });

  const columnConfigOk = await clickAndWaitForSelector({
    page: page,
    clickable: configMenuItem,
    selector: "#columnConfigOk"
  });

  const groupByText1CheckBox = await page.waitForSelector(
    `#group_by_${text1PropertyId}`,
    {visible: true}
  )
  await clickAndWaitForXPath({
    page: page,
    clickable: groupByText1CheckBox,
    xPath: `//span[@id='group_index_${text1PropertyId}' and text()='']`
  });

  const groupByInt1CheckBox = await page.waitForSelector(
    `#group_by_${integer1PropertyId}`,
    {visible: true}
  );
  await clickAndWaitForXPath({
    page: page,
    clickable: groupByInt1CheckBox,
    xPath: `//span[@id='group_index_${integer1PropertyId}' and text()='']`
  });

  columnConfigOk.click();
}

describe("Html client", () => {
  it("Should perform groping tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    let waitForRequests = catchRequests(page);
    await waitForRowCount(page, dataViewId, 30);

    await setGrouping();

    await waitForRequests;
    await sleep(1000);

    const rowHeight = 30;
    const tableArea = await page.$(`#${dataViewId}  [class*='Table_cellAreaContainer']`);
    const box = await tableArea.boundingBox();
    console.log(box)

    // open first group on the first level
    await page.mouse.click(
      box.x + rowHeight / 2,
      box.y + rowHeight / 2
    );

    await sleep(1000);

    // open second group on the second level
    await page.mouse.click(
      box.x + rowHeight,
      box.y + rowHeight * 2
    );
    await sleep(1000);

    // select first row in the open group
    await page.mouse.click(
      box.x + rowHeight * 2,
      box.y + rowHeight * 3
    );

    const rowData = await waitForRowSelected(page, dataViewId, 1);
    expect(rowData && rowData.rowCount).toBe( '2 (30)');

    await clearGrouping()

    await waitForRowCount(page, dataViewId, 30);
  })
  it("Should perform groping tests lazy loaded", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        widgetsMenuItemId,
        allDataTypesLazyMenuItemsId
      ]);

    let waitForRequests = catchRequests(page);
    await waitForRowCountData(page, dataViewId, 2099);

    await setGrouping();

    await waitForRequests;
    await sleep(1000);

    const rowHeight = 30;
    const tableArea = await page.$(`#${dataViewId}  [class*='Table_cellAreaContainer']`);
    const box = await tableArea.boundingBox();
    console.log(box)

    // open first group on the first level
    await page.mouse.click(
      box.x + rowHeight / 2,
      box.y + rowHeight / 2
    );

    await sleep(1000);

    // open second group on the second level
    await page.mouse.click(
      box.x + rowHeight,
      box.y + rowHeight * 2
    );
    await sleep(1000);

    // select first row in the open group
    await page.mouse.click(
      box.x + rowHeight * 2,
      box.y + rowHeight * 3
    );

    const rowData = await waitForRowSelected(page, dataViewId, 1);
    expect(rowData && rowData.rowCount).toBe( '2 (2099)');

    await clearGrouping()

    await waitForRowCountData(page, dataViewId, 2099);
  })
});