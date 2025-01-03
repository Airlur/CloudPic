import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Drawer, AppBar, Toolbar, Typography, Button, List, ListItem, ListItemIcon, 
  ListItemText, IconButton, Divider, Dialog, DialogContent } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Logout as LogoutIcon, Storage as StorageIcon,
  Add as AddIcon, Delete as DeleteIcon, DriveFileMove as DriveFileMoveIcon,
  DarkMode as DarkModeIcon, LightMode as LightModeIcon, Cloud as CloudIcon,
  CreateNewFolder as CreateNewFolderIcon, Download as DownloadIcon } from '@mui/icons-material';
import { LanguageSwitch, CustomTooltip, CustomAlert } from '@/components';
import { FileView } from '@/components/data-display';
import { useTheme } from '@/themes/ThemeContext';
import { logout } from '@/services/auth/auth';
import { FileItem, ViewMode } from '@/types/file';
import { StorageProviderSelect } from '@/components/feedback';
import { B2ConnectionForm } from '@/components/data-display/storage-forms';
import { createStorageConnection } from '@/services/storage';

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
  breadcrumbsContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: 2,
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  breadcrumbButton: {
    textTransform: 'none',
    padding: '4px 8px',
    minWidth: 'auto',
    color: 'primary.light',
    '&.active': {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
      color: 'primary.main',
      fontWeight: 500,
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&.root': {
      color: 'primary.light',
      fontWeight: 500,
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
      },
      '&.active': {
        color: 'primary.main',
      },
    },
  },
  breadcrumbDivider: {
    color: 'text.disabled',
    userSelect: 'none',
  },
} as const;

// 模拟的存储服务数据
const STORAGE_SERVICES = [
  { id: 'b2', name: 'Backblaze B2', type: 'B2', buckets: ['photos', 'documents'] },
  { id: 'r2', name: 'Cloudflare R2', type: 'R2', buckets: ['assets', 'backups'] },
];

