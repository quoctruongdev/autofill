const paginierung = document.querySelector('div.paginierung');
console.log({ paginierung, document });
const aElements = paginierung ? paginierung.querySelectorAll('a') : null;
if (!aElements) return;
console.log('aElement', aElements);
aElements.forEach((element) => {
  const href = element.href;
  const text = element.textContent;
  const page = new URL(window.location.href).searchParams.get('page') || '2';
  console.log('href', href, text, { page });
  if (element && href && text == page) {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
    });
    element.dispatchEvent(clickEvent);
  }
});

console.log('script.js is running');
// const levelList = document.querySelector('.pr-level-select');
// if (levelList) {
//   const youngPeopleLink = levelList.querySelector('li#level_select_20 a'); // DOM tới phần tử chứa "Young people"

//   // Kiểm tra nếu phần tử tồn tại và tự động click vào nó
//   if (youngPeopleLink) {
//     youngPeopleLink.click();
//     console.log('Đã chuyển sang Young people');
//   } else {
//     console.log('Không tìm thấy liên kết tới Young people.');
//   }
// }
