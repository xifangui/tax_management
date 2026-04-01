import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
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
} from '@mui/material';
import { useGetCustomersQuery } from '../customers/customersApi';
import { useDeleteFileMutation, useGetFilesQuery, useUploadFilesMutation } from './filesApi';
import type { Customer } from '../../types';

const FileUpload = () => {
  const { data: customers = [] } = useGetCustomersQuery();
  const { data: files = [], refetch } = useGetFilesQuery();
  const [uploadFiles] = useUploadFilesMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [customerId, setCustomerId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const customerOptions = useMemo(() => customers, [customers]);

  const handleCustomerChange = (event: SelectChangeEvent<string>) => {
    setCustomerId(event.target.value);
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!customerId || !selectedFiles?.length) return;
    const formData = new FormData();
    formData.append('customer_id', customerId);
    formData.append('source_type', 'MANUAL');
    Array.from(selectedFiles).forEach((file) => formData.append('files', file));
    await uploadFiles(formData).unwrap();
    setSelectedFiles(null);
    refetch();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        ファイルアップロード
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>顧客</InputLabel>
              <Select label="顧客" value={customerId} onChange={handleCustomerChange}>
                {customerOptions.map((customer: Customer) => (
                  <MenuItem key={customer.id} value={String(customer.id)}>
                    {customer.customer_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" component="label">
              ファイルを選択
              <input hidden multiple type="file" onChange={handleFilesChange} />
            </Button>
            {selectedFiles && <Typography>{selectedFiles.length} 件選択済み</Typography>}
            <Button variant="contained" disabled={!customerId || !selectedFiles?.length} onClick={handleUpload}>
              アップロード
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            アップロード済みファイル
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>ファイル名</TableCell>
                  <TableCell>状態</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>{file.id}</TableCell>
                    <TableCell>{file.original_filename}</TableCell>
                    <TableCell>{file.upload_status}</TableCell>
                    <TableCell>
                      <Button size="small" href={`/files/${file.id}/download`} target="_blank">
                        ダウンロード
                      </Button>
                      <Button size="small" color="error" onClick={() => deleteFile(file.id).unwrap().then(refetch)}>
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileUpload;
