const {userName, password} = require("./additionalConfig");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(page) {

  // const languageLink = await page.waitForXPath(
  //   `//a[@value='en-US']`,
  //   { visible: true }
  // );
  //
  // const languageLinkClass = await (await languageLink.getProperty('className')).jsonValue();
  //
  // if(languageLinkClass.indexOf("inactiveLanguageLink") === -1){
  //   await languageLink.click();
  //   await page.waitForNavigation({waitUntil: "load"});
  //   const englishLogin = await page.waitForXPath(
  //     `//a[text()='Login']`,
  //     { visible: true }
  //   );
  //   await sleep(100);
  // }

  const userNameInput = await page.waitForXPath(
    `//input[@id='userNameInput']`,
    { visible: true }
  );
  await userNameInput.type(userName);
  await sleep(200);

  const passwordInput = await page.waitForXPath(`//input[@id='passInput']`, {
    visible: true,
  });
  await passwordInput.type(password);
   await sleep(200);

  const loginButton = await page.waitForXPath(`//a[@id='loginButton']`, {
    visible: true,
  });
  await sleep(500); // give the translations some time to load
  await loginButton.click();
}

async function openMenuItem(page, menuItemIdList) {
  for (const menuItemId of menuItemIdList) {
    const menuItem = await page.waitForXPath(
      `//div[@id='${menuItemId}']`,
      {visible: true}
    );
    await menuItem.click();
  }
}

async function getImage(page, element){
  const elementBounds = await element.boundingBox();
  return page.screenshot({
    clip: elementBounds,
  });
}

function xPathContainsClass(className){
  return `contains(concat(' ',normalize-space(@class),' '),' ${className} ')`
}

async function waitForRowCount(page, dataViewId, expectedRowCount){
  await getTableData(page, dataViewId, expectedRowCount)
}

async function getTableData(page, dataViewId, expectedRowCount){
  const modelInstanceId = dataViewId.substring(9);
  const timeoutMs = 10_000;
  const evalDelayMs = 50;
  let tableData
  for (let i = 0; i < timeoutMs / evalDelayMs; i++) {
    tableData = await page.evaluate(
      modelInstanceId => window.tableDebugMonitor && window.tableDebugMonitor[modelInstanceId],
      modelInstanceId);
    if(tableData && tableData.rendered && tableData.data.length === expectedRowCount){
      await page.evaluate(() => window.tableDebugMonitor = undefined);
      return tableData;
    }
    await sleep(evalDelayMs);
  }
  await page.evaluate(() => window.tableDebugMonitor = undefined);
  const rowCount = tableData ?  tableData.data.length : 0;
  expect(rowCount).toBe(expectedRowCount);
}

async function getRowCountData(page, dataViewId) {
  const rowCountElement =  await page.waitForSelector(`#${dataViewId} .rowCount`);
  let rowCountText = await page.evaluate(x => x.textContent, rowCountElement);
  const rowCountData = rowCountText
    .split("/")
    .map(x => x.trim())
    .filter(x=> x !== "");
  return {
    rowCount: rowCountData[1],
    selectedRow: rowCountData[0]};
}

async function waitForRowCountToChange1(page, dataViewId, value) {
  await page.waitForSelector(
    `#${dataViewId} .rowCount`,
    {visible: true});

  let countData = await getRowCountData(page, dataViewId)
  for (let i = 0; i < 200; i++) {
    countData = await getRowCountData(page, dataViewId)
    if(countData.rowCount === value.toString()){
      break;
    }
    await sleep(50);
  }
  expect(countData.rowCount).toBe(value.toString());
}

async function waitForRowCountToChange(page, dataViewId, initValue) {
  await page.waitForSelector(
    `#${dataViewId} .rowCount`,
    {visible: true});
  // await page.waitForFunction(
  //   (dataViewId, initValue) => {
  //     const rowCountElement = document.getElementById(`#${dataViewId} .rowCount`);
  //     console.log("dataViewId: " + dataViewId);
  //     console.log("initValue: " + initValue);
  //     console.log("rowCountElement: " + rowCountElement)
  //     return false;
  //     // let rowCountText = rowCountElement.textContent;
  //     // const rowCountData = rowCountText
  //     //   .split("/")
  //     //   .map(x => x.trim())
  //     //   .filter(x=> x !== "");
  //     // return rowCountData[1] !== initValue
  //   },
  //   {}, dataViewId, initValue);

  for (let i = 0; i < 100; i++) {
    const countData = await getRowCountData(page, dataViewId)
    if(countData.rowCount !== initValue.toString()){
      return countData;
    }
    await sleep(200);
  }
  throw new Error("Row count did not change before timeout");
}

module.exports = {sleep, xPathContainsClass, getImage, openMenuItem, login, getRowCountData, waitForRowCountToChange,
  waitForRowCountToChange1, getTableData, waitForRowCount};