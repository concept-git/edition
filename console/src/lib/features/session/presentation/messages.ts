import type { LoginFailure, SessionFailure } from '../domain/auth';

export function loginFailureMessage(failure: LoginFailure): string {
  switch (failure.kind) {
    case 'invalid_credentials':
      return '邮箱或密码不正确。';
    case 'forbidden':
      return '请求被拒绝。';
    case 'rate_limited':
      return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
    case 'server':
      return failure.traceId === null ? '登录没有完成。' : `登录没有完成。追踪号 ${failure.traceId}。`;
    case 'network':
      return '网络失败，登录没有完成。';
  }
}

export function refreshFailureMessage(failure: SessionFailure): string {
  switch (failure.kind) {
    case 'invalid_refresh':
      return '';
    case 'forbidden':
      return '请求被拒绝。页面和已填写的内容仍保留。';
    case 'rate_limited':
      return failure.retryAfter === null
        ? '尝试过于频繁，请稍后再试。页面和已填写的内容仍保留。'
        : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。页面和已填写的内容仍保留。`;
    case 'server':
      return failure.traceId === null
        ? '服务没有完成。页面和已填写的内容仍保留。'
        : `服务没有完成。追踪号 ${failure.traceId}。页面和已填写的内容仍保留。`;
    case 'network':
      return '网络失败。页面和已填写的内容仍保留。';
  }
}
