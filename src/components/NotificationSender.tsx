import React, { useState, useEffect, MouseEventHandler } from 'react';

// NotificationPermission 类型来自 lib.dom.d.ts
// NotificationOptions 类型也来自 lib.dom.d.ts

function NotificationSender(): JSX.Element {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [showRequestButton, setShowRequestButton] = useState<boolean>(true);

  useEffect(() => {
    if (Notification.permission === 'granted') {
      setShowRequestButton(false);
    } else if (Notification.permission === 'denied') {
      setShowRequestButton(false);
      console.warn('用户已拒绝桌面通知权限。');
    }
    // 如果是 'default'，则 showRequestButton 默认为 true
  }, []);

  const requestPermission: MouseEventHandler<HTMLButtonElement> = async () => {
    if (!('Notification' in window)) {
      alert('此浏览器不支持桌面通知！');
      setShowRequestButton(false);
      return;
    }

    try {
      const status: NotificationPermission = await Notification.requestPermission();
      setPermission(status);
      setShowRequestButton(false);
      if (status === 'granted') {
        console.log('桌面通知权限已授予！');
      } else {
        console.warn(`桌面通知权限被拒绝或未授予: ${status}`);
      }
    } catch (error) {
      console.error('请求通知权限时出错:', error);
      setShowRequestButton(false);
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions): void => {
    console.log(`[sendNotification] Called. Permission: ${permission}`); // 新增日志

    if (permission !== 'granted') {
      alert('请先启用桌面通知权限！');
      console.warn('[sendNotification] Permission not granted.'); // 新增日志
      if (Notification.permission !== 'denied') {
        setShowRequestButton(true);
      }
      return;
    }

    console.log('[sendNotification] Attempting to create notification with:', title, options); // 新增日志

    try {
      const notification = new Notification(title, options);
      console.log('[sendNotification] Notification object created:', notification); // 新增日志

      notification.onshow = () => { // 尝试监听 onshow 事件
        console.log('[sendNotification] Notification.onshow event fired!');
      };

      notification.onclick = () => {
        console.log('[sendNotification] Notification clicked!');
        if (window.parent && window.parent !== window) {
          window.parent.focus();
        } else {
          window.focus();
        }
        notification.close();
      };

      notification.onerror = (event) => { // event 参数可以提供更多错误信息
        console.error('[sendNotification] Notification.onerror event fired:', event);
      };

      notification.onclose = () => {
        console.log('[sendNotification] Notification.onclose event fired!');
      };

    } catch (error) {
      console.error('[sendNotification] Error during new Notification():', error); // 捕获直接错误
    }
  };

  const handleSendTestNotification: MouseEventHandler<HTMLButtonElement> = () => {
    console.log('[handleSendTestNotification] Clicked.'); // 新增日志
    sendNotification('测试通知 🚀 ', {
      body: '这是一个测试通知！' + Math.ceil(Math.random() * 1000),
      icon: '/logo192.png', // 确保此路径在 public 文件夹下有效
      tag: 'test-notification-tsx' + Math.ceil(Math.random() * 1000),
      renotify: true,
      // silent: true,
      // requireInteraction: true,
    });
  };

  return (
    <div>
      <h2>浏览器桌面通知</h2>
      {showRequestButton && permission === 'default' && (
        <button onClick={requestPermission}>启用桌面通知</button>
      )}

      {permission === 'granted' && (
        <button className='px-4 py-2 my-3 border bg-slate-300' onClick={handleSendTestNotification}>发送测试通知</button>
      )}

      {permission === 'denied' && (
        <p style={{ color: 'red' }}>
          您已禁用桌面通知。请在浏览器设置中更改此项以接收通知。
        </p>
      )}
      {permission === 'granted' && !showRequestButton && (
         <p style={{ color: 'green' }}>桌面通知已启用。</p>
      )}
    </div>
  );
}

export default NotificationSender;