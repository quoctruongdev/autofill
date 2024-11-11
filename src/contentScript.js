// 'use strict';
import { storage, goBack, isOpenOrderDay, parseDate, sleep } from './utils';
import { routes } from './routes';
import { DEFAULT_EMAIL, DEFAULT_PASSWORD, TARGET_DATE } from './constants';

const currentUrl = window.location.href;
let isAutoClick = true;
let isClicked = false;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log({ request });
  if (request.type === 'START_AUTO_CLICK') {
    isAutoClick = true;
    if (!isAutoClick) return;
    console.log('START_AUTO_CLICK', { isAutoClick });
    if (routes.selectModule.includes(currentUrl) && !isClicked) {
      handleSelectCourses();
    }
    handleOtherAction();
  }
  if (request.type === 'STOP_AUTO_CLICK') {
    isAutoClick = false;
    // await storage.clear();
    console.log('STOP_AUTO_CLICK', { isAutoClick });
  }
  sendResponse({
    message: 'Start event received',
  });
  return true;
});

// function handleAddScript() {
//   console.log('handleAddScript');
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs.length === 0) return;
//     const tab = tabs[0];
//   });
// }

function handleOtherAction() {
  const routeHandlers = {
    [routes.options[0]]: handleSelectOptions,
    [routes.selections[0]]: handleSelections,
    [routes.errors[0]]: goBack,
    [routes.login[0]]: handleLoginToBooking,
    [routes.childAccount[0]]: handleAllDataForChild,
    [routes.voucher[0]]: handleContinueButton,
    [routes.summary[0]]: handleOrderButton,
  };
  for (const route in routeHandlers) {
    if (currentUrl.includes(route)) {
      routeHandlers[route]();
      break;
    }
  }
}

// Step1: Start
async function autoRetryCourses() {
  const container = document.querySelectorAll('tr');
  if (container) {
    container.forEach(async (container) => {
      const dateElement = container.querySelector('p.pr-frist-text');
      if (!dateElement) return false;
      const textDate = dateElement.innerText;
      const firstDateMatch = textDate.match(/^\d{2}\.\d{2}\.\d{4}/);
      const firstDateString = firstDateMatch ? firstDateMatch[0] : null;
      const persistDateBooking = await chrome.storage.local.get(
        'dateBookingForm'
      );
      console.log('new date', persistDateBooking);
      const computedDate = persistDateBooking?.dateBookingForm?.date
        ?.split('-')
        ?.reverse()
        ?.join('.');
      const currentDateBooking = computedDate || TARGET_DATE;
      const isOpen = isOpenOrderDay(firstDateString, currentDateBooking);
      if (!isOpen) return false;
      console.log('textDay', { firstDateString, isOpen });
      const button = container.querySelector('button');
      if (button && !button.disabled) {
        button.click();
        console.log('clicked');
        await storage.set('step', 'completed');
        isClicked = true;
        return true;
      }
    });
  }

  // handleAddScript();

  //** Handle auto go to next page */
  // const paginierung = document.getElementById('paginierung_7629592');
  // const aElement = paginierung ? paginierung.querySelector('a') : null;
  // if (aElement) {
  //   const clickEvent = new MouseEvent('click', {
  //     bubbles: true,
  //   });
  //   aElement.dispatchEvent(clickEvent);
  // }

  // chrome.scripting.executeScript({
  //   target: { tabId: yourTabId },
  //   func: () => {
  //     const script = document.createElement('script');
  //     script.textContent = 'getData_7629592(11);';
  //     document.documentElement.appendChild(script);
  //     script.remove();
  //   },
  // });
  return false;
}

