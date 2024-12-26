import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译文件
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';

const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
  'ja-JP': {
    translation: jaJP,
  },
};

// 从本地存储获取语言设置，如果没有则默认使用中文
const savedLanguage = localStorage.getItem('language') || 'zh-CN';

// 更新HTML lang属性的函数
const updateHtmlLang = (lng: string) => {
  document.documentElement.lang = lng.toLowerCase();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  });

// 初始设置HTML lang属性
updateHtmlLang(savedLanguage);

// 监听语言变化
i18n.on('languageChanged', (lng) => {
  updateHtmlLang(lng);
});

export default i18n; 