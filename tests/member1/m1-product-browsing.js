const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/products");
    console.log("Opened products page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const links = await driver.findElements(By.tagName("a"));
    const images = await driver.findElements(By.tagName("img"));

    if (links.length > 0 || images.length > 0) {
      console.log("PASS: Product browsing page displayed");
    } else {
      console.log("FAIL: Product browsing elements not found");
    }
  } catch (error) {
    console.error("FAIL: Product browsing test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();