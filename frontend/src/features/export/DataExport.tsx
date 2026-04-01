import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useGetExportTemplatesQuery,
  useGetExportLogsQuery,
  useExportCsvMutation,
} from './exportApi';

const DataExport = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [encoding, setEncoding] = useState<'UTF-8' | 'Shift_JIS'>('UTF-8');

  const { data: templates } = useGetExportTemplatesQuery();
  const { data: logs } = useGetExportLogsQuery(
    selectedCustomerId ? { customerId: selectedCustomerId } : {}
  );
  const [exportCsv, { isLoading: isExporting }] = useExportCsvMutation();

  const handleExport = async () => {
    if (!selectedCustomerId || !dateFrom || !dateTo || !selectedTemplateId) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      const blob = await exportCsv({
        customerId: selectedCustomerId,
        dateFrom: format(dateFrom, 'yyyy-MM-dd'),
        dateTo: format(dateTo, 'yyyy-MM-dd'),
        templateId: selectedTemplateId,
        encoding,
        includeStatus: ['APPROVED'],
      }).unwrap();

      // ファイルダウンロード
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${format(new Date(), 'yyyyMMdd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('エクスポートエラー:', error);
      alert('エクスポートに失敗しました');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        5. CSV出力 / テンプレート管理
      </Typography>

      <Grid container spacing={3}>
        {/* エクスポート条件 */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CSV出力
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    開始日
                  </Typography>
                  <ReactDatePicker
                    selected={dateFrom}
                    onChange={(date) => setDateFrom(date)}
                    dateFormat="yyyy/MM/dd"
                    locale={ja}
                    className="form-control"
                    customInput={<TextField fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    終了日
                  </Typography>
                  <ReactDatePicker
                    selected={dateTo}
                    onChange={(date) => setDateTo(date)}
                    dateFormat="yyyy/MM/dd"
                    locale={ja}
                    className="form-control"
                    customInput={<TextField fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    テンプレート
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    {templates?.map((template) => (
                      <Chip
                        key={template.id}
                        label={template.templateName}
                        onClick={() => setSelectedTemplateId(template.id)}
                        color={selectedTemplateId === template.id ? 'primary' : 'default'}
                        clickable
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={handleExport}
                      disabled={isExporting}
                      startIcon={isExporting ? <CircularProgress size={20} /> : <DownloadIcon />}
                    >
                      {isExporting ? 'エクスポート中...' : 'CSV出力'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* テンプレート管理 */}
        <Grid item xs={12} md={6}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CSV出力テンプレート
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  p: 1.5,
                  bgcolor: '#fafafa',
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    標準CSVテンプレート（日本会計ソフト向け）
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    日付 / 店名 / 登録番号 / 金額 / 税額 / 税率 / 勘定科目
                  </Typography>
                </Box>
                <Box sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  p: 1.5,
                  bgcolor: '#fafafa',
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    顧客別カスタムテンプレート
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    列順・名称・マッピングを自由設定可能
                  </Typography>
                </Box>
                <Box sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  p: 1.5,
                  bgcolor: '#fafafa',
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    フォーマット変換ツール
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    他社会計ソフト取込形式へ簡易変換
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="success">CSV出力</Button>
                  <Button variant="outlined">テンプレート編集</Button>
                  <Button variant="outlined">変換ツール起動</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* エクスポート履歴 */}
        <Grid item xs={12}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                エクスポート履歴
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ファイル名</TableCell>
                      <TableCell>レコード数</TableCell>
                      <TableCell>サイズ</TableCell>
                      <TableCell>作成日時</TableCell>
                      <TableCell>有効期限</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Alert severity="info" sx={{ mt: 2 }}>
                            エクスポート履歴がありません
                          </Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.filename}</TableCell>
                          <TableCell>{log.recordCount.toLocaleString()}件</TableCell>
                          <TableCell>{formatFileSize(log.fileSize)}</TableCell>
                          <TableCell>{format(new Date(log.createdAt), 'yyyy/MM/dd HH:mm')}</TableCell>
                          <TableCell>{format(new Date(log.expiresAt), 'yyyy/MM/dd HH:mm')}</TableCell>
                          <TableCell align="right">
                            <IconButton color="primary" size="small">
                              <DownloadIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataExport;
