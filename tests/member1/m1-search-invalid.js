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
    await searchInput.sendKeys("zzzz_not_existing_item_999", Key.RETURN);

    await driver.sleep(2000);

    const bodyText = await driver.findElement(By.tagName("body")).getText();
    const lowerText = bodyText.toLowerCase();

    if (
      lowerText.includes("no products") ||
      lowerText.includes("not found") ||
      lowerText.includes("0 results") ||
      lowerText.includes("no matching")
    ) {
      console.log("PASS: Invalid product search handled");
    } else {
      console.log("FAIL: Invalid search handling message not found");
    }
  } catch (error) {
    console.error("FAIL: Invalid search test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();