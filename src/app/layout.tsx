import { ReactNode } from 'react';
import '@/styles/globals.css';
import 'antd/dist/reset.css';
import 'animate.css/animate.min.css';
import ReduxProvider from '@/config/ReduxProvider';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <ReduxProvider>
     
      {children}
    </ReduxProvider>
  );
}
