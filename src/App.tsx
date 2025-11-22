import { useState, useCallback } from "react";
import { useCollaborativeSession } from "./hooks/useCollaborativeSession";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { AppLayout } from "./components/Layout/AppLayout";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { UserList } from "./components/Sidebar/UserList/UserList";
import { ActivityFeed } from "./components/Sidebar/ActivityFeed/ActivityFeed";
import { ThemeToggle } from "./components/Sidebar/ThemeToggle";
import { Main } from "./components/Main/Main";
import { MobileMenuButton } from "./components/Main/MobileMenuButton";
import { ChatWindow } from "./components/Main/Chat/ChatWindow";
import { CounterPanel } from "./components/Main/Counter/CounterPanel";

function App() {
  const session = useCollaborativeSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleThemeToggle = useCallback(() => {
    session.setTheme(session.theme === "light" ? "dark" : "light");
  }, [session.theme, session.setTheme]);

  const handleIncrement = useCallback(async () => {
    await session.updateCounter(1);
  }, [session.updateCounter]);

  const handleDecrement = useCallback(async () => {
    await session.updateCounter(-1);
  }, [session.updateCounter]);

  return (
    <DashboardLayout>
      <MobileMenuButton
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      <AppLayout
        sidebar={
          <Sidebar>
            <UserList
              users={session.users}
              currentUserId={session.user.id}
              focusedUsers={session.focusedUsers}
            />
            <ActivityFeed
              broadcastMessages={session.broadcastMessages}
              localMessages={session.localMessages}
              users={session.users}
              currentUser={session.user}
            />
            <ThemeToggle theme={session.theme} onToggle={handleThemeToggle} />
          </Sidebar>
        }
        main={
          <Main>
            <CounterPanel
              counter={session.counter}
              users={session.users}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              isLoading={false}
            />
            <ChatWindow
              messages={session.messages}
              users={session.users}
              currentUserId={session.user.id}
              typingUsers={session.typingUsers}
              focusedUsers={session.focusedUsers}
              onSendMessage={session.sendMessage}
              onDeleteMessage={session.deleteMessage}
              onTyping={session.markTyping}
              onClearTyping={session.clearTyping}
              onFocus={session.markFocused}
              onBlur={session.markUnfocused}
              isLoading={false}
              getUserName={session.getUserName}
            />
          </Main>
        }
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
    </DashboardLayout>
  );
}

export default App;
