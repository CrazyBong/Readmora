import { AnimatedAuthPage } from '@/components/ui/animated-characters-login-page';

export const metadata = {
  title: 'Log In | Readmora',
  description: 'Welcome back to your aesthetic reading companion.',
};

export default function LoginPage() {
  return <AnimatedAuthPage isSignUp={false} />;
}
