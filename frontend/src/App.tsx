import { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Badge,
  Button,
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginForm from './features/auth/LoginForm';
import Dashboard from './features/dashboard/Dashboard';
import CustomerManagement from './features/customers/CustomerManagement';
import FileUpload from './features/files/FileUpload';
import OcrManagement from './features/ocr/OcrManagement';
import ManualReview from './features/ocr/ManualReview';
import UserManagement from './features/users/UserManagement';
import DataExport from './features/export/DataExport';
import SystemSettings from './features/system/SystemSettings';
import AccountSettings from './features/system/AccountSettings';
import AuditLogs from './features/system/AuditLogs';
import { useAppSelector, useAppDispatch } from './hooks';
import { useLogoutMutation } from './features/auth/authApi';
import { clearAuth } from './features/auth/authSlice';

const drawerWidth = 250;

const mainMenuItems = [
  { label: 'ダッシュボード', value: 'dashboard' },
  { label: '顧客管理', value: 'customers' },
  { label: 'ファイルアップロード', value: 'files' },
  { label: '認識結果一覧', value: 'ocr' },
  { label: '異常・人工確認', value: 'manual-review' },
];

const settingsMenuItems = [
  { label: '勘定科目設定', value: 'account-settings' },
  { label: '分類ルール管理', value: 'rule-settings' },
  { label: 'CSV出力テンプレート', value: 'export-settings' },
  { label: '社員管理・権限管理', value: 'users', adminOnly: true },
  { label: 'テスト環境', value: 'test-env' },
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearAuth());
      setCurrentView('dashboard');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
      // APIエラーでもローカルの認証情報はクリアする
      dispatch(clearAuth());
      setCurrentView('dashboard');
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{
        bgcolor: '#111827',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 3,
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          自動記帳サービス
        </Typography>
      </Toolbar>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ bgcolor: '#111827', color: 'white' }}>
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            display: 'block',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
          }}
        >
          メイン
        </Typography>
        {mainMenuItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              selected={currentView === item.value}
              onClick={() => handleViewChange(item.value)}
              sx={{
                pl: 3,
                ...(currentView === item.value && {
                  bgcolor: '#1f2937',
                  borderLeft: '4px solid #3b82f6',
                  pl: 'calc(12px - 4px)',
                  fontWeight: 600,
                }),
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            display: 'block',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '.08em',
            mt: 2,
          }}
        >
          設定
        </Typography>
        {settingsMenuItems.map((item) => {
          if (item.adminOnly && auth.user?.role !== 'ADMIN') return null;
          return (
            <ListItem key={item.value} disablePadding>
              <ListItemButton
                selected={currentView === item.value}
                onClick={() => handleViewChange(item.value)}
                sx={{
                  pl: 3,
                  ...(currentView === item.value && {
                    bgcolor: '#1f2937',
                    borderLeft: '4px solid #3b82f6',
                    pl: 'calc(12px - 4px)',
                    fontWeight: 600,
                  }),
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  // 未ログイン時はログイン画面のみ表示
  if (!auth.user) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CssBaseline />
        <LoginForm />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: '#1f2937',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            税理士向け自動記帳サービス
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Badge
              sx={{
                bgcolor: '#eef2ff',
                color: '#4338ca',
                px: 1.5,
                py: 0.5,
                borderRadius: '999px',
                fontSize: '12px',
                display: { xs: 'none', sm: 'inline-block' },
              }}
            >
              OCR API連携: 稼働中
            </Badge>
            <Badge
              sx={{
                bgcolor: '#eef2ff',
                color: '#4338ca',
                px: 1.5,
                py: 0.5,
                borderRadius: '999px',
                fontSize: '12px',
                display: { xs: 'none', sm: 'inline-block' },
              }}
            >
              テストモード利用可
            </Badge>
            <Box
              sx={{
                bgcolor: '#f3f4f6',
                px: 1.5,
                py: 0.5,
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              {auth.user?.companyName || '山田会計事務所'} / {auth.user?.role === 'ADMIN' ? '管理者' : '一般'}
            </Box>
            <Button
              color="inherit"
              startIcon={isLoggingOut ? <CircularProgress size={20} /> : <LogoutIcon />}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#111827' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#111827' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1 }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'customers' && <CustomerManagement />}
          {currentView === 'files' && <FileUpload />}
          {currentView === 'ocr' && <OcrManagement />}
          {currentView === 'export-settings' && <DataExport />}
          {currentView === 'users' && auth.user.role === 'ADMIN' && <UserManagement />}
          {currentView === 'settings' && auth.user.role === 'ADMIN' && <SystemSettings />}
          {currentView === 'audit' && auth.user.role === 'ADMIN' && <AuditLogs />}
          {currentView === 'manual-review' && <ManualReview />}
          {currentView === 'account-settings' && <AccountSettings defaultTab={0} />}
          {currentView === 'rule-settings' && <AccountSettings defaultTab={1} />}
          {currentView === 'test-env' && <SystemSettings viewType="test" />}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
