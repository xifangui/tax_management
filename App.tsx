import { useState } from 'react';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Divider,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import LoginForm from './features/auth/LoginForm';
import Dashboard from './features/dashboard/Dashboard';
import CustomerManagement from './features/customers/CustomerManagement';
import FileUpload from './features/files/FileUpload';
import OcrManagement from './features/ocr/OcrManagement';
import UserManagement from './features/users/UserManagement';
import DataExport from './features/export/DataExport';
import SystemSettings from './features/system/SystemSettings';
import AuditLogs from './features/system/AuditLogs';
import { useAppSelector } from './hooks';

const tabs = [
  { label: 'ダッシュボード', value: 'dashboard' },
  { label: '顧客管理', value: 'customers' },
  { label: 'ファイル管理', value: 'files' },
  { label: 'OCR結果', value: 'ocr' },
  { label: 'データ出力', value: 'export' },
  { label: 'システム設定', value: 'settings', adminOnly: true },
  { label: '監査ログ', value: 'audit', adminOnly: true },
];

function App() {
  const [value, setValue] = useState('dashboard');
  const auth = useAppSelector((state) => state.auth);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">Auto Bookkeeping</Typography>
          <Typography variant="body2">税理士向け自動記帳サービス</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 4 }}>
        {!auth.user ? (
          <LoginForm />
        ) : (
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
                {auth.user.role === 'ADMIN' && <Tab label="ユーザー管理" value="users" />}
              </Tabs>
            </Box>
            <Box sx={{ pb: 4 }}>
              {value === 'dashboard' && <Dashboard />}
              {value === 'customers' && <CustomerManagement />}
              {value === 'files' && <FileUpload />}
              {value === 'ocr' && <OcrManagement />}
              {value === 'export' && <DataExport />}
              {value === 'settings' && auth.user.role === 'ADMIN' && <SystemSettings />}
              {value === 'audit' && auth.user.role === 'ADMIN' && <AuditLogs />}
              {value === 'users' && auth.user.role === 'ADMIN' && <UserManagement />}
            </Box>
          </Box>
        )}
      </Container>
      <Divider />
      <Box component="footer" sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="caption">Powered by React 18, TypeScript, Redux Toolkit, MUI, Vite</Typography>
      </Box>
    </Box>
  );
}

export default App;
