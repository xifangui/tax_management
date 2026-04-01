import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCreateCustomerMutation, useDeleteCustomerMutation, useGetCustomersQuery, useUpdateCustomerMutation } from './customersApi';
import type { Customer } from '../../types';

interface FormValues {
  customer_name: string;
  industry_type?: string;
  company_type?: string;
  registration_number?: string;
  contact_info?: string;
}

const defaultValues: FormValues = {
  customer_name: '',
  industry_type: '',
  company_type: '',
  registration_number: '',
  contact_info: '',
};

const CustomerManagement = () => {
  const { data: customers = [], isLoading, refetch } = useGetCustomersQuery();
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    if (!selectedCustomer) {
      reset(defaultValues);
    }
  }, [selectedCustomer, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    if (selectedCustomer) {
      await updateCustomer({ id: selectedCustomer.id, customer: values }).unwrap();
    } else {
      await createCustomer(values).unwrap();
    }
    setSelectedCustomer(null);
    reset(defaultValues);
    refetch();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        6. 顧客管理
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                顧客情報入力
              </Typography>
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField fullWidth label="顧客名" margin="normal" {...register('customer_name')} required />
                <TextField fullWidth label="業種" margin="normal" {...register('industry_type')} />
                <TextField fullWidth label="会社種別" margin="normal" {...register('company_type')} />
                <TextField fullWidth label="登録番号" margin="normal" {...register('registration_number')} />
                <TextField fullWidth label="連絡先" margin="normal" {...register('contact_info')} />
                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button type="submit" variant="contained">
                    {selectedCustomer ? '更新' : '追加'}
                  </Button>
                  <Button variant="outlined" onClick={() => setSelectedCustomer(null)}>
                    クリア
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{
            bgcolor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                顧客一覧
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>顧客名</TableCell>
                      <TableCell>業種</TableCell>
                      <TableCell>状態</TableCell>
                      <TableCell>テスト環境</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5}>読み込み中...</TableCell></TableRow>
                    ) : (
                      customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.customer_name}</TableCell>
                          <TableCell>{customer.industry_type || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              label={customer.status === 'ACTIVE' ? '有効' : customer.status}
                              size="small"
                              color={customer.status === 'ACTIVE' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>あり</TableCell>
                          <TableCell>
                            <Button size="small" onClick={() => {
                              setSelectedCustomer(customer);
                              reset({
                                customer_name: customer.customer_name,
                                industry_type: customer.industry_type ?? '',
                                company_type: customer.company_type ?? '',
                                registration_number: customer.registration_number ?? '',
                                contact_info: customer.contact_info ?? '',
                              });
                            }}>
                              編集
                            </Button>
                            <Button size="small" color="error" onClick={() => deleteCustomer(customer.id).unwrap().then(refetch)}>
                              無効化
                            </Button>
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

export default CustomerManagement;
