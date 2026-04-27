const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/");
    console.log("Opened home page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    console.log("PASS: Home page loaded successfully");
  } catch (error) {
    console.error("FAIL: Home page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();