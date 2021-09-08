const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, openMenuItem, login, waitForRowCount, waitForRowCountData} = require('./testTools');
const {setDateFilter, setTwoFieldDateFilter, setFilter, setTwoFieldFilter, setComboFilter, openFilters} = require("./filterTestTools");
const {widgetsMenuItemId, allDataTypesMenuId} = require("./modelIds");

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


const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";
const text1PropertyId = "cb584956-8f34-4d95-852e-eff4680a2673";
const integer1PropertyId = "3f3f6be7-6e87-48d7-9ac1-89ac30dc43ce";
const boolean1PropertyId ="d63fbdbb-3bbc-43c9-a9f2-a8585c42bbae";
const date1PropertyId ="c8e93248-81c0-4274-9ff1-1b7688944877";
const comboPropertyId ="14be2199-ad7f-43c3-83bf-a27c1fa66f7c";
const tagPropertyId ="3c685902-b55b-45cb-807c-01e8386bb313";

describe("Html client", () => {
  it("Should perform basic text filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);

    await openFilters({
      page: page,
      dataViewId: dataViewId,
      aPropertyId: date1PropertyId
    });

    await sleep(300);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "contains",
      value: "2"
    });

    await waitForRowCount(page, dataViewId,12);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "begins with",
      value: "txt3"
    })

    await waitForRowCount(page, dataViewId,10);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "not begins with",
      value: "txt3"
    })

    await waitForRowCount(page, dataViewId,20);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "not contains",
      value: "2"
    })

    await waitForRowCount(page, dataViewId,18);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "ends with",
      value: "5"
    })

    await waitForRowCount(page, dataViewId,3);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "not ends with",
      value: "5"
    })

    await waitForRowCount(page, dataViewId,27);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "=",
      value: "txt25"
    })

    await waitForRowCount(page, dataViewId,1);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "≠",
      value: "txt25"
    })

    await waitForRowCount(page, dataViewId,29);

    await setFilter({
      page: page,
      propertyId: text1PropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCount(page, dataViewId,0);

    await setFilter({
      page: page,
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
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);

    await openFilters({
      page: page,
      dataViewId: dataViewId,
      aPropertyId: date1PropertyId
    });

    await sleep(300);

    await setFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "=",
      value: "20"
    })

    await waitForRowCount(page, dataViewId,1);

    await setFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "≠",
      value: "20"
    })

    await waitForRowCount(page, dataViewId,29);

    await setFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "≤",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,11);

    await setFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "≥",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,20);

    await setFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "<",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,10);

    await setFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: ">",
      value: "11"
    })

    await waitForRowCount(page, dataViewId,19);

    await setTwoFieldFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "between",
      fromValue: "5",
      toValue: "14",
    })

    await waitForRowCount(page, dataViewId,10);

    await setTwoFieldFilter({
      page: page,
      propertyId: integer1PropertyId ,
      comboOptionText: "not between",
      fromValue: "5",
      toValue: "14",
    })

    await waitForRowCount(page, dataViewId,20);

      await setFilter({
        page: page,
        propertyId: integer1PropertyId ,
        comboOptionText: "is null",
        value: undefined
      })

    await waitForRowCount(page, dataViewId,0);

      await setFilter({
        page: page,
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
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    await waitForRowCount(page, dataViewId,30);

    await sleep(300);

    await openFilters({
      page: page,
      dataViewId: dataViewId,
      aPropertyId: date1PropertyId
    });

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
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    await waitForRowCountData(page, dataViewId,30);

    await sleep(300);

    await openFilters({
      page: page,
      dataViewId: dataViewId,
      aPropertyId: date1PropertyId
    });

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "=",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,1);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "≠",
      value: "03.07.2021"
    })
    await waitForRowCountData(page, dataViewId,29);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "≤",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,11);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "≥",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,20);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "<",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,10);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: ">",
      value: "03.07.2021"
    })

    await waitForRowCountData(page, dataViewId,19);

    await setTwoFieldDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "between",
      fromValue: "03.07.2021",
      toValue: "15.07.2021",
    })

    await waitForRowCountData(page, dataViewId,13);

    await setTwoFieldDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "not between",
      fromValue: "03.07.2021",
      toValue: "15.07.2021",
    })

    await waitForRowCountData(page, dataViewId,17);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,0);

    await setDateFilter({
      page: page,
      propertyId: date1PropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,30);
  });
  it("Should perform basic combo input filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    await waitForRowCountData(page, dataViewId,30);

    await sleep(300);

    await openFilters({
      page: page,
      dataViewId: dataViewId,
      aPropertyId: date1PropertyId
    });

    await setComboFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "=",
      value: "Label1"
    })

    await waitForRowCountData(page, dataViewId,2);

    await setComboFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "≠",
      value: "Label1"
    })

    await waitForRowCountData(page, dataViewId,4);

    await setFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "begins with",
      value: "Lab"
    })

    await waitForRowCountData(page, dataViewId,6);

    await setFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "not begins with",
      value: "Lab"
    })

    await waitForRowCountData(page, dataViewId,24);

    await setFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "contains",
      value: "Label2"
    })

    await waitForRowCountData(page, dataViewId,2);

    await setFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "not contains",
      value: "Label2"
    })

    await waitForRowCountData(page, dataViewId,28);

    await setFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,24);

    await setFilter({
      page: page,
      propertyId: comboPropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,6);
  });
  it("Should perform basic tag input filter tests", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        widgetsMenuItemId,
        allDataTypesMenuId
      ]);

    await waitForRowCountData(page, dataViewId,30);

    await sleep(300);

    await openFilters({
      page: page,
      dataViewId: dataViewId,
      aPropertyId: date1PropertyId
    });

    await setComboFilter({
      page: page,
      propertyId: tagPropertyId ,
      comboOptionText: "=",
      value: "Label1"
    })

    await waitForRowCountData(page, dataViewId,2);

    await setComboFilter({
      page: page,
      propertyId: tagPropertyId ,
      comboOptionText: "≠",
      value: "Label1"
    })

    await waitForRowCountData(page, dataViewId,28);

    await setFilter({
      page: page,
      propertyId: tagPropertyId ,
      comboOptionText: "is null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,26);

    await setFilter({
      page: page,
      propertyId: tagPropertyId ,
      comboOptionText: "is not null",
      value: undefined
    })

    await waitForRowCountData(page, dataViewId,4);
  });
});

