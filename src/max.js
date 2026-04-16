export function getMaxApp() {
  if (window.WebApp) {
    return window.WebApp;
  }

  return null;
}

export function getMaxUser() {
  const app = getMaxApp();

  if (!app || !app.initDataUnsafe || !app.initDataUnsafe.user) {
    return null;
  }

  return app.initDataUnsafe.user;
}

export function getMaxStartParam() {
  const app = getMaxApp();

  if (!app || !app.initDataUnsafe) {
    return null;
  }

  return app.initDataUnsafe.start_param || null;
}

export function getMaxPlatform() {
  const app = getMaxApp();

  if (!app) {
    return null;
  }

  return app.platform || null;
}

export function getMaxVersion() {
  const app = getMaxApp();

  if (!app) {
    return null;
  }

  return app.version || null;
}

export function getMaxInitData() {
  const app = getMaxApp();

  if (!app) {
    return '';
  }

  return app.initData || '';
}