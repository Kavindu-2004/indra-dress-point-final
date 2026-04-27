const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/announcements");
    console.log("Opened announcements page");

    const titleInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder*="Title"]')),
      10000
    );

    const pageSelect = await driver.findElement(By.tagName("select"));
    const messageBox = await driver.findElement(By.css('textarea[placeholder*="Message"]'));
    const createButton = await driver.findElement(
      By.xpath("//button[contains(., 'Create')]")
    );

    if (titleInput && pageSelect && messageBox && createButton) {
      console.log("PASS: Announcement create form displayed");
    } else {
      console.log("FAIL: Announcement create form missing");
    }
  } catch (error) {
    console.error("FAIL: Announcement create form test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();