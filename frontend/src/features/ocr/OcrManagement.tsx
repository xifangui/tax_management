import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { useGetOcrResultQuery, useGetOcrResultsQuery, useRetryOcrResultMutation, useUpdateOcrResultMutation } from './ocrApi';

interface OcrManagementProps {
  defaultTab?: 'all' | 'approved' | 'pending' | 'rejected' | 'test';
}

const OcrManagement = ({ defaultTab = 'all' }: OcrManagementProps) => {
  const { data: results = [] } = useGetOcrResultsQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: detail } = useGetOcrResultQuery(selectedId ?? 0, { skip: selectedId === null });
  const [updateOcrResult] = useUpdateOcrResultMutation();
  const [retryOcrResult] = useRetryOcrResultMutation();
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [tabValue, setTabValue] = useState(defaultTab);

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handleUpdate = async () => {
    if (!selectedId) return;
    await updateOcrResult({ id: selectedId, review_status: reviewStatus }).unwrap();
  };

  const handleRetry = async () => {
    if (!selectedId) return;
    await retryOcrResult(selectedId).unwrap();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { bgcolor: '#dcfce7', color: '#166534' };
      case 'PENDING':
        return { bgcolor: '#dbeafe', color: '#1d4ed8' };
      case 'REJECTED':
        return { bgcolor: '#fee2e2', color: '#991b1b' };
      default:
        return { bgcolor: '#fef3c7', color: '#92400e' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '自動確定';
      case 'PENDING':
        return '人工確認';
      case 'REJECTED':
        return '異常隔離';
      default:
        return status;
    }
  };

  const filteredResults = results.filter((result) => {
    if (tabValue === 'all') return true;
    if (tabValue === 'approved') return result.review_status === 'APPROVED';
    if (tabValue === 'pending') return result.review_status === 'PENDING';
    if (tabValue === 'rejected') return result.review_status === 'REJECTED';
    return true;
  });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        2. 認識結果一覧 / 異常隔離
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="全件" value="all" />
          <Tab label="認識成功" value="approved" />
          <Tab label="要人工確認" value="pending" />
          <Tab label="異常隔離" value="rejected" />
          <Tab label="テストデータ" value="test" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>受付ID</TableCell>
                      <TableCell>店名 / 会社名</TableCell>
                      <TableCell>登録番号</TableCell>
                      <TableCell>合計金額</TableCell>
                      <TableCell>消費税</TableCell>
                      <TableCell>税率</TableCell>
                      <TableCell>分類科目</TableCell>
                      <TableCell>状態</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id} hover onClick={() => handleSelect(result.id)} sx={{ cursor: 'pointer' }}>
                        <TableCell>R-{new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-{String(result.id).padStart(3, '0')}</TableCell>
                        <TableCell>
                          {result.merchant_name || result.company_name || '不明'}
                          {result.merchant_name && result.company_name && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {result.company_name}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{result.registration_number || '未抽出'}</TableCell>
                        <TableCell>¥{result.total_amount?.toLocaleString() || '0'}</TableCell>
                        <TableCell>¥{result.tax_amount?.toLocaleString() || '-'}</TableCell>
                        <TableCell>{result.tax_rate ? `${result.tax_rate}%` : '-'}</TableCell>
                        <TableCell>{result.account_category || '未分類'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(result.review_status)}
                            size="small"
                            sx={getStatusColor(result.review_status)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
                3. OCR認識詳細 / 人工補正画面
              </Typography>
              {detail ? (
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">店名</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        {detail.merchant_name || '未登録'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">取引会社名</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        {detail.company_name || '未登録'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">登録番号</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        {detail.registration_number || '未抽出'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">合計金額</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        ¥{detail.total_amount?.toLocaleString() || '0'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">消費税</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        ¥{detail.tax_amount?.toLocaleString() || '-'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">税率</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        {detail.tax_rate ? `${detail.tax_rate}%` : '-'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">勘定科目</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        {detail.account_category || '未分類'}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">判定結果</Typography>
                      <Box sx={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        bgcolor: '#f9fafb',
                        p: 1,
                        minHeight: '42px',
                        fontSize: '14px',
                      }}>
                        {detail.review_status === 'PENDING' ? '文字一部不鮮明のため人工確認推奨' : '正常認識'}
                      </Box>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="success" onClick={handleUpdate}>
                      補正して確定
                    </Button>
                    <Button variant="outlined" onClick={handleRetry}>
                      再OCR実行
                    </Button>
                    <Button variant="outlined" color="warning" onClick={() => setLightboxOpen(true)}>
                      画像プレビュー
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography>対象の OCR 結果を選択してください。</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: detail?.image_url ?? 'https://via.placeholder.com/900x600?text=Receipt+Preview' }]}
        />
      )}
    </Box>
  );
};

export default OcrManagement;
