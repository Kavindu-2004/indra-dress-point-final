const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    const start = Date.now();

    await driver.get("http://localhost:3000/products");
    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const end = Date.now();
    const loadTime = end - start;

    console.log("Page load time:", loadTime, "ms");

    if (loadTime < 10000) {
      console.log("PASS: Products page loaded within acceptable time");
    } else {
      console.log("FAIL: Products page load too slow");
    }
  } catch (error) {
    console.error("FAIL: Basic page load performance test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();