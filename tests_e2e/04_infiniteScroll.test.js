const puppeteer = require("puppeteer");
const { backEndUrl } = require('./additionalConfig');
const { sleep, openMenuItem, login, waitForRowCountData, catchRequests, clickAndWaitFor, clickAndWaitForXPath,
  getTableData
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


const dataViewId = "dataView_e67865b0-ce91-413c-bed7-1da486399633";

async function autoScroll(page){
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let element = document.querySelector("#dataView_e67865b0-ce91-413c-bed7-1da486399633 .horiz-scrollbar");
      let totalHeight = 0;
      const distance = 500;
      const timer = setInterval(() => {
        const scrollHeight = element.scrollHeight;
        element.scrollBy(0, distance);
        totalHeight += distance;

        if(totalHeight >= scrollHeight){
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

describe("Html client", () => {
  it("Should scroll to the end", async () => {
    await login(page);
    await openMenuItem(
      page,
      [
        "menu_12580c7d-8b0f-4541-8250-dd337443eaca",
        "menu_30322a63-f242-45d5-a3ff-adaa3e4cb28a"
      ]);
    let waitForRequests = catchRequests(page);
    await waitForRowCountData(page, dataViewId,2099);

    await sleep(300);
    const table = await page.waitForSelector(
      `#${dataViewId} .horiz-scrollbar`,
      { visible: true, timeout: 3000 }
    );
    console.log("table: " + table);
    await sleep(500);
    await waitForRequests

    await autoScroll(page, table);

    const tableData = await getTableData(page, dataViewId);
    console.log(tableData)
    const rows = tableData.data
    const lastRow = rows[rows.length - 1]
    expect(lastRow["Text1"]).toBe("txt2109");

    // await sleep(60000);

  });
});
