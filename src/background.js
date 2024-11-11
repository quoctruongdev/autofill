chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: function () {
      console.log('excluded');
      const currentPage = document.querySelector('.paginierung .aktuelleSeite');

      if (currentPage) {
        const currentPageNumber = parseInt(currentPage.textContent);

        if (currentPageNumber === 1) {
          const links = document.querySelectorAll('.paginierung a');
          links.forEach((link) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('javascript:getData_7629592')) {
              link.click();
            }
          });
        }
      }
    },
  });
});
function setDailyAlarm(dateTimeString) {
  if (!dateTimeString) return;
  const now = new Date();
  const alarmTime = new Date(dateTimeString);
  if (isNaN(alarmTime.getTime())) {
    console.error('Invalid date or time:', dateTimeString);
    return;
  }
  if (now >= alarmTime) {
    console.log('set alarm', { now, alarmTime });
    alarmTime.setDate(alarmTime.getDate() + 1);
  }

  chrome.alarms.create('dailyAlarm', {
    when: alarmTime.getTime(),
    // periodInMinutes: 1440, // Đặt lại hàng ngày
  });

  console.log('Alarm set for:', alarmTime);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getDateAndTime') {
    console.log('Received data:', message.data);
    // Xử lý dữ liệu (hoặc lưu trữ) ở đây
    setDailyAlarm(message?.data?.datetime);
    sendResponse({ status: 'success' });
  }
});
chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'dailyAlarm') {
    console.log('Alarm triggered at 8 AM:', alarm);
    handleAutoSelectCourses();
    // Gửi thông báo khi alarm kích hoạt
    chrome.notifications.create(
      {
        type: 'basic', // Kiểu thông báo
        iconUrl: 'alarm.jpg', // Đường dẫn tới biểu tượng thông báo
        title: 'Auto Run', // Tiêu đề thông báo
        message: 'Your alarm has been triggered!', // Nội dung thông báo
        priority: 2, // Mức độ ưu tiên thông báo
      },
      function (notificationId) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError); // In lỗi nếu có
        } else {
          console.log('Notification created with ID:', notificationId);
        }
      }
    );
  }
});

function handleAutoSelectCourses() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'START_AUTO_CLICK',
        payload: tab,
      },
      (response) => {
        console.log('response handleSelectCourses auto', response);
      }
    );
  });
}
