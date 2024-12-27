import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Drawer, AppBar, Toolbar, Typography, Button, List, ListItem, ListItemIcon, 
  ListItemText, IconButton, Divider } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Logout as LogoutIcon, Storage as StorageIcon,
  Add as AddIcon, Delete as DeleteIcon, DriveFileMove as DriveFileMoveIcon,
  DarkMode as DarkModeIcon, LightMode as LightModeIcon, Cloud as CloudIcon,
  CreateNewFolder as CreateNewFolderIcon, Download as DownloadIcon } from '@mui/icons-material';
import { LanguageSwitch, CustomTooltip, CustomAlert } from '@/components';
import { FileView } from '@/components/data-display';
import { useTheme } from '@/themes/ThemeContext';
import { logout } from '@/utils/auth';
import { FileItem, ViewMode } from '@/types/file';

const DRAWER_WIDTH = 240;

// 样式定义
const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
  },
  appBar: {
    zIndex: 1201, // 确保AppBar在Drawer上方
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: DRAWER_WIDTH,
      boxSizing: 'border-box',
      marginTop: '64px', // 与AppBar高度相同
      height: 'calc(100% - 64px)', // 减去AppBar的高度
    },
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexGrow: 1,
  },
  logo: {
    fontSize: '32px',
    color: '#ffffff',
    filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between', // 改为space-between以支持左右布局
    padding: '0 24px',
  },
  toolbarRight: {
    display: 'flex',
    gap: 1,
    alignItems: 'center', // 确保所有元素垂直居中对齐
  },
  toolbarButton: {
    textTransform: 'none', // 防止文字全大写
    height: '36px', // 统一按钮高度
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    height: '36px', // 与按钮相同高度
  },
  content: {
    flexGrow: 1,
    padding: 2,
    marginTop: '64px',
  },
  fileActions: {
    display: 'flex',
    gap: 1,
    marginBottom: 0.5,
  },
  addConnectionButton: {
    margin: '16px',
  },
  // 更新按钮样式
  createButton: {
    backgroundColor: '#4caf50', // Material Design 绿色
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#43a047',
    },
  },
  uploadButton: {
    backgroundColor: '#2196f3', // Material Design 蓝色
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#1e88e5',
    },
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    color: '#424242',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  deleteButton: {
    backgroundColor: '#f44336', // Material Design 红色
    color: '#ffffff',
    '&:hover': {
      backgroundColor: '#e53935',
    },
  },
} as const;

// 模拟的存储服务数据
const STORAGE_SERVICES = [
  { id: 'b2', name: 'Backblaze B2', type: 'B2' },
  { id: 'r2', name: 'Cloudflare R2', type: 'R2' },
];

// 模拟的文件数据
const MOCK_FILES: FileItem[] = [
  { 
    id: 1, 
    name: 'example1.jpg', 
    size: '2.4 MB', 
    modified: '2023-12-26 14:30',
    type: 'file',
    mimeType: 'image/jpeg',
    thumbnailUrl: '/placeholder.png'
  },
  { 
    id: 2, 
    name: 'document.pdf', 
    size: '1.1 MB', 
    modified: '2023-12-25 09:15',
    type: 'file',
    mimeType: 'application/pdf'
  },
  {
    id: 3,
    name: 'Images',
    size: '0 KB',
    modified: '2023-12-24 10:00',
    type: 'folder'
  },
  {
    id: 4,
    name: 'report2023.docx',
    size: '3.2 MB',
    modified: '2023-12-23 16:45',
    type: 'file',
    mimeType: 'application/msword'
  },
  {
    id: 5,
    name: 'project-files',
    size: '1.5 GB',
    modified: '2023-12-22 11:20',
    type: 'folder'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useTheme();
  
  // 视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<number | string>>(new Set());
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ show: false, message: '', severity: 'success' });

  // 文件操作处理函数
  const handleDelete = (file: FileItem) => {
    setAlert({
      show: true,
      message: t('home.deleteSuccess', { name: file.name }),
      severity: 'success'
    });
  };

  const handleMove = (file: FileItem) => {
    setAlert({
      show: true,
      message: t('home.moveSuccess', { name: file.name }),
      severity: 'success'
    });
  };

  const handleDownload = (file: FileItem) => {
    setAlert({
      show: true,
      message: t('home.downloadStarted', { name: file.name }),
      severity: 'success'
    });
  };

  const handlePreview = (file: FileItem) => {
    if (file.type === 'folder') {
      // 处理文件夹点击
      console.log('Open folder:', file.name);
    } else {
      // 处理文件预览
      console.log('Preview file:', file.name);
    }
  };

  const handleSelect = (file: FileItem) => {
    console.log('Selected file:', file.name);
  };

  const handleToggleSelect = (fileId: number | string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    try {
      logout();
      setAlert({
        show: true,
        message: t('logout.success'),
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      setAlert({
        show: true,
        message: t('logout.failed'),
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  return (
    <Box sx={styles.root}>
      <AppBar position="fixed" sx={styles.appBar}>
        <Toolbar sx={styles.toolbar}>
          <Box sx={styles.titleContainer}>
            <CloudIcon sx={styles.logo} />
            <Typography variant="h6" noWrap component="div">
              {t('home.title')}
            </Typography>
          </Box>
          <Box sx={styles.toolbarRight}>
            <CustomTooltip 
              title={mode === 'light' ? t('common.darkMode') : t('common.lightMode')}
              arrow
              placement="bottom"
              enterDelay={200}
              leaveDelay={0}
            >
              <IconButton 
                onClick={toggleTheme} 
                color="inherit" 
                sx={styles.toolbarIcon}
              >
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </CustomTooltip>
            <LanguageSwitch />
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={styles.toolbarButton}
            >
              {t('common.logout')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={styles.drawer}
        variant="permanent"
        anchor="left"
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={styles.addConnectionButton}
        >
          {t('home.addConnection')}
        </Button>
        <Divider />
        <List>
          {STORAGE_SERVICES.map((service) => (
            <ListItem button key={service.id}>
              <ListItemIcon>
                <StorageIcon />
              </ListItemIcon>
              <ListItemText primary={service.name} secondary={service.type} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={styles.content}>
        <Box sx={styles.fileActions}>
          <Button
            variant="contained"
            startIcon={<CreateNewFolderIcon />}
            sx={styles.createButton}
          >
            {t('home.newFolder')}
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={styles.uploadButton}
          >
            {t('home.uploadFile')}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={styles.actionButton}
            disabled={selectedFiles.size === 0}
          >
            {t('home.download')}
          </Button>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={styles.deleteButton}
            disabled={selectedFiles.size === 0}
          >
            {t('common.delete')}
          </Button>
          <Button
            variant="contained"
            startIcon={<DriveFileMoveIcon />}
            sx={styles.actionButton}
            disabled={selectedFiles.size === 0}
          >
            {t('home.move')}
          </Button>
        </Box>

        <FileView
          files={MOCK_FILES}
          viewMode={viewMode}
          selectedFiles={selectedFiles}
          onViewModeChange={setViewMode}
          onToggleSelect={handleToggleSelect}
          onDelete={handleDelete}
          onMove={handleMove}
          onDownload={handleDownload}
          onSelect={handleSelect}
          onPreview={handlePreview}
        />
      </Box>

      <CustomAlert 
        open={alert.show}
        message={alert.message}
        severity={alert.severity}
        onClose={handleCloseAlert}
      />
    </Box>
  );
};

export default Home; 