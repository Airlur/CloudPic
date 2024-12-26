import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

// 样式定义
const styles = {
  languageButton: {
    minWidth: 'auto',
    textTransform: 'none'  // 防止大写转换
  },
  menu: {
    marginTop: '8px'
  }
} as const;

const LANGUAGE_NAMES = {
  'zh-CN': '中文',
  'en-US': 'English',
  'ja-JP': '日本語'
} as const;

const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    handleClose();
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        color="inherit"
        sx={styles.languageButton}
      >
        {LANGUAGE_NAMES[i18n.language as keyof typeof LANGUAGE_NAMES]}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={styles.menu}
      >
        <MenuItem onClick={() => changeLanguage('zh-CN')}>中文</MenuItem>
        <MenuItem onClick={() => changeLanguage('en-US')}>English</MenuItem>
        <MenuItem onClick={() => changeLanguage('ja-JP')}>日本語</MenuItem>
      </Menu>
    </div>
  );
};

export default LanguageSwitch; 