'use client';

import { useEffect, useState } from 'react';

const APP_URL = 'https://ilot02-1700log.vercel.app/';

export default function AppPrompts() {
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const installed = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const installDismissed = sessionStorage.getItem('ilot-install-dismissed') === '1';
    const shareDismissed = sessionStorage.getItem('ilot-share-dismissed') === '1';

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event);
      if (!installed && !installDismissed) setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    if (!installed && !installDismissed) {
      const timer = window.setTimeout(() => {
        if (installEvent || /Android|iPhone|iPad/i.test(navigator.userAgent)) setShowInstall(true);
      }, 900);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }
    if (!shareDismissed) {
      const timer = window.setTimeout(() => setShowShare(true), 1500);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, [installEvent]);

  const dismissInstall = () => {
    sessionStorage.setItem('ilot-install-dismissed', '1');
    setShowInstall(false);
  };

  const dismissShare = () => {
    sessionStorage.setItem('ilot-share-dismissed', '1');
    setShowShare(false);
  };

  const install = async () => {
    if (!installEvent) {
      alert('إذا لم يظهر خيار التثبيت تلقائيًا، افتح قائمة المتصفح ثم اختر «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق».');
      return;
    }
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setShowInstall(false);
    sessionStorage.setItem('ilot-install-dismissed', '1');
  };

  const shareWhatsApp = () => {
    const text = `🏠 منصة حي 1700 مسكن — إيلو 02\n\nيمكنك التسجيل ومتابعة أخبار وإعلانات الحي عبر المنصة:\n${APP_URL}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    dismissShare();
  };

  if (!showInstall && !showShare) return null;

  return (
    <>
      {showInstall && (
        <div className="appPromptOverlay" role="dialog" aria-modal="true" aria-labelledby="install-title">
          <div className="appPromptCard">
            <div className="appPromptIcon">📱</div>
            <h2 id="install-title">ثبّت منصة إيلو 02</h2>
            <p>ثبّت المنصة على هاتفك للوصول إليها بسرعة من الشاشة الرئيسية.</p>
            <div className="appPromptActions">
              <button className="appPromptPrimary" onClick={install}>📲 تثبيت التطبيق</button>
              <button className="appPromptSecondary" onClick={dismissInstall}>لاحقًا</button>
            </div>
          </div>
        </div>
      )}

      {showShare && !showInstall && (
        <div className="appPromptOverlay" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="appPromptCard">
            <div className="appPromptIcon">📢</div>
            <h2 id="share-title">شارك المنصة مع جار آخر</h2>
            <p>ساعدنا على تسجيل أكبر عدد من سكان الحي. أرسل رابط المنصة إلى جيرانك عبر واتساب.</p>
            <div className="appPromptActions">
              <button className="appPromptPrimary" onClick={shareWhatsApp}>💬 مشاركة عبر واتساب</button>
              <button className="appPromptSecondary" onClick={dismissShare}>لاحقًا</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
