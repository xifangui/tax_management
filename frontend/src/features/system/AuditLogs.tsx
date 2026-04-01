import { useState } from 'react';
import {
  Box,
  Typography,
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
  Paper,
  Chip,
  Pagination,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useGetAuditLogsQuery,
  type AuditLog,
} from './systemApi';

const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [operatorId, setOperatorId] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const { data: logsData, isLoading, refetch } = useGetAuditLogsQuery({
    page,
    limit,
    operatorId: operatorId ? parseInt(operatorId) : undefined,
    module: module || undefined,
    action: action || undefined,
    dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined,
    dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined,
  });

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleReset = () => {
    setOperatorId('');
    setModule('');
    setAction('');
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading && !logsData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        監査ログ
      </Typography>

      {/* フィルターパネル */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            検索条件
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField
              label="オペレーターID"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              size="small"
            />
            <TextField
              label="モジュール"
              value={module}
              onChange={(e) => setModule(e.target.value)}
              size="small"
            />
            <TextField
              label="アクション"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              size="small"
            />
            <ReactDatePicker
              selected={dateFrom}
              onChange={(date) => setDateFrom(date)}
              dateFormat="yyyy/MM/dd"
              locale={ja}
              placeholderText="開始日"
              className="form-control"
            />
            <ReactDatePicker
              selected={dateTo}
              onChange={(date) => setDateTo(date)}
              dateFormat="yyyy/MM/dd"
              locale={ja}
              placeholderText="終了日"
              className="form-control"
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              size="small"
            >
              検索
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              size="small"
            >
              リセット
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ログ一覧 */}
      <Card>
        <CardContent>
          {logsData?.items.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              監査ログがありません
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>日時</TableCell>
                    <TableCell>オペレーター</TableCell>
                    <TableCell>モジュール</TableCell>
                    <TableCell>アクション</TableCell>
                    <TableCell>対象</TableCell>
                    <TableCell>詳細</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsData?.items.map((log) => {
                    const createdAt = log.createdAt ? new Date(log.createdAt) : null;
                    const formattedDate = createdAt && !isNaN(createdAt.getTime())
                      ? format(createdAt, 'yyyy/MM/dd HH:mm:ss')
                      : '-';

                    return (
                      <TableRow key={log.id}>
                        <TableCell>{log.id}</TableCell>
                        <TableCell>{formattedDate}</TableCell>
                      <TableCell>{log.operatorName}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          color={getActionColor(log.action)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {log.targetName || log.targetId || '-'}
                      </TableCell>
                      <TableCell>
                        {log.detail ? (
                          <Box
                            component="pre"
                            sx={{
                              fontSize: '12px',
                              maxHeight: '100px',
                              overflow: 'auto',
                              m: 0,
                            }}
                          >
                            {JSON.stringify(log.detail, null, 2)}
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* ページネーション */}
      {logsData && logsData.pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={logsData.pagination.totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* 更新ボタン */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isLoading}
        >
          更新
        </Button>
      </Box>
    </Box>
  );
};

export default AuditLogs;
