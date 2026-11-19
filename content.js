// SPDX-License-Identifier: GPL-3.0-or-later
// ClipZero — Privacy-first upload renamer, lossless metadata cleaner, visual redactor, and secret guard for AI chats.
// Executed via Manifest V3 `world: "MAIN"` at `document_start` so native `paste`, `drop`, and file
// picker events keep `event.isTrusted === true` in default synchronous mode with zero global markers.

(() => {
  'use strict';

  const injectedAtDocumentStart = document.readyState === 'loading';

  // Capture pristine native APIs at document_start before page scripts execute.
  const NativeDataTransfer = window.DataTransfer;
  const NativeFile = window.File;
  const NativeClipboardEvent = window.ClipboardEvent;
  const NativeDragEvent = window.DragEvent;
  const NativeEvent = window.Event;
  const NativeMessageEvent = typeof window.MessageEvent === 'function' ? window.MessageEvent : null;
  const NativeInputEvent = typeof window.InputEvent === 'function' ? window.InputEvent : null;
  const NativeHTMLInputElement = window.HTMLInputElement;
  const NativeHTMLTextAreaElement = window.HTMLTextAreaElement;
  const NativeHTMLCanvasElement = window.HTMLCanvasElement;
  const NativeImage = window.Image;
  const nativeCreateImageBitmap =
    typeof window.createImageBitmap === 'function' ? window.createImageBitmap.bind(window) : null;
  const nativeBitmapClose =
    typeof ImageBitmap === 'function' &&
    ImageBitmap.prototype &&
    typeof ImageBitmap.prototype.close === 'function'
      ? ImageBitmap.prototype.close
      : null;
  const NativeDOMParser = window.DOMParser;
  const NativeXMLSerializer = window.XMLSerializer;
  const NativeURL = window.URL;
  const NativeWeakSet = window.WeakSet;
  const NativeMap = window.Map;
  const NativeSet = window.Set;
  const NativeUint8Array = window.Uint8Array;
  const NativeDataView = window.DataView;
  const NativeRegExp = window.RegExp;
  const TextEncoderCtor = window.TextEncoder;
  const TextDecoderCtor = window.TextDecoder;
  const sharedTextEncoder = TextEncoderCtor ? new TextEncoderCtor() : null;
  const sharedTextDecoder = TextDecoderCtor ? new TextDecoderCtor('utf-8', { fatal: false }) : null;
  let sharedLatin1Decoder = null;
  function getSharedLatin1Decoder() {
    if (!sharedLatin1Decoder && TextDecoderCtor) {
      sharedLatin1Decoder = new TextDecoderCtor('latin1');
    }
    return sharedLatin1Decoder;
  }
  const nativeConsoleLog =
    typeof console === 'object' && console && typeof console.log === 'function'
      ? console.log.bind(console)
      : null;
  const defineProperty = Object.defineProperty;
  const nativeGetOwnPropDesc = Object.getOwnPropertyDescriptor;
  const nativeHasOwn =
    typeof Object.hasOwn === 'function'
      ? Object.hasOwn
      : (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const nativeObjAssign = typeof Object.assign === 'function' ? Object.assign : null;
  const nativeObjKeys = typeof Object.keys === 'function' ? Object.keys : null;
  const nativeObjCreate = typeof Object.create === 'function' ? Object.create : null;
  const nativeIsArray = typeof Array.isArray === 'function' ? Array.isArray : (v) => v instanceof Array;
  const nativeMathMin = Math.min;
  const nativeMathMax = Math.max;
  const nativeMathRound = Math.round;
  const nativeMathFloor = Math.floor;
  const nativeMathCeil = Math.ceil;
  const nativeMathAbs = Math.abs;
  const nativeMathHypot = Math.hypot;
  const nativeMathLog2 = Math.log2;
  const nativeNumberIsFinite = Number.isFinite;
  const NativeAbortController = typeof window.AbortController === 'function' ? window.AbortController : null;
  const NativeMessagePort = typeof window.MessagePort === 'function' ? window.MessagePort : null;
  const nativePortPostMessage =
    NativeMessagePort && NativeMessagePort.prototype && typeof NativeMessagePort.prototype.postMessage === 'function'
      ? NativeMessagePort.prototype.postMessage
      : null;
  const portOnMessageDesc =
    NativeMessagePort && NativeMessagePort.prototype
      ? Object.getOwnPropertyDescriptor(NativeMessagePort.prototype, 'onmessage')
      : null;
  const nativePortClose =
    NativeMessagePort &&
    NativeMessagePort.prototype &&
    typeof NativeMessagePort.prototype.close === 'function'
      ? NativeMessagePort.prototype.close
      : null;
  const nativeDateNow = typeof Date === 'function' && typeof Date.now === 'function' ? Date.now : null;
  const nativeRAF =
    typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame.bind(window) : null;
  const nativeCAF =
    typeof window.cancelAnimationFrame === 'function' ? window.cancelAnimationFrame.bind(window) : null;
  const nativePostMessage = window.postMessage.bind(window);
  const nativeAddEventListener = EventTarget.prototype.addEventListener;
  const nativeRemoveEventListener = EventTarget.prototype.removeEventListener;
  const nativeDispatchEvent = EventTarget.prototype.dispatchEvent;
  const nativePreventDefault =
    NativeEvent && NativeEvent.prototype && typeof NativeEvent.prototype.preventDefault === 'function'
      ? NativeEvent.prototype.preventDefault
      : null;
  const nativeStopImmediatePropagation =
    NativeEvent && NativeEvent.prototype && typeof NativeEvent.prototype.stopImmediatePropagation === 'function'
      ? NativeEvent.prototype.stopImmediatePropagation
      : null;
  const nativeComposedPath =
    NativeEvent && NativeEvent.prototype && typeof NativeEvent.prototype.composedPath === 'function'
      ? NativeEvent.prototype.composedPath
      : null;
  const eventTargetDesc =
    NativeEvent && NativeEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeEvent.prototype, 'target')
      : null;
  const clipboardDataDesc =
    NativeClipboardEvent && NativeClipboardEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeClipboardEvent.prototype, 'clipboardData')
      : null;
  const dragDataTransferDesc =
    NativeDragEvent && NativeDragEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeDragEvent.prototype, 'dataTransfer')
      : null;
  const msgSourceDesc =
    NativeMessageEvent && NativeMessageEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeMessageEvent.prototype, 'source')
      : null;
  const msgOriginDesc =
    NativeMessageEvent && NativeMessageEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeMessageEvent.prototype, 'origin')
      : null;
  const msgDataDesc =
    NativeMessageEvent && NativeMessageEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeMessageEvent.prototype, 'data')
      : null;
  const msgPortsDesc =
    NativeMessageEvent && NativeMessageEvent.prototype
      ? Object.getOwnPropertyDescriptor(NativeMessageEvent.prototype, 'ports')
      : null;
  const dtItemsDesc =
    NativeDataTransfer && NativeDataTransfer.prototype
      ? Object.getOwnPropertyDescriptor(NativeDataTransfer.prototype, 'items')
      : null;
  const dtFilesDesc =
    NativeDataTransfer && NativeDataTransfer.prototype
      ? Object.getOwnPropertyDescriptor(NativeDataTransfer.prototype, 'files')
      : null;
  const dtTypesDesc =
    NativeDataTransfer && NativeDataTransfer.prototype
      ? Object.getOwnPropertyDescriptor(NativeDataTransfer.prototype, 'types')
      : null;
  const dtGetData =
    NativeDataTransfer && NativeDataTransfer.prototype && typeof NativeDataTransfer.prototype.getData === 'function'
      ? NativeDataTransfer.prototype.getData
      : null;
  const dtSetData =
    NativeDataTransfer && NativeDataTransfer.prototype && typeof NativeDataTransfer.prototype.setData === 'function'
      ? NativeDataTransfer.prototype.setData
      : null;
  const dtItemsAdd =
    typeof DataTransferItemList === 'function' && DataTransferItemList.prototype && typeof DataTransferItemList.prototype.add === 'function'
      ? DataTransferItemList.prototype.add
      : null;
  const dtiKindDesc =
    typeof DataTransferItem === 'function' && DataTransferItem.prototype
      ? Object.getOwnPropertyDescriptor(DataTransferItem.prototype, 'kind')
      : null;
  const dtiTypeDesc =
    typeof DataTransferItem === 'function' && DataTransferItem.prototype
      ? Object.getOwnPropertyDescriptor(DataTransferItem.prototype, 'type')
      : null;
  const dtiGetAsFile =
    typeof DataTransferItem === 'function' && DataTransferItem.prototype && typeof DataTransferItem.prototype.getAsFile === 'function'
      ? DataTransferItem.prototype.getAsFile
      : null;
  const nativeAttachShadow =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.attachShadow === 'function'
      ? Element.prototype.attachShadow
      : null;
  const nativeSetTimeout = window.setTimeout.bind(window);
  const nativeClearTimeout = window.clearTimeout.bind(window);
  const nativeJsonParse = JSON.parse;
  const nativeJsonStringify = JSON.stringify;
  const nativeStorageGetItem =
    typeof Storage === 'function' && Storage.prototype && typeof Storage.prototype.getItem === 'function'
      ? Storage.prototype.getItem
      : null;
  const nativeStorageSetItem =
    typeof Storage === 'function' && Storage.prototype && typeof Storage.prototype.setItem === 'function'
      ? Storage.prototype.setItem
      : null;
  const nativeStorageRemoveItem =
    typeof Storage === 'function' && Storage.prototype && typeof Storage.prototype.removeItem === 'function'
      ? Storage.prototype.removeItem
      : null;
  const nativeClipboardWriteText =
    typeof navigator === 'object' &&
    navigator &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
      ? navigator.clipboard.writeText.bind(navigator.clipboard)
      : null;
  const nativeInputClick =
    NativeHTMLInputElement &&
    NativeHTMLInputElement.prototype &&
    typeof NativeHTMLInputElement.prototype.click === 'function'
      ? NativeHTMLInputElement.prototype.click
      : null;
  const nativeInputShowPicker =
    NativeHTMLInputElement &&
    NativeHTMLInputElement.prototype &&
    typeof NativeHTMLInputElement.prototype.showPicker === 'function'
      ? NativeHTMLInputElement.prototype.showPicker
      : null;
  const nativeCrypto = window.crypto;
  const getRandomValues =
    nativeCrypto && typeof nativeCrypto.getRandomValues === 'function'
      ? nativeCrypto.getRandomValues.bind(nativeCrypto)
      : null;
  const readBlobArrayBuffer =
    window.Blob && window.Blob.prototype && typeof window.Blob.prototype.arrayBuffer === 'function'
      ? window.Blob.prototype.arrayBuffer
      : null;
  const canvasToBlob =
    NativeHTMLCanvasElement &&
    NativeHTMLCanvasElement.prototype &&
    typeof NativeHTMLCanvasElement.prototype.toBlob === 'function'
      ? NativeHTMLCanvasElement.prototype.toBlob
      : null;
  const nativeCanvasGetContext =
    NativeHTMLCanvasElement &&
    NativeHTMLCanvasElement.prototype &&
    typeof NativeHTMLCanvasElement.prototype.getContext === 'function'
      ? NativeHTMLCanvasElement.prototype.getContext
      : null;
  const ctxProto =
    typeof CanvasRenderingContext2D === 'function' && CanvasRenderingContext2D.prototype
      ? CanvasRenderingContext2D.prototype
      : null;
  const nativeCtxDrawImage = ctxProto && typeof ctxProto.drawImage === 'function' ? ctxProto.drawImage : null;
  const nativeCtxFillRect = ctxProto && typeof ctxProto.fillRect === 'function' ? ctxProto.fillRect : null;
  const nativeCtxStrokeRect = ctxProto && typeof ctxProto.strokeRect === 'function' ? ctxProto.strokeRect : null;
  const nativeCtxBeginPath = ctxProto && typeof ctxProto.beginPath === 'function' ? ctxProto.beginPath : null;
  const nativeCtxMoveTo = ctxProto && typeof ctxProto.moveTo === 'function' ? ctxProto.moveTo : null;
  const nativeCtxLineTo = ctxProto && typeof ctxProto.lineTo === 'function' ? ctxProto.lineTo : null;
  const nativeCtxQuadraticCurveTo =
    ctxProto && typeof ctxProto.quadraticCurveTo === 'function' ? ctxProto.quadraticCurveTo : null;
  const nativeCtxStroke = ctxProto && typeof ctxProto.stroke === 'function' ? ctxProto.stroke : null;
  const nativeCtxSave = ctxProto && typeof ctxProto.save === 'function' ? ctxProto.save : null;
  const nativeCtxRestore = ctxProto && typeof ctxProto.restore === 'function' ? ctxProto.restore : null;
  const nativeCtxRect = ctxProto && typeof ctxProto.rect === 'function' ? ctxProto.rect : null;
  const nativeCtxClip = ctxProto && typeof ctxProto.clip === 'function' ? ctxProto.clip : null;
  const nativeCtxGetImageData =
    ctxProto && typeof ctxProto.getImageData === 'function' ? ctxProto.getImageData : null;
  const nativeBlobSlice =
    window.Blob && window.Blob.prototype && typeof window.Blob.prototype.slice === 'function'
      ? window.Blob.prototype.slice
      : null;
  const nativeAppendChild =
    typeof Node === 'function' && Node.prototype && typeof Node.prototype.appendChild === 'function'
      ? Node.prototype.appendChild
      : null;
  const nativeRemoveChild =
    typeof Node === 'function' && Node.prototype && typeof Node.prototype.removeChild === 'function'
      ? Node.prototype.removeChild
      : null;
  const nativeElementRemove =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.remove === 'function'
      ? Element.prototype.remove
      : null;
  const nativeGetBoundingClientRect =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.getBoundingClientRect === 'function'
      ? Element.prototype.getBoundingClientRect
      : null;
  const nativeSetPointerCapture =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.setPointerCapture === 'function'
      ? Element.prototype.setPointerCapture
      : null;
  const nativeReleasePointerCapture =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.releasePointerCapture === 'function'
      ? Element.prototype.releasePointerCapture
      : null;
  const nativeHasPointerCapture =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.hasPointerCapture === 'function'
      ? Element.prototype.hasPointerCapture
      : null;
  const nativeSetAttribute =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.setAttribute === 'function'
      ? Element.prototype.setAttribute
      : null;
  const nativeGetAttribute =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.getAttribute === 'function'
      ? Element.prototype.getAttribute
      : null;
  const nativeRemoveAttribute =
    typeof Element === 'function' && Element.prototype && typeof Element.prototype.removeAttribute === 'function'
      ? Element.prototype.removeAttribute
      : null;
  const nativeGetElementsByTagName =
    typeof Document === 'function' && Document.prototype && typeof Document.prototype.getElementsByTagName === 'function'
      ? Document.prototype.getElementsByTagName
      : null;
  const nativeElementFromPoint =
    typeof Document === 'function' && Document.prototype && typeof Document.prototype.elementFromPoint === 'function'
      ? Document.prototype.elementFromPoint
      : null;
  const nativeImgSrcDesc =
    NativeImage && typeof HTMLImageElement === 'function' && HTMLImageElement.prototype
      ? Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
      : null;
  const nativeCreateElement =
    typeof Document === 'function' && Document.prototype && typeof Document.prototype.createElement === 'function'
      ? Document.prototype.createElement
      : null;
  const nativeCreateElementNS =
    typeof Document === 'function' && Document.prototype && typeof Document.prototype.createElementNS === 'function'
      ? Document.prototype.createElementNS
      : null;
  const nativeTextContentDesc =
    typeof Node === 'function' && Node.prototype
      ? Object.getOwnPropertyDescriptor(Node.prototype, 'textContent')
      : null;
  const nativeTextDecode =
    TextDecoderCtor && TextDecoderCtor.prototype && typeof TextDecoderCtor.prototype.decode === 'function'
      ? TextDecoderCtor.prototype.decode
      : null;
  const nativeTextEncode =
    TextEncoderCtor && TextEncoderCtor.prototype && typeof TextEncoderCtor.prototype.encode === 'function'
      ? TextEncoderCtor.prototype.encode
      : null;
  const nativeDomParse =
    NativeDOMParser && NativeDOMParser.prototype && typeof NativeDOMParser.prototype.parseFromString === 'function'
      ? NativeDOMParser.prototype.parseFromString
      : null;
  const nativeXmlSerialize =
    NativeXMLSerializer && NativeXMLSerializer.prototype && typeof NativeXMLSerializer.prototype.serializeToString === 'function'
      ? NativeXMLSerializer.prototype.serializeToString
      : null;
  const nativePromiseThen =
    typeof Promise === 'function' && Promise.prototype && typeof Promise.prototype.then === 'function'
      ? Promise.prototype.then
      : null;
  const nativeWeakSetHas =
    NativeWeakSet && NativeWeakSet.prototype && typeof NativeWeakSet.prototype.has === 'function'
      ? NativeWeakSet.prototype.has
      : null;
  const nativeWeakSetAdd =
    NativeWeakSet && NativeWeakSet.prototype && typeof NativeWeakSet.prototype.add === 'function'
      ? NativeWeakSet.prototype.add
      : null;
  const nativeWeakSetDelete =
    NativeWeakSet && NativeWeakSet.prototype && typeof NativeWeakSet.prototype.delete === 'function'
      ? NativeWeakSet.prototype.delete
      : null;
  const nativeMapGet =
    NativeMap && NativeMap.prototype && typeof NativeMap.prototype.get === 'function'
      ? NativeMap.prototype.get
      : null;
  const nativeMapSet =
    NativeMap && NativeMap.prototype && typeof NativeMap.prototype.set === 'function'
      ? NativeMap.prototype.set
      : null;
  const nativeMapHas =
    NativeMap && NativeMap.prototype && typeof NativeMap.prototype.has === 'function'
      ? NativeMap.prototype.has
      : null;
  const nativeMapDelete =
    NativeMap && NativeMap.prototype && typeof NativeMap.prototype.delete === 'function'
      ? NativeMap.prototype.delete
      : null;
  const nativeMapKeys =
    NativeMap && NativeMap.prototype && typeof NativeMap.prototype.keys === 'function'
      ? NativeMap.prototype.keys
      : null;
  const nativeMapClear =
    NativeMap && NativeMap.prototype && typeof NativeMap.prototype.clear === 'function'
      ? NativeMap.prototype.clear
      : null;
  const nativeMapSizeDesc =
    NativeMap && NativeMap.prototype
      ? Object.getOwnPropertyDescriptor(NativeMap.prototype, 'size')
      : null;
  const nativeMapIterNext = (() => {
    try {
      const it = nativeMapKeys ? nativeMapKeys.call(new NativeMap()) : null;
      const proto = it ? Object.getPrototypeOf(it) : null;
      return proto && typeof proto.next === 'function' ? proto.next : null;
    } catch {
      return null;
    }
  })();
  const nativeSetAdd =
    NativeSet && NativeSet.prototype && typeof NativeSet.prototype.add === 'function'
      ? NativeSet.prototype.add
      : null;
  const nativeSetHas =
    NativeSet && NativeSet.prototype && typeof NativeSet.prototype.has === 'function'
      ? NativeSet.prototype.has
      : null;
  const nativeSetDelete =
    NativeSet && NativeSet.prototype && typeof NativeSet.prototype.delete === 'function'
      ? NativeSet.prototype.delete
      : null;
  const nativeSetValues =
    NativeSet && NativeSet.prototype && typeof NativeSet.prototype.values === 'function'
      ? NativeSet.prototype.values
      : null;
  const nativeSetClear =
    NativeSet && NativeSet.prototype && typeof NativeSet.prototype.clear === 'function'
      ? NativeSet.prototype.clear
      : null;
  const nativeSetSizeDesc =
    NativeSet && NativeSet.prototype
      ? Object.getOwnPropertyDescriptor(NativeSet.prototype, 'size')
      : null;
  const nativeSetIterNext = (() => {
    try {
      const it = nativeSetValues ? nativeSetValues.call(new NativeSet()) : null;
      const proto = it ? Object.getPrototypeOf(it) : null;
      return proto && typeof proto.next === 'function' ? proto.next : null;
    } catch {
      return null;
    }
  })();
  const nativeRegExpExec =
    NativeRegExp && NativeRegExp.prototype && typeof NativeRegExp.prototype.exec === 'function'
      ? NativeRegExp.prototype.exec
      : null;
  const nativeArrayPush = Array.prototype.push;
  const nativeArrayPop = Array.prototype.pop;
  const nativeArraySplice = Array.prototype.splice;
  const nativeArrayFilter = Array.prototype.filter;
  const nativeArraySome = Array.prototype.some;
  const nativeArrayIncludes = Array.prototype.includes;
  const nativeArrayReduce = Array.prototype.reduce;
  const nativeArrayMap = Array.prototype.map;
  const nativePointerPrimaryDesc =
    typeof PointerEvent === 'function' && PointerEvent.prototype
      ? Object.getOwnPropertyDescriptor(PointerEvent.prototype, 'isPrimary')
      : null;
  const nativePointerTypeDesc =
    typeof PointerEvent === 'function' && PointerEvent.prototype
      ? Object.getOwnPropertyDescriptor(PointerEvent.prototype, 'pointerType')
      : null;
  const nativePointerIdDesc =
    typeof PointerEvent === 'function' && PointerEvent.prototype
      ? Object.getOwnPropertyDescriptor(PointerEvent.prototype, 'pointerId')
      : null;
  const nativeMouseBtnDesc =
    typeof MouseEvent === 'function' && MouseEvent.prototype
      ? Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'button')
      : null;
  const nativeClientXDesc =
    typeof MouseEvent === 'function' && MouseEvent.prototype
      ? Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'clientX')
      : null;
  const nativeClientYDesc =
    typeof MouseEvent === 'function' && MouseEvent.prototype
      ? Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'clientY')
      : null;
  const nativeDetailDesc =
    typeof UIEvent === 'function' && UIEvent.prototype
      ? Object.getOwnPropertyDescriptor(UIEvent.prototype, 'detail')
      : null;
  const nativeKeyDesc =
    typeof KeyboardEvent === 'function' && KeyboardEvent.prototype
      ? Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key')
      : null;
  const nativeAbortMethod =
    NativeAbortController && NativeAbortController.prototype && typeof NativeAbortController.prototype.abort === 'function'
      ? NativeAbortController.prototype.abort
      : null;
  const createObjectURL =
    NativeURL && typeof NativeURL.createObjectURL === 'function'
      ? NativeURL.createObjectURL.bind(NativeURL)
      : null;
  const revokeObjectURL =
    NativeURL && typeof NativeURL.revokeObjectURL === 'function'
      ? NativeURL.revokeObjectURL.bind(NativeURL)
      : null;

  if (typeof NativeDataTransfer !== 'function' || typeof NativeFile !== 'function') {
    return;
  }

  const inputFilesDescriptor = NativeHTMLInputElement
    ? Object.getOwnPropertyDescriptor(NativeHTMLInputElement.prototype, 'files')
    : null;
  const getInputFiles =
    inputFilesDescriptor && typeof inputFilesDescriptor.get === 'function'
      ? (input) => inputFilesDescriptor.get.call(input)
      : (input) => input.files;
  const setInputFiles =
    inputFilesDescriptor && typeof inputFilesDescriptor.set === 'function'
      ? (input, fileList) => inputFilesDescriptor.set.call(input, fileList)
      : (input, fileList) => {
          input.files = fileList;
        };
  const inputTypeDescriptor = NativeHTMLInputElement
    ? Object.getOwnPropertyDescriptor(NativeHTMLInputElement.prototype, 'type')
    : null;
  const getInputType =
    inputTypeDescriptor && typeof inputTypeDescriptor.get === 'function'
      ? (input) => inputTypeDescriptor.get.call(input)
      : (input) => input.type;

  const textAreaValueDescriptor = NativeHTMLTextAreaElement
    ? Object.getOwnPropertyDescriptor(NativeHTMLTextAreaElement.prototype, 'value')
    : null;
  const inputValueDescriptor = NativeHTMLInputElement
    ? Object.getOwnPropertyDescriptor(NativeHTMLInputElement.prototype, 'value')
    : null;

  function wsHas(ws, item) {
    return nativeWeakSetHas ? nativeWeakSetHas.call(ws, item) : ws.has(item);
  }
  function wsAdd(ws, item) {
    return nativeWeakSetAdd ? nativeWeakSetAdd.call(ws, item) : ws.add(item);
  }
  function wsDelete(ws, item) {
    return nativeWeakSetDelete ? nativeWeakSetDelete.call(ws, item) : ws.delete(item);
  }
  function mapGet(m, key) {
    return nativeMapGet ? nativeMapGet.call(m, key) : m.get(key);
  }
  function mapSet(m, key, val) {
    return nativeMapSet ? nativeMapSet.call(m, key, val) : m.set(key, val);
  }
  function mapHas(m, key) {
    return nativeMapHas ? nativeMapHas.call(m, key) : m.has(key);
  }
  function mapDelete(m, key) {
    return nativeMapDelete ? nativeMapDelete.call(m, key) : m.delete(key);
  }
  function mapOldestKey(m) {
    const it = nativeMapKeys ? nativeMapKeys.call(m) : m.keys();
    const step = nativeMapIterNext ? nativeMapIterNext.call(it) : it.next();
    return step && !step.done ? step.value : undefined;
  }
  function mapClear(m) {
    return nativeMapClear ? nativeMapClear.call(m) : m.clear();
  }
  function mapSize(m) {
    return nativeMapSizeDesc && typeof nativeMapSizeDesc.get === 'function'
      ? nativeMapSizeDesc.get.call(m)
      : m.size;
  }
  function setAdd(s, val) {
    return nativeSetAdd ? nativeSetAdd.call(s, val) : s.add(val);
  }
  function setHas(s, val) {
    return nativeSetHas ? nativeSetHas.call(s, val) : s.has(val);
  }
  function setDelete(s, val) {
    return nativeSetDelete ? nativeSetDelete.call(s, val) : s.delete(val);
  }
  function setOldestValue(s) {
    const it = nativeSetValues ? nativeSetValues.call(s) : s.values();
    const step = nativeSetIterNext ? nativeSetIterNext.call(it) : it.next();
    return step && !step.done ? step.value : undefined;
  }
  function setClear(s) {
    return nativeSetClear ? nativeSetClear.call(s) : s.clear();
  }
  function setToArray(s) {
    if (!nativeSetValues || !nativeSetIterNext) {
      return Array.from(s);
    }
    const out = [];
    const it = nativeSetValues.call(s);
    while (true) {
      const step = nativeSetIterNext.call(it);
      if (!step || step.done) break;
      nativeArrayPush.call(out, step.value);
    }
    return out;
  }
  function setSize(s) {
    return nativeSetSizeDesc && typeof nativeSetSizeDesc.get === 'function'
      ? nativeSetSizeDesc.get.call(s)
      : s.size;
  }
  function safePreventDefault(ev) {
    if (nativePreventDefault) {
      nativePreventDefault.call(ev);
    } else if (ev && typeof ev.preventDefault === 'function') {
      ev.preventDefault();
    }
  }
  function safeStopImmediatePropagation(ev) {
    try {
      if (nativeStopImmediatePropagation) {
        nativeStopImmediatePropagation.call(ev);
      } else if (ev && typeof ev.stopImmediatePropagation === 'function') {
        ev.stopImmediatePropagation();
      }
    } catch {
      // Ignore non-cancellable errors cleanly.
    }
  }
  function haltEvent(ev) {
    safePreventDefault(ev);
    safeStopImmediatePropagation(ev);
  }
  function getEventPathTarget(ev) {
    if (!ev) return null;
    if (nativeComposedPath) {
      try {
        const p = nativeComposedPath.call(ev);
        if (p && p[0]) return p[0];
      } catch {
        // Fallback to native target getter below.
      }
    } else if (typeof ev.composedPath === 'function') {
      const p = ev.composedPath();
      if (p && p[0]) return p[0];
    }
    return eventTargetDesc && typeof eventTargetDesc.get === 'function'
      ? eventTargetDesc.get.call(ev)
      : ev.target;
  }
  function getClipboardData(ev) {
    return clipboardDataDesc && typeof clipboardDataDesc.get === 'function'
      ? clipboardDataDesc.get.call(ev)
      : ev.clipboardData;
  }
  function getDragDataTransfer(ev) {
    return dragDataTransferDesc && typeof dragDataTransferDesc.get === 'function'
      ? dragDataTransferDesc.get.call(ev)
      : ev.dataTransfer;
  }
  function safeDtGetData(dt, mime) {
    return dtGetData ? dtGetData.call(dt, mime) : dt.getData(mime);
  }
  function safeDtSetData(dt, mime, val) {
    return dtSetData ? dtSetData.call(dt, mime, val) : dt.setData(mime, val);
  }
  function safeDtItemsAdd(dt, file) {
    const list = dtItemsDesc && typeof dtItemsDesc.get === 'function' ? dtItemsDesc.get.call(dt) : dt.items;
    return dtItemsAdd ? dtItemsAdd.call(list, file) : list.add(file);
  }
  function safeDtFiles(dt) {
    return dtFilesDesc && typeof dtFilesDesc.get === 'function' ? dtFilesDesc.get.call(dt) : dt.files;
  }
  function appendChildSafe(parent, child) {
    return nativeAppendChild ? nativeAppendChild.call(parent, child) : parent.appendChild(child);
  }
  function removeChildSafe(parent, child) {
    return nativeRemoveChild ? nativeRemoveChild.call(parent, child) : parent.removeChild(child);
  }
  function removeNodeSafe(node) {
    if (!node) return;
    if (nativeElementRemove) {
      nativeElementRemove.call(node);
    } else if (typeof node.remove === 'function') {
      node.remove();
    }
  }
  function dispatchEventSafe(target, ev) {
    return nativeDispatchEvent ? nativeDispatchEvent.call(target, ev) : target.dispatchEvent(ev);
  }
  function setAttrSafe(el, name, val) {
    if (nativeSetAttribute) nativeSetAttribute.call(el, name, val);
    else el.setAttribute(name, val);
  }
  function getAttrSafe(el, name) {
    return nativeGetAttribute ? nativeGetAttribute.call(el, name) : el.getAttribute(name);
  }
  function removeAttrSafe(el, name) {
    if (nativeRemoveAttribute) nativeRemoveAttribute.call(el, name);
    else el.removeAttribute(name);
  }
  function postPortMessageSafe(port, msg) {
    return nativePortPostMessage ? nativePortPostMessage.call(port, msg) : port.postMessage(msg);
  }
  function setPortOnMessageSafe(port, fn) {
    if (portOnMessageDesc && typeof portOnMessageDesc.set === 'function') {
      portOnMessageDesc.set.call(port, fn);
    } else {
      port.onmessage = fn;
    }
  }
  function makeAbortControllerSafe() {
    return NativeAbortController ? new NativeAbortController() : null;
  }
  function abortSafe(ac) {
    if (!ac) return;
    if (nativeAbortMethod) nativeAbortMethod.call(ac);
    else ac.abort();
  }
  function getEvProp(desc, ev, key) {
    if (desc && typeof desc.get === 'function') {
      try {
        return desc.get.call(ev);
      } catch {
        // Fallback when event instance is not of the descriptor's exact interface.
      }
    }
    return ev[key];
  }
  function safeCreateElement(tag) {
    return nativeCreateElement ? nativeCreateElement.call(document, tag) : document.createElement(tag);
  }
  function safeCreateElementNS(ns, tag) {
    return nativeCreateElementNS
      ? nativeCreateElementNS.call(document, ns, tag)
      : document.createElementNS(ns, tag);
  }
  function setSafeText(node, val) {
    if (nativeTextContentDesc && typeof nativeTextContentDesc.set === 'function') {
      nativeTextContentDesc.set.call(node, val);
    } else {
      node.textContent = val;
    }
  }
  function getSafeText(node) {
    return nativeTextContentDesc && typeof nativeTextContentDesc.get === 'function'
      ? nativeTextContentDesc.get.call(node)
      : node.textContent;
  }

  const TO_MAIN = '__clipzero_to_main__';
  const TO_ISOLATED = '__clipzero_to_isolated__';
  const STORAGE_KEY = 'clipzero_site_prefs_v1';
  const STORAGE_SCHEMA_VERSION = 1;
  const LEGACY_STORAGE_KEYS = Object.freeze([
    'clipzero_site_prefs',
    'clipzero_site_prefs_v0',
  ]);
  const FILE_PREFIX = 'clip';
  const MAX_OPTIMIZE_EDGE = 2048;
  const MAX_PREVIEW_EDGE = 1400;
  const MAX_PREVIEW_CACHE_SLIDES = 2;
  const MAX_PEN_POINTS_PER_STROKE = 4000;
  const REDACT_COLORS = Object.freeze([
    Object.freeze({ hex: '#09090b', labelKey: 'redactColorBlack' }),
    Object.freeze({ hex: '#ffffff', labelKey: 'redactColorWhite' }),
    Object.freeze({ hex: '#ef4444', labelKey: 'redactColorRed' }),
    Object.freeze({ hex: '#2563eb', labelKey: 'redactColorBlue' }),
    Object.freeze({ hex: '#16a34a', labelKey: 'redactColorGreen' }),
    Object.freeze({ hex: '#eab308', labelKey: 'redactColorYellow' }),
  ]);
  const REDACT_COLOR_SET = new NativeSet(REDACT_COLORS.map((c) => c.hex));
  const REDACT_WEIGHTS = Object.freeze([
    Object.freeze({ id: 'sm', factor: 0.55, dotPx: 3, labelKey: 'redactWeightThin' }),
    Object.freeze({ id: 'md', factor: 1, dotPx: 5, labelKey: 'redactWeightMedium' }),
    Object.freeze({ id: 'lg', factor: 1.85, dotPx: 8, labelKey: 'redactWeightThick' }),
  ]);
  const REDACT_WEIGHT_MAP = Object.freeze({ sm: 0.55, md: 1, lg: 1.85 });
  const MAX_SVG_BYTES = 8 * 1024 * 1024;
  const MAX_PDF_BYTES = 50 * 1024 * 1024;
  const MAX_SECRET_SCAN_CHARS = 512 * 1024;
  const SOCIAL_MEDIA_HOSTS = new NativeSet([
    'facebook.com',
    'www.facebook.com',
    'm.facebook.com',
    'messenger.com',
    'www.messenger.com',
    'instagram.com',
    'www.instagram.com',
    'web.whatsapp.com',
    'web.telegram.org',
    'discord.com',
    'x.com',
    'twitter.com',
    'reddit.com',
    'www.reddit.com',
    'www.linkedin.com',
    'mail.google.com',
    'outlook.live.com',
    'outlook.office.com',
    'outlook.office365.com',
    'outlook.cloud.microsoft',
  ]);
  const isSocialMediaHost = setHas(
    SOCIAL_MEDIA_HOSTS,
    (window.location.hostname || '').toLowerCase()
  );
  // Privacy-safe diagnostics stay muted unless toggled in popup advanced settings.
  let sessionBridgeToken = null;
  let bridgePort = null;
  let hasIsolatedBridge = false;
  let isInstanceTornDown = false;
  let pingCounter = 0;
  let lastProactivePingAt = 0;
  let consecutivePingFailures = 0;
  let proactiveCheckInFlight = false;
  const pendingPings = [];
  let origClipboardProtoWriteTextDesc = null;
  let origNavigatorClipboardWriteTextDesc = null;
  let origInputClickDesc = null;
  let origInputShowPickerDesc = null;
  let clipboardProtoWrappedFn = null;
  let navClipboardWrappedFn = null;
  let inputClickWrappedFn = null;
  let inputShowPickerWrappedFn = null;
  const hookedFileInputsList = new NativeSet();
  const targetOrigin = window.location.origin;

  function getSafeStorage() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  const nativeStorage = getSafeStorage();

  const MIME_TO_EXT = Object.freeze({
    'image/png': 'png',
    'image/x-png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/pjpeg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/vnd.microsoft.icon': 'ico',
    'image/heic': 'heic',
    'image/heif': 'heif',
  });

  const PNG_SAFE_CHUNKS = new NativeSet([
    'IHDR',
    'PLTE',
    'IDAT',
    'IEND',
    'tRNS',
    'gAMA',
    'cHRM',
    'sRGB',
    'iCCP',
    'sBIT',
    'bKGD',
    'hIST',
    'pHYs',
    'acTL',
    'fcTL',
    'fdAT',
    'cICP',
    'mDCv',
    'cLLi',
  ]);

  const WEBP_SAFE_CHUNKS = new NativeSet([
    'VP8 ',
    'VP8L',
    'VP8X',
    'ICCP',
    'ALPH',
    'ANIM',
    'ANMF',
  ]);

  // Generic default names from browsers, clipboard, and localized OS tools.
  const GENERIC_IMAGE_NAME_RE =
    /^(?:image|img|blob|clipboard|grafik|imagen|imagem|immagine|afbeelding|obraz|bild|billede|kuva|screen\s*shot|captura(?:\s+de\s+(?:pantalla|tela))?|capture(?:\s+d['’]?[eé]cran)?|bildschirmfoto|schermata|sk[aä]rm(?:av)?bild|schermafbeelding|schermafdruk|zrzut\s+ekranu|snip|pasted[-_ ]?image|unnamed|untitled)(?:[\s_-]*\(?\d+\)?)?(?:\.[a-z0-9]+)?$/i;

  // OS-generated screenshot filenames containing local date/time (Windows/macOS/Linux/mobile/CN).
  const OS_DATED_SCREENSHOT_RE =
    /^(?:(?:screen\s*shot|captura(?:\s+de\s+(?:pantalla|tela)|\s+desde)?|bildschirmfoto|capture\s+d['’]?[eé]cran|schermata|sk[aä]rm(?:av)?bild|schermafbeelding|schermafdruk|zrzut\s+ekranu|сним(?:ок|ка)(?:\s+экрана)?|snipaste|flameshot|greenshot|sharex|cleanshot|ksnip|wechat|(?:微信|qq)?(?:截图|图片)|スクリーンショット|스크린샷)[\s_-]*(?:from\s+|de\s+|at\s+|um\s+|alle\s+|[àa]\s+)?(?:19|20)\d{2}[-_.\s]?(?:0[1-9]|1[0-2])[-_.\s]?(?:0[1-9]|[12]\d|3[01]).*|(?:img|pxl)[-_](?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[-_]?\d{4,6}.*|(?:19|20)\d{2}[-_.]?(?:0[1-9]|1[0-2])[-_.]?(?:0[1-9]|[12]\d|3[01])[\s_-]+\d{2}[-_.]?\d{2}(?:[-_.]?\d{2})?.*)$/i;

  const MAX_TRACKED_NAMES = 500;
  const PERSISTED_KEYS = [
    'enabled',
    'strictMode',
    'stripExif',
    'redactImage',
    'maskSecrets',
    'maskPii',
    'optimizeImage',
    'showToast',
    'debugLogs',
  ];
  const PERSISTED_KEY_SET = new NativeSet(PERSISTED_KEYS);
  const DEFAULT_STATE = Object.freeze({
    enabled: true,
    strictMode: false,
    stripExif: true,
    redactImage: false,
    maskSecrets: !isSocialMediaHost,
    maskPii: false,
    optimizeImage: false,
    showToast: true,
    saveSite: false,
    debugLogs: false,
    customWords: '',
  });
  const processedEvents = new NativeWeakSet();
  const processedFiles = new NativeWeakSet();
  const pendingAsyncInputs = new NativeWeakSet();
  const hookedFileInputs = new NativeWeakSet();
  const usedNames = new NativeSet();
  let sequence = 0;

  function markSyntheticEvent(event) {
    if (!event) {
      return;
    }
    wsAdd(processedEvents, event);
  }

  function isProcessedEvent(event) {
    if (!event) {
      return true;
    }
    return wsHas(processedEvents, event);
  }

  // RAM-only defaults unless user explicitly opts in to per-site persistence.
  const state = { ...DEFAULT_STATE };

  let shortcuts = {
    'toggle-enabled': 'Alt+Shift+P',
    'toggle-strict': 'Alt+Shift+S',
    'toggle-exif': 'Alt+Shift+E',
    'toggle-redact': 'Alt+Shift+B',
    'toggle-secrets': 'Alt+Shift+K',
    'toggle-toast': 'Alt+Shift+T',
    'toggle-save': 'Alt+Shift+G',
  };

  let i18n = {
    filesWord: 'files',
    hintPause: 'pause',
    hintAll: 'all',
    hintExif: 'metadata',
    hintRedact: 'redact',
    hintSecrets: 'secrets',
    activeTitle: 'ClipZero active',
    activeSub: 'Uploads will be anonymized',
    pausedTitle: 'ClipZero paused',
    pausedSub: 'Original filenames kept',
    strictOnTitle: 'Rename all · ON',
    strictOnSub: 'Custom names and documents will be renamed',
    strictOffTitle: 'Rename all · OFF',
    strictOffSub: 'Custom unique names and documents kept',
    exifOnTitle: 'Strip metadata · ON',
    exifOnSub: 'EXIF, GPS, and SVG metadata cleaner enabled',
    exifOffTitle: 'Strip metadata · OFF',
    exifOffSub: 'Instant zero-delay upload restored',
    redactOnTitle: 'Canvas redactor · ON',
    redactOnSub: 'Draw boxes to hide areas before upload',
    redactOffTitle: 'Canvas redactor · OFF',
    redactOffSub: 'Images upload directly without preview',
    secretsOnTitle: 'Secret guard · ON',
    secretsOnSub: 'API keys, tokens, and URLs masked on paste',
    secretsOffTitle: 'Secret guard · OFF',
    secretsOffSub: 'Pasted secrets left untouched',
    piiOnTitle: 'Contact & IP guard · ON',
    piiOnSub: 'Emails, phones, and IPs masked on paste',
    piiOffTitle: 'Contact & IP guard · OFF',
    piiOffSub: 'Contacts and IPs left untouched',
    debugOnTitle: 'Debug logs · ON',
    debugOnSub: 'Privacy-safe DevTools traces enabled',
    debugOffTitle: 'Debug logs · OFF',
    debugOffSub: 'Console traces muted',
    optimizeOnTitle: 'Limit 2048 px · ON',
    optimizeOnSub: 'Large images capped at 2048 px',
    optimizeOffTitle: 'Limit 2048 px · OFF',
    optimizeOffSub: 'Original resolution preserved',
    toastOnTitle: 'Notice · ON',
    toastOnSub: 'Upload confirmations enabled',
    toastOffTitle: 'Notice · OFF',
    toastOffSub: 'Silent mode',
    saveOnTitle: 'Saved for this site',
    saveOnSub: 'Settings stored on this domain only',
    saveOffTitle: 'Session only',
    saveOffSub: 'Saved site settings cleared',
    storageResetTitle: 'Site settings reset',
    storageResetSub: 'Corrupted or incompatible saved data was cleared',
    secretsMaskedTitle: 'Secrets masked',
    secretsMaskedSub: 'sensitive items replaced before paste',
    toastSecretsReviewBtn: 'Review',
    secretsModalTitle: 'Protected secrets',
    secretsModalSub: 'Pasted text stays masked. Uncheck items you want to allow, or paste the original once.',
    secretsShowBtn: 'Show',
    secretsHideBtn: 'Hide',
    secretsKeepBtn: 'Keep masked',
    secretsApplyBtn: 'Apply selection',
    secretsCopySelectedBtn: 'Copy selection',
    secretsPasteRawBtn: 'Paste original once',
    secretsCopyRawBtn: 'Copy original',
    secretsRestoredTitle: 'Original pasted',
    secretsRestoredSub: 'Secret guard stays enabled',
    secretsCopiedTitle: 'Original copied',
    tokensDetectedCopyTitle: 'Masked tokens copied',
    tokensDetectedCopySub: 'Restore original values to clipboard for this copy?',
    tokensRestoreClipBtn: 'Restore originals',
    tokensRestoredClipTitle: 'Originals restored to clipboard',
    toastUploadSecretsTag: 'Secrets masked',
    secretsChangedNotice: 'Edited block changed in chat; copy original manually if needed.',
    redactModalTitle: 'Redact before upload',
    redactModalHint: 'Drag or N/+ Box · Arrows move · Shift+Arrows resize · Del removes · Enter uploads',
    redactModalHintBatch: 'Drag or N/+ Box · Arrows/Shift resize · Del removes · PgUp/PgDn slides · Enter uploads',
    redactBtnAddBox: '+ Box',
    redactBtnPrev: 'Prev',
    redactBtnNext: 'Next',
    redactBtnSkip: 'Skip',
    redactBtnInclude: 'Include',
    redactSkippedTag: 'Skipped',
    redactBtnUndo: 'Undo',
    redactBtnClear: 'Clear',
    redactBtnCancel: 'Cancel',
    redactBtnSend: 'Upload',
    redactModeCover: 'Cover',
    redactModePixel: 'Pixelate',
    redactModeOutline: 'Outline',
    redactModePen: 'Pen',
    redactModeCrop: 'Crop',
    redactModeScroll: 'Scroll',
    redactWeightThin: 'Thin',
    redactWeightMedium: 'Medium',
    redactWeightThick: 'Thick',
    redactColorBlack: 'Black',
    redactColorWhite: 'White',
    redactColorRed: 'Red',
    redactColorBlue: 'Blue',
    redactColorGreen: 'Green',
    redactColorYellow: 'Yellow',
  };

  let shownUploadHint = false;
  let activeToastHost = null;
  let activeToastAbort = null;
  let toastHideTimer = null;
  let toastRemoveTimer = null;
  const enteredDragTargets = new NativeSet();
  let ephemeralSecretDraft = null;
  let pendingRawPasteBypass = null;
  const wrappedWriteTextFns = new NativeWeakSet();
  let isInternalClipboardWrite = false;
  const MAX_SESSION_VAULT_ENTRIES = 500;
  const MAX_SESSION_VAULT_CHARS = 1024 * 1024;
  const MAX_TYPE_ENTITIES_CACHE = 200;
  const sessionTokenToRaw = new NativeMap();
  const sessionTypeEntities = new NativeMap();
  let sessionVaultChars = 0;

  function sanitizeCustomWords(raw) {
    if (typeof raw !== 'string') {
      return '';
    }
    const parts = raw.slice(0, 500).split(/[,;\r\n]+/);
    const seen = new NativeSet();
    const clean = [];
    for (let i = 0; i < parts.length && clean.length < 50; i += 1) {
      const term = parts[i].trim().replace(/\s+/g, ' ');
      if (term.length < 2) {
        continue;
      }
      const key = term.toLowerCase();
      if (setHas(seen, key)) {
        continue;
      }
      setAdd(seen, key);
      nativeArrayPush.call(clean, term);
    }
    return clean.join(', ');
  }

  let storageResetOccurred = false;
  let storageResetNoticePending = false;
  let storageResetFallbackTimer = null;
  let storageResetDomListenerBound = false;

  function storageGet(key) {
    return nativeStorageGetItem
      ? nativeStorageGetItem.call(nativeStorage, key)
      : nativeStorage.getItem(key);
  }

  function storageSet(key, val) {
    if (nativeStorageSetItem) {
      nativeStorageSetItem.call(nativeStorage, key, val);
    } else {
      nativeStorage.setItem(key, val);
    }
  }

  function storageRemove(key) {
    if (nativeStorageRemoveItem) {
      nativeStorageRemoveItem.call(nativeStorage, key);
    } else {
      nativeStorage.removeItem(key);
    }
  }

  function createClosedShadowRoot(host) {
    return nativeAttachShadow
      ? nativeAttachShadow.call(host, { mode: 'closed' })
      : host.attachShadow({ mode: 'closed' });
  }

  /** Removes deprecated storage keys from prior versions if still present. */
  function purgeLegacyStorageKeys() {
    if (!nativeStorage) {
      return;
    }
    for (let i = 0; i < LEGACY_STORAGE_KEYS.length; i += 1) {
      try {
        storageRemove(LEGACY_STORAGE_KEYS[i]);
      } catch {
        // Ignore restricted storage removal failures cleanly.
      }
    }
  }

  /** Restores in-memory settings to safe default session values. */
  function resetStateToDefaults() {
    if (nativeObjAssign) {
      nativeObjAssign(state, DEFAULT_STATE);
    } else {
      Object.assign(state, DEFAULT_STATE);
    }
  }

  function clearStorageResetFallbackTimer() {
    if (storageResetFallbackTimer !== null) {
      nativeClearTimeout(storageResetFallbackTimer);
      storageResetFallbackTimer = null;
    }
  }

  /** Displays a one-time notice when corrupt or incompatible site settings were purged. */
  function flushStorageResetNotice() {
    clearStorageResetFallbackTimer();
    if (!storageResetNoticePending) {
      return;
    }
    if (!document.body && document.readyState === 'loading') {
      if (!storageResetDomListenerBound) {
        storageResetDomListenerBound = true;
        nativeAddEventListener.call(
          document,
          'DOMContentLoaded',
          () => {
            storageResetDomListenerBound = false;
            flushStorageResetNotice();
          },
          { once: true }
        );
      }
      return;
    }
    storageResetNoticePending = false;
    showToastNotice(i18n.storageResetTitle, i18n.storageResetSub, 3200);
  }

  /** Purges corrupt/incompatible storage, resets state, and schedules user feedback. */
  function markStorageResetCorrupt() {
    resetStateToDefaults();
    if (nativeStorage) {
      try {
        storageRemove(STORAGE_KEY);
      } catch {
        // Ignore restricted storage removal failures cleanly.
      }
    }
    storageResetOccurred = true;
    storageResetNoticePending = true;
    clearStorageResetFallbackTimer();
    storageResetFallbackTimer = nativeSetTimeout(flushStorageResetNotice, 120);
  }

  function pickPersistedState() {
    const out = {};
    for (let i = 0; i < PERSISTED_KEYS.length; i += 1) {
      const k = PERSISTED_KEYS[i];
      out[k] = Boolean(state[k]);
    }
    out.customWords = sanitizeCustomWords(state.customWords);
    return out;
  }

  function syncStoredState() {
    if (!nativeStorage) {
      return;
    }
    try {
      purgeLegacyStorageKeys();
      if (!state.saveSite) {
        storageRemove(STORAGE_KEY);
        return;
      }
      storageSet(
        STORAGE_KEY,
        nativeJsonStringify({ _v: STORAGE_SCHEMA_VERSION, ...pickPersistedState() })
      );
    } catch {
      // Fail safely if storage quota is exceeded or blocked.
    }
  }

  function loadStoredState() {
    if (!nativeStorage) {
      return;
    }
    let raw = null;
    try {
      purgeLegacyStorageKeys();
      raw = storageGet(STORAGE_KEY);
    } catch {
      // Ignore restricted storage access without flagging corruption.
      return;
    }
    if (raw === null) {
      return;
    }
    try {
      const parsed = nativeJsonParse(raw);
      if (!parsed || typeof parsed !== 'object' || nativeIsArray(parsed)) {
        markStorageResetCorrupt();
        return;
      }

      const hasVersion = nativeHasOwn(parsed, '_v');
      if (
        hasVersion &&
        (typeof parsed._v !== 'number' ||
          !Number.isInteger(parsed._v) ||
          parsed._v < 1 ||
          parsed._v > STORAGE_SCHEMA_VERSION)
      ) {
        markStorageResetCorrupt();
        return;
      }

      let validCount = 0;
      let hasCorruptValue = false;
      const nextValues = {};
      for (let i = 0; i < PERSISTED_KEYS.length; i += 1) {
        const key = PERSISTED_KEYS[i];
        if (!nativeHasOwn(parsed, key)) {
          continue;
        }
        if (typeof parsed[key] === 'boolean') {
          nextValues[key] = parsed[key];
          validCount += 1;
        } else {
          hasCorruptValue = true;
        }
      }

      if (nativeHasOwn(parsed, 'customWords')) {
        if (typeof parsed.customWords === 'string') {
          nextValues.customWords = sanitizeCustomWords(parsed.customWords);
        } else {
          hasCorruptValue = true;
        }
      }

      if (hasCorruptValue || validCount === 0) {
        markStorageResetCorrupt();
        return;
      }

      const keys = nativeObjKeys ? nativeObjKeys(parsed) : Object.keys(parsed);
      let hasUnknownKeys = false;
      for (let i = 0; i < keys.length; i += 1) {
        const k = keys[i];
        if (k !== '_v' && k !== 'customWords' && !setHas(PERSISTED_KEY_SET, k)) {
          hasUnknownKeys = true;
          break;
        }
      }

      const hasCustomWords = nativeHasOwn(parsed, 'customWords');
      if (nativeObjAssign) {
        nativeObjAssign(state, nextValues);
      } else {
        Object.assign(state, nextValues);
      }
      state.saveSite = true;

      if (
        !hasVersion ||
        parsed._v !== STORAGE_SCHEMA_VERSION ||
        validCount < PERSISTED_KEYS.length ||
        !hasCustomWords ||
        hasUnknownKeys
      ) {
        syncStoredState();
      }
    } catch {
      markStorageResetCorrupt();
    }
  }

  function snapshotState() {
    const snap = pickPersistedState();
    snap.saveSite = Boolean(state.saveSite);
    snap.storageReset = Boolean(storageResetOccurred);
    return snap;
  }

  if (injectedAtDocumentStart) {
    loadStoredState();
  }

  function formatShortcutHint() {
    const p = shortcuts['toggle-enabled'] || 'Alt+Shift+P';
    const s = shortcuts['toggle-strict'] || 'Alt+Shift+S';
    const e = shortcuts['toggle-exif'] || 'Alt+Shift+E';
    const b = shortcuts['toggle-redact'] || 'Alt+Shift+B';
    const k = shortcuts['toggle-secrets'] || 'Alt+Shift+K';
    return `${p} ${i18n.hintPause} · ${s} ${i18n.hintAll} · ${e} ${i18n.hintExif} · ${b} ${i18n.hintRedact} · ${k} ${i18n.hintSecrets}`;
  }

  function clearToastTimers() {
    if (toastHideTimer !== null) {
      nativeClearTimeout(toastHideTimer);
      toastHideTimer = null;
    }
    if (toastRemoveTimer !== null) {
      nativeClearTimeout(toastRemoveTimer);
      toastRemoveTimer = null;
    }
  }

  function removeActiveToast() {
    clearToastTimers();
    if (activeToastAbort) {
      abortSafe(activeToastAbort);
      activeToastAbort = null;
    }
    if (activeToastHost) {
      removeNodeSafe(activeToastHost);
      activeToastHost = null;
    }
  }

  // Build toast purely with DOM methods & inline styles (safe under Trusted Types & strict CSP).
  function showToastNotice(titleText, subtitleText, durationMs, actionSpec) {
    const mountTarget = document.body || document.documentElement;
    if (!mountTarget) {
      return;
    }

    removeActiveToast();

    try {
      const host = safeCreateElement('div');
      host.style.position = 'fixed';
      host.style.right = '18px';
      host.style.bottom = '18px';
      host.style.zIndex = '2147483647';
      host.style.pointerEvents = 'none';
      host.style.margin = '0';
      host.style.padding = '0';
      host.style.border = '0';
      host.style.background = 'transparent';

      const palette = getModalPalette();
      const accentHover = palette.isDark ? '#2896ff' : '#0250bb';
      const shadow = createClosedShadowRoot(host);
      const resetStyle = safeCreateElement('style');
      setSafeText(
        resetStyle,
        `:host{all:initial;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;} *,*::before,*::after{box-sizing:border-box;} button.cz-toast-btn:hover{background:${accentHover}!important;} button.cz-toast-btn:focus-visible{outline:2px solid ${palette.accent};outline-offset:2px;}`
      );
      appendChildSafe(shadow, resetStyle);
      const hasAction = Boolean(actionSpec && actionSpec.label && typeof actionSpec.onAction === 'function');
      const ac = makeAbortControllerSafe();
      activeToastAbort = ac;

      const card = safeCreateElement('div');
      card.style.display = 'flex';
      card.style.flexDirection = 'row';
      card.style.alignItems = 'center';
      card.style.justifyContent = 'space-between';
      card.style.gap = '14px';
      card.style.maxWidth = '400px';
      card.style.padding = '10px 14px';
      card.style.borderRadius = '10px';
      card.style.background = palette.isDark ? '#2b2a33' : '#ffffff';
      card.style.border = `1px solid ${palette.border}`;
      card.style.boxShadow = palette.isDark
        ? '0 8px 24px rgba(0, 0, 0, 0.45)'
        : '0 6px 20px rgba(21, 20, 26, 0.12), 0 1px 3px rgba(21, 20, 26, 0.06)';
      card.style.color = palette.text;
      card.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      card.style.fontSize = '12.5px';
      card.style.lineHeight = '1.35';
      card.style.pointerEvents = hasAction ? 'auto' : 'none';
      const reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
      card.style.opacity = reducedMotion ? '1' : '0';
      card.style.transform = reducedMotion ? 'translateY(0)' : 'translateY(6px)';
      card.style.transition = reducedMotion ? 'none' : 'opacity 140ms ease, transform 140ms ease';

      const textCol = safeCreateElement('div');
      textCol.style.display = 'flex';
      textCol.style.flexDirection = 'column';
      textCol.style.gap = '2px';
      textCol.style.flex = '1';
      textCol.style.minWidth = '0';

      const titleRow = safeCreateElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '7px';

      const dot = safeCreateElement('span');
      dot.style.width = '7px';
      dot.style.height = '7px';
      dot.style.borderRadius = '50%';
      dot.style.flexShrink = '0';
      dot.style.background = state.enabled ? (palette.isDark ? '#30e60b' : '#12bc00') : '#8f8f9d';

      const title = safeCreateElement('span');
      title.style.fontWeight = '600';
      title.style.color = palette.text;
      title.style.wordBreak = 'break-word';
      setSafeText(title, titleText);

      appendChildSafe(titleRow, dot);
      appendChildSafe(titleRow, title);
      appendChildSafe(textCol, titleRow);

      if (subtitleText) {
        const sub = safeCreateElement('div');
        sub.style.color = palette.muted;
        sub.style.fontSize = '11.5px';
        sub.style.lineHeight = '1.35';
        sub.style.paddingLeft = '14px';
        setSafeText(sub, subtitleText);
        appendChildSafe(textCol, sub);
      }

      appendChildSafe(card, textCol);

      if (hasAction) {
        const actionBtn = safeCreateElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'cz-toast-btn';
        setSafeText(actionBtn, actionSpec.label);
        actionBtn.style.appearance = 'none';
        actionBtn.style.border = '1px solid transparent';
        actionBtn.style.background = palette.accent;
        actionBtn.style.color = palette.accentText;
        actionBtn.style.borderRadius = '6px';
        actionBtn.style.padding = '5px 12px';
        actionBtn.style.font = 'inherit';
        actionBtn.style.fontSize = '12px';
        actionBtn.style.fontWeight = '600';
        actionBtn.style.lineHeight = '1.2';
        actionBtn.style.whiteSpace = 'nowrap';
        actionBtn.style.cursor = 'pointer';
        actionBtn.style.flexShrink = '0';
        nativeAddEventListener.call(
          actionBtn,
          'click',
          (ev) => {
            haltEvent(ev);
            removeActiveToast();
            actionSpec.onAction();
          },
          ac ? { signal: ac.signal } : false
        );
        appendChildSafe(card, actionBtn);
      }

      appendChildSafe(shadow, card);
      appendChildSafe(mountTarget, host);
      activeToastHost = host;

      const raf = nativeRAF || (typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame : null);
      if (raf) {
        raf(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      } else {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }

      const baseDelay = durationMs || 1900;
      const scheduleToastHide = (delay) => {
        clearToastTimers();
        toastHideTimer = nativeSetTimeout(() => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(6px)';
          toastRemoveTimer = nativeSetTimeout(() => {
            if (activeToastHost === host) {
              removeActiveToast();
            } else {
              removeNodeSafe(host);
            }
          }, 180);
        }, delay);
      };

      if (hasAction) {
        const listenerOpts = ac ? { signal: ac.signal } : false;
        nativeAddEventListener.call(card, 'pointerenter', () => clearToastTimers(), listenerOpts);
        nativeAddEventListener.call(card, 'pointerleave', () => scheduleToastHide(nativeMathMin(baseDelay, 3200)), listenerOpts);
        nativeAddEventListener.call(card, 'focusin', () => clearToastTimers(), listenerOpts);
        nativeAddEventListener.call(card, 'focusout', () => scheduleToastHide(nativeMathMin(baseDelay, 3200)), listenerOpts);
      }

      scheduleToastHide(baseDelay);
    } catch {
      // Never break page interaction if DOM mount fails.
    }
  }

  function getModalPalette() {
    const isDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark
      ? {
          isDark: true,
          bg: '#1c1b22',
          surface: '#2b2a33',
          text: '#fbfbfe',
          muted: '#b1b1bd',
          border: '#42414d',
          accent: '#0a84ff',
          accentText: '#ffffff',
          warnBg: 'rgba(255, 189, 46, 0.14)',
          warnBorder: 'rgba(255, 189, 46, 0.45)',
          warnText: '#ffd670',
        }
      : {
          isDark: false,
          bg: '#ffffff',
          surface: '#f0f0f4',
          text: '#15141a',
          muted: '#5b5b66',
          border: '#d7d7db',
          accent: '#0060df',
          accentText: '#ffffff',
          warnBg: 'rgba(215, 110, 0, 0.08)',
          warnBorder: 'rgba(215, 110, 0, 0.35)',
          warnText: '#8f4600',
        };
  }

  function createModalButton(palette, label, primary) {
    const btn = safeCreateElement('button');
    btn.type = 'button';
    btn.className = 'cz-btn';
    setSafeText(btn, label);
    btn.style.appearance = 'none';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.borderRadius = '7px';
    btn.style.padding = '6px 12px';
    btn.style.font = 'inherit';
    btn.style.fontSize = '12px';
    btn.style.fontWeight = primary ? '600' : '500';
    btn.style.lineHeight = '1';
    btn.style.whiteSpace = 'nowrap';
    btn.style.userSelect = 'none';
    btn.style.cursor = 'pointer';
    btn.style.border = primary ? '1px solid transparent' : `1px solid ${palette.border}`;
    btn.style.background = primary ? palette.accent : palette.surface;
    btn.style.color = primary ? palette.accentText : palette.text;
    return btn;
  }

  function createModalShell(palette, maxWidthCss) {
    const host = safeCreateElement('div');
    host.style.position = 'fixed';
    host.style.inset = '0';
    host.style.zIndex = '2147483647';
    host.style.margin = '0';
    host.style.padding = '0';

    const shadow = createClosedShadowRoot(host);
    const hoverFilter = palette.isDark ? 'brightness(1.16)' : 'brightness(0.94)';
    const resetStyle = safeCreateElement('style');
    setSafeText(
      resetStyle,
      `:host{all:initial;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;} ` +
        `*,*::before,*::after{box-sizing:border-box;} ` +
        `.cz-btn,.cz-select{transition:background-color .12s ease,border-color .12s ease,opacity .12s ease,filter .12s ease;} ` +
        `.cz-btn:hover:not(:disabled),.cz-select:hover:not(:disabled){filter:${hoverFilter};} ` +
        `.cz-btn:focus-visible,.cz-select:focus-visible{outline:2px solid ${palette.accent};outline-offset:1px;}`
    );
    appendChildSafe(shadow, resetStyle);

    const scrim = safeCreateElement('div');
    setAttrSafe(scrim, 'role', 'dialog');
    setAttrSafe(scrim, 'aria-modal', 'true');
    scrim.style.position = 'fixed';
    scrim.style.inset = '0';
    scrim.style.display = 'flex';
    scrim.style.alignItems = 'center';
    scrim.style.justifyContent = 'center';
    scrim.style.padding = '16px';
    scrim.style.background = 'rgba(12, 12, 16, 0.78)';
    scrim.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    scrim.style.fontSize = '13px';

    const modal = safeCreateElement('div');
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.gap = '10px';
    modal.style.minWidth = 'min(92vw, 360px)';
    modal.style.maxWidth = maxWidthCss || 'min(92vw, 940px)';
    modal.style.maxHeight = '92vh';
    modal.style.padding = '14px 16px';
    modal.style.borderRadius = '12px';
    modal.style.background = palette.bg;
    modal.style.color = palette.text;
    modal.style.border = `1px solid ${palette.border}`;
    modal.style.boxShadow = '0 18px 48px rgba(0, 0, 0, 0.44)';

    const header = safeCreateElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '10px';
    header.style.flexWrap = 'wrap';

    const titleGroup = safeCreateElement('div');
    titleGroup.style.display = 'flex';
    titleGroup.style.alignItems = 'center';
    titleGroup.style.gap = '8px';
    titleGroup.style.flexWrap = 'wrap';

    const titleEl = safeCreateElement('span');
    titleEl.style.fontWeight = '600';
    titleEl.style.fontSize = '14px';
    titleEl.style.fontVariantNumeric = 'tabular-nums';
    appendChildSafe(titleGroup, titleEl);
    appendChildSafe(header, titleGroup);

    return { host, shadow, scrim, modal, header, titleGroup, titleEl };
  }

  function handleModalTabKey(event, shadow, focusables) {
    const activeList = nativeArrayFilter.call(
      focusables,
      (el) => el && !el.disabled && el.style.display !== 'none'
    );
    if (activeList.length === 0) {
      return;
    }
    const idx = activeList.indexOf(shadow.activeElement);
    const nextIdx = event.shiftKey
      ? (idx <= 0 ? activeList.length - 1 : idx - 1)
      : (idx < 0 || idx === activeList.length - 1 ? 0 : idx + 1);
    haltEvent(event);
    activeList[nextIdx].focus();
  }

  function showUploadToast(renamedNames, strippedCount, totalFileSecretsMasked = 0) {
    if (
      !state.showToast ||
      (renamedNames.length === 0 && strippedCount === 0 && !(totalFileSecretsMasked > 0))
    ) {
      return;
    }
    const lead =
      renamedNames.length === 1
        ? `ClipZero → ${renamedNames[0]}`
        : renamedNames.length > 1
          ? `ClipZero → ${renamedNames.length} ${i18n.filesWord} (${renamedNames[0]})`
          : 'ClipZero';
    const tags = [];
    if (strippedCount > 0) {
      nativeArrayPush.call(tags, 'EXIF OK');
    }
    if (totalFileSecretsMasked > 0) {
      nativeArrayPush.call(tags, i18n.toastUploadSecretsTag || 'Secrets masked');
    }
    const title = tags.length > 0 ? `${lead} · ${tags.join(' · ')}` : lead;
    const subtitle = !shownUploadHint ? formatShortcutHint() : '';
    const duration = !shownUploadHint ? 3400 : 1900;
    shownUploadHint = true;
    showToastNotice(title, subtitle, duration);
  }

  // Generate an unlinkable 6-char hex token without leaking local clock or timezone.
  function randomToken() {
    if (getRandomValues) {
      const bytes = new Uint8Array(3);
      getRandomValues(bytes);
      let hex = '';
      for (let i = 0; i < bytes.length; i += 1) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return hex;
    }
    return Math.floor(Math.random() * 0x1000000)
      .toString(16)
      .padStart(6, '0');
  }

  function isImageFile(file) {
    if (!file) {
      return false;
    }
    if (typeof file.type === 'string' && file.type.toLowerCase().startsWith('image/')) {
      return true;
    }
    return /\.(?:png|jpe?g|webp|gif|avif|bmp|tiff?|svg|ico|heic|heif)$/i.test(file.name || '');
  }

  function detectExifFormat(file) {
    const mime = (file.type || '').toLowerCase().split(';')[0].trim();
    const name = (file.name || '').toLowerCase();
    if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/pjpeg') {
      return 'jpeg';
    }
    if (mime === 'image/png' || mime === 'image/x-png') {
      return 'png';
    }
    if (mime === 'image/webp') {
      return 'webp';
    }
    if (mime === 'image/gif') {
      return 'gif';
    }
    if (mime === 'image/avif') {
      return 'avif';
    }
    if (mime === 'image/svg+xml') {
      return 'svg';
    }
    if (mime === 'application/pdf' || mime === 'application/x-pdf' || mime === 'application/acrobat') {
      return 'pdf';
    }
    const ambiguousMime = !mime || mime === 'application/octet-stream' || mime === 'binary/octet-stream';
    if (ambiguousMime || mime === 'text/xml' || mime === 'application/xml') {
      if (name.endsWith('.svg')) return 'svg';
    }
    if (ambiguousMime || mime === 'text/plain' || mime === 'application/download') {
      if (/\.jpe?g$/.test(name)) return 'jpeg';
      if (name.endsWith('.png')) return 'png';
      if (name.endsWith('.webp')) return 'webp';
      if (name.endsWith('.gif')) return 'gif';
      if (name.endsWith('.avif')) return 'avif';
      if (name.endsWith('.pdf')) return 'pdf';
    }
    return null;
  }

  function isSvgFile(file) {
    return detectExifFormat(file) === 'svg';
  }

  function isRasterCandidate(file) {
    if (!isImageFile(file)) {
      return false;
    }
    return !isSvgFile(file);
  }

  const SCANNABLE_TEXT_MIMES = new NativeSet([
    'application/json',
    'application/ld+json',
    'application/xml',
    'application/x-yaml',
    'application/yaml',
    'application/toml',
    'application/javascript',
    'application/x-javascript',
    'application/typescript',
    'application/x-sh',
    'application/sql',
  ]);

  const SCANNABLE_TEXT_NAME_RE =
    /^(?:\.env(?:\.[a-z0-9._-]+)?|dockerfile|makefile|.*\.(?:env|txt|log|md|markdown|rst|json|jsonc|jsonl|ya?ml|toml|ini|conf|cfg|properties|xml|csv|tsv|sql|sh|bash|zsh|ps1|bat|cmd|py|rb|php|pl|lua|r|jl|js|mjs|cjs|ts|tsx|jsx|vue|svelte|astro|html?|css|scss|less|go|rs|java|kt|kts|scala|c|h|cpp|hpp|cc|cs|swift|m|mm|dart|ex|exs|erl|hs|clj|tf|tfvars|hcl|pem|key|crt|csr|pub))$/i;

  function isScannableTextFile(file) {
    if (!file || typeof file.size !== 'number' || file.size <= 0 || file.size > MAX_SECRET_SCAN_CHARS) {
      return false;
    }
    if (isImageFile(file) || detectExifFormat(file) === 'pdf') {
      return false;
    }
    const mime = (typeof file.type === 'string' ? file.type : '').toLowerCase().split(';')[0].trim();
    if ((mime.startsWith('text/') && mime !== 'text/html') || setHas(SCANNABLE_TEXT_MIMES, mime)) {
      return true;
    }
    const baseName = (typeof file.name === 'string' ? file.name : '').trim().replace(/^.*[\\/]/, '');
    return SCANNABLE_TEXT_NAME_RE.test(baseName);
  }

  function isExoticRasterCandidate(file) {
    if (!file) {
      return false;
    }
    const mime = (file.type || '').toLowerCase().split(';')[0].trim();
    if (
      mime === 'image/bmp' ||
      mime === 'image/x-ms-bmp' ||
      mime === 'image/x-icon' ||
      mime === 'image/vnd.microsoft.icon' ||
      mime === 'image/tiff' ||
      mime === 'image/heic' ||
      mime === 'image/heif'
    ) {
      return true;
    }
    return /\.(?:bmp|tiff?|ico|heic|heif)$/i.test(file.name || '');
  }

  function replaceFileExtension(filename, newExt) {
    const cleanExt = (newExt || '').replace(/^\.+/, '').toLowerCase();
    if (!cleanExt) {
      return filename;
    }
    const trimmed = (filename || '').trim();
    if (!trimmed) {
      return `${FILE_PREFIX}_${randomToken()}_${++sequence}.${cleanExt}`;
    }
    const dotIdx = trimmed.lastIndexOf('.');
    if (dotIdx > 0 && dotIdx < trimmed.length - 1) {
      return `${trimmed.slice(0, dotIdx)}.${cleanExt}`;
    }
    return `${trimmed}.${cleanExt}`;
  }

  function resolveExtension(file, isImage) {
    const mime = (file.type || '').toLowerCase().split(';')[0].trim();
    if (MIME_TO_EXT[mime]) {
      return MIME_TO_EXT[mime];
    }
    if (mime.startsWith('image/')) {
      const sub = mime.slice('image/'.length).split('+')[0].replace(/[^a-z0-9]/g, '');
      if (sub) {
        return sub;
      }
    }
    const match = /\.([a-z0-9]{1,12})$/i.exec((file.name || '').trim());
    if (match) {
      return match[1].toLowerCase();
    }
    return isImage ? 'png' : '';
  }

  function splitStemAndExt(filename) {
    const name = (filename || '').trim();
    const dotIdx = name.lastIndexOf('.');
    if (dotIdx > 0 && dotIdx < name.length - 1) {
      return {
        stem: name.slice(0, dotIdx),
        ext: name.slice(dotIdx + 1).toLowerCase(),
      };
    }
    return { stem: name, ext: '' };
  }

  function sanitizeStem(stem) {
    const cleaned = stem.replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '');
    return cleaned || FILE_PREFIX;
  }

  function trackName(name) {
    if (setHas(usedNames, name)) {
      setDelete(usedNames, name);
    } else if (setSize(usedNames) >= MAX_TRACKED_NAMES) {
      const oldest = setOldestValue(usedNames);
      if (oldest !== undefined) {
        setDelete(usedNames, oldest);
      }
    }
    setAdd(usedNames, name);
  }

  function shouldRenameFile(file, isImage) {
    const originalName = (file.name || '').trim();
    if (state.strictMode) {
      return true;
    }
    if (!isImage) {
      return false;
    }
    if (!originalName) {
      return true;
    }
    return GENERIC_IMAGE_NAME_RE.test(originalName) || OS_DATED_SCREENSHOT_RE.test(originalName);
  }

  function generateUniqueName(file, overrideExt) {
    const isImage = isImageFile(file);
    const originalName = (file.name || '').trim();
    const anonymize = shouldRenameFile(file, isImage);
    const ext = overrideExt || resolveExtension(file, isImage);

    if (!anonymize && !isImage) {
      return null;
    }
    if (!anonymize && originalName && !setHas(usedNames, originalName)) {
      trackName(originalName);
      return overrideExt ? replaceFileExtension(originalName, overrideExt) : null;
    }

    let candidate;

    if (anonymize) {
      do {
        sequence += 1;
        candidate = ext
          ? `${FILE_PREFIX}_${randomToken()}_${sequence}.${ext}`
          : `${FILE_PREFIX}_${randomToken()}_${sequence}`;
      } while (setHas(usedNames, candidate));
    } else {
      const { stem, ext: originalExt } = splitStemAndExt(originalName);
      const safeStem = sanitizeStem(stem);
      const finalExt = overrideExt || originalExt || ext;
      do {
        sequence += 1;
        candidate = finalExt
          ? `${safeStem}_${randomToken()}_${sequence}.${finalExt}`
          : `${safeStem}_${randomToken()}_${sequence}`;
      } while (setHas(usedNames, candidate));
    }

    trackName(candidate);
    return candidate;
  }

  // --- Lossless Binary Metadata Strippers (Vanilla JS ArrayBuffer manipulation) ---

  function concatChunks(chunks) {
    let total = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      total += chunks[i].byteLength;
    }
    const out = new Uint8Array(total);
    let offset = 0;
    for (let i = 0; i < chunks.length; i += 1) {
      out.set(chunks[i], offset);
      offset += chunks[i].byteLength;
    }
    return out;
  }

  function parseJpegOrientation(bytes, tiffStart, tiffLen) {
    if (tiffLen < 8 || tiffStart + tiffLen > bytes.byteLength) {
      return 1;
    }
    const b0 = bytes[tiffStart];
    const b1 = bytes[tiffStart + 1];
    let littleEndian;
    if (b0 === 0x49 && b1 === 0x49) {
      littleEndian = true;
    } else if (b0 === 0x4d && b1 === 0x4d) {
      littleEndian = false;
    } else {
      return 1;
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset + tiffStart, tiffLen);
    if (view.getUint16(2, littleEndian) !== 42) {
      return 1;
    }
    const ifd0Offset = view.getUint32(4, littleEndian);
    if (ifd0Offset < 8 || ifd0Offset + 2 > tiffLen) {
      return 1;
    }
    const count = Math.min(view.getUint16(ifd0Offset, littleEndian), 256);
    for (let i = 0; i < count; i += 1) {
      const entryOffset = ifd0Offset + 2 + i * 12;
      if (entryOffset + 12 > tiffLen) {
        break;
      }
      if (view.getUint16(entryOffset, littleEndian) === 0x0112) {
        const type = view.getUint16(entryOffset + 2, littleEndian);
        const valCount = view.getUint32(entryOffset + 4, littleEndian);
        if (type === 3 && valCount === 1) {
          const ori = view.getUint16(entryOffset + 8, littleEndian);
          return ori >= 1 && ori <= 8 ? ori : 1;
        }
      }
    }
    return 1;
  }

  const ICC_PROFILE_SIG = [0x49, 0x43, 0x43, 0x5f, 0x50, 0x52, 0x4f, 0x46, 0x49, 0x4c, 0x45, 0x00];

  function isIccProfileSegment(bytes, m, segLen) {
    if (segLen < 14) {
      return false;
    }
    for (let i = 0; i < ICC_PROFILE_SIG.length; i += 1) {
      if (bytes[m + 3 + i] !== ICC_PROFILE_SIG[i]) {
        return false;
      }
    }
    return true;
  }

  function isJfifApp0Segment(bytes, m, segLen) {
    // Standard JFIF APP0 header ("JFIF\0").
    if (segLen < 16) {
      return false;
    }
    return (
      bytes[m + 3] === 0x4a &&
      bytes[m + 4] === 0x46 &&
      bytes[m + 5] === 0x49 &&
      bytes[m + 6] === 0x46 &&
      bytes[m + 7] === 0x00
    );
  }

  function cleanJfifApp0Segment(bytes, m) {
    // Clean 18-byte JFIF APP0 segment with zero embedded RGB thumbnail bytes.
    const clean = new Uint8Array(18);
    clean[0] = 0xff;
    clean[1] = 0xe0;
    clean[2] = 0x00;
    clean[3] = 0x10;
    clean.set(bytes.subarray(m + 3, m + 15), 4);
    clean[16] = 0x00;
    clean[17] = 0x00;
    return clean;
  }

  function isAdobeApp14Segment(bytes, m, segLen) {
    return (
      segLen === 14 &&
      bytes[m + 3] === 0x41 &&
      bytes[m + 4] === 0x64 &&
      bytes[m + 5] === 0x6f &&
      bytes[m + 6] === 0x62 &&
      bytes[m + 7] === 0x65
    );
  }

  function bytesEqualRange(bytes, start, expected) {
    if (start + expected.byteLength > bytes.byteLength) {
      return false;
    }
    for (let i = 0; i < expected.byteLength; i += 1) {
      if (bytes[start + i] !== expected[i]) {
        return false;
      }
    }
    return true;
  }

  const ORIENTATION_APP1_CACHE = new Map();
  for (let ori = 2; ori <= 8; ori += 1) {
    ORIENTATION_APP1_CACHE.set(
      ori,
      new Uint8Array([
        0xff, 0xe1, 0x00, 0x22,
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
        0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
        0x00, 0x01,
        0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, ori, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
      ])
    );
  }

  function buildMinimalOrientationApp1(orientation) {
    const cached = ORIENTATION_APP1_CACHE.get(orientation);
    if (cached) {
      return cached;
    }
    // 36-byte EXIF APP1 header carrying solely IFD0 Tag 0x0112 (Orientation), zero personal data.
    return new Uint8Array([
      0xff, 0xe1, 0x00, 0x22,
      0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
      0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
      0x00, 0x01,
      0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, orientation, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ]);
  }

  function stripJpegBytes(bytes) {
    const len = bytes.byteLength;
    if (len < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      return null;
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, len);
    const kept = [];
    let app0Segment = null;
    let orientation = 1;
    let stripped = false;
    let offset = 2;

    while (offset < len) {
      if (bytes[offset] !== 0xff) {
        return null;
      }
      let m = offset + 1;
      while (m < len && bytes[m] === 0xff) {
        m += 1;
      }
      if (m >= len) {
        return null;
      }

      const marker = bytes[m];
      if (marker === 0x00) {
        return null;
      }
      if (marker === 0xd9) {
        nativeArrayPush.call(kept, bytes.subarray(offset, m + 1));
        if (m + 1 < len) {
          stripped = true;
        }
        break;
      }
      if (marker === 0xda) {
        if (m + 3 > len) {
          return null;
        }
        const sosLen = view.getUint16(m + 1, false);
        const scanStart = m + 1 + sosLen;
        if (sosLen < 2 || scanStart > len) {
          return null;
        }
        let pos = scanStart;
        let nextSegOffset = -1;
        let eoiEnd = -1;
        while (pos < len) {
          if (bytes[pos] !== 0xff) {
            pos += 1;
            continue;
          }
          const markerStart = pos;
          let nextIdx = pos + 1;
          while (nextIdx < len && bytes[nextIdx] === 0xff) {
            nextIdx += 1;
          }
          if (nextIdx >= len) {
            break;
          }
          const scanMarker = bytes[nextIdx];
          if (
            scanMarker === 0x00 ||
            (scanMarker >= 0xd0 && scanMarker <= 0xd7) ||
            scanMarker === 0x01
          ) {
            pos = nextIdx + 1;
            continue;
          }
          if (scanMarker === 0xd9) {
            eoiEnd = nextIdx + 1;
            break;
          }
          nextSegOffset = markerStart;
          break;
        }
        if (eoiEnd > 0) {
          nativeArrayPush.call(kept, bytes.subarray(offset, eoiEnd));
          if (eoiEnd < len) {
            stripped = true;
          }
          break;
        }
        if (nextSegOffset > offset) {
          nativeArrayPush.call(kept, bytes.subarray(offset, nextSegOffset));
          offset = nextSegOffset;
          continue;
        }
        nativeArrayPush.call(kept, bytes.subarray(offset));
        break;
      }
      if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
        nativeArrayPush.call(kept, bytes.subarray(offset, m + 1));
        offset = m + 1;
        continue;
      }

      if (m + 3 > len) {
        return null;
      }
      const segLen = view.getUint16(m + 1, false);
      const segEnd = m + 1 + segLen;
      if (segLen < 2 || segEnd > len) {
        return null;
      }

      // Preserve APP0 (JFIF without thumbnail), APP2 (ICC_PROFILE only — strips camera MPF thumbnails), and standard 14-byte APP14 (Adobe CMYK/YCCK transform).
      if (marker === 0xe0 && isJfifApp0Segment(bytes, m, segLen)) {
        const hasEmbeddedThumb = segLen > 16 || bytes[m + 15] !== 0 || bytes[m + 16] !== 0;
        const cleanApp0 = hasEmbeddedThumb ? cleanJfifApp0Segment(bytes, m) : bytes.subarray(offset, segEnd);
        if (hasEmbeddedThumb) {
          stripped = true;
        }
        if (!app0Segment && kept.length === 0) {
          app0Segment = cleanApp0;
        } else {
          nativeArrayPush.call(kept, cleanApp0);
        }
      } else if (marker === 0xee) {
        if (isAdobeApp14Segment(bytes, m, segLen)) {
          nativeArrayPush.call(kept, bytes.subarray(offset, segEnd));
        } else {
          stripped = true;
        }
      } else if (marker === 0xe2 && isIccProfileSegment(bytes, m, segLen)) {
        nativeArrayPush.call(kept, bytes.subarray(offset, segEnd));
      } else if ((marker >= 0xe0 && marker <= 0xef && marker !== 0xee) || marker === 0xfe) {
        if (
          marker === 0xe1 &&
          segLen >= 16 &&
          bytes[m + 3] === 0x45 &&
          bytes[m + 4] === 0x78 &&
          bytes[m + 5] === 0x69 &&
          bytes[m + 6] === 0x66 &&
          bytes[m + 7] === 0x00 &&
          bytes[m + 8] === 0x00
        ) {
          const parsedOri = parseJpegOrientation(bytes, m + 9, segEnd - (m + 9));
          if (parsedOri >= 2 && parsedOri <= 8 && orientation === 1) {
            orientation = parsedOri;
            if (segLen === 34 && bytesEqualRange(bytes, offset, buildMinimalOrientationApp1(parsedOri))) {
              offset = segEnd;
              continue;
            }
          }
        }
        stripped = true;
      } else {
        nativeArrayPush.call(kept, bytes.subarray(offset, segEnd));
      }

      offset = segEnd;
    }

    if (!stripped) {
      return null;
    }

    const out = [bytes.subarray(0, 2)];
    if (app0Segment) {
      nativeArrayPush.call(out, app0Segment);
    }
    if (orientation >= 2 && orientation <= 8) {
      nativeArrayPush.call(out, buildMinimalOrientationApp1(orientation));
    }
    for (let i = 0; i < kept.length; i += 1) {
      nativeArrayPush.call(out, kept[i]);
    }
    return concatChunks(out);
  }

  function stripPngBytes(bytes) {
    const len = bytes.byteLength;
    if (
      len < 12 ||
      bytes[0] !== 0x89 ||
      bytes[1] !== 0x50 ||
      bytes[2] !== 0x4e ||
      bytes[3] !== 0x47 ||
      bytes[4] !== 0x0d ||
      bytes[5] !== 0x0a ||
      bytes[6] !== 0x1a ||
      bytes[7] !== 0x0a
    ) {
      return null;
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, len);
    const chunks = [bytes.subarray(0, 8)];
    let stripped = false;
    let offset = 8;

    while (offset < len) {
      if (offset + 12 > len) {
        return null;
      }
      const chunkLen = view.getUint32(offset, false);
      const totalSize = 12 + chunkLen;
      if (chunkLen > 0x7fffffff || offset + totalSize > len) {
        return null;
      }
      const type = String.fromCharCode(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7]
      );

      if (!setHas(PNG_SAFE_CHUNKS, type)) {
        stripped = true;
      } else {
        nativeArrayPush.call(chunks, bytes.subarray(offset, offset + totalSize));
      }

      offset += totalSize;
      if (type === 'IEND') {
        if (offset < len) {
          stripped = true;
        }
        break;
      }
    }

    return stripped ? concatChunks(chunks) : null;
  }

  function stripWebpBytes(bytes) {
    const len = bytes.byteLength;
    if (
      len < 12 ||
      bytes[0] !== 0x52 ||
      bytes[1] !== 0x49 ||
      bytes[2] !== 0x46 ||
      bytes[3] !== 0x46 ||
      bytes[8] !== 0x57 ||
      bytes[9] !== 0x45 ||
      bytes[10] !== 0x42 ||
      bytes[11] !== 0x50
    ) {
      return null;
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, len);
    const riffDeclared = 8 + view.getUint32(4, true);
    const maxOffset = riffDeclared >= 12 && riffDeclared <= len ? riffDeclared : len;
    const chunks = [bytes.subarray(0, 12)];
    let stripped = riffDeclared >= 12 && riffDeclared < len;
    let offset = 12;

    while (offset < maxOffset) {
      if (offset + 8 > maxOffset) {
        return null;
      }
      const fourcc = String.fromCharCode(
        bytes[offset],
        bytes[offset + 1],
        bytes[offset + 2],
        bytes[offset + 3]
      );
      const chunkLen = view.getUint32(offset + 4, true);
      const paddedLen = chunkLen + (chunkLen & 1);
      const paddedEnd = offset + 8 + paddedLen;
      const rawEnd = offset + 8 + chunkLen;
      const chunkEnd = paddedEnd <= maxOffset ? paddedEnd : rawEnd <= maxOffset ? rawEnd : -1;
      if (chunkEnd < 0) {
        return null;
      }

      if (!setHas(WEBP_SAFE_CHUNKS, fourcc)) {
        stripped = true;
      } else if (fourcc === 'VP8X' && chunkEnd >= offset + 9) {
        const vp8xCopy = new NativeUint8Array(bytes.subarray(offset, chunkEnd));
        // WebP VP8X byte 0 (MSB-0): bit 4 (0x08) = EXIF, bit 5 (0x04) = XMP. Keep Alpha (0x10).
        if ((vp8xCopy[8] & 0x0c) !== 0) {
          vp8xCopy[8] &= ~0x0c;
          stripped = true;
        }
        nativeArrayPush.call(chunks, vp8xCopy);
      } else {
        nativeArrayPush.call(chunks, bytes.subarray(offset, chunkEnd));
      }

      offset = chunkEnd;
    }

    if (offset < len) {
      stripped = true;
    }

    if (!stripped) {
      return null;
    }

    const out = concatChunks(chunks);
    const outView = new NativeDataView(out.buffer, out.byteOffset, out.byteLength);
    outView.setUint32(4, out.byteLength - 8, true);
    return out;
  }

  function skipGifSubBlocks(bytes, pos, len) {
    while (pos < len) {
      const subLen = bytes[pos++];
      if (subLen === 0) {
        return pos;
      }
      pos += subLen;
      if (pos > len) {
        return -1;
      }
    }
    return -1;
  }

  function asciiBytesEquals(bytes, start, ascii) {
    if (start + ascii.length > bytes.byteLength) {
      return false;
    }
    for (let i = 0; i < ascii.length; i += 1) {
      if (bytes[start + i] !== ascii.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  }

  function stripGifBytes(bytes) {
    const len = bytes.byteLength;
    if (len < 14 || (!asciiBytesEquals(bytes, 0, 'GIF89a') && !asciiBytesEquals(bytes, 0, 'GIF87a'))) {
      return null;
    }
    let pos = 13;
    const packed = bytes[10];
    if (packed & 0x80) {
      pos += 3 * (1 << ((packed & 0x07) + 1));
    }
    if (pos >= len) {
      return null;
    }

    const chunks = [bytes.subarray(0, pos)];
    let stripped = false;

    while (pos < len) {
      const blockStart = pos;
      const introducer = bytes[pos++];
      if (introducer === 0x3b) {
        nativeArrayPush.call(chunks, bytes.subarray(blockStart, pos));
        if (pos < len) {
          stripped = true;
        }
        break;
      }
      if (introducer === 0x2c) {
        if (pos + 9 > len) {
          return null;
        }
        const localPacked = bytes[pos + 8];
        pos += 9;
        if (localPacked & 0x80) {
          pos += 3 * (1 << ((localPacked & 0x07) + 1));
        }
        if (pos >= len) {
          return null;
        }
        pos += 1; // LZW minimum code size
        const nextPos = skipGifSubBlocks(bytes, pos, len);
        if (nextPos < 0) {
          return null;
        }
        nativeArrayPush.call(chunks, bytes.subarray(blockStart, nextPos));
        pos = nextPos;
      } else if (introducer === 0x21) {
        if (pos >= len) {
          return null;
        }
        const label = bytes[pos++];
        if (label === 0xff && pos < len && bytes[pos] === 11 && pos + 12 <= len) {
          const isAnimExt =
            asciiBytesEquals(bytes, pos + 1, 'NETSCAPE2.0') ||
            asciiBytesEquals(bytes, pos + 1, 'ANIMEXTS1.0') ||
            asciiBytesEquals(bytes, pos + 1, 'ICCRGBG1012');
          const nextPos = skipGifSubBlocks(bytes, pos, len);
          if (nextPos < 0) {
            return null;
          }
          if (isAnimExt) {
            nativeArrayPush.call(chunks, bytes.subarray(blockStart, nextPos));
          } else {
            stripped = true;
          }
          pos = nextPos;
        } else if (label === 0xfe || label === 0xff) {
          const nextPos = skipGifSubBlocks(bytes, pos, len);
          if (nextPos < 0) {
            return null;
          }
          stripped = true;
          pos = nextPos;
        } else {
          const nextPos = skipGifSubBlocks(bytes, pos, len);
          if (nextPos < 0) {
            return null;
          }
          nativeArrayPush.call(chunks, bytes.subarray(blockStart, nextPos));
          pos = nextPos;
        }
      } else {
        return null;
      }
    }

    return stripped ? concatChunks(chunks) : null;
  }

  function hasAvifBrand(bytes, brand) {
    if (bytes.byteLength < 16 || !asciiBytesEquals(bytes, 4, 'ftyp')) {
      return false;
    }
    const ftypSize = Math.min(bytes.byteLength, 128);
    if (asciiBytesEquals(bytes, 8, brand)) {
      return true;
    }
    for (let i = 16; i + 4 <= ftypSize; i += 4) {
      if (asciiBytesEquals(bytes, i, brand)) {
        return true;
      }
    }
    return false;
  }

  function bytesContainsAscii(bytes, ascii, maxScan) {
    const limit = Math.min(bytes.byteLength, maxScan || bytes.byteLength);
    const first = ascii.charCodeAt(0);
    const n = ascii.length;
    for (let i = 0; i <= limit - n; i += 1) {
      if (bytes[i] === first && asciiBytesEquals(bytes, i, ascii)) {
        return true;
      }
    }
    return false;
  }

  function hasAvifMetadataMarkers(bytes) {
    if (!bytes || bytes.byteLength < 16 || !asciiBytesEquals(bytes, 4, 'ftyp')) {
      return false;
    }
    if (hasAvifBrand(bytes, 'avis') || !hasAvifBrand(bytes, 'avif')) {
      return false;
    }
    const scanCap = nativeMathMin(bytes.byteLength, 512 * 1024);
    return (
      bytesContainsAscii(bytes, 'Exif\0\0', scanCap) ||
      bytesContainsAscii(bytes, 'http://ns.adobe.com/xap/1.0/', scanCap) ||
      bytesContainsAscii(bytes, '<x:xmpmeta', scanCap)
    );
  }

  const SVG_STRIP_ATTR_PREFIXES = [
    'inkscape:',
    'sodipodi:',
    'sketch:',
    'illustrator:',
    'adobe:',
    'serif:',
    'figma:',
    'photoshop:',
    'tiff:',
    'exif:',
    'xmp:',
    'xmpmm:',
    'stevt:',
    'vectornator:',
    'corel:',
    'i:',
    'ns0:',
  ];
  const SVG_STRIP_ELEMENT_PREFIXES = SVG_STRIP_ATTR_PREFIXES.concat([
    'rdf:',
    'dc:',
    'cc:',
    'v:',
    'x:',
  ]);
  const SVG_STRIP_NAMESPACE_RE =
    /(?:rdf-syntax-ns|purl\.org\/dc\/|creativecommons\.org|ns\.adobe\.com|inkscape\.org|sodipodi\.sourceforge\.net|bohemiancoding\.com\/sketch|figma\.com|corel\.com|microsoft\.com\/visio)/i;
  const SVG_STRIP_XMLNS = new NativeSet([
    'xmlns:inkscape',
    'xmlns:sodipodi',
    'xmlns:sketch',
    'xmlns:illustrator',
    'xmlns:adobe',
    'xmlns:serif',
    'xmlns:figma',
    'xmlns:photoshop',
    'xmlns:tiff',
    'xmlns:exif',
    'xmlns:xmp',
    'xmlns:xmpmm',
    'xmlns:stevt',
    'xmlns:vectornator',
    'xmlns:corel',
    'xmlns:v',
    'xmlns:i',
    'xmlns:x',
    'xmlns:dc',
    'xmlns:cc',
    'xmlns:rdf',
    'xmlns:ns_flows',
    'xmlns:graph',
  ]);
  const SVG_GENERATOR_DESC_RE =
    /\b(?:created\s+with|generated\s+by|exported\s+from|inkscape|adobe\s+illustrator|affinity|sketch|figma|canva|coreldraw|vectornator|procreate|pixelmator|excalidraw|draw\.io|diagrams\.net|matplotlib|graphviz|mermaid)\b/i;

  const SVG_DANGEROUS_LOCAL_TAGS = new NativeSet([
    'script',
    'foreignobject',
    'iframe',
    'object',
    'embed',
    'applet',
    'handler',
    'listener',
    'audio',
    'video',
    'canvas',
    'frame',
    'frameset',
    'base',
    'link',
    'meta',
    'template',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'portal',
    'noscript',
  ]);
  const SVG_ANIMATE_LOCAL_TAGS = new NativeSet([
    'set',
    'animate',
    'animatetransform',
    'animatemotion',
    'animatecolor',
  ]);
  const SVG_URI_ATTRS = new NativeSet([
    'href',
    'xlink:href',
    'src',
    'action',
    'formaction',
    'poster',
    'data',
    'cite',
    'longdesc',
    'ping',
    'background',
    'dynsrc',
    'lowsrc',
    'srcdoc',
  ]);
  const SVG_PRESENTATION_URL_ATTRS = new NativeSet([
    'fill',
    'stroke',
    'filter',
    'clip-path',
    'mask',
    'marker',
    'marker-start',
    'marker-mid',
    'marker-end',
    'cursor',
  ]);
  const SVG_UNSAFE_ANIM_VALUE_RE =
    /(?:javascript|vbscript|ftp|http|https)\s*:|data\s*:\s*(?:text\/|application\/|image\/svg)|\/\//i;

  function isSafeSvgUrl(rawVal) {
    const cleaned = String(rawVal || '')
      .replace(/[\u0000-\u0020]+/g, '')
      .trim();
    if (!cleaned || cleaned.startsWith('#')) {
      return true;
    }
    return /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(cleaned);
  }

  function isSafeSvgAnimUri(rawVal) {
    const cleaned = String(rawVal || '')
      .replace(/[\u0000-\u0020]+/g, '')
      .trim();
    if (!cleaned || cleaned.startsWith('#')) {
      return true;
    }
    if (SVG_UNSAFE_ANIM_VALUE_RE.test(cleaned)) {
      return false;
    }
    if (/^data:/i.test(cleaned)) {
      return /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(cleaned);
    }
    return !/^[a-z][a-z0-9+.-]*:/i.test(cleaned);
  }

  function stripCssCommentsLinear(css) {
    const str = String(css || '');
    let pos = 0;
    let open = str.indexOf('/*');
    if (open < 0) {
      return str;
    }
    let out = '';
    while (open >= 0) {
      out += str.slice(pos, open);
      const close = str.indexOf('*/', open + 2);
      if (close < 0) {
        return out;
      }
      pos = close + 2;
      open = str.indexOf('/*', pos);
    }
    out += str.slice(pos);
    return out;
  }

  function decodeSvgCssEscapes(css) {
    let out = stripCssCommentsLinear(css);
    out = out.replace(/\\([0-9a-fA-F]{1,6})[\t\r\n ]?/g, (_m, hex) => {
      const cp = parseInt(hex, 16);
      return cp >= 0x20 && cp <= 0x10ffff ? String.fromCodePoint(cp) : '';
    });
    return out.replace(/\\([^\r\n0-9a-fA-F])/g, '$1');
  }

  function sanitizeCssUrlsLinear(css) {
    const str = String(css || '');
    const lower = str.toLowerCase();
    let pos = 0;
    let out = '';
    while (pos < str.length) {
      const idx = lower.indexOf('url(', pos);
      if (idx < 0) {
        out += str.slice(pos);
        break;
      }
      if (idx > 0 && /[a-z0-9_-]/i.test(str[idx - 1])) {
        out += str.slice(pos, idx + 4);
        pos = idx + 4;
        continue;
      }
      out += str.slice(pos, idx);
      let cur = idx + 4;
      while (cur < str.length && /\s/.test(str[cur])) {
        cur += 1;
      }
      const quote = cur < str.length && (str[cur] === "'" || str[cur] === '"') ? str[cur] : '';
      let innerStart = cur;
      let innerEnd = -1;
      let closeParen = -1;
      if (quote) {
        innerStart = cur + 1;
        const endQ = str.indexOf(quote, innerStart);
        if (endQ < 0) {
          return out + 'none';
        }
        innerEnd = endQ;
        cur = endQ + 1;
        while (cur < str.length && /\s/.test(str[cur])) {
          cur += 1;
        }
        closeParen = cur < str.length && str[cur] === ')' ? cur : str.indexOf(')', cur);
        if (closeParen < 0) {
          return out + 'none';
        }
      } else {
        closeParen = str.indexOf(')', innerStart);
        if (closeParen < 0) {
          return out + 'none';
        }
        innerEnd = closeParen;
      }
      const rawUrl = str.slice(innerStart, innerEnd).trim();
      out += isSafeSvgUrl(rawUrl) ? str.slice(idx, closeParen + 1) : 'none';
      pos = closeParen + 1;
    }
    return out;
  }

  function sanitizeSvgCssText(css) {
    if (typeof css !== 'string' || !css) {
      return css;
    }
    let out = decodeSvgCssEscapes(css);
    out = out
      .replace(/@import\b[^;\n}]*(?:;|\n|$)/gi, '')
      .replace(/-moz-binding\s*:[^;}]*/gi, '')
      .replace(/\bbehavior\s*:[^;}]*/gi, '')
      .replace(/\bexpression\s*\(/gi, 'invalid(')
      .replace(/\bimage-set\s*\(/gi, 'invalid(');
    return sanitizeCssUrlsLinear(out);
  }

  function hasUnsafeAnimationUriValue(el) {
    const attrs = ['to', 'from', 'by', 'values', 'href', 'xlink:href'];
    for (let i = 0; i < attrs.length; i += 1) {
      const attrName = attrs[i];
      const val = el.getAttribute && el.getAttribute(attrName);
      if (!val) {
        continue;
      }
      if (attrName === 'values') {
        const parts = String(val).split(';');
        for (let j = 0; j < parts.length; j += 1) {
          if (!isSafeSvgAnimUri(parts[j])) {
            return true;
          }
        }
      } else if (!isSafeSvgAnimUri(val)) {
        return true;
      }
    }
    return false;
  }

  let sharedDomParser = null;
  function getSharedDomParser() {
    if (!sharedDomParser && NativeDOMParser) {
      sharedDomParser = new NativeDOMParser();
    }
    return sharedDomParser;
  }

  const IMAGE_WRAPPER_IGNORED_TAGS = new NativeSet([
    'style',
    'script',
    'noscript',
    'template',
    'meta',
    'link',
    'title',
    'head',
    'source',
  ]);
  const IMAGE_WRAPPER_FOREIGN_MEDIA_TAGS = new NativeSet([
    'svg',
    'video',
    'audio',
    'iframe',
    'canvas',
    'object',
    'embed',
  ]);

  function isImageOnlyHtmlWrapper(html) {
    if (typeof html !== 'string' || html.length === 0 || html.length > 65536) {
      return false;
    }
    if (!/<img\b/i.test(html)) {
      return false;
    }
    const parser = getSharedDomParser();
    if (!parser) {
      return false;
    }
    let doc = null;
    try {
      const parseInput = /<(?:!doctype|html|head|body)\b/i.test(html)
        ? html
        : `<body>${html}</body>`;
      doc = nativeDomParse
        ? nativeDomParse.call(parser, parseInput, 'text/html')
        : parser.parseFromString(parseInput, 'text/html');
      if (!doc || !doc.body) {
        return false;
      }
      let imgCount = 0;
      let hasTextOrForeignMedia = false;

      function walk(node) {
        if (hasTextOrForeignMedia || !node) {
          return;
        }
        const children = node.childNodes;
        if (!children) {
          return;
        }
        for (let i = 0; i < children.length; i += 1) {
          if (hasTextOrForeignMedia) {
            return;
          }
          const child = children[i];
          const nt = child.nodeType;
          if (nt === 3 || nt === 4) {
            const val = child.nodeValue;
            if (val && val.trim().length > 0) {
              hasTextOrForeignMedia = true;
              return;
            }
            continue;
          }
          if (nt !== 1) {
            continue;
          }
          const tag = (child.localName || child.nodeName || '').toLowerCase();
          if (tag === 'img') {
            imgCount += 1;
            continue;
          }
          if (setHas(IMAGE_WRAPPER_FOREIGN_MEDIA_TAGS, tag)) {
            hasTextOrForeignMedia = true;
            return;
          }
          if (setHas(IMAGE_WRAPPER_IGNORED_TAGS, tag)) {
            continue;
          }
          walk(child);
        }
      }

      walk(doc.body);
      return !hasTextOrForeignMedia && imgCount >= 1;
    } catch {
      return false;
    } finally {
      doc = null;
    }
  }

  let sharedXmlSerializer = null;
  function getSharedXmlSerializer() {
    if (!sharedXmlSerializer && NativeXMLSerializer) {
      sharedXmlSerializer = new NativeXMLSerializer();
    }
    return sharedXmlSerializer;
  }

  function stripSvgBytes(bytes) {
    if (
      !NativeDOMParser ||
      !NativeXMLSerializer ||
      !sharedTextDecoder ||
      !sharedTextEncoder ||
      !bytes ||
      bytes.byteLength > MAX_SVG_BYTES
    ) {
      return null;
    }
    try {
      const rawText = nativeTextDecode
        ? nativeTextDecode.call(sharedTextDecoder, bytes)
        : sharedTextDecoder.decode(bytes);
      const parser = getSharedDomParser();
      if (!parser) {
        return null;
      }
      const doc = nativeDomParse
        ? nativeDomParse.call(parser, rawText, 'image/svg+xml')
        : parser.parseFromString(rawText, 'image/svg+xml');
      if (!doc || !doc.documentElement || doc.documentElement.localName.toLowerCase() !== 'svg') {
        return null;
      }
      const errNodes = nativeGetElementsByTagName
        ? nativeGetElementsByTagName.call(doc, 'parsererror')
        : doc.getElementsByTagName('parsererror');
      if (errNodes && errNodes.length > 0) {
        return null;
      }

      let modified = false;

      function cleanNode(node) {
        const children = node.childNodes;
        for (let i = children.length - 1; i >= 0; i -= 1) {
          const child = children[i];
          if (child.nodeType === 8 || child.nodeType === 7) {
            removeChildSafe(node, child);
            modified = true;
            continue;
          }
          if (child.nodeType !== 1) {
            continue;
          }

          const tag = (child.nodeName || '').toLowerCase();
          const local = (child.localName || '').toLowerCase();
          const nsUri = child.namespaceURI || '';
          const isAnim = setHas(SVG_ANIMATE_LOCAL_TAGS, local);
          const animAttr = isAnim
            ? (getAttrSafe(child, 'attributeName') || '')
                .replace(/[\u0000-\u0020]+/g, '')
                .toLowerCase()
            : '';
          const animLocal = animAttr.includes(':') ? animAttr.split(':').pop() : animAttr;
          const dangerousAnim =
            isAnim &&
            ((animAttr &&
              (animAttr.startsWith('on') ||
                animLocal.startsWith('on') ||
                setHas(SVG_URI_ATTRS, animAttr) ||
                setHas(SVG_URI_ATTRS, animLocal) ||
                animLocal === 'style')) ||
              hasUnsafeAnimationUriValue(child));
          if (
            setHas(SVG_DANGEROUS_LOCAL_TAGS, local) ||
            dangerousAnim ||
            local === 'metadata' ||
            nativeArraySome.call(SVG_STRIP_ELEMENT_PREFIXES, (prefix) => tag.startsWith(prefix)) ||
            (nsUri && SVG_STRIP_NAMESPACE_RE.test(nsUri)) ||
            (local === 'desc' && SVG_GENERATOR_DESC_RE.test(getSafeText(child) || ''))
          ) {
            removeChildSafe(node, child);
            modified = true;
            continue;
          }

          if (local === 'style') {
            const rawCss = getSafeText(child) || '';
            const safeCss = sanitizeSvgCssText(rawCss);
            if (safeCss !== rawCss) {
              setSafeText(child, safeCss);
              modified = true;
            }
          }

          cleanNode(child);
        }

        if (node.nodeType === 1 && node.attributes) {
          for (let i = node.attributes.length - 1; i >= 0; i -= 1) {
            const attr = node.attributes[i];
            const attrName = (attr.name || '').toLowerCase();
            const attrLocal = attrName.includes(':') ? attrName.split(':').pop() : attrName;
            const attrNs = attr.namespaceURI || '';
            if (
              setHas(SVG_STRIP_XMLNS, attrName) ||
              nativeArraySome.call(SVG_STRIP_ATTR_PREFIXES, (prefix) => attrName.startsWith(prefix)) ||
              (attrNs && SVG_STRIP_NAMESPACE_RE.test(attrNs)) ||
              attrName.startsWith('on') ||
              attrLocal.startsWith('on') ||
              ((setHas(SVG_URI_ATTRS, attrName) || setHas(SVG_URI_ATTRS, attrLocal)) &&
                !isSafeSvgUrl(attr.value))
            ) {
              removeAttrSafe(node, attr.name);
              modified = true;
            } else if (attrName === 'style') {
              const safeInline = sanitizeSvgCssText(attr.value || '');
              if (safeInline !== (attr.value || '')) {
                if (safeInline.trim()) {
                  setAttrSafe(node, attr.name, safeInline);
                } else {
                  removeAttrSafe(node, attr.name);
                }
                modified = true;
              }
            } else if (setHas(SVG_PRESENTATION_URL_ATTRS, attrLocal)) {
              const rawVal = attr.value || '';
              if (/url\s*\(|\\|expression\s*\(|-moz-binding|behavior\s*:/i.test(rawVal) || rawVal.includes('/*')) {
                const safePres = sanitizeSvgCssText(rawVal);
                if (safePres !== rawVal) {
                  if (safePres.trim()) {
                    setAttrSafe(node, attr.name, safePres);
                  } else {
                    removeAttrSafe(node, attr.name);
                  }
                  modified = true;
                }
              }
            }
          }
        }
      }

      cleanNode(doc.documentElement);
      const rootChildren = doc.childNodes;
      for (let i = rootChildren.length - 1; i >= 0; i -= 1) {
        const nt = rootChildren[i].nodeType;
        if (nt === 8 || nt === 7 || nt === 10) {
          removeChildSafe(doc, rootChildren[i]);
          modified = true;
        }
      }
      if (!modified) {
        return null;
      }
      const serializer = getSharedXmlSerializer();
      if (!serializer) {
        return null;
      }
      const serialized = nativeXmlSerialize
        ? nativeXmlSerialize.call(serializer, doc)
        : serializer.serializeToString(doc);
      return nativeTextEncode
        ? nativeTextEncode.call(sharedTextEncoder, serialized)
        : sharedTextEncoder.encode(serialized);
    } catch {
      return null;
    }
  }

  const PDF_STRONG_INFO_KEYS = new NativeSet([
    'Author',
    'Creator',
    'Producer',
    'CreationDate',
    'ModDate',
    'Subject',
    'Keywords',
    'Company',
    'Manager',
  ]);
  const PDF_OUTLINE_KEYS = new NativeSet([
    'Dest',
    'Parent',
    'First',
    'Last',
    'Next',
    'Prev',
    'Count',
    'SE',
  ]);
  const PDF_XMP_ATTR_RE =
    /\b(?:dc:creator|pdf:Author|pdf:Producer|pdf:Keywords|xmp:CreatorTool|xmp:CreateDate|xmp:ModifyDate|xmp:MetadataDate|dc:title|dc:description|dc:subject|xmpMM:DocumentID|xmpMM:InstanceID|xmpMM:OriginalDocumentID|tiff:Make|tiff:Model|tiff:Artist|tiff:Software|tiff:DateTime|photoshop:[A-Za-z0-9]{1,24}|exif:[A-Za-z0-9]{1,24})\s*=\s*(?:"([^"]{0,4096})"|'([^']{0,4096})')/gi;
  const PDF_XMP_OPEN_TAG_RE =
    /<(dc:creator|pdf:Author|pdf:Producer|pdf:Keywords|xmp:CreatorTool|xmp:CreateDate|xmp:ModifyDate|xmp:MetadataDate|dc:title|dc:description|dc:subject|xmpMM:DocumentID|xmpMM:InstanceID|xmpMM:OriginalDocumentID|tiff:Make|tiff:Model|tiff:Artist|tiff:Software|tiff:DateTime|photoshop:[A-Za-z0-9]{1,24}|exif:[A-Za-z0-9]{1,24}|stEvt:[A-Za-z0-9]{1,24})(?=\s|>)(?:\s[^>]{0,256})?>/gi;

  function blankPdfByteRange(out, start, end) {
    let changed = false;
    for (let i = start; i < end; i += 1) {
      if (out[i] !== 0x20) {
        out[i] = 0x20;
        changed = true;
      }
    }
    return changed;
  }

  function decodePdfName(rawName) {
    if (!rawName.includes('#')) {
      return rawName;
    }
    return rawName.replace(/#([0-9a-fA-F]{2})/g, (_m, hex) => {
      const code = parseInt(hex, 16);
      return code >= 0x20 && code <= 0x7e ? String.fromCharCode(code) : '';
    });
  }

  function findPdfStreamRanges(text) {
    const ranges = [];
    let pos = 0;
    while (pos < text.length) {
      const idx = text.indexOf('stream', pos);
      if (idx < 0) break;
      const before = idx > 0 ? text.charCodeAt(idx - 1) : 0x20;
      const validBefore =
        before === 0x20 || before === 0x0a || before === 0x0d || before === 0x09 || before === 0x3e || before === 0x5d;
      const after = text.charCodeAt(idx + 6);
      if (validBefore && (after === 0x0d || after === 0x0a)) {
        const bodyStart = after === 0x0d && text.charCodeAt(idx + 7) === 0x0a ? idx + 8 : idx + 7;
        const endIdx = text.indexOf('endstream', bodyStart);
        if (endIdx < 0) break;
        nativeArrayPush.call(ranges, [bodyStart, endIdx]);
        pos = endIdx + 9;
      } else {
        pos = idx + 6;
      }
    }
    return ranges;
  }

  function isInsideStreamRanges(pos, streamRanges) {
    let lo = 0;
    let hi = streamRanges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const r = streamRanges[mid];
      if (pos < r[0]) {
        hi = mid - 1;
      } else if (pos >= r[1]) {
        lo = mid + 1;
      } else {
        return true;
      }
    }
    return false;
  }

  function skipPdfWsAndComments(out, pos, limit) {
    let p = pos;
    while (p < limit) {
      const c = out[p];
      if (c === 0x20 || c === 0x09 || c === 0x0d || c === 0x0a || c === 0x0c || c === 0x00) {
        p += 1;
      } else if (c === 0x25) {
        p += 1;
        while (p < limit && out[p] !== 0x0a && out[p] !== 0x0d) {
          p += 1;
        }
      } else {
        break;
      }
    }
    return p;
  }

  function blankPdfStringValue(out, text, valStart, limit, isExplicitInfo, indirectTargets) {
    const p = skipPdfWsAndComments(out, valStart, limit);
    if (p >= limit) {
      return { modified: false, nextPos: valStart };
    }
    if (out[p] === 0x28) {
      let q = p + 1;
      let depth = 1;
      while (q < limit && depth > 0 && q - p < 65536) {
        if (out[q] === 0x5c) {
          q += 2;
          continue;
        }
        if (out[q] === 0x28) depth += 1;
        else if (out[q] === 0x29) depth -= 1;
        q += 1;
      }
      if (depth === 0 && q - 1 > p + 1) {
        return { modified: blankPdfByteRange(out, p + 1, q - 1), nextPos: q };
      }
      return { modified: false, nextPos: q };
    }
    if (out[p] === 0x3c && out[p + 1] !== 0x3c) {
      let q = p + 1;
      let validHex = true;
      while (q < limit && out[q] !== 0x3e && q - p < 65536) {
        const c = out[q];
        const isHexOrWs =
          (c >= 0x30 && c <= 0x39) ||
          (c >= 0x41 && c <= 0x46) ||
          (c >= 0x61 && c <= 0x66) ||
          c === 0x20 ||
          c === 0x09 ||
          c === 0x0d ||
          c === 0x0a;
        if (!isHexOrWs) {
          validHex = false;
          break;
        }
        q += 1;
      }
      if (validHex && q < limit && out[q] === 0x3e) {
        return { modified: blankPdfByteRange(out, p + 1, q), nextPos: q + 1 };
      }
    }
    if (isExplicitInfo && indirectTargets) {
      const refMatch = /^(\d{1,8})\s+(\d{1,5})\s+R\b/.exec(text.slice(p, Math.min(limit, p + 32)));
      if (refMatch) {
        const idKey = `${refMatch[1]}:${refMatch[2]}`;
        if (!setHas(indirectTargets.set, idKey)) {
          setAdd(indirectTargets.set, idKey);
          nativeArrayPush.call(indirectTargets.list, idKey);
        }
      }
    }
    return { modified: false, nextPos: p };
  }

  function scrubPdfDictRegion(out, text, start, end, isExplicitInfo, indirectTargets) {
    const region = text.slice(start, end);
    const keyRe = /\/([A-Za-z0-9#]{2,64})(?=[\s(<\[%/])/g;
    const foundKeys = [];
    let hasStrongInfoKey = false;
    let hasOutlineKey = false;
    let m;
    while ((m = keyRe.exec(region)) !== null) {
      const decoded = decodePdfName(m[1]);
      if (setHas(PDF_OUTLINE_KEYS, decoded)) {
        hasOutlineKey = true;
      }
      if (setHas(PDF_STRONG_INFO_KEYS, decoded)) {
        hasStrongInfoKey = true;
        nativeArrayPush.call(foundKeys, { key: decoded, absValStart: start + m.index + m[0].length });
      } else if (decoded === 'Title') {
        nativeArrayPush.call(foundKeys, { key: 'Title', absValStart: start + m.index + m[0].length });
      }
    }
    let modified = false;
    for (let i = 0; i < foundKeys.length; i += 1) {
      const item = foundKeys[i];
      if (item.key === 'Title' && !isExplicitInfo && (hasOutlineKey || !hasStrongInfoKey)) {
        continue;
      }
      const res = blankPdfStringValue(out, text, item.absValStart, end, isExplicitInfo, indirectTargets);
      if (res.modified) {
        modified = true;
      }
    }
    return modified;
  }

  function collectPdfXmpSpans(text) {
    const spans = [];
    const anchors = ['<x:xmpmeta', '<?xpacket', '<rdf:RDF'];
    let pos = 0;
    while (pos < text.length) {
      let bestIdx = -1;
      let anchorKind = -1;
      for (let k = 0; k < anchors.length; k += 1) {
        const idx = text.indexOf(anchors[k], pos);
        if (idx >= 0 && (bestIdx < 0 || idx < bestIdx)) {
          bestIdx = idx;
          anchorKind = k;
        }
      }
      if (bestIdx < 0) break;
      let endIdx = -1;
      const limitEnd = Math.min(text.length, bestIdx + 512 * 1024);
      if (anchorKind === 0) {
        const close = text.indexOf('</x:xmpmeta>', bestIdx);
        endIdx = close >= 0 && close < limitEnd ? close + 12 : limitEnd;
      } else if (anchorKind === 1) {
        const close = text.indexOf('<?xpacket end', bestIdx + 9);
        const closeGt = close >= 0 ? text.indexOf('>', close) : -1;
        endIdx = closeGt >= 0 && closeGt < limitEnd ? closeGt + 1 : limitEnd;
      } else {
        const close = text.indexOf('</rdf:RDF>', bestIdx);
        endIdx = close >= 0 && close < limitEnd ? close + 10 : limitEnd;
      }
      nativeArrayPush.call(spans, [bestIdx, endIdx]);
      pos = endIdx;
    }
    return spans;
  }

  function scrubPdfXmpPacket(out, text, spanStart, spanEnd) {
    const packet = text.slice(spanStart, spanEnd);
    let modified = false;

    PDF_XMP_ATTR_RE.lastIndex = 0;
    let attrMatch;
    while ((attrMatch = PDF_XMP_ATTR_RE.exec(packet)) !== null) {
      const valStr = attrMatch[1] !== undefined ? attrMatch[1] : attrMatch[2];
      if (!valStr) {
        continue;
      }
      const valOffset = spanStart + attrMatch.index + attrMatch[0].length - 1 - valStr.length;
      if (blankPdfByteRange(out, valOffset, valOffset + valStr.length)) {
        modified = true;
      }
    }

    PDF_XMP_OPEN_TAG_RE.lastIndex = 0;
    let openMatch;
    while ((openMatch = PDF_XMP_OPEN_TAG_RE.exec(packet)) !== null) {
      if (openMatch[0].endsWith('/>')) {
        continue;
      }
      const tagName = openMatch[1];
      const absContentStart = spanStart + openMatch.index + openMatch[0].length;
      const closeRel = packet.indexOf(`</${tagName}`, openMatch.index + openMatch[0].length);
      if (closeRel < 0) {
        continue;
      }
      const absContentEnd = Math.min(spanEnd, spanStart + closeRel, absContentStart + 16384);
      let inXmlTag = false;
      let i = absContentStart;
      while (i < absContentEnd) {
        if (!inXmlTag && out[i] === 0x3c && text.startsWith('<![CDATA[', i)) {
          const cdataStart = i + 9;
          const cdataClose = text.indexOf(']]>', cdataStart);
          const cdataEnd = cdataClose >= 0 && cdataClose <= absContentEnd ? cdataClose : absContentEnd;
          if (blankPdfByteRange(out, cdataStart, cdataEnd)) {
            modified = true;
          }
          i = cdataClose >= 0 && cdataClose + 3 <= absContentEnd ? cdataClose + 3 : absContentEnd;
          continue;
        }
        if (out[i] === 0x3c) {
          inXmlTag = true;
        } else if (out[i] === 0x3e) {
          inXmlTag = false;
        } else if (!inXmlTag && out[i] !== 0x20 && out[i] !== 0x0a && out[i] !== 0x0d && out[i] !== 0x09) {
          out[i] = 0x20;
          modified = true;
        }
        i += 1;
      }
    }

    return modified;
  }

  function hasPdfDictKeyBoundaryBefore(out, text, idx) {
    if (idx <= 0) {
      return true;
    }
    const prev = out[idx - 1];
    if (
      prev === 0x20 ||
      prev === 0x09 ||
      prev === 0x0a ||
      prev === 0x0d ||
      prev === 0x0c ||
      prev === 0x00 ||
      prev === 0x3c ||
      prev === 0x3e ||
      prev === 0x5d ||
      prev === 0x29 ||
      prev === 0x7d
    ) {
      return true;
    }
    if (prev === 0x52) {
      const lookStart = nativeMathMax(0, idx - 24);
      return /(?:^|[\s<>\[\]()/])\d{1,8}\s+\d{1,5}\s+R$/.test(text.slice(lookStart, idx));
    }
    return false;
  }

  function isInsidePdfLiteralOrComment(out, text, idx) {
    let anchor = 0;
    const minSearch = nativeMathMax(0, idx - 65536);
    const lastEndObj = text.lastIndexOf('endobj', idx);
    if (lastEndObj >= minSearch) {
      const prevByte = lastEndObj > 0 ? out[lastEndObj - 1] : 0x20;
      if (
        lastEndObj === 0 ||
        prevByte === 0x20 ||
        prevByte === 0x0a ||
        prevByte === 0x0d ||
        prevByte === 0x09 ||
        prevByte === 0x3e ||
        prevByte === 0x5d
      ) {
        anchor = nativeMathMax(anchor, lastEndObj + 6);
      }
    }
    const lastTrailer = text.lastIndexOf('trailer', idx);
    if (lastTrailer >= minSearch) {
      const prevByte = lastTrailer > 0 ? out[lastTrailer - 1] : 0x20;
      if (
        lastTrailer === 0 ||
        prevByte === 0x20 ||
        prevByte === 0x0a ||
        prevByte === 0x0d ||
        prevByte === 0x09
      ) {
        anchor = nativeMathMax(anchor, lastTrailer + 7);
      }
    }
    const lastObj = text.lastIndexOf(' obj', idx);
    if (lastObj >= minSearch && lastObj + 4 <= idx) {
      const objHead = text.slice(nativeMathMax(minSearch, lastObj - 20), lastObj + 4);
      if (/(?:^|[\s\r\n])\d{1,8}\s+\d{1,5}\s+obj$/.test(objHead)) {
        anchor = nativeMathMax(anchor, lastObj + 4);
      }
    }
    if (anchor === 0 && idx > 65536) {
      anchor = minSearch;
    }

    let parenDepth = 0;
    let inComment = false;
    for (let p = anchor; p < idx; p += 1) {
      const c = out[p];
      if (inComment) {
        if (c === 0x0a || c === 0x0d) {
          inComment = false;
        }
        continue;
      }
      if (parenDepth > 0) {
        if (c === 0x5c) {
          p += 1;
          continue;
        }
        if (c === 0x28) parenDepth += 1;
        else if (c === 0x29) parenDepth -= 1;
      } else {
        if (c === 0x25) {
          inComment = true;
        } else if (c === 0x28) {
          parenDepth = 1;
        }
      }
    }
    return inComment || parenDepth > 0;
  }

  function stripPdfBytes(bytes, inPlace = false) {
    const latinDecoder = getSharedLatin1Decoder();
    if (!bytes || bytes.byteLength < 16 || bytes.byteLength > MAX_PDF_BYTES || !latinDecoder) {
      return null;
    }
    let hasHeader = false;
    const headerScanLimit = Math.min(1024, bytes.byteLength - 5);
    for (let i = 0; i <= headerScanLimit; i += 1) {
      if (
        bytes[i] === 0x25 &&
        bytes[i + 1] === 0x50 &&
        bytes[i + 2] === 0x44 &&
        bytes[i + 3] === 0x46 &&
        bytes[i + 4] === 0x2d
      ) {
        hasHeader = true;
        break;
      }
    }
    if (!hasHeader) {
      return null;
    }

    let text;
    try {
      text = nativeTextDecode ? nativeTextDecode.call(latinDecoder, bytes) : latinDecoder.decode(bytes);
    } catch {
      return null;
    }
    if (text.length !== bytes.byteLength) {
      return null;
    }

    const out = inPlace ? bytes : new NativeUint8Array(bytes);
    let modified = false;
    const streamRanges = findPdfStreamRanges(text);

    // Collect explicit /Info object numbers from trailer / XRef dictionaries and neutralize /Info & /Metadata refs.
    const explicitInfoObjIds = new NativeSet();
    const infoRefRe = /\/Info\s+(\d{1,8})\s+(\d{1,5})\s+R\b/g;
    let infoRefMatch;
    while ((infoRefMatch = infoRefRe.exec(text)) !== null) {
      const idx = infoRefMatch.index;
      if (
        !isInsideStreamRanges(idx, streamRanges) &&
        hasPdfDictKeyBoundaryBefore(out, text, idx) &&
        !isInsidePdfLiteralOrComment(out, text, idx)
      ) {
        setAdd(explicitInfoObjIds, `${infoRefMatch[1]}:${infoRefMatch[2]}`);
        if (out[idx + 2] !== 0x5f) {
          out[idx + 2] = 0x5f;
          modified = true;
        }
      }
    }

    const metadataRefRe = /\/Metadata\s+(\d{1,8})\s+(\d{1,5})\s+R\b/g;
    let metadataRefMatch;
    while ((metadataRefMatch = metadataRefRe.exec(text)) !== null) {
      const idx = metadataRefMatch.index;
      if (
        !isInsideStreamRanges(idx, streamRanges) &&
        hasPdfDictKeyBoundaryBefore(out, text, idx) &&
        !isInsidePdfLiteralOrComment(out, text, idx)
      ) {
        if (out[idx + 2] !== 0x5f) {
          out[idx + 2] = 0x5f;
          modified = true;
        }
      }
    }

    // Index explicit /Info `N G obj ... endobj` boundaries only when /Info references were found.
    const objIdAtDict = new NativeMap();
    if (setSize(explicitInfoObjIds) > 0) {
      const objHeaderRe = /\b(\d{1,8})\s+(\d{1,5})\s+obj\b/g;
      let objMatch;
      while ((objMatch = objHeaderRe.exec(text)) !== null) {
        const idKey = `${objMatch[1]}:${objMatch[2]}`;
        if (!setHas(explicitInfoObjIds, idKey) || isInsideStreamRanges(objMatch.index, streamRanges)) {
          continue;
        }
        const bodyStart = objMatch.index + objMatch[0].length;
        const endObjIdx = text.indexOf('endobj', bodyStart);
        if (endObjIdx > bodyStart && endObjIdx - bodyStart < 262144) {
          const dictStart = text.indexOf('<<', bodyStart);
          if (dictStart >= bodyStart && dictStart < endObjIdx) {
            mapSet(objIdAtDict, dictStart, idKey);
          }
        }
      }
    }

    // Scan balanced `<< ... >>` dictionaries outside streams.
    const indirectTargets = new NativeSet();
    const indirectTargetsList = [];
    let scanPos = 0;
    while (scanPos < text.length - 1) {
      const dictStart = text.indexOf('<<', scanPos);
      if (dictStart < 0) break;
      if (isInsideStreamRanges(dictStart, streamRanges)) {
        scanPos = dictStart + 2;
        continue;
      }
      let p = dictStart + 2;
      let dictDepth = 1;
      while (p < text.length - 1 && dictDepth > 0 && p - dictStart < 65536) {
        const c = out[p];
        if (c === 0x28) {
          p += 1;
          let sDepth = 1;
          while (p < text.length && sDepth > 0 && p - dictStart < 65536) {
            if (out[p] === 0x5c) {
              p += 2;
              continue;
            }
            if (out[p] === 0x28) sDepth += 1;
            else if (out[p] === 0x29) sDepth -= 1;
            p += 1;
          }
          continue;
        }
        if (c === 0x25) {
          p += 1;
          while (p < text.length && out[p] !== 0x0a && out[p] !== 0x0d) p += 1;
          continue;
        }
        if (c === 0x3c && out[p + 1] === 0x3c) {
          dictDepth += 1;
          p += 2;
          continue;
        }
        if (c === 0x3e && out[p + 1] === 0x3e) {
          dictDepth -= 1;
          p += 2;
          continue;
        }
        p += 1;
      }
      const dictEnd = dictDepth === 0 ? p : Math.min(text.length, dictStart + 65536);
      const explicitId = mapHas(objIdAtDict, dictStart);
      if (scrubPdfDictRegion(out, text, dictStart, dictEnd, explicitId, { set: indirectTargets, list: indirectTargetsList })) {
        modified = true;
      }
      scanPos = dictEnd > dictStart ? dictEnd : dictStart + 2;
    }

    if (setSize(indirectTargets) > 0) {
      const objSpansById = new NativeMap();
      const objHeaderRe = /\b(\d{1,8})\s+(\d{1,5})\s+obj\b/g;
      let objMatch;
      while ((objMatch = objHeaderRe.exec(text)) !== null) {
        const idKey = `${objMatch[1]}:${objMatch[2]}`;
        if (!setHas(indirectTargets, idKey) || isInsideStreamRanges(objMatch.index, streamRanges)) {
          continue;
        }
        const bodyStart = objMatch.index + objMatch[0].length;
        const endObjIdx = text.indexOf('endobj', bodyStart);
        if (endObjIdx > bodyStart && endObjIdx - bodyStart < 262144) {
          mapSet(objSpansById, idKey, [bodyStart, endObjIdx]);
        }
      }
      for (let i = 0; i < indirectTargetsList.length; i += 1) {
        const span = mapGet(objSpansById, indirectTargetsList[i]);
        if (span && blankPdfStringValue(out, text, span[0], span[1], false, null).modified) {
          modified = true;
        }
      }
      mapClear(objSpansById);
    }

    const xmpSpans = collectPdfXmpSpans(text);
    for (let i = 0; i < xmpSpans.length; i += 1) {
      if (scrubPdfXmpPacket(out, text, xmpSpans[i][0], xmpSpans[i][1])) {
        modified = true;
      }
    }

    // Release temporary parser tables and decoded 50 MB string copy promptly.
    text = '';
    streamRanges.length = 0;
    setClear(explicitInfoObjIds);
    mapClear(objIdAtDict);
    setClear(indirectTargets);
    indirectTargetsList.length = 0;

    return modified ? out : null;
  }

  function sniffFormatFromBytes(bytes) {
    if (!bytes || bytes.byteLength < 6) {
      return null;
    }
    if (bytes[0] === 0xff && bytes[1] === 0xd8) {
      return 'jpeg';
    }
    if (
      bytes.byteLength >= 12 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return 'png';
    }
    if (
      bytes.byteLength >= 12 &&
      asciiBytesEquals(bytes, 0, 'RIFF') &&
      asciiBytesEquals(bytes, 8, 'WEBP')
    ) {
      return 'webp';
    }
    if (
      bytes.byteLength >= 14 &&
      (asciiBytesEquals(bytes, 0, 'GIF89a') || asciiBytesEquals(bytes, 0, 'GIF87a'))
    ) {
      return 'gif';
    }
    const headScan = Math.min(bytes.byteLength, 1024);
    for (let i = 0; i <= headScan - 5; i += 1) {
      if (asciiBytesEquals(bytes, i, '%PDF-')) {
        return 'pdf';
      }
    }
    if (hasAvifBrand(bytes, 'avif') || hasAvifBrand(bytes, 'avis')) {
      return 'avif';
    }
    return null;
  }

  async function stripFileMetadataBytes(file) {
    const declFmt = detectExifFormat(file);
    if (!declFmt || !readBlobArrayBuffer) {
      return null;
    }
    try {
      let buf = await readBlobArrayBuffer.call(file);
      let bytes = new NativeUint8Array(buf);
      const inBytes = bytes.byteLength;
      const fmt = sniffFormatFromBytes(bytes) || declFmt;
      let out = null;
      if (fmt === 'jpeg') out = stripJpegBytes(bytes);
      else if (fmt === 'png') out = stripPngBytes(bytes);
      else if (fmt === 'webp') out = stripWebpBytes(bytes);
      else if (fmt === 'gif') out = stripGifBytes(bytes);
      else if (fmt === 'svg') out = stripSvgBytes(bytes);
      else if (fmt === 'pdf') out = stripPdfBytes(bytes, true);
      // Drop input ArrayBuffer references immediately so large media buffers can be reclaimed.
      bytes = null;
      buf = null;
      logDiag('Media', 'stripMetadata', {
        fmt,
        inBytes,
        outBytes: out ? out.byteLength : inBytes,
        stripped: Boolean(out),
      });
      return out;
    } catch {
      logDiag('Media', 'stripMetadata:error', { fmt: declFmt });
      return null;
    }
  }

  // --- Offline Secret & API Key Guard on Paste ---

  const SECRET_RULES = [
    {
      label: 'Private Key',
      re: /-----BEGIN (?:[A-Z0-9 ]+ )?PRIVATE KEY-----[\s\S]{16,8192}?-----END (?:[A-Z0-9 ]+ )?PRIVATE KEY-----/g,
      replace: () => '-----BEGIN PRIVATE KEY-----\n[REDACTED_PRIVATE_KEY]\n-----END PRIVATE KEY-----',
    },
    {
      label: 'Anthropic API Key',
      re: /\bsk-ant-(?:api\d{2}|admin\d{2})-[A-Za-z0-9_-]{20,}\b/g,
      replace: () => '[REDACTED_ANTHROPIC_KEY]',
    },
    {
      label: 'OpenRouter Key',
      re: /\bsk-or-v1-[A-Za-z0-9]{40,}\b/g,
      replace: () => '[REDACTED_OPENROUTER_KEY]',
    },
    {
      label: 'OpenAI API Key',
      re: /\bsk-(?:proj|svcacct|live|test)-[A-Za-z0-9_-]{20,}\b/g,
      replace: () => '[REDACTED_OPENAI_KEY]',
    },
    {
      label: 'OpenAI API Key',
      re: /\bsk-[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{10,}\b/g,
      replace: () => '[REDACTED_OPENAI_KEY]',
    },
    {
      label: 'API Key',
      re: /\bsk-(?=[A-Za-z0-9_-]*[A-Z0-9])[A-Za-z0-9_-]{32,}\b/g,
      replace: () => '[REDACTED_API_KEY]',
    },
    {
      label: 'Google API Key',
      re: /\bAIza[0-9A-Za-z_-]{35}\b/g,
      replace: () => '[REDACTED_GOOGLE_API_KEY]',
    },
    {
      label: 'AWS Access Key ID',
      re: /\b(?:AKIA|ASIA|AROA|AIDA)[0-9A-Z]{16}\b/g,
      replace: () => '[REDACTED_AWS_KEY_ID]',
    },
    {
      label: 'GitHub Token',
      re: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/g,
      replace: () => '[REDACTED_GITHUB_TOKEN]',
    },
    {
      label: 'GitLab Token',
      re: /\bglpat-[A-Za-z0-9_-]{20,}\b/g,
      replace: () => '[REDACTED_GITLAB_TOKEN]',
    },
    {
      label: 'Hugging Face Token',
      re: /\bhf_[A-Za-z0-9]{24,}\b/g,
      replace: () => '[REDACTED_HF_TOKEN]',
    },
    {
      label: 'npm Token',
      re: /\bnpm_[A-Za-z0-9]{30,}\b/g,
      replace: () => '[REDACTED_NPM_TOKEN]',
    },
    {
      label: 'PyPI Token',
      re: /\bpypi-AgEI[A-Za-z0-9_-]{40,}\b/g,
      replace: () => '[REDACTED_PYPI_TOKEN]',
    },
    {
      label: 'SendGrid Key',
      re: /\bSG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
      replace: () => '[REDACTED_SENDGRID_KEY]',
    },
    {
      label: 'Groq Key',
      re: /\bgsk_[A-Za-z0-9]{40,}\b/g,
      replace: () => '[REDACTED_GROQ_KEY]',
    },
    {
      label: 'xAI Key',
      re: /\bxai-[A-Za-z0-9]{40,}\b/g,
      replace: () => '[REDACTED_XAI_KEY]',
    },
    {
      label: 'Stripe Live Key',
      re: /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}\b/g,
      replace: () => '[REDACTED_STRIPE_KEY]',
    },
    {
      label: 'Stripe Webhook Secret',
      re: /\bwhsec_[A-Za-z0-9]{24,}\b/g,
      replace: () => '[REDACTED_STRIPE_WEBHOOK]',
    },
    {
      label: 'Perplexity API Key',
      re: /\bpplx-[A-Za-z0-9]{32,}\b/g,
      replace: () => '[REDACTED_PERPLEXITY_KEY]',
    },
    {
      label: 'Replicate Token',
      re: /\br8_[A-Za-z0-9]{30,}\b/g,
      replace: () => '[REDACTED_REPLICATE_TOKEN]',
    },
    {
      label: 'Supabase Key',
      re: /\b(?:sbp_[a-f0-9]{32,}|sb_secret_[A-Za-z0-9_-]{20,})\b/g,
      replace: () => '[REDACTED_SUPABASE_KEY]',
    },
    {
      label: 'Figma Token',
      re: /\bfigd_[A-Za-z0-9_-]{24,}\b/g,
      replace: () => '[REDACTED_FIGMA_TOKEN]',
    },
    {
      label: 'Linear API Key',
      re: /\blin_api_[A-Za-z0-9]{30,}\b/g,
      replace: () => '[REDACTED_LINEAR_KEY]',
    },
    {
      label: 'Slack Token',
      re: /\bxox(?:e\.xox[bp]-[0-9]-[A-Za-z0-9-]{20,}|[baprs]-[0-9A-Za-z-]{20,})\b/g,
      replace: () => '[REDACTED_SLACK_TOKEN]',
    },
    {
      label: 'Webhook URL',
      re: /https:\/\/(?:hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+|(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+)/gi,
      replace: () => '[REDACTED_WEBHOOK_URL]',
    },
    {
      label: 'JWT Token',
      re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
      replace: () => '[REDACTED_JWT]',
    },
    {
      label: 'URL Credentials',
      re: /([a-z][a-z0-9+.-]{1,12}:\/\/)([^\s:@/]{1,64}):([^\s@/]{3,128})@/gi,
      replace: (_m, scheme) => `${scheme}[REDACTED_CREDENTIALS]@`,
    },
    {
      label: 'Bearer Token',
      re: /(\bAuthorization\s*:\s*Bearer\s+)(?!\[REDACTED)([A-Za-z0-9._~+/=-]{20,})/gi,
      replace: (_m, prefix) => `${prefix}[REDACTED_BEARER_TOKEN]`,
    },
    {
      label: 'Env Secret',
      re: /(\b[A-Z0-9_]{0,32}?(?:AWS_SECRET_ACCESS_KEY|SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|STRIPE_SECRET_KEY|SECRET_KEY|JWT_SECRET|SESSION_SECRET|COOKIE_SECRET|APP_SECRET|API_SECRET|CLIENT_SECRET|PRIVATE_KEY|MASTER_KEY|ENCRYPTION_KEY|ACCESS_TOKEN|REFRESH_TOKEN|AUTH_TOKEN|API_KEY|BOT_TOKEN|WEBHOOK_SECRET|SIGNING_SECRET|(?:OPENAI|GEMINI|ANTHROPIC|CLAUDE)_KEY|(?:DB|DATABASE|POSTGRES|MYSQL|REDIS|SMTP)_PASSWORD)\b["']?\s*[:=]\s*["']?)(?![<\[]|your[_-]|example|changeme|dummy|placeholder|xxx|process\.env\.|import\.meta\.env\.|true\b|false\b|null\b)([A-Za-z0-9._~+/=!@#$%^&*-]{12,256})(["']?)/gi,
      replace: (full, prefix, val, quote) => {
        if (/^(.)\1+$/.test(val)) {
          return full;
        }
        if (val.length < 16 && !/[^A-Za-z]/.test(val)) {
          return full;
        }
        return `${prefix}[REDACTED_SECRET]${quote}`;
      },
    },
    {
      label: 'IBAN',
      re: /\b[A-Z]{2}\d{2}(?:[ -]?[A-Z0-9]){11,30}\b/g,
      replace: (full) => (isValidIban(full) ? '[REDACTED_IBAN]' : full),
    },
    {
      label: 'Card Number',
      re: /(?<![A-Za-z0-9._-])(?:4\d|5[1-5]\d|2(?:2[2-9]\d|[3-6]\d{2}|7(?:[01]\d|20))|3[47]\d|6(?:011|5\d|4[4-9]\d)|3(?:0[0-5]|[68]\d)|35(?:2[89]|[3-8]\d))(?:[ -]?\d){10,17}(?![A-Za-z0-9._-])/g,
      replace: (full, offset, str) => {
        const before = str.slice(Math.max(0, offset - 8), offset);
        if (/\b[A-Z]{2}\d{2}[\s-]+$/.test(before)) {
          return full;
        }
        const digits = full.replace(/\D/g, '');
        if (!isValidCardStructure(digits) || !isValidLuhn(digits)) {
          return full;
        }
        return '[REDACTED_CARD]';
      },
    },
    {
      label: 'High-Entropy Secret',
      re: /(\b[A-Za-z0-9_-]{0,32}?(?:token|secret|passwd|password|pwd|api[-_]?key|credential|signing[-_]?key|master[-_]?key|encryption[-_]?key)\b["']?\s*[:=]\s*["']?)(?![<\[]|REDACTED|your[-_]|example|changeme|dummy|placeholder|process\.env\.|import\.meta\.env\.|https?:\/\/)([A-Za-z0-9._~+/=-]{20,256})(["']?)/gi,
      replace: (full, prefix, val, quote) => {
        if (/^(.)\1+$/.test(val)) {
          return full;
        }
        const hasDigit = /\d/.test(val);
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        if (!((hasDigit && (hasLower || hasUpper)) || (hasUpper && hasLower))) {
          return full;
        }
        if (calcShannonEntropy(val) < 3.4) {
          return full;
        }
        return `${prefix}[REDACTED_HIGH_ENTROPY]${quote}`;
      },
    },
  ];

  function isValidCardStructure(digits) {
    return (
      /^4(?:\d{12}|\d{15}|\d{18})$/.test(digits) ||
      /^(?:5[1-5]\d{14}|2(?:22[1-9]|2[3-9]\d|[3-6]\d{2}|7(?:[01]\d|20))\d{12})$/.test(digits) ||
      /^3[47]\d{13}$/.test(digits) ||
      /^(?:6011|65\d{2}|64[4-9]\d)(?:\d{12}|\d{15})$/.test(digits) ||
      /^3(?:0[0-5]|[68]\d)\d{11}$/.test(digits) ||
      /^35(?:2[89]|[3-8]\d)\d{12}$/.test(digits)
    );
  }

  function isValidLuhn(digits) {
    if (!digits || digits.length < 13 || digits.length > 19 || /^(.)\1+$/.test(digits)) {
      return false;
    }
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i -= 1) {
      let n = digits.charCodeAt(i) - 48;
      if (n < 0 || n > 9) {
        return false;
      }
      if (alt) {
        n *= 2;
        if (n > 9) {
          n -= 9;
        }
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function isValidIban(raw) {
    const compact = String(raw || '').replace(/[\s-]+/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(compact)) {
      return false;
    }
    const rearranged = compact.slice(4) + compact.slice(0, 4);
    let mod = 0;
    for (let i = 0; i < rearranged.length; i += 1) {
      const code = rearranged.charCodeAt(i);
      if (code >= 48 && code <= 57) {
        mod = (mod * 10 + (code - 48)) % 97;
      } else if (code >= 65 && code <= 90) {
        mod = (mod * 100 + (code - 55)) % 97;
      } else {
        return false;
      }
    }
    return mod === 1;
  }

  function calcShannonEntropy(str) {
    if (!str || str.length === 0) {
      return 0;
    }
    const freq = nativeObjCreate ? nativeObjCreate(null) : Object.create(null);
    for (let i = 0; i < str.length; i += 1) {
      const ch = str[i];
      freq[ch] = (freq[ch] || 0) + 1;
    }
    let entropy = 0;
    const keys = nativeObjKeys ? nativeObjKeys(freq) : Object.keys(freq);
    for (let i = 0; i < keys.length; i += 1) {
      const p = freq[keys[i]] / str.length;
      entropy -= p * nativeMathLog2(p);
    }
    return entropy;
  }

  function isPublicOrLanIpv6(candidate) {
    if (!candidate || candidate.indexOf(':::') !== -1) {
      return false;
    }
    const dblParts = candidate.split('::');
    if (dblParts.length > 2) {
      return false;
    }
    let groups = [];
    if (dblParts.length === 1) {
      groups = candidate.split(':');
      if (groups.length !== 8) {
        return false;
      }
    } else {
      const left = dblParts[0] ? dblParts[0].split(':') : [];
      const right = dblParts[1] ? dblParts[1].split(':') : [];
      if (left.length + right.length > 7) {
        return false;
      }
      const missing = 8 - left.length - right.length;
      groups = left.concat(new Array(missing).fill('0'), right);
    }
    for (let i = 0; i < groups.length; i += 1) {
      if (!/^[0-9A-Fa-f]{1,4}$/.test(groups[i])) {
        return false;
      }
    }
    // Exclude unspecified (::) and loopback (::1).
    let allPrevZero = true;
    for (let i = 0; i < 7; i += 1) {
      if (parseInt(groups[i], 16) !== 0) {
        allPrevZero = false;
        break;
      }
    }
    if (allPrevZero) {
      const last = parseInt(groups[7], 16);
      if (last === 0 || last === 1) {
        return false;
      }
    }
    return true;
  }

  const PII_RULES = [
    {
      label: 'Email Address',
      re: /(?<![A-Za-z0-9._%+\-\[\]])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+(?![A-Za-z0-9_-])/g,
      replace: (full, offset, str) => {
        const before = str.slice(Math.max(0, offset - 32), offset);
        if (
          /\[REDACTED_CREDENTIALS\]$/i.test(before) ||
          /[a-z][a-z0-9+.-]{1,12}:\/\/[^\s@/]+:$/.test(before)
        ) {
          return full;
        }
        const tld = full.slice(full.lastIndexOf('.') + 1);
        if (tld.length < 2 || /^\d+$/.test(tld)) {
          return full;
        }
        return '[REDACTED_EMAIL]';
      },
    },
    {
      label: 'IP Address',
      re: /(?<![0-9A-Fa-f:])[0-9A-Fa-f]{0,4}:[0-9A-Fa-f:]{1,38}(?![0-9A-Fa-f:])/g,
      replace: (full) => (isPublicOrLanIpv6(full) ? '[REDACTED_IP]' : full),
    },
    {
      label: 'IP Address',
      re: /(?<![0-9A-Za-z.])(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?![0-9]|\.[0-9])/g,
      replace: (full, offset, str) => {
        const before = str.slice(Math.max(0, offset - 12), offset).toLowerCase();
        if (/(?:^|[\s(/\[])(?:v|ver\.?|version)\s*$/.test(before)) {
          return full;
        }
        const parts = full.split('.').map(Number);
        if (
          parts[0] === 127 ||
          parts[0] === 255 ||
          (parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts[3] === 0)
        ) {
          return full;
        }
        return '[REDACTED_IP]';
      },
    },
    {
      label: 'Phone Number',
      re: /(?<![0-9A-Za-z._+\-])(?:\+[1-9]\d{7,14}|\+[1-9]\d{0,2}(?:[\s.-]+\(?\d{1,4}\)?|\(\d{1,4}\)){1,6}|\(\d{2,4}\)[\s-]?\d{3,4}[\s-]?\d{3,4}|\d{3}[\s-]\d{3}[\s-]\d{3,4})(?![0-9A-Za-z-]|\.[0-9])/g,
      replace: (full) => {
        if (
          /^\d{4}[-.]\d{2}[-.]\d{2}$/.test(full) ||
          /^\d{2}[-.]\d{2}[-.]\d{4}$/.test(full) ||
          /^\d+(?:\.\d+)+$/.test(full)
        ) {
          return full;
        }
        const digits = full.replace(/\D/g, '');
        if (digits.length < 8 || digits.length > 15) {
          return full;
        }
        return '[REDACTED_PHONE]';
      },
    },
  ];

  function makeSafeSecretPreview(rawMatch, label) {
    const val = String(rawMatch || '');
    if (label === 'Private Key') {
      return '-----BEGIN PRIVATE KEY----- •••••••• -----END PRIVATE KEY-----';
    }
    if (label === 'URL Credentials') {
      const schemeIdx = val.indexOf('://');
      const colonIdx = schemeIdx >= 0 ? val.indexOf(':', schemeIdx + 3) : -1;
      if (colonIdx > 0) {
        return `${val.slice(0, colonIdx + 1)}••••••@`;
      }
      return '••••••@';
    }
    if (label === 'Bearer Token') {
      const sp = val.search(/\s+/);
      if (sp > 0) {
        return `${val.slice(0, Math.min(val.length, sp + 8))}••••••••`;
      }
      return 'Bearer ••••••••';
    }
    if (label === 'Env Secret' || label === 'High-Entropy Secret') {
      const sep = val.search(/[:=]/);
      if (sep > 0) {
        return `${val.slice(0, sep + 1)} ••••••••`;
      }
    }
    if (label === 'Card Number') {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 4 ? `•••• •••• •••• ${digits.slice(-4)}` : '•••• ••••';
    }
    if (label === 'IBAN') {
      const compact = val.replace(/[\s-]+/g, '');
      return compact.length >= 8 ? `${compact.slice(0, 4)} •••••• ${compact.slice(-4)}` : '•••• ••••';
    }
    if (label === 'Email Address') {
      const at = val.indexOf('@');
      if (at > 0) {
        return `${val[0]}•••${val.slice(at)}`;
      }
    }
    if (label === 'IP Address') {
      const dot = val.indexOf('.');
      if (dot > 0) {
        return `${val.slice(0, dot)}.•••.•••`;
      }
      const col = val.indexOf(':');
      if (col >= 0) {
        return `${val.slice(0, Math.max(2, col + 1))}••••`;
      }
    }
    if (label === 'Phone Number') {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 4 ? `••• ••• ${digits.slice(-4)}` : '••• ••••';
    }
    if (val.length >= 16) {
      return `${val.slice(0, 4)}••••••••${val.slice(-3)}`;
    }
    return '••••••••';
  }

  function applyRedactionRuleList(segments, rules, counter) {
    let working = segments;
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      const nextSegments = [];
      let anyChanged = false;
      for (let s = 0; s < working.length; s += 1) {
        const seg = working[s];
        if (seg.finding !== null || !seg.currentText) {
          nativeArrayPush.call(nextSegments, seg);
          continue;
        }
        const plain = seg.currentText;
        rule.re.lastIndex = 0;
        let lastPos = 0;
        let segChanged = false;
        let m;
        while ((m = nativeRegExpExec.call(rule.re, plain)) !== null) {
          if (m[0].length === 0) {
            rule.re.lastIndex += 1;
            continue;
          }
          const out = rule.replace(...m, m.index, plain);
          if (out !== m[0]) {
            if (m.index > lastPos) {
              const prefix = plain.slice(lastPos, m.index);
              nativeArrayPush.call(nextSegments, {
                rawText: prefix,
                currentText: prefix,
                finding: null,
              });
            }
            const label = rule.label || 'Secret';
            nativeArrayPush.call(nextSegments, {
              rawText: m[0],
              currentText: out,
              finding: {
                label,
                placeholder: out,
                maskedPreview: makeSafeSecretPreview(m[0], label),
                rawValue: m[0],
                masked: true,
              },
            });
            counter.count += 1;
            lastPos = m.index + m[0].length;
            segChanged = true;
            anyChanged = true;
          }
        }
        if (!segChanged) {
          nativeArrayPush.call(nextSegments, seg);
        } else if (lastPos < plain.length) {
          const tail = plain.slice(lastPos);
          nativeArrayPush.call(nextSegments, {
            rawText: tail,
            currentText: tail,
            finding: null,
          });
        }
      }
      if (anyChanged) {
        working = nextSegments;
      }
    }
    if (working !== segments) {
      segments.length = 0;
      for (let i = 0; i < working.length; i += 1) {
        nativeArrayPush.call(segments, working[i]);
      }
    }
  }

  function buildTextFromSegments(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
      return '';
    }
    let out = '';
    for (let i = 0; i < segments.length; i += 1) {
      const seg = segments[i];
      if (seg.finding) {
        out += seg.finding.masked !== false ? seg.finding.placeholder : seg.finding.rawValue;
      } else {
        out += seg.rawText;
      }
    }
    return out;
  }

  const REDACTED_TAG_RE = /\[REDACTED_[A-Z0-9_]+\]/;
  const REDACTED_TOKEN_GLOBAL_RE = /\[REDACTED_[A-Z0-9_]+(?:_\d+)?\]/g;

  function buildCustomWordsRule(customWordsStr) {
    const normalized = sanitizeCustomWords(customWordsStr);
    if (!normalized) {
      return null;
    }
    const terms = normalized.split(', ').filter((t) => t.length >= 2);
    if (terms.length === 0) {
      return null;
    }
    terms.sort((a, b) => b.length - a.length);
    const makePattern = (unicodeMode) => {
      const wordEdgeRe = unicodeMode ? /^[\p{L}\p{N}_]/u : /^\w/;
      const wordEndRe = unicodeMode ? /[\p{L}\p{N}_]$/u : /\w$/;
      const preBoundary = unicodeMode ? '(?<![\\p{L}\\p{N}_])' : '\\b';
      const postBoundary = unicodeMode ? '(?![\\p{L}\\p{N}_])' : '\\b';
      const escaped = terms.map((t) => {
        const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
        const pre = wordEdgeRe.test(t) ? preBoundary : '';
        const post = wordEndRe.test(t) ? postBoundary : '';
        return `${pre}${esc}${post}`;
      });
      return new NativeRegExp(`(?:${escaped.join('|')})`, unicodeMode ? 'giu' : 'gi');
    };
    let re;
    try {
      re = makePattern(true);
    } catch {
      re = makePattern(false);
    }
    return {
      label: 'Custom Term',
      re,
      replace: () => '[REDACTED_CUSTOM]',
    };
  }

  function extractTokenRawValue(placeholder, baseTag, rawValue) {
    if (baseTag === '[REDACTED_PRIVATE_KEY]') {
      const pemMatch = /^-----BEGIN [A-Z0-9 ]+-----\r?\n?([\s\S]*?)\r?\n?-----END [A-Z0-9 ]+-----$/.exec(
        rawValue
      );
      if (pemMatch && pemMatch[1]) {
        return pemMatch[1].trim();
      }
    }
    if (placeholder === baseTag) {
      return rawValue;
    }
    const tagIdx = placeholder.indexOf(baseTag);
    if (tagIdx < 0) {
      return rawValue;
    }
    const prefix = placeholder.slice(0, tagIdx);
    const suffix = placeholder.slice(tagIdx + baseTag.length);
    if (
      rawValue.startsWith(prefix) &&
      rawValue.endsWith(suffix) &&
      rawValue.length >= prefix.length + suffix.length
    ) {
      return rawValue.slice(prefix.length, rawValue.length - suffix.length);
    }
    return rawValue;
  }

  function setSessionVaultEntry(token, rawValue) {
    if (typeof token !== 'string' || typeof rawValue !== 'string') {
      return;
    }
    if (mapHas(sessionTokenToRaw, token)) {
      const prev = mapGet(sessionTokenToRaw, token);
      if (typeof prev === 'string') {
        sessionVaultChars = Math.max(0, sessionVaultChars - prev.length);
      }
      mapDelete(sessionTokenToRaw, token);
    }
    while (
      mapSize(sessionTokenToRaw) >= MAX_SESSION_VAULT_ENTRIES ||
      (mapSize(sessionTokenToRaw) > 0 &&
        sessionVaultChars + rawValue.length > MAX_SESSION_VAULT_CHARS)
    ) {
      const oldest = mapOldestKey(sessionTokenToRaw);
      if (oldest === undefined) {
        break;
      }
      const oldVal = mapGet(sessionTokenToRaw, oldest);
      if (typeof oldVal === 'string') {
        sessionVaultChars = Math.max(0, sessionVaultChars - oldVal.length);
      }
      mapDelete(sessionTokenToRaw, oldest);
    }
    mapSet(sessionTokenToRaw, token, rawValue);
    sessionVaultChars += rawValue.length;
  }

  function assignConsistentSessionTokens(segments) {
    if (!Array.isArray(segments) || segments.length === 0) {
      return;
    }
    const entries = [];
    for (let i = 0; i < segments.length; i += 1) {
      const seg = segments[i];
      const f = seg.finding;
      if (!f || typeof f.placeholder !== 'string' || typeof f.rawValue !== 'string') {
        continue;
      }
      const m = REDACTED_TAG_RE.exec(f.placeholder);
      if (!m) {
        continue;
      }
      const baseTag = m[0];
      let typeBucket = mapGet(sessionTypeEntities, baseTag);
      if (!typeBucket) {
        typeBucket = { nextIdx: 0, map: new NativeMap() };
        mapSet(sessionTypeEntities, baseTag, typeBucket);
      }
      const entityKey = extractTokenRawValue(f.placeholder, baseTag, f.rawValue);
      let idx;
      if (mapHas(typeBucket.map, entityKey)) {
        idx = mapGet(typeBucket.map, entityKey);
        mapDelete(typeBucket.map, entityKey);
        mapSet(typeBucket.map, entityKey, idx);
      } else {
        if (mapSize(typeBucket.map) >= MAX_TYPE_ENTITIES_CACHE) {
          const oldestEntity = mapOldestKey(typeBucket.map);
          if (oldestEntity !== undefined) {
            mapDelete(typeBucket.map, oldestEntity);
          }
        }
        typeBucket.nextIdx += 1;
        idx = typeBucket.nextIdx;
        mapSet(typeBucket.map, entityKey, idx);
      }
      const numberedTag = `${baseTag.slice(0, -1)}_${idx}]`;
      nativeArrayPush.call(entries, {
        seg,
        finding: f,
        baseTag,
        numberedTag,
        typeBucket,
        entityKey,
      });
    }

    for (let i = 0; i < entries.length; i += 1) {
      const e = entries[i];
      const useNumbered = e.typeBucket.nextIdx >= 2;
      if (useNumbered) {
        const updatedPlaceholder = e.finding.placeholder.replace(e.baseTag, e.numberedTag);
        e.finding.placeholder = updatedPlaceholder;
        e.seg.currentText = updatedPlaceholder;
      }
      setSessionVaultEntry(e.numberedTag, e.entityKey);
      if (!useNumbered) {
        setSessionVaultEntry(e.baseTag, e.entityKey);
      }
    }
  }

  function deTokenizeText(text) {
    if (typeof text !== 'string' || !text || mapSize(sessionTokenToRaw) === 0) {
      return { text, replaced: 0 };
    }
    let replaced = 0;
    const out = text.replace(REDACTED_TOKEN_GLOBAL_RE, (tok) => {
      if (mapHas(sessionTokenToRaw, tok)) {
        replaced += 1;
        const raw = mapGet(sessionTokenToRaw, tok);
        mapDelete(sessionTokenToRaw, tok);
        mapSet(sessionTokenToRaw, tok, raw);
        return raw;
      }
      return tok;
    });
    return { text: out, replaced };
  }

  function clearSessionTokenVault() {
    mapClear(sessionTokenToRaw);
    mapClear(sessionTypeEntities);
    sessionVaultChars = 0;
  }

  function maskSensitiveText(input, opts) {
    if (typeof input !== 'string' || !input || input.length > MAX_SECRET_SCAN_CHARS) {
      return { text: input, count: 0, findings: [], totalFindings: 0, segments: [] };
    }
    const useSecrets = opts ? Boolean(opts.secrets) : Boolean(state.maskSecrets);
    const usePii = opts ? Boolean(opts.pii) : Boolean(state.maskPii);
    const customRule = buildCustomWordsRule(state.customWords);
    const segments = [{ rawText: input, currentText: input, finding: null }];
    const counter = { count: 0 };
    if (useSecrets) {
      applyRedactionRuleList(segments, SECRET_RULES, counter);
    }
    if (usePii) {
      applyRedactionRuleList(segments, PII_RULES, counter);
    }
    if (customRule) {
      applyRedactionRuleList(segments, [customRule], counter);
    }
    if (counter.count > 0) {
      assignConsistentSessionTokens(segments);
    }
    const findings = [];
    let totalFindings = 0;
    for (let i = 0; i < segments.length; i += 1) {
      if (segments[i].finding) {
        totalFindings += 1;
        if (findings.length < 50) {
          nativeArrayPush.call(findings, segments[i].finding);
        }
      }
    }
    const text = counter.count > 0 ? buildTextFromSegments(segments) : input;
    return { text, count: counter.count, findings, totalFindings, segments };
  }

  async function sanitizeTextFileSecrets(file) {
    const hasCustomWords = Boolean(state.customWords && state.customWords.trim());
    if (!state.maskSecrets && !state.maskPii && !hasCustomWords) {
      return null;
    }
    if (!isScannableTextFile(file) || !readBlobArrayBuffer || !sharedTextDecoder || !sharedTextEncoder) {
      return null;
    }
    let buf = null;
    let bytes = null;
    try {
      buf = await readBlobArrayBuffer.call(file);
      bytes = new NativeUint8Array(buf);
      if (bytes.byteLength === 0 || bytes.byteLength > MAX_SECRET_SCAN_CHARS) {
        bytes = null;
        buf = null;
        return null;
      }
      const probeLen = nativeMathMin(bytes.byteLength, 4096);
      for (let i = 0; i < probeLen; i += 1) {
        if (bytes[i] === 0x00) {
          bytes = null;
          buf = null;
          return null;
        }
      }
      let rawText = nativeTextDecode
        ? nativeTextDecode.call(sharedTextDecoder, bytes)
        : sharedTextDecoder.decode(bytes);
      bytes = null;
      buf = null;
      const res = maskSensitiveText(rawText, {
        secrets: state.maskSecrets,
        pii: state.maskPii,
      });
      if (!res || res.count <= 0 || res.text === rawText) {
        rawText = '';
        return null;
      }
      const encodedBytes = nativeTextEncode
        ? nativeTextEncode.call(sharedTextEncoder, res.text)
        : sharedTextEncoder.encode(res.text);
      return {
        bytes: encodedBytes,
        maskedCount: res.count,
        findings: res.findings,
        rawText,
        maskedText: res.text,
      };
    } catch {
      return null;
    } finally {
      bytes = null;
      buf = null;
    }
  }

  function logDiag(area, step, payload) {
    if (!state.debugLogs || !nativeConsoleLog) {
      return;
    }
    try {
      nativeConsoleLog(`[ClipZero:${area}] ${step} ${nativeJsonStringify(payload)}`);
    } catch {
      try {
        nativeConsoleLog(`[ClipZero:${area}] ${step}`, payload);
      } catch {
        // Ignore console serialization errors.
      }
    }
  }

  function clearOneTimeRawBypass(reason) {
    if (!pendingRawPasteBypass) {
      return;
    }
    logDiag('Secrets', 'bypass:clear', {
      reason: typeof reason === 'string' ? reason : 'cleanup',
      rawLen: pendingRawPasteBypass.rawText ? pendingRawPasteBypass.rawText.length : 0,
    });
    if (pendingRawPasteBypass.timer !== null) {
      nativeClearTimeout(pendingRawPasteBypass.timer);
      pendingRawPasteBypass.timer = null;
    }
    pendingRawPasteBypass.rawText = '';
    pendingRawPasteBypass = null;
  }

  function armOneTimeRawBypass(rawText) {
    clearOneTimeRawBypass('replaced');
    if (!rawText) {
      return;
    }
    const entry = {
      rawText,
      timer: nativeSetTimeout(() => {
        if (pendingRawPasteBypass === entry) {
          clearOneTimeRawBypass('ttl-expired');
        }
      }, 25000),
    };
    pendingRawPasteBypass = entry;
    logDiag('Secrets', 'bypass:armed', { rawLen: rawText.length, ttlMs: 25000 });
  }

  function consumeOneTimeRawBypass(rawText) {
    if (!pendingRawPasteBypass || pendingRawPasteBypass.rawText !== rawText) {
      return false;
    }
    clearOneTimeRawBypass('consumed');
    return true;
  }

  function clearEphemeralSecretDraft(reason) {
    if (reason && typeof reason === 'object' && reason.type === 'pagehide') {
      clearOneTimeRawBypass('pagehide');
      clearSessionTokenVault();
    }
    if (!ephemeralSecretDraft) {
      return;
    }
    logDiag('Secrets', 'draft:clear', {
      reason: typeof reason === 'string' ? reason : reason && reason.type ? reason.type : 'unknown',
      hadFindings: ephemeralSecretDraft.findings ? ephemeralSecretDraft.findings.length : 0,
    });
    if (ephemeralSecretDraft.expiryTimer !== null) {
      nativeClearTimeout(ephemeralSecretDraft.expiryTimer);
      ephemeralSecretDraft.expiryTimer = null;
    }
    ephemeralSecretDraft.rawText = '';
    ephemeralSecretDraft.maskedText = '';
    ephemeralSecretDraft.findings = [];
    ephemeralSecretDraft.segments = [];
    ephemeralSecretDraft.targetEditable = null;
    ephemeralSecretDraft = null;
  }

  function setEphemeralSecretDraft(draft, ttlMs) {
    clearEphemeralSecretDraft('replaced-by-new-draft');
    const entry = {
      rawText: draft.rawText,
      maskedText: draft.maskedText,
      findings: draft.findings,
      totalFindings:
        typeof draft.totalFindings === 'number'
          ? draft.totalFindings
          : draft.findings
            ? draft.findings.length
            : 0,
      segments: Array.isArray(draft.segments) ? draft.segments : [],
      targetEditable: draft.targetEditable,
      expiryTimer: nativeSetTimeout(() => {
        if (ephemeralSecretDraft === entry) {
          clearEphemeralSecretDraft('ttl-expired');
        }
      }, ttlMs || 30000),
    };
    ephemeralSecretDraft = entry;
    return entry;
  }

  function showSecretsToast(maskedCount, draftEntry) {
    if (!state.showToast || maskedCount <= 0) {
      return;
    }
    const actionSpec =
      draftEntry && draftEntry.findings && draftEntry.findings.length > 0
        ? {
            label: i18n.toastSecretsReviewBtn,
            onAction: () => {
              logDiag('Secrets', 'toast:click-review', {
                activeEl: describeDomNode(document.activeElement),
                targetEditable: describeDomNode(draftEntry.targetEditable),
                rootEditHost: describeDomNode(resolveEditingHost(draftEntry.targetEditable)),
              });
              openSecretReviewModal(draftEntry);
            },
          }
        : null;
    showToastNotice(
      i18n.secretsMaskedTitle,
      `${maskedCount} ${i18n.secretsMaskedSub}`,
      actionSpec ? 8000 : 2300,
      actionSpec
    );
  }

  function isSkippableCompactCode(code) {
    return (
      code === 0x0d ||
      code === 0x0a ||
      (code >= 0x200b && code <= 0x200d) ||
      code === 0x2060 ||
      code === 0xfeff
    );
  }

  function resolveEditingHost(node) {
    let cur = node && node.nodeType === 3 ? node.parentElement : node;
    while (cur && cur.nodeType === 1 && cur !== document.documentElement) {
      if (cur.isContentEditable) {
        let host = cur;
        while (
          host.parentElement &&
          host.parentElement !== document.documentElement &&
          host.parentElement.isContentEditable
        ) {
          host = host.parentElement;
        }
        return host;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  function describeDomNode(node) {
    if (!state.debugLogs || !node) {
      return null;
    }
    const el = node.nodeType === 3 ? node.parentElement : node;
    if (!el || el.nodeType !== 1) {
      return { nodeType: node.nodeType, textLen: (node.nodeValue || '').length };
    }
    const cls = typeof el.className === 'string' ? el.className : '';
    const ancestors = [];
    let p = el.parentElement;
    let depth = 0;
    while (p && depth < 4 && p !== document.body && p !== document.documentElement) {
      ancestors.push({
        tag: p.tagName,
        ceAttr: p.getAttribute ? p.getAttribute('contenteditable') : null,
        isCE: Boolean(p.isContentEditable),
        cls: typeof p.className === 'string' ? p.className.slice(0, 60) : '',
      });
      p = p.parentElement;
      depth += 1;
    }
    return {
      tag: el.tagName,
      id: el.id || '',
      cls: cls.slice(0, 80),
      connected: Boolean(el.isConnected),
      isCE: Boolean(el.isContentEditable),
      ceAttr: el.getAttribute ? el.getAttribute('contenteditable') : null,
      childCount: el.children ? el.children.length : 0,
      textLen: (el.textContent || '').length,
      ancestors,
    };
  }

  function collectCompactText(container, collapseWhitespace, includeDiag) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let compactText = '';
    const charCoords = [];
    const specialChars = includeDiag ? new NativeSet() : null;
    let textNodeCount = 0;
    let prevWasSpace = false;
    let node;
    while ((node = walker.nextNode())) {
      textNodeCount += 1;
      const val = node.nodeValue || '';
      for (let i = 0; i < val.length; i += 1) {
        const ch = val[i];
        const code = ch.charCodeAt(0);
        if (
          specialChars &&
          (code === 0x00a0 ||
            (code >= 0x200b && code <= 0x200f) ||
            code === 0x2060 ||
            code === 0xfeff ||
            code === 0x2013 ||
            code === 0x2014 ||
            code === 0x09)
        ) {
          setAdd(specialChars, `U+${code.toString(16).toUpperCase().padStart(4, '0')}`);
        }
        if (isSkippableCompactCode(code)) {
          continue;
        }
        const normalized = ch === '\u00a0' || (collapseWhitespace && ch === '\t') ? ' ' : ch;
        if (collapseWhitespace && normalized === ' ') {
          if (prevWasSpace) {
            continue;
          }
          prevWasSpace = true;
        } else {
          prevWasSpace = false;
        }
        compactText += normalized;
        charCoords.push({ node, start: i, end: i + 1 });
      }
    }
    return { compactText, charCoords, specialChars, textNodeCount };
  }

  function normalizeNeedleCompact(needle, collapseWhitespace) {
    const str = String(needle || '');
    let out = '';
    let prevWasSpace = false;
    for (let i = 0; i < str.length; i += 1) {
      const ch = str[i];
      const code = ch.charCodeAt(0);
      if (isSkippableCompactCode(code)) {
        continue;
      }
      const normalized = ch === '\u00a0' || (collapseWhitespace && ch === '\t') ? ' ' : ch;
      if (collapseWhitespace && normalized === ' ') {
        if (prevWasSpace) {
          continue;
        }
        prevWasSpace = true;
      } else {
        prevWasSpace = false;
      }
      out += normalized;
    }
    return out;
  }

  function debugCheckTextPresent(container, expectedText) {
    if (!container || !container.isConnected) {
      return { hostConnected: false, expectedPresent: false, stillHasRedactedMarker: null };
    }
    const { compactText } = collectCompactText(container, true);
    const compactExpected = normalizeNeedleCompact(expectedText, true);
    const expectedPresent = Boolean(compactExpected && compactText.includes(compactExpected));
    const childSummary = [];
    if (container.children) {
      const limit = Math.min(container.children.length, 24);
      for (let i = 0; i < limit; i += 1) {
        const ch = container.children[i];
        childSummary.push(`${ch.tagName}(${(ch.textContent || '').length})`);
      }
    }
    const breakNodeCount =
      typeof container.querySelectorAll === 'function'
        ? container.querySelectorAll('br, p, div').length
        : 0;
    return {
      hostConnected: true,
      hostTextLen: (container.textContent || '').length,
      expectedPresent,
      stillHasRedactedMarker: /\[REDACTED_/.test(container.textContent || ''),
      breakNodeCount,
      childSummary,
    };
  }

  // Safely diagnoses masked-text vs DOM-text differences without ever logging unmasked secrets.
  function debugInspectEditableMatch(container, maskedText) {
    if (!container || !container.isConnected) {
      return { ok: false, reason: 'container-detached-or-null' };
    }
    const compactNeedle = normalizeNeedleCompact(maskedText, false);
    const { compactText, specialChars, textNodeCount } = collectCompactText(container, false, true);
    const idx = compactText.lastIndexOf(compactNeedle);
    if (idx >= 0) {
      return {
        matched: true,
        idx,
        compactNeedleLen: compactNeedle.length,
        compactTextLen: compactText.length,
        textNodeCount,
        specialChars: Array.from(specialChars),
      };
    }

    const lines = String(maskedText || '')
      .split(/\r?\n/)
      .filter((line) => line.length > 0);
    const lineChecks = lines.map((line, i) => {
      const cleanLine = normalizeNeedleCompact(line, false);
      return {
        lineIndex: i,
        len: cleanLine.length,
        foundInDom: compactText.includes(cleanLine),
      };
    });

    const anchor = lines.length > 0 ? normalizeNeedleCompact(lines[0], false) : '';
    const anchorOffset = anchor ? Math.max(0, compactText.lastIndexOf(anchor)) : 0;
    let firstDiff = null;
    const maxCheck = Math.min(compactNeedle.length, compactText.length - anchorOffset);
    for (let i = 0; i < maxCheck; i += 1) {
      const domIdx = anchorOffset + i;
      if (compactNeedle[i] !== compactText[domIdx]) {
        firstDiff = {
          anchorOffset,
          atNeedleIdx: i,
          atDomIdx: domIdx,
          needleCode: compactNeedle.charCodeAt(i),
          domCode: compactText.charCodeAt(domIdx),
        };
        break;
      }
    }

    const childSummary = [];
    if (container.children) {
      const maxChildren = Math.min(container.children.length, 20);
      for (let i = 0; i < maxChildren; i += 1) {
        const chEl = container.children[i];
        childSummary.push(`${chEl.tagName}(${(chEl.textContent || '').length})`);
      }
    }

    return {
      matched: false,
      compactNeedleLen: compactNeedle.length,
      compactTextLen: compactText.length,
      textNodeCount,
      childSummary,
      specialChars: Array.from(specialChars),
      lineChecks,
      firstDiff,
    };
  }

  function isQuillEditor(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }
    if (el.classList && el.classList.contains('ql-editor')) {
      return true;
    }
    if (typeof el.closest === 'function' && el.closest('.ql-container')) {
      return true;
    }
    return false;
  }

  function findEditableTarget(node) {
    let cur = node && node.nodeType === 3 ? node.parentElement : node;
    while (cur && cur.nodeType === 1) {
      if (
        (NativeHTMLTextAreaElement && cur instanceof NativeHTMLTextAreaElement) ||
        (NativeHTMLInputElement &&
          cur instanceof NativeHTMLInputElement &&
          /^(?:text|search|url|email|password|tel|)$/i.test(cur.type || ''))
      ) {
        return cur.readOnly || cur.disabled ? null : cur;
      }
      if (cur.isContentEditable) {
        return resolveEditingHost(cur);
      }
      cur = cur.parentElement;
    }
    const active = document.activeElement;
    if (active && active !== document.body && active !== document.documentElement) {
      if (
        (NativeHTMLTextAreaElement && active instanceof NativeHTMLTextAreaElement) ||
        (NativeHTMLInputElement && active instanceof NativeHTMLInputElement)
      ) {
        return active.readOnly || active.disabled ? null : active;
      }
      if (active.isContentEditable) {
        return resolveEditingHost(active);
      }
    }
    return null;
  }

  function insertParagraphLinesIntoQuill(editable, lines) {
    const sel = window.getSelection();
    const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    const isRangeInsideEditable = Boolean(
      range && editable && editable.contains(range.startContainer)
    );

    if (!isRangeInsideEditable) {
      let lastP = null;
      let lastText = null;
      for (let i = 0; i < lines.length; i += 1) {
        const p = document.createElement('p');
        if (lines[i]) {
          lastText = document.createTextNode(lines[i]);
          p.appendChild(lastText);
        } else {
          lastText = null;
          p.appendChild(document.createElement('br'));
        }
        editable.appendChild(p);
        lastP = p;
      }
      if (sel && lastP) {
        const r = document.createRange();
        if (lastText) {
          r.setStart(lastText, lastText.nodeValue.length);
        } else {
          r.setStart(lastP, 0);
        }
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      }
      return;
    }

    range.deleteContents();
    let currentP =
      range.startContainer && range.startContainer.nodeType === 3
        ? range.startContainer.parentElement
        : range.startContainer;
    while (currentP && currentP.parentElement && currentP.parentElement !== editable) {
      currentP = currentP.parentElement;
    }

    // Ensure insertion always lands inside a <p> child of .ql-editor rather than bare #text/<br>.
    if (!currentP || currentP === editable || currentP.parentElement !== editable) {
      const targetP = document.createElement('p');
      const offset = Math.min(range.startOffset, editable.childNodes.length);
      editable.insertBefore(targetP, editable.childNodes[offset] || null);
      currentP = targetP;
      range.setStart(currentP, 0);
      range.collapse(true);
    }

    const afterRange = document.createRange();
    afterRange.setStart(range.endContainer, range.endOffset);
    afterRange.setEnd(currentP, currentP.childNodes.length);
    const trailingFrag = afterRange.extractContents();
    const hasMeaningfulTrailing = Boolean(
      (trailingFrag.textContent || '') ||
        (typeof trailingFrag.querySelector === 'function' &&
          trailingFrag.querySelector('img,video,canvas,svg'))
    );

    if (!(currentP.textContent || '') && !currentP.querySelector('img,video,canvas,svg')) {
      currentP.textContent = '';
    }

    let lastP = currentP;
    let lastText = null;
    if (lines[0]) {
      lastText = document.createTextNode(lines[0]);
      currentP.appendChild(lastText);
    } else if (!currentP.firstChild) {
      currentP.appendChild(document.createElement('br'));
    }

    for (let i = 1; i < lines.length; i += 1) {
      const nextP = document.createElement('p');
      if (lines[i]) {
        lastText = document.createTextNode(lines[i]);
        nextP.appendChild(lastText);
      } else {
        lastText = null;
        nextP.appendChild(document.createElement('br'));
      }
      editable.insertBefore(nextP, lastP.nextSibling);
      lastP = nextP;
    }

    const caretRange = document.createRange();
    if (lastText) {
      caretRange.setStart(lastText, lastText.nodeValue.length);
    } else {
      caretRange.setStart(lastP, 0);
    }
    caretRange.collapse(true);

    if (hasMeaningfulTrailing) {
      if (!(lastP.textContent || '') && !lastP.querySelector('img,video,canvas,svg')) {
        lastP.textContent = '';
        caretRange.setStart(lastP, 0);
        caretRange.collapse(true);
      }
      lastP.appendChild(trailingFrag);
    }

    if (sel) {
      sel.removeAllRanges();
      sel.addRange(caretRange);
    }
  }

  function insertTextWithLineBreaksIntoContentEditable(editable, text) {
    const lines = text.split(/\r?\n/);
    if (isQuillEditor(editable)) {
      insertParagraphLinesIntoQuill(editable, lines);
      return;
    }
    const frag = document.createDocumentFragment();
    for (let i = 0; i < lines.length; i += 1) {
      if (i > 0) {
        frag.appendChild(document.createElement('br'));
      }
      if (lines[i]) {
        frag.appendChild(document.createTextNode(lines[i]));
      }
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(frag);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editable.appendChild(frag);
    }
  }

  function setTextControlValueAndCaret(control, nextVal, caret) {
    const desc =
      NativeHTMLTextAreaElement && control instanceof NativeHTMLTextAreaElement
        ? textAreaValueDescriptor
        : inputValueDescriptor;
    if (desc && typeof desc.set === 'function') {
      desc.set.call(control, nextVal);
    } else {
      control.value = nextVal;
    }
    if (typeof control.setSelectionRange === 'function') {
      control.setSelectionRange(caret, caret);
    }
  }

  function dispatchSyntheticInputEvent(target, inputType, data) {
    const ev = NativeInputEvent
      ? new NativeInputEvent('input', {
          bubbles: true,
          cancelable: false,
          composed: true,
          inputType,
          data,
        })
      : new NativeEvent('input', { bubbles: true, cancelable: false, composed: true });
    dispatchEventSafe(target, ev);
  }

  function dispatchSyntheticTextPaste(target, text) {
    if (typeof NativeClipboardEvent !== 'function' || !target) {
      return null;
    }
    const dt = new NativeDataTransfer();
    safeDtSetData(dt, 'text/plain', text);
    const synthetic = new NativeClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      composed: true,
      clipboardData: dt,
    });
    const synClip = getClipboardData(synthetic);
    if (!synClip || safeDtGetData(synClip, 'text/plain') !== text) {
      overrideEventTransfer(synthetic, 'clipboardData', dt);
    }
    markSyntheticEvent(synthetic);
    return dispatchEventSafe(target, synthetic);
  }

  function insertMaskedText(event, maskedText) {
    const rawTarget = getEventPathTarget(event);
    const editable = findEditableTarget(rawTarget);
    const rawElement =
      rawTarget && rawTarget.nodeType === 3 ? rawTarget.parentElement : rawTarget;
    const dispatchTarget =
      (rawElement && rawElement.isConnected ? rawElement : null) ||
      editable ||
      document.activeElement;

    haltEvent(event);

    // First re-dispatch a clean synthetic paste carrying only masked text/plain so rich editors
    // (ProseMirror, ChatGPT, Claude) handle newlines/Markdown natively if they intercept paste.
    // Skip on Quill (.ql-editor) because Quill's onPaste steals focus and schedules an async deletion.
    if (!isQuillEditor(editable) && dispatchTarget && typeof NativeClipboardEvent === 'function') {
      const notCanceled = dispatchSyntheticTextPaste(dispatchTarget, maskedText);
      logDiag('Secrets', '2:insertMaskedText:syntheticPaste', {
        dispatchTarget: describeDomNode(dispatchTarget),
        notCanceled,
        defaultPrevented: !notCanceled,
      });
      if (notCanceled === false) {
        return true;
      }
    }

    if (!editable) {
      return false;
    }

    try {
      if (document.activeElement !== editable && typeof editable.focus === 'function') {
        editable.focus();
      }
    } catch {
      // Ignore focus errors cleanly.
    }

    const isTextField =
      (NativeHTMLTextAreaElement && editable instanceof NativeHTMLTextAreaElement) ||
      (NativeHTMLInputElement && editable instanceof NativeHTMLInputElement);

    let inserted = false;
    // Prefer line-preserving fragment/textarea fallback when multiline text targets contentEditable.
    if (isTextField || !/\r?\n/.test(maskedText)) {
      try {
        if (typeof document.execCommand === 'function') {
          inserted = document.execCommand('insertText', false, maskedText);
        }
      } catch {
        inserted = false;
      }
    }

    if (!inserted) {
      if (isTextField) {
        const start = typeof editable.selectionStart === 'number' ? editable.selectionStart : editable.value.length;
        const end = typeof editable.selectionEnd === 'number' ? editable.selectionEnd : editable.value.length;
        const nextVal = `${editable.value.slice(0, start)}${maskedText}${editable.value.slice(end)}`;
        setTextControlValueAndCaret(editable, nextVal, start + maskedText.length);
      } else if (editable.isContentEditable) {
        insertTextWithLineBreaksIntoContentEditable(editable, maskedText);
      }
      dispatchSyntheticInputEvent(editable, 'insertFromPaste', maskedText);
    }

    logDiag('Secrets', '2b:insertMaskedText:fallbackUsed', {
      insertedViaExecCommand: inserted,
      isTextField,
      editable: describeDomNode(editable),
    });
    return true;
  }

  function findRangeWithMode(editable, needle, collapseWhitespace) {
    const compactNeedle = normalizeNeedleCompact(needle, collapseWhitespace);
    if (!compactNeedle || !editable) {
      return null;
    }
    const { compactText, charCoords } = collectCompactText(editable, collapseWhitespace);
    const idx = compactText.lastIndexOf(compactNeedle);
    if (idx < 0 || idx + compactNeedle.length - 1 >= charCoords.length) {
      return null;
    }
    const startCoord = charCoords[idx];
    const endCoord = charCoords[idx + compactNeedle.length - 1];
    const range = document.createRange();
    range.setStart(startCoord.node, startCoord.start);
    range.setEnd(endCoord.node, endCoord.end);
    return range;
  }

  function findCompactRangeInEditable(editable, needle) {
    return (
      findRangeWithMode(editable, needle, false) ||
      findRangeWithMode(editable, needle, true)
    );
  }

  function recoverEditableIfDetached(maskedText) {
    const candidates = document.querySelectorAll('textarea, [contenteditable="true"], [contenteditable=""]');
    for (let i = 0; i < candidates.length; i += 1) {
      const cand = candidates[i];
      if (!cand || !cand.isConnected) {
        continue;
      }
      if (cand instanceof NativeHTMLTextAreaElement) {
        const normNeedle = String(maskedText || '').replace(/\r\n?/g, '\n');
        const normVal = String(cand.value || '').replace(/\r\n?/g, '\n');
        if (normVal.includes(normNeedle)) {
          return cand;
        }
      } else if (cand.isContentEditable && findCompactRangeInEditable(cand, maskedText)) {
        return resolveEditingHost(cand);
      }
    }
    return null;
  }

  function measureTextOffsetInHost(host, targetContainer, targetOffset) {
    if (!host || !targetContainer) {
      return 0;
    }
    try {
      const preRange = document.createRange();
      preRange.selectNodeContents(host);
      preRange.setEnd(targetContainer, targetOffset);
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      let count = 0;
      let node;
      while ((node = walker.nextNode())) {
        if (node === targetContainer) {
          return count + Math.min(targetOffset, node.nodeValue ? node.nodeValue.length : 0);
        }
        const cmp = preRange.comparePoint(node, 0);
        if (cmp > 0) {
          break;
        }
        const len = node.nodeValue ? node.nodeValue.length : 0;
        const endCmp = preRange.comparePoint(node, len);
        if (endCmp <= 0) {
          count += len;
        } else {
          // targetContainer is an Element splitting mid-TextNode (rare, clamp safely).
          count += len;
          break;
        }
      }
      return count;
    } catch {
      return 0;
    }
  }

  function createCollapsedRangeAtTextOffset(host, targetOffset) {
    const r = document.createRange();
    if (!host) {
      return r;
    }
    const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    let seen = 0;
    let lastText = null;
    let node;
    while ((node = walker.nextNode())) {
      const len = node.nodeValue ? node.nodeValue.length : 0;
      lastText = node;
      if (targetOffset <= seen + len) {
        r.setStart(node, Math.max(0, targetOffset - seen));
        r.collapse(true);
        return r;
      }
      seen += len;
    }
    if (lastText) {
      const endLen = lastText.nodeValue ? lastText.nodeValue.length : 0;
      r.setStart(lastText, endLen);
      r.collapse(true);
      return r;
    }
    let block =
      typeof host.querySelector === 'function'
        ? host.querySelector('p') || host.querySelector('div')
        : null;
    while (
      block &&
      block.firstElementChild &&
      /^(P|DIV)$/i.test(block.firstElementChild.tagName)
    ) {
      block = block.firstElementChild;
    }
    r.setStart(block || host, 0);
    r.collapse(true);
    return r;
  }

  function dispatchContentEditableReplacement(editable, range, maskedText, rawText) {
    if (!editable || !editable.isConnected) {
      logDiag('Secrets', '5d:restore:FAILED-detached-before-dispatch', {});
      return;
    }
    const normalizedRaw = String(rawText || '').replace(/\r\n?/g, '\n');
    const quillMode = isQuillEditor(editable);
    const sel = window.getSelection();
    if (!quillMode && sel) {
      // Ensure full range is actively selected right before dispatch even if focus moved caret.
      const freshRange = findCompactRangeInEditable(editable, maskedText) || range;
      sel.removeAllRanges();
      sel.addRange(freshRange);
      range = freshRange;
    }
    logDiag('Secrets', '5e:restore:range-selected', {
      activeAfterFocus: describeDomNode(document.activeElement),
      quillMode,
      selRangeCount: sel ? sel.rangeCount : 0,
      selTextLen: sel ? sel.toString().length : 0,
    });

    let replaced = false;
    let syntheticPrevented = false;
    let execCommandOk = false;
    let syncAfterExecLen = null;
    let syncAfterExecPresent = null;

    if (!quillMode && typeof NativeClipboardEvent === 'function') {
      const startEl =
        range && range.startContainer
          ? range.startContainer.nodeType === 3
            ? range.startContainer.parentElement
            : range.startContainer
          : null;
      const syntheticTarget =
        startEl && startEl.isConnected && editable.contains(startEl) ? startEl : editable;
      const notCanceled = dispatchSyntheticTextPaste(syntheticTarget, rawText);
      if (notCanceled === false) {
        replaced = true;
        syntheticPrevented = true;
      }
    }

    const activeRange = findCompactRangeInEditable(editable, maskedText) || range;
    const findDirectChild = (node) => {
      let cur = node && node.nodeType === 3 ? node.parentElement : node;
      while (cur && cur.parentElement && cur.parentElement !== editable) {
        cur = cur.parentElement;
      }
      return cur && cur.parentElement === editable ? cur : null;
    };
    const initialStartBlock = activeRange ? findDirectChild(activeRange.startContainer) : null;
    const initialEndBlock = activeRange ? findDirectChild(activeRange.endContainer) : null;
    const isSingleLine = !/\n/.test(normalizedRaw);

    if (
      !quillMode &&
      !replaced &&
      isSingleLine &&
      initialStartBlock === initialEndBlock &&
      normalizedRaw &&
      typeof document.execCommand === 'function'
    ) {
      try {
        if (document.activeElement !== editable && typeof editable.focus === 'function') {
          editable.focus();
        }
        const supported =
          typeof document.queryCommandSupported === 'function'
            ? document.queryCommandSupported('insertText')
            : true;
        if (supported) {
          replaced = document.execCommand('insertText', false, normalizedRaw);
          execCommandOk = Boolean(replaced);
          if (execCommandOk) {
            const syncCheck = debugCheckTextPresent(editable, normalizedRaw);
            syncAfterExecLen = syncCheck.hostTextLen;
            syncAfterExecPresent = syncCheck.expectedPresent;
            if (!syncCheck.expectedPresent && syncCheck.stillHasRedactedMarker) {
              replaced = false;
              execCommandOk = false;
            }
          }
        }
      } catch {
        replaced = false;
        execCommandOk = false;
      }
    }

    if (replaced) {
      logDiag('Secrets', '5f:restore:dispatched', {
        syntheticPrevented,
        execCommandOk,
        domFallbackUsed: false,
        syncAfterExecLen,
        syncAfterExecPresent,
      });
      if (state.debugLogs) {
        nativeSetTimeout(() => {
          logDiag('Secrets', '5g:restore:postCheck80ms', debugCheckTextPresent(editable, normalizedRaw));
        }, 80);
      }
      return;
    }

    // Two-phase DOM fallback: delete the cross-block masked range, normalize Quill to a single
    // empty <p><br></p> when cleared, collapse selection + notify selectionchange, and wait
    // briefly so rich editors reconcile their Delta/selection before inserting unmasked text.
    const savedPrefixLen = measureTextOffsetInHost(
      editable,
      activeRange.startContainer,
      activeRange.startOffset
    );
    const startBlock = initialStartBlock;
    const endBlock = initialEndBlock;

    activeRange.deleteContents();

    if (
      endBlock &&
      endBlock !== startBlock &&
      endBlock.isConnected &&
      endBlock.parentElement === editable &&
      !(endBlock.textContent || '') &&
      !endBlock.querySelector('img,video,canvas,svg')
    ) {
      endBlock.remove();
    }

    if (
      startBlock &&
      startBlock.isConnected &&
      startBlock.parentElement === editable &&
      (startBlock !== endBlock || activeRange.startContainer === editable) &&
      !(startBlock.textContent || '') &&
      !startBlock.querySelector('img,video,canvas,svg')
    ) {
      startBlock.textContent = '';
    }

    let quillEmptyBlock = null;
    if (
      quillMode &&
      (editable.textContent || '').length === 0 &&
      !editable.querySelector('img,video,canvas,svg')
    ) {
      let kept =
        startBlock && startBlock.isConnected && startBlock.parentElement === editable
          ? startBlock
          : editable.querySelector('p');
      const extraChildren = editable.children ? Array.from(editable.children) : [];
      for (let i = 0; i < extraChildren.length; i += 1) {
        if (extraChildren[i] !== kept) {
          extraChildren[i].remove();
        }
      }
      if (!kept || !kept.isConnected) {
        kept = document.createElement('p');
        editable.appendChild(kept);
      }
      kept.textContent = '';
      kept.appendChild(document.createElement('br'));
      quillEmptyBlock = kept;
    }

    const collapseAfterDeleteRange = () => {
      const targetEmptyBlock =
        quillEmptyBlock && quillEmptyBlock.isConnected && quillEmptyBlock.parentElement === editable
          ? quillEmptyBlock
          : startBlock &&
              startBlock.isConnected &&
              startBlock.parentElement === editable &&
              !(startBlock.textContent || '') &&
              !startBlock.querySelector('img,video,canvas,svg')
            ? startBlock
            : null;
      if (targetEmptyBlock) {
        const r = document.createRange();
        r.setStart(targetEmptyBlock, 0);
        r.collapse(true);
        return r;
      }
      return createCollapsedRangeAtTextOffset(editable, savedPrefixLen);
    };

    const collapsedSel = window.getSelection();
    if (collapsedSel) {
      collapsedSel.removeAllRanges();
      collapsedSel.addRange(collapseAfterDeleteRange());
    }
    try {
      document.dispatchEvent(new NativeEvent('selectionchange'));
    } catch {
      // Ignore synthetic selectionchange restrictions.
    }

    const afterDeleteLen = (editable.textContent || '').length;

    nativeSetTimeout(() => {
      if (!editable.isConnected) {
        logDiag('Secrets', '5d:restore:FAILED-detached-after-delete', {
          savedPrefixLen,
          afterDeleteLen,
        });
        return;
      }
      try {
        if (document.activeElement !== editable && typeof editable.focus === 'function') {
          editable.focus();
        }
      } catch {
        // Ignore focus errors cleanly.
      }
      const liveSel = window.getSelection();
      const settledRange = collapseAfterDeleteRange();
      if (liveSel) {
        liveSel.removeAllRanges();
        liveSel.addRange(settledRange);
      }
      const settledCheck = debugCheckTextPresent(editable, normalizedRaw);
      logDiag('Secrets', '5e2:restore:afterDeleteSettled', {
        savedPrefixLen,
        afterDeleteLen,
        hostTextLen: settledCheck.hostTextLen,
        stillHasRedactedMarker: settledCheck.stillHasRedactedMarker,
        breakNodeCount: settledCheck.breakNodeCount,
        childSummary: settledCheck.childSummary,
        selCollapsed: liveSel ? liveSel.isCollapsed : null,
        isHostFocused: document.activeElement === editable,
      });

      insertTextWithLineBreaksIntoContentEditable(editable, normalizedRaw);
      const beforeInputCheck = debugCheckTextPresent(editable, normalizedRaw);

      dispatchSyntheticInputEvent(editable, 'insertFromPaste', normalizedRaw);
      const afterInputCheck = debugCheckTextPresent(editable, normalizedRaw);

      logDiag('Secrets', '5f:restore:dispatched', {
        syntheticPrevented: false,
        execCommandOk,
        domFallbackUsed: true,
        savedPrefixLen,
        afterDeleteLen,
        syncBeforeInputLen: beforeInputCheck.hostTextLen,
        syncBeforeInputPresent: beforeInputCheck.expectedPresent,
        syncAfterInputLen: afterInputCheck.hostTextLen,
        syncAfterInputPresent: afterInputCheck.expectedPresent,
      });

      if (state.debugLogs) {
        nativeSetTimeout(() => {
          logDiag('Secrets', '5g:restore:postCheck80ms', debugCheckTextPresent(editable, normalizedRaw));
        }, 80);
      }
    }, 40);
  }

  function restoreMaskedBlockInEditable(savedEditable, maskedText, rawText) {
    let editable =
      savedEditable && savedEditable.isContentEditable
        ? resolveEditingHost(savedEditable)
        : savedEditable;
    if (!editable || !editable.isConnected) {
      const recovered = recoverEditableIfDetached(maskedText);
      if (recovered) {
        logDiag('Secrets', '5a:restore:recovered-detached-host', {
          recovered: describeDomNode(recovered),
        });
        editable = recovered;
      }
    }

    logDiag('Secrets', '5:restore:start', {
      editable: describeDomNode(editable),
      maskedLen: (maskedText || '').length,
      rawLen: (rawText || '').length,
      activeBefore: describeDomNode(document.activeElement),
    });

    if (!editable || !editable.isConnected) {
      logDiag('Secrets', '5a:restore:FAILED-detached', {
        savedEditable: describeDomNode(savedEditable),
      });
      return { ok: false, reason: 'detached' };
    }

    const isTextField =
      (NativeHTMLTextAreaElement && editable instanceof NativeHTMLTextAreaElement) ||
      (NativeHTMLInputElement && editable instanceof NativeHTMLInputElement);

    if (isTextField) {
      const normalizedMasked = String(maskedText || '').replace(/\r\n?/g, '\n');
      const normalizedRaw = String(rawText || '').replace(/\r\n?/g, '\n');
      const curVal = String(editable.value || '').replace(/\r\n?/g, '\n');
      const idx = curVal.lastIndexOf(normalizedMasked);
      if (idx < 0) {
        logDiag('Secrets', '5b:restore:FAILED-textarea-changed', {
          curValLen: curVal.length,
          normalizedMaskedLen: normalizedMasked.length,
        });
        return { ok: false, reason: 'changed' };
      }
      const nextVal = `${curVal.slice(0, idx)}${normalizedRaw}${curVal.slice(idx + normalizedMasked.length)}`;
      if (typeof editable.focus === 'function') {
        editable.focus();
      }
      setTextControlValueAndCaret(editable, nextVal, idx + normalizedRaw.length);
      dispatchSyntheticInputEvent(editable, 'insertReplacementText', normalizedRaw);
      logDiag('Secrets', '5c:restore:SUCCESS-textarea', { idx, nextLen: nextVal.length });
      return { ok: true };
    }

    if (editable.isContentEditable) {
      const initialRange = findCompactRangeInEditable(editable, maskedText);
      if (!initialRange) {
        logDiag('Secrets', '5d:restore:FAILED-no-range', {
          editableCheck: debugInspectEditableMatch(editable, maskedText),
        });
        return { ok: false, reason: 'changed' };
      }

      const quillMode = isQuillEditor(editable);
      return {
        ok: true,
        runAsync: () => {
          try {
            if (typeof editable.focus === 'function') {
              editable.focus();
            }
          } catch {
            // Ignore focus error cleanly.
          }
          if (quillMode) {
            nativeSetTimeout(() => {
              const freshRange = findCompactRangeInEditable(editable, maskedText);
              if (!freshRange) {
                logDiag('Secrets', '5d:restore:FAILED-changed-after-focus', {
                  editableCheck: debugInspectEditableMatch(editable, maskedText),
                });
                return;
              }
              dispatchContentEditableReplacement(editable, freshRange, maskedText, rawText);
            }, 25);
            return;
          }
          // Tick 1: let ProseMirror onFocus finish internal caret restore before selecting block.
          nativeSetTimeout(() => {
            const freshRange = findCompactRangeInEditable(editable, maskedText);
            if (!freshRange) {
              logDiag('Secrets', '5d:restore:FAILED-changed-after-focus', {
                editableCheck: debugInspectEditableMatch(editable, maskedText),
              });
              return;
            }
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(freshRange);
            }
            try {
              document.dispatchEvent(new NativeEvent('selectionchange'));
            } catch {
              // Ignore synthetic selectionchange restrictions.
            }
            // Tick 2: let editor selection observers adopt the multi-paragraph DOM range cleanly.
            nativeSetTimeout(() => {
              dispatchContentEditableReplacement(editable, freshRange, maskedText, rawText);
            }, 25);
          }, 25);
        },
      };
    }

    logDiag('Secrets', '5h:restore:FAILED-unsupported', {
      editable: describeDomNode(editable),
    });
    return { ok: false, reason: 'unsupported' };
  }

  async function copyRawTextToClipboard(rawText, hostRoot) {
    try {
      if (nativeClipboardWriteText) {
        let writePromise;
        isInternalClipboardWrite = true;
        try {
          writePromise = nativeClipboardWriteText(rawText);
        } finally {
          isInternalClipboardWrite = false;
        }
        await writePromise;
        return true;
      }
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        let writePromise;
        isInternalClipboardWrite = true;
        try {
          writePromise = navigator.clipboard.writeText(rawText);
        } finally {
          isInternalClipboardWrite = false;
        }
        await writePromise;
        return true;
      }
    } catch {
      // Fall through to selection copy fallback inside closed shadow root.
    }
    let tempHost = null;
    try {
      let shadowMount = hostRoot;
      if (!shadowMount) {
        tempHost = safeCreateElement('div');
        tempHost.style.position = 'fixed';
        tempHost.style.opacity = '0';
        tempHost.style.pointerEvents = 'none';
        shadowMount = createClosedShadowRoot(tempHost);
        const pageMount = document.body || document.documentElement;
        if (!pageMount) {
          return false;
        }
        appendChildSafe(pageMount, tempHost);
      }
      const ta = safeCreateElement('textarea');
      if (textAreaValueDescriptor && typeof textAreaValueDescriptor.set === 'function') {
        textAreaValueDescriptor.set.call(ta, rawText);
      } else {
        ta.value = rawText;
      }
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      appendChildSafe(shadowMount, ta);
      try {
        ta.focus({ preventScroll: true });
      } catch {
        ta.focus();
      }
      ta.select();
      let ok = false;
      if (typeof document.execCommand === 'function') {
        isInternalClipboardWrite = true;
        try {
          ok = document.execCommand('copy');
        } finally {
          isInternalClipboardWrite = false;
        }
      }
      if (textAreaValueDescriptor && typeof textAreaValueDescriptor.set === 'function') {
        textAreaValueDescriptor.set.call(ta, '');
      } else {
        ta.value = '';
      }
      removeNodeSafe(ta);
      return Boolean(ok);
    } catch {
      return false;
    } finally {
      if (tempHost) {
        removeNodeSafe(tempHost);
      }
    }
  }

  function createEyeIconSvg(revealed) {
    const svg = safeCreateElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttrSafe(svg, 'width', '13');
    setAttrSafe(svg, 'height', '13');
    setAttrSafe(svg, 'viewBox', '0 0 24 24');
    setAttrSafe(svg, 'fill', 'none');
    setAttrSafe(svg, 'stroke', 'currentColor');
    setAttrSafe(svg, 'stroke-width', '2');
    setAttrSafe(svg, 'stroke-linecap', 'round');
    setAttrSafe(svg, 'stroke-linejoin', 'round');
    setAttrSafe(svg, 'aria-hidden', 'true');

    const p1 = safeCreateElementNS('http://www.w3.org/2000/svg', 'path');
    setAttrSafe(p1, 'd', 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z');
    appendChildSafe(svg, p1);

    if (revealed) {
      const p2 = safeCreateElementNS('http://www.w3.org/2000/svg', 'path');
      setAttrSafe(p2, 'd', 'M3 3l18 18');
      appendChildSafe(svg, p2);
    } else {
      const c = safeCreateElementNS('http://www.w3.org/2000/svg', 'circle');
      setAttrSafe(c, 'cx', '12');
      setAttrSafe(c, 'cy', '12');
      setAttrSafe(c, 'r', '3');
      appendChildSafe(svg, c);
    }
    return svg;
  }

  function openSecretReviewModal(draft) {
    const mountTarget = document.body || document.documentElement;
    if (!mountTarget || !draft || !draft.findings || draft.findings.length === 0) {
      return;
    }
    logDiag('Secrets', '3:modal:open', {
      findingsCount: draft.findings.length,
      targetEditable: describeDomNode(draft.targetEditable),
      rootEditHost: describeDomNode(resolveEditingHost(draft.targetEditable)),
    });
    if (draft.expiryTimer !== null) {
      nativeClearTimeout(draft.expiryTimer);
      draft.expiryTimer = null;
    }

    const palette = getModalPalette();
    const { host, shadow, scrim, modal, header, titleGroup, titleEl } = createModalShell(
      palette,
      'min(92vw, 560px)'
    );
    setSafeText(titleEl, i18n.secretsModalTitle);

    const countPill = safeCreateElement('span');
    setSafeText(countPill, String(draft.findings.length));
    countPill.style.fontSize = '11px';
    countPill.style.fontWeight = '600';
    countPill.style.padding = '1px 7px';
    countPill.style.borderRadius = '999px';
    countPill.style.background = palette.surface;
    countPill.style.border = `1px solid ${palette.border}`;
    countPill.style.color = palette.muted;
    appendChildSafe(titleGroup, countPill);

    const subEl = safeCreateElement('div');
    setSafeText(subEl, i18n.secretsModalSub);
    subEl.style.fontSize = '12px';
    subEl.style.color = palette.muted;
    subEl.style.lineHeight = '1.4';

    const listEl = safeCreateElement('div');
    listEl.style.display = 'flex';
    listEl.style.flexDirection = 'column';
    listEl.style.gap = '8px';
    listEl.style.maxHeight = '46vh';
    listEl.style.overflow = 'auto';
    listEl.style.padding = '2px';

    const focusableRowControls = [];
    const totalFindingCount =
      typeof draft.totalFindings === 'number' && draft.totalFindings >= draft.findings.length
        ? draft.totalFindings
        : draft.findings.length;
    const getUnmaskedCount = () =>
      nativeArrayFilter.call(draft.findings, (f) => f.masked === false).length;
    const getTargetReplacementText = () => {
      const unmaskedCount = getUnmaskedCount();
      if (
        unmaskedCount === 0 ||
        (unmaskedCount === draft.findings.length && draft.findings.length >= totalFindingCount) ||
        !nativeIsArray(draft.segments) ||
        draft.segments.length === 0
      ) {
        return draft.rawText;
      }
      return buildTextFromSegments(draft.segments);
    };

    const keepBtn = createModalButton(palette, i18n.secretsKeepBtn, false);
    const copyBtn = createModalButton(palette, i18n.secretsCopyRawBtn, false);
    const pasteBtn = createModalButton(palette, i18n.secretsPasteRawBtn, true);

    const syncFooterButtons = () => {
      const unmaskedCount = getUnmaskedCount();
      const isPartial = unmaskedCount > 0 && unmaskedCount < totalFindingCount;
      setSafeText(pasteBtn, isPartial ? i18n.secretsApplyBtn : i18n.secretsPasteRawBtn);
      setSafeText(copyBtn, isPartial ? i18n.secretsCopySelectedBtn : i18n.secretsCopyRawBtn);
    };

    for (let i = 0; i < draft.findings.length; i += 1) {
      const item = draft.findings[i];
      if (typeof item.masked !== 'boolean') {
        item.masked = true;
      }
      let revealed = false;

      const row = safeCreateElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '5px';
      row.style.padding = '8px 10px';
      row.style.borderRadius = '7px';
      row.style.background = palette.surface;
      row.style.border = `1px solid ${palette.border}`;

      const topBar = safeCreateElement('div');
      topBar.style.display = 'flex';
      topBar.style.alignItems = 'center';
      topBar.style.justifyContent = 'space-between';
      topBar.style.gap = '8px';

      const meta = safeCreateElement('label');
      meta.style.display = 'flex';
      meta.style.alignItems = 'center';
      meta.style.gap = '6px';
      meta.style.flexWrap = 'wrap';
      meta.style.fontSize = '11px';
      meta.style.cursor = 'pointer';
      meta.style.userSelect = 'none';

      const checkbox = safeCreateElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.masked;
      checkbox.style.margin = '0';
      checkbox.style.width = '14px';
      checkbox.style.height = '14px';
      checkbox.style.cursor = 'pointer';
      checkbox.style.accentColor = palette.accent;
      setAttrSafe(checkbox, 'aria-label', item.label);

      const typeEl = safeCreateElement('span');
      typeEl.style.fontWeight = '600';
      setSafeText(typeEl, item.label);

      const placeholderEl = safeCreateElement('code');
      setSafeText(placeholderEl, item.placeholder);
      placeholderEl.style.fontSize = '11px';
      placeholderEl.style.color = palette.muted;

      const syncRowMaskState = () => {
        item.masked = Boolean(checkbox.checked);
        placeholderEl.style.textDecoration = item.masked ? 'none' : 'line-through';
        placeholderEl.style.opacity = item.masked ? '1' : '0.55';
        row.style.border = `1px solid ${item.masked ? palette.border : palette.accent}`;
      };
      syncRowMaskState();

      nativeAddEventListener.call(checkbox, 'change', () => {
        syncRowMaskState();
        syncFooterButtons();
      });

      appendChildSafe(meta, checkbox);
      appendChildSafe(meta, typeEl);
      appendChildSafe(meta, placeholderEl);

      const eyeBtn = createModalButton(palette, '', false);
      eyeBtn.style.display = 'inline-flex';
      eyeBtn.style.alignItems = 'center';
      eyeBtn.style.gap = '5px';
      eyeBtn.style.padding = '3px 8px';
      eyeBtn.style.fontSize = '11px';
      setAttrSafe(eyeBtn, 'aria-pressed', 'false');

      const valueEl = safeCreateElement('code');
      valueEl.style.display = 'block';
      valueEl.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      valueEl.style.fontSize = '11px';
      valueEl.style.wordBreak = 'break-all';
      valueEl.style.whiteSpace = 'pre-wrap';
      valueEl.style.maxHeight = '90px';
      valueEl.style.overflow = 'auto';
      valueEl.style.padding = '5px 7px';
      valueEl.style.borderRadius = '5px';
      valueEl.style.background = palette.bg;
      valueEl.style.border = `1px solid ${palette.border}`;

      const syncEyeState = () => {
        setSafeText(eyeBtn, '');
        appendChildSafe(eyeBtn, createEyeIconSvg(revealed));
        const lbl = safeCreateElement('span');
        setSafeText(lbl, revealed ? i18n.secretsHideBtn : i18n.secretsShowBtn);
        appendChildSafe(eyeBtn, lbl);
        setAttrSafe(eyeBtn, 'aria-pressed', revealed ? 'true' : 'false');
        setSafeText(valueEl, revealed ? item.rawValue : item.maskedPreview);
        valueEl.style.color = revealed ? palette.text : palette.muted;
      };

      syncEyeState();
      nativeAddEventListener.call(eyeBtn, 'click', () => {
        revealed = !revealed;
        syncEyeState();
      });

      nativeArrayPush.call(focusableRowControls, checkbox, eyeBtn);
      appendChildSafe(topBar, meta);
      appendChildSafe(topBar, eyeBtn);
      appendChildSafe(row, topBar);
      appendChildSafe(row, valueEl);
      appendChildSafe(listEl, row);
    }

    syncFooterButtons();

    const warnEl = safeCreateElement('div');
    warnEl.style.display = 'none';
    warnEl.style.padding = '7px 10px';
    warnEl.style.borderRadius = '6px';
    warnEl.style.fontSize = '12px';
    warnEl.style.background = palette.warnBg;
    warnEl.style.border = `1px solid ${palette.warnBorder}`;
    warnEl.style.color = palette.warnText;
    setSafeText(warnEl, i18n.secretsChangedNotice);

    const ac = makeAbortControllerSafe();
    let isClosed = false;

    const closeReviewModal = (wipeDraft, closeReason) => {
      if (isClosed) {
        return;
      }
      isClosed = true;
      if (ac) {
        abortSafe(ac);
      } else {
        window.removeEventListener('keydown', onReviewKeyDown, true);
      }
      removeNodeSafe(host);
      if (wipeDraft) {
        clearEphemeralSecretDraft(closeReason || 'modal-action');
      } else if (ephemeralSecretDraft === draft) {
        draft.expiryTimer = nativeSetTimeout(() => {
          if (ephemeralSecretDraft === draft) {
            clearEphemeralSecretDraft('modal-ttl-expired');
          }
        }, 15000);
      }
    };

    const onReviewKeyDown = (e) => {
      if (!e || !e.isTrusted) {
        return;
      }
      const key = getEvProp(nativeKeyDesc, e, 'key');
      if (key === 'Escape') {
        haltEvent(e);
        closeReviewModal(false, 'modal-escape');
      } else if (key === 'Tab') {
        handleModalTabKey(e, shadow, [...focusableRowControls, keepBtn, copyBtn, pasteBtn]);
      }
    };

    if (ac) {
      nativeAddEventListener.call(window, 'keydown', onReviewKeyDown, { capture: true, signal: ac.signal });
    } else {
      nativeAddEventListener.call(window, 'keydown', onReviewKeyDown, true);
    }

    nativeAddEventListener.call(keepBtn, 'click', () => closeReviewModal(false, 'modal-keep'));
    nativeAddEventListener.call(copyBtn, 'click', async () => {
      const targetText = getTargetReplacementText();
      logDiag('Secrets', '4:modal:click-copy-original', { rawLen: (targetText || '').length });
      const copied = await copyRawTextToClipboard(targetText, shadow);
      if (copied) {
        armOneTimeRawBypass(targetText);
      }
      closeReviewModal(true, 'modal-copy-original');
      if (copied && state.showToast) {
        showToastNotice(i18n.secretsCopiedTitle, i18n.secretsRestoredSub, 2400);
      }
    });
    nativeAddEventListener.call(pasteBtn, 'click', () => {
      const targetText = getTargetReplacementText();
      logDiag('Secrets', '4:modal:click-paste-original', {
        targetConnected: Boolean(draft.targetEditable && draft.targetEditable.isConnected),
        unmaskedCount: getUnmaskedCount(),
      });
      const res = restoreMaskedBlockInEditable(draft.targetEditable, draft.maskedText, targetText);
      if (!res.ok) {
        logDiag('Secrets', '4b:modal:paste-original-FAILED', res);
        warnEl.style.display = 'block';
        pasteBtn.disabled = true;
        pasteBtn.style.opacity = '0.45';
        copyBtn.style.background = palette.accent;
        copyBtn.style.color = palette.accentText;
        copyBtn.style.border = 'none';
        copyBtn.focus();
        return;
      }
      closeReviewModal(true, 'modal-paste-original');
      if (typeof res.runAsync === 'function') {
        res.runAsync();
      }
      if (state.showToast) {
        showToastNotice(i18n.secretsRestoredTitle, i18n.secretsRestoredSub, 2600);
      }
    });

    const footer = safeCreateElement('div');
    footer.style.display = 'flex';
    footer.style.alignItems = 'center';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '6px';
    footer.style.flexWrap = 'wrap';
    appendChildSafe(footer, keepBtn);
    appendChildSafe(footer, copyBtn);
    appendChildSafe(footer, pasteBtn);

    appendChildSafe(modal, header);
    appendChildSafe(modal, subEl);
    appendChildSafe(modal, listEl);
    appendChildSafe(modal, warnEl);
    appendChildSafe(modal, footer);
    appendChildSafe(scrim, modal);
    appendChildSafe(shadow, scrim);
    appendChildSafe(mountTarget, host);
    keepBtn.focus();
  }

  function handlePasteSecrets(event, clipboardData) {
    let rawText = '';
    try {
      rawText = safeDtGetData(clipboardData, 'text/plain') || '';
    } catch {
      return;
    }
    if (!rawText) {
      return;
    }
    if (consumeOneTimeRawBypass(rawText)) {
      logDiag('Secrets', '1b:paste:bypass-consumed', {
        site: window.location.hostname,
        rawLen: rawText.length,
      });
      return;
    }
    let maskedRes;
    try {
      maskedRes = maskSensitiveText(rawText);
    } catch {
      // Fail closed if page tampering disrupts scanning so raw secrets never paste through.
      haltEvent(event);
      return;
    }
    const { text: maskedText, count, findings, totalFindings, segments } = maskedRes;
    if (count === 0 || maskedText === rawText) {
      return;
    }
    const rawTarget = getEventPathTarget(event);
    const targetEditable = findEditableTarget(rawTarget);
    const rootEditHost = resolveEditingHost(targetEditable || rawTarget);
    if (state.debugLogs) {
      logDiag('Secrets', '1:paste:detected', {
        site: window.location.hostname,
        rawTarget: describeDomNode(rawTarget),
        targetEditable: describeDomNode(targetEditable),
        rootEditHost: describeDomNode(rootEditHost),
        rawLen: rawText.length,
        maskedLen: maskedText.length,
        maskedLineCount: maskedText.split(/\r?\n/).length,
        findingsCount: count,
        findingTypes: findings.map((f) => f.label),
      });
    }
    insertMaskedText(event, maskedText);
    if (state.debugLogs) {
      nativeSetTimeout(() => {
        logDiag('Secrets', '2c:postPasteCheck80ms', {
          savedTargetConnected: Boolean(targetEditable && targetEditable.isConnected),
          savedTargetCheck:
            targetEditable && targetEditable.isConnected
              ? debugInspectEditableMatch(targetEditable, maskedText)
              : 'detached',
          rootHostCheck:
            rootEditHost && rootEditHost !== targetEditable
              ? debugInspectEditableMatch(rootEditHost, maskedText)
              : 'same-as-saved-target',
        });
      }, 80);
    }
    const draftEntry = setEphemeralSecretDraft(
      {
        rawText,
        maskedText,
        findings,
        totalFindings,
        segments,
        targetEditable,
      },
      30000
    );
    showSecretsToast(count, draftEntry);
  }

  // --- Irreversible Canvas Redactor & Image Optimizer ---

  function isAnimatedGifBytes(bytes) {
    if (!bytes || bytes.length < 13) {
      return false;
    }
    // Check "GIF8" header
    if (bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x38) {
      return false;
    }
    let pos = 10;
    const packed = bytes[pos];
    pos = 13;
    if (packed & 0x80) {
      pos += 3 * (1 << ((packed & 0x07) + 1));
    }
    let frames = 0;
    while (pos < bytes.length) {
      const block = bytes[pos++];
      if (block === 0x3b) {
        break;
      }
      if (block === 0x2c) {
        frames += 1;
        if (frames > 1) {
          return true;
        }
        if (pos + 9 > bytes.length) break;
        const localPacked = bytes[pos + 8];
        pos += 9;
        if (localPacked & 0x80) {
          pos += 3 * (1 << ((localPacked & 0x07) + 1));
        }
        pos += 1; // LZW minimum code size
        while (pos < bytes.length) {
          const subLen = bytes[pos++];
          if (!subLen) break;
          pos += subLen;
        }
      } else if (block === 0x21) {
        if (pos >= bytes.length) break;
        pos += 1; // extension label
        while (pos < bytes.length) {
          const subLen = bytes[pos++];
          if (!subLen) break;
          pos += subLen;
        }
      } else {
        break;
      }
    }
    return false;
  }

  function closeBitmap(bitmap) {
    if (!bitmap) {
      return;
    }
    try {
      if (nativeBitmapClose) {
        nativeBitmapClose.call(bitmap);
      } else if (typeof bitmap.close === 'function') {
        bitmap.close();
      }
    } catch {
      // Ignore already-closed bitmap cleanup errors cleanly.
    }
  }

  function releaseImageSource(loaded) {
    if (!loaded) {
      return;
    }
    if (loaded.bitmap) {
      closeBitmap(loaded.bitmap);
      loaded.bitmap = null;
    }
    if (loaded.canvas) {
      releaseCanvasMemory(loaded.canvas);
      loaded.canvas = null;
    }
    if (loaded.url && revokeObjectURL) {
      try {
        revokeObjectURL(loaded.url);
      } catch {
        // Ignore duplicate revoke calls.
      }
      loaded.url = null;
    }
    if (loaded.img) {
      try {
        if (nativeImgSrcDesc && typeof nativeImgSrcDesc.set === 'function') {
          nativeImgSrcDesc.set.call(loaded.img, '');
        } else {
          loaded.img.src = '';
        }
      } catch {
        // Ignore image reset failures.
      }
      loaded.img = null;
    }
    loaded.source = null;
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!NativeImage || !createObjectURL || !revokeObjectURL) {
        reject(new Error('Image loader unavailable'));
        return;
      }
      const url = createObjectURL(file);
      const img = new NativeImage();
      img.onload = () => {
        const w = img.naturalWidth || img.width || 0;
        const h = img.naturalHeight || img.height || 0;
        resolve({ source: img, img, bitmap: null, canvas: null, url, width: w, height: h });
      };
      img.onerror = () => {
        revokeObjectURL(url);
        reject(new Error('Image decode failed'));
      };
      if (nativeImgSrcDesc && typeof nativeImgSrcDesc.set === 'function') {
        nativeImgSrcDesc.set.call(img, url);
      } else {
        img.src = url;
      }
    });
  }

  async function decodeSourceFromFile(file) {
    if (nativeCreateImageBitmap) {
      const optsList = [{ imageOrientation: 'from-image' }, null];
      for (let i = 0; i < optsList.length; i += 1) {
        try {
          const opts = optsList[i];
          const bitmap = opts
            ? await nativeCreateImageBitmap(file, opts)
            : await nativeCreateImageBitmap(file);
          if (bitmap && bitmap.width > 0 && bitmap.height > 0) {
            return {
              source: bitmap,
              bitmap,
              canvas: null,
              img: null,
              url: null,
              width: bitmap.width,
              height: bitmap.height,
            };
          }
          closeBitmap(bitmap);
        } catch {
          // Try next decode strategy or HTMLImageElement fallback.
        }
      }
    }
    return loadImageFromFile(file);
  }

  async function buildPreviewFromDecoded(fullLoaded) {
    if (!fullLoaded || !fullLoaded.source || fullLoaded.width <= 0 || fullLoaded.height <= 0) {
      releaseImageSource(fullLoaded);
      return null;
    }
    const maxSide = Math.max(fullLoaded.width, fullLoaded.height);
    if (maxSide <= MAX_PREVIEW_EDGE) {
      return fullLoaded;
    }
    const scale = MAX_PREVIEW_EDGE / maxSide;
    const previewW = Math.max(1, Math.round(fullLoaded.width * scale));
    const previewH = Math.max(1, Math.round(fullLoaded.height * scale));
    let previewCanvas = null;
    try {
      previewCanvas = safeCreateElement('canvas');
      previewCanvas.width = previewW;
      previewCanvas.height = previewH;
      const pCtx = nativeCanvasGetContext
        ? nativeCanvasGetContext.call(previewCanvas, '2d')
        : previewCanvas.getContext('2d');
      if (!pCtx) {
        releaseCanvasMemory(previewCanvas);
        previewCanvas = null;
        return fullLoaded;
      }
      pCtx.imageSmoothingEnabled = true;
      pCtx.imageSmoothingQuality = 'medium';
      if (nativeCtxDrawImage) {
        nativeCtxDrawImage.call(pCtx, fullLoaded.source, 0, 0, previewW, previewH);
      } else {
        pCtx.drawImage(fullLoaded.source, 0, 0, previewW, previewH);
      }
      // Free full-res backing store as soon as preview pixels are copied.
      releaseImageSource(fullLoaded);
      if (nativeCreateImageBitmap) {
        try {
          const previewBitmap = await nativeCreateImageBitmap(previewCanvas);
          releaseCanvasMemory(previewCanvas);
          previewCanvas = null;
          if (previewBitmap && previewBitmap.width > 0 && previewBitmap.height > 0) {
            return {
              source: previewBitmap,
              bitmap: previewBitmap,
              canvas: null,
              img: null,
              url: null,
              width: previewW,
              height: previewH,
            };
          }
          closeBitmap(previewBitmap);
        } catch {
          // Retain compact previewCanvas if ImageBitmap creation fails.
        }
      }
      if (previewCanvas) {
        return {
          source: previewCanvas,
          bitmap: null,
          canvas: previewCanvas,
          img: null,
          url: null,
          width: previewW,
          height: previewH,
        };
      }
      return null;
    } catch {
      releaseCanvasMemory(previewCanvas);
      releaseImageSource(fullLoaded);
      return null;
    }
  }

  function resolveCanvasOutputFormat(file) {
    const mime = (file.type || '').toLowerCase().split(';')[0].trim();
    if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/pjpeg') {
      return { mime: 'image/jpeg', ext: 'jpg', quality: 0.9 };
    }
    if (mime === 'image/webp') {
      return { mime: 'image/webp', ext: 'webp', quality: 0.9 };
    }
    const name = (file.name || '').toLowerCase();
    const ambiguousMime =
      !mime || mime === 'application/octet-stream' || mime === 'binary/octet-stream';
    if (ambiguousMime) {
      if (/\.jpe?g$/.test(name)) return { mime: 'image/jpeg', ext: 'jpg', quality: 0.9 };
      if (name.endsWith('.webp')) return { mime: 'image/webp', ext: 'webp', quality: 0.9 };
    }
    return { mime: 'image/png', ext: 'png', quality: undefined };
  }

  function getRedactWeightFactor(weightId) {
    return weightId && nativeHasOwn(REDACT_WEIGHT_MAP, weightId)
      ? REDACT_WEIGHT_MAP[weightId]
      : 1;
  }

  function computeToolStrokeWeights(w, h, weightId) {
    const baseMax = nativeMathMax(1, nativeMathMax(w, h));
    const factor = getRedactWeightFactor(weightId);
    return {
      outline: nativeMathMax(2, nativeMathRound(baseMax * 0.0055 * factor)),
      pen: nativeMathMax(2, nativeMathRound(baseMax * 0.0065 * factor)),
    };
  }

  function clamp01(v) {
    if (!nativeNumberIsFinite(v)) {
      return 0;
    }
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function normalizeCropRegion(crop) {
    if (
      !crop ||
      !nativeNumberIsFinite(crop.x) ||
      !nativeNumberIsFinite(crop.y) ||
      !nativeNumberIsFinite(crop.w) ||
      !nativeNumberIsFinite(crop.h) ||
      crop.w <= 0.004 ||
      crop.h <= 0.004
    ) {
      return { x: 0, y: 0, w: 1, h: 1 };
    }
    const x = nativeMathMin(0.995, clamp01(crop.x));
    const y = nativeMathMin(0.995, clamp01(crop.y));
    const w = nativeMathMax(0.005, nativeMathMin(1 - x, crop.w));
    const h = nativeMathMax(0.005, nativeMathMin(1 - y, crop.h));
    return { x, y, w, h };
  }

  function isActiveCropRegion(crop) {
    if (!crop || !nativeNumberIsFinite(crop.w) || !nativeNumberIsFinite(crop.h)) {
      return false;
    }
    const r = normalizeCropRegion(crop);
    return r.x > 0.002 || r.y > 0.002 || r.w < 0.998 || r.h < 0.998;
  }

  function toFullNormalizedPoint(region, viewPt) {
    return {
      x: clamp01(region.x + viewPt.x * region.w),
      y: clamp01(region.y + viewPt.y * region.h),
    };
  }

  function toViewNormalizedPoint(region, fullPt) {
    return {
      x: (fullPt.x - region.x) / region.w,
      y: (fullPt.y - region.y) / region.h,
    };
  }

  function mapBoxesToRegion(boxes, region) {
    if (!nativeIsArray(boxes) || boxes.length === 0 || !isActiveCropRegion(region)) {
      return boxes;
    }
    const out = [];
    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i];
      if (!box) continue;
      if (box.mode === 'pen' && nativeIsArray(box.points)) {
        const mappedPts = [];
        for (let j = 0; j < box.points.length; j += 1) {
          nativeArrayPush.call(mappedPts, toViewNormalizedPoint(region, box.points[j]));
        }
        nativeArrayPush.call(out, {
          mode: 'pen',
          color: box.color,
          weight: box.weight,
          points: mappedPts,
        });
      } else {
        nativeArrayPush.call(out, {
          x: (box.x - region.x) / region.w,
          y: (box.y - region.y) / region.h,
          w: box.w / region.w,
          h: box.h / region.h,
          mode: box.mode,
          color: box.color,
          weight: box.weight,
        });
      }
    }
    return out;
  }

  function drawPenStroke(ctx, box, w, h, strokeWeight) {
    const pts = box && nativeIsArray(box.points) ? box.points : null;
    if (!pts || pts.length < 2) {
      return;
    }
    const color = setHas(REDACT_COLOR_SET, box.color) ? box.color : '#09090b';
    const lw = nativeMathMax(2, nativeMathRound(strokeWeight));
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const begin = () => (nativeCtxBeginPath ? nativeCtxBeginPath.call(ctx) : ctx.beginPath());
    const move = (x, y) => (nativeCtxMoveTo ? nativeCtxMoveTo.call(ctx, x, y) : ctx.moveTo(x, y));
    const line = (x, y) => (nativeCtxLineTo ? nativeCtxLineTo.call(ctx, x, y) : ctx.lineTo(x, y));
    const quad = (cx, cy, x, y) =>
      nativeCtxQuadraticCurveTo
        ? nativeCtxQuadraticCurveTo.call(ctx, cx, cy, x, y)
        : ctx.quadraticCurveTo(cx, cy, x, y);
    const stroke = () => (nativeCtxStroke ? nativeCtxStroke.call(ctx) : ctx.stroke());

    begin();
    const x0 = pts[0].x * w;
    const y0 = pts[0].y * h;
    move(x0, y0);
    if (pts.length === 2) {
      line(pts[1].x * w, pts[1].y * h);
    } else {
      for (let j = 1; j < pts.length - 1; j += 1) {
        const cx = pts[j].x * w;
        const cy = pts[j].y * h;
        const mx = (cx + pts[j + 1].x * w) * 0.5;
        const my = (cy + pts[j + 1].y * h) * 0.5;
        quad(cx, cy, mx, my);
      }
      const last = pts[pts.length - 1];
      line(last.x * w, last.y * h);
    }
    stroke();
  }

  function getStrokeBoundingBox(box) {
    if (!box) {
      return null;
    }
    if (box.mode !== 'pen') {
      return { x: box.x, y: box.y, w: box.w, h: box.h };
    }
    const pts = nativeIsArray(box.points) ? box.points : null;
    if (!pts || pts.length === 0) {
      return null;
    }
    let minX = pts[0].x;
    let maxX = pts[0].x;
    let minY = pts[0].y;
    let maxY = pts[0].y;
    for (let i = 1; i < pts.length; i += 1) {
      const p = pts[i];
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    return {
      x: minX,
      y: minY,
      w: nativeMathMax(0.01, maxX - minX),
      h: nativeMathMax(0.01, maxY - minY),
    };
  }

  function renderPixelatedBox(ctx, sourceImage, boxRect, cropPxRect, targetW, targetH) {
    if (!ctx || !boxRect) {
      return;
    }
    const cw = targetW || (ctx.canvas && ctx.canvas.width > 0 ? ctx.canvas.width : 0);
    const ch = targetH || (ctx.canvas && ctx.canvas.height > 0 ? ctx.canvas.height : 0);
    if (cw <= 0 || ch <= 0) {
      return;
    }
    const rx = boxRect.x * cw;
    const ry = boxRect.y * ch;
    const rw = boxRect.w * cw;
    const rh = boxRect.h * ch;
    if (rw < 2 || rh < 2 || rx + rw <= 0 || ry + rh <= 0 || rx >= cw || ry >= ch) {
      return;
    }
    const xInt = nativeMathMax(0, nativeMathFloor(rx));
    const yInt = nativeMathMax(0, nativeMathFloor(ry));
    const wInt = nativeMathMin(cw, nativeMathCeil(rx + rw)) - xInt;
    const hInt = nativeMathMin(ch, nativeMathCeil(ry + rh)) - yInt;
    if (wInt < 2 || hInt < 2) {
      return;
    }

    const cellSize = nativeMathMax(12, nativeMathRound(nativeMathMax(cw, ch) / 48));
    const cols = nativeMathMax(1, nativeMathMin(64, nativeMathCeil(wInt / cellSize)));
    const rows = nativeMathMax(1, nativeMathMin(64, nativeMathCeil(hInt / cellSize)));

    const src = sourceImage || (ctx && ctx.canvas ? ctx.canvas : null);
    let sampleCanvas = null;
    let imgData = null;
    try {
      if (src) {
        const srcTotalW = src.naturalWidth || src.width || cw;
        const srcTotalH = src.naturalHeight || src.height || ch;
        const baseX = cropPxRect && nativeNumberIsFinite(cropPxRect.x) ? cropPxRect.x : 0;
        const baseY = cropPxRect && nativeNumberIsFinite(cropPxRect.y) ? cropPxRect.y : 0;
        const baseW =
          cropPxRect && nativeNumberIsFinite(cropPxRect.w) && cropPxRect.w > 0
            ? cropPxRect.w
            : srcTotalW;
        const baseH =
          cropPxRect && nativeNumberIsFinite(cropPxRect.h) && cropPxRect.h > 0
            ? cropPxRect.h
            : srcTotalH;
        const sx = baseX + (xInt / cw) * baseW;
        const sy = baseY + (yInt / ch) * baseH;
        const sw = nativeMathMax(1, (wInt / cw) * baseW);
        const sh = nativeMathMax(1, (hInt / ch) * baseH);

        sampleCanvas = safeCreateElement('canvas');
        sampleCanvas.width = cols;
        sampleCanvas.height = rows;
        const sampleCtx = nativeCanvasGetContext
          ? nativeCanvasGetContext.call(sampleCanvas, '2d')
          : sampleCanvas.getContext('2d');
        if (sampleCtx) {
          sampleCtx.imageSmoothingEnabled = true;
          sampleCtx.imageSmoothingQuality = 'medium';
          if (nativeCtxDrawImage) {
            nativeCtxDrawImage.call(sampleCtx, src, sx, sy, sw, sh, 0, 0, cols, rows);
          } else {
            sampleCtx.drawImage(src, sx, sy, sw, sh, 0, 0, cols, rows);
          }
          imgData = nativeCtxGetImageData
            ? nativeCtxGetImageData.call(sampleCtx, 0, 0, cols, rows)
            : sampleCtx.getImageData(0, 0, cols, rows);
        }
      }
    } catch {
      imgData = null;
    } finally {
      releaseCanvasMemory(sampleCanvas);
      sampleCanvas = null;
    }

    // Always destroy underlying pixels first with solid #09090b base fill.
    ctx.fillStyle = '#09090b';
    if (nativeCtxFillRect) {
      nativeCtxFillRect.call(ctx, xInt, yInt, wInt, hInt);
    } else {
      ctx.fillRect(xInt, yInt, wInt, hInt);
    }

    if (!imgData || !imgData.data) {
      return;
    }
    const data = imgData.data;
    for (let r = 0; r < rows; r += 1) {
      const by0 = yInt + nativeMathFloor((r * hInt) / rows);
      const by1 = yInt + nativeMathFloor(((r + 1) * hInt) / rows);
      const bh = by1 - by0;
      if (bh <= 0) continue;
      for (let c = 0; c < cols; c += 1) {
        const bx0 = xInt + nativeMathFloor((c * wInt) / cols);
        const bx1 = xInt + nativeMathFloor(((c + 1) * wInt) / cols);
        const bw = bx1 - bx0;
        if (bw <= 0) continue;
        const idx = (r * cols + c) * 4;
        if (data[idx + 3] < 16) {
          continue;
        }
        const qr = nativeMathMin(240, nativeMathMax(0, nativeMathRound(data[idx] / 16) * 16));
        const qg = nativeMathMin(240, nativeMathMax(0, nativeMathRound(data[idx + 1] / 16) * 16));
        const qb = nativeMathMin(240, nativeMathMax(0, nativeMathRound(data[idx + 2] / 16) * 16));
        ctx.fillStyle = `rgb(${qr},${qg},${qb})`;
        if (nativeCtxFillRect) {
          nativeCtxFillRect.call(ctx, bx0, by0, bw, bh);
        } else {
          ctx.fillRect(bx0, by0, bw, bh);
        }
      }
    }
    imgData = null;
  }

  function applyRedactionBoxes(ctx, boxes, w, h, sourceImage, cropPxRect) {
    if (!nativeIsArray(boxes) || boxes.length === 0 || w <= 0 || h <= 0) {
      return;
    }
    if (nativeCtxSave) nativeCtxSave.call(ctx);
    else ctx.save();
    if (nativeCtxBeginPath) nativeCtxBeginPath.call(ctx);
    else ctx.beginPath();
    if (nativeCtxRect) nativeCtxRect.call(ctx, 0, 0, w, h);
    else ctx.rect(0, 0, w, h);
    if (nativeCtxClip) nativeCtxClip.call(ctx);
    else ctx.clip();
    for (let i = 0; i < boxes.length; i += 1) {
      const box = boxes[i];
      if (!box) continue;
      const weights = computeToolStrokeWeights(w, h, box.weight);
      if (box.mode === 'pen') {
        drawPenStroke(ctx, box, w, h, weights.pen);
        continue;
      }
      if (box.mode === 'pixel') {
        renderPixelatedBox(ctx, sourceImage || null, box, cropPxRect || null, w, h);
        continue;
      }
      const rx = box.x * w;
      const ry = box.y * h;
      const rw = box.w * w;
      const rh = box.h * h;
      if (rw < 2 || rh < 2 || rx + rw <= 0 || ry + rh <= 0 || rx >= w || ry >= h) {
        continue;
      }
      const color = setHas(REDACT_COLOR_SET, box.color) ? box.color : '#09090b';
      const xInt = nativeMathFloor(rx);
      const yInt = nativeMathFloor(ry);
      const wInt = nativeMathCeil(rw);
      const hInt = nativeMathCeil(rh);
      if (box.mode === 'outline') {
        const lw = nativeMathMin(
          weights.outline,
          nativeMathMax(2, nativeMathFloor(nativeMathMin(wInt, hInt) / 3))
        );
        const inset = lw / 2;
        const sw = nativeMathMax(1, wInt - lw);
        const sh = nativeMathMax(1, hInt - lw);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.lineJoin = 'miter';
        if (nativeCtxStrokeRect) {
          nativeCtxStrokeRect.call(ctx, xInt + inset, yInt + inset, sw, sh);
        } else {
          ctx.strokeRect(xInt + inset, yInt + inset, sw, sh);
        }
      } else {
        ctx.fillStyle = color;
        if (nativeCtxFillRect) {
          nativeCtxFillRect.call(ctx, xInt, yInt, wInt, hInt);
        } else {
          ctx.fillRect(xInt, yInt, wInt, hInt);
        }
      }
    }
    if (nativeCtxRestore) nativeCtxRestore.call(ctx);
    else ctx.restore();
  }

  function releaseCanvasMemory(canvas) {
    if (!canvas) {
      return;
    }
    try {
      canvas.width = 0;
      canvas.height = 0;
    } catch {
      // Ignore canvas backing-store cleanup errors cleanly.
    }
  }

  function renderCanvasBlob(source, naturalW, naturalH, boxes, fmt, clampEdge, crop) {
    return new Promise((resolve) => {
      if (!canvasToBlob || !source || naturalW <= 0 || naturalH <= 0) {
        resolve(null);
        return;
      }
      let canvas = null;
      try {
        const hasCrop = isActiveCropRegion(crop);
        const cropRegion = hasCrop ? normalizeCropRegion(crop) : { x: 0, y: 0, w: 1, h: 1 };
        const sx = hasCrop
          ? nativeMathMax(0, nativeMathMin(naturalW - 1, nativeMathRound(cropRegion.x * naturalW)))
          : 0;
        const sy = hasCrop
          ? nativeMathMax(0, nativeMathMin(naturalH - 1, nativeMathRound(cropRegion.y * naturalH)))
          : 0;
        const sw = hasCrop
          ? nativeMathMax(1, nativeMathMin(naturalW - sx, nativeMathRound(cropRegion.w * naturalW)))
          : naturalW;
        const sh = hasCrop
          ? nativeMathMax(1, nativeMathMin(naturalH - sy, nativeMathRound(cropRegion.h * naturalH)))
          : naturalH;

        const safeCap = clampEdge ? MAX_OPTIMIZE_EDGE : 8192;
        const maxSide = nativeMathMax(sw, sh);
        const scale = maxSide > safeCap ? safeCap / maxSide : 1;
        const outW = nativeMathMax(1, nativeMathRound(sw * scale));
        const outH = nativeMathMax(1, nativeMathRound(sh * scale));

        canvas = safeCreateElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = nativeCanvasGetContext
          ? nativeCanvasGetContext.call(canvas, '2d')
          : canvas.getContext('2d');
        if (!ctx) {
          releaseCanvasMemory(canvas);
          canvas = null;
          resolve(null);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        if (hasCrop) {
          if (nativeCtxDrawImage) {
            nativeCtxDrawImage.call(ctx, source, sx, sy, sw, sh, 0, 0, outW, outH);
          } else {
            ctx.drawImage(source, sx, sy, sw, sh, 0, 0, outW, outH);
          }
        } else if (nativeCtxDrawImage) {
          nativeCtxDrawImage.call(ctx, source, 0, 0, outW, outH);
        } else {
          ctx.drawImage(source, 0, 0, outW, outH);
        }
        const pixelCropRegion = hasCrop
          ? { x: sx / naturalW, y: sy / naturalH, w: sw / naturalW, h: sh / naturalH }
          : null;
        const exportBoxes = pixelCropRegion ? mapBoxesToRegion(boxes, pixelCropRegion) : boxes;
        if (exportBoxes && exportBoxes.length > 0) {
          applyRedactionBoxes(ctx, exportBoxes, outW, outH, source, {
            x: sx,
            y: sy,
            w: sw,
            h: sh,
          });
        }
        canvasToBlob.call(
          canvas,
          (blob) => {
            releaseCanvasMemory(canvas);
            canvas = null;
            resolve(blob || null);
          },
          fmt.mime,
          fmt.quality
        );
      } catch {
        releaseCanvasMemory(canvas);
        canvas = null;
        resolve(null);
      }
    });
  }

  function createRedactToolIconSvg(toolMode) {
    const svg = safeCreateElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttrSafe(svg, 'width', '12');
    setAttrSafe(svg, 'height', '12');
    setAttrSafe(svg, 'viewBox', '0 0 16 16');
    setAttrSafe(svg, 'aria-hidden', 'true');
    if (toolMode === 'pixel') {
      const cells = [
        [2, 2, '1'],
        [8.5, 2, '0.45'],
        [2, 8.5, '0.45'],
        [8.5, 8.5, '1'],
      ];
      for (let i = 0; i < cells.length; i += 1) {
        const sq = safeCreateElementNS('http://www.w3.org/2000/svg', 'rect');
        setAttrSafe(sq, 'x', String(cells[i][0]));
        setAttrSafe(sq, 'y', String(cells[i][1]));
        setAttrSafe(sq, 'width', '5.5');
        setAttrSafe(sq, 'height', '5.5');
        setAttrSafe(sq, 'rx', '1');
        setAttrSafe(sq, 'fill', 'currentColor');
        if (cells[i][2] !== '1') {
          setAttrSafe(sq, 'fill-opacity', cells[i][2]);
        }
        appendChildSafe(svg, sq);
      }
      return svg;
    }
    if (toolMode === 'pen') {
      const p1 = safeCreateElementNS('http://www.w3.org/2000/svg', 'path');
      setAttrSafe(p1, 'd', 'M11.6 2.1a1.5 1.5 0 0 1 2.1 2.1L5.8 12.1 2.4 13.4l1.3-3.4z');
      setAttrSafe(p1, 'fill', 'none');
      setAttrSafe(p1, 'stroke', 'currentColor');
      setAttrSafe(p1, 'stroke-width', '1.6');
      setAttrSafe(p1, 'stroke-linejoin', 'round');
      appendChildSafe(svg, p1);
      return svg;
    }
    if (toolMode === 'crop') {
      const p1 = safeCreateElementNS('http://www.w3.org/2000/svg', 'path');
      setAttrSafe(p1, 'd', 'M4.5 1.5v10h10M1.5 4.5h10v10');
      setAttrSafe(p1, 'fill', 'none');
      setAttrSafe(p1, 'stroke', 'currentColor');
      setAttrSafe(p1, 'stroke-width', '1.7');
      setAttrSafe(p1, 'stroke-linecap', 'round');
      setAttrSafe(p1, 'stroke-linejoin', 'round');
      appendChildSafe(svg, p1);
      return svg;
    }
    if (toolMode === 'scroll') {
      const p1 = safeCreateElementNS('http://www.w3.org/2000/svg', 'path');
      setAttrSafe(p1, 'd', 'M8 1.6v12.8M5.2 4.3L8 1.6l2.8 2.7M5.2 11.7L8 14.4l2.8-2.7');
      setAttrSafe(p1, 'fill', 'none');
      setAttrSafe(p1, 'stroke', 'currentColor');
      setAttrSafe(p1, 'stroke-width', '1.6');
      setAttrSafe(p1, 'stroke-linecap', 'round');
      setAttrSafe(p1, 'stroke-linejoin', 'round');
      appendChildSafe(svg, p1);
      return svg;
    }
    const rect = safeCreateElementNS('http://www.w3.org/2000/svg', 'rect');
    if (toolMode === 'outline') {
      setAttrSafe(rect, 'x', '2.2');
      setAttrSafe(rect, 'y', '2.2');
      setAttrSafe(rect, 'width', '11.6');
      setAttrSafe(rect, 'height', '11.6');
      setAttrSafe(rect, 'rx', '2');
      setAttrSafe(rect, 'fill', 'none');
      setAttrSafe(rect, 'stroke', 'currentColor');
      setAttrSafe(rect, 'stroke-width', '2.2');
    } else {
      setAttrSafe(rect, 'x', '2');
      setAttrSafe(rect, 'y', '2');
      setAttrSafe(rect, 'width', '12');
      setAttrSafe(rect, 'height', '12');
      setAttrSafe(rect, 'rx', '2');
      setAttrSafe(rect, 'fill', 'currentColor');
    }
    appendChildSafe(svg, rect);
    return svg;
  }

  function createWeightIconSvg(dotPx) {
    const svg = safeCreateElementNS('http://www.w3.org/2000/svg', 'svg');
    setAttrSafe(svg, 'width', '14');
    setAttrSafe(svg, 'height', '14');
    setAttrSafe(svg, 'viewBox', '0 0 14 14');
    setAttrSafe(svg, 'aria-hidden', 'true');
    const c = safeCreateElementNS('http://www.w3.org/2000/svg', 'circle');
    setAttrSafe(c, 'cx', '7');
    setAttrSafe(c, 'cy', '7');
    setAttrSafe(c, 'r', String(nativeMathMax(1.4, dotPx / 2)));
    setAttrSafe(c, 'fill', 'currentColor');
    appendChildSafe(svg, c);
    return svg;
  }

  function openRedactBatchModal(slides) {
    return new Promise((resolve) => {
      const mountTarget = document.body || document.documentElement;
      if (!mountTarget || !nativeIsArray(slides) || slides.length === 0) {
        resolve({ confirmed: true, slides: slides || [] });
        return;
      }

      const previousFocused = document.activeElement;
      const palette = getModalPalette();
      const { host, shadow, scrim, modal, header, titleGroup, titleEl } = createModalShell(
        palette,
        'min(92vw, 940px)'
      );
      const isBatch = slides.length > 1;
      let activeIdx = 0;
      let selectedBoxIdx = -1;
      let dragStart = null;
      let dragCurrent = null;
      let dragPoints = null;
      let lastDragViewPt = null;
      let scrollPanState = null;
      let activePointerId = null;
      let closed = false;
      let previewW = 1;
      let previewH = 1;
      let rafId = 0;
      let switchSeq = 0;
      let activeMode = 'solid';
      let activeWeight = 'md';
      const modeColors = { solid: '#09090b', outline: '#ef4444', pen: '#ef4444' };
      let activeColor = modeColors.solid;
      const previewCache = new NativeMap();
      for (let i = 0; i < slides.length; i += 1) {
        if (!nativeIsArray(slides[i].undoHistory)) {
          slides[i].undoHistory = [];
        }
        if (slides[i].preview) {
          mapSet(previewCache, i, slides[i].preview);
        }
      }

      const ctxSave = (c) => (nativeCtxSave ? nativeCtxSave.call(c) : c.save());
      const ctxRestore = (c) => (nativeCtxRestore ? nativeCtxRestore.call(c) : c.restore());
      const ctxFillRect = (c, x, y, w, h) =>
        nativeCtxFillRect ? nativeCtxFillRect.call(c, x, y, w, h) : c.fillRect(x, y, w, h);
      const ctxStrokeRect = (c, x, y, w, h) =>
        nativeCtxStrokeRect ? nativeCtxStrokeRect.call(c, x, y, w, h) : c.strokeRect(x, y, w, h);

      header.style.paddingBottom = '8px';
      header.style.borderBottom = `1px solid ${palette.border}`;

      const dimEl = safeCreateElement('span');
      dimEl.style.fontSize = '11px';
      dimEl.style.fontVariantNumeric = 'tabular-nums';
      dimEl.style.color = palette.muted;
      dimEl.style.background = palette.surface;
      dimEl.style.border = `1px solid ${palette.border}`;
      dimEl.style.borderRadius = '6px';
      dimEl.style.padding = '2px 7px';
      appendChildSafe(titleGroup, dimEl);

      const skippedTagEl = safeCreateElement('span');
      setSafeText(skippedTagEl, i18n.redactSkippedTag);
      skippedTagEl.style.display = 'none';
      skippedTagEl.style.fontSize = '11px';
      skippedTagEl.style.fontWeight = '600';
      skippedTagEl.style.padding = '2px 8px';
      skippedTagEl.style.borderRadius = '999px';
      skippedTagEl.style.background = palette.warnBg;
      skippedTagEl.style.border = `1px solid ${palette.warnBorder}`;
      skippedTagEl.style.color = palette.warnText;
      appendChildSafe(titleGroup, skippedTagEl);

      const navGroup = safeCreateElement('div');
      navGroup.style.display = isBatch ? 'flex' : 'none';
      navGroup.style.alignItems = 'center';
      navGroup.style.gap = '6px';
      navGroup.style.flexWrap = 'wrap';

      const navStepper = safeCreateElement('div');
      navStepper.style.display = 'inline-flex';
      navStepper.style.alignItems = 'center';
      navStepper.style.gap = '2px';
      navStepper.style.padding = '2px';
      navStepper.style.borderRadius = '8px';
      navStepper.style.background = palette.surface;
      navStepper.style.border = `1px solid ${palette.border}`;

      const prevBtn = createModalButton(palette, `‹ ${i18n.redactBtnPrev}`, false);
      const nextBtn = createModalButton(palette, `${i18n.redactBtnNext} ›`, false);
      const skipBtn = createModalButton(palette, i18n.redactBtnSkip, false);
      prevBtn.style.height = '26px';
      prevBtn.style.padding = '0 9px';
      prevBtn.style.border = 'none';
      prevBtn.style.background = 'transparent';
      prevBtn.style.borderRadius = '6px';
      nextBtn.style.height = '26px';
      nextBtn.style.padding = '0 9px';
      nextBtn.style.border = 'none';
      nextBtn.style.background = 'transparent';
      nextBtn.style.borderRadius = '6px';
      skipBtn.style.height = '30px';
      skipBtn.style.padding = '0 10px';

      const pillBar = safeCreateElement('div');
      pillBar.style.display = 'inline-flex';
      pillBar.style.alignItems = 'center';
      pillBar.style.gap = '2px';

      function createDotsButton() {
        const dots = createModalButton(palette, '…', false);
        dots.style.display = 'none';
        dots.style.height = '26px';
        dots.style.minWidth = '24px';
        dots.style.padding = '0 5px';
        dots.style.border = 'none';
        dots.style.background = 'transparent';
        dots.style.color = palette.muted;
        dots.style.borderRadius = '6px';
        return dots;
      }

      const leftDotsBtn = isBatch && slides.length > 7 ? createDotsButton() : null;
      const rightDotsBtn = isBatch && slides.length > 7 ? createDotsButton() : null;
      let windowBounds = { startIdx: 0, endIdx: slides.length - 1 };

      const pillButtons = [];
      const pillFlowElements = [];
      let slideSelect = null;
      if (isBatch) {
        appendChildSafe(navStepper, prevBtn);
        for (let i = 0; i < slides.length; i += 1) {
          const pill = createModalButton(palette, String(i + 1), false);
          pill.style.height = '26px';
          pill.style.minWidth = '26px';
          pill.style.padding = '0 7px';
          pill.style.borderRadius = '6px';
          pill.style.border = '1px solid transparent';
          pill.style.fontVariantNumeric = 'tabular-nums';
          nativeAddEventListener.call(pill, 'click', () => switchSlide(i));
          nativeArrayPush.call(pillButtons, pill);
          if (i === 1 && leftDotsBtn) {
            appendChildSafe(pillBar, leftDotsBtn);
            nativeArrayPush.call(pillFlowElements, leftDotsBtn);
          }
          if (i === slides.length - 1 && rightDotsBtn) {
            appendChildSafe(pillBar, rightDotsBtn);
            nativeArrayPush.call(pillFlowElements, rightDotsBtn);
          }
          appendChildSafe(pillBar, pill);
          nativeArrayPush.call(pillFlowElements, pill);
        }
        if (leftDotsBtn) {
          nativeAddEventListener.call(leftDotsBtn, 'click', () => {
            switchSlide(nativeMathMax(1, nativeMathFloor(windowBounds.startIdx / 2)));
          });
        }
        if (rightDotsBtn) {
          nativeAddEventListener.call(rightDotsBtn, 'click', () => {
            switchSlide(
              nativeMathMin(
                slides.length - 2,
                nativeMathCeil((windowBounds.endIdx + slides.length - 1) / 2)
              )
            );
          });
        }
        appendChildSafe(navStepper, pillBar);
        appendChildSafe(navStepper, nextBtn);
        appendChildSafe(navGroup, navStepper);

        if (slides.length > 7) {
          slideSelect = safeCreateElement('select');
          slideSelect.className = 'cz-select';
          setAttrSafe(slideSelect, 'aria-label', i18n.redactModalTitle);
          slideSelect.style.appearance = 'auto';
          slideSelect.style.height = '30px';
          slideSelect.style.padding = '0 8px';
          slideSelect.style.borderRadius = '7px';
          slideSelect.style.border = `1px solid ${palette.border}`;
          slideSelect.style.background = palette.surface;
          slideSelect.style.color = palette.text;
          slideSelect.style.font = 'inherit';
          slideSelect.style.fontSize = '12px';
          slideSelect.style.fontVariantNumeric = 'tabular-nums';
          slideSelect.style.cursor = 'pointer';
          for (let i = 0; i < slides.length; i += 1) {
            const opt = safeCreateElement('option');
            opt.value = String(i);
            setSafeText(opt, `${i + 1} / ${slides.length}`);
            appendChildSafe(slideSelect, opt);
          }
          nativeAddEventListener.call(slideSelect, 'change', () => {
            const target = Number(slideSelect.value);
            if (Number.isInteger(target) && target >= 0 && target < slides.length) {
              switchSlide(target);
              focusCanvasQuiet();
            }
          });
          appendChildSafe(navGroup, slideSelect);
        }

        appendChildSafe(navGroup, skipBtn);
        appendChildSafe(header, navGroup);
      }

      const toolBar = safeCreateElement('div');
      toolBar.style.display = 'flex';
      toolBar.style.alignItems = 'center';
      toolBar.style.gap = '8px';
      toolBar.style.flexWrap = 'wrap';

      const modeGroup = safeCreateElement('div');
      modeGroup.style.display = 'inline-flex';
      modeGroup.style.alignItems = 'center';
      modeGroup.style.gap = '2px';
      modeGroup.style.padding = '2px';
      modeGroup.style.borderRadius = '8px';
      modeGroup.style.background = palette.surface;
      modeGroup.style.border = `1px solid ${palette.border}`;

      function makeModeButton(label, toolMode) {
        const btn = createModalButton(palette, '', false);
        btn.style.height = '26px';
        btn.style.padding = '0 8px';
        btn.style.gap = '4px';
        btn.style.borderRadius = '6px';
        btn.style.border = '1px solid transparent';
        appendChildSafe(btn, createRedactToolIconSvg(toolMode));
        const txt = safeCreateElement('span');
        setSafeText(txt, label);
        appendChildSafe(btn, txt);
        return btn;
      }

      function makeBarDivider() {
        const div = safeCreateElement('span');
        setAttrSafe(div, 'aria-hidden', 'true');
        div.style.width = '1px';
        div.style.height = '18px';
        div.style.background = palette.border;
        return div;
      }

      const coverModeBtn = makeModeButton(i18n.redactModeCover, 'solid');
      const pixelModeBtn = makeModeButton(i18n.redactModePixel, 'pixel');
      const outlineModeBtn = makeModeButton(i18n.redactModeOutline, 'outline');
      const penModeBtn = makeModeButton(i18n.redactModePen, 'pen');
      const cropModeBtn = makeModeButton(i18n.redactModeCrop, 'crop');
      const scrollModeBtn = makeModeButton(i18n.redactModeScroll, 'scroll');
      appendChildSafe(modeGroup, coverModeBtn);
      appendChildSafe(modeGroup, pixelModeBtn);
      appendChildSafe(modeGroup, outlineModeBtn);
      appendChildSafe(modeGroup, penModeBtn);
      appendChildSafe(modeGroup, cropModeBtn);
      appendChildSafe(modeGroup, scrollModeBtn);

      const colorGroup = safeCreateElement('div');
      colorGroup.style.display = 'inline-flex';
      colorGroup.style.alignItems = 'center';
      colorGroup.style.gap = '7px';
      colorGroup.style.flexWrap = 'wrap';

      const colorButtons = [];
      for (let i = 0; i < REDACT_COLORS.length; i += 1) {
        const spec = REDACT_COLORS[i];
        const swatch = safeCreateElement('button');
        swatch.type = 'button';
        swatch.className = 'cz-btn';
        const colorName = i18n[spec.labelKey] || spec.hex;
        setAttrSafe(swatch, 'aria-label', colorName);
        swatch.title = colorName;
        swatch.style.appearance = 'none';
        swatch.style.width = '20px';
        swatch.style.height = '20px';
        swatch.style.padding = '0';
        swatch.style.borderRadius = '999px';
        swatch.style.cursor = 'pointer';
        swatch.style.background = spec.hex;
        swatch.style.border = `1px solid ${spec.hex === '#ffffff' ? '#a1a1aa' : palette.border}`;
        nativeAddEventListener.call(swatch, 'click', (e) => {
          setActiveColor(spec.hex, (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
        });
        nativeArrayPush.call(colorButtons, { hex: spec.hex, btn: swatch });
        appendChildSafe(colorGroup, swatch);
      }

      const weightDivider = makeBarDivider();
      const weightGroup = safeCreateElement('div');
      weightGroup.style.display = 'inline-flex';
      weightGroup.style.alignItems = 'center';
      weightGroup.style.gap = '2px';
      weightGroup.style.padding = '2px';
      weightGroup.style.borderRadius = '8px';
      weightGroup.style.background = palette.surface;
      weightGroup.style.border = `1px solid ${palette.border}`;

      const weightButtons = [];
      for (let i = 0; i < REDACT_WEIGHTS.length; i += 1) {
        const spec = REDACT_WEIGHTS[i];
        const wBtn = createModalButton(palette, '', false);
        const wLabel = i18n[spec.labelKey] || spec.id;
        setAttrSafe(wBtn, 'aria-label', wLabel);
        wBtn.title = wLabel;
        wBtn.style.height = '24px';
        wBtn.style.width = '24px';
        wBtn.style.padding = '0';
        wBtn.style.borderRadius = '6px';
        wBtn.style.border = '1px solid transparent';
        appendChildSafe(wBtn, createWeightIconSvg(spec.dotPx));
        nativeAddEventListener.call(wBtn, 'click', (e) => {
          setActiveWeight(spec.id, (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
        });
        nativeArrayPush.call(weightButtons, { id: spec.id, btn: wBtn });
        appendChildSafe(weightGroup, wBtn);
      }

      const subToolGroup = safeCreateElement('div');
      subToolGroup.style.display = 'inline-flex';
      subToolGroup.style.alignItems = 'center';
      subToolGroup.style.gap = '9px';
      subToolGroup.style.flexWrap = 'wrap';
      appendChildSafe(subToolGroup, colorGroup);
      appendChildSafe(subToolGroup, weightDivider);
      appendChildSafe(subToolGroup, weightGroup);

      appendChildSafe(toolBar, modeGroup);
      appendChildSafe(toolBar, subToolGroup);

      const stage = safeCreateElement('div');
      stage.style.display = 'flex';
      stage.style.flex = '1 1 auto';
      stage.style.minHeight = '140px';
      stage.style.alignItems = 'center';
      stage.style.justifyContent = 'center';
      stage.style.overflowX = 'hidden';
      stage.style.overflowY = 'auto';
      stage.style.borderRadius = '10px';
      stage.style.background = '#0d0d11';
      stage.style.border = `1px solid ${palette.border}`;
      stage.style.padding = '8px';

      const canvas = safeCreateElement('canvas');
      canvas.tabIndex = 0;
      setAttrSafe(canvas, 'role', 'application');
      setAttrSafe(canvas, 'aria-label', i18n.redactModalTitle);
      canvas.style.display = 'block';
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = 'min(62vh, calc(92vh - 245px))';
      canvas.style.width = 'auto';
      canvas.style.height = 'auto';
      canvas.style.cursor = 'crosshair';
      canvas.style.touchAction = 'none';
      canvas.style.userSelect = 'none';
      canvas.style.outline = 'none';
      nativeAddEventListener.call(canvas, 'focus', () => {
        canvas.style.boxShadow = `0 0 0 2px ${palette.accent}`;
      });
      nativeAddEventListener.call(canvas, 'blur', () => {
        canvas.style.boxShadow = 'none';
      });

      const ctx = nativeCanvasGetContext
        ? nativeCanvasGetContext.call(canvas, '2d')
        : canvas.getContext('2d');
      const committedCanvas = safeCreateElement('canvas');
      const committedCtx = nativeCanvasGetContext
        ? nativeCanvasGetContext.call(committedCanvas, '2d')
        : committedCanvas.getContext('2d');

      const addBoxBtn = createModalButton(palette, i18n.redactBtnAddBox, false);
      const undoBtn = createModalButton(palette, i18n.redactBtnUndo, false);
      const clearBtn = createModalButton(palette, i18n.redactBtnClear, false);
      const cancelBtn = createModalButton(palette, i18n.redactBtnCancel, false);
      const sendBtn = createModalButton(palette, i18n.redactBtnSend, true);

      function getCurrentSlide() {
        return slides[activeIdx];
      }

      function cancelScheduledPreviewDraw() {
        if (rafId !== 0) {
          if (nativeCAF) {
            nativeCAF(rafId);
          } else if (typeof window.cancelAnimationFrame === 'function') {
            window.cancelAnimationFrame(rafId);
          }
        }
        rafId = 0;
      }

      function releaseAllCachedPreviews() {
        for (let i = 0; i < slides.length; i += 1) {
          if (slides[i].preview) {
            releaseImageSource(slides[i].preview);
            slides[i].preview = null;
          }
        }
        mapClear(previewCache);
      }

      function storePreviewInCache(idx, previewSrc) {
        if (!previewSrc || !slides[idx]) {
          return;
        }
        if (mapHas(previewCache, idx)) {
          mapDelete(previewCache, idx);
        }
        mapSet(previewCache, idx, previewSrc);
        slides[idx].preview = previewSrc;
        while (mapSize(previewCache) > MAX_PREVIEW_CACHE_SLIDES) {
          let evictIdx = mapOldestKey(previewCache);
          if (evictIdx === activeIdx && mapSize(previewCache) > 1) {
            const activeVal = mapGet(previewCache, evictIdx);
            mapDelete(previewCache, evictIdx);
            mapSet(previewCache, evictIdx, activeVal);
            evictIdx = mapOldestKey(previewCache);
          }
          if (evictIdx === undefined || evictIdx === activeIdx) {
            break;
          }
          const evicted = mapGet(previewCache, evictIdx);
          mapDelete(previewCache, evictIdx);
          if (slides[evictIdx]) {
            slides[evictIdx].preview = null;
          }
          releaseImageSource(evicted);
        }
      }

      function resetActiveDrag() {
        if (activePointerId !== null) {
          try {
            const held = nativeHasPointerCapture
              ? nativeHasPointerCapture.call(canvas, activePointerId)
              : typeof canvas.hasPointerCapture === 'function'
                ? canvas.hasPointerCapture(activePointerId)
                : false;
            if (held) {
              if (nativeReleasePointerCapture) {
                nativeReleasePointerCapture.call(canvas, activePointerId);
              } else if (typeof canvas.releasePointerCapture === 'function') {
                canvas.releasePointerCapture(activePointerId);
              }
            }
          } catch {
            // Ignore pointer capture release errors cleanly.
          }
        }
        dragStart = null;
        dragCurrent = null;
        dragPoints = null;
        lastDragViewPt = null;
        scrollPanState = null;
        activePointerId = null;
      }

      function getEffectiveView(slide) {
        if (activeMode === 'crop' || !slide || !isActiveCropRegion(slide.crop)) {
          return { x: 0, y: 0, w: 1, h: 1 };
        }
        return normalizeCropRegion(slide.crop);
      }

      function applyCanvasViewportLayout(w, h, effW) {
        const isTallPortrait = h > w * 1.85;
        canvas.style.aspectRatio = `${w} / ${h}`;
        if (isTallPortrait) {
          const cappedW = nativeMathMin(540, effW || w);
          stage.style.alignItems = 'flex-start';
          canvas.style.maxWidth = 'min(100%, 720px)';
          canvas.style.maxHeight = 'none';
          canvas.style.width = `min(100%, ${cappedW}px)`;
          canvas.style.height = 'auto';
        } else {
          stage.style.alignItems = 'center';
          canvas.style.maxWidth = '100%';
          canvas.style.maxHeight = 'min(62vh, calc(92vh - 245px))';
          canvas.style.width = 'auto';
          canvas.style.height = 'auto';
        }
      }

      function syncViewportDimensions(slide) {
        const view = getEffectiveView(slide);
        const effW = nativeMathMax(1, nativeMathRound(slide.width * view.w));
        const effH = nativeMathMax(1, nativeMathRound(slide.height * view.h));
        const scale = nativeMathMin(1, MAX_PREVIEW_EDGE / nativeMathMax(effW, effH));
        const nextW = nativeMathMax(1, nativeMathRound(effW * scale));
        const nextH = nativeMathMax(1, nativeMathRound(effH * scale));
        if (nextW !== previewW || nextH !== previewH) {
          previewW = nextW;
          previewH = nextH;
          canvas.width = previewW;
          canvas.height = previewH;
          committedCanvas.width = previewW;
          committedCanvas.height = previewH;
        }
        applyCanvasViewportLayout(previewW, previewH, effW);
      }

      function drawSlideBaseToContext(targetCtx, slide, view) {
        if (slide.preview && slide.preview.source) {
          const srcW = slide.preview.width || previewW;
          const srcH = slide.preview.height || previewH;
          if (isActiveCropRegion(view)) {
            if (nativeCtxDrawImage) {
              nativeCtxDrawImage.call(
                targetCtx,
                slide.preview.source,
                view.x * srcW,
                view.y * srcH,
                view.w * srcW,
                view.h * srcH,
                0,
                0,
                previewW,
                previewH
              );
            } else {
              targetCtx.drawImage(
                slide.preview.source,
                view.x * srcW,
                view.y * srcH,
                view.w * srcW,
                view.h * srcH,
                0,
                0,
                previewW,
                previewH
              );
            }
          } else if (nativeCtxDrawImage) {
            nativeCtxDrawImage.call(targetCtx, slide.preview.source, 0, 0, previewW, previewH);
          } else {
            targetCtx.drawImage(slide.preview.source, 0, 0, previewW, previewH);
          }
        } else {
          targetCtx.fillStyle = '#18181b';
          ctxFillRect(targetCtx, 0, 0, previewW, previewH);
        }
      }

      function rebuildCommittedPreview() {
        if (!committedCtx) {
          return;
        }
        const slide = getCurrentSlide();
        const view = getEffectiveView(slide);
        committedCtx.clearRect(0, 0, previewW, previewH);
        drawSlideBaseToContext(committedCtx, slide, view);
        const viewBoxes = mapBoxesToRegion(slide.boxes, view);
        const pSrc = slide && slide.preview && slide.preview.source ? slide.preview.source : null;
        const srcW = (slide && slide.preview && slide.preview.width) || previewW;
        const srcH = (slide && slide.preview && slide.preview.height) || previewH;
        const pCropPx = isActiveCropRegion(view)
          ? { x: view.x * srcW, y: view.y * srcH, w: view.w * srcW, h: view.h * srcH }
          : { x: 0, y: 0, w: srcW, h: srcH };
        applyRedactionBoxes(committedCtx, viewBoxes, previewW, previewH, pSrc, pCropPx);
      }

      function drawCropOverlay(rectNorm) {
        if (!rectNorm) {
          return;
        }
        const cx = nativeMathRound(rectNorm.x * previewW);
        const cy = nativeMathRound(rectNorm.y * previewH);
        const cw = nativeMathMax(1, nativeMathRound(rectNorm.w * previewW));
        const ch = nativeMathMax(1, nativeMathRound(rectNorm.h * previewH));
        ctxSave(ctx);
        ctx.fillStyle = 'rgba(9, 9, 11, 0.62)';
        if (cy > 0) ctxFillRect(ctx, 0, 0, previewW, cy);
        if (cy + ch < previewH) ctxFillRect(ctx, 0, cy + ch, previewW, previewH - (cy + ch));
        if (cx > 0) ctxFillRect(ctx, 0, cy, cx, ch);
        if (cx + cw < previewW) ctxFillRect(ctx, cx + cw, cy, previewW - (cx + cw), ch);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctxStrokeRect(ctx, cx + 1, cy + 1, nativeMathMax(1, cw - 2), nativeMathMax(1, ch - 2));
        ctx.fillStyle = '#0a84ff';
        const hs = 7;
        ctxFillRect(ctx, cx - 2, cy - 2, hs, hs);
        ctxFillRect(ctx, cx + cw - hs + 2, cy - 2, hs, hs);
        ctxFillRect(ctx, cx - 2, cy + ch - hs + 2, hs, hs);
        ctxFillRect(ctx, cx + cw - hs + 2, cy + ch - hs + 2, hs, hs);
        ctxRestore(ctx);
      }

      function redrawPreview() {
        if (!ctx) {
          return;
        }
        const slide = getCurrentSlide();
        const view = getEffectiveView(slide);
        ctx.clearRect(0, 0, previewW, previewH);
        if (committedCtx) {
          if (nativeCtxDrawImage) {
            nativeCtxDrawImage.call(ctx, committedCanvas, 0, 0);
          } else {
            ctx.drawImage(committedCanvas, 0, 0);
          }
        } else {
          drawSlideBaseToContext(ctx, slide, view);
          const pSrc = slide && slide.preview && slide.preview.source ? slide.preview.source : null;
          const srcW = (slide && slide.preview && slide.preview.width) || previewW;
          const srcH = (slide && slide.preview && slide.preview.height) || previewH;
          const pCropPx = isActiveCropRegion(view)
            ? { x: view.x * srcW, y: view.y * srcH, w: view.w * srcW, h: view.h * srcH }
            : { x: 0, y: 0, w: srcW, h: srcH };
          applyRedactionBoxes(
            ctx,
            mapBoxesToRegion(slide.boxes, view),
            previewW,
            previewH,
            pSrc,
            pCropPx
          );
        }
        if (
          !slide.skipped &&
          activeMode !== 'scroll' &&
          selectedBoxIdx >= 0 &&
          selectedBoxIdx < slide.boxes.length
        ) {
          const viewSelBox = mapBoxesToRegion([slide.boxes[selectedBoxIdx]], view)[0];
          const selBounds = getStrokeBoundingBox(viewSelBox);
          if (selBounds) {
            const sx = nativeMathFloor(selBounds.x * previewW);
            const sy = nativeMathFloor(selBounds.y * previewH);
            const sw = nativeMathMax(2, nativeMathCeil(selBounds.w * previewW));
            const sh = nativeMathMax(2, nativeMathCeil(selBounds.h * previewH));
            ctxSave(ctx);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctxStrokeRect(ctx, sx, sy, sw, sh);
            ctx.strokeStyle = '#0a84ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctxStrokeRect(ctx, sx, sy, sw, sh);
            ctx.setLineDash([]);
            ctx.fillStyle = '#0a84ff';
            const hSize = 6;
            ctxFillRect(ctx, sx - 3, sy - 3, hSize, hSize);
            ctxFillRect(ctx, sx + sw - 3, sy - 3, hSize, hSize);
            ctxFillRect(ctx, sx - 3, sy + sh - 3, hSize, hSize);
            ctxFillRect(ctx, sx + sw - 3, sy + sh - 3, hSize, hSize);
            ctxRestore(ctx);
          }
        }
        if (activeMode === 'crop') {
          const liveCrop =
            dragStart && dragCurrent
              ? {
                  x: nativeMathMin(dragStart.x, dragCurrent.x),
                  y: nativeMathMin(dragStart.y, dragCurrent.y),
                  w: nativeMathAbs(dragCurrent.x - dragStart.x),
                  h: nativeMathAbs(dragCurrent.y - dragStart.y),
                }
              : isActiveCropRegion(slide.crop)
                ? normalizeCropRegion(slide.crop)
                : null;
          drawCropOverlay(liveCrop);
          if (dragStart && dragCurrent) {
            updateDimBadge(slide, liveCrop);
          }
        } else if (dragPoints && dragPoints.length >= 2) {
          const weights = computeToolStrokeWeights(previewW, previewH, activeWeight);
          const previewStroke = mapBoxesToRegion(
            [{ mode: 'pen', color: activeColor, weight: activeWeight, points: dragPoints }],
            view
          )[0];
          ctxSave(ctx);
          drawPenStroke(ctx, previewStroke, previewW, previewH, weights.pen);
          ctxRestore(ctx);
        } else if (dragStart && dragCurrent) {
          const x = nativeMathMin(dragStart.x, dragCurrent.x);
          const y = nativeMathMin(dragStart.y, dragCurrent.y);
          const w = nativeMathAbs(dragCurrent.x - dragStart.x);
          const h = nativeMathAbs(dragCurrent.y - dragStart.y);
          const weights = computeToolStrokeWeights(previewW, previewH, activeWeight);
          ctxSave(ctx);
          if (activeMode === 'outline') {
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = nativeMathMax(2, weights.outline);
            ctxStrokeRect(ctx, x * previewW, y * previewH, w * previewW, h * previewH);
            if (activeColor === '#09090b') {
              ctx.strokeStyle = '#0a84ff';
              ctx.lineWidth = 1;
              ctxStrokeRect(
                ctx,
                x * previewW - 1,
                y * previewH - 1,
                w * previewW + 2,
                h * previewH + 2
              );
            }
          } else {
            ctx.strokeStyle = activeColor === '#09090b' ? '#ffffff' : activeColor;
            ctx.lineWidth = 2;
            ctx.fillStyle = activeColor;
            ctx.globalAlpha = 0.25;
            ctxFillRect(ctx, x * previewW, y * previewH, w * previewW, h * previewH);
            ctx.globalAlpha = 1;
            ctx.setLineDash([5, 4]);
            ctxStrokeRect(ctx, x * previewW, y * previewH, w * previewW, h * previewH);
            if (activeColor === '#09090b') {
              ctx.strokeStyle = '#0a84ff';
              ctx.lineWidth = 2;
              ctxStrokeRect(ctx, x * previewW, y * previewH, w * previewW, h * previewH);
            }
          }
          ctxRestore(ctx);
        }
      }

      function drawPreviewNow() {
        cancelScheduledPreviewDraw();
        redrawPreview();
      }

      function schedulePreviewDraw() {
        const rafFn =
          nativeRAF ||
          (typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame : null);
        if (!rafFn) {
          redrawPreview();
          return;
        }
        if (rafId !== 0) {
          return;
        }
        rafId = rafFn(() => {
          rafId = 0;
          if (!closed) {
            redrawPreview();
          }
        });
      }

      function refreshSlideCanvas(syncViewport) {
        const slide = getCurrentSlide();
        if (syncViewport) {
          syncViewportDimensions(slide);
        }
        rebuildCommittedPreview();
        refreshBatchUi();
        drawPreviewNow();
      }

      function stepSlide(delta) {
        switchSlide((activeIdx + delta + slides.length) % slides.length);
      }

      function getBatchVisiblePills(total, curIdx) {
        if (total <= 7) {
          const visible = new NativeSet();
          for (let i = 0; i < total; i += 1) {
            setAdd(visible, i);
          }
          return { visible, leftGap: false, rightGap: false, startIdx: 0, endIdx: total - 1 };
        }
        const visible = new NativeSet([0, total - 1]);
        let startIdx = nativeMathMax(1, curIdx - 1);
        let endIdx = nativeMathMin(total - 2, curIdx + 1);
        if (curIdx <= 2) {
          startIdx = 1;
          endIdx = nativeMathMin(total - 2, 3);
        } else if (curIdx >= total - 3) {
          startIdx = nativeMathMax(1, total - 4);
          endIdx = total - 2;
        }
        if (startIdx === 2) {
          startIdx = 1;
        }
        if (endIdx === total - 3) {
          endIdx = total - 2;
        }
        for (let i = startIdx; i <= endIdx; i += 1) {
          setAdd(visible, i);
        }
        return {
          visible,
          leftGap: startIdx > 1,
          rightGap: endIdx < total - 2,
          startIdx,
          endIdx,
        };
      }

      function focusCanvasQuiet() {
        try {
          canvas.focus({ preventScroll: true });
        } catch {
          canvas.focus();
        }
      }

      function styleModeButton(btn, active) {
        btn.style.background = active ? palette.accent : 'transparent';
        btn.style.color = active ? palette.accentText : palette.text;
        btn.style.borderColor = active ? palette.accent : 'transparent';
        btn.style.fontWeight = active ? '600' : '500';
        setAttrSafe(btn, 'aria-pressed', active ? 'true' : 'false');
      }

      function refreshToolBarUi() {
        const slide = getCurrentSlide();
        const disabled = Boolean(slide && slide.skipped);
        const hideSubTools = activeMode === 'pixel';
        subToolGroup.hidden = hideSubTools;
        subToolGroup.style.display = hideSubTools ? 'none' : 'inline-flex';
        const colorDisabled =
          disabled || hideSubTools || activeMode === 'crop' || activeMode === 'scroll';
        const weightEnabled =
          !disabled && !hideSubTools && (activeMode === 'outline' || activeMode === 'pen');
        styleModeButton(coverModeBtn, activeMode === 'solid');
        styleModeButton(pixelModeBtn, activeMode === 'pixel');
        styleModeButton(outlineModeBtn, activeMode === 'outline');
        styleModeButton(penModeBtn, activeMode === 'pen');
        styleModeButton(cropModeBtn, activeMode === 'crop');
        styleModeButton(scrollModeBtn, activeMode === 'scroll');
        coverModeBtn.disabled = disabled;
        pixelModeBtn.disabled = disabled;
        outlineModeBtn.disabled = disabled;
        penModeBtn.disabled = disabled;
        cropModeBtn.disabled = disabled;
        scrollModeBtn.disabled = disabled;

        toolBar.style.opacity = disabled ? '0.45' : '1';
        colorGroup.style.opacity = !disabled && colorDisabled ? '0.38' : '1';
        for (let i = 0; i < colorButtons.length; i += 1) {
          const item = colorButtons[i];
          const isSelected = !colorDisabled && item.hex === activeColor;
          item.btn.disabled = colorDisabled;
          setAttrSafe(item.btn, 'aria-pressed', isSelected ? 'true' : 'false');
          item.btn.style.boxShadow = isSelected
            ? `0 0 0 2px ${palette.bg}, 0 0 0 4px ${palette.accent}`
            : 'none';
          item.btn.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
        }

        weightGroup.style.opacity = !disabled && !weightEnabled ? '0.38' : '1';
        for (let i = 0; i < weightButtons.length; i += 1) {
          const item = weightButtons[i];
          const isSelected = item.id === activeWeight;
          item.btn.disabled = !weightEnabled;
          styleModeButton(item.btn, isSelected && weightEnabled);
        }
      }

      function setActiveMode(nextMode, refocus) {
        const normalized =
          nextMode === 'pixel' ||
          nextMode === 'outline' ||
          nextMode === 'pen' ||
          nextMode === 'crop' ||
          nextMode === 'scroll'
            ? nextMode
            : 'solid';
        activeMode = normalized;
        if (normalized === 'outline' || normalized === 'pen' || normalized === 'solid') {
          activeColor = modeColors[normalized];
        }
        // Clear box selection so switching tools never alters prior boxes.
        selectedBoxIdx = -1;
        resetActiveDrag();
        if (normalized === 'crop') {
          stage.scrollTop = 0;
          stage.scrollLeft = 0;
        }
        refreshSlideCanvas(true);
        if (refocus) {
          focusCanvasQuiet();
        }
      }

      function setActiveColor(hex, refocus) {
        if (!setHas(REDACT_COLOR_SET, hex)) {
          return;
        }
        activeColor = hex;
        if (activeMode === 'outline' || activeMode === 'pen') {
          modeColors[activeMode] = hex;
        } else {
          modeColors.solid = hex;
        }
        refreshToolBarUi();
        drawPreviewNow();
        if (refocus) {
          focusCanvasQuiet();
        }
      }

      function setActiveWeight(weightId, refocus) {
        if (!weightId || !nativeHasOwn(REDACT_WEIGHT_MAP, weightId)) {
          return;
        }
        activeWeight = weightId;
        refreshToolBarUi();
        drawPreviewNow();
        if (refocus) {
          focusCanvasQuiet();
        }
      }

      nativeAddEventListener.call(coverModeBtn, 'click', (e) => {
        setActiveMode('solid', (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
      });
      nativeAddEventListener.call(pixelModeBtn, 'click', (e) => {
        setActiveMode('pixel', (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
      });
      nativeAddEventListener.call(outlineModeBtn, 'click', (e) => {
        setActiveMode('outline', (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
      });
      nativeAddEventListener.call(penModeBtn, 'click', (e) => {
        setActiveMode('pen', (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
      });
      nativeAddEventListener.call(cropModeBtn, 'click', (e) => {
        setActiveMode('crop', (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
      });
      nativeAddEventListener.call(scrollModeBtn, 'click', (e) => {
        setActiveMode('scroll', (getEvProp(nativeDetailDesc, e, 'detail') || 0) > 0);
      });

      function updateDimBadge(slide, cropOverride) {
        if (!slide) {
          return;
        }
        const naturalW = slide.width;
        const naturalH = slide.height;
        const candidateCrop = cropOverride !== undefined ? cropOverride : slide.crop;
        const hasCrop = isActiveCropRegion(candidateCrop);
        const cropRegion = hasCrop ? normalizeCropRegion(candidateCrop) : { x: 0, y: 0, w: 1, h: 1 };
        const sx = hasCrop
          ? nativeMathMax(0, nativeMathMin(naturalW - 1, nativeMathRound(cropRegion.x * naturalW)))
          : 0;
        const sy = hasCrop
          ? nativeMathMax(0, nativeMathMin(naturalH - 1, nativeMathRound(cropRegion.y * naturalH)))
          : 0;
        const sw = hasCrop
          ? nativeMathMax(1, nativeMathMin(naturalW - sx, nativeMathRound(cropRegion.w * naturalW)))
          : naturalW;
        const sh = hasCrop
          ? nativeMathMax(1, nativeMathMin(naturalH - sy, nativeMathRound(cropRegion.h * naturalH)))
          : naturalH;
        const safeCap = state.optimizeImage ? MAX_OPTIMIZE_EDGE : 8192;
        const maxSide = nativeMathMax(sw, sh);
        const scale = maxSide > safeCap ? safeCap / maxSide : 1;
        const outW = nativeMathMax(1, nativeMathRound(sw * scale));
        const outH = nativeMathMax(1, nativeMathRound(sh * scale));
        const changed = hasCrop || outW !== naturalW || outH !== naturalH;
        setSafeText(
          dimEl,
          changed ? `${naturalW}×${naturalH} → ${outW}×${outH}` : `${naturalW}×${naturalH}`
        );
      }

      function refreshBatchUi() {
        const slide = getCurrentSlide();
        if (selectedBoxIdx >= slide.boxes.length) {
          selectedBoxIdx = slide.boxes.length - 1;
        }
        const counterStr = isBatch ? ` (${activeIdx + 1}/${slides.length})` : '';
        setSafeText(titleEl, `${i18n.redactModalTitle}${counterStr}`);
        const hasCrop = isActiveCropRegion(slide.crop);
        updateDimBadge(slide);
        skippedTagEl.style.display = slide.skipped ? 'inline-block' : 'none';
        canvas.style.opacity = slide.skipped ? '0.35' : '1';
        canvas.style.touchAction = activeMode === 'scroll' && !slide.skipped ? 'pan-x pan-y' : 'none';
        canvas.style.cursor = slide.skipped
          ? 'not-allowed'
          : activeMode === 'scroll'
            ? scrollPanState
              ? 'grabbing'
              : 'grab'
            : 'crosshair';

        addBoxBtn.disabled = slide.skipped;
        addBoxBtn.style.opacity = slide.skipped ? '0.45' : '1';
        refreshToolBarUi();

        const hasUndoHistory = nativeIsArray(slide.undoHistory) && slide.undoHistory.length > 0;
        const hasEdits = slide.boxes.length > 0 || hasCrop;
        undoBtn.disabled = slide.skipped || (!hasEdits && !hasUndoHistory);
        clearBtn.disabled = slide.skipped || !hasEdits;
        undoBtn.style.opacity = undoBtn.disabled ? '0.45' : '1';
        clearBtn.style.opacity = clearBtn.disabled ? '0.45' : '1';

        let includedCount = 0;
        for (let i = 0; i < slides.length; i += 1) {
          if (!slides[i].skipped) {
            includedCount += 1;
          }
        }
        setSafeText(
          sendBtn,
          isBatch ? `${i18n.redactBtnSend} (${includedCount})` : i18n.redactBtnSend
        );
        sendBtn.disabled = includedCount === 0;
        sendBtn.style.opacity = includedCount === 0 ? '0.45' : '1';

        if (isBatch) {
          setSafeText(skipBtn, slide.skipped ? i18n.redactBtnInclude : i18n.redactBtnSkip);
          skipBtn.style.background = slide.skipped ? palette.warnBg : palette.surface;
          skipBtn.style.borderColor = slide.skipped ? palette.warnBorder : palette.border;
          skipBtn.style.color = slide.skipped ? palette.warnText : palette.text;

          const win = getBatchVisiblePills(slides.length, activeIdx);
          windowBounds = { startIdx: win.startIdx, endIdx: win.endIdx };
          if (leftDotsBtn) {
            leftDotsBtn.style.display = win.leftGap ? 'inline-flex' : 'none';
          }
          if (rightDotsBtn) {
            rightDotsBtn.style.display = win.rightGap ? 'inline-flex' : 'none';
          }
          for (let i = 0; i < pillButtons.length; i += 1) {
            const pBtn = pillButtons[i];
            const s = slides[i];
            const isActive = i === activeIdx;
            const isVisible = setHas(win.visible, i);
            const hasSlideMark = s.boxes.length > 0 || isActiveCropRegion(s.crop);
            pBtn.style.display = isVisible ? 'inline-flex' : 'none';
            setSafeText(pBtn, hasSlideMark ? `${i + 1}•` : String(i + 1));
            pBtn.style.background = isActive ? palette.accent : 'transparent';
            pBtn.style.color = isActive ? palette.accentText : palette.text;
            pBtn.style.borderColor = isActive ? palette.accent : 'transparent';
            pBtn.style.fontWeight = isActive ? '600' : '500';
            pBtn.style.opacity = s.skipped ? '0.48' : '1';
            pBtn.style.textDecoration = s.skipped ? 'line-through' : 'none';
            if (slideSelect && slideSelect.options[i]) {
              const mark = s.skipped
                ? ' ×'
                : s.boxes.length > 0
                  ? ` • ${s.boxes.length}`
                  : isActiveCropRegion(s.crop)
                    ? ' •'
                    : '';
              setSafeText(slideSelect.options[i], `${i + 1} / ${slides.length}${mark}`);
            }
          }
          if (slideSelect) {
            slideSelect.value = String(activeIdx);
          }
        }
      }

      function addKeyboardBox() {
        const slide = getCurrentSlide();
        if (slide.skipped) {
          return;
        }
        if (activeMode === 'crop' || activeMode === 'scroll') {
          setActiveMode('solid', false);
        }
        const view = getEffectiveView(slide);
        const minWView = nativeMathMin(0.9, nativeMathMax(0.28, 24 / nativeMathMax(1, previewW)));
        const minHView = nativeMathMin(0.9, nativeMathMax(0.14, 24 / nativeMathMax(1, previewH)));
        const cascade = (slide.boxes.length % 5) * 0.03;
        const xView = nativeMathMax(0, nativeMathMin(1 - minWView, 0.5 - minWView / 2 + cascade));
        const yView = nativeMathMax(0, nativeMathMin(1 - minHView, 0.5 - minHView / 2 + cascade));
        const isBoxMode =
          activeMode === 'solid' || activeMode === 'pixel' || activeMode === 'outline';
        const boxMode = isBoxMode ? activeMode : 'solid';
        const boxColor = isBoxMode ? activeColor : modeColors.solid;
        const boxEntry = {
          x: clamp01(view.x + xView * view.w),
          y: clamp01(view.y + yView * view.h),
          w: minWView * view.w,
          h: minHView * view.h,
          mode: boxMode,
          color: boxColor,
          weight: boxMode === 'outline' ? activeWeight : undefined,
        };
        nativeArrayPush.call(slide.boxes, boxEntry);
        nativeArrayPush.call(slide.undoHistory, { kind: 'box' });
        selectedBoxIdx = slide.boxes.length - 1;
        refreshSlideCanvas(false);
        focusCanvasQuiet();
      }

      function cycleSelectedBox(delta) {
        const slide = getCurrentSlide();
        if (slide.skipped || slide.boxes.length === 0) {
          return;
        }
        if (selectedBoxIdx < 0 || selectedBoxIdx >= slide.boxes.length) {
          selectedBoxIdx = delta >= 0 ? 0 : slide.boxes.length - 1;
        } else {
          selectedBoxIdx = (selectedBoxIdx + delta + slide.boxes.length) % slide.boxes.length;
        }
        drawPreviewNow();
      }

      function moveSelectedBox(dxNorm, dyNorm) {
        const slide = getCurrentSlide();
        if (slide.skipped || selectedBoxIdx < 0 || selectedBoxIdx >= slide.boxes.length) {
          return;
        }
        const box = slide.boxes[selectedBoxIdx];
        const view = getEffectiveView(slide);
        if (box.mode === 'pen' && nativeIsArray(box.points)) {
          const pts = box.points;
          if (pts.length === 0) {
            return;
          }
          let minX = pts[0].x;
          let maxX = pts[0].x;
          let minY = pts[0].y;
          let maxY = pts[0].y;
          for (let i = 1; i < pts.length; i += 1) {
            const p = pts[i];
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          }
          const minBoundX = nativeMathMin(minX, view.x);
          const maxBoundX = nativeMathMax(maxX, view.x + view.w);
          const minBoundY = nativeMathMin(minY, view.y);
          const maxBoundY = nativeMathMax(maxY, view.y + view.h);
          const clampedDx = nativeMathMax(
            minBoundX - minX,
            nativeMathMin(maxBoundX - maxX, dxNorm)
          );
          const clampedDy = nativeMathMax(
            minBoundY - minY,
            nativeMathMin(maxBoundY - maxY, dyNorm)
          );
          for (let i = 0; i < pts.length; i += 1) {
            pts[i].x += clampedDx;
            pts[i].y += clampedDy;
          }
        } else {
          const minX = nativeMathMin(box.x, view.x);
          const maxRight = nativeMathMax(box.x + box.w, view.x + view.w);
          const minY = nativeMathMin(box.y, view.y);
          const maxBottom = nativeMathMax(box.y + box.h, view.y + view.h);
          box.x = nativeMathMax(minX, nativeMathMin(maxRight - box.w, box.x + dxNorm));
          box.y = nativeMathMax(minY, nativeMathMin(maxBottom - box.h, box.y + dyNorm));
        }
        rebuildCommittedPreview();
        drawPreviewNow();
      }

      function resizeSelectedBox(dwNorm, dhNorm) {
        const slide = getCurrentSlide();
        if (slide.skipped || selectedBoxIdx < 0 || selectedBoxIdx >= slide.boxes.length) {
          return;
        }
        const box = slide.boxes[selectedBoxIdx];
        if (box.mode === 'pen') {
          return;
        }
        const view = getEffectiveView(slide);
        const minW = nativeMathMin(
          view.w,
          nativeMathMax(0.01 * view.w, (4 / nativeMathMax(1, previewW)) * view.w)
        );
        const minH = nativeMathMin(
          view.h,
          nativeMathMax(0.01 * view.h, (4 / nativeMathMax(1, previewH)) * view.h)
        );
        const maxRight = nativeMathMin(1, nativeMathMax(box.x + box.w, view.x + view.w));
        const maxBottom = nativeMathMin(1, nativeMathMax(box.y + box.h, view.y + view.h));
        box.w = nativeMathMax(minW, nativeMathMin(maxRight - box.x, box.w + dwNorm));
        box.h = nativeMathMax(minH, nativeMathMin(maxBottom - box.y, box.h + dhNorm));
        rebuildCommittedPreview();
        drawPreviewNow();
      }

      function deleteSelectedBox() {
        const slide = getCurrentSlide();
        if (slide.skipped || selectedBoxIdx < 0 || selectedBoxIdx >= slide.boxes.length) {
          return;
        }
        const removedArr = nativeArraySplice.call(slide.boxes, selectedBoxIdx, 1);
        const removed = removedArr && removedArr[0] ? removedArr[0] : null;
        if (removed) {
          nativeArrayPush.call(slide.undoHistory, {
            kind: 'delete',
            index: selectedBoxIdx,
            box: removed,
          });
        }
        selectedBoxIdx =
          slide.boxes.length > 0 ? nativeMathMin(selectedBoxIdx, slide.boxes.length - 1) : -1;
        refreshSlideCanvas(false);
      }

      function loadSlidePreviewAsync(idx, seq) {
        const slide = slides[idx];
        if (!slide || slide.preview) {
          return;
        }
        (async () => {
          let fullLoaded = null;
          try {
            fullLoaded = await decodeSourceFromFile(slide.file);
            if (closed || seq !== switchSeq || activeIdx !== idx) {
              releaseImageSource(fullLoaded);
              return;
            }
            const previewSrc = await buildPreviewFromDecoded(fullLoaded);
            fullLoaded = null;
            if (closed || seq !== switchSeq || activeIdx !== idx) {
              releaseImageSource(previewSrc);
              return;
            }
            if (previewSrc) {
              storePreviewInCache(idx, previewSrc);
              rebuildCommittedPreview();
              drawPreviewNow();
            }
          } catch {
            releaseImageSource(fullLoaded);
          }
        })();
      }

      function switchSlide(targetIdx) {
        const clamped = nativeMathMax(0, nativeMathMin(slides.length - 1, targetIdx));
        resetActiveDrag();
        activeIdx = clamped;
        switchSeq += 1;
        const seq = switchSeq;
        const slide = getCurrentSlide();
        stage.scrollTop = 0;
        stage.scrollLeft = 0;
        selectedBoxIdx =
          activeMode !== 'crop' && activeMode !== 'scroll' && slide.boxes.length > 0
            ? slide.boxes.length - 1
            : -1;
        syncViewportDimensions(slide);
        if (slide.preview) {
          storePreviewInCache(clamped, slide.preview);
        }
        refreshSlideCanvas(false);
        if (!slide.preview) {
          loadSlidePreviewAsync(clamped, seq);
        }
      }

      function undoLastEdit(slide) {
        if (!slide || slide.skipped) {
          return;
        }
        if (nativeIsArray(slide.undoHistory) && slide.undoHistory.length > 0) {
          while (slide.undoHistory.length > 0) {
            const entry = nativeArrayPop.call(slide.undoHistory);
            if (entry && entry.kind === 'crop') {
              slide.crop = entry.prevCrop ? { ...entry.prevCrop } : null;
              refreshSlideCanvas(true);
              return;
            }
            if (entry && entry.kind === 'delete' && entry.box) {
              const insertAt = nativeMathMax(
                0,
                nativeMathMin(slide.boxes.length, entry.index || 0)
              );
              nativeArraySplice.call(slide.boxes, insertAt, 0, entry.box);
              selectedBoxIdx = insertAt;
              refreshSlideCanvas(false);
              return;
            }
            if (entry && entry.kind === 'box' && slide.boxes.length > 0) {
              nativeArrayPop.call(slide.boxes);
              selectedBoxIdx =
                slide.boxes.length > 0 ? nativeMathMin(selectedBoxIdx, slide.boxes.length - 1) : -1;
              refreshSlideCanvas(false);
              return;
            }
          }
        }
        if (slide.boxes.length > 0) {
          nativeArrayPop.call(slide.boxes);
          selectedBoxIdx =
            slide.boxes.length > 0 ? nativeMathMin(selectedBoxIdx, slide.boxes.length - 1) : -1;
          refreshSlideCanvas(false);
        } else if (isActiveCropRegion(slide.crop)) {
          slide.crop = null;
          refreshSlideCanvas(true);
        }
      }

      function toNormalized(clientX, clientY) {
        if (!nativeNumberIsFinite(clientX) || !nativeNumberIsFinite(clientY)) {
          return { x: 0, y: 0 };
        }
        const rect = nativeGetBoundingClientRect
          ? nativeGetBoundingClientRect.call(canvas)
          : canvas.getBoundingClientRect();
        if (!rect || rect.width <= 0 || rect.height <= 0) {
          return { x: 0, y: 0 };
        }
        return {
          x: clamp01((clientX - rect.left) / rect.width),
          y: clamp01((clientY - rect.top) / rect.height),
        };
      }

      nativeAddEventListener.call(canvas, 'pointerdown', (e) => {
        const slide = getCurrentSlide();
        const isPrimary = getEvProp(nativePointerPrimaryDesc, e, 'isPrimary');
        const pointerType = getEvProp(nativePointerTypeDesc, e, 'pointerType');
        const button = getEvProp(nativeMouseBtnDesc, e, 'button');
        const pointerId = getEvProp(nativePointerIdDesc, e, 'pointerId');
        const clientX = getEvProp(nativeClientXDesc, e, 'clientX');
        const clientY = getEvProp(nativeClientYDesc, e, 'clientY');
        if (slide.skipped || activePointerId !== null || isPrimary === false) {
          return;
        }
        if (activeMode === 'scroll') {
          if (
            pointerType === 'touch' ||
            button !== 0 ||
            !nativeNumberIsFinite(clientX) ||
            !nativeNumberIsFinite(clientY)
          ) {
            return;
          }
          safePreventDefault(e);
          activePointerId = pointerId !== undefined ? pointerId : 0;
          scrollPanState = {
            startX: clientX,
            startY: clientY,
            startScrollLeft: stage.scrollLeft,
            startScrollTop: stage.scrollTop,
          };
          try {
            if (nativeSetPointerCapture) {
              nativeSetPointerCapture.call(canvas, activePointerId);
            } else if (typeof canvas.setPointerCapture === 'function') {
              canvas.setPointerCapture(activePointerId);
            }
          } catch {
            // Ignore capture failures cleanly.
          }
          refreshBatchUi();
          return;
        }
        if (pointerType !== 'touch' && button !== 0) {
          return;
        }
        safePreventDefault(e);
        activePointerId = pointerId !== undefined ? pointerId : 0;
        try {
          if (nativeSetPointerCapture) {
            nativeSetPointerCapture.call(canvas, activePointerId);
          } else if (typeof canvas.setPointerCapture === 'function') {
            canvas.setPointerCapture(activePointerId);
          }
        } catch {
          // Ignore capture failures cleanly.
        }
        const view = getEffectiveView(slide);
        const viewPt = toNormalized(clientX, clientY);
        dragStart = viewPt;
        dragCurrent = viewPt;
        if (activeMode === 'pen') {
          lastDragViewPt = viewPt;
          dragPoints = [toFullNormalizedPoint(view, viewPt)];
        } else {
          lastDragViewPt = null;
          dragPoints = null;
        }
        drawPreviewNow();
      });

      nativeAddEventListener.call(canvas, 'pointermove', (e) => {
        const pointerId = getEvProp(nativePointerIdDesc, e, 'pointerId');
        const resolvedId = pointerId !== undefined ? pointerId : 0;
        if (activePointerId === null || resolvedId !== activePointerId) {
          return;
        }
        const clientX = getEvProp(nativeClientXDesc, e, 'clientX');
        const clientY = getEvProp(nativeClientYDesc, e, 'clientY');
        if (scrollPanState) {
          safePreventDefault(e);
          if (nativeNumberIsFinite(clientX) && nativeNumberIsFinite(clientY)) {
            stage.scrollLeft = scrollPanState.startScrollLeft - (clientX - scrollPanState.startX);
            stage.scrollTop = scrollPanState.startScrollTop - (clientY - scrollPanState.startY);
          }
          return;
        }
        if (!dragStart) {
          return;
        }
        safePreventDefault(e);
        const slide = getCurrentSlide();
        const view = getEffectiveView(slide);
        const viewPt = toNormalized(clientX, clientY);
        dragCurrent = viewPt;
        if (dragPoints && dragPoints.length < MAX_PEN_POINTS_PER_STROKE && lastDragViewPt) {
          const dxPx = (viewPt.x - lastDragViewPt.x) * previewW;
          const dyPx = (viewPt.y - lastDragViewPt.y) * previewH;
          if (dxPx * dxPx + dyPx * dyPx >= 6.25) {
            lastDragViewPt = viewPt;
            nativeArrayPush.call(dragPoints, toFullNormalizedPoint(view, viewPt));
          }
        }
        schedulePreviewDraw();
      });

      function selectItemAtPoint(slide, pt) {
        for (let i = slide.boxes.length - 1; i >= 0; i -= 1) {
          const bounds = getStrokeBoundingBox(slide.boxes[i]);
          if (
            bounds &&
            pt.x >= bounds.x &&
            pt.x <= bounds.x + bounds.w &&
            pt.y >= bounds.y &&
            pt.y <= bounds.y + bounds.h
          ) {
            return i;
          }
        }
        return -1;
      }

      function finishDrag(e) {
        const pointerId = getEvProp(nativePointerIdDesc, e, 'pointerId');
        const resolvedId = pointerId !== undefined ? pointerId : 0;
        if (activePointerId === null || resolvedId !== activePointerId) {
          return;
        }
        if (scrollPanState) {
          resetActiveDrag();
          focusCanvasQuiet();
          refreshBatchUi();
          return;
        }
        if (!dragStart) {
          return;
        }
        const slide = getCurrentSlide();
        const view = getEffectiveView(slide);
        const clientX = getEvProp(nativeClientXDesc, e, 'clientX');
        const clientY = getEvProp(nativeClientYDesc, e, 'clientY');
        const endViewPt = toNormalized(clientX, clientY);
        const startViewPt = dragStart;
        const points = dragPoints;
        resetActiveDrag();

        if (activeMode === 'crop') {
          const cx = nativeMathMin(startViewPt.x, endViewPt.x);
          const cy = nativeMathMin(startViewPt.y, endViewPt.y);
          const cw = nativeMathAbs(endViewPt.x - startViewPt.x);
          const ch = nativeMathAbs(endViewPt.y - startViewPt.y);
          const minCropW = nativeMathMin(12, nativeMathMax(4, previewW * 0.25));
          const minCropH = nativeMathMin(12, nativeMathMax(4, previewH * 0.25));
          if (
            !slide.skipped &&
            cw * previewW >= minCropW &&
            ch * previewH >= minCropH &&
            (cw < 0.995 || ch < 0.995)
          ) {
            nativeArrayPush.call(slide.undoHistory, {
              kind: 'crop',
              prevCrop: isActiveCropRegion(slide.crop) ? { ...slide.crop } : null,
            });
            slide.crop = { x: cx, y: cy, w: cw, h: ch };
            focusCanvasQuiet();
          }
          refreshBatchUi();
          drawPreviewNow();
          return;
        }

        const fullEnd = toFullNormalizedPoint(view, endViewPt);
        if (points) {
          if (points.length > 0 && points.length < MAX_PEN_POINTS_PER_STROKE) {
            const last = points[points.length - 1];
            if (last.x !== fullEnd.x || last.y !== fullEnd.y) {
              nativeArrayPush.call(points, fullEnd);
            }
          }
          let totalSpanPx = 0;
          if (points.length >= 2) {
            const mappedStroke = mapBoxesToRegion([{ mode: 'pen', points }], view)[0];
            const bounds = getStrokeBoundingBox(mappedStroke);
            totalSpanPx = bounds ? nativeMathMax(bounds.w * previewW, bounds.h * previewH) : 0;
            const endDistPx = nativeMathHypot(
              (endViewPt.x - startViewPt.x) * previewW,
              (endViewPt.y - startViewPt.y) * previewH
            );
            totalSpanPx = nativeMathMax(totalSpanPx, endDistPx);
          }
          if (!slide.skipped && points.length >= 2 && totalSpanPx >= 3) {
            nativeArrayPush.call(slide.boxes, {
              mode: 'pen',
              color: activeColor,
              weight: activeWeight,
              points,
            });
            nativeArrayPush.call(slide.undoHistory, { kind: 'box' });
            selectedBoxIdx = -1;
            rebuildCommittedPreview();
            focusCanvasQuiet();
          } else if (!slide.skipped) {
            selectedBoxIdx = selectItemAtPoint(slide, fullEnd);
            focusCanvasQuiet();
          }
        } else {
          const viewW = nativeMathAbs(endViewPt.x - startViewPt.x);
          const viewH = nativeMathAbs(endViewPt.y - startViewPt.y);
          if (!slide.skipped && viewW * previewW >= 4 && viewH * previewH >= 4) {
            const fullStart = toFullNormalizedPoint(view, startViewPt);
            const x = nativeMathMin(fullStart.x, fullEnd.x);
            const y = nativeMathMin(fullStart.y, fullEnd.y);
            const w = nativeMathAbs(fullEnd.x - fullStart.x);
            const h = nativeMathAbs(fullEnd.y - fullStart.y);
            nativeArrayPush.call(slide.boxes, {
              x,
              y,
              w,
              h,
              mode: activeMode,
              color: activeColor,
              weight: activeMode === 'outline' ? activeWeight : undefined,
            });
            nativeArrayPush.call(slide.undoHistory, { kind: 'box' });
            selectedBoxIdx = slide.boxes.length - 1;
            rebuildCommittedPreview();
            focusCanvasQuiet();
          } else if (!slide.skipped) {
            selectedBoxIdx = selectItemAtPoint(slide, fullEnd);
            focusCanvasQuiet();
          }
        }
        refreshBatchUi();
        drawPreviewNow();
      }

      function cancelActiveDrag(e) {
        const pointerId = getEvProp(nativePointerIdDesc, e, 'pointerId');
        const resolvedId = pointerId !== undefined ? pointerId : 0;
        if (activePointerId === null || resolvedId !== activePointerId) {
          return;
        }
        resetActiveDrag();
        refreshBatchUi();
        drawPreviewNow();
      }

      nativeAddEventListener.call(canvas, 'pointerup', finishDrag);
      nativeAddEventListener.call(canvas, 'pointercancel', cancelActiveDrag);
      nativeAddEventListener.call(canvas, 'lostpointercapture', cancelActiveDrag);

      if (isBatch) {
        nativeAddEventListener.call(prevBtn, 'click', () => stepSlide(-1));
        nativeAddEventListener.call(nextBtn, 'click', () => stepSlide(1));
        nativeAddEventListener.call(skipBtn, 'click', () => {
          const slide = getCurrentSlide();
          slide.skipped = !slide.skipped;
          resetActiveDrag();
          refreshBatchUi();
          drawPreviewNow();
        });
      }

      nativeAddEventListener.call(addBoxBtn, 'click', addKeyboardBox);

      nativeAddEventListener.call(undoBtn, 'click', () => {
        undoLastEdit(getCurrentSlide());
      });
      nativeAddEventListener.call(clearBtn, 'click', () => {
        const slide = getCurrentSlide();
        if (!slide.skipped && (slide.boxes.length > 0 || isActiveCropRegion(slide.crop))) {
          slide.boxes.length = 0;
          slide.crop = null;
          slide.undoHistory.length = 0;
          selectedBoxIdx = -1;
          refreshSlideCanvas(true);
        }
      });

      const ac = makeAbortControllerSafe();

      function closeModalWith(confirmed) {
        if (closed) {
          return;
        }
        closed = true;
        cancelScheduledPreviewDraw();
        if (ac) {
          abortSafe(ac);
        } else {
          nativeRemoveEventListener.call(window, 'keydown', onModalKeyDown, true);
        }
        releaseCanvasMemory(canvas);
        releaseCanvasMemory(committedCanvas);
        releaseAllCachedPreviews();
        removeNodeSafe(host);
        if (
          previousFocused &&
          previousFocused.isConnected &&
          typeof previousFocused.focus === 'function' &&
          (!document.activeElement || document.activeElement === document.body)
        ) {
          try {
            previousFocused.focus({ preventScroll: true });
          } catch {
            previousFocused.focus();
          }
        }
        resolve({ confirmed, slides });
      }

      function onModalKeyDown(e) {
        if (!e || !e.isTrusted) {
          return;
        }
        const key = String(getEvProp(nativeKeyDesc, e, 'key') || '');
        const lowerKey = key.toLowerCase();
        const slide = getCurrentSlide();
        const focused = shadow.activeElement;
        const isCanvasFocused = focused === canvas;

        if (key === 'Escape') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          closeModalWith(false);
        } else if (
          isBatch &&
          (key === 'PageUp' ||
            key === 'PageDown' ||
            (e.altKey && (key === 'ArrowLeft' || key === 'ArrowRight')))
        ) {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          const goPrev = key === 'PageUp' || key === 'ArrowLeft';
          stepSlide(goPrev ? -1 : 1);
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && lowerKey === 'n') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          addKeyboardBox();
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && lowerKey === 'o') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          if (!slide.skipped) {
            setActiveMode(activeMode === 'outline' ? 'solid' : 'outline', false);
          }
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && lowerKey === 'p') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          if (!slide.skipped) {
            setActiveMode(activeMode === 'pixel' ? 'solid' : 'pixel', false);
          }
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && lowerKey === 'd') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          if (!slide.skipped) {
            setActiveMode(activeMode === 'pen' ? 'solid' : 'pen', false);
          }
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && lowerKey === 'c') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          if (!slide.skipped) {
            setActiveMode(activeMode === 'crop' ? 'solid' : 'crop', false);
          }
        } else if (!e.ctrlKey && !e.metaKey && !e.altKey && lowerKey === 'h') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          if (!slide.skipped) {
            setActiveMode(activeMode === 'scroll' ? 'solid' : 'scroll', false);
          }
        } else if (key === ' ' && isCanvasFocused) {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          addKeyboardBox();
        } else if (
          (key === '[' || key === ']') &&
          !slide.skipped &&
          activeMode !== 'crop' &&
          activeMode !== 'scroll' &&
          slide.boxes.length > 0
        ) {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          cycleSelectedBox(key === ']' ? 1 : -1);
        } else if (
          (key === 'Delete' || key === 'Backspace') &&
          isCanvasFocused &&
          !slide.skipped
        ) {
          if (selectedBoxIdx >= 0) {
            safePreventDefault(e);
            safeStopImmediatePropagation(e);
            deleteSelectedBox();
          } else if (activeMode === 'crop' && isActiveCropRegion(slide.crop)) {
            safePreventDefault(e);
            safeStopImmediatePropagation(e);
            nativeArrayPush.call(slide.undoHistory, {
              kind: 'crop',
              prevCrop: { ...slide.crop },
            });
            slide.crop = null;
            refreshSlideCanvas(true);
          }
        } else if (
          key === 'ArrowLeft' ||
          key === 'ArrowRight' ||
          key === 'ArrowUp' ||
          key === 'ArrowDown'
        ) {
          if (
            isCanvasFocused &&
            !slide.skipped &&
            selectedBoxIdx >= 0 &&
            selectedBoxIdx < slide.boxes.length &&
            !e.altKey
          ) {
            safePreventDefault(e);
            safeStopImmediatePropagation(e);
            const view = getEffectiveView(slide);
            const stepPx = nativeMathMax(2, nativeMathRound(nativeMathMin(previewW, previewH) * 0.02));
            const dx = (stepPx / nativeMathMax(1, previewW)) * view.w;
            const dy = (stepPx / nativeMathMax(1, previewH)) * view.h;
            if (e.shiftKey) {
              if (key === 'ArrowLeft') resizeSelectedBox(-dx, 0);
              else if (key === 'ArrowRight') resizeSelectedBox(dx, 0);
              else if (key === 'ArrowUp') resizeSelectedBox(0, -dy);
              else resizeSelectedBox(0, dy);
            } else {
              if (key === 'ArrowLeft') moveSelectedBox(-dx, 0);
              else if (key === 'ArrowRight') moveSelectedBox(dx, 0);
              else if (key === 'ArrowUp') moveSelectedBox(0, -dy);
              else moveSelectedBox(0, dy);
            }
          } else if (isBatch && (key === 'ArrowLeft' || key === 'ArrowRight')) {
            safePreventDefault(e);
            safeStopImmediatePropagation(e);
            stepSlide(key === 'ArrowLeft' ? -1 : 1);
          }
        } else if (key === 'Tab') {
          handleModalTabKey(e, shadow, [
            ...(isBatch
              ? [prevBtn, ...pillFlowElements, nextBtn, ...(slideSelect ? [slideSelect] : []), skipBtn]
              : []),
            coverModeBtn,
            pixelModeBtn,
            outlineModeBtn,
            penModeBtn,
            cropModeBtn,
            scrollModeBtn,
            ...nativeArrayMap.call(colorButtons, (c) => c.btn),
            ...nativeArrayMap.call(weightButtons, (w) => w.btn),
            canvas,
            addBoxBtn,
            undoBtn,
            clearBtn,
            cancelBtn,
            sendBtn,
          ]);
        } else if (key === 'Enter') {
          if (
            focused === cancelBtn ||
            focused === addBoxBtn ||
            focused === undoBtn ||
            focused === clearBtn ||
            focused === prevBtn ||
            focused === nextBtn ||
            focused === skipBtn ||
            focused === leftDotsBtn ||
            focused === rightDotsBtn ||
            focused === slideSelect ||
            focused === coverModeBtn ||
            focused === pixelModeBtn ||
            focused === outlineModeBtn ||
            focused === penModeBtn ||
            focused === cropModeBtn ||
            focused === scrollModeBtn ||
            nativeArraySome.call(colorButtons, (c) => c.btn === focused) ||
            nativeArraySome.call(weightButtons, (w) => w.btn === focused) ||
            nativeArrayIncludes.call(pillButtons, focused)
          ) {
            return;
          }
          if (sendBtn.disabled) {
            return;
          }
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          closeModalWith(true);
        } else if ((e.ctrlKey || e.metaKey) && lowerKey === 'z') {
          safePreventDefault(e);
          safeStopImmediatePropagation(e);
          undoLastEdit(slide);
        }
      }

      nativeAddEventListener.call(cancelBtn, 'click', () => closeModalWith(false));
      nativeAddEventListener.call(sendBtn, 'click', () => {
        if (!sendBtn.disabled) {
          closeModalWith(true);
        }
      });
      if (ac) {
        nativeAddEventListener.call(window, 'keydown', onModalKeyDown, {
          capture: true,
          signal: ac.signal,
        });
      } else {
        nativeAddEventListener.call(window, 'keydown', onModalKeyDown, true);
      }

      const footer = safeCreateElement('div');
      footer.style.display = 'flex';
      footer.style.alignItems = 'center';
      footer.style.justifyContent = 'space-between';
      footer.style.gap = '10px';
      footer.style.flexWrap = 'wrap';
      footer.style.paddingTop = '4px';

      const hintEl = safeCreateElement('span');
      hintEl.style.fontSize = '11px';
      hintEl.style.color = palette.muted;
      setSafeText(hintEl, isBatch ? i18n.redactModalHintBatch : i18n.redactModalHint);

      const actions = safeCreateElement('div');
      actions.style.display = 'flex';
      actions.style.alignItems = 'center';
      actions.style.flexWrap = 'wrap';
      actions.style.gap = '6px';
      const footerActionBtns = [addBoxBtn, undoBtn, clearBtn, cancelBtn, sendBtn];
      for (let i = 0; i < footerActionBtns.length; i += 1) {
        footerActionBtns[i].style.height = '28px';
        footerActionBtns[i].style.padding = '0 11px';
      }
      const actionDivider = makeBarDivider();
      actionDivider.style.margin = '0 1px';
      appendChildSafe(actions, addBoxBtn);
      appendChildSafe(actions, undoBtn);
      appendChildSafe(actions, clearBtn);
      appendChildSafe(actions, actionDivider);
      appendChildSafe(actions, cancelBtn);
      appendChildSafe(actions, sendBtn);

      appendChildSafe(footer, hintEl);
      appendChildSafe(footer, actions);

      appendChildSafe(stage, canvas);
      appendChildSafe(modal, header);
      appendChildSafe(modal, toolBar);
      appendChildSafe(modal, stage);
      appendChildSafe(modal, footer);
      appendChildSafe(scrim, modal);
      appendChildSafe(shadow, scrim);
      appendChildSafe(mountTarget, host);

      switchSlide(0);
      focusCanvasQuiet();
    });
  }

  async function shouldResizeRasterForOptimize(file, width, height) {
    if (!state.optimizeImage || nativeMathMax(width, height) <= MAX_OPTIMIZE_EDGE) {
      return false;
    }
    const mime = (file.type || '').toLowerCase().split(';')[0].trim();
    if (mime === 'image/gif' || (file.name || '').toLowerCase().endsWith('.gif')) {
      if (file.size > 32 * 1024 * 1024) {
        return false;
      }
      if (readBlobArrayBuffer) {
        const probeBlob =
          nativeBlobSlice && file.size > 262144 ? nativeBlobSlice.call(file, 0, 262144) : file;
        let buf = await readBlobArrayBuffer.call(probeBlob);
        let bytes = new NativeUint8Array(buf);
        const animated = isAnimatedGifBytes(bytes);
        bytes = null;
        buf = null;
        return !animated;
      }
      return false;
    }
    return true;
  }

  async function renderLoadedRasterCanvas(file, loaded, boxes, crop, options) {
    const safeBoxes = nativeIsArray(boxes) ? boxes : [];
    const hasCrop = isActiveCropRegion(crop);
    const cropRegion = hasCrop ? normalizeCropRegion(crop) : { x: 0, y: 0, w: 1, h: 1 };
    const effW = nativeMathMax(1, nativeMathRound(loaded.width * cropRegion.w));
    const effH = nativeMathMax(1, nativeMathRound(loaded.height * cropRegion.h));
    const forceExport = Boolean(options && options.forceExport);
    const isExoticRaster = isExoticRasterCandidate(file);
    const needsResize =
      forceExport || safeBoxes.length > 0 || hasCrop || isExoticRaster
        ? false
        : await shouldResizeRasterForOptimize(file, effW, effH);

    if (!forceExport && safeBoxes.length === 0 && !hasCrop && !needsResize && !isExoticRaster) {
      return { blob: null, ext: null, mime: null, touched: false };
    }

    const outFmt = resolveCanvasOutputFormat(file);
    const blob = await renderCanvasBlob(
      loaded.source,
      loaded.width,
      loaded.height,
      safeBoxes,
      outFmt,
      Boolean(state.optimizeImage),
      crop
    );
    if (!blob) {
      return { blob: null, ext: null, mime: null, touched: false };
    }
    return {
      blob,
      ext: outFmt.ext,
      mime: outFmt.mime,
      touched: true,
    };
  }

  async function processSingleRasterCanvas(file, boxes, crop, options) {
    const safeBoxes = nativeIsArray(boxes) ? boxes : [];
    let loaded = null;
    try {
      loaded = await decodeSourceFromFile(file);
      return await renderLoadedRasterCanvas(file, loaded, safeBoxes, crop, options);
    } catch {
      return { blob: null, ext: null, mime: null, touched: false };
    } finally {
      releaseImageSource(loaded);
    }
  }

  // --- Unified Sync + Optional Async Pipeline ---

  function createRenamedFileSync(file) {
    if (!file || wsHas(processedFiles, file)) {
      return { file, changed: false };
    }
    const newName = generateUniqueName(file);
    if (!newName) {
      wsAdd(processedFiles, file);
      return { file, changed: false };
    }
    // Omit disk `lastModified` metadata so original filesystem timestamps are not carried over.
    const renamed = new NativeFile([file], newName, { type: file.type });
    wsAdd(processedFiles, renamed);
    return { file: renamed, changed: true };
  }

  function appendCanvasOutputFile(file, canvasRes, dataTransfer, renamedNames) {
    const newName = generateUniqueName(file, canvasRes.ext);
    const outName = newName || replaceFileExtension(file.name, canvasRes.ext);
    const outFile = new NativeFile([canvasRes.blob], outName, { type: canvasRes.mime });
    canvasRes.blob = null;
    wsAdd(processedFiles, outFile);
    safeDtItemsAdd(dataTransfer, outFile);
    if (newName || outName !== file.name) {
      nativeArrayPush.call(renamedNames, outName);
    }
  }

  async function processFilesAsync(files) {
    const buildPassthroughRes = () => {
      const origDt = new NativeDataTransfer();
      for (let i = 0; i < files.length; i += 1) {
        if (files[i]) {
          safeDtItemsAdd(origDt, files[i]);
        }
      }
      return {
        canceled: false,
        passthrough: true,
        dataTransfer: origDt,
        renamedNames: [],
        cleanedCount: 0,
        totalFileSecretsMasked: 0,
      };
    };

    if (isInstanceTornDown || (hasIsolatedBridge && !(await checkBridgeAlive(220)))) {
      return buildPassthroughRes();
    }

    const dataTransfer = new NativeDataTransfer();
    const renamedNames = [];
    let cleanedCount = 0;
    let totalFileSecretsMasked = 0;

    const slideByIndex = new NativeMap();
    const batchSlides = [];

    try {
      if (state.redactImage) {
        let cachedPreviewCount = 0;
        for (let i = 0; i < files.length; i += 1) {
          const f = files[i];
          if (!f || wsHas(processedFiles, f) || !isRasterCandidate(f)) {
            continue;
          }
          try {
            const fullLoaded = await decodeSourceFromFile(f);
            const width = fullLoaded.width;
            const height = fullLoaded.height;
            let preview = null;
            if (cachedPreviewCount === 0) {
              preview = await buildPreviewFromDecoded(fullLoaded);
              if (preview) {
                cachedPreviewCount += 1;
              }
            } else {
              releaseImageSource(fullLoaded);
            }
            const slide = {
              file: f,
              width,
              height,
              preview,
              boxes: [],
              crop: null,
              undoHistory: [],
              skipped: false,
            };
            nativeArrayPush.call(batchSlides, slide);
            mapSet(slideByIndex, i, slide);
          } catch {
            // Undecodable exotic images (e.g., HEIC on desktop browsers) pass through intact.
          }
        }
        if (batchSlides.length > 0) {
          const modalRes = await openRedactBatchModal(batchSlides);
          logDiag('Media', 'redactBatch', {
            slides: batchSlides.length,
            confirmed: Boolean(modalRes.confirmed),
            skippedCount: nativeArrayFilter.call(batchSlides, (s) => s.skipped).length,
            croppedCount: nativeArrayFilter.call(batchSlides, (s) => isActiveCropRegion(s.crop))
              .length,
            totalBoxes: nativeArrayReduce.call(batchSlides, (acc, s) => acc + s.boxes.length, 0),
          });
          if (!modalRes.confirmed) {
            return {
              canceled: true,
              dataTransfer: null,
              renamedNames: [],
              cleanedCount: 0,
              totalFileSecretsMasked: 0,
            };
          }
        }
      }

      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        if (!file || wsHas(processedFiles, file)) {
          if (file) {
            safeDtItemsAdd(dataTransfer, file);
          }
          continue;
        }

        const slide = mapGet(slideByIndex, i);
        if (slide) {
          if (slide.skipped) {
            continue;
          }
          const hasCrop = isActiveCropRegion(slide.crop);
          const effCrop = hasCrop ? normalizeCropRegion(slide.crop) : { x: 0, y: 0, w: 1, h: 1 };
          const effW = nativeMathMax(1, nativeMathRound(slide.width * effCrop.w));
          const effH = nativeMathMax(1, nativeMathRound(slide.height * effCrop.h));
          const needsCanvasExport =
            hasCrop ||
            slide.boxes.length > 0 ||
            isExoticRasterCandidate(file) ||
            (await shouldResizeRasterForOptimize(file, effW, effH));
          if (needsCanvasExport) {
            const canvasRes = await processSingleRasterCanvas(file, slide.boxes, slide.crop, {
              forceExport: true,
            });
            if (canvasRes.touched && canvasRes.blob) {
              appendCanvasOutputFile(file, canvasRes, dataTransfer, renamedNames);
              cleanedCount += 1;
              continue;
            }
          }
        } else if (
          !state.redactImage &&
          ((state.optimizeImage && isRasterCandidate(file)) || isExoticRasterCandidate(file))
        ) {
          const canvasRes = await processSingleRasterCanvas(file);
          if (canvasRes.touched && canvasRes.blob) {
            appendCanvasOutputFile(file, canvasRes, dataTransfer, renamedNames);
            cleanedCount += 1;
            continue;
          }
        }

        if (state.stripExif && detectExifFormat(file) === 'avif' && readBlobArrayBuffer) {
          try {
            let avifBuf = await readBlobArrayBuffer.call(file);
            let avifBytes = new NativeUint8Array(avifBuf);
            const hasAvifMeta = hasAvifMetadataMarkers(avifBytes);
            avifBytes = null;
            avifBuf = null;
            if (hasAvifMeta) {
              const avifCanvasRes = await processSingleRasterCanvas(file);
              if (avifCanvasRes.touched && avifCanvasRes.blob) {
                appendCanvasOutputFile(file, avifCanvasRes, dataTransfer, renamedNames);
                cleanedCount += 1;
                continue;
              }
            }
          } catch {
            // Fall through safely if AVIF probe/canvas fails.
          }
        }

        const newName = generateUniqueName(file);
        const finalName = newName || file.name;
        let cleanBytes = state.stripExif ? await stripFileMetadataBytes(file) : null;
        let textRes = !cleanBytes && isScannableTextFile(file) ? await sanitizeTextFileSecrets(file) : null;

        if (textRes && textRes.bytes) {
          const outFile = new NativeFile([textRes.bytes], finalName, {
            type: file.type || 'text/plain',
          });
          totalFileSecretsMasked += textRes.maskedCount;
          logDiag('Files', 'textFileSecretsMasked', {
            ext: resolveExtension(file, false) || 'none',
            maskedCount: textRes.maskedCount,
          });
          textRes.bytes = null;
          textRes.rawText = '';
          textRes.maskedText = '';
          textRes.findings = null;
          textRes = null;
          wsAdd(processedFiles, outFile);
          safeDtItemsAdd(dataTransfer, outFile);
          if (newName) {
            nativeArrayPush.call(renamedNames, finalName);
          }
        } else if (cleanBytes) {
          const cleanFile = new NativeFile([cleanBytes], finalName, { type: file.type });
          cleanBytes = null;
          wsAdd(processedFiles, cleanFile);
          safeDtItemsAdd(dataTransfer, cleanFile);
          cleanedCount += 1;
          if (newName) {
            nativeArrayPush.call(renamedNames, finalName);
          }
        } else if (newName) {
          const renamed = new NativeFile([file], newName, { type: file.type });
          wsAdd(processedFiles, renamed);
          safeDtItemsAdd(dataTransfer, renamed);
          nativeArrayPush.call(renamedNames, newName);
        } else {
          wsAdd(processedFiles, file);
          safeDtItemsAdd(dataTransfer, file);
        }
      }

      return { canceled: false, dataTransfer, renamedNames, cleanedCount, totalFileSecretsMasked };
    } finally {
      for (let i = 0; i < batchSlides.length; i += 1) {
        const slide = batchSlides[i];
        if (slide.preview) {
          releaseImageSource(slide.preview);
          slide.preview = null;
        }
      }
    }
  }

  function getDataTransferStringTypes(original) {
    const stringTypes = [];
    const seen = new NativeSet();
    const items =
      dtItemsDesc && typeof dtItemsDesc.get === 'function'
        ? dtItemsDesc.get.call(original)
        : original.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const kind =
          dtiKindDesc && typeof dtiKindDesc.get === 'function'
            ? dtiKindDesc.get.call(item)
            : item.kind;
        const type =
          dtiTypeDesc && typeof dtiTypeDesc.get === 'function'
            ? dtiTypeDesc.get.call(item)
            : item.type;
        if (kind === 'string' && type && !setHas(seen, type)) {
          setAdd(seen, type);
          nativeArrayPush.call(stringTypes, type);
        }
      }
    }
    if (stringTypes.length === 0) {
      const types =
        dtTypesDesc && typeof dtTypesDesc.get === 'function'
          ? dtTypesDesc.get.call(original)
          : original.types;
      if (types && types.length > 0) {
        for (let i = 0; i < types.length; i += 1) {
          const type = types[i];
          if (
            typeof type === 'string' &&
            type &&
            type !== 'Files' &&
            type !== 'application/x-moz-file' &&
            !setHas(seen, type)
          ) {
            setAdd(seen, type);
            nativeArrayPush.call(stringTypes, type);
          }
        }
      }
    }
    return stringTypes;
  }

  function snapshotDataTransferMeta(original) {
    const files = [];
    const stringTypes = [];
    const seenTypes = new NativeSet();
    let hasPlainText = false;
    let hasWrapperOrUrlTypes = false;
    const items =
      dtItemsDesc && typeof dtItemsDesc.get === 'function'
        ? dtItemsDesc.get.call(original)
        : original.items;

    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const kind =
          dtiKindDesc && typeof dtiKindDesc.get === 'function'
            ? dtiKindDesc.get.call(item)
            : item.kind;
        const type =
          dtiTypeDesc && typeof dtiTypeDesc.get === 'function'
            ? dtiTypeDesc.get.call(item)
            : item.type;
        if (kind === 'file') {
          const f = dtiGetAsFile ? dtiGetAsFile.call(item) : item.getAsFile();
          if (f) {
            nativeArrayPush.call(files, f);
          }
        } else if (kind === 'string' && type && !setHas(seenTypes, type)) {
          setAdd(seenTypes, type);
          nativeArrayPush.call(stringTypes, type);
          const base = type.toLowerCase().split(';')[0].trim();
          if (base === 'text/plain') {
            hasPlainText = true;
          } else if (
            base === 'text/html' ||
            base === 'text/uri-list' ||
            base === 'text/x-moz-url'
          ) {
            hasWrapperOrUrlTypes = true;
          }
        }
      }
    }
    if (files.length === 0) {
      const origFiles = safeDtFiles(original);
      if (origFiles && origFiles.length > 0) {
        for (let i = 0; i < origFiles.length; i += 1) {
          nativeArrayPush.call(files, origFiles[i]);
        }
      }
    }
    if (stringTypes.length === 0) {
      const fallbackTypes = getDataTransferStringTypes(original);
      for (let i = 0; i < fallbackTypes.length; i += 1) {
        const type = fallbackTypes[i];
        nativeArrayPush.call(stringTypes, type);
        const base = type.toLowerCase().split(';')[0].trim();
        if (base === 'text/plain') {
          hasPlainText = true;
        } else if (
          base === 'text/html' ||
          base === 'text/uri-list' ||
          base === 'text/x-moz-url'
        ) {
          hasWrapperOrUrlTypes = true;
        }
      }
    }

    return { files, stringTypes, hasPlainText, hasWrapperOrUrlTypes };
  }

  function readDataTransferStrings(original, stringTypes, filterBaseMimeSet) {
    const typesList = nativeIsArray(stringTypes) ? stringTypes : getDataTransferStringTypes(original);
    const strings = [];
    for (let i = 0; i < typesList.length; i += 1) {
      const type = typesList[i];
      if (!type) {
        continue;
      }
      if (filterBaseMimeSet) {
        const base = type.toLowerCase().split(';')[0].trim();
        if (!setHas(filterBaseMimeSet, base)) {
          continue;
        }
      }
      try {
        const text = safeDtGetData(original, type);
        if (text) {
          nativeArrayPush.call(strings, { type, text });
        }
      } catch {
        // Ignore restricted or unsupported MIME types safely.
      }
    }
    return strings;
  }

  function snapshotDataTransfer(original) {
    const meta = snapshotDataTransferMeta(original);
    const strings =
      meta.files.length > 0 ? readDataTransferStrings(original, meta.stringTypes, null) : [];
    return { files: meta.files, strings };
  }

  function batchNeedsAction(files) {
    const seenBatchImageNames = new NativeSet();
    const skippedImages = [];
    const textSecretScanActive = Boolean(
      state.maskSecrets || state.maskPii || (state.customWords && state.customWords.trim())
    );
    let needsSync = false;
    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];
      if (!f || wsHas(processedFiles, f)) {
        continue;
      }
      if (((state.redactImage || state.optimizeImage) && isRasterCandidate(f)) || isExoticRasterCandidate(f)) {
        return 'async';
      }
      const exifFmt = state.stripExif ? detectExifFormat(f) : null;
      if (exifFmt) {
        if (exifFmt === 'svg' && f.size > MAX_SVG_BYTES) {
          // Exceeds SVG sanitization limit; avoid unnecessary async cloning.
        } else if (exifFmt === 'pdf' && f.size > MAX_PDF_BYTES) {
          // Exceeds PDF sanitization limit; avoid unnecessary async cloning.
        } else {
          return 'async';
        }
      }
      if (textSecretScanActive && isScannableTextFile(f)) {
        return 'async';
      }
      const isImg = isImageFile(f);
      const name = (f.name || '').trim();
      if (
        shouldRenameFile(f, isImg) ||
        (isImg && name && (setHas(usedNames, name) || setHas(seenBatchImageNames, name)))
      ) {
        needsSync = true;
      } else if (isImg && name) {
        setAdd(seenBatchImageNames, name);
        nativeArrayPush.call(skippedImages, f);
      }
    }
    if (needsSync) {
      return 'sync';
    }
    for (let i = 0; i < skippedImages.length; i += 1) {
      const f = skippedImages[i];
      wsAdd(processedFiles, f);
      trackName((f.name || '').trim());
    }
    return 'none';
  }

  function hasDraggedFiles(dt) {
    if (!dt) {
      return false;
    }
    const dtFiles = safeDtFiles(dt);
    if (dtFiles && dtFiles.length > 0) {
      return true;
    }
    const types = dtTypesDesc && typeof dtTypesDesc.get === 'function' ? dtTypesDesc.get.call(dt) : dt.types;
    if (types) {
      for (let i = 0; i < types.length; i += 1) {
        if (types[i] === 'Files' || types[i] === 'application/x-moz-file') {
          return true;
        }
      }
    }
    return false;
  }

  function handleDragEnter(event) {
    if (
      isInstanceTornDown ||
      !state.enabled ||
      !event ||
      isProcessedEvent(event) ||
      !hasDraggedFiles(getDragDataTransfer(event))
    ) {
      return;
    }
    triggerProactiveBridgeCheck();
    const target = getEventPathTarget(event);
    if (target) {
      setAdd(enteredDragTargets, target);
    }
  }

  function handleDragLeave(event) {
    if (!event || isProcessedEvent(event)) {
      return;
    }
    const target = getEventPathTarget(event);
    if (target) {
      setDelete(enteredDragTargets, target);
    }
    const cx = getEvProp(nativeClientXDesc, event, 'clientX');
    const cy = getEvProp(nativeClientYDesc, event, 'clientY');
    if (!event.relatedTarget || (typeof cx === 'number' && cx <= 0 && cy <= 0)) {
      setClear(enteredDragTargets);
    }
  }

  function handleWindowBlur() {
    setClear(enteredDragTargets);
  }

  function handleDragEnd(event) {
    if (!event || isProcessedEvent(event)) {
      return;
    }
    setClear(enteredDragTargets);
  }

  function dispatchDragExitEvent(target, eventType, dataTransfer) {
    if (!target || typeof target.dispatchEvent !== 'function' || typeof NativeDragEvent !== 'function') {
      return;
    }
    try {
      const ev = new NativeDragEvent(eventType, {
        bubbles: true,
        cancelable: true,
        composed: true,
        relatedTarget: null,
        clientX: -1,
        clientY: -1,
        dataTransfer,
      });
      markSyntheticEvent(ev);
      dispatchEventSafe(target, ev);
    } catch {
      try {
        const ev = new NativeDragEvent(eventType, {
          bubbles: true,
          cancelable: true,
          composed: true,
          clientX: -1,
          clientY: -1,
        });
        markSyntheticEvent(ev);
        dispatchEventSafe(target, ev);
      } catch {
        // Ignore non-dispatchable targets cleanly.
      }
    }
  }

  function dismissPageDragOverlay(initialTarget, pointTarget, targetsSnapshot) {
    const fallbackTarget =
      (pointTarget && pointTarget.isConnected && pointTarget) ||
      (initialTarget && (initialTarget === window || initialTarget.isConnected) && initialTarget) ||
      document.body ||
      document.documentElement;
    if (!fallbackTarget) {
      return;
    }
    const leaveDt = new NativeDataTransfer();
    const list =
      nativeIsArray(targetsSnapshot) && targetsSnapshot.length > 0
        ? targetsSnapshot
        : [fallbackTarget];
    for (let i = 0; i < list.length; i += 1) {
      const t = list[i];
      const liveTarget = t && (t === window || t.isConnected) ? t : fallbackTarget;
      dispatchDragExitEvent(liveTarget, 'dragleave', leaveDt);
    }
    dispatchDragExitEvent(fallbackTarget, 'dragend', leaveDt);
  }

  function populateStrings(dataTransfer, strings) {
    for (let i = 0; i < strings.length; i += 1) {
      try {
        safeDtSetData(dataTransfer, strings[i].type, strings[i].text);
      } catch {
        // Ignore restricted MIME types.
      }
    }
  }

  function sanitizeClipboardStrings(strings, files) {
    if (!nativeIsArray(strings) || strings.length === 0) {
      return { strings: strings || [], changed: false, textSecretsMasked: false };
    }
    const hasImageFile =
      nativeIsArray(files) && files.length > 0 && nativeArraySome.call(files, isImageFile);
    const maskActive = Boolean(
      state.maskSecrets || state.maskPii || (state.customWords && state.customWords.trim())
    );
    if (!hasImageFile && !maskActive) {
      return { strings, changed: false, textSecretsMasked: false };
    }
    let changed = false;
    let textSecretsMasked = false;
    const processed = [];
    for (let i = 0; i < strings.length; i += 1) {
      const entry = strings[i];
      if (!entry || typeof entry.text !== 'string') {
        continue;
      }
      const baseMime =
        typeof entry.type === 'string' ? entry.type.toLowerCase().split(';')[0].trim() : '';
      if (hasImageFile && (baseMime === 'text/uri-list' || baseMime === 'text/x-moz-url')) {
        changed = true;
        continue;
      }
      if (hasImageFile && baseMime === 'text/html' && isImageOnlyHtmlWrapper(entry.text)) {
        changed = true;
        continue;
      }
      if (maskActive && baseMime === 'text/plain') {
        const res = maskSensitiveText(entry.text);
        if (res.count > 0 && res.text !== entry.text) {
          changed = true;
          textSecretsMasked = true;
          nativeArrayPush.call(processed, { type: entry.type, text: res.text });
          continue;
        }
      }
      nativeArrayPush.call(processed, entry);
    }
    if (!changed) {
      return { strings, changed: false, textSecretsMasked: false };
    }
    if (!textSecretsMasked) {
      return { strings: processed, changed: true, textSecretsMasked: false };
    }
    const safeStrings = [];
    for (let i = 0; i < processed.length; i += 1) {
      const baseMime =
        typeof processed[i].type === 'string'
          ? processed[i].type.toLowerCase().split(';')[0].trim()
          : '';
      if (baseMime === 'text/html') {
        continue;
      }
      nativeArrayPush.call(safeStrings, processed[i]);
    }
    return { strings: safeStrings, changed: true, textSecretsMasked: true };
  }

  function cloneTransferWithReplacedFiles(sourceTransfer, newFiles, preSanitizedStrings) {
    const dataTransfer = new NativeDataTransfer();
    const filesList = nativeIsArray(newFiles) ? newFiles : [];
    for (let i = 0; i < filesList.length; i += 1) {
      if (filesList[i]) {
        safeDtItemsAdd(dataTransfer, filesList[i]);
      }
    }
    if (nativeIsArray(preSanitizedStrings)) {
      populateStrings(dataTransfer, preSanitizedStrings);
    } else if (sourceTransfer) {
      const rawStrings = readDataTransferStrings(sourceTransfer, null, null);
      const strRes = sanitizeClipboardStrings(rawStrings, filesList);
      populateStrings(dataTransfer, strRes.strings);
    }
    return dataTransfer;
  }

  function overrideEventTransfer(event, propName, dataTransfer) {
    try {
      defineProperty(event, propName, {
        value: dataTransfer,
        writable: false,
        configurable: true,
      });
      return true;
    } catch {
      return false;
    }
  }

  function summarizeFilesSafe(files) {
    const summary = [];
    for (let i = 0; i < files.length; i += 1) {
      const f = files[i];
      if (!f) continue;
      nativeArrayPush.call(summary, {
        mime: f.type || 'unknown',
        ext: resolveExtension(f, isImageFile(f)) || 'none',
        bytes: typeof f.size === 'number' ? f.size : -1,
      });
    }
    return summary;
  }

  function handleTransferEvent(event, propName, eventName, preMeta) {
    if (!state.enabled || !event || isProcessedEvent(event)) {
      return;
    }
    const original =
      propName === 'clipboardData'
        ? getClipboardData(event)
        : propName === 'dataTransfer'
          ? getDragDataTransfer(event)
          : event[propName];
    if (!original) {
      return;
    }

    const meta = preMeta || snapshotDataTransferMeta(original);
    const files = meta.files;
    const dragTargetsSnapshot = eventName === 'drop' ? setToArray(enteredDragTargets) : [];
    if (eventName === 'drop') {
      setClear(enteredDragTargets);
    }
    if (files.length === 0) {
      return;
    }

    const hasImageFile = nativeArraySome.call(files, isImageFile);
    const maskActive = Boolean(
      state.maskSecrets || state.maskPii || (state.customWords && state.customWords.trim())
    );
    const action = batchNeedsAction(files);
    const mightSanitizeStrings =
      meta.stringTypes.length > 0 &&
      ((hasImageFile && meta.hasWrapperOrUrlTypes) || (maskActive && meta.hasPlainText));

    if (action === 'none' && !mightSanitizeStrings) {
      return;
    }

    let strings = [];
    let stringsModified = false;
    let rawOriginalStrings = null;

    if (action === 'none') {
      const probeTypes = new NativeSet();
      if (hasImageFile && meta.hasWrapperOrUrlTypes) {
        setAdd(probeTypes, 'text/html');
        setAdd(probeTypes, 'text/uri-list');
        setAdd(probeTypes, 'text/x-moz-url');
      }
      if (maskActive && meta.hasPlainText) {
        setAdd(probeTypes, 'text/plain');
      }
      const probeStrings = readDataTransferStrings(original, meta.stringTypes, probeTypes);
      const probeRes = sanitizeClipboardStrings(probeStrings, files);
      if (!probeRes.changed) {
        return;
      }
      stringsModified = true;
      strings = probeRes.strings;
      if (meta.stringTypes.length > probeStrings.length) {
        const remainingTypes = new NativeSet();
        for (let i = 0; i < meta.stringTypes.length; i += 1) {
          const base = meta.stringTypes[i].toLowerCase().split(';')[0].trim();
          if (!setHas(probeTypes, base) && !(probeRes.textSecretsMasked && base === 'text/html')) {
            setAdd(remainingTypes, base);
          }
        }
        if (setSize(remainingTypes) > 0) {
          const remainingStrings = readDataTransferStrings(original, meta.stringTypes, remainingTypes);
          for (let i = 0; i < remainingStrings.length; i += 1) {
            nativeArrayPush.call(strings, remainingStrings[i]);
          }
        }
      }
    } else if (meta.stringTypes.length > 0) {
      // Read and sanitize synchronously before any await (browser DataTransfer clears after event dispatch).
      const rawStrings = readDataTransferStrings(original, meta.stringTypes, null);
      const strRes = sanitizeClipboardStrings(rawStrings, files);
      strings = strRes.strings;
      stringsModified = strRes.changed;
      if (hasIsolatedBridge && strRes.changed) {
        rawOriginalStrings = rawStrings;
      }
    }

    if (action === 'none' && !stringsModified) {
      return;
    }
    const safeFiles = state.debugLogs ? summarizeFilesSafe(files) : null;

    if (action === 'sync' || (action === 'none' && stringsModified)) {
      const outFiles = [];
      const renamedNames = [];
      let didModify = Boolean(stringsModified);

      for (let i = 0; i < files.length; i += 1) {
        if (action === 'sync') {
          const res = createRenamedFileSync(files[i]);
          nativeArrayPush.call(outFiles, res.file);
          if (res.changed) {
            nativeArrayPush.call(renamedNames, res.file.name);
            didModify = true;
          }
        } else {
          nativeArrayPush.call(outFiles, files[i]);
        }
      }
      if (!didModify) {
        return;
      }

      const dataTransfer = cloneTransferWithReplacedFiles(original, outFiles, strings);
      markSyntheticEvent(event);
      const overridden = overrideEventTransfer(event, propName, dataTransfer);
      logDiag('Files', `${eventName}:sync`, {
        site: window.location.hostname,
        files: safeFiles,
        renamedCount: renamedNames.length,
        overridden,
      });
      if (overridden && renamedNames.length > 0) {
        showUploadToast(renamedNames, 0, 0);
      }
      return;
    }

    // Async path (metadata cleaner, text file secret guard, Canvas redactor, or exotic flattening/resize): halt current event, process & re-dispatch.
    const rawTarget = getEventPathTarget(event);
    const initialTarget =
      rawTarget && rawTarget.nodeType === 3 ? rawTarget.parentElement : rawTarget;
    const rawX = getEvProp(nativeClientXDesc, event, 'clientX');
    const rawY = getEvProp(nativeClientYDesc, event, 'clientY');
    const clientX = typeof rawX === 'number' ? rawX : 0;
    const clientY = typeof rawY === 'number' ? rawY : 0;
    haltEvent(event);

    logDiag('Files', `${eventName}:asyncStart`, {
      site: window.location.hostname,
      files: safeFiles,
      targetTag: initialTarget ? initialTarget.tagName : null,
    });

    const asyncPromise = processFilesAsync(files);
    const onProcessed = ({
      canceled,
      passthrough,
      dataTransfer,
      renamedNames,
      cleanedCount,
      totalFileSecretsMasked,
    }) => {
      const pointTarget =
        eventName === 'drop'
          ? nativeElementFromPoint
            ? nativeElementFromPoint.call(document, clientX, clientY)
            : typeof document.elementFromPoint === 'function'
              ? document.elementFromPoint(clientX, clientY)
              : null
          : null;
      if (canceled || !dataTransfer) {
        rawOriginalStrings = null;
        logDiag('Files', `${eventName}:asyncCanceled`, { site: window.location.hostname });
        if (eventName === 'drop') {
          dismissPageDragOverlay(initialTarget, pointTarget, dragTargetsSnapshot);
        }
        return;
      }
      const stringsToUse = passthrough && rawOriginalStrings ? rawOriginalStrings : strings;
      rawOriginalStrings = null;
      populateStrings(dataTransfer, stringsToUse);
      if (!passthrough) {
        showUploadToast(renamedNames, cleanedCount, totalFileSecretsMasked || 0);
      }
      const dispatchTarget =
        initialTarget && (initialTarget === window || initialTarget.isConnected)
          ? initialTarget
          : pointTarget && pointTarget.isConnected
            ? pointTarget
            : document.activeElement && document.activeElement.isConnected
              ? document.activeElement
              : document.body;
      if (!dispatchTarget) {
        logDiag('Files', `${eventName}:asyncNoTarget`, { site: window.location.hostname });
        return;
      }

      let synthetic;
      if (eventName === 'paste' && typeof NativeClipboardEvent === 'function') {
        synthetic = new NativeClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clipboardData: dataTransfer,
        });
      } else if (eventName === 'drop' && typeof NativeDragEvent === 'function') {
        synthetic = new NativeDragEvent('drop', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clientX,
          clientY,
          dataTransfer,
        });
      } else {
        synthetic = new NativeEvent(eventName, { bubbles: true, cancelable: true, composed: true });
      }

      const synData =
        propName === 'clipboardData'
          ? getClipboardData(synthetic)
          : propName === 'dataTransfer'
            ? getDragDataTransfer(synthetic)
            : synthetic[propName];
      if (!synData || safeDtFiles(synData).length !== safeDtFiles(dataTransfer).length) {
        overrideEventTransfer(synthetic, propName, dataTransfer);
      }
      markSyntheticEvent(synthetic);
      const notCanceled = dispatchEventSafe(dispatchTarget, synthetic);
      logDiag('Files', `${eventName}:asyncDispatched`, {
        site: window.location.hostname,
        targetTag: dispatchTarget.tagName || 'WINDOW',
        outFiles: safeDtFiles(dataTransfer).length,
        renamedCount: renamedNames.length,
        cleanedCount,
        totalFileSecretsMasked: totalFileSecretsMasked || 0,
        defaultPrevented: !notCanceled,
      });
    };
    if (nativePromiseThen) {
      nativePromiseThen.call(asyncPromise, onProcessed);
    } else {
      asyncPromise.then(onProcessed);
    }
  }

  function handlePaste(event) {
    if (!state.enabled || !event || isProcessedEvent(event)) {
      return;
    }
    const clipboardData = getClipboardData(event);
    if (!clipboardData) {
      return;
    }
    const meta = snapshotDataTransferMeta(clipboardData);
    if (meta.files.length === 0) {
      if (state.maskSecrets || state.maskPii || (state.customWords && state.customWords.trim())) {
        handlePasteSecrets(event, clipboardData);
      }
      return;
    }
    handleTransferEvent(event, 'clipboardData', 'paste', meta);
  }

  function isNodeEditableDirect(node) {
    let cur = node && node.nodeType === 3 ? node.parentElement : node;
    while (cur && cur.nodeType === 1) {
      if (
        (NativeHTMLTextAreaElement && cur instanceof NativeHTMLTextAreaElement) ||
        (NativeHTMLInputElement && cur instanceof NativeHTMLInputElement)
      ) {
        return !cur.readOnly && !cur.disabled;
      }
      if (cur.isContentEditable) {
        return true;
      }
      cur = cur.parentElement;
    }
    return false;
  }

  function showCopyTokensDetectedToast(restoredText) {
    if (typeof restoredText !== 'string' || !restoredText) {
      return;
    }
    showToastNotice(
      i18n.tokensDetectedCopyTitle,
      i18n.tokensDetectedCopySub,
      6000,
      {
        label: i18n.tokensRestoreClipBtn,
        onAction: async () => {
          const ok = await copyRawTextToClipboard(restoredText);
          if (ok && state.showToast) {
            showToastNotice(i18n.tokensRestoredClipTitle, '', 2000);
          }
        },
      }
    );
  }

  function handleCopyDeTokenize(event) {
    if (isInternalClipboardWrite || !state.enabled || mapSize(sessionTokenToRaw) === 0 || !event) {
      return;
    }
    const rawTarget = getEventPathTarget(event);
    if (isNodeEditableDirect(rawTarget)) {
      return;
    }
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    if (!selectedText) {
      return;
    }
    const restored = deTokenizeText(selectedText);
    if (restored.replaced <= 0 || restored.text === selectedText) {
      return;
    }
    showCopyTokensDetectedToast(restored.text);
  }

  function handleDrop(event) {
    handleTransferEvent(event, 'dataTransfer', 'drop');
  }

  function handleFileInputChange(event) {
    if (!state.enabled || !event || isProcessedEvent(event)) {
      return;
    }
    const input = getEventPathTarget(event);
    if (!NativeHTMLInputElement || !(input instanceof NativeHTMLInputElement) || getInputType(input) !== 'file') {
      return;
    }
    attachFileInputListeners(input);
    if (wsHas(pendingAsyncInputs, input)) {
      // Suppress back-to-back native `change` while async processing from `input` is in flight.
      haltEvent(event);
      return;
    }
    const fileList = getInputFiles(input);
    if (!fileList || fileList.length === 0) {
      return;
    }

    const files = [];
    for (let i = 0; i < fileList.length; i += 1) {
      nativeArrayPush.call(files, fileList[i]);
    }

    const action = batchNeedsAction(files);
    if (action === 'none') {
      return;
    }
    const safeFiles = state.debugLogs ? summarizeFilesSafe(files) : null;

    if (action === 'sync') {
      const dataTransfer = new NativeDataTransfer();
      const renamedNames = [];
      let didModify = false;

      for (let i = 0; i < files.length; i += 1) {
        const res = createRenamedFileSync(files[i]);
        safeDtItemsAdd(dataTransfer, res.file);
        if (res.changed) {
          nativeArrayPush.call(renamedNames, res.file.name);
          didModify = true;
        }
      }
      if (!didModify) {
        return;
      }

      markSyntheticEvent(event);
      try {
        setInputFiles(input, safeDtFiles(dataTransfer));
        showUploadToast(renamedNames, 0, 0);
        logDiag('Files', 'fileInput:sync', {
          site: window.location.hostname,
          files: safeFiles,
          renamedCount: renamedNames.length,
        });
      } catch {
        logDiag('Files', 'fileInput:syncRejected', { site: window.location.hostname });
      }
      return;
    }

    // Async cleaning / redaction / optimization on file picker input.
    wsAdd(pendingAsyncInputs, input);
    haltEvent(event);

    logDiag('Files', 'fileInput:asyncStart', {
      site: window.location.hostname,
      files: safeFiles,
    });

    const asyncInputPromise = processFilesAsync(files);
    const onInputProcessed = ({
      canceled,
      passthrough,
      dataTransfer,
      renamedNames,
      cleanedCount,
      totalFileSecretsMasked,
    }) => {
      wsDelete(pendingAsyncInputs, input);
      if (canceled || !dataTransfer) {
        logDiag('Files', 'fileInput:asyncCanceled', { site: window.location.hostname });
        try {
          if (inputValueDescriptor && typeof inputValueDescriptor.set === 'function') {
            inputValueDescriptor.set.call(input, '');
          } else {
            input.value = '';
          }
        } catch {
          // Ignore reset rejection safely.
        }
        return;
      }
      if (passthrough) {
        const syntheticInput = new NativeEvent('input', { bubbles: true, cancelable: false, composed: true });
        markSyntheticEvent(syntheticInput);
        dispatchEventSafe(input, syntheticInput);
        const syntheticChange = new NativeEvent('change', { bubbles: true, cancelable: false, composed: false });
        markSyntheticEvent(syntheticChange);
        dispatchEventSafe(input, syntheticChange);
        return;
      }
      try {
        setInputFiles(input, safeDtFiles(dataTransfer));
      } catch {
        logDiag('Files', 'fileInput:asyncSetRejected', { site: window.location.hostname });
        return;
      }
      showUploadToast(renamedNames, cleanedCount, totalFileSecretsMasked || 0);
      logDiag('Files', 'fileInput:asyncDispatched', {
        site: window.location.hostname,
        outFiles: safeDtFiles(dataTransfer).length,
        renamedCount: renamedNames.length,
        cleanedCount,
        totalFileSecretsMasked: totalFileSecretsMasked || 0,
      });
      const syntheticInput = new NativeEvent('input', { bubbles: true, cancelable: false, composed: true });
      markSyntheticEvent(syntheticInput);
      dispatchEventSafe(input, syntheticInput);
      const syntheticChange = new NativeEvent('change', { bubbles: true, cancelable: false, composed: false });
      markSyntheticEvent(syntheticChange);
      dispatchEventSafe(input, syntheticChange);
    };
    const onInputError = () => {
      wsDelete(pendingAsyncInputs, input);
    };
    if (nativePromiseThen) {
      nativePromiseThen.call(asyncInputPromise, onInputProcessed, onInputError);
    } else {
      asyncInputPromise.then(onInputProcessed, onInputError);
    }
  }

  const COMMAND_TOGGLE_META = Object.freeze(
    (nativeObjAssign || Object.assign)((nativeObjCreate || Object.create)(null), {
      'toggle-enabled': {
        key: 'enabled',
        onTitle: 'activeTitle',
        onSub: 'activeSub',
        offTitle: 'pausedTitle',
        offSub: 'pausedSub',
        alwaysToastOff: true,
        duration: 1800,
      },
      'toggle-strict': {
        key: 'strictMode',
        onTitle: 'strictOnTitle',
        onSub: 'strictOnSub',
        offTitle: 'strictOffTitle',
        offSub: 'strictOffSub',
        duration: 1900,
      },
      'toggle-exif': {
        key: 'stripExif',
        onTitle: 'exifOnTitle',
        onSub: 'exifOnSub',
        offTitle: 'exifOffTitle',
        offSub: 'exifOffSub',
        duration: 2000,
      },
      'toggle-redact': {
        key: 'redactImage',
        onTitle: 'redactOnTitle',
        onSub: 'redactOnSub',
        offTitle: 'redactOffTitle',
        offSub: 'redactOffSub',
        duration: 2000,
      },
      'toggle-secrets': {
        key: 'maskSecrets',
        onTitle: 'secretsOnTitle',
        onSub: 'secretsOnSub',
        offTitle: 'secretsOffTitle',
        offSub: 'secretsOffSub',
        duration: 2000,
      },
      'toggle-pii': {
        key: 'maskPii',
        onTitle: 'piiOnTitle',
        onSub: 'piiOnSub',
        offTitle: 'piiOffTitle',
        offSub: 'piiOffSub',
        duration: 2000,
      },
      'toggle-optimize': {
        key: 'optimizeImage',
        onTitle: 'optimizeOnTitle',
        onSub: 'optimizeOnSub',
        offTitle: 'optimizeOffTitle',
        offSub: 'optimizeOffSub',
        duration: 1900,
      },
      'toggle-toast': {
        key: 'showToast',
        onTitle: 'toastOnTitle',
        onSub: 'toastOnSub',
        offTitle: 'toastOffTitle',
        offSub: 'toastOffSub',
        alwaysToast: true,
        duration: 1600,
      },
      'toggle-save': {
        key: 'saveSite',
        onTitle: 'saveOnTitle',
        onSub: 'saveOnSub',
        offTitle: 'saveOffTitle',
        offSub: 'saveOffSub',
        duration: 2000,
      },
      'toggle-debug': {
        key: 'debugLogs',
        onTitle: 'debugOnTitle',
        onSub: 'debugOnSub',
        offTitle: 'debugOffTitle',
        offSub: 'debugOffSub',
        duration: 1900,
      },
    })
  );

  function commitStateChange(clearReason) {
    if (!state.enabled || (!state.maskSecrets && !state.maskPii && !state.customWords)) {
      clearEphemeralSecretDraft(clearReason);
      clearOneTimeRawBypass(clearReason);
      clearSessionTokenVault();
    }
    storageResetOccurred = false;
    storageResetNoticePending = false;
    clearStorageResetFallbackTimer();
    syncStoredState();
  }

  function applyCommand(command) {
    if (!nativeHasOwn(COMMAND_TOGGLE_META, command)) {
      return;
    }
    const meta = COMMAND_TOGGLE_META[command];
    if (!meta) {
      return;
    }
    state[meta.key] = !state[meta.key];
    commitStateChange('toggle-off');
    logDiag('Cmd', 'toggle', {
      site: window.location.hostname,
      command,
      key: meta.key,
      value: Boolean(state[meta.key]),
    });

    const isOn = Boolean(state[meta.key]);
    if (meta.alwaysToast || state.showToast || (meta.alwaysToastOff && !isOn)) {
      const titleKey = isOn ? meta.onTitle : meta.offTitle;
      const subKey = isOn ? meta.onSub : meta.offSub;
      showToastNotice(i18n[titleKey], i18n[subKey], meta.duration);
    }
  }

  function closePortSafe(port) {
    if (!port) {
      return;
    }
    try {
      setPortOnMessageSafe(port, null);
      if (nativePortClose) {
        nativePortClose.call(port);
      } else if (typeof port.close === 'function') {
        port.close();
      }
    } catch {
      // Ignore already-closed port errors cleanly.
    }
  }

  function restoreWrappedDescriptor(target, propName, expectedWrapped, origDesc) {
    if (!target || !expectedWrapped || typeof nativeGetOwnPropDesc !== 'function') {
      return;
    }
    try {
      const curDesc = nativeGetOwnPropDesc(target, propName);
      if (!curDesc || curDesc.value !== expectedWrapped || !curDesc.configurable) {
        return;
      }
      if (origDesc) {
        defineProperty(target, propName, origDesc);
      }
    } catch {
      // Ignore non-configurable or restricted restoration failures cleanly.
    }
  }

  function teardownMainWorld() {
    if (isInstanceTornDown) {
      return;
    }
    isInstanceTornDown = true;
    state.enabled = false;
    clearEphemeralSecretDraft('teardown');
    clearOneTimeRawBypass('teardown');
    clearSessionTokenVault();
    removeActiveToast();
    setClear(enteredDragTargets);

    for (let i = pendingPings.length - 1; i >= 0; i -= 1) {
      const entry = pendingPings[i];
      if (entry) {
        if (entry.hopTimer !== null) {
          nativeClearTimeout(entry.hopTimer);
          entry.hopTimer = null;
        }
        if (entry.timer !== null) {
          nativeClearTimeout(entry.timer);
          entry.timer = null;
        }
        if (typeof entry.resolve === 'function') {
          entry.resolve(false, true);
        }
      }
    }
    pendingPings.length = 0;

    nativeRemoveEventListener.call(window, 'click', handleWindowClickForShadowInput, true);
    nativeRemoveEventListener.call(window, 'dragenter', handleDragEnter, true);
    nativeRemoveEventListener.call(window, 'dragleave', handleDragLeave, true);
    nativeRemoveEventListener.call(window, 'dragend', handleDragEnd, true);
    nativeRemoveEventListener.call(window, 'paste', handlePaste, true);
    nativeRemoveEventListener.call(window, 'copy', handleCopyDeTokenize, true);
    nativeRemoveEventListener.call(window, 'drop', handleDrop, true);
    nativeRemoveEventListener.call(window, 'input', handleFileInputChange, true);
    nativeRemoveEventListener.call(window, 'change', handleFileInputChange, true);
    nativeRemoveEventListener.call(window, 'message', handleBridgeMessage, true);
    nativeRemoveEventListener.call(window, 'blur', handleWindowBlur, true);
    nativeRemoveEventListener.call(window, 'pagehide', clearEphemeralSecretDraft, true);
    nativeRemoveEventListener.call(window, 'focus', handleProactiveLivenessCheck, true);
    nativeRemoveEventListener.call(window, 'visibilitychange', handleProactiveLivenessCheck, true);

    const hookedInputs = setToArray(hookedFileInputsList);
    for (let i = 0; i < hookedInputs.length; i += 1) {
      const inp = hookedInputs[i];
      if (inp) {
        nativeRemoveEventListener.call(inp, 'input', handleFileInputChange, true);
        nativeRemoveEventListener.call(inp, 'change', handleFileInputChange, true);
      }
    }
    setClear(hookedFileInputsList);

    if (typeof Clipboard === 'function' && Clipboard.prototype) {
      restoreWrappedDescriptor(
        Clipboard.prototype,
        'writeText',
        clipboardProtoWrappedFn,
        origClipboardProtoWriteTextDesc
      );
    }
    try {
      const clipObj = typeof navigator === 'object' && navigator ? navigator.clipboard : null;
      if (clipObj) {
        restoreWrappedDescriptor(
          clipObj,
          'writeText',
          navClipboardWrappedFn,
          origNavigatorClipboardWriteTextDesc
        );
      }
    } catch {
      // Ignore restricted navigator.clipboard cleanup.
    }
    if (NativeHTMLInputElement && NativeHTMLInputElement.prototype) {
      restoreWrappedDescriptor(
        NativeHTMLInputElement.prototype,
        'click',
        inputClickWrappedFn,
        origInputClickDesc
      );
      restoreWrappedDescriptor(
        NativeHTMLInputElement.prototype,
        'showPicker',
        inputShowPickerWrappedFn,
        origInputShowPickerDesc
      );
    }

    if (bridgePort) {
      closePortSafe(bridgePort);
      bridgePort = null;
    }
  }

  function checkBridgeAlive(timeoutMs = 220, options = null) {
    if (isInstanceTornDown) {
      return Promise.resolve(false);
    }
    if (!hasIsolatedBridge) {
      return Promise.resolve(true);
    }
    const teardownOnTimeout = !options || options.teardownOnTimeout !== false;
    if (!bridgePort || !sessionBridgeToken) {
      if (teardownOnTimeout) {
        teardownMainWorld();
      }
      return Promise.resolve(false);
    }
    return new Promise((resolve) => {
      pingCounter += 1;
      const pingId = pingCounter;
      let settled = false;
      const entry = {
        id: pingId,
        hopTimer: null,
        timer: null,
        resolve(alive, explicitDead) {
          if (settled) {
            return;
          }
          settled = true;
          if (entry.hopTimer !== null) {
            nativeClearTimeout(entry.hopTimer);
            entry.hopTimer = null;
          }
          if (entry.timer !== null) {
            nativeClearTimeout(entry.timer);
            entry.timer = null;
          }
          const idx = pendingPings.indexOf(entry);
          if (idx >= 0) {
            nativeArraySplice.call(pendingPings, idx, 1);
          }
          if (alive) {
            consecutivePingFailures = 0;
          } else if (explicitDead || teardownOnTimeout) {
            teardownMainWorld();
          }
          resolve(Boolean(alive));
        },
      };
      nativeArrayPush.call(pendingPings, entry);
      // Wait 2 macrotask hops so synchronous SPA chat-switch work completes and lets MessageChannel
      // deliver pong before starting the post-unfreeze deadline timer.
      entry.hopTimer = nativeSetTimeout(() => {
        entry.hopTimer = null;
        if (settled) {
          return;
        }
        entry.hopTimer = nativeSetTimeout(() => {
          entry.hopTimer = null;
          if (settled) {
            return;
          }
          entry.timer = nativeSetTimeout(() => {
            entry.timer = null;
            entry.resolve(false, false);
          }, timeoutMs);
        }, 0);
      }, 0);
      try {
        postPortMessageSafe(bridgePort, {
          __clipzero: TO_ISOLATED,
          token: sessionBridgeToken,
          requestId: pingId,
          ping: true,
        });
      } catch {
        entry.resolve(false, true);
      }
    });
  }

  function triggerProactiveBridgeCheck() {
    if (isInstanceTornDown || !hasIsolatedBridge || proactiveCheckInFlight) {
      return;
    }
    const now = nativeDateNow ? nativeDateNow() : Date.now();
    if (now - lastProactivePingAt < 1000) {
      return;
    }
    lastProactivePingAt = now;
    proactiveCheckInFlight = true;
    const p1 = checkBridgeAlive(300, { teardownOnTimeout: false });
    const onFirstDone = (alive) => {
      if (alive || isInstanceTornDown) {
        proactiveCheckInFlight = false;
        return;
      }
      consecutivePingFailures += 1;
      const p2 = checkBridgeAlive(300, { teardownOnTimeout: true });
      const onSecondDone = () => {
        proactiveCheckInFlight = false;
      };
      if (nativePromiseThen) {
        nativePromiseThen.call(p2, onSecondDone, onSecondDone);
      } else {
        p2.then(onSecondDone, onSecondDone);
      }
    };
    if (nativePromiseThen) {
      nativePromiseThen.call(p1, onFirstDone, () => {
        proactiveCheckInFlight = false;
      });
    } else {
      p1.then(onFirstDone, () => {
        proactiveCheckInFlight = false;
      });
    }
  }

  function handleProactiveLivenessCheck(event) {
    if (event && event.type === 'visibilitychange' && document.visibilityState !== 'visible') {
      return;
    }
    triggerProactiveBridgeCheck();
  }

  function processBridgeData(data, replyPort) {
    if (isInstanceTornDown || !data || data.__clipzero !== TO_MAIN || !data.payload) {
      return false;
    }
    const msgToken = data.token;
    if (typeof msgToken !== 'string' || msgToken.length < 16) {
      return false;
    }
    if (sessionBridgeToken === null) {
      sessionBridgeToken = msgToken;
    } else if (msgToken !== sessionBridgeToken) {
      return false;
    }

    const { requestId, payload } = data;
    if (payload.type === 'clipzero:pong') {
      const isAlive = payload.alive === true;
      for (let i = pendingPings.length - 1; i >= 0; i -= 1) {
        if (typeof pendingPings[i]?.resolve === 'function') {
          pendingPings[i].resolve(isAlive, !isAlive);
        }
      }
      if (!isAlive) {
        teardownMainWorld();
      }
      return true;
    }

    if (payload.type === 'clipzero:i18n' && payload.strings && typeof payload.strings === 'object') {
      if (!injectedAtDocumentStart) {
        return true;
      }
      i18n = nativeObjAssign
        ? nativeObjAssign({}, i18n, payload.strings)
        : { ...i18n, ...payload.strings };
      flushStorageResetNotice();
      return true;
    }

    if (!injectedAtDocumentStart) {
      if (requestId) {
        const reloadReply = {
          __clipzero: TO_ISOLATED,
          token: sessionBridgeToken,
          requestId,
          ok: false,
          needsReload: true,
          state: null,
        };
        if (replyPort) {
          postPortMessageSafe(replyPort, reloadReply);
        } else if (bridgePort === null && targetOrigin && targetOrigin !== 'null') {
          nativePostMessage(reloadReply, targetOrigin);
        }
      }
      return true;
    }

    if (payload.shortcuts && typeof payload.shortcuts === 'object') {
      shortcuts = nativeObjAssign
        ? nativeObjAssign({}, shortcuts, payload.shortcuts)
        : { ...shortcuts, ...payload.shortcuts };
    }

    if (payload.type === 'clipzero:command' && typeof payload.command === 'string') {
      applyCommand(payload.command);
    } else if (
      payload.type === 'clipzero:set-custom-words' &&
      typeof payload.customWords === 'string'
    ) {
      const nextWords = sanitizeCustomWords(payload.customWords);
      state.customWords = nextWords;
      if (typeof payload.saveSite === 'boolean') {
        state.saveSite = payload.saveSite;
      } else if (nextWords.length > 0 && !state.saveSite) {
        state.saveSite = true;
      }
      commitStateChange('custom-words-cleared');
    }

    if (requestId) {
      const reply = {
        __clipzero: TO_ISOLATED,
        token: sessionBridgeToken,
        requestId,
        hostPrefix: FILE_PREFIX,
        state: snapshotState(),
      };
      if (replyPort) {
        postPortMessageSafe(replyPort, reply);
      } else if (bridgePort === null && targetOrigin && targetOrigin !== 'null') {
        nativePostMessage(reply, targetOrigin);
      }
    }
    return true;
  }

  function handleBridgeMessage(event) {
    if (isInstanceTornDown || !event || !event.isTrusted) {
      return;
    }
    const src = getEvProp(msgSourceDesc, event, 'source');
    const ori = getEvProp(msgOriginDesc, event, 'origin');
    if (src !== window || ori !== targetOrigin) {
      return;
    }
    const data = getEvProp(msgDataDesc, event, 'data');
    const ports = getEvProp(msgPortsDesc, event, 'ports');
    if (!data || data.__clipzero !== TO_MAIN || !data.payload) {
      return;
    }
    if (bridgePort !== null) {
      if (sessionBridgeToken !== null && data.token === sessionBridgeToken) {
        safeStopImmediatePropagation(event);
        return;
      }
      if (data.payload.type === 'clipzero:i18n') {
        if (hasIsolatedBridge) {
          checkBridgeAlive(220);
        } else {
          teardownMainWorld();
        }
      }
      return;
    }
    const wasUnbound = sessionBridgeToken === null;
    if (!processBridgeData(data, null)) {
      return;
    }
    safeStopImmediatePropagation(event);
    if (
      wasUnbound &&
      ports &&
      ports.length > 0 &&
      (!NativeMessagePort || ports[0] instanceof NativeMessagePort)
    ) {
      bridgePort = ports[0];
      if (data.payload && data.payload.bridgeMode === 'isolated') {
        hasIsolatedBridge = true;
      }
      setPortOnMessageSafe(bridgePort, (portEv) => {
        const pData = portEv ? getEvProp(msgDataDesc, portEv, 'data') : null;
        processBridgeData(pData, bridgePort);
      });
      try {
        postPortMessageSafe(bridgePort, {
          __clipzero: TO_ISOLATED,
          token: sessionBridgeToken,
          requestId: 0,
          ack: true,
        });
      } catch {
        // Ignore immediate ack failures cleanly.
      }
    }
  }

  function attachFileInputListeners(input) {
    if (
      isInstanceTornDown ||
      !NativeHTMLInputElement ||
      !(input instanceof NativeHTMLInputElement) ||
      getInputType(input) !== 'file' ||
      wsHas(hookedFileInputs, input)
    ) {
      return;
    }
    wsAdd(hookedFileInputs, input);
    if (setSize(hookedFileInputsList) >= 200) {
      const oldest = setOldestValue(hookedFileInputsList);
      if (oldest !== undefined) {
        setDelete(hookedFileInputsList, oldest);
      }
    }
    setAdd(hookedFileInputsList, input);
    nativeAddEventListener.call(input, 'input', handleFileInputChange, true);
    nativeAddEventListener.call(input, 'change', handleFileInputChange, true);
  }

  function hookFileInputTrigger(proto, methodName, nativeMethod) {
    if (!proto || typeof nativeMethod !== 'function') {
      return;
    }
    try {
      const origDesc =
        typeof nativeGetOwnPropDesc === 'function' ? nativeGetOwnPropDesc(proto, methodName) : null;
      const wrapped = function clipZeroFileTrigger() {
        attachFileInputListeners(this);
        return nativeMethod.apply(this, arguments);
      };
      if (methodName === 'click') {
        origInputClickDesc = origDesc;
        inputClickWrappedFn = wrapped;
      } else if (methodName === 'showPicker') {
        origInputShowPickerDesc = origDesc;
        inputShowPickerWrappedFn = wrapped;
      }
      defineProperty(proto, methodName, {
        configurable: true,
        writable: true,
        value: wrapped,
      });
    } catch {
      // Ignore non-configurable prototype properties cleanly.
    }
  }

  function handleWindowClickForShadowInput(event) {
    const target = getEventPathTarget(event);
    attachFileInputListeners(target);
  }

  function createWriteTextWrapper(nativeWriteText) {
    const wrapped = function writeText(text) {
      const result = nativeWriteText.apply(this, arguments);
      if (
        !isInstanceTornDown &&
        !isInternalClipboardWrite &&
        state.enabled &&
        typeof text === 'string' &&
        text.length > 0 &&
        text.length <= MAX_SECRET_SCAN_CHARS &&
        mapSize(sessionTokenToRaw) > 0
      ) {
        try {
          const restored = deTokenizeText(text);
          if (restored.replaced > 0 && restored.text !== text) {
            showCopyTokensDetectedToast(restored.text);
          }
        } catch {
          // Never fail page clipboard writes on scan/toast error.
        }
      }
      return result;
    };
    wsAdd(wrappedWriteTextFns, wrapped);
    return wrapped;
  }

  function wrapClipboardWriteTextTarget(target, targetKind) {
    if (!target || typeof nativeGetOwnPropDesc !== 'function') {
      return;
    }
    try {
      const desc = nativeGetOwnPropDesc(target, 'writeText');
      if (!desc || typeof desc.value !== 'function' || wsHas(wrappedWriteTextFns, desc.value)) {
        return;
      }
      if (desc.configurable === false && desc.writable === false) {
        return;
      }
      const wrapped = createWriteTextWrapper(desc.value);
      if (targetKind === 'proto') {
        origClipboardProtoWriteTextDesc = desc;
        clipboardProtoWrappedFn = wrapped;
      } else if (targetKind === 'instance') {
        origNavigatorClipboardWriteTextDesc = desc;
        navClipboardWrappedFn = wrapped;
      }
      defineProperty(target, 'writeText', {
        configurable: Boolean(desc.configurable),
        writable: Boolean(desc.writable),
        enumerable: Boolean(desc.enumerable),
        value: wrapped,
      });
    } catch {
      // Ignore non-configurable or restricted descriptors cleanly.
    }
  }

  function hookClipboardWriteText() {
    if (typeof Clipboard === 'function' && Clipboard.prototype) {
      wrapClipboardWriteTextTarget(Clipboard.prototype, 'proto');
    }
    try {
      const clipObj = typeof navigator === 'object' && navigator ? navigator.clipboard : null;
      if (clipObj && nativeHasOwn(clipObj, 'writeText')) {
        wrapClipboardWriteTextTarget(clipObj, 'instance');
      }
    } catch {
      // Ignore restricted navigator.clipboard access in sandboxed contexts.
    }
  }

  if (injectedAtDocumentStart) {
    if (NativeHTMLInputElement && NativeHTMLInputElement.prototype) {
      hookFileInputTrigger(NativeHTMLInputElement.prototype, 'click', nativeInputClick);
      hookFileInputTrigger(NativeHTMLInputElement.prototype, 'showPicker', nativeInputShowPicker);
    }
    hookClipboardWriteText();

    nativeAddEventListener.call(window, 'click', handleWindowClickForShadowInput, true);
    nativeAddEventListener.call(window, 'dragenter', handleDragEnter, true);
    nativeAddEventListener.call(window, 'dragleave', handleDragLeave, true);
    nativeAddEventListener.call(window, 'dragend', handleDragEnd, true);
    nativeAddEventListener.call(window, 'paste', handlePaste, true);
    nativeAddEventListener.call(window, 'copy', handleCopyDeTokenize, true);
    nativeAddEventListener.call(window, 'drop', handleDrop, true);
    nativeAddEventListener.call(window, 'input', handleFileInputChange, true);
    nativeAddEventListener.call(window, 'change', handleFileInputChange, true);
    nativeAddEventListener.call(window, 'message', handleBridgeMessage, true);
    nativeAddEventListener.call(window, 'blur', handleWindowBlur, true);
    nativeAddEventListener.call(window, 'pagehide', clearEphemeralSecretDraft, true);
    nativeAddEventListener.call(window, 'focus', handleProactiveLivenessCheck, true);
    nativeAddEventListener.call(window, 'visibilitychange', handleProactiveLivenessCheck, true);
  } else {
    nativeAddEventListener.call(window, 'message', handleBridgeMessage, true);
    nativeAddEventListener.call(window, 'pagehide', teardownMainWorld, true);
  }
})();
