'use strict';
import './popup.css';
import { informationUsers } from './constants';
import { sleep, storage } from './utils';

(function () {
  async function populateSelectOptions() {
    const selectedValue = document.getElementById('formSelect').value;
    const selectedUser = informationUsers.find(
      (item) => item.id == selectedValue
    );
    await chrome.storage.local.set({ selectedValue: selectedUser });
    const options = informationUsers;
    const selectDOM = document.getElementById('formSelect');
    selectDOM.innerHTML = '';
    options.forEach((option) => {
      const optionDOM = document.createElement('option');
      optionDOM.value = option.id;
      optionDOM.innerText = `${option.id} - ${option.firstName} ${option.lastName} - ${option.birthday}`;
      selectDOM.appendChild(optionDOM);
    });
    const persist = await chrome.storage.local.get('selectedValue');

    console.log({ selectedValue, persist });
    selectDOM.value = selectedValue || persist?.selectedValue?.id;
  }

  populateSelectOptions();
  function handleAutoSelectCourses() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      console.log({ tab });

      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'START_AUTO_CLICK',
          payload: tab,
        },
        (response) => {
          console.log('response handleSelectCourses', response);
          populateSelectOptions();
          // console.log('Current count value passed to contentScript file');
        }
      );
    });
  }
  function handleStopAutoCLick() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'STOP_AUTO_CLICK',
          payload: tabs,
        },
        async (response) => {
          console.log('response handleStopAutoCLick', response);
          await storage.clear();
        }
      );
    });
  }

  async function getFormDataAlarm() {
    const persist = await chrome.storage.local.get('dateForm');
    const datetime = document.getElementById('datetime')?.value;
    const selectDOMDateTime = document.getElementById('datetime');
    console.log({ datetime });
    const currentDateTime = datetime || persist?.dateForm?.datetime;
    if (!currentDateTime) return;
    selectDOMDateTime.value = currentDateTime;

    await chrome.storage.local.set({
      dateForm: { datetime: currentDateTime },
    });
    return { datetime: currentDateTime };
  }
  async function getFormDataBooking() {
    const persist = await chrome.storage.local.get('dateBookingForm');
    const date = document.getElementById('date')?.value;
    console.log({ date });
    console.log({ persist });
    const selectDOMDate = document.getElementById('date');
    selectDOMDate.innerHTML = '';
    const currentDate = date || persist?.dateBookingForm?.date;
    if (!currentDate) return;
    await chrome.storage.local.set({
      dateBookingForm: { date: currentDate },
    });
    selectDOMDate.value = currentDate;
    return { date: currentDate };
  }
  getFormDataAlarm();
  getFormDataBooking();
  async function sendDataToBackground() {
    const formData = await getFormDataAlarm();
    chrome.runtime.sendMessage(
      {
        type: 'getDateAndTime',
        data: formData,
      },
      async (response) => {
        console.log('Response from background:', response);
        populateSelectOptions();
        await getFormDataAlarm();
        await getFormDataBooking();
      }
    );
  }
  document
    .getElementById('startAutoClick')
    .addEventListener('click', handleAutoSelectCourses);
  document
    .getElementById('stopAutoClick')
    .addEventListener('click', handleStopAutoCLick);
  document
    .getElementById('setAlarm')
    .addEventListener('click', sendDataToBackground);
  document
    .getElementById('setDateBoking')
    .addEventListener('click', getFormDataBooking);

  function setYourButton() {
    console.log('yourButton');
    const currentPage = document.querySelector('.paginierung .aktuelleSeite');
    if (currentPage) {
      const currentPageNumber = parseInt(currentPage.textContent);
      if (currentPageNumber === 1) {
        const links = document.querySelectorAll('.paginierung a');
        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('javascript:')) {
            link.click();
          }
        });
      }
    }
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //   chrome.scripting.executeScript({
    //     target: { tabId: tabs[0].id },
    //     func: function () {
    //       const currentPage = document.querySelector(
    //         '.paginierung .aktuelleSeite'
    //       );
    //       if (currentPage) {
    //         const currentPageNumber = parseInt(currentPage.textContent);
    //         if (currentPageNumber === 1) {
    //           const links = document.querySelectorAll('.paginierung a');
    //           links.forEach((link) => {
    //             const href = link.getAttribute('href');
    //             if (href && href.startsWith('javascript:')) {
    //               link.click();
    //             }
    //           });
    //         }
    //       }
    //     },
    //   });
    // });
  }
  document
    .getElementById('yourButton')
    .addEventListener('click', setYourButton);
})();
