import ReduxProvider from "@/app/(main)/ReduxProvider";
import "./globalsLayout.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardHeader from "@/components/DashboardHeader";
import { Toaster } from "@/components/ui/sonner";
import NotificationProvider from "@/components/NotificationProvider";
import UserLoader from "@/app/(main)/UserLoader";

export default function DashbordLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <UserLoader />
          <NotificationProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <DashboardHeader />
              {children}
              <Toaster />
            </ThemeProvider>
          </NotificationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
