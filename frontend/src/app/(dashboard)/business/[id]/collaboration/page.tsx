"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { UserPlus, MessageSquare, Eye, Edit3, Shield, Send } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  lastActive?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  target: string;
  timestamp: string;
}

export default function CollaborationPage() {
  const params = useParams();
  const businessId = params.id as string;
  const user = useAuthStore((s) => s.user);
  const { addToast } = useUIStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");

  useEffect(() => {
    if (user) {
      setMembers([
        {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: "owner",
          lastActive: "Just now",
        },
      ]);
    }
  }, [user]);

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newMember: TeamMember = {
      id: Math.random().toString(36).slice(2),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      lastActive: "Pending invite",
    };
    setMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    addToast(`Invitation sent to ${newMember.email}`, "success");
  };

  const handleComment = () => {
    if (!newComment.trim() || !user) return;
    const comment: Comment = {
      id: Math.random().toString(36).slice(2),
      author: user.full_name,
      content: newComment.trim(),
      target: "General",
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  const roleIcons: Record<string, React.ReactNode> = {
    owner: <Shield className="h-3.5 w-3.5" />,
    admin: <Shield className="h-3.5 w-3.5" />,
    editor: <Edit3 className="h-3.5 w-3.5" />,
    viewer: <Eye className="h-3.5 w-3.5" />,
  };

  const roleColors: Record<string, string> = {
    owner: "bg-primary/10 text-primary",
    admin: "bg-primary/10 text-primary",
    editor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    viewer: "bg-muted text-muted-foreground",
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Team Collaboration</h2>
          <p className="text-muted-foreground">Manage your team and collaborate on marketing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Team Members ({members.length})</h3>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {member.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${roleColors[member.role]}`}>
                        {roleIcons[member.role]}
                        {member.role}
                      </span>
                      <span className="text-xs text-muted-foreground hidden md:block">{member.lastActive}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Activity Feed</h3>
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No activity yet. Start collaborating!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Invite Team Member</h3>
              <div className="space-y-3">
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="colleague@company.com"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="editor">Editor - Can create & edit</option>
                  <option value="viewer">Viewer - Can only view</option>
                </select>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Send Invite
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Add Comment</h3>
              <div className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
                  placeholder="Leave a note for your team..."
                />
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Roles & Permissions</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-primary" />
                  <span><strong>Owner</strong> - Full access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-primary" />
                  <span><strong>Admin</strong> - Manage team & content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit3 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span><strong>Editor</strong> - Create & edit content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  <span><strong>Viewer</strong> - Read-only access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
