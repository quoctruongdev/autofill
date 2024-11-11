const puppeteer = require('puppeteer');
const { Builder, By, until } = require('selenium-webdriver');
const chromedriver = require('chromedriver');

async function interactWithIframe() {
  // Khởi tạo WebDriver cho Chrome
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    // Mở trang web có iframe
    await driver.get('https://www.goethe.de/ins/vn/en/sta/han/prf/gzb1.cfm'); // Đặt URL bạn muốn

    // Đảm bảo iframe đã được tải
    await driver.wait(until.elementLocated(By.tagName('iframe')), 10000);

    // Lấy iframe đầu tiên
    let iframe = await driver.findElement(By.tagName('iframe'));

    // Chuyển sang iframe
    await driver.switchTo().frame(iframe);

    // Đợi cho button trong iframe xuất hiện
    let button = await driver.wait(
      until.elementLocated(By.id('buttonInsideIframe')),
      10000
    );

    // Tương tác với button
    await button.click(); // Ví dụ: nhấp vào button trong iframe

    console.log('Button clicked inside iframe.');

    // Quay lại trang chính (nếu cần)
    await driver.switchTo().defaultContent();

    // Tương tác với các phần tử ngoài iframe (nếu cần)
    let element = await driver.findElement(By.id('someElement'));
    console.log(await element.getText()); // In ra nội dung của phần tử
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Đóng trình duyệt
    await driver.quit();
  }
}

(async () => {
  // Khởi tạo trình duyệt Chromium
  const browser = await puppeteer.launch({
    headless: false, // false để thấy trình duyệt, true nếu bạn muốn chạy không giao diện
    defaultViewport: null, // Giúp mở cửa sổ trình duyệt với kích thước mặc định
  });

  const page = await browser.newPage(); // Mở tab mới

  // // Mở trang web mà bạn muốn tự động click
  await page.goto('https://www.goethe.de/ins/vn/en/sta/han/prf/gzb1.cfm'); // Thay 'YOUR_PAGE_URL' bằng URL của trang bạn muốn tự động hóa
  const iframeElement = await page.waitForSelector('iframe');

  // Get the iframe's content frame
  const iframe = await iframeElement.contentFrame();

  console.log({ iframe });

  // Now you can interact with the iframe's content
  const button = await iframe.$('button');
  console.log({ button });

  // await button.click();

  // Lặp lại hành động click vào trang tiếp theo
  let isNextPageAvailable = true;

  while (isNextPageAvailable) {
    try {
      // Tìm liên kết trang tiếp theo trong DOM
      const nextButton = await page.$('a[href*="getData_"]'); // Tìm liên kết có chứa "getData_"

      console.log({ nextButton });

      if (nextButton) {
        await nextButton.click(); // Click vào nút trang tiếp theo
        console.log('Đã click vào trang tiếp theo');
        // Chờ một phần tử mới xuất hiện sau khi click (ví dụ như một phần tử xác nhận rằng trang đã tải)
        isNextPageAvailable = false;
      } else {
        console.log('Không tìm thấy liên kết trang tiếp theo!');
        isNextPageAvailable = false; // Dừng lại nếu không còn liên kết "next"
      }
    } catch (error) {
      console.error('Lỗi khi tìm hoặc click vào nút tiếp theo:', error);
      isNextPageAvailable = false; // Dừng lại nếu gặp lỗi
    }
  }

  // Đóng trình duyệt sau khi hoàn thành
  // await browser.close();
})();
