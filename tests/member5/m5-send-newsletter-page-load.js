const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/newsletter/send");
    console.log("Opened send newsletter page");

    await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(., 'Send Newsletter')]")),
      10000
    );

    const bodyText = await driver.findElement(By.tagName("body")).getText();

    if (
      bodyText.includes("Subject") &&
      bodyText.includes("Message") &&
      bodyText.includes("Send Newsletter") &&
      bodyText.includes("Back to Dashboard")
    ) {
      console.log("PASS: Send newsletter page and form displayed");
    } else {
      console.log("FAIL: Send newsletter form missing");
    }
  } catch (error) {
    console.error("FAIL: Send newsletter page test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();