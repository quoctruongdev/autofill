const paginierung = document.getElementById('paginierung_7629592');
console.log({ paginierung, document });
const aElement = paginierung ? paginierung.querySelector('a') : null;
if (aElement) {
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
  });
  aElement.dispatchEvent(clickEvent);
}
console.log('script.js is running');
// alert('running');
// setTimeout(() => {
//   // Chạy hàm điều hướng trang tiếp theo, giả sử là `getData_7629592`
//   console.log('123123123');
//   if (typeof getData_7629592 === 'function') {
//     getData_7629592(11); // Chuyển đến trang có số `11` hoặc số trang khác bạn muốn
//   }
// }, 5000);