async function handleSelectCourses() {
  await autoRetryCourses();
  console.log('before retry', { isClicked });
  let timerRetry = setTimeout(async () => {
    if (!isClicked && isAutoClick) {
      handleSelectCourses();
      console.log('retry in', { isClicked });
    }
  }, 300);
  if (isClicked) {
    console.log('allDisabled clearTimeout', isClicked);
    return clearTimeout(timerRetry);
  }
}
// Step2: Start
function handleContinueButton() {
  const buttonContinue = document.querySelector(
    '.cs-button.cs-button--arrow_next'
  );
  if (buttonContinue && !buttonContinue.disabled) {
    buttonContinue.click();
    console.log("Clicked 'continue' button");
  }
}
function handleOrderButton() {
  const buttonContinue = document.querySelector(
    '.cs-button.cs-button--arrow_next'
  );
  if (
    buttonContinue.innerHTML.includes('continue') &&
    !buttonContinue.disabled
  ) {
    buttonContinue.click();
    console.log("Clicked 'continue' button");
  }
}
async function handleSelectOptions() {
  const inputContainer = document.querySelectorAll('input.cs-checkbox__input');
  const userInfo = await storage.get('selectedValue');
  console.log('userInfo', userInfo);
  if (inputContainer) {
    inputContainer.forEach((element) => {
      const id = element.getAttribute('id').trim();
      console.log(id);
      if (id && !element.disabled) {
        if (!userInfo.skills.includes(id)) {
          element.checked = true;
          element.click();
        }
        element.value = 'on';
      }
    });
    handleContinueButton();
  }
}
//Step3 : Start
function handleSelections() {
  const buttonWrapper = document.querySelector('.cs-layer__button-wrapper');
  if (buttonWrapper) {
    const buttons = buttonWrapper.querySelectorAll('button');
    buttons.forEach((btn) => {
      if (btn.innerText.includes('BOOK FOR MYSELF')) {
        btn.click();
        console.log("Clicked 'BOOK FOR MYSELF'");
        localStorage.setItem('currentStep', '4');
      }
    });
  }
}
//Step4: Start
function handleLoginToBooking() {
  const inputArray = document.querySelectorAll('input');
  inputArray.forEach((input) => {
    if (input.type === 'email') input.value = DEFAULT_EMAIL;
    else if (input.type === 'password') input.value = DEFAULT_PASSWORD;
  });
  const button = document.querySelector('.btn.submit.arrow.right');
  if (button && button.value === 'Log in' && !button.disabled) button.click();
}
//Step5 : Start
async function handleSelectNewChild() {
  const selectElements = document.getElementsByClassName(
    'cs-input__select cs-select'
  );
  for (let select of selectElements) {
    if (select.value === '') {
      const options = select.getElementsByTagName('option');
      for (let option of options) {
        if (option.textContent === 'Add a new child') {
          select.value = option.value;
          break;
        }
      }
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
      break;
    }
  }
}
// async function handleSelectData(queryName) {
//   const userInfo = await storage.get('selectedValue');
//   if (!userInfo) return;
//   const selectElements = document.querySelectorAll(queryName);
//   const [day, month, year] = parseDate(userInfo.birthday);
//   let step = 0;
//   console.log(step, 'before monthSelector');
//   selectElements.forEach(async (element) => {
//     if (element.name.includes('dateBirth:daySelector')) {
//       element.value = day - 1;
//       element.dispatchEvent(new Event('change'));
//       await sleep(400);
//       step = 1;
//     }

