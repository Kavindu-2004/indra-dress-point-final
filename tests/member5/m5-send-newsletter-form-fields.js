const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);
    await driver.get("http://localhost:3000/admin/newsletter/send");
    console.log("Opened send newsletter page");

    const subjectInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder*="subject" i]')),
      10000
    );

    const messageBox = await driver.findElement(
      By.css('textarea[placeholder*="message" i]')
    );

    const sendButton = await driver.findElement(
      By.xpath("//button[contains(., 'Send Newsletter')]")
    );

    if (subjectInput && messageBox && sendButton) {
      console.log("PASS: Send newsletter form fields displayed");
    } else {
      console.log("FAIL: Send newsletter form fields missing");
    }
  } catch (error) {
    console.error("FAIL: Send newsletter form fields test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();