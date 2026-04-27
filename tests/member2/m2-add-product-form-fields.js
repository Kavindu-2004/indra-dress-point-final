const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");
const { adminLogin } = require("./loginHelper");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await adminLogin(driver);

    await driver.get("http://localhost:3000/admin/products");
    console.log("Opened admin products page");

    const nameInput = await driver.wait(
      until.elementLocated(By.css('input[name="name"]')),
      10000
    );

    const priceInput = await driver.findElement(By.css('input[name="price"]'));
    const stockInput = await driver.findElement(By.css('input[name="stock"]'));
    const categorySelect = await driver.findElement(By.css('select[name="categorySlug"]'));
    const descriptionInput = await driver.findElement(By.css('textarea[name="description"]'));

    if (nameInput && priceInput && stockInput && categorySelect && descriptionInput) {
      console.log("PASS: Add product form fields are visible");
    } else {
      console.log("FAIL: Some add product form fields are missing");
    }
  } catch (error) {
    console.error("FAIL: Add product form fields test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();