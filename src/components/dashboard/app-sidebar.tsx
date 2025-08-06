'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SUBJECTS } from '@/lib/constants';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useContext } from 'react';
import { UserContext } from '@/context/user-provider';
import { Book, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { auth } from '@/lib/firebase';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { username } = useContext(UserContext);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('studyverse-username');
      localStorage.removeItem('studyverse-password-validated');
      router.replace('/');
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
                <Book className="h-6 w-6"/>
            </Button>
            <h1 className="font-headline text-xl font-semibold">StudyVerse</h1>
            <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {SUBJECTS.map((subject) => (
          <SidebarMenuItem key={subject.id}>
            <SidebarMenuButton
              onClick={() => router.push(`/dashboard/${subject.id}`)}
              isActive={pathname === `/dashboard/${subject.id}`}
              className="font-medium"
              tooltip={subject.name}
            >
              <subject.icon className="h-5 w-5" />
              <span>{subject.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex w-full justify-start gap-2 p-2 h-auto">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}`} />
                        <AvatarFallback>{username?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="font-semibold">{username}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
