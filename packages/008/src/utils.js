import pRetry from 'p-retry';

export const sleep = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time * 1000);
  });
};

export const readFileAsText = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e.target.error);
    reader.readAsText(file);
  });
};

export const blobToDataURL = blob => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const cleanPhoneNumber = number => number.replace(/[ ()]/g, '');

export const isMobile = () => {
  return (
    window?.ReactNativeWebView !== undefined ||
    !window ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator?.userAgent
    )
  );
};

export const genId = () => {
  return new Date().getTime() + '.' + Math.random().toString().slice(2, 8);
};

export const request = async ({
  endpoint,
  body,
  method = 'POST',
  retries = 5,
  qdelay = 30
}) => {
  const run = async attempt => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json'
        },
        method,
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error(`HTTP status: ${response.status}`);

      return await response.json();
    } catch (err) {
      const delay = qdelay * (attempt - 1);
      if (delay) await sleep(delay);
      throw err;
    }
  };

  return await pRetry(run, { retries });
};
