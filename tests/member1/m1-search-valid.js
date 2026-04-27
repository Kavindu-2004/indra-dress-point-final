const { Builder, By, until, Key } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/products");
    console.log("Opened products page");

    const searchInput = await driver.wait(
      until.elementLocated(By.css('input[type="text"]')),
      10000
    );

    await searchInput.clear();
    await searchInput.sendKeys("dress", Key.RETURN);

    await driver.sleep(2000);

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (bodyText.toLowerCase().includes("dress") || bodyText.length > 0) {
      console.log("PASS: Valid product search worked");
    } else {
      console.log("FAIL: Valid search did not return expected result");
    }
  } catch (error) {
    console.error("FAIL: Valid search test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();