import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import { CloudUpload, FolderOpen, Description } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useGetCustomersQuery } from '../customers/customersApi';
import { useDeleteFileMutation, useGetFilesQuery, useUploadFilesMutation } from './filesApi';
import type { Customer } from '../../types';

const FileUpload = () => {
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: files = [], refetch } = useGetFilesQuery();
  const [uploadFiles] = useUploadFilesMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [customerId, setCustomerId] = useState<string>('');
  const [localFolderPath, setLocalFolderPath] = useState<string>('C:\\company_receipts\\2026\\03\\');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const customerOptions = useMemo(() => customers, [customers]);

  const handleCustomerChange = (event: SelectChangeEvent<string>) => {
    setCustomerId(event.target.value);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    if (!customerId || !selectedFiles.length) return;
    const formData = new FormData();
    formData.append('customer_id', customerId);
    formData.append('source_type', 'MANUAL');
    selectedFiles.forEach((file) => formData.append('files', file));
    await uploadFiles(formData).unwrap();
    setSelectedFiles([]);
    refetch();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFolderRead = async () => {
    // 这里应该调用API读取本地文件夹，目前只是模拟
    console.log('Reading folder:', localFolderPath);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        1. ファイルアップロード / ローカルフォルダ読取
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
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
                      value={customerId}
                      onChange={handleCustomerChange}
                      displayEmpty
                    >
                      <MenuItem value="">
                        <em>選択してください</em>
                      </MenuItem>
                      {customerOptions.map((customer: Customer) => (
                        <MenuItem key={customer.id} value={String(customer.id)}>
                          {customer.customer_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Button variant="contained" size="small">顧客切替</Button>
                <Button variant="outlined" size="small">新規顧客登録</Button>
              </Box>
            </CardContent>
          </Card>

          {/* ドラッグ＆ドロップアップロードエリア */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? '#3b82f6' : '#93c5fd',
                  bgcolor: '#eff6ff',
                  borderRadius: '12px',
                  p: 4.5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    bgcolor: '#dbeafe',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  ここに領収書・レシート・通帳画像をドラッグ＆ドロップ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  単一ファイル / 複数ファイル / フォルダ一括アップロードに対応
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  disabled={!customerId || !selectedFiles.length}
                  onClick={handleUpload}
                >
                  アップロード
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Description />}
                  onClick={() => document.querySelector('input[type="file"]')?.click()}
                >
                  ファイルを選択
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FolderOpen />}
                  onClick={() => document.querySelector('input[type="file"][webkitdirectory]')?.click()}
                >
                  フォルダ選択
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => console.log('Test directory upload')}
                >
                  テスト用ディレクトリへ投入
                </Button>
              </Box>

              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    選択されたファイル ({selectedFiles.length}件)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => handleRemoveFile(index)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* ローカルフォルダ読取エリア */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontSize: 16, mt: 0 }}>
                ローカル指定フォルダ読取
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  value={localFolderPath}
                  onChange={(e) => setLocalFolderPath(e.target.value)}
                />
                <Button variant="outlined" size="small">参照</Button>
                <Button variant="contained" color="success" size="small" onClick={handleFolderRead}>
                  読取開始
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                ※ 外部クラウド未連携でも、社内ローカルフォルダから票据を一括読取可能
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          {/* アップロード処理状況 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                アップロード処理状況
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ファイル名</TableCell>
                      <TableCell>状態</TableCell>
                      <TableCell>件数</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.original_filename}</TableCell>
                        <TableCell>
                          <Chip
                            label={file.upload_status}
                            size="small"
                            color={
                              file.upload_status === '完了' ? 'success' :
                              file.upload_status === 'OCR処理中' ? 'info' :
                              file.upload_status === '一部要確認' ? 'warning' :
                              file.upload_status === '認識失敗' ? 'error' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>1</TableCell>
                      </TableRow>
                    ))}
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

export default FileUpload;
