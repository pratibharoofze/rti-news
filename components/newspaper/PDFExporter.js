import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { usePdfStore } from '../../store/newspaperStore';

function articleHtml(d = {}, isMain = false) {
  return `
    <div style="padding:${isMain ? '10px 12px' : '8px 10px'};background:${isMain ? '#fffdf8' : '#fff'};height:100%;box-sizing:border-box;">
      ${d.title ? `
        <div style="font-size:${isMain ? '15px' : '13px'};font-weight:900;color:#111;line-height:1.35;margin-bottom:3px;font-family:'Noto Serif Devanagari',serif;">
          ${d.title}
        </div>` : ''}
      ${d.sub ? `<div style="font-size:9px;color:#555;margin-bottom:4px;font-style:italic;">${d.sub}</div>` : ''}
      <div style="height:1.5px;background:#111;margin-bottom:6px;"></div>
      ${d.image ? `<img src="${d.image}" style="width:100%;height:110px;object-fit:cover;border:1px solid #999;margin-bottom:6px;display:block;"/>` : ''}
      ${d.body ? `<div style="font-size:10.5px;line-height:1.8;color:#222;text-align:justify;font-family:'Noto Serif Devanagari',serif;">${d.body}</div>` : ''}
      ${(d.reporter || d.location) ? `
        <div style="font-size:8.5px;color:#666;border-top:0.5px solid #bbb;padding-top:4px;margin-top:6px;display:flex;justify-content:space-between;font-style:italic;">
          <span>${d.reporter ? '✍ ' + d.reporter : ''}</span>
          <span>${d.location ? '● ' + d.location : ''}</span>
        </div>` : ''}
    </div>`;
}

