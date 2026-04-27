const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    await driver.sleep(2000);

    const currentUrl = await driver.getCurrentUrl();
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    console.log("Current URL:", currentUrl);
    console.log("Body text:");
    console.log(bodyText);

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Products')]")),
      10000
    );

    console.log("PASS: Admin products page loaded");
  } catch (error) {
    console.error("FAIL: Admin products page load failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();