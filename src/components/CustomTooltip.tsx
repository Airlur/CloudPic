import { Tooltip, tooltipClasses, TooltipProps, styled } from '@mui/material';

// 自定义 Tooltip 样式
const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
    color: theme.palette.mode === 'dark' ? '#ffffff' : '#424242',
    boxShadow: theme.shadows[2],
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 12px',
    border: `1px solid ${theme.palette.mode === 'dark' ? '#555555' : '#e0e0e0'}`,
    borderRadius: '6px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
    '&:before': {
      border: `1px solid ${theme.palette.mode === 'dark' ? '#555555' : '#e0e0e0'}`,
      backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#ffffff',
    },
  },
}));

export default CustomTooltip; 