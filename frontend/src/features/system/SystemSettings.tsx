import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Settings as SettingsIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  type SystemSettings,
} from './systemApi';

interface SystemSettingsProps {
  viewType?: 'general' | 'account' | 'rule' | 'test';
}

const SystemSettings = ({ viewType = 'general' }: SystemSettingsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState<Partial<SystemSettings>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: currentSettings, isLoading } = useGetSystemSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSystemSettingsMutation();

  // 初期値を設定
  useState(() => {
    if (currentSettings && !settings.ocr) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  // ビューに応じたタイトルを取得
  const getTitle = () => {
    switch (viewType) {
      case 'account':
        return '勘定科目設定';
      case 'rule':
        return '分類ルール管理';
      case 'test':
        return 'テスト環境';
      default:
        return 'システム設定';
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings(settings).unwrap();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('設定更新エラー:', error);
      alert('設定の更新に失敗しました');
    }
  };

  const handleChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {getTitle()}
      </Typography>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          設定を更新しました
        </Alert>
      )}

      {/* 勘定科目設定 */}
      {viewType === 'account' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              勘定科目一覧
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" size="small">
                + 新規追加
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">勘定科目の管理機能は開発中です</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 分類ルール管理 */}
      {viewType === 'rule' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              分類ルール一覧
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" size="small">
                + 新規追加
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2">分類ルールの管理機能は開発中です</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* テスト環境 */}
      {viewType === 'test' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              テスト環境設定
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  この機能は開発・テスト環境でのみ使用可能です
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="テストデータベースURL"
                  placeholder="postgresql://localhost:5432/test_db"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="テストOCR APIキー"
                  type="password"
                  placeholder="テスト用APIキーを入力"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary">
                  テストデータを初期化
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* 一般システム設定 */}
      {viewType === 'general' && (
        <>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="OCR設定" />
            <Tab label="ファイル設定" />
            <Tab label="エクスポート設定" />
            <Tab label="セキュリティ設定" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {/* OCR設定 */}
            {activeTab === 0 && settings.ocr && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    OCR設定
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="プロバイダー"
                        value={settings.ocr.provider}
                        onChange={(e) => handleChange('ocr', 'provider', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="APIエンドポイント"
                        value={settings.ocr.apiEndpoint}
                        onChange={(e) => handleChange('ocr', 'apiEndpoint', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="最大並列数"
                        value={settings.ocr.maxConcurrency}
                        onChange={(e) => handleChange('ocr', 'maxConcurrency', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="タイムアウト（秒）"
                        value={settings.ocr.timeout}
                        onChange={(e) => handleChange('ocr', 'timeout', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 10, max: 300 } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* ファイル設定 */}
            {activeTab === 1 && settings.file && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ファイル設定
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="最大ファイルサイズ（バイト）"
                        value={settings.file.maxFileSize}
                        onChange={(e) => handleChange('file', 'maxFileSize', parseInt(e.target.value))}
                        helperText="最大10MB（10485760バイト）"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="許可拡張子"
                        value={settings.file.allowedExtensions.join(', ')}
                        onChange={(e) => handleChange('file', 'allowedExtensions', e.target.value.split(', '))}
                        helperText="カンマ区切りで入力"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ストレージタイプ"
                        value={settings.file.storageType}
                        onChange={(e) => handleChange('file', 'storageType', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="ストレージパス"
                        value={settings.file.storagePath}
                        onChange={(e) => handleChange('file', 'storagePath', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* エクスポート設定 */}
            {activeTab === 2 && settings.export && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    エクスポート設定
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="デフォルトエンコーディング"
                        value={settings.export.defaultEncoding}
                        onChange={(e) => handleChange('export', 'defaultEncoding', e.target.value)}
                      >
                        <option value="UTF-8">UTF-8</option>
                        <option value="Shift_JIS">Shift_JIS</option>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="リンク有効期限（日）"
                        value={settings.export.linkExpirationDays}
                        onChange={(e) => handleChange('export', 'linkExpirationDays', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 1, max: 30 } }}
                        helperText="ダウンロードリンクの有効期限"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* セキュリティ設定 */}
            {activeTab === 3 && settings.security && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    セキュリティ設定
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="JWT有効期限（秒）"
                        value={settings.security.jwtExpiration}
                        onChange={(e) => handleChange('security', 'jwtExpiration', parseInt(e.target.value))}
                        helperText="アクセストークンの有効期間"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="リフレッシュトークン有効期限（秒）"
                        value={settings.security.refreshTokenExpiration}
                        onChange={(e) => handleChange('security', 'refreshTokenExpiration', parseInt(e.target.value))}
                        helperText="リフレッシュトークンの有効期間"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="最大ログイン試行回数"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        helperText="アカウントロックまでの試行回数"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="ロックアウト時間（秒）"
                        value={settings.security.lockoutDuration}
                        onChange={(e) => handleChange('security', 'lockoutDuration', parseInt(e.target.value))}
                        helperText="アカウントロックの持続時間"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? '保存中...' : '設定を保存'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SystemSettings;
