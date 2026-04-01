import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { subDays } from 'date-fns';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useGetSystemDashboardQuery } from '../system/systemApi';
import { useGetCustomersQuery, useCreateCustomerMutation } from '../customers/customersApi';

// 注册 Chart.js 所需的组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const lineOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 7));
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customer_name: '',
    industry_type: '',
    company_type: '',
    registration_number: '',
    contact_info: '',
  });
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const { data: dashboardData, isLoading, error } = useGetSystemDashboardQuery();
  const { data: customers = [], refetch: refetchCustomers } = useGetCustomersQuery();
  const [createCustomer] = useCreateCustomerMutation();

  const handleOpenNewCustomerDialog = () => {
    setNewCustomer({
      customer_name: '',
      industry_type: '',
      company_type: '',
      registration_number: '',
      contact_info: '',
    });
    setOpenNewCustomerDialog(true);
  };

  const handleCloseNewCustomerDialog = () => {
    setOpenNewCustomerDialog(false);
  };

  const handleCreateCustomer = async () => {
    setIsCreatingCustomer(true);
    try {
      await createCustomer(newCustomer).unwrap();
      setNewCustomer({
        customer_name: '',
        industry_type: '',
        company_type: '',
        registration_number: '',
        contact_info: '',
      });
      setOpenNewCustomerDialog(false);
      refetchCustomers();
    } catch (err) {
      console.error('顧客作成に失敗しました', err);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          ダッシュボード
        </Typography>
        <Typography color="error">データの取得に失敗しました</Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const lineData = {
    labels: dashboardData.ocrTrend?.map(item => item.date) || [],
    datasets: [
      {
        label: 'OCR処理件数',
        data: dashboardData.ocrTrend?.map(item => item.count) || [],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const successRate = dashboardData.completedOcr + dashboardData.failedOcr > 0
    ? ((dashboardData.completedOcr / (dashboardData.completedOcr + dashboardData.failedOcr)) * 100).toFixed(1)
    : '0.0';

  return (
    <Box>
      {/* 顧客選択エリア */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 220 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                顧客企業を選択
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>選択してください</em>
                  </MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={String(customer.id)}>
                      {customer.customer_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button variant="contained" size="small">顧客切替</Button>
            <Button variant="outlined" size="small" onClick={handleOpenNewCustomerDialog}>
              新規顧客登録
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openNewCustomerDialog} onClose={handleCloseNewCustomerDialog} fullWidth maxWidth="sm">
        <DialogTitle>新規顧客登録</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              label="顧客名"
              fullWidth
              value={newCustomer.customer_name}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, customer_name: e.target.value }))}
            />
            <TextField
              label="業種"
              fullWidth
              value={newCustomer.industry_type}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, industry_type: e.target.value }))}
            />
            <TextField
              label="会社種別"
              fullWidth
              value={newCustomer.company_type}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, company_type: e.target.value }))}
            />
            <TextField
              label="登録番号"
              fullWidth
              value={newCustomer.registration_number}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, registration_number: e.target.value }))}
            />
            <TextField
              label="連絡先"
              fullWidth
              value={newCustomer.contact_info}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, contact_info: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewCustomerDialog}>キャンセル</Button>
          <Button onClick={handleCreateCustomer} variant="contained" disabled={isCreatingCustomer}>
            {isCreatingCustomer ? '登録中...' : '登録'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '13px' }}>
                今月アップロード件数
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '28px', fontWeight: 700 }}>
                {dashboardData.totalFiles.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                前月比 +12.4%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '13px' }}>
                自動認識成功率
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '28px', fontWeight: 700 }}>
                {successRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                要人工確認 {dashboardData.ocrStats?.pending?.toLocaleString() || 0}件
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom sx={{ fontSize: '13px' }}>
                CSV出力待ち
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '28px', fontWeight: 700 }}>
                {dashboardData.pendingOcr.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                会計ソフト連携用
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* OCR処理状況 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h6">OCR 処理トレンド</Typography>
                <DatePicker selected={selectedDate} onChange={(date) => date && setSelectedDate(date)} />
              </Box>
              <Line options={lineOptions} data={lineData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                状態一覧
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">認識成功</Typography>
                  <Typography variant="h6">{dashboardData.ocrStats?.approved?.toLocaleString() || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">要人工確認</Typography>
                  <Typography variant="h6">{dashboardData.ocrStats?.pending?.toLocaleString() || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">異常隔離</Typography>
                  <Typography variant="h6">{dashboardData.ocrStats?.rejected?.toLocaleString() || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