// 模拟的文件数据，根据不同的存储桶返回不同的数据
const getMockFiles = (serviceId: string, path: string): FileItem[] => {
  if (serviceId === 'b2') {
    return [
      { 
        id: 1, 
        name: 'example1.jpg', 
        size: '2.4 MB', 
        modified: '2023-12-26 14:30',
        type: 'file',
        mimeType: 'image/jpeg',
        path: path
      },
      { 
        id: 2, 
        name: 'documents', 
        size: '1.1 MB', 
        modified: '2023-12-25 09:15',
        type: 'folder',
        path: path
      }
    ];
  }
  return [
    { 
      id: 3, 
      name: 'assets.zip', 
      size: '5.4 MB', 
      modified: '2023-12-26 15:30',
      type: 'file',
      mimeType: 'application/zip',
      path: path
    },
    { 
      id: 4, 
      name: 'backups', 
      size: '2.1 GB', 
      modified: '2023-12-25 19:15',
      type: 'folder',
      path: path
    }
  ];
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useTheme();
  const location = useLocation();
  
  // 视图状态
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedFiles, setSelectedFiles] = useState<Set<number | string>>(new Set());
  const [currentService, setCurrentService] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ show: false, message: '', severity: 'success' });
  const [dialogState, setDialogState] = useState<{
    showProviderSelect: boolean;
    showB2Form: boolean;
    isConnecting: boolean;
  }>({
    showProviderSelect: false,
    showB2Form: false,
    isConnecting: false
  });
  
  // 从路由中获取当前服务和路径
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = params.get('service') || '';
    const path = params.get('path') || '/';
    
    setCurrentService(service);
    setCurrentPath(path);
    
    if (service) {
      setFiles(getMockFiles(service, path));
    }
  }, [location]);

  // 处理存储服务切换
  const handleServiceSelect = (serviceId: string) => {
    navigate(`/?service=${serviceId}&path=/`);
  };

  // 处理文件夹导航
  const handlePreview = (file: FileItem) => {
    if (file.type === 'folder') {
      const newPath = currentPath === '/' 
        ? `/${file.name}` 
        : `${currentPath}/${file.name}`;
      navigate(`/?service=${currentService}&path=${encodeURIComponent(newPath)}`);
    } else {
      // 处理文件预览
      console.log('Preview file:', file.name);
    }
  };

  // 处理返回上级目录
  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigate(`/?service=${currentService}&path=${encodeURIComponent(parentPath)}`);
  };

  // 生成面包屑导航数据
  const getBreadcrumbs = () => {
    if (currentPath === '/') return [{ name: '/', path: '/' }];
    
    const paths = currentPath.split('/').filter(Boolean);
    return [
      { name: '/', path: '/' },
      ...paths.map((name, index) => ({
        name,
        path: '/' + paths.slice(0, index + 1).join('/')
      }))
    ];
  };

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

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response.code === 200) {
        setAlert({
          show: true,
          message: t(response.message),
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/login');
        }, 500);
      } else {
        setAlert({
          show: true,
          message: t(response.message),
          severity: 'error'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: t('response.error.logout'),
        severity: 'error'
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  // 处理"添加连接"按钮点击
  const handleAddConnection = () => {
    setDialogState(prev => ({
      ...prev,
      showProviderSelect: true
    }));
  };

  // 处理服务商选择
  const handleProviderSelect = (providerId: string) => {
    setDialogState(prev => ({
      ...prev,
      showProviderSelect: false,
      showB2Form: providerId === 'b2'
    }));
  };

  // 处理 B2 连接
  const handleB2Connect = async (data: any) => {
    try {
      setDialogState(prev => ({ ...prev, isConnecting: true }));
      await createStorageConnection(data);
      setDialogState(prev => ({ ...prev, showB2Form: false }));
      // TODO: 刷新连接列表
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setDialogState(prev => ({ ...prev, isConnecting: false }));
    }
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
          onClick={handleAddConnection}
        >
          {t('home.addConnection')}
        </Button>
        <Divider />
        <List>
          {STORAGE_SERVICES.map((service) => (
            <ListItem 
              button 
              key={service.id}
              selected={currentService === service.id}
              onClick={() => handleServiceSelect(service.id)}
            >
              <ListItemIcon>
                <StorageIcon color={currentService === service.id ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText 
                primary={service.name} 
                secondary={service.type} 
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={styles.content}>
        {currentService ? (
          <>
            <Box sx={styles.fileActions}>
              {currentPath !== '/' && (
                <Button
                  variant="contained"
                  onClick={handleNavigateUp}
                  sx={styles.actionButton}
                >
                  {t('home.upDirectory')}
                </Button>
              )}
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
              files={files}
              viewMode={viewMode}
              selectedFiles={selectedFiles}
              onViewModeChange={setViewMode}
              onToggleSelect={handleToggleSelect}
              onDelete={handleDelete}
              onMove={handleMove}
              onDownload={handleDownload}
              onSelect={handleSelect}
              onPreview={handlePreview}
              breadcrumbs={
                <Box sx={styles.breadcrumbs}>
                  {getBreadcrumbs().map((crumb, index, array) => (
                    <React.Fragment key={crumb.path}>
                      {index > 0 && (
                        <Typography variant="body2" sx={styles.breadcrumbDivider}>
                          /
                        </Typography>
                      )}
                      <Button
                        size="small"
                        onClick={() => navigate(`/?service=${currentService}&path=${encodeURIComponent(crumb.path)}`)}
                        sx={styles.breadcrumbButton}
                        className={`${crumb.name === '/' ? 'root' : ''} ${index === array.length - 1 ? 'active' : ''}`}
                      >
                        {crumb.name === '/' ? t('home.root') : crumb.name}
                      </Button>
                    </React.Fragment>
                  ))}
                </Box>
              }
            />
          </>
        ) : (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
            {t('home.selectService')}
          </Typography>
        )}
      </Box>

      <CustomAlert 
        open={alert.show}
        message={alert.message}
        severity={alert.severity}
        onClose={handleCloseAlert}
      />

      {/* 服务商选择弹窗 */}
      <StorageProviderSelect
        open={dialogState.showProviderSelect}
        onClose={() => setDialogState(prev => ({ ...prev, showProviderSelect: false }))}
        onSelect={handleProviderSelect}
      />

      {/* B2 连接表单弹窗 */}
      <Dialog 
        open={dialogState.showB2Form} 
        onClose={() => setDialogState(prev => ({ ...prev, showB2Form: false }))}
      >
        <DialogContent>
          <B2ConnectionForm
            onSubmit={handleB2Connect}
            isLoading={dialogState.isConnecting}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home; 