//     console.log(step, 'before monthSelector');
//     if (step === 1 && element.name.includes('dateBirth:monthSelector')) {
//       element.value = month - 1;
//       element.dispatchEvent(new Event('change'));
//       await sleep(400);
//       step = 2;
//     }
//     console.log(step, 'before yearSelector');
//     if (step === 2 && element.name.includes('dateBirth:yearSelector')) {
//       const options = Array.from(element.getElementsByTagName('option'));
//       options.forEach((option) => option.removeAttribute('selected'));
//       const matchesElement = options.find((item) => item.innerHTML == year);
//       if (matchesElement) {
//         element.value = matchesElement.value.toString();
//         matchesElement.selected = true;
//       }
//       element.dispatchEvent(new Event('change'));
//       await sleep(400);
//       step === 3;
//     }
//     return element;
//   });
// }
async function handlePersonalData() {
  const inputArray = document.querySelectorAll('input');
  const userInfo = await storage.get('selectedValue');
  inputArray.forEach((input) => {
    input.autocomplete = 'off';
    input.disabled = false;
    if (input.name.includes('firstName')) input.value = userInfo.firstName;
    else if (input.name.includes('lastName')) input.value = userInfo.lastName;
    else if (input.name.includes('postalCode'))
      input.value = userInfo.postalCode;
    else if (input.name.includes('participantNo'))
      input.value = userInfo.participantNo;
    else if (input.name.includes('mobilePhone'))
      input.value = userInfo.mobilePhone;
    else if (input.name.includes('city')) input.value = userInfo.city;
    else if (input.name.includes('street')) input.value = userInfo.street;
    else if (input.name.includes('birthplace'))
      input.value = userInfo.birthplace;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function nextStep() {
  const button = document.querySelector(
    'button.cs-button.cs-button--arrow_next'
  );
  if (button && !button.disabled) button.click();
}

function getContainerSelectItem(container, itemName) {
  const select = container.querySelector('select.cs-input__select.cs-select');
  if (!select) return [];
  if (select.name.includes(itemName)) {
    const button = container.querySelector('button.cs-html-select__trigger');
    button.click();
    const menuItems = container.querySelectorAll(
      'li.cs-html-select__menu-item'
    );
    return [menuItems, button];
  }
  return [];
}
function selectDate(menuItems, selectValue) {
  menuItems.forEach((item) => {
    const textElement = item.querySelector('.cs-html-select__menu-item-text');
    const text = textElement.textContent;
    if (text === selectValue) {
      const link = item.querySelector('.cs-html-select__menu-link');
      link.click();
      selectValue = true;
    }
  });
}
function selectMonth(menuItems, selectValue) {
  if (!menuItems) return;
  console.log({ menuItems, selectValue });

  const currentLink = menuItems[selectValue];
  if (!currentLink) return;
  console.log('currentLink', currentLink);
  const link = currentLink.querySelector('.cs-html-select__menu-link');
  if (!link) return;
  link.click();
}
function selectYear(menuItems, selectValue) {
  menuItems.forEach((item) => {
    const textElement = item.querySelector('.cs-html-select__menu-item-text');
    const text = textElement.textContent;
    if (text === selectValue) {
      const link = item.querySelector('.cs-html-select__menu-link');
      link.click();
    }
  });
}

let step = 0;
async function handleAllDataForChild() {
  const userInfo = await storage.get('selectedValue');
  if (!userInfo) return;

  console.log('userInfo', userInfo);

  const [day, month, year] = parseDate(userInfo.birthday);

  handleSelectNewChild();
  handlePersonalData();
  const feilds = document.querySelector('div.cs-input.cs-input--birth-selects');
  const containers = feilds.querySelectorAll('div.cs-html-select');
  async function selectBirthday() {
    if (step === 0) {
      const [menuYearsItems, buttonYear] = getContainerSelectItem(
        containers[2],
        'dateBirth:yearSelector'
      );
      console.log({ menuYearsItems });
      console.log('step in selectYear', step);
      const selectValue = `${year}`;
      selectYear(menuYearsItems, selectValue);
      await sleep(2000);
      step = 1;
      const selectedValue = buttonYear.title;
      console.log({ selectValue, selectedValue });
      // if (selectValue === selectedValue) {
      //   step = 1;
      //   // stopTimer();
      // } else {
      //   selectYear(menuYearsItems, selectValue);
      // }
    }
    if (step === 1) {
      const [menuMonthItems, buttonMonth] = getContainerSelectItem(
        containers[1],
        'dateBirth:monthSelector'
      );
      const selectValue = `${month}`;
      // selectMonth(menuMonthItems, selectValue);
      selectMonth(menuMonthItems, month);
      await sleep(2000);
      step = 2;
      // const date = new Date('2024', Number(month) - 1, 1);
      // console.log({ date });
      // const fomatSelectValue = date.toLocaleString('en-US', { month: 'long' });
      // const selectedValue = buttonMonth.title;
      // console.log(selectedValue, fomatSelectValue);
      // if (fomatSelectValue === selectedValue) {
      //   step = 2;
      // } else {
      //   selectMonth(menuMonthItems, month - 1);
      // }
    }
    if (step === 2) {
      const [menuDayItems, buttonDate] = getContainerSelectItem(
        containers[0],
        'dateBirth:daySelector'
      );
      const selectValue = `${day}`;
      selectDate(menuDayItems, selectValue);
      await sleep(2000);
      step = 3;
      // if (selectValue === buttonDate.title) {
      //   step = 3;
      // }
    }

    if (step === 3) {
      nextStep();
    }
  }

  selectBirthday();
  let timer;
  // const startTimer = () => {
  //   if (step !== 3 && isAutoClick) {
  //     timer = setInterval(() => selectBirthday(), 1000);
  //     console.log('timer started', timer);
  //   }
  // };
  // startTimer();
  // const stopTimer = () => {
  //   if (step === 3) {
  //     // Dừng setInterval khi step là 3
  //     console.log(step, 'next step');
  //     clearInterval(timer);
  //     console.log('timer cleared', timer);
  //     isAutoClick && nextStep();
  //   }
  // };
}

// contentScript.js

//Auto actions
window.addEventListener('load', async () => {
  const stepStatus = await storage.get('step');
  console.log('stepStatus', stepStatus);
  const currentUrl = window.location.href;
  if (stepStatus === 'retry' && routes.selectModule.includes(currentUrl)) {
    console.log('Retrying step after reload...');
    handleSelectCourses();
  }
  if (isAutoClick && stepStatus === 'completed') {
    console.log(' setInterval(handleOtherAction, 2000)', {
      isAutoClick,
      isClicked,
    });
    // handleOtherAction();
    setInterval(handleOtherAction, 1500);
  }
});
