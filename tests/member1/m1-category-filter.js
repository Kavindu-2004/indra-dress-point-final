const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

async function run() {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    await driver.get("http://localhost:3000/products");
    console.log("Opened products page");

    await driver.wait(until.elementLocated(By.tagName("body")), 10000);

    // Try buttons first
    const buttons = await driver.findElements(By.tagName("button"));
    let clicked = false;

    for (let button of buttons) {
      const text = (await button.getText()).toLowerCase();
      if (
        text.includes("new arrivals") ||
        text.includes("workwear") ||
        text.includes("dresses") ||
        text.includes("evening wear") ||
        text.includes("accessories")
      ) {
        await button.click();
        clicked = true;
        break;
      }
    }

    // If not button, try links
    if (!clicked) {
      const links = await driver.findElements(By.tagName("a"));
      for (let link of links) {
        const text = (await link.getText()).toLowerCase();
        if (
          text.includes("new arrivals") ||
          text.includes("workwear") ||
          text.includes("dresses") ||
          text.includes("evening wear") ||
          text.includes("accessories")
        ) {
          await link.click();
          clicked = true;
          break;
        }
      }
    }

    await driver.sleep(2000);

    if (clicked) {
      console.log("PASS: Category filter worked");
    } else {
      console.log("FAIL: Category filter element not found");
    }
  } catch (error) {
    console.error("FAIL: Category filter test failed");
    console.error(error);
  } finally {
    await driver.quit();
  }
}

run();