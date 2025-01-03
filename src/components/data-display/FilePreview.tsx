import { Dialog, DialogContent, IconButton, Box, Typography } from '@mui/material';
import { 
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon
} from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';

interface PreviewFile {
  url: string;
  mimeType: string;
}

interface PreviewProps {
  open: boolean;
  files: PreviewFile[];  // 所有可预览的文件
  currentIndex: number;
  onClose: () => void;
}

const PREVIEW_WIDTH = 1200;
const PREVIEW_HEIGHT = 800;

export const FilePreview: React.FC<PreviewProps> = ({ 
  open, 
  files,
  currentIndex,
  onClose
}) => {
  const [index, setIndex] = useState(currentIndex);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  // 当前预览的文件
  const currentFile = files[index];

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  // 处理图片尺寸
  useEffect(() => {
    if (open && currentFile?.mimeType.startsWith('image/')) {
      const img = new Image();
      img.src = currentFile.url;
      img.onload = () => {
        const widthRatio = (PREVIEW_WIDTH - 48) / img.width;
        const heightRatio = (PREVIEW_HEIGHT - 48) / img.height;
        const ratio = Math.min(widthRatio, heightRatio, 1);
        
        setImgDimensions({
          width: img.width * ratio,
          height: img.height * ratio
        });
      };
    }
  }, [open, currentFile]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();  // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    if (files.length > 0) {
      setIndex((index + 1) % files.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();  // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    if (files.length > 0) {
      setIndex(index - 1 < 0 ? files.length - 1 : index - 1);
    }
  };

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowLeft') {
        handlePrev(e as unknown as React.MouseEvent);
      } else if (e.key === 'ArrowRight') {
        handleNext(e as unknown as React.MouseEvent);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, files.length, index]);

  const renderPreviewContent = () => {
    if (!currentFile) return null;

    if (currentFile.mimeType.startsWith('image/')) {
      return (
        <Box
          component="img"
          src={currentFile.url}
          alt="preview"
          sx={{
            width: imgDimensions.width,
            height: imgDimensions.height,
            objectFit: 'contain',
            userSelect: 'none'
          }}
        />
      );
    }

    if (currentFile.mimeType.startsWith('video/')) {
      return (
        <Box
          component="video"
          ref={videoRef}
          src={currentFile.url}
          controls
          autoPlay
          sx={{
            maxWidth: PREVIEW_WIDTH - 48,
            maxHeight: PREVIEW_HEIGHT - 48,
            width: '100%',
            height: '100%'
          }}
        />
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: 'white'
        }}
      >
        <Typography variant="h6">
          该文件类型暂不支持预览
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          boxShadow: 24,
          width: PREVIEW_WIDTH,
          height: PREVIEW_HEIGHT,
          maxWidth: '90vw',
          maxHeight: '90vh'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          color: 'white',
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)'
          },
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>

      {files.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',  // 让整个容器不接收鼠标事件
            zIndex: 1
          }}
        >
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              },
              pointerEvents: 'auto'  // 让按钮可以接收鼠标事件
            }}
          >
            <PrevIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              },
              pointerEvents: 'auto'  // 让按钮可以接收鼠标事件
            }}
          >
            <NextIcon />
          </IconButton>
        </Box>
      )}

      <DialogContent 
        sx={{ 
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          color: 'white'
        }}
      >
        {renderPreviewContent()}
      </DialogContent>
    </Dialog>
  );
}; 