function sectionsToHtml(sections = {}, templateId = 'layout1') {
  const h = sections.header || {};
  const hl = sections.headline || {};
  const ft = sections.footer || {};
  const lw = sections.lawyer || {};

  const br = 'border-right:1px solid #ccc;';

  let bodyHtml = '';
  if (templateId === 'layout1') {
    bodyHtml = `
      <div style="display:flex;border-bottom:1px solid #ccc;min-height:200px;">
        <div style="width:25%;${br}">${articleHtml(sections.left)}</div>
        <div style="width:50%;${br}">${articleHtml(sections.center, true)}</div>
        <div style="width:25%;">${articleHtml(sections.right)}</div>
      </div>
      <div style="display:flex;border-bottom:1px solid #ccc;min-height:180px;">
        <div style="width:50%;${br}">${articleHtml(sections.bottom_l)}</div>
        <div style="width:50%;">${articleHtml(sections.bottom_r)}</div>
      </div>`;
  } else {
    bodyHtml = `
      <div style="display:flex;border-bottom:1px solid #ccc;min-height:200px;">
        <div style="width:35%;${br}">${articleHtml(sections.left)}</div>
        <div style="width:40%;${br}">${articleHtml(sections.center, true)}</div>
        <div style="width:25%;">${articleHtml(sections.right)}</div>
      </div>
      <div style="border-top:2.5px solid #111;border-bottom:2.5px solid #111;background:#f5f0e8;padding:6px 14px;text-align:center;font-size:10px;color:#333;">
        ${lw.text || ''}
      </div>
      <div style="display:flex;border-bottom:1px solid #ccc;min-height:180px;">
        <div style="width:33%;${br}">${articleHtml(sections.bot_l)}</div>
        <div style="width:33%;${br}">${articleHtml(sections.bot_c)}</div>
        <div style="width:34%;">${articleHtml(sections.bot_r)}</div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700;900&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Noto Serif Devanagari',serif; background:#e8e4df; }
  </style>
</head>
<body>
<div style="width:297mm;min-height:420mm;margin:0 auto;border:1px solid #555;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,0.2);">

  <!-- Header top strip -->
  <div style="border-top:2px solid #111;border-bottom:1px solid #ccc;padding:4px 10px;display:flex;align-items:center;justify-content:space-between;background:#fafafa;">
    <span style="font-size:9px;color:#444;">${h.contact || 'M. 8484029332 / 7020667971'}</span>
    <span style="font-size:10px;font-weight:900;color:#111;border:1.5px solid #111;padding:1px 8px;letter-spacing:2px;">PRESS</span>
    <span style="font-size:9px;color:#444;">${h.regNo || 'REG. NO. : RNIMAH/MUL/2014/66399'}</span>
  </div>

  <!-- Newspaper Name -->
  <div style="border-bottom:1.5px solid #111;padding:8px 14px;text-align:center;">
    <div style="font-size:38px;font-weight:900;color:#111;letter-spacing:1px;line-height:1.1;font-family:'Noto Serif Devanagari',serif;">
      ${h.newspaperName || 'भारतीय माहिती अधिकार'}
    </div>
  </div>

  <!-- Tagline -->
  <div style="border-bottom:1px solid #aaa;padding:4px 14px;text-align:center;background:#fff;">
    <span style="font-size:9.5px;color:#444;">${h.tagline || 'मराठी, हिंदी व इंग्रजी भाषेमध्ये सर्वत्र प्रसिद्ध होणारे एकमेव असे न्यूजपेपर'}</span>
  </div>

  <!-- Info row -->
  <div style="border-bottom:1px solid #ccc;padding:3px 10px;display:flex;align-items:center;justify-content:space-between;background:#fff;">
    <span style="font-size:9px;color:#333;">${h.website ? 'web : ' + h.website : 'web : www.rtinewsnetwork.com'}</span>
    <span style="font-size:9px;color:#333;">${h.extra || 'e-mail : rticheck@gmail.com'}</span>
    <span style="font-size:9px;font-weight:700;color:#111;">${h.editorName || 'मा. शौकत अब्दुलकलाम नायकवडी'}</span>
  </div>

  <!-- Date strip -->
  <div style="border-bottom:4px double #111;padding:3px 10px;background:#f5f0e8;">
    <span style="font-size:9px;color:#555;">${h.date || '● वर्ष : ६ वे  ● महिना : जुलै २०१९  ● १२ अंक साठी वार्षिक वर्गणी : फक्त १९०/-'}</span>
  </div>

  <!-- Main Headline -->
  <div style="border-bottom:3px solid #111;background:#fff;">
    <div style="padding:10px 14px;text-align:center;">
      <div style="font-size:24px;font-weight:900;color:#111;line-height:1.3;font-family:'Noto Serif Devanagari',serif;">
        ${hl.title || ''}
      </div>
      ${hl.sub ? `<div style="font-size:11px;color:#333;margin-top:4px;font-style:italic;border-top:1px solid #ddd;padding-top:3px;">${hl.sub}</div>` : ''}
    </div>
  </div>

  <!-- Body columns -->
  ${bodyHtml}

  <!-- Footer -->
  <div style="border-top:2px solid #111;margin-top:2px;border-top-style:double;padding:6px 12px;display:flex;align-items:center;justify-content:space-between;background:#fafafa;">
    <span style="font-size:9px;color:#444;flex:1;">${ft.left || '© भारतीय माहिती अधिकार'}</span>
    <span style="font-size:9px;font-weight:700;color:#222;flex:2;text-align:center;font-style:italic;">
      सर्वसामान्य जनतेत भारतीय कायद्याचे प्रबोधन करणारे एकमेव न्यूज पेपर!
    </span>
    <span style="font-size:9px;color:#444;flex:1;text-align:right;">${ft.right || 'www.rtinewsnetwork.com'}</span>
  </div>

</div>
</body>
</html>`;
}

export async function exportToPdf(sections, templateId) {
  const { setGenerating, setLastUri } = usePdfStore.getState();
  try {
    setGenerating(true);
    const html = sectionsToHtml(sections, templateId);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    setLastUri(uri);
    setGenerating(false);
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'PDF Share / Save karein',
      });
    }
    return uri;
  } catch (err) {
    setGenerating(false);
    throw err;
  }
}

export async function printDirectly(sections, templateId) {
  const html = sectionsToHtml(sections, templateId);
  await Print.printAsync({ html });
}