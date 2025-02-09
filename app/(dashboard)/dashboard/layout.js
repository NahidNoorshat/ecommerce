import ReduxProvider from "@/app/(main)/ReduxProvider";
import "./globalsLayout.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardHeader from "@/components/DashboardHeader";

export default function DashbordLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DashboardHeader />
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
