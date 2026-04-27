const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/products");
    console.log("Opened products page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);
    await driver.sleep(2000);

    const images = await driver.findElements(By.css("img"));

    if (images.length > 0) {
      console.log("PASS: Product images displayed");
    } else {
      const bodyText = await driver.findElement(By.tagName("body")).getText();
      if (bodyText.length > 0) {
        console.log("FAIL: Page loaded but no img elements found");
      } else {
        console.log("FAIL: Products page content not loaded");
      }
    }
  } catch (error) {
    console.error("FAIL: UI image display test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();