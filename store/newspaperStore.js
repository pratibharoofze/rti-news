import { create } from 'zustand';

// ─── Default data ─────────────────────────────────────────────────────────────
const defaultHeader = {
  newspaperName: 'भारतीय माहिती अधिकार',
  tagline: 'मराठी, हिंदी व इंग्रजी भाषेमध्ये सर्वत्र प्रसिद्ध होणारे एकमेव असे न्यूजपेपर',
  date: '● वर्ष : ६ वे  ● महिना : जुलै २०१९  ● १२ अंक साठी वार्षिक वर्गणी : फक्त १९०/-  ● Posting Registration No. SGL/108/2019-2021',
  contact: 'M. 8484029332 / 7020667971',
  extra: 'e-mail : rticheck@gmail.com',
  regNo: 'REG. NO. : RNIMAH/MUL/2014/66399  |  TITLE REGN. NO. : MAH/MUL/03200/13/1/2013-TC',
  website: 'web : www.rtinewsnetwork.com',
  editorName: 'मा. शौकत अब्दुलकलाम नायकवडी',
  editorTitle: 'मुख्य संपादक, संस्थापक, अध्यक्ष, प्रकाशक, मालक',
  officeInfo: '● क्षेत्रीय कार्यालय : व्हीनस कॉर्नर, स्टेशन रोड, केव्हिज प्लाझा, कोल्हापूर.',
  logoUri: '',
};

const defaultFooter = {
  left: '© भारतीय माहिती अधिकार',
  right: 'www.rtinewsnetwork.com',
};

const defaultHeadline = {
  title: 'किसानों के लिए बड़ी खुशखबरी: MSP में 15% की वृद्धि',
  sub: 'केंद्र सरकार ने रबी फसलों के समर्थन मूल्य में ऐतिहासिक बढ़ोतरी की घोषणा की',
};

const defArticle = (title = '', sub = '', body = '', reporter = 'न्यूज़ डेस्क', location = 'भोपाल') => ({
  title, sub, body, reporter, location, date: '6 जून 2025', image: '',
});

const defaultSections = {
  header: defaultHeader,
  headline: defaultHeadline,
  left: defArticle('गेहूं निर्यात में भारत अव्वल', 'रिकॉर्ड निर्यात', 'भारत ने इस वर्ष गेहूं निर्यात में नया कीर्तिमान स्थापित किया है।'),
  center: defArticle('प्रधानमंत्री किसान सम्मान निधि: अब 8000 रुपये', 'लाभार्थियों की संख्या में भी वृद्धि', 'केंद्र सरकार ने PM किसान राशि बढ़ाकर 8000 रुपये सालाना कर दी है। इससे 10 करोड़ किसानों को लाभ मिलेगा।', 'विशेष संवाददाता', 'नई दिल्ली'),
  right: defArticle('सोयाबीन उत्पादन में MP अग्रणी', '', 'मध्यप्रदेश ने इस वर्ष सोयाबीन उत्पादन में देश में पहला स्थान पाया।'),
  bottom_l: defArticle('बारिश की कमी से फसलें प्रभावित', 'किसान चिंतित', 'मानसून की देरी से खरीफ सीजन प्रभावित हो रहा है।'),
  bottom_r: defArticle('ड्रोन से खेती का नया युग', 'युवा किसान अपना रहे हैं तकनीक', 'ड्रोन से कीटनाशक छिड़काव में क्रांति आ रही है।', 'अमित शर्मा', 'जबलपुर'),
  lawyer: { text: 'विधिक नोटिस: इस समाचारपत्र में प्रकाशित सभी विज्ञापन एवं समाचार विज्ञापनदाता की स्वयं की जिम्मेदारी हैं।' },
  bot_l: defArticle('मंडियों में आवक बढ़ी', '', 'दलहन और तिलहन की आवक में बढ़ोतरी दर्ज की गई।'),
  bot_c: defArticle('मिट्टी परीक्षण अभियान शुरू', '', 'सरकार ने निःशुल्क मिट्टी परीक्षण की घोषणा की।'),
  bot_r: defArticle('प्राकृतिक खेती को बढ़ावा', 'सरकारी सब्सिडी का ऐलान', 'प्राकृतिक खेती अपनाने वाले किसानों को विशेष अनुदान मिलेगा।'),
  footer: defaultFooter,
  masthead: { date: 'जून २०१९', title: 'अखिल भारतीय माहिती अधिकार न्यूज नेटवर्क', website: 'www.rtinewsnetwork.com' },
  top_left: defArticle('बड़ी खबर शीर्षक यहाँ', '', 'लेख का विवरण यहाँ लिखें...'),
  top_right: defArticle('दूसरी बड़ी खबर', '', 'लेख का विवरण यहाँ लिखें...'),
  mid_left: defArticle('मध्य खबर बाईं', '', 'विवरण यहाँ...'),
  mid_right: defArticle('मध्य खबर दाईं', '', 'विवरण यहाँ...'),
  bot_main: defArticle('मुख्य नीचे की खबर', '', 'विस्तृत लेख यहाँ...'),
  bot_side: defArticle('साइड खबर', '', 'संक्षिप्त विवरण...'),
  slogan: { text: 'सर्वसामान्य जनतेत भारतीय कायद्याचे प्रबोधन करणारे एकमेव न्यूज पेपर!' },
};

// ─── Template Store ───────────────────────────────────────────────────────────
export const useTemplateStore = create((set) => ({
  templateId: 'layout1',
  setTemplate: (id) => set({ templateId: id }),
}));

// ─── Editor Store ─────────────────────────────────────────────────────────────
export const useEditorStore = create((set, get) => ({
  sections: JSON.parse(JSON.stringify(defaultSections)),
  activeSection: null,

  setActiveSection: (id) => set({ activeSection: id }),

  updateSection: (sectionId, key, value) =>
    set((state) => ({
      sections: {
        ...state.sections,
        [sectionId]: {
          ...state.sections[sectionId],
          [key]: value,
        },
      },
    })),

  resetAll: () =>
    set({
      sections: JSON.parse(JSON.stringify(defaultSections)),
      activeSection: null,
    }),

  getSectionData: (id) => get().sections[id] || {},
}));

// ─── Image Store ──────────────────────────────────────────────────────────────
export const useImageStore = create((set) => ({
  uploading: false,
  setUploading: (v) => set({ uploading: v }),
}));

// ─── PDF Store ────────────────────────────────────────────────────────────────
export const usePdfStore = create((set) => ({
  generating: false,
  lastUri: null,
  setGenerating: (v) => set({ generating: v }),
  setLastUri: (uri) => set({ lastUri: uri }),
}));