"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Check, X, Search, Users } from "lucide-react";
import { getRank, getLevel } from "@/lib/xp";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  imageUrl: string | null;
  xp: number;
}

interface Props {
  friends: User[];
  pendingReceived: User[];
  pendingSent: User[];
  pendingRequestIds: string[];
}

export default function FriendsClient({ friends, pendingReceived, pendingSent, pendingRequestIds }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data.users ?? []);
    setSearching(false);
  }

  async function sendRequest(userId: string) {
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: userId }),
    });
    if (res.ok) {
      toast.success("Friend request sent! 👊");
      router.refresh();
    } else {
      toast.error("Failed to send request");
    }
  }

  async function respondToRequest(requesterId: string, accept: boolean) {
    const res = await fetch("/api/friends/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requesterId, accept }),
    });
    if (res.ok) {
      toast.success(accept ? "Friend added! 💪" : "Request declined");
      router.refresh();
    } else {
      toast.error("Failed to respond to request");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black">Bros</h1>

      <div className="flex gap-2">
        <Input
          placeholder="Search by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={searching} size="icon" variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Results</p>
          {searchResults.map((user) => (
            <UserRow key={user.id} user={user} action={
              <Button size="sm" onClick={() => sendRequest(user.id)} className="gap-1">
                <UserPlus className="w-3 h-3" /> Add
              </Button>
            } />
          ))}
        </div>
      )}

      <Tabs defaultValue="friends">
        <TabsList className="w-full">
          <TabsTrigger value="friends" className="flex-1">
            Friends {friends.length > 0 && (
              <Badge className="ml-1 bg-primary/20 text-primary text-xs h-4">{friends.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            Pending {pendingReceived.length > 0 && (
              <Badge className="ml-1 bg-orange-500/20 text-orange-400 text-xs h-4">{pendingReceived.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-2 mt-4">
          {friends.length === 0 ? (
            <Card className="border-dashed border-border/50">
              <CardContent className="py-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No bros yet. Search for friends above!</p>
              </CardContent>
            </Card>
          ) : (
            friends.map((friend) => <UserRow key={friend.id} user={friend} />)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-2 mt-4">
          {pendingReceived.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">No pending requests</p>
          ) : (
            pendingReceived.map((user) => (
              <UserRow key={user.id} user={user} action={
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respondToRequest(user.id, true)} className="gap-1">
                    <Check className="w-3 h-3" /> Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => respondToRequest(user.id, false)} className="text-muted-foreground">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              } />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserRow({
  user,
  action,
}: {
  user: { username: string; imageUrl: string | null; xp: number };
  action?: React.ReactNode;
}) {
  const rank = getRank(user.xp);
  const level = getLevel(user.xp);
  return (
    <Card className="border-border/50">
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user.imageUrl ?? ""} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{user.username}</p>
            <p className="text-xs text-muted-foreground">{rank.icon} {rank.name} · Lv.{level}</p>
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}