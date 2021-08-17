const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, xPathContainsClass, openMenuItem, login, getRowCountData, waitForRowCountToChange} = require('./testTools');

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
    slowMo: 50,
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
  await sleep(200);
  await browser?.close();
  browser = undefined;
});


async function setFilter(args){
  const inputId = "input_" + args.propertyId;
  const comboId = "combo_" +  args.propertyId;
  const dropdownId = "dropdown_combo_" + args.propertyId;

  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );
  await text1FilterCombo.click();

  const optionDiv = await page.waitForXPath(
    `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`,
    { visible: true }
  );

  await optionDiv.click();

  if(args.value === undefined){
    return;
  }
  const input = await page.waitForSelector(
    `#${inputId}`,
    {visible: true});
  const filterValue = await page.evaluate(x => x.value, input);
  expect(filterValue).toBe("");

  input.type(args.value);
}

async function setTwoFieldFilter(args){
  const fromInputId = "from_input_" + args.propertyId;
  const toInputId = "to_input_" + args.propertyId;
  const comboId = "combo_" + args.propertyId;
  const dropdownId = "dropdown_combo_" + args.propertyId;

  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );
  await text1FilterCombo.click();

  const optionDiv = await page.waitForXPath(
    `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`,
    { visible: true }
  );

  await optionDiv.click();

  const fromInput = await page.waitForSelector(
    `#${fromInputId}`,
    {visible: true});
  const fromFilterValue = await page.evaluate(x => x.value, fromInput);
  expect(fromFilterValue).toBe("");

  fromInput.type(args.fromValue);

  const toInput = await page.waitForSelector(
    `#${toInputId}`,
    {visible: true});
  const toFilterValue = await page.evaluate(x => x.value, toInput);
  expect(toFilterValue).toBe("");

  toInput.type(args.toValue);
}

const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";
const text1PropertyId = "cb584956-8f34-4d95-852e-eff4680a2673";
const integer1PropertyId = "3f3f6be7-6e87-48d7-9ac1-89ac30dc43ce";

describe("Html client", () => {
  it("Should perform basic text filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
      ]);

    await sleep(300);
    const initialRowCountData = await getRowCountData(page, dataViewId);
    expect(initialRowCountData.selectedRow).toBe("1");
    expect(initialRowCountData.rowCount).toBe("30");

    const filterButton = await page.waitForSelector(
      `#${dataViewId} [class*='test-filter-button']`,
      {visible: true});
    await filterButton.click();

    await sleep(300);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "contains",
      value: "2"
    })

    let rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 30 );
    expect(rowCountDataAfterChange.rowCount).toBe("12");

    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "begins with",
    //   value: "txt3"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 12 );
    // expect(rowCountDataAfterChange.rowCount).toBe("10");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "not begins with",
    //   value: "txt3"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 10 );
    // expect(rowCountDataAfterChange.rowCount).toBe("20");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "not contains",
    //   value: "2"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 20 );
    // expect(rowCountDataAfterChange.rowCount).toBe("18");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "ends with",
    //   value: "5"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 18 );
    // expect(rowCountDataAfterChange.rowCount).toBe("3");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "not ends with",
    //   value: "5"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 3 );
    // expect(rowCountDataAfterChange.rowCount).toBe("27");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "=",
    //   value: "txt25"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 27 );
    // expect(rowCountDataAfterChange.rowCount).toBe("1");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "≠",
    //   value: "txt25"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 1 );
    // expect(rowCountDataAfterChange.rowCount).toBe("29");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "is null",
    //   value: undefined
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 29 );
    // expect(rowCountDataAfterChange.rowCount).toBe("0");
    //
    // await setFilter({
    //   propertyId: text1PropertyId ,
    //   comboOptionText: "is not null",
    //   value: undefined
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 0 );
    // expect(rowCountDataAfterChange.rowCount).toBe("30");

    // await sleep(120 * 1000);
  });
  // it("Should perform basic number filter tests", async () => {
  //   await login(page);
  //   await openMenuItem(
  //     page,
  //     [
  //       "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
  //       "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
  //     ]);
  //
  //   await sleep(300);
  //   const initialRowCountData = await getRowCountData(page, dataViewId);
  //   expect(initialRowCountData.selectedRow).toBe("1");
  //   expect(initialRowCountData.rowCount).toBe("30");
  //
  //   const filterButton = await page.waitForSelector(
  //     `#${dataViewId} [class*='test-filter-button']`,
  //     {visible: true});
  //   await filterButton.click();
  //
  //   await sleep(300);
  //
  //   await setFilter({
  //     propertyId: integer1PropertyId ,
  //     comboOptionText: "=",
  //     value: "20"
  //   })
  //
  //   let rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 30 );
  //   expect(rowCountDataAfterChange.rowCount).toBe("1");
    //
    // await setFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: "≠",
    //   value: "20"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 1 );
    // expect(rowCountDataAfterChange.rowCount).toBe("29");
    //
    // await setFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: "≤",
    //   value: "11"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 30 );
    // expect(rowCountDataAfterChange.rowCount).toBe("11");
    //
    // await setFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: "≥",
    //   value: "11"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 11 );
    // expect(rowCountDataAfterChange.rowCount).toBe("20");
    //
    // await setFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: "<",
    //   value: "11"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 20 );
    // expect(rowCountDataAfterChange.rowCount).toBe("10");
    //
    // await setFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: ">",
    //   value: "11"
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 10 );
    // expect(rowCountDataAfterChange.rowCount).toBe("19");
    //
    // await setTwoFieldFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: "between",
    //   fromValue: "5",
    //   toValue: "14",
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 19 );
    // expect(rowCountDataAfterChange.rowCount).toBe("8");
    //
    // await setTwoFieldFilter({
    //   propertyId: integer1PropertyId ,
    //   comboOptionText: "not between",
    //   fromValue: "5",
    //   toValue: "14",
    // })
    //
    // rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 8 );
    // expect(rowCountDataAfterChange.rowCount).toBe("22");
    //
    //   await setFilter({
    //     propertyId: integer1PropertyId ,
    //     comboOptionText: "is null",
    //     value: undefined
    //   })
    //
    //   rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 22 );
    //   expect(rowCountDataAfterChange.rowCount).toBe("0");
    //
    //   await setFilter({
    //     propertyId: integer1PropertyId ,
    //     comboOptionText: "is not null",
    //     value: undefined
    //   })
    //
    //   rowCountDataAfterChange = await waitForRowCountToChange(page, dataViewId, 0 );
    //   expect(rowCountDataAfterChange.rowCount).toBe("30");

    // await sleep(120 * 1000);
  // });
});
