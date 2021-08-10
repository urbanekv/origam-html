const {userName, password} = require("./additionalConfig");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(page) {
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


module.exports = {sleep, xPathContainsClass, getImage, openMenuItem, login};