// 彈出窗口的腳本
document.addEventListener('DOMContentLoaded', function() {
  // 獲取刷新按鈕
  const refreshButton = document.getElementById('refresh-btn');
  
  // 添加點擊事件處理程序
  refreshButton.addEventListener('click', function() {
    // 獲取當前活動標簽頁
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs[0]) {
        // 刷新當前標簽頁
        chrome.tabs.reload(tabs[0].id);
        // 關閉彈出窗口
        window.close();
      }
    });
  });
});