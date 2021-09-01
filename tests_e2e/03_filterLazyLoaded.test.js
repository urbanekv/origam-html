const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, openMenuItem, login, waitForRowCountData, catchRequests, clickAndWaitFor, clickAndWaitForXPath,
  typeAndWaitForSelector
} = require('./testTools');

let browser;
let page;

beforeEach(async () => {
  browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    //devtools: true,
    headless: false,
    defaultViewport: {
      width: 1500,
      height: 800, // to make all 30 lines visible and avoid the need for scrolling
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

  let waitForRequests = catchRequests(page);
  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );

  await sleep(200);

  const optionDiv = await clickAndWaitForXPath({
    page: page,
    clickable: text1FilterCombo,
    xPath: `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`
  });

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
  await waitForRequests;
}

async function openFilters(){
  const filterButton = await page.waitForSelector(
    `#${dataViewId} [class*='test-filter-button']`,
    {visible: true});

  await sleep(300);

  await clickAndWaitFor({
    page: page,
    clickable: filterButton,
    id:`input_${date1PropertyId}`
  });
}


async function setDateFilter(args){
  const inputId = "input_" + args.propertyId;
  const comboId = "combo_" +  args.propertyId;
  const dropdownId = "dropdown_combo_" + args.propertyId;

  await sleep(200);
  let waitForRequests = catchRequests(page);

  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );
  await sleep(200);

  const optionDiv = await clickAndWaitForXPath({
    page: page,
    clickable: text1FilterCombo,
    xPath: `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`
  });

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
  await waitForRequests;
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

  let waitForRequests = catchRequests(page);
  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );

  const optionDiv = await clickAndWaitForXPath({
    page: page,
    clickable: text1FilterCombo,
    xPath: `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`,
  });

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
  await waitForRequests;
}

async function setComboFilter(args){
  const inputId = "input_" + args.propertyId;
  const comboId = "combo_" +  args.propertyId;
  const dropdownId = "dropdown_combo_" + args.propertyId;

  await sleep(200);

  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );
  const optionDiv = await clickAndWaitForXPath({
    page: page,
    clickable: text1FilterCombo,
    xPath: `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`
  });

  // await sleep(200);
  //
  // await text1FilterCombo.click();
  //
  // const optionDiv = await page.waitForXPath(
  //   `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`,
  //   { visible: true }
  // );

  await optionDiv.click();

  if(args.value === undefined){
    return;
  }

  await page.waitForSelector(
    `#${inputId}`,
    {visible: true});

  const tagOptionDiv = await typeAndWaitForSelector({
    page: page,
    inputId: inputId,
    selector: `div .cell.ord1.withCursor`,
    value: args.value
  });

  await tagOptionDiv.click();
}

async function setTwoFieldFilter(args){
  const fromInputId = "from_input_" + args.propertyId;
  const toInputId = "to_input_" + args.propertyId;
  const comboId = "combo_" + args.propertyId;
  const dropdownId = "dropdown_combo_" + args.propertyId;

  let waitForRequests = catchRequests(page);
  const text1FilterCombo = await page.waitForSelector(
    `#${comboId}`,
    { visible: true }
  );
  await sleep(200);

  const optionDiv = await clickAndWaitForXPath({
    page: page,
    clickable: text1FilterCombo,
    xPath: `//div[@id='${dropdownId}']/div[text()='${args.comboOptionText}']`
  });

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
  await waitForRequests;
}

const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";
const text1PropertyId = "cb584956-8f34-4d95-852e-eff4680a2673";
const integer1PropertyId = "3f3f6be7-6e87-48d7-9ac1-89ac30dc43ce";
const boolean1PropertyId ="d63fbdbb-3bbc-43c9-a9f2-a8585c42bbae";
const date1PropertyId ="c8e93248-81c0-4274-9ff1-1b7688944877";
const comboPropertyId ="14be2199-ad7f-43c3-83bf-a27c1fa66f7c";

