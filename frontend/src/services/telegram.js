// Telegram WebApp initialization
export const initTelegram = () => {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      tg.ready();
      tg.expand();
      
      resolve({
        tg,
        user: tg.initDataUnsafe?.user,
        initData: tg.initData
      });
    } else {
      // For development outside Telegram
      console.log('Telegram WebApp not available');
      resolve({
        tg: null,
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser'
        },
        initData: 'test'
      });
    }
  });
};

export const showAlert = (message) => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.showAlert(message);
  } else {
    alert(message);
  }
};

export const showConfirm = (message) => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    return tg.showConfirm(message);
  }
  return window.confirm(message);
};