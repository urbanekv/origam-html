const {userName, password} = require("./additionalConfig");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(page) {

  const languageLink = await page.waitForXPath(
    `//a[@value='en-US']`,
    { visible: true }
  );

  const languageLinkClass = await (await languageLink.getProperty('className')).jsonValue();

  if(languageLinkClass.indexOf("inactiveLanguageLink") === -1){
    await languageLink.click();
    await page.waitForNavigation({waitUntil: "load"});
    const englishLogin = await page.waitForXPath(
      `//a[text()='Login']`,
      { visible: true }
    );
    await sleep(100);
  }

  const userNameInput = await page.waitForXPath(
    `//input[@id='userNameInput']`,
    { visible: true }
  );
  await userNameInput.click();
  await sleep(200);
  await page.keyboard.type(userName);
  await sleep(200);

  const passwordInput = await page.waitForXPath(`//input[@id='passInput']`, {
    visible: true,
  });
  await passwordInput.click();
  await sleep(200);
  await page.keyboard.type(password);
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

module.exports = {sleep, xPathContainsClass, getImage, openMenuItem, login, getRowCountData};