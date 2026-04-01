import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import { useAppDispatch } from '../../hooks';
import { useLazyMeQuery, useLoginMutation } from './authApi';
import { setCredentials, setUser } from './authSlice';

interface LoginFormValues {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email('正しいメールアドレスを入力してください').required('必須です'),
  password: yup.string().required('必須です'),
});

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();
  const [fetchUser, { data: user, isSuccess }] = useLazyMeQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: 'admin@example.com', password: 'password123' },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    const result = await login(values).unwrap();
    dispatch(setCredentials({ token: result.access_token }));
    fetchUser();
  };

  useEffect(() => {
    if (isSuccess && user) {
      dispatch(setUser(user));
    }
  }, [dispatch, isSuccess, user]);

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              サインイン
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                fullWidth
                label="メールアドレス"
                margin="normal"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                fullWidth
                label="パスワード"
                type="password"
                margin="normal"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  ログインに失敗しました。メールアドレスとパスワードを確認してください。
                </Typography>
              )}
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={isLoading}>
                ログイン
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LoginForm;
