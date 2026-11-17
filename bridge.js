// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Isolated-world relay bridge (zero permissions).
// Relays extension commands, localized strings, and popup state queries safely to MAIN world.

(() => {
  'use strict';

  const ext = globalThis.browser || globalThis.chrome;
  const TO_MAIN = '__clipzero_to_main__';
  const TO_ISOLATED = '__clipzero_to_isolated__';
  const targetOrigin = window.location.origin;

  if (!targetOrigin || targetOrigin === 'null') {
    return;
  }

  let reqCounter = 0;
  const pendingRequests = new Map();
  let bridgePort = null;
  let channelConfirmed = false;
  const pendingPorts = new Set();
  let handshakeTimer = null;
  let cachedI18nStrings = null;
  let latestShortcuts = null;

  function generateBridgeToken() {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      let hex = '';
      for (let i = 0; i < buf.length; i += 1) {
        hex += buf[i].toString(16).padStart(2, '0');
      }
      return hex;
    }
    return `${Math.random().toString(16).slice(2).padEnd(16, '0')}${Math.random().toString(16).slice(2).padEnd(16, '0')}`;
  }

  const bridgeToken = generateBridgeToken();

  function msg(key, fallback) {
    try {
      return ext?.i18n?.getMessage?.(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function buildToastStrings() {
    return {
      filesWord: msg('toastFilesWord', 'files'),
      hintPause: msg('hintPause', 'pause'),
      hintAll: msg('hintAll', 'all'),
      hintExif: msg('hintExif', 'metadata'),
      hintRedact: msg('hintRedact', 'redact'),
      hintSecrets: msg('hintSecrets', 'secrets'),
      activeTitle: msg('toastActiveTitle', 'ClipZero active'),
      activeSub: msg('toastActiveSub', 'Uploads will be anonymized'),
      pausedTitle: msg('toastPausedTitle', 'ClipZero paused'),
      pausedSub: msg('toastPausedSub', 'Original filenames kept'),
      strictOnTitle: msg('toastStrictOnTitle', 'Rename all · ON'),
      strictOnSub: msg('toastStrictOnSub', 'Custom names and documents will be renamed'),
      strictOffTitle: msg('toastStrictOffTitle', 'Rename all · OFF'),
      strictOffSub: msg('toastStrictOffSub', 'Custom unique names and documents kept'),
      exifOnTitle: msg('toastExifOnTitle', 'Strip metadata · ON'),
      exifOnSub: msg('toastExifOnSub', 'EXIF, GPS, and SVG metadata cleaner enabled'),
      exifOffTitle: msg('toastExifOffTitle', 'Strip metadata · OFF'),
      exifOffSub: msg('toastExifOffSub', 'Instant zero-delay upload restored'),
      redactOnTitle: msg('toastRedactOnTitle', 'Canvas redactor · ON'),
      redactOnSub: msg('toastRedactOnSub', 'Draw boxes to hide areas before upload'),
      redactOffTitle: msg('toastRedactOffTitle', 'Canvas redactor · OFF'),
      redactOffSub: msg('toastRedactOffSub', 'Images upload directly without preview'),
      secretsOnTitle: msg('toastSecretsOnTitle', 'Secret guard · ON'),
      secretsOnSub: msg('toastSecretsOnSub', 'API keys, tokens, and URLs masked on paste'),
      secretsOffTitle: msg('toastSecretsOffTitle', 'Secret guard · OFF'),
      secretsOffSub: msg('toastSecretsOffSub', 'Pasted secrets left untouched'),
      piiOnTitle: msg('toastPiiOnTitle', 'Contact & IP guard · ON'),
      piiOnSub: msg('toastPiiOnSub', 'Emails, phones, and IPs masked on paste'),
      piiOffTitle: msg('toastPiiOffTitle', 'Contact & IP guard · OFF'),
      piiOffSub: msg('toastPiiOffSub', 'Contacts and IPs left untouched'),
      debugOnTitle: msg('toastDebugOnTitle', 'Debug logs · ON'),
      debugOnSub: msg('toastDebugOnSub', 'Privacy-safe DevTools traces enabled'),
      debugOffTitle: msg('toastDebugOffTitle', 'Debug logs · OFF'),
      debugOffSub: msg('toastDebugOffSub', 'Console traces muted'),
      optimizeOnTitle: msg('toastOptimizeOnTitle', 'Limit 2048 px · ON'),
      optimizeOnSub: msg('toastOptimizeOnSub', 'Large images capped at 2048 px'),
      optimizeOffTitle: msg('toastOptimizeOffTitle', 'Limit 2048 px · OFF'),
      optimizeOffSub: msg('toastOptimizeOffSub', 'Original resolution preserved'),
      toastOnTitle: msg('toastToastOnTitle', 'Notice · ON'),
      toastOnSub: msg('toastToastOnSub', 'Upload confirmations enabled'),
      toastOffTitle: msg('toastToastOffTitle', 'Notice · OFF'),
      toastOffSub: msg('toastToastOffSub', 'Silent mode'),
      saveOnTitle: msg('toastSaveOnTitle', 'Saved for this site'),
      saveOnSub: msg('toastSaveOnSub', 'Settings stored on this domain only'),
      saveOffTitle: msg('toastSaveOffTitle', 'Session only'),
      saveOffSub: msg('toastSaveOffSub', 'Saved site settings cleared'),
      storageResetTitle: msg('toastStorageResetTitle', 'Site settings reset'),
      storageResetSub: msg(
        'toastStorageResetSub',
        'Corrupted or incompatible saved data was cleared'
      ),
      secretsMaskedTitle: msg('toastSecretsMaskedTitle', 'Secrets masked'),
      secretsMaskedSub: msg('toastSecretsMaskedSub', 'sensitive items replaced before paste'),
      toastSecretsReviewBtn: msg('toastSecretsReviewBtn', 'Review'),
      secretsModalTitle: msg('secretsModalTitle', 'Protected secrets'),
      secretsModalSub: msg(
        'secretsModalSub',
        'Pasted text stays masked. Uncheck items you want to allow, or paste the original once.'
      ),
      secretsShowBtn: msg('secretsShowBtn', 'Show'),
      secretsHideBtn: msg('secretsHideBtn', 'Hide'),
      secretsKeepBtn: msg('secretsKeepBtn', 'Keep masked'),
      secretsApplyBtn: msg('secretsApplyBtn', 'Apply selection'),
      secretsCopySelectedBtn: msg('secretsCopySelectedBtn', 'Copy selection'),
      secretsPasteRawBtn: msg('secretsPasteRawBtn', 'Paste original once'),
      secretsCopyRawBtn: msg('secretsCopyRawBtn', 'Copy original'),
      secretsRestoredTitle: msg('secretsRestoredTitle', 'Original pasted'),
      secretsRestoredSub: msg('secretsRestoredSub', 'Secret guard stays enabled'),
      secretsCopiedTitle: msg('secretsCopiedTitle', 'Original copied'),
      tokensDetectedCopyTitle: msg('tokensDetectedCopyTitle', 'Masked tokens copied'),
      tokensDetectedCopySub: msg(
        'tokensDetectedCopySub',
        'Restore original values to clipboard for this copy?'
      ),
      tokensRestoreClipBtn: msg('tokensRestoreClipBtn', 'Restore originals'),
      tokensRestoredClipTitle: msg('tokensRestoredClipTitle', 'Originals restored to clipboard'),
      secretsChangedNotice: msg(
        'secretsChangedNotice',
        'Edited block changed in chat; copy original manually if needed.'
      ),
      redactModalTitle: msg('redactModalTitle', 'Redact before upload'),
      redactModalHint: msg(
        'redactModalHint',
        'Drag or N/+ Box · Arrows move · Shift+Arrows resize · Del removes · Enter uploads'
      ),
      redactModalHintBatch: msg(
        'redactModalHintBatch',
        'Drag or N/+ Box · Arrows/Shift resize · Del removes · PgUp/PgDn slides · Enter uploads'
      ),
      redactBtnAddBox: msg('redactBtnAddBox', '+ Box'),
      redactBtnPrev: msg('redactBtnPrev', 'Prev'),
      redactBtnNext: msg('redactBtnNext', 'Next'),
      redactBtnSkip: msg('redactBtnSkip', 'Skip'),
      redactBtnInclude: msg('redactBtnInclude', 'Include'),
      redactSkippedTag: msg('redactSkippedTag', 'Skipped'),
      redactBtnUndo: msg('redactBtnUndo', 'Undo'),
      redactBtnClear: msg('redactBtnClear', 'Clear'),
      redactBtnCancel: msg('redactBtnCancel', 'Cancel'),
      redactBtnSend: msg('redactBtnSend', 'Upload'),
      redactModeCover: msg('redactModeCover', 'Cover'),
      redactModeOutline: msg('redactModeOutline', 'Outline'),
      redactModePen: msg('redactModePen', 'Pen'),
      redactModeCrop: msg('redactModeCrop', 'Crop'),
      redactModeScroll: msg('redactModeScroll', 'Scroll'),
      redactWeightThin: msg('redactWeightThin', 'Thin'),
      redactWeightMedium: msg('redactWeightMedium', 'Medium'),
      redactWeightThick: msg('redactWeightThick', 'Thick'),
      redactColorBlack: msg('redactColorBlack', 'Black'),
      redactColorWhite: msg('redactColorWhite', 'White'),
      redactColorRed: msg('redactColorRed', 'Red'),
      redactColorBlue: msg('redactColorBlue', 'Blue'),
      redactColorGreen: msg('redactColorGreen', 'Green'),
      redactColorYellow: msg('redactColorYellow', 'Yellow'),
    };
  }

  function closeUnusedPorts(keepPort) {
    for (const p of pendingPorts) {
      if (p !== keepPort) {
        try {
          p.close();
        } catch {
          // Ignore already-closed ports.
        }
      }
    }
    pendingPorts.clear();
  }

  function confirmChannelPort(port) {
    if (!port) {
      return;
    }
    const firstConfirm = !channelConfirmed;
    channelConfirmed = true;
    bridgePort = port;
    if (handshakeTimer !== null) {
      clearTimeout(handshakeTimer);
      handshakeTimer = null;
    }
    closeUnusedPorts(port);
    if (firstConfirm && latestShortcuts) {
      try {
        port.postMessage({
          __clipzero: TO_MAIN,
          token: bridgeToken,
          requestId: 0,
          payload: { type: 'clipzero:shortcuts', shortcuts: latestShortcuts },
        });
      } catch {
        // Ignore shortcut push failures cleanly.
      }
    }
  }

  function deliverIsolatedReplyData(data, fromPort) {
    if (!data || data.__clipzero !== TO_ISOLATED || data.token !== bridgeToken) {
      return false;
    }
    if (fromPort) {
      confirmChannelPort(fromPort);
    }
    const resolve = pendingRequests.get(data.requestId);
    if (resolve) {
      pendingRequests.delete(data.requestId);
      resolve({ ok: true, state: data.state || null, hostPrefix: data.hostPrefix || 'clip' });
    }
    return true;
  }

  function handleIsolatedReply(event) {
    if (event.source !== window || event.origin !== targetOrigin) {
      return;
    }
    if (deliverIsolatedReplyData(event.data, null)) {
      event.stopImmediatePropagation();
    }
  }

  window.addEventListener('message', handleIsolatedReply, true);

  function postMessageToMain(messageObj) {
    if (bridgePort && (channelConfirmed || pendingPorts.size === 1)) {
      try {
        bridgePort.postMessage(messageObj);
        return;
      } catch {
        bridgePort = null;
        channelConfirmed = false;
      }
    }
    window.postMessage(messageObj, targetOrigin);
  }

  function sendHandshake() {
    if (channelConfirmed) {
      return;
    }
    if (!cachedI18nStrings) {
      cachedI18nStrings = buildToastStrings();
    }
    const initMessage = {
      __clipzero: TO_MAIN,
      token: bridgeToken,
      requestId: 0,
      payload: { type: 'clipzero:i18n', strings: cachedI18nStrings },
    };
    if (typeof MessageChannel === 'function') {
      const channel = new MessageChannel();
      const port1 = channel.port1;
      pendingPorts.add(port1);
      port1.onmessage = (event) => {
        deliverIsolatedReplyData(event ? event.data : null, port1);
      };
      if (!bridgePort) {
        bridgePort = port1;
      }
      try {
        window.postMessage(initMessage, targetOrigin, [channel.port2]);
        return;
      } catch {
        pendingPorts.delete(port1);
        if (bridgePort === port1) {
          bridgePort = null;
        }
        try {
          port1.close();
        } catch {
          // Ignore cleanup errors.
        }
      }
    }
    window.postMessage(initMessage, targetOrigin);
  }

  function dispatchBridgeMessage(messageObj) {
    if (channelConfirmed && bridgePort) {
      postMessageToMain(messageObj);
      return;
    }
    // Cold-start recovery: only create a handshake channel if none is currently pending.
    if (pendingPorts.size === 0) {
      sendHandshake();
    }
    setTimeout(() => {
      postMessageToMain(messageObj);
    }, 30);
  }

  function forwardToMain(payload) {
    return new Promise((resolve) => {
      reqCounter += 1;
      const requestId = reqCounter;
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          pendingRequests.delete(requestId);
          resolve({ ok: false });
        }
      }, 600);

      pendingRequests.set(requestId, (result) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(result);
        }
      });

      dispatchBridgeMessage({
        __clipzero: TO_MAIN,
        token: bridgeToken,
        requestId,
        payload,
      });
    });
  }

  ext.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message.type !== 'string') {
      return undefined;
    }
    if (
      message.type === 'clipzero:command' ||
      message.type === 'clipzero:get-state' ||
      message.type === 'clipzero:set-custom-words'
    ) {
      forwardToMain(message).then(sendResponse);
      return true;
    }
    return undefined;
  });

  // Establish a dedicated private MessageChannel at document_start and auto-heal if MAIN lags.
  sendHandshake();
  const retryDelays = [90, 320];
  let retryIdx = 0;
  function scheduleHandshakeRetry() {
    if (channelConfirmed || retryIdx >= retryDelays.length) {
      return;
    }
    const waitMs = retryDelays[retryIdx];
    retryIdx += 1;
    handshakeTimer = setTimeout(() => {
      handshakeTimer = null;
      if (!channelConfirmed) {
        sendHandshake();
        scheduleHandshakeRetry();
      }
    }, waitMs);
  }
  scheduleHandshakeRetry();

  // Push active keyboard shortcuts cleanly once confirmed (or via single active channel).
  ext.runtime
    .sendMessage({ type: 'clipzero:get-shortcuts' })
    .then((shortcuts) => {
      if (shortcuts && typeof shortcuts === 'object') {
        latestShortcuts = shortcuts;
        if (bridgePort && channelConfirmed) {
          postMessageToMain({
            __clipzero: TO_MAIN,
            token: bridgeToken,
            requestId: 0,
            payload: { type: 'clipzero:shortcuts', shortcuts },
          });
        }
      }
    })
    .catch(() => {
      // Ignore if background script is unavailable during shutdown/reload.
    });
})();