describe("Html client", () => {
  it("Should perform basic text filter tests lazy loaded", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_30322a63-f242-45d5-a3ff-adaa3e4cb28a"
      ]);

    await waitForRowCountData(page, dataViewId,2099);

    await sleep(300);

    await openFilters();

    await sleep(300);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "contains",
      value: "2"
    });

    await waitForRowCountData(page, dataViewId,651);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "begins with",
      value: "txt3"
    })

    await waitForRowCountData(page, dataViewId,110);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "not begins with",
      value: "txt3"
    })

    await waitForRowCountData(page, dataViewId,1989);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "not contains",
      value: "2"
    })

    await waitForRowCountData(page, dataViewId,1448);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "ends with",
      value: "5"
    })

    await waitForRowCountData(page, dataViewId,210);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "not ends with",
      value: "5"
    })

    await waitForRowCountData(page, dataViewId,1889);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "=",
      value: "txt25"
    })

    await waitForRowCountData(page, dataViewId,1);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "≠",
      value: "txt25"
    })

    await waitForRowCountData(page, dataViewId,2098);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,0);

    await setFilter({
      propertyId: text1PropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,2099);
  });

  it("Should perform basic number filter tests lazy loaded", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_30322a63-f242-45d5-a3ff-adaa3e4cb28a"
      ]);

    await waitForRowCountData(page, dataViewId,2099);

    await sleep(300);

    await openFilters();

    await sleep(300);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "=",
      value: "20"
    })

    await waitForRowCountData(page, dataViewId,1);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "≠",
      value: "20"
    })

    await waitForRowCountData(page, dataViewId,2098);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "≤",
      value: "11"
    })

    await waitForRowCountData(page, dataViewId,11);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "≥",
      value: "11"
    })

    await waitForRowCountData(page, dataViewId,2089);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "<",
      value: "11"
    })

    await waitForRowCountData(page, dataViewId,10);

    await setFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: ">",
      value: "11"
    })

    await waitForRowCountData(page, dataViewId,2088);

    await setTwoFieldFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "between",
      fromValue: "5",
      toValue: "14",
    })

    await waitForRowCountData(page, dataViewId,10);

    await setTwoFieldFilter({
      propertyId: integer1PropertyId ,
      comboOptionText: "not between",
      fromValue: "5",
      toValue: "14",
    })

    await waitForRowCountData(page, dataViewId,2089);

      await setFilter({
        propertyId: integer1PropertyId ,
        comboOptionText: "is null",
        value: undefined
      })

    await waitForRowCountData(page, dataViewId,0);

      await setFilter({
        propertyId: integer1PropertyId ,
        comboOptionText: "is not null",
        value: undefined
      })

    await waitForRowCountData(page, dataViewId,2099);
  });
  it("Should perform basic bool filter tests lazy loaded", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_30322a63-f242-45d5-a3ff-adaa3e4cb28a"
      ]);

    await waitForRowCountData(page, dataViewId,2099);

    await sleep(300);

    await openFilters();

    await sleep(300);

    let boolFilterCheckBox = await page.waitForSelector(`#input_${boolean1PropertyId}`);
    await boolFilterCheckBox.click();

    await waitForRowCountData(page, dataViewId,1);

    await boolFilterCheckBox.click();

    await waitForRowCountData(page, dataViewId,2098);
  });
  it("Should perform basic date filter tests lazy loaded", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_30322a63-f242-45d5-a3ff-adaa3e4cb28a"
      ]);

    await waitForRowCountData(page, dataViewId,2099);

    await sleep(300);

    await openFilters();

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "=",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,1);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "≠",
      value: "03.07.2021"
    })
    await waitForRowCountData(page, dataViewId,2098);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "≤",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,11);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "≥",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,2089);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "<",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,10);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: ">",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,2088);

    await setTwoFieldDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "between",
      fromValue: "03.07.2021",
      toValue: "15.07.2021",
    })

    await waitForRowCountData(page, dataViewId,13);

    await setTwoFieldDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "not between",
      fromValue: "03.07.2021",
      toValue: "15.07.2021",
    })

    await waitForRowCountData(page, dataViewId,2086);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,0);

    await setDateFilter({
      propertyId: date1PropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,2099);
  });
  it("Should perform basic combo input filter lazy loaded", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_30322a63-f242-45d5-a3ff-adaa3e4cb28a"
      ]);

    await waitForRowCountData(page, dataViewId,2099);

    await sleep(300);

    await openFilters();

    await setComboFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "=",
      value: "Label1"
    })

    await waitForRowCountData(page, dataViewId,2);

    await setComboFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "≠",
      value: "Label1"
    })

    await waitForRowCountData(page, dataViewId,2097);

    await setFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "begins with",
      value: "Lab"
    })

    await waitForRowCountData(page, dataViewId,6);

    await setFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "not begins with",
      value: "Lab"
    })

    await waitForRowCountData(page, dataViewId,2093);

    await setFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "contains",
      value: "Label2"
    })

    await waitForRowCountData(page, dataViewId,2);

    await setFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "not contains",
      value: "Label2"
    })

    await waitForRowCountData(page, dataViewId,2097);


    await setFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,2093);

    await setFilter({
      propertyId: comboPropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,6);
  });
});
