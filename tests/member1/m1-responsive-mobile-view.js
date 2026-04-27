const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.manage().window().setRect({ width: 390, height: 844 });

    await driver.get("http://localhost:3000/");
    console.log("Opened home page in mobile view");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    await driver.get("http://localhost:3000/products");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    console.log("PASS: Responsive mobile layout loaded");
  } catch (error) {
    console.error("FAIL: Responsive mobile view test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();