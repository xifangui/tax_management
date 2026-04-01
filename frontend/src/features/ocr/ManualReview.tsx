import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  Alert,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { Check as CheckIcon, Refresh as RefreshIcon, Warning as WarningIcon } from '@mui/icons-material';

interface OcrResult {
  id: number;
  receiptId: string;
  merchantName?: string;
  companyName?: string;
  registrationNumber?: string;
  totalAmount?: number;
  taxAmount?: number;
  taxRate?: number;
  accountCategory?: string;
  reviewStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  reviewReason?: string;
  imageUrl?: string;
}

const ManualReview = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('PENDING');
  const [reviewReason, setReviewReason] = useState('');

  // 模拟数据
  const [results] = useState<OcrResult[]>([
    {
      id: 1,
      receiptId: 'R-20260328-001',
      merchantName: '居酒屋たろう',
      companyName: '株式会社サンプル商事',
      registrationNumber: 'T9988776655443',
      totalAmount: 5600,
      taxAmount: 509,
      taxRate: 10,
      accountCategory: '会議費',
      reviewStatus: 'PENDING',
      reviewReason: '文字一部不鮮明のため人工確認推奨',
    },
    {
      id: 2,
      receiptId: 'R-20260328-002',
      merchantName: '不明',
      registrationNumber: '未抽出',
      totalAmount: 0,
      reviewStatus: 'REJECTED',
      reviewReason: '画像がぼやけていて認識不可',
    },
    {
      id: 3,
      receiptId: 'R-20260328-003',
      merchantName: 'スーパーABC',
      companyName: '株式会社サンプルフード',
      registrationNumber: 'T1234567890123',
      totalAmount: 12800,
      taxAmount: 1024,
      taxRate: 8,
      accountCategory: '仕入高',
      reviewStatus: 'PENDING',
      reviewReason: '登録番号の形式が異常',
    },
  ]);

  const selectedResult = results.find(r => r.id === selectedId);

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
    if (activeTab === 0) return result.reviewStatus === 'PENDING';
    if (activeTab === 1) return result.reviewStatus === 'REJECTED';
    return true;
  });

  const handleApprove = () => {
    if (!selectedId) return;
    console.log('Approving result:', selectedId);
    setSelectedId(null);
  };

  const handleReject = () => {
    if (!selectedId) return;
    console.log('Rejecting result:', selectedId, 'Reason:', reviewReason);
    setSelectedId(null);
  };

  const handleRetry = () => {
    if (!selectedId) return;
    console.log('Retrying OCR for result:', selectedId);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        異常票据・人工復核
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="要人工確認" />
          <Tab label="異常隔離" />
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
                      <TableCell>状態</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow 
                        key={result.id} 
                        hover 
                        onClick={() => setSelectedId(result.id)} 
                        sx={{ cursor: 'pointer', ...(selectedId === result.id && { bgcolor: '#f3f4f6' }) }}
                      >
                        <TableCell>{result.receiptId}</TableCell>
                        <TableCell>
                          {result.merchantName || '不明'}
                          {result.companyName && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {result.companyName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{result.registrationNumber || '未抽出'}</TableCell>
                        <TableCell>¥{result.totalAmount?.toLocaleString() || '0'}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(result.reviewStatus)}
                            size="small"
                            sx={getStatusColor(result.reviewStatus)}
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
          {selectedResult ? (
            <Card sx={{
              bgcolor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  詳細情報
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    レシート画像
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: '#f9fafb',
                      border: '1px dashed #d1d5db',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => setLightboxOpen(true)}
                  >
                    <Typography variant="body2" color="text.secondary">
                      画像をクリックして拡大
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      店名
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.merchantName || '不明'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      取引会社名
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.companyName || '不明'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      登録番号
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.registrationNumber || '未抽出'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      合計金額
                    </Typography>
                    <Typography variant="body1">
                      ¥{selectedResult.totalAmount?.toLocaleString() || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      消費税
                    </Typography>
                    <Typography variant="body1">
                      ¥{selectedResult.taxAmount?.toLocaleString() || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      税率
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.taxRate ? `${selectedResult.taxRate}%` : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      勘定科目
                    </Typography>
                    <Typography variant="body1">
                      {selectedResult.accountCategory || '未分類'}
                    </Typography>
                  </Grid>
                  {selectedResult.reviewReason && (
                    <Grid item xs={12}>
                      <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1 }}>
                        {selectedResult.reviewReason}
                      </Alert>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="補正内容"
                    multiline
                    rows={2}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckIcon />}
                      onClick={handleApprove}
                      fullWidth
                    >
                      補正して確定
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleReject}
                      fullWidth
                    >
                      異常隔離
                    </Button>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                    fullWidth
                  >
                    再OCR実行
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{
              bgcolor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  左のリストから項目を選択してください
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {lightboxOpen && selectedResult?.imageUrl && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={[{ src: selectedResult.imageUrl }]}
        />
      )}
    </Box>
  );
};

export default ManualReview;
