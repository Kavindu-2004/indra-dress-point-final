const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/products");
    console.log("Opened products page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    const links = await driver.findElements(By.tagName("a"));
    let opened = false;

    for (let link of links) {
      const href = await link.getAttribute("href");
      if (
        href &&
        !href.endsWith("/products") &&
        !href.endsWith("/") &&
        href.includes("3000")
      ) {
        await link.click();
        opened = true;
        break;
      }
    }

    await driver.sleep(2000);

    const currentUrl = await driver.getCurrentUrl();

    if (opened && currentUrl !== "http://localhost:3000/products") {
      console.log("PASS: Product details page opened");
    } else {
      console.log("FAIL: Product details page not opened");
    }
  } catch (error) {
    console.error("FAIL: Product details test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();