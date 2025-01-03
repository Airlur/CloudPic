import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Drawer, AppBar, Toolbar, Typography, Button, List, ListItem, ListItemIcon, 
  ListItemText, IconButton, Divider } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Logout as LogoutIcon, Storage as StorageIcon,
  Add as AddIcon, Delete as DeleteIcon, DriveFileMove as DriveFileMoveIcon,
  DarkMode as DarkModeIcon, LightMode as LightModeIcon, Cloud as CloudIcon,
  CreateNewFolder as CreateNewFolderIcon, Download as DownloadIcon } from '@mui/icons-material';
import { LanguageSwitch, CustomTooltip, CustomAlert } from '@/components';
import { FileView, FilePreview } from '@/components/data-display';
import { useTheme } from '@/themes/ThemeContext';
import { logout } from '@/services/auth/auth';
import { FileItem, ViewMode } from '@/types/file';
import { StorageProviderDialog } from '@/components/dialogs/StorageProviderDialog';
import { StorageConnectionDialog } from '@/components/dialogs/StorageConnectionDialog';
import { getStorageConnections, getFileList } from '@/services/storage/storage';
import type { StorageConnection } from '@/services/storage/storage';

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
  const [dialogState, setDialogState] = useState({
    showProviderSelect: false,
    showConnectionForm: false,
    selectedProvider: ''
  });
  const [storageConnections, setStorageConnections] = useState<StorageConnection[]>([]);
  const [previewState, setPreviewState] = useState<{
    open: boolean;
    files: Array<{ url: string; mimeType: string; }>;
    currentIndex: number;
  }>({
    open: false,
    files: [],
    currentIndex: 0
  });

  // 从路由中获取当前服务和路径
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = params.get('service') || '';
    const path = params.get('path') || '/';
    
    setCurrentService(service);
    setCurrentPath(path);
    
    if (service) {
      const fetchFiles = async () => {
        const prefix = path === '/' ? undefined : path.startsWith('/') ? path.slice(1) : path;
        const response = await getFileList(service, prefix);
        if (response.code === 200 && response.data) {
          setFiles(response.data.files);
        }
      };
      fetchFiles();
    }
  }, [location]);

  // 处理存储服务切换
  const handleServiceSelect = (serviceId: string) => {
    navigate(`/?service=${serviceId}&path=/`);
  };

  // 处理文件夹导航
  const handlePreview = (file: FileItem) => {
    if (file.isDirectory) {
      const newPath = currentPath === '/' 
        ? `/${file.name}` 
        : `${currentPath}/${file.name}`;
      navigate(`/?service=${currentService}&path=${encodeURIComponent(newPath)}`);
    } else if (file.url) {
      // 收集所有可预览的文件（图片和视频）
      const previewableFiles = files
        .filter(f => 
          (f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/')) && f.url
        )
        .map(f => ({
          url: f.url!,
          mimeType: f.mimeType
        }));
      
      if (previewableFiles.length > 0) {
        const currentIndex = previewableFiles.findIndex(
          f => f.url === file.url
        );
        
        if (currentIndex !== -1) {
          setPreviewState({
            open: true,
            files: previewableFiles,
            currentIndex
          });
        }
      }
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
    setDialogState({
      showProviderSelect: false,
      showConnectionForm: true,
      selectedProvider: providerId
    });
  };

  const handleCloseDialogs = () => {
    setDialogState({
      showProviderSelect: false,
      showConnectionForm: false,
      selectedProvider: ''
    });
  };

  const fetchStorageConnections = async () => {
    const response = await getStorageConnections();
    if (response.code === 200 && response.data) {
      setStorageConnections(response.data);
    }
  };

  const handleClosePreview = () => {
    setPreviewState({
      open: false,
      files: [],
      currentIndex: 0
    });
  };

  useEffect(() => {
    fetchStorageConnections();
  }, []);

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
          {storageConnections.map((connection) => (
            <ListItem 
              button 
              key={connection.id}
              selected={currentService === connection.id}
              onClick={() => handleServiceSelect(connection.id)}
            >
              <ListItemIcon>
                <StorageIcon color={currentService === connection.id ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText 
                primary={connection.name} 
                secondary={connection.type} 
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

      <StorageProviderDialog
        open={dialogState.showProviderSelect}
        onClose={handleCloseDialogs}
        onSelect={handleProviderSelect}
      />

      <StorageConnectionDialog
        open={dialogState.showConnectionForm}
        providerId={dialogState.selectedProvider}
        onClose={handleCloseDialogs}
        onSuccess={() => {
          // TODO: 刷新存储连接列表
        }}
      />

      <FilePreview 
        open={previewState.open}
        files={previewState.files}
        currentIndex={previewState.currentIndex}
        onClose={handleClosePreview}
      />
    </Box>
  );
};

export default Home; 