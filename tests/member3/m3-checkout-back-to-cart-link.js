const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/checkout");
    console.log("Opened checkout page");

    const backLink = await driver.wait(
      until.elementLocated(By.xpath("//a[contains(., 'Back to cart')]")),
      10000
    );

    const href = await backLink.getAttribute("href");

    if (href && href.includes("/cart")) {
      console.log("PASS: Back to cart link displayed");
    } else {
      console.log("FAIL: Back to cart link not correct");
    }
  } catch (error) {
    console.error("FAIL: Checkout back-to-cart link test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();