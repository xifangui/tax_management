import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
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
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCreateUserMutation, useDeleteUserMutation, useGetUsersQuery } from './usersApi';
import type { User } from '../../types';

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'GENERAL';
}

const defaultValues: UserFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'GENERAL',
};

const UserManagement = () => {
  const { data: users = [], refetch } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { register, handleSubmit, reset } = useForm<UserFormValues>({ defaultValues });

  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    await createUser(values).unwrap();
    reset(defaultValues);
    setSelectedUser(null);
    refetch();
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        ユーザー管理
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            ユーザー登録 / 編集
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
            <TextField fullWidth label="氏名" {...register('name')} required />
            <TextField fullWidth label="メール" type="email" {...register('email')} required />
            <TextField fullWidth label="パスワード" type="password" {...register('password')} required={!selectedUser} />
            <FormControl fullWidth>
              <InputLabel>ロール</InputLabel>
              <Select label="ロール" defaultValue="GENERAL" {...register('role')}>
                <MenuItem value="GENERAL">GENERAL</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button type="submit" variant="contained">
                ユーザー作成
              </Button>
              <Button variant="outlined" onClick={() => {
                reset(defaultValues);
                setSelectedUser(null);
              }}>
                クリア
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            ユーザー一覧
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>氏名</TableCell>
                  <TableCell>メール</TableCell>
                  <TableCell>ロール</TableCell>
                  <TableCell>状態</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEdit(user)}>
                        編集
                      </Button>
                      <Button size="small" color="error" onClick={() => deleteUser(user.id).unwrap().then(refetch)}>
                        無効化
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

export default UserManagement;
