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
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 7));
  const { data: dashboardData, isLoading, error } = useGetSystemDashboardQuery();

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
      <Typography variant="h4" gutterBottom>
        ダッシュボード
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                今月のアップロード
              </Typography>
              <Typography variant="h5">{dashboardData.totalFiles.toLocaleString()} 件</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                自動認識成功率
              </Typography>
              <Typography variant="h5">{successRate}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                CSV出力待ち
              </Typography>
              <Typography variant="h5">{dashboardData.pendingOcr.toLocaleString()} 件</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                状態一覧
              </Typography>
              <Typography>認識成功: {dashboardData.ocrStats?.approved?.toLocaleString() || 0}</Typography>
              <Typography>要人工確認: {dashboardData.ocrStats?.pending?.toLocaleString() || 0}</Typography>
              <Typography>異常隔離: {dashboardData.ocrStats?.rejected?.toLocaleString() || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
