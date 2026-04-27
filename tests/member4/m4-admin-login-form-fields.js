const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/admin/login");
    console.log("Opened admin login page");

    const emailInput = await driver.wait(
      until.elementLocated(By.css('input[placeholder="Admin email"]')),
      10000
    );

    const passwordInput = await driver.findElement(
      By.css('input[placeholder="Password"]')
    );

    const signInButton = await driver.findElement(
      By.xpath("//button[contains(., 'Sign in')]")
    );

    if (emailInput && passwordInput && signInButton) {
      console.log("PASS: Admin login form fields displayed");
    } else {
      console.log("FAIL: Admin login form fields missing");
    }
  } catch (error) {
    console.error("FAIL: Admin login form test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();