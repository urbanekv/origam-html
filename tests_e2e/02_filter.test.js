const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, openMenuItem, login, waitForRowCount
} = require('./testTools');

let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    //devtools: true,
    headless: false,
    defaultViewport: {
      width: 1024,
      height: 2000, // to make all 30 lines visible and avoid the need for scrolling
    },
    // slowMo: 50,
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

  await page.focus(`#${inputId}`)
  await page.keyboard.type(args.value)
}

async function setDateFilter(args){
  const inputId = "input_" + args.propertyId;
  const comboId = "combo_" +  args.propertyId;
  const dropdownId = "dropdown_combo_" + args.propertyId;

  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );
  await sleep(200);

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

  await page.focus(`#${inputId}`)
  await page.keyboard.type(args.value)

  await removeFocusFromDateInput(input);
}

async function removeFocusFromDateInput(toInput) {
  await sleep(500);
  await clickParent(toInput);
  await sleep(300);

  for (let i = 0; i < 5; i++) {
    const inputIsActive = await page.evaluate(inputId =>`document.activeElement === document.getElementById("${inputId}")`, toInput);
    if(inputIsActive){
      await clickParent(toInput);
      await sleep(300);
    }else{
      return;
    }
  }
}

async function clickParent(toInput) {
  await sleep(200);
  let parent_node = await toInput.getProperty('parentNode')
  parent_node = await parent_node.getProperty('parentNode')
  parent_node = await parent_node.getProperty('parentNode')
  parent_node = await parent_node.getProperty('parentNode')
  await parent_node.click();
}

async function setTwoFieldDateFilter(args){
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

  await page.focus(`#${fromInputId}`)
  await page.keyboard.type(args.fromValue)

  await sleep(300);

  const toInput = await page.waitForSelector(
    `#${toInputId}`,
    {visible: true});

  await page.focus(`#${toInputId}`)
  await page.keyboard.type(args.toValue)

  await removeFocusFromDateInput(toInput);
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

  await page.focus(`#${fromInputId}`)
  await page.keyboard.type(args.fromValue)

  const toInput = await page.waitForSelector(
    `#${toInputId}`,
    {visible: true});
  const toFilterValue = await page.evaluate(x => x.value, toInput);
  expect(toFilterValue).toBe("");

  await page.focus(`#${toInputId}`)
  await page.keyboard.type(args.toValue)
}

const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";
const text1PropertyId = "cb584956-8f34-4d95-852e-eff4680a2673";
const integer1PropertyId = "3f3f6be7-6e87-48d7-9ac1-89ac30dc43ce";
const boolean1PropertyId ="d63fbdbb-3bbc-43c9-a9f2-a8585c42bbae";
const date1PropertyId ="c8e93248-81c0-4274-9ff1-1b7688944877";

describe("Html client", () => {
  it("Should perform basic text filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);
    const filterButton = await page.waitForSelector(
      `#${dataViewId} [class*='test-filter-button']`,
      {visible: true});
    await filterButton.click();

    await sleep(300);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "contains",
      value: "2"
    });

    await waitForRowCount(page, dataViewId,12);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "begins with",
      value: "txt3"
    })

    await waitForRowCount(page, dataViewId,10);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "not begins with",
      value: "txt3"
    })

    await waitForRowCount(page, dataViewId,20);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "not contains",
      value: "2"
    })

    await waitForRowCount(page, dataViewId,18);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "ends with",
      value: "5"
    })

    await waitForRowCount(page, dataViewId,3);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "not ends with",
      value: "5"
    })

    await waitForRowCount(page, dataViewId,27);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "=",
      value: "txt25"
    })

    await waitForRowCount(page, dataViewId,1);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "≠",
      value: "txt25"
    })

    await waitForRowCount(page, dataViewId,29);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCount(page, dataViewId,0);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCount(page, dataViewId,30);
  });
  it("Should perform basic number filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);

    const filterButton = await page.waitForSelector(
      `#${dataViewId} [class*='test-filter-button']`,
      {visible: true});
    await filterButton.click();

    await sleep(300);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "=",
      value: "20"
    })

    await waitForRowCount(page, dataViewId,1);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "≠",
      value: "20"
    })

    await waitForRowCount(page, dataViewId,29);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "≤",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,11);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "≥",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,20);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "<",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,10);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: ">",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,19);

    await setTwoFieldFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "between",
      fromValue: "5",
      toValue: "14",
    })

    await waitForRowCount(page, dataViewId,10);

    await setTwoFieldFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "not between",
      fromValue: "5",
      toValue: "14",
    })

    await waitForRowCount(page, dataViewId,20);

      await setFilter({
        propertyId: integer1PropertyId ,
        comboOptionText: "is null",
        value: undefined
      })

    await waitForRowCount(page, dataViewId,0);

      await setFilter({
        propertyId: integer1PropertyId ,
        comboOptionText: "is not null",
        value: undefined
      })

    await waitForRowCount(page, dataViewId,30);
  });
  it("Should perform basic bool filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);

    const filterButton = await page.waitForSelector(
      `#${dataViewId} [class*='test-filter-button']`,
      {visible: true});
    await filterButton.click();

    await sleep(300);

    let boolFilterCheckBox = await page.waitForSelector(`#input_${boolean1PropertyId}`);
    await boolFilterCheckBox.click();

    await waitForRowCount(page, dataViewId,1);

    await boolFilterCheckBox.click();

    await waitForRowCount(page, dataViewId,29);
  });
  it("Should perform basic date filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_423a08e5-b1cf-4341-a342-d9b57667d1b9"
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);

    const filterButton = await page.waitForSelector(
      `#${dataViewId} [class*='test-filter-button']`,
      {visible: true});
    await filterButton.click();

    await sleep(300);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "=",
      value: "03.07.2021"
    })

    await waitForRowCount(page, dataViewId,1);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "≠",
      value: "03.07.2021"
    })
    await waitForRowCount(page, dataViewId,29);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "≤",
      value: "03.07.2021"
    })

    await waitForRowCount(page, dataViewId,11);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "≥",
      value: "03.07.2021"
    })

    await waitForRowCount(page, dataViewId,20);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "<",
      value: "03.07.2021"
    })

    await waitForRowCount(page, dataViewId,10);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: ">",
      value: "03.07.2021"
    })

    await waitForRowCount(page, dataViewId,19);

    await setTwoFieldDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "between",
      fromValue: "03.07.2021",
      toValue: "15.07.2021",
    })

    await waitForRowCount(page, dataViewId,13);

    await setTwoFieldDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "not between",
      fromValue: "03.07.2021",
      toValue: "15.07.2021",
    })

    await waitForRowCount(page, dataViewId,17);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCount(page, dataViewId,0);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCount(page, dataViewId,30);
  });
});
