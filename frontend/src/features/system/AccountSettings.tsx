import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  useGetClassificationRulesQuery,
  useCreateClassificationRuleMutation,
  useUpdateClassificationRuleMutation,
  useDeleteClassificationRuleMutation,
  useApplyClassificationRulesMutation,
  type ClassificationRule as ApiClassificationRule,
  type CreateClassificationRuleRequest,
  type UpdateClassificationRuleRequest,
} from './classificationRulesApi';
import {
  useListAccountSubjectsQuery,
  useCreateAccountSubjectMutation,
  useUpdateAccountSubjectMutation,
  useDeleteAccountSubjectMutation,
  type AccountSubject,
  type CreateAccountSubjectRequest,
  type UpdateAccountSubjectRequest,
} from './accountSubjectsApi';

interface AccountCategory extends AccountSubject {
  code: string;
  description: string;
}

interface ClassificationRule {
  id?: number;
  name: string;
  description?: string;
  condition: string;
  accountCategory: string;
  priority: number;
  isActive: boolean;
}

interface AccountSettingsProps {
  defaultTab?: number;
}

const AccountSettings = ({ defaultTab = 0 }: AccountSettingsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // API calls for classification rules
  const { data: classificationRulesData, isLoading: rulesLoading, refetch: refetchRules } = useGetClassificationRulesQuery({});
  const [createRule, { isLoading: isCreating }] = useCreateClassificationRuleMutation();
  const [updateRule, { isLoading: isUpdating }] = useUpdateClassificationRuleMutation();
  const [deleteRule, { isLoading: isDeleting }] = useDeleteClassificationRuleMutation();
  const [applyRules, { isLoading: isApplying }] = useApplyClassificationRulesMutation();

  // API calls for account subjects
  const { data: accountSubjectsData, isLoading: subjectsLoading, refetch: refetchSubjects } = useListAccountSubjectsQuery({});
  const [createSubject, { isLoading: isCreatingSubject }] = useCreateAccountSubjectMutation();
  const [updateSubject, { isLoading: isUpdatingSubject }] = useUpdateAccountSubjectMutation();
  const [deleteSubject, { isLoading: isDeletingSubject }] = useDeleteAccountSubjectMutation();

  // Transform account subjects to account categories format
  const accountCategories = (accountSubjectsData || []).map(subject => ({
    ...subject,
    code: subject.subject_code,
    name: subject.subject_name,
    description: subject.subject_type,
  }));

  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountCategory | null>(null);
  const [editingRule, setEditingRule] = useState<ClassificationRule | null>(null);

  const handleAddAccount = () => {
    setEditingAccount(null);
    setOpenAccountDialog(true);
  };

  const handleEditAccount = (account: AccountCategory) => {
    setEditingAccount(account);
    setOpenAccountDialog(true);
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      await deleteSubject(id).unwrap();
      setSnackbar({ open: true, message: '勘定科目を削除しました', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '勘定科目の削除に失敗しました', severity: 'error' });
    }
  };

  const handleSaveAccount = async () => {
    try {
    if (editingAccount) {
      setAccountCategories(accountCategories.map(a => 
        a.id === editingAccount.id ? editingAccount : a
      ));
    } else {
      const newAccount: AccountCategory = {
        id: Date.now(),
        code: '',
        name: '',
        description: '',
      };
      // Account categories are now managed by the API
      await createSubject({
        subject_code: newAccount.code,
        subject_name: newAccount.name,
        subject_type: newAccount.description,
      }).unwrap();
      setSnackbar({ open: true, message: '勘定科目を作成しました', severity: 'success' });
    }
    setOpenAccountDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: '勘定科目の保存に失敗しました', severity: 'error' });
    }
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setOpenRuleDialog(true);
  };

  const handleEditRule = (rule: ClassificationRule) => {
    setEditingRule(rule);
    setOpenRuleDialog(true);
  };

  const handleDeleteRule = async (id: number) => {
    try {
      await deleteRule(id).unwrap();
      setSnackbar({ open: true, message: '分類ルールを削除しました', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '分類ルールの削除に失敗しました', severity: 'error' });
    }
  };

  const handleSaveRule = async () => {
    if (!editingRule) return;

    try {
      if (editingRule.id) {
      // Update existing rule via API
      const ruleData: UpdateClassificationRuleRequest = { 
        keyword: parseConditionToKeywords(editingRule.condition)[0] || '',
        target_subject_id: accountCategories.find(a => a.name === editingRule.accountCategory)?.id || 0,
        priority: editingRule.priority,
        status: editingRule.isActive ? 'ACTIVE' : 'INACTIVE',
        match_type: 'PARTIAL',
      };
      await updateRule({ id: editingRule.id, data: ruleData }).unwrap();
      setSnackbar({ open: true, message: '分類ルールを更新しました', severity: 'success' });
    } else {
      // Create new rule via API
      const ruleData: CreateClassificationRuleRequest = {
        keyword: parseConditionToKeywords(editingRule.condition)[0] || '',
        target_subject_id: accountCategories.find(a => a.name === editingRule.accountCategory)?.id || 0,
        priority: editingRule.priority,
        status: editingRule.isActive ? 'ACTIVE' : 'INACTIVE',
        match_type: 'PARTIAL',
      };
      await createRule(ruleData).unwrap();
      setSnackbar({ open: true, message: '分類ルールを作成しました', severity: 'success' });
    }
    setOpenRuleDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: '分類ルールの保存に失敗しました', severity: 'error' });
    }
  };

  const handleApplyRules = async () => {
    try {
      const result = await applyRules({}).unwrap();
      setSnackbar({ 
        open: true, 
        message: `分類ルールを適用しました: ${result.classifiedCount}件分類完了`,
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ open: true, message: '分類ルールの適用に失敗しました', severity: 'error' });
    }
  };

  // Helper function to parse condition string to keywords array
  const parseConditionToKeywords = (condition: string): string[] => {
    // Simple implementation - extract keywords from condition like "キーワード = 値1 OR キーワード = 値2"
    const keywordMatches = condition.match(/[\u30ad\u30e5\u30fc\u30ef\u30fc\u30c9]\s*=\s*([^\s]+)/g);
    if (!keywordMatches) return [];
    return keywordMatches.map(match => match.replace(/[\u30ad\u30e5\u30fc\u30ef\u30fc\u30c9]\s*=\s*/, ''));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        勘定科目・分類ルール設定
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label="勘定科目設定" />
        <Tab label="分類ルール管理" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {/* 勘定科目設定 */}
        {activeTab === 0 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">勘定科目一覧</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddAccount}
                >
                  新規追加
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>コード</TableCell>
                      <TableCell>名称</TableCell>
                      <TableCell>説明</TableCell>
                      <TableCell>業種</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : accountCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          勘定科目がありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      accountCategories.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.code}</TableCell>
                          <TableCell>{account.name}</TableCell>
                          <TableCell>{account.description}</TableCell>
                          <TableCell>{account.industry_type || '-'}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleEditAccount(account)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteAccount(account.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* 分類ルール管理 */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">分類ルール一覧</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    onClick={handleApplyRules}
                    disabled={isApplying}
                    sx={{ mr: 1 }}
                  >
                    {isApplying ? '適用中...' : 'ルールを適用'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddRule}
                  >
                    新規追加
                  </Button>
                </Box>
              </Box>
              {rulesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>キーワード</TableCell>
                        <TableCell>業種</TableCell>
                        <TableCell>勘定科目</TableCell>
                        <TableCell>優先度</TableCell>
                        <TableCell>状態</TableCell>
                        <TableCell>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(classificationRulesData?.items || []).map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.keyword}</TableCell>
                          <TableCell>{rule.industry_type || '-'}</TableCell>
                          <TableCell>{accountCategories.find(a => a.id === rule.target_subject_id)?.name || '-'}</TableCell>
                          <TableCell>{rule.priority}</TableCell>
                          <TableCell>
                            <Chip
                              label={rule.status === 'ACTIVE' ? '有効' : '無効'}
                              color={rule.status === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleEditRule({
                              id: rule.id,
                              name: rule.keyword,
                              description: rule.industry_type || '',
                              condition: `キーワード = ${rule.keyword}`,
                              accountCategory: accountCategories.find(a => a.id === rule.target_subject_id)?.name || '',
                              priority: rule.priority,
                              isActive: rule.status === 'ACTIVE',
                            })}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteRule(rule.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* 勘定科目編集ダイアログ */}
      <Dialog open={openAccountDialog} onClose={() => setOpenAccountDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAccount ? '勘定科目編集' : '新規勘定科目追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="コード"
                value={editingAccount?.code || ''}
                onChange={(e) => setEditingAccount({
                  ...editingAccount!,
                  code: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="業種"
                value={editingAccount?.industry_type || ''}
                onChange={(e) => setEditingAccount({
                  ...editingAccount!,
                  industry_type: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="名称"
                value={editingAccount?.name || ''}
                onChange={(e) => setEditingAccount({
                  ...editingAccount!,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="説明"
                multiline
                rows={3}
                value={editingAccount?.description || ''}
                onChange={(e) => setEditingAccount({
                  ...editingAccount!,
                  description: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAccountDialog(false)}>キャンセル</Button>
          <Button onClick={handleSaveAccount} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 分類ルール編集ダイアログ */}
      <Dialog open={openRuleDialog} onClose={() => setOpenRuleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? '分類ルール編集' : '新規分類ルール追加'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="キーワード"
                value={editingRule?.name || ''}
                onChange={(e) => setEditingRule({
                  ...editingRule!,
                  name: e.target.value
                })}
                helperText="分類に使用するキーワードを入力してください"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="業種"
                value={editingRule?.description || ''}
                onChange={(e) => setEditingRule({
                  ...editingRule!,
                  description: e.target.value
                })}
                helperText="業種を指定する場合に入力してください（オプション）"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="条件"
                multiline
                rows={3}
                value={editingRule?.condition || ''}
                onChange={(e) => setEditingRule({
                  ...editingRule!,
                  condition: e.target.value
                })}
                helperText="例: 業種 = 飲食業 AND キーワード = 食材"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="勘定科目"
                value={editingRule?.accountCategory || ''}
                onChange={(e) => setEditingRule({
                  ...editingRule!,
                  accountCategory: e.target.value
                })}
              >
                {accountCategories.map((account) => (
                  <option key={account.id} value={account.name}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="優先度"
                value={editingRule?.priority || 0}
                onChange={(e) => setEditingRule({
                  ...editingRule!,
                  priority: parseInt(e.target.value)
                })}
                helperText="数字が小さいほど優先度が高い"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRuleDialog(false)}>キャンセル</Button>
          <Button onClick={handleSaveRule} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountSettings;
