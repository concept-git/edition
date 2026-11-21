import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen } from 'lucide-react';
import { useServices } from '@/shared/api/context';
import { Button } from '@/shared/ui/button';
import { TextField, Command } from '@/shared/ui/operation-form';
import { Failure } from '@/shared/ui/feedback';

const loginSchema = z.object({
  email: z.email('请填写有效邮箱'),
  password: z.string().min(1, '请填写密码'),
});
export function AuthPage({ signedIn }: { signedIn: () => Promise<void> }) {
  const { api, session } = useServices();
  const [error, setError] = useState<unknown>();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold">
          <BookOpen className="size-6 text-primary" />
          Edition
        </div>
        <section className="rounded-xl border bg-card p-7 shadow-sm">
          <h1 className="text-xl font-semibold">登录控制台</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            维护内容，管理发版与站点交付。
          </p>
          <FormProvider {...form}>
            <form
              className="mt-6 grid gap-5"
              onSubmit={form.handleSubmit(async (values) => {
                setError(undefined);
                try {
                  const { data } = await api.login({ body: values });
                  if (!data.accessToken)
                    throw new Error('Missing access token');
                  session.accept(data.accessToken);
                  await signedIn();
                } catch (failure) {
                  setError(failure);
                }
              })}
            >
              <TextField name="email" label="邮箱" type="email" />
              <TextField name="password" label="密码" type="password" />
              {error !== undefined && <Failure error={error} />}
              <Button disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? '正在登录…' : '登录'}
              </Button>
            </form>
          </FormProvider>
          <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
            <Command
              label="注册账户"
              submit={(v) =>
                api.register({
                  body: { email: v.email, name: v.name, password: v.password },
                })
              }
            >
              <TextField name="email" label="邮箱" type="email" />
              <TextField name="name" label="姓名" />
              <TextField name="password" label="密码" type="password" />
            </Command>
            <Command
              label="忘记密码"
              description="填写账户邮箱，按邮件中的流程重置密码。"
              submit={(v) => api.forgotPassword({ body: { email: v.email } })}
            >
              <TextField name="email" label="邮箱" type="email" />
            </Command>
            <Command
              label="重置密码"
              submit={(v) =>
                api.resetPassword({
                  body: { token: v.token, newPassword: v.newPassword },
                })
              }
            >
              <TextField name="token" label="重置令牌" />
              <TextField name="newPassword" label="新密码" type="password" />
            </Command>
            <Command
              label="验证邮箱"
              defaults={{
                user: new URLSearchParams(location.search).get('user') ?? '',
                token: new URLSearchParams(location.search).get('token') ?? '',
              }}
              submit={(v) =>
                api.verifyEmail({ body: { user: v.user, token: v.token } })
              }
            >
              <TextField name="user" label="用户 ID" />
              <TextField name="token" label="验证令牌" />
            </Command>
            <Command
              label="重发验证邮件"
              submit={(v) =>
                api.resendVerification({ body: { email: v.email } })
              }
            >
              <TextField name="email" label="邮箱" type="email" />
            </Command>
          </div>
        </section>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Edition · 内容与知识交付平台
        </p>
      </div>
    </div>
  );
}
