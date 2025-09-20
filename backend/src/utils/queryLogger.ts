// SQL Injection detection patterns
const SQL_INJECTION_PATTERNS = [
  /[';|&%+=<>!@#$^()[\]{}~`\\]/gi,
  /union\s+select/gi,
  /select\s+.*\s+from/gi,
  /insert\s+into/gi,
  /update\s+.*\s+set/gi,
  /delete\s+from/gi,
  /drop\s+table/gi,
  /create\s+table/gi,
  /alter\s+table/gi,
  /exec\s*\(/gi,
  /execute\s*\(/gi,
  /sp_/gi,
  /xp_/gi,
  /0x[0-9a-f]+/gi,
  /char\s*\(/gi,
  /ascii\s*\(/gi,
  /substring\s*\(/gi,
  /len\s*\(/gi,
  /count\s*\(/gi,
  /sum\s*\(/gi,
  /avg\s*\(/gi,
  /max\s*\(/gi,
  /min\s*\(/gi,
  /group\s+by/gi,
  /order\s+by/gi,
  /having\s+/gi,
  /or\s+1\s*=\s*1/gi,
  /and\s+1\s*=\s*1/gi,
  /or\s+true/gi,
  /and\s+true/gi,
  /waitfor\s+delay/gi,
  /benchmark\s*\(/gi,
  /sleep\s*\(/gi,
  /pg_sleep\s*\(/gi,
  /load_file\s*\(/gi,
  /into\s+outfile/gi,
  /into\s+dumpfile/gi,
  /information_schema/gi,
  /sysobjects/gi,
  /syscolumns/gi,
  /sysdatabases/gi,
  /sysusers/gi,
  /master\.dbo/gi,
  /mysql\.user/gi,
  /pg_user/gi,
  /pg_database/gi,
  /pg_tables/gi,
  /pg_columns/gi,
  /pg_views/gi
];

export class QueryLogger {
  private static instance: QueryLogger;
  private queryLog: Array<{
    timestamp: Date;
    query: string;
    params: any;
    duration: number;
    suspicious: boolean;
    ip?: string;
    userAgent?: string;
  }> = [];

  static getInstance(): QueryLogger {
    if (!QueryLogger.instance) {
      QueryLogger.instance = new QueryLogger();
    }
    return QueryLogger.instance;
  }

  // Log database query
  logQuery(query: string, params: any, duration: number, ip?: string, userAgent?: string): void {
    const suspicious = this.detectSQLInjection(query, params);
    
    this.queryLog.push({
      timestamp: new Date(),
      query,
      params,
      duration,
      suspicious,
      ip,
      userAgent
    });

    // Keep only last 1000 queries
    if (this.queryLog.length > 1000) {
      this.queryLog = this.queryLog.slice(-1000);
    }

    // Alert if suspicious query detected
    if (suspicious) {
      console.warn('🚨 SUSPICIOUS SQL QUERY DETECTED:', {
        query,
        params,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Detect SQL injection patterns
  private detectSQLInjection(query: string, params: any): boolean {
    const queryString = query.toLowerCase();
    const paramsString = JSON.stringify(params).toLowerCase();

    // Check query string
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(queryString)) {
        return true;
      }
    }

    // Check parameters
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(paramsString)) {
        return true;
      }
    }

    return false;
  }

  // Get suspicious queries
  getSuspiciousQueries(): Array<{
    timestamp: Date;
    query: string;
    params: any;
    duration: number;
    ip?: string;
    userAgent?: string;
  }> {
    return this.queryLog.filter(log => log.suspicious);
  }

  // Get all queries
  getAllQueries(): Array<{
    timestamp: Date;
    query: string;
    params: any;
    duration: number;
    suspicious: boolean;
    ip?: string;
    userAgent?: string;
  }> {
    return [...this.queryLog];
  }

  // Clear query log
  clearLog(): void {
    this.queryLog = [];
  }

  // Get query statistics
  getStatistics(): {
    totalQueries: number;
    suspiciousQueries: number;
    averageDuration: number;
    suspiciousPercentage: number;
  } {
    const total = this.queryLog.length;
    const suspicious = this.queryLog.filter(log => log.suspicious).length;
    const averageDuration = this.queryLog.reduce((sum, log) => sum + log.duration, 0) / total || 0;

    return {
      totalQueries: total,
      suspiciousQueries: suspicious,
      averageDuration,
      suspiciousPercentage: total > 0 ? (suspicious / total) * 100 : 0
    };
  }
}