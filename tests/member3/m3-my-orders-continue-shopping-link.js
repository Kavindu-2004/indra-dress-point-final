const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/account/orders");
    console.log("Opened my orders page");

    const continueLink = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'Continue shopping')]")),
      10000
    );

    const href = await continueLink.getAttribute("href");

    if (href && (href.endsWith("/") || href.includes("localhost:3000/"))) {
      console.log("PASS: Continue shopping link displayed");
    } else {
      console.log("FAIL: Continue shopping link not correct");
    }
  } catch (error) {
    console.error("FAIL: Continue shopping link test